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

    // Таймери для повідомлень
    useEffect(() => {
        let errorTimer, successTimer;

        if (error) {
            errorTimer = setTimeout(() => setError(null), 4000);
        }

        if (success) {
            successTimer = setTimeout(() => setSuccess(null), 4000);
        }

        return () => {
            clearTimeout(errorTimer);
            clearTimeout(successTimer);
        };
    }, [error, success]);

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
            const response = await fetch(
                `/api/attendance/class/group/${groupId}?quarter=${selectedQuarter._id}&databaseName=${databaseName}`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setExistingAttendance(data);

                const attendanceMap = {};
                data.forEach(record => {
                    const studentId = record.student?._id || record.student;

                    if (!studentId) {
                        console.error('Record without student ID:', record);
                        return;
                    }

                    const recordDate = new Date(record.date).toISOString().split('T')[0];
                    const key = `${studentId}_${recordDate}`;

                    attendanceMap[key] = {
                        status: record.status,
                        reasonType: record.reasonType || 'other',
                        certificate: record.certificate || null,
                        lessonsAbsent: record.lessonsAbsent || 0,
                        totalLessons: record.totalLessons || 0,
                        _id: record._id
                    };
                });

                setAttendance(attendanceMap);
                setIsEditing(false);
            }
        } catch (err) {
            console.error('Помилка завантаження відвідуваності:', err);
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
            reasonType: 'other',
            certificate: null,
            lessonsAbsent: 0,
            totalLessons: 0
        });
        setShowReasonModal(true);
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
                status: 'absent',
                reasonType: attendanceData.reasonType,
                lessonsAbsent: attendanceData.lessonsAbsent,
                totalLessons: attendanceData.totalLessons,
                certificate: attendanceData.certificate
            };

            let response;
            const key = `${selectedCell.studentId}_${selectedCell.date.fullDate}`;
            const existingRecord = attendance[key];

            const headers = {
                'Content-Type': 'application/json'
            };

            if (existingRecord?._id) {
                response = await fetch(`/api/attendance/class/${existingRecord._id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch('/api/attendance/class/', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                const savedRecord = await response.json();

                setAttendance(prev => ({
                    ...prev,
                    [key]: {
                        status: savedRecord.status,
                        reasonType: savedRecord.reasonType || 'other',
                        certificate: savedRecord.certificate,
                        lessonsAbsent: savedRecord.lessonsAbsent || 0,
                        totalLessons: savedRecord.totalLessons || 0,
                        _id: savedRecord._id
                    }
                }));

                setSuccess('Дані відвідуваності збережено');
                setShowReasonModal(false);
                setSelectedCell(null);
                setSelectedAttendance(null);
                setIsEditing(true);
            } else {
                const errorData = await response.json();
                setError(errorData.message || errorData.error || 'Помилка при збереженні');
            }
        } catch (err) {
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

        // Якщо є запис про відсутність
        if (record.status === 'absent') {
            // Повна відсутність (Н)
            if (record.lessonsAbsent === record.totalLessons && record.totalLessons > 0) {
                return (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        <span style={{
                            backgroundColor: '#ef4444',
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
                        {record.certificate && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                border: '1px solid white'
                            }}>
                                ✓
                            </span>
                        )}
                    </div>
                );
            }

            // Часткова відсутність (дріб)
            if (record.lessonsAbsent > 0 && record.totalLessons > 0) {
                return (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
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
                            fontSize: '12px'
                        }}>
                            {record.lessonsAbsent}/{record.totalLessons}
                        </span>
                        {record.certificate && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                border: '1px solid white'
                            }}>
                                ✓
                            </span>
                        )}
                    </div>
                );
            }
        }

        // Якщо студент був присутній - показуємо прочерк
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

            {/* Повідомлення з можливістю закриття */}
            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaExclamationTriangle />
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: '18px',
                            padding: '0 4px'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>
            )}

            {success && (
                <div style={{
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                }}>
                    <span>{success}</span>
                    <button
                        onClick={() => setSuccess(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#065f46',
                            cursor: 'pointer',
                            fontSize: '18px',
                            padding: '0 4px'
                        }}
                    >
                        <FaTimes />
                    </button>
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

            {/* Легенда - завжди після таблиці */}
            {students.length > 0 && quarterDates.length > 0 && (
                <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '24px',
                    alignItems: 'center'
                }}>
                    <div style={{ fontWeight: '500', color: '#374151' }}>Позначення:</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            Н
                        </span>
                        <span style={{ fontSize: '14px', color: '#4b5563' }}>повна відсутність</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '12px'
                        }}>
                            2/8
                        </span>
                        <span style={{ fontSize: '14px', color: '#4b5563' }}>часткова відсутність (пропущено уроків/всього)</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative', width: '24px', height: '24px' }}>
                            <span style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                Н
                            </span>
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                border: '1px solid white'
                            }}>
                                ✓
                            </span>
                        </div>
                        <span style={{ fontSize: '14px', color: '#4b5563' }}>є довідка/записка</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#d1d5db',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}>
                            —
                        </span>
                        <span style={{ fontSize: '14px', color: '#4b5563' }}>присутній</span>
                    </div>
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