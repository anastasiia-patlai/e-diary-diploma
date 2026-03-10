import React, { useState, useEffect } from 'react';
import {
    FaCalendarAlt,
    FaUsers,
    FaCheckCircle,
    FaTimesCircle,
    FaMinusCircle,
    FaClock,
    FaSave,
    FaEdit,
    FaHistory,
    FaArrowLeft,
    FaArrowRight,
    FaExclamationTriangle
} from 'react-icons/fa';
import AttendanceHistory from './AttendanceHistory';

const AttendanceTab = ({ databaseName, isMobile }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Дані для відвідуваності
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [existingAttendance, setExistingAttendance] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [groups, setGroups] = useState([]);

    // Статистика відвідуваності
    const [stats, setStats] = useState({
        present: 0,
        absent: 0,
        late: 0,
        total: 0
    });

    // Стани для фільтрації
    const [dateNavigation, setDateNavigation] = useState({
        weekOffset: 0,
        currentWeekDays: []
    });

    useEffect(() => {
        if (databaseName) {
            fetchInitialData();
        }
    }, [databaseName]);

    useEffect(() => {
        if (selectedSchedule && selectedDate) {
            fetchAttendanceForDate();
            fetchStudentsForSchedule();
        }
    }, [selectedSchedule, selectedDate]);

    useEffect(() => {
        updateStats();
    }, [attendance, students]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Отримуємо семестри
            await fetchSemesters();
            // Отримуємо групи
            await fetchGroups();
            // Отримуємо розклад вчителя
            await fetchTeacherSchedule();
        } catch (err) {
            setError('Помилка завантаження даних: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSemesters = async () => {
        try {
            const response = await fetch(`/api/study-calendar/semesters?databaseName=${databaseName}`);
            if (response.ok) {
                const data = await response.json();
                setSemesters(data);
                // Знаходимо активний семестр
                const activeSemester = data.find(s => s.isActive);
                if (activeSemester) {
                    setSelectedSemester(activeSemester._id);
                } else if (data.length > 0) {
                    setSelectedSemester(data[0]._id);
                }
            }
        } catch (err) {
            console.error('Помилка отримання семестрів:', err);
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await fetch(`/api/groups?databaseName=${databaseName}`);
            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            }
        } catch (err) {
            console.error('Помилка отримання груп:', err);
        }
    };

    const fetchTeacherSchedule = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const teacherId = userInfo.userId;

            if (!teacherId) return;

            let url = `/api/schedule/teacher/${teacherId}?databaseName=${databaseName}`;
            if (selectedSemester) {
                url += `&semester=${selectedSemester}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                // Групуємо розклад за групами
                const groupedByGroup = data.reduce((acc, item) => {
                    const groupId = item.group?._id;
                    const groupName = item.group?.name || 'Без групи';

                    if (!acc[groupId]) {
                        acc[groupId] = {
                            groupId,
                            groupName,
                            groupInfo: item.group,
                            schedules: []
                        };
                    }
                    acc[groupId].schedules.push(item);
                    return acc;
                }, {});

                setSchedules(Object.values(groupedByGroup));

                // Якщо є вибрана група, фільтруємо розклад
                if (selectedGroupId) {
                    const filtered = Object.values(groupedByGroup).filter(
                        g => g.groupId === selectedGroupId
                    );
                    if (filtered.length > 0 && filtered[0].schedules.length > 0) {
                        setSelectedSchedule(filtered[0].schedules[0]);
                    }
                } else if (Object.values(groupedByGroup).length > 0) {
                    const firstGroup = Object.values(groupedByGroup)[0];
                    if (firstGroup.schedules.length > 0) {
                        setSelectedSchedule(firstGroup.schedules[0]);
                    }
                }
            }
        } catch (err) {
            console.error('Помилка отримання розкладу:', err);
        }
    };

    const fetchStudentsForSchedule = async () => {
        if (!selectedSchedule?.group?._id) return;

        try {
            const response = await fetch(`/api/groups/${selectedSchedule.group._id}?databaseName=${databaseName}`);
            if (response.ok) {
                const groupData = await response.json();

                // Визначаємо, яких студентів показувати (вся група чи підгрупа)
                let studentsList = [];
                if (selectedSchedule.subgroup && selectedSchedule.subgroup !== 'all') {
                    // Шукаємо студентів у конкретній підгрупі
                    const subgroup = groupData.subgroups?.find(
                        sg => sg.order === parseInt(selectedSchedule.subgroup)
                    );
                    studentsList = subgroup?.students || [];
                } else {
                    studentsList = groupData.students || [];
                }

                setStudents(studentsList);

                // Ініціалізуємо attendance для всіх студентів, якщо ще не завантажено
                if (Object.keys(attendance).length === 0) {
                    const initialAttendance = {};
                    studentsList.forEach(student => {
                        initialAttendance[student._id] = {
                            status: 'present',
                            reason: '',
                            time: null
                        };
                    });
                    setAttendance(initialAttendance);
                }
            }
        } catch (err) {
            console.error('Помилка отримання студентів:', err);
        }
    };

    const fetchAttendanceForDate = async () => {
        if (!selectedSchedule?._id || !selectedDate) return;

        try {
            const response = await fetch(
                `/api/attendance/schedule/${selectedSchedule._id}?date=${selectedDate}&databaseName=${databaseName}`
            );

            if (response.ok) {
                const data = await response.json();
                setExistingAttendance(data);

                if (data && data.records && data.records.length > 0) {
                    // Перетворюємо записи в об'єкт attendance
                    const attendanceMap = {};
                    data.records.forEach(record => {
                        attendanceMap[record.student._id || record.student] = {
                            status: record.status,
                            reason: record.reason || '',
                            time: record.time || null,
                            _id: record._id
                        };
                    });
                    setAttendance(attendanceMap);
                    setIsEditing(false);
                } else {
                    // Скидаємо до початкового стану
                    const initialAttendance = {};
                    students.forEach(student => {
                        initialAttendance[student._id] = {
                            status: 'present',
                            reason: '',
                            time: null
                        };
                    });
                    setAttendance(initialAttendance);
                    setIsEditing(true);
                }
            }
        } catch (err) {
            console.error('Помилка отримання відвідуваності:', err);
        }
    };

    const updateStats = () => {
        const studentIds = students.map(s => s._id);
        const present = studentIds.filter(id => attendance[id]?.status === 'present').length;
        const absent = studentIds.filter(id => attendance[id]?.status === 'absent').length;
        const late = studentIds.filter(id => attendance[id]?.status === 'late').length;

        setStats({
            present,
            absent,
            late,
            total: studentIds.length
        });
    };

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status
            }
        }));
    };

    const handleReasonChange = (studentId, reason) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                reason
            }
        }));
    };

    const handleTimeChange = (studentId, time) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                time
            }
        }));
    };

    const handleSaveAttendance = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Підготовка даних для збереження
            const attendanceRecords = Object.entries(attendance).map(([studentId, data]) => ({
                student: studentId,
                status: data.status,
                reason: data.reason || '',
                time: data.status === 'late' ? data.time : null
            }));

            const payload = {
                databaseName,
                scheduleId: selectedSchedule._id,
                date: selectedDate,
                records: attendanceRecords
            };

            let response;
            if (existingAttendance && existingAttendance._id) {
                // Оновлення існуючого запису
                response = await fetch(`/api/attendance/${existingAttendance._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // Створення нового запису
                response = await fetch('/api/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                setSuccess('Відвідуваність успішно збережено');
                setIsEditing(false);
                // Оновлюємо дані
                fetchAttendanceForDate();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Помилка при збереженні');
            }
        } catch (err) {
            setError('Помилка при збереженні: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        setSelectedDate(newDate.toISOString().split('T')[0]);
    };

    const handleGroupChange = (groupId) => {
        setSelectedGroupId(groupId);
        const groupSchedules = schedules.find(s => s.groupId === groupId);
        if (groupSchedules && groupSchedules.schedules.length > 0) {
            setSelectedSchedule(groupSchedules.schedules[0]);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <FaCheckCircle style={{ color: '#10b981' }} />;
            case 'absent':
                return <FaTimesCircle style={{ color: '#ef4444' }} />;
            case 'late':
                return <FaClock style={{ color: '#f59e0b' }} />;
            default:
                return null;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'present': return 'Присутній';
            case 'absent': return 'Відсутній';
            case 'late': return 'Запізнився';
            default: return '';
        }
    };

    if (loading && schedules.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>Завантаження...</div>
            </div>
        );
    }

    if (showHistory) {
        return (
            <AttendanceHistory
                databaseName={databaseName}
                isMobile={isMobile}
                onBack={() => setShowHistory(false)}
            />
        );
    }

    return (
        <div>
            {/* Заголовок та кнопки */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <h3 style={{ fontSize: isMobile ? '18px' : '24px', margin: 0 }}>
                    <FaUsers style={{ marginRight: '10px' }} />
                    Відвідуваність
                </h3>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setShowHistory(true)}
                        style={{
                            backgroundColor: '#6b7280',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaHistory />
                        {!isMobile && 'Історія'}
                    </button>

                    {!isEditing && existingAttendance && (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FaEdit />
                            {!isMobile && 'Редагувати'}
                        </button>
                    )}
                </div>
            </div>

            {/* Повідомлення про помилки/успіх */}
            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <FaExclamationTriangle />
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '20px'
                }}>
                    {success}
                </div>
            )}

            {/* Фільтри */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                gap: '15px',
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Семестр:
                    </label>
                    <select
                        value={selectedSemester}
                        onChange={(e) => {
                            setSelectedSemester(e.target.value);
                            fetchTeacherSchedule();
                        }}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                        }}
                    >
                        <option value="">Виберіть семестр</option>
                        {semesters.map(sem => (
                            <option key={sem._id} value={sem._id}>
                                {sem.name} {sem.year}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Група:
                    </label>
                    <select
                        value={selectedGroupId}
                        onChange={(e) => handleGroupChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                        }}
                    >
                        <option value="">Виберіть групу</option>
                        {schedules.map(group => (
                            <option key={group.groupId} value={group.groupId}>
                                {group.groupName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Предмет:
                    </label>
                    <select
                        value={selectedSchedule?._id || ''}
                        onChange={(e) => {
                            const group = schedules.find(g => g.groupId === selectedGroupId);
                            const schedule = group?.schedules.find(s => s._id === e.target.value);
                            setSelectedSchedule(schedule);
                        }}
                        disabled={!selectedGroupId}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            backgroundColor: !selectedGroupId ? '#f3f4f6' : 'white'
                        }}
                    >
                        <option value="">Виберіть предмет</option>
                        {schedules
                            .find(g => g.groupId === selectedGroupId)
                            ?.schedules.map(schedule => (
                                <option key={schedule._id} value={schedule._id}>
                                    {schedule.subject} ({schedule.dayOfWeek?.name}, {schedule.timeSlot?.startTime})
                                </option>
                            ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Дата:
                    </label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                            onClick={() => handleDateChange('prev')}
                            style={{
                                padding: '8px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                background: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <FaArrowLeft />
                        </button>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                            }}
                        />
                        <button
                            onClick={() => handleDateChange('next')}
                            style={{
                                padding: '8px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                background: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <FaArrowRight />
                        </button>
                    </div>
                </div>
            </div>

            {/* Інформація про урок */}
            {selectedSchedule && (
                <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#e0f2fe',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div>
                        <strong>{selectedSchedule.subject}</strong>
                        <div style={{ fontSize: '14px', color: '#0369a1' }}>
                            {selectedSchedule.dayOfWeek?.name}, {selectedSchedule.timeSlot?.startTime} - {selectedSchedule.timeSlot?.endTime}
                            {selectedSchedule.subgroup && selectedSchedule.subgroup !== 'all' && (
                                <> (Підгрупа {selectedSchedule.subgroup})</>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaCheckCircle style={{ color: '#10b981' }} /> {stats.present}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaClock style={{ color: '#f59e0b' }} /> {stats.late}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaTimesCircle style={{ color: '#ef4444' }} /> {stats.absent}
                        </span>
                    </div>
                </div>
            )}

            {/* Таблиця відвідуваності */}
            {students.length > 0 ? (
                <div style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead style={{
                            backgroundColor: '#f9fafb',
                            borderBottom: '2px solid #e5e7eb'
                        }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Учень</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Статус</th>
                                {isEditing && <th style={{ padding: '12px', textAlign: 'left' }}>Причина/Час</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student._id} style={{
                                    borderBottom: '1px solid #e5e7eb',
                                    backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                                }}>
                                    <td style={{ padding: '12px' }}>{index + 1}</td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: '500' }}>{student.fullName}</div>
                                        {student.email && (
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                {student.email}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {isEditing ? (
                                            <select
                                                value={attendance[student._id]?.status || 'present'}
                                                onChange={(e) => handleStatusChange(student._id, e.target.value)}
                                                style={{
                                                    padding: '6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #e5e7eb'
                                                }}
                                            >
                                                <option value="present">Присутній</option>
                                                <option value="absent">Відсутній</option>
                                                <option value="late">Запізнився</option>
                                            </select>
                                        ) : (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px'
                                            }}>
                                                {getStatusIcon(attendance[student._id]?.status)}
                                                <span>{getStatusText(attendance[student._id]?.status)}</span>
                                            </div>
                                        )}
                                    </td>
                                    {isEditing && (
                                        <td style={{ padding: '12px' }}>
                                            {attendance[student._id]?.status === 'absent' && (
                                                <input
                                                    type="text"
                                                    placeholder="Причина відсутності"
                                                    value={attendance[student._id]?.reason || ''}
                                                    onChange={(e) => handleReasonChange(student._id, e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '6px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #e5e7eb'
                                                    }}
                                                />
                                            )}
                                            {attendance[student._id]?.status === 'late' && (
                                                <input
                                                    type="time"
                                                    value={attendance[student._id]?.time || ''}
                                                    onChange={(e) => handleTimeChange(student._id, e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '6px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #e5e7eb'
                                                    }}
                                                />
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    color: '#6b7280'
                }}>
                    {selectedSchedule ? 'Немає учнів для цього уроку' : 'Виберіть урок для перегляду відвідуваності'}
                </div>
            )}

            {/* Кнопка збереження */}
            {isEditing && students.length > 0 && (
                <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={handleSaveAttendance}
                        disabled={loading}
                        style={{
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '16px'
                        }}
                    >
                        <FaSave />
                        {loading ? 'Збереження...' : 'Зберегти відвідуваність'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AttendanceTab;