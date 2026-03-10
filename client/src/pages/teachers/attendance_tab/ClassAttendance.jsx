import React, { useState, useEffect } from 'react';
import {
    FaSave,
    FaEdit,
    FaHistory,
    FaFileMedical,
    FaStethoscope,
    FaHome,
    FaExclamationTriangle,
    FaCheck,
    FaTimes,
    FaPlus,
    FaTrash,
    FaFilePdf,
    FaDownload,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaCalendarWeek
} from 'react-icons/fa';
import AttendanceReasonModal from './AttendanceReasonModal';

const ClassAttendance = ({ databaseName, isMobile, teacherId, groupId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Дані про групу та студентів
    const [group, setGroup] = useState(null);
    const [students, setStudents] = useState([]);

    // Дані про чверті
    const [quarters, setQuarters] = useState([]);
    const [selectedQuarter, setSelectedQuarter] = useState(null);
    const [quarterDates, setQuarterDates] = useState([]);
    const [weeks, setWeeks] = useState([]);

    // Дані про відвідуваність
    const [attendance, setAttendance] = useState({});
    const [existingAttendance, setExistingAttendance] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Стан модального вікна
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [selectedAttendance, setSelectedAttendance] = useState(null);

    // Статистика
    const [stats, setStats] = useState({
        totalDays: 0,
        totalAbsent: 0,
        sickDays: 0,
        otherDays: 0
    });

    useEffect(() => {
        if (databaseName && groupId && teacherId) {
            loadGroupData();
            loadQuarters();
        }
    }, [databaseName, groupId, teacherId]);

    useEffect(() => {
        if (selectedQuarter) {
            generateQuarterDates();
            loadAttendanceForQuarter();
        }
    }, [selectedQuarter]);

    useEffect(() => {
        calculateStats();
    }, [attendance, quarterDates]);

    const loadGroupData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/groups/${groupId}?databaseName=${databaseName}`);
            if (response.ok) {
                const data = await response.json();
                setGroup(data);
                setStudents(data.students || []);
            }
        } catch (err) {
            setError('Помилка завантаження даних групи: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadQuarters = async () => {
        try {
            const response = await fetch(`/api/study-calendar/quarters?databaseName=${databaseName}`);

            if (response.ok) {
                const data = await response.json();
                setQuarters(data);

                // Знаходимо активну чверть
                const now = new Date();
                now.setHours(12, 0, 0, 0);

                const activeQuarter = data.find(q => {
                    const start = new Date(q.startDate);
                    const end = new Date(q.endDate);
                    start.setHours(12, 0, 0, 0);
                    end.setHours(12, 0, 0, 0);
                    return now >= start && now <= end;
                }) || data.find(q => q.isActive) || data[0];

                if (activeQuarter) {
                    setSelectedQuarter(activeQuarter);
                }
            }
        } catch (err) {
            console.error('Помилка завантаження чвертей:', err);
        }
    };

    const generateQuarterDates = () => {
        if (!selectedQuarter) return;

        // Функція для конвертації UTC дати в локальну з правильним днем
        const convertUTCToLocalDate = (utcDateStr) => {
            const date = new Date(utcDateStr);
            const year = date.getUTCFullYear();
            const month = date.getUTCMonth();
            const day = date.getUTCDate();
            return new Date(year, month, day, 12, 0, 0, 0);
        };

        const startDate = convertUTCToLocalDate(selectedQuarter.startDate);
        const endDate = convertUTCToLocalDate(selectedQuarter.endDate);

        const dates = [];
        const currentDate = new Date(startDate);
        let weekNumber = 1;
        let weekDates = [];

        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();

            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                const dateObj = {
                    date: new Date(currentDate),
                    formatted: currentDate.toLocaleDateString('uk-UA', {
                        day: '2-digit',
                        month: '2-digit'
                    }),
                    fullDate: dateStr,
                    dayOfWeek: currentDate.toLocaleDateString('uk-UA', { weekday: 'short' }),
                    dayName: getDayName(dayOfWeek),
                    weekNumber: weekNumber,
                    isFirstOfWeek: false,
                    isLastOfWeek: false
                };

                dates.push(dateObj);
                weekDates.push(dateObj);
            }

            const isFriday = dayOfWeek === 5;
            const isLastDay = currentDate.toDateString() === endDate.toDateString();

            if ((isFriday || isLastDay) && weekDates.length > 0) {
                weekDates[0].isFirstOfWeek = true;
                weekDates[weekDates.length - 1].isLastOfWeek = true;
                weekDates = [];
                weekNumber++;
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        setQuarterDates(dates);
    };

    const getDayName = (dayOfWeek) => {
        const days = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        return days[dayOfWeek];
    };

    const loadAttendanceForQuarter = async () => {
        if (!selectedQuarter?._id || !groupId) return;

        try {
            console.log('Loading attendance for quarter:', {
                groupId,
                quarterId: selectedQuarter._id,
                databaseName
            });

            const response = await fetch(
                `/api/attendance/class/group/${groupId}?quarter=${selectedQuarter._id}&databaseName=${databaseName}`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Load response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Loaded attendance data:', data);

                const attendanceMap = {};
                data.forEach(record => {
                    // Отримуємо ID студента (може бути об'єктом або рядком)
                    const studentId = record.student?._id || record.student;

                    if (!studentId) {
                        console.error('Record without student ID:', record);
                        return;
                    }

                    const recordDate = new Date(record.date).toISOString().split('T')[0];
                    const key = `${studentId}_${recordDate}`;

                    console.log('Mapping record:', {
                        studentId,
                        recordDate,
                        key,
                        record,
                        studentObj: record.student
                    });

                    attendanceMap[key] = {
                        status: record.status,
                        reason: record.reason || '',
                        reasonType: record.reasonType || 'other',
                        certificate: record.certificate || null,
                        note: record.note || '',
                        lessonsAbsent: record.lessonsAbsent || 0,
                        totalLessons: record.totalLessons || 0,
                        _id: record._id
                    };
                });

                console.log('Final attendance map:', attendanceMap);
                setAttendance(attendanceMap);
                setIsEditing(false);
            } else {
                const errorText = await response.text();
                console.error('Error loading attendance:', errorText);
            }
        } catch (err) {
            console.error('Exception in loadAttendanceForQuarter:', err);
        }
    };

    const calculateStats = () => {
        if (!students.length || !quarterDates.length) return;

        let totalAbsent = 0;
        let sickDays = 0;
        let otherDays = 0;

        students.forEach(student => {
            quarterDates.forEach(date => {
                const key = `${student._id}_${date.fullDate}`;
                const record = attendance[key];

                if (record && record.status === 'absent') {
                    totalAbsent++;

                    switch (record.reasonType) {
                        case 'sick':
                            sickDays++;
                            break;
                        default:
                            otherDays++;
                    }
                }
            });
        });

        setStats({
            totalDays: quarterDates.length,
            totalAbsent,
            sickDays,
            otherDays
        });
    };

    const handleCellClick = (studentId, date) => {
        const key = `${studentId}_${date.fullDate}`;
        const existing = attendance[key];

        setSelectedCell({ studentId, date });
        setSelectedAttendance(existing || {
            status: 'absent',
            reason: '',
            reasonType: 'other',
            certificate: null,
            note: '',
            lessonsAbsent: 0,
            totalLessons: 0
        });
        setShowReasonModal(true);
    };

    const encodeUserInfo = (userInfo) => {
        if (!userInfo) return '{}';
        try {
            const userInfoObj = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
            return JSON.stringify(userInfoObj);
        } catch (e) {
            console.error('Помилка кодування userInfo:', e);
            return '{}';
        }
    };

    const handleSaveAttendance = async (attendanceData) => {
        if (!selectedCell || !groupId) return;

        try {
            const payload = {
                databaseName,
                groupId,
                studentId: selectedCell.studentId,
                date: selectedCell.date.fullDate,
                quarter: selectedQuarter._id,
                ...attendanceData
            };

            console.log('Sending payload to server:', payload);

            let response;
            const key = `${selectedCell.studentId}_${selectedCell.date.fullDate}`;
            const existingRecord = attendance[key];

            const headers = {
                'Content-Type': 'application/json'
            };

            if (existingRecord?._id) {
                console.log('Updating existing record:', existingRecord._id);
                response = await fetch(`/api/attendance/class/${existingRecord._id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(payload)
                });
            } else {
                console.log('Creating new record');
                response = await fetch('/api/attendance/class/', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });
            }

            console.log('Response status:', response.status);

            if (response.ok) {
                const savedRecord = await response.json();
                console.log('Saved record from server:', savedRecord);

                // Оновлюємо стан з правильним ключем
                setAttendance(prev => {
                    const newAttendance = { ...prev };
                    newAttendance[key] = {
                        status: savedRecord.status,
                        reason: savedRecord.reason || '',
                        reasonType: savedRecord.reasonType || 'other',
                        certificate: savedRecord.certificate || null,
                        note: savedRecord.note || '',
                        lessonsAbsent: savedRecord.lessonsAbsent || 0,
                        totalLessons: savedRecord.totalLessons || 0,
                        _id: savedRecord._id
                    };
                    return newAttendance;
                });

                setSuccess('Дані відвідуваності збережено');
                setShowReasonModal(false);
                setSelectedCell(null);
                setSelectedAttendance(null);
                setIsEditing(true);

                // Примусово перезавантажуємо дані після збереження
                setTimeout(() => {
                    loadAttendanceForQuarter();
                }, 500);
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    setError(errorData.message || errorData.error || 'Помилка при збереженні');
                } catch {
                    setError('Помилка при збереженні: ' + errorText);
                }
            }
        } catch (err) {
            console.error('Exception in handleSaveAttendance:', err);
            setError('Помилка при збереженні: ' + err.message);
        }
    };

    const handleDeleteAttendance = async () => {
        if (!selectedCell) return;

        const key = `${selectedCell.studentId}_${selectedCell.date.fullDate}`;
        const record = attendance[key];

        if (!record?._id) return;

        try {
            const response = await fetch(`/api/attendance/class/${record._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ databaseName })
            });

            if (response.ok) {
                const newAttendance = { ...attendance };
                delete newAttendance[key];
                setAttendance(newAttendance);

                setSuccess('Запис видалено');
                setShowReasonModal(false);
                setSelectedCell(null);
                setSelectedAttendance(null);
            } else {
                const errorText = await response.text();
                console.error('Помилка відповіді:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    setError(errorData.message || errorData.error || 'Помилка при видаленні');
                } catch {
                    setError('Помилка при видаленні: ' + errorText);
                }
            }
        } catch (err) {
            setError('Помилка при видаленні: ' + err.message);
        }
    };

    const renderAttendanceCell = (studentId, date) => {
        const key = `${studentId}_${date.fullDate}`;
        const record = attendance[key];

        if (!record) {
            return (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d1d5db',
                    fontSize: '14px'
                }}>
                    —
                </div>
            );
        }

        if (record.lessonsAbsent === record.totalLessons && record.totalLessons > 0) {
            return (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{
                        backgroundColor: '#34d246',
                        color: 'white',
                        width: '28px',
                        height: '28px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}>
                        Н
                    </span>
                </div>
            );
        }

        if (record.lessonsAbsent > 0 && record.totalLessons > 0) {
            return (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        width: '28px',
                        height: '28px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}>
                        {record.lessonsAbsent}/{record.totalLessons}
                    </span>
                </div>
            );
        }

        // Якщо студент був присутній (немає запису про відсутність)
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <span style={{
                    backgroundColor: '#f76060',
                    color: 'white',
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}>
                    н
                </span>
            </div>
        );
    };

    const isCurator = group?.curator && teacherId && (
        (typeof group.curator === 'object' && group.curator._id === teacherId) ||
        (typeof group.curator === 'string' && group.curator === teacherId)
    );

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                Завантаження...
            </div>
        );
    }

    if (!teacherId) {
        return (
            <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeeba',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                color: '#856404'
            }}>
                <FaChalkboardTeacher style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                <h3>Очікування даних</h3>
                <p>Завантаження інформації про користувача...</p>
            </div>
        );
    }

    if (!isCurator) {
        return (
            <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeeba',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                color: '#856404'
            }}>
                <FaChalkboardTeacher style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                <h3>Доступ обмежено</h3>
                <p>Цей розділ доступний тільки для класних керівників.</p>
                <p style={{ fontSize: '14px', marginTop: '10px' }}>
                    Ви не є класним керівником групи {group?.name}
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Заголовок */}
            <h3 style={{
                fontSize: isMobile ? '18px' : '24px',
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '20px'
            }}>
                Відвідуваність
            </h3>

            {/* Вибір чверті */}
            <div style={{
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                flexWrap: 'wrap'
            }}>
                <label style={{ fontWeight: '500', color: '#374151' }}>
                    Навчальна чверть:
                </label>
                <select
                    value={selectedQuarter?._id || ''}
                    onChange={(e) => {
                        const quarter = quarters.find(q => q._id === e.target.value);
                        setSelectedQuarter(quarter);
                    }}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        fontSize: '14px',
                        minWidth: '200px'
                    }}
                >
                    {quarters.map(quarter => (
                        <option key={quarter._id} value={quarter._id}>
                            {quarter.name} ({new Date(quarter.startDate).toLocaleDateString('uk-UA')} - {new Date(quarter.endDate).toLocaleDateString('uk-UA')})
                            {quarter.isActive ? ' (активна)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Повідомлення */}
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

            {/* Статистика - тепер тільки 3 блоки */}
            {quarterDates.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
                    gap: '15px',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '14px', color: '#0369a1' }}>Всього днів</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0284c7' }}>
                            {stats.totalDays}
                        </div>
                    </div>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '14px', color: '#991b1b' }}>Всього пропусків</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                            {stats.totalAbsent}
                        </div>
                    </div>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#fff3e0',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '14px', color: '#9a3412' }}>За хворобою</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c' }}>
                            {stats.sickDays}
                        </div>
                    </div>
                </div>
            )}

            {/* Таблиця відвідуваності з розділенням на тижні */}
            {students.length > 0 && quarterDates.length > 0 ? (
                <div style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'auto',
                    maxHeight: '70vh'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: `${quarterDates.length * 120 + 250}px`
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                                <th style={{
                                    padding: '12px',
                                    textAlign: 'left',
                                    borderBottom: '2px solid #e5e7eb',
                                    position: 'sticky',
                                    top: 0,
                                    left: 0,
                                    backgroundColor: '#f9fafb',
                                    zIndex: 3,
                                    minWidth: '250px',
                                    boxShadow: '2px 0 0 #e5e7eb'
                                }}>
                                    Учень
                                </th>
                                {quarterDates.map((date, index) => {
                                    const isFirstOfWeek = date.isFirstOfWeek;
                                    const isLastOfWeek = date.isLastOfWeek;

                                    return (
                                        <th key={index} style={{
                                            padding: '12px',
                                            textAlign: 'center',
                                            borderBottom: '2px solid #e5e7eb',
                                            borderLeft: '1px solid #e5e7eb',
                                            borderRight: isLastOfWeek ? '2px solid #9ca3af' : 'none',
                                            position: 'sticky',
                                            top: 0,
                                            backgroundColor: '#f9fafb',
                                            zIndex: 2,
                                            minWidth: '120px',
                                            boxShadow: isFirstOfWeek ? 'inset 2px 0 0 #9ca3af' : 'none'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                {isFirstOfWeek && (
                                                    <FaCalendarWeek style={{ fontSize: '12px', color: '#6b7280' }} />
                                                )}
                                                <span>{date.formatted}</span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                                {date.dayName}
                                            </div>
                                        </th>
                                    );
                                })}
                                <th style={{
                                    padding: '12px',
                                    textAlign: 'center',
                                    borderBottom: '2px solid #e5e7eb',
                                    borderLeft: '2px solid #e5e7eb',
                                    position: 'sticky',
                                    top: 0,
                                    backgroundColor: '#e0f2fe',
                                    zIndex: 2,
                                    minWidth: '100px'
                                }}>
                                    <div>Всього</div>
                                    <div style={{ fontSize: '11px' }}>пропусків</div>
                                </th>
                                <th style={{
                                    padding: '12px',
                                    textAlign: 'center',
                                    borderBottom: '2px solid #e5e7eb',
                                    borderLeft: '1px solid #e5e7eb',
                                    position: 'sticky',
                                    top: 0,
                                    backgroundColor: '#fff3e0',
                                    zIndex: 2,
                                    minWidth: '100px'
                                }}>
                                    <div>З них</div>
                                    <div style={{ fontSize: '11px' }}>за хворобою</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, rowIndex) => {
                                let studentTotalAbsent = 0;
                                let studentSickDays = 0;

                                quarterDates.forEach(date => {
                                    const key = `${student._id}_${date.fullDate}`;
                                    const record = attendance[key];
                                    if (record && record.status === 'absent') {
                                        studentTotalAbsent++;
                                        if (record.reasonType === 'sick') studentSickDays++;
                                    }
                                });

                                return (
                                    <tr key={student._id} style={{
                                        borderBottom: '1px solid #e5e7eb',
                                        backgroundColor: rowIndex % 2 === 0 ? 'white' : '#fafafa'
                                    }}>
                                        <td style={{
                                            padding: '10px 12px',
                                            position: 'sticky',
                                            left: 0,
                                            backgroundColor: 'inherit',
                                            fontWeight: '500',
                                            boxShadow: '2px 0 0 #e5e7eb',
                                            zIndex: 1
                                        }}>
                                            {student.fullName}
                                        </td>
                                        {quarterDates.map((date, colIndex) => {
                                            const isLastOfWeek = date.isLastOfWeek;

                                            return (
                                                <td
                                                    key={`${rowIndex}-${colIndex}`}
                                                    onClick={() => handleCellClick(student._id, date)}
                                                    style={{
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                        borderLeft: '1px solid #e5e7eb',
                                                        borderRight: isLastOfWeek ? '2px solid #9ca3af' : 'none',
                                                        cursor: 'pointer',
                                                        backgroundColor: 'inherit',
                                                        transition: 'background-color 0.2s',
                                                        height: '50px'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'inherit';
                                                    }}
                                                >
                                                    {renderAttendanceCell(student._id, date)}
                                                </td>
                                            );
                                        })}
                                        <td style={{
                                            padding: '10px 12px',
                                            textAlign: 'center',
                                            borderLeft: '2px solid #e5e7eb',
                                            backgroundColor: '#f0f9ff',
                                            fontWeight: 'bold',
                                            color: '#dc2626'
                                        }}>
                                            {studentTotalAbsent}
                                        </td>
                                        <td style={{
                                            padding: '10px 12px',
                                            textAlign: 'center',
                                            borderLeft: '1px solid #e5e7eb',
                                            backgroundColor: '#fff3e0',
                                            fontWeight: 'bold',
                                            color: '#ea580c'
                                        }}>
                                            {studentSickDays}
                                        </td>
                                    </tr>
                                );
                            })}
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
                    {students.length === 0 ? 'Немає учнів у класі' : 'Виберіть чверть для відображення'}
                </div>
            )}

            <AttendanceReasonModal
                show={showReasonModal}
                onHide={() => {
                    setShowReasonModal(false);
                    setSelectedCell(null);
                    setSelectedAttendance(null);
                }}
                onSave={handleSaveAttendance}
                onDelete={handleDeleteAttendance}
                attendance={selectedAttendance}
                date={selectedCell?.date}
                studentName={students.find(s => s._id === selectedCell?.studentId)?.fullName}
                isMobile={isMobile}
            />
        </div>
    );
};

export default ClassAttendance;