import React, { useState, useEffect } from 'react';
import {
    FaTimes,
    FaStethoscope,
    FaHome,
    FaFileMedical,
    FaExclamationTriangle,
    FaTrash,
    FaBook,
    FaCheckCircle
} from 'react-icons/fa';
import axios from 'axios';

const AttendanceReasonModal = ({
    show,
    onHide,
    onSave,
    onDelete,
    attendance,
    date,
    studentName,
    studentId,
    groupId,
    databaseName,
    selectedQuarter,
    isMobile
}) => {
    const [reasonType, setReasonType] = useState('other');
    const [hasCertificate, setHasCertificate] = useState(false);
    const [daySchedule, setDaySchedule] = useState([]);
    const [selectedLessons, setSelectedLessons] = useState([]);
    const [lessonAttendanceData, setLessonAttendanceData] = useState({});
    const [teacherAttendance, setTeacherAttendance] = useState({}); // ДОДАНО: стан для відміток від предметників
    const [loading, setLoading] = useState(false);
    const [totalLessons, setTotalLessons] = useState(0);
    const [isReadOnly, setIsReadOnly] = useState(false);

    useEffect(() => {
        if (attendance) {
            setReasonType(attendance.reasonType || 'other');
            setHasCertificate(!!attendance.certificate);

            if (attendance.lessonDetails && attendance.lessonDetails.length > 0) {
                const absentLessons = attendance.lessonDetails
                    .filter(d => d.status === 'absent')
                    .map(d => d.scheduleId);
                setSelectedLessons(absentLessons);
            } else {
                setSelectedLessons([]);
            }
        } else {
            setReasonType('other');
            setHasCertificate(false);
            setSelectedLessons([]);
        }
    }, [attendance, show]);

    useEffect(() => {
        if (show && databaseName && groupId && date && selectedQuarter) {
            loadTeacherAttendanceStatus(); // Використовуємо нову функцію
        }
    }, [show, databaseName, groupId, date, selectedQuarter, studentId]);

    // Функція для завантаження статусів від предметників
    const loadTeacherAttendanceStatus = async () => {
        setLoading(true);
        try {
            const dateObj = new Date(date.fullDate);
            const dayOfWeek = dateObj.getDay();
            const dbDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

            const dayResponse = await axios.get('/api/days/by-id/' + dbDayOfWeek, {
                params: { databaseName }
            });

            if (!dayResponse.data) return;

            const dayOfWeekId = dayResponse.data._id;

            const scheduleResponse = await axios.get('/api/schedule', {
                params: {
                    databaseName,
                    group: groupId,
                    dayOfWeek: dayOfWeekId,
                    semester: selectedQuarter?.semester?._id
                }
            });

            setDaySchedule(scheduleResponse.data);
            setTotalLessons(scheduleResponse.data.length);

            // Завантажуємо відмітки від предметників
            const teacherAttendanceMap = {};
            const absentFromDB = [];

            for (const lesson of scheduleResponse.data) {
                try {
                    const response = await axios.get(
                        `/api/attendance/lesson/schedule/${lesson._id}`,
                        {
                            params: {
                                databaseName,
                                date: date.fullDate
                            }
                        }
                    );

                    if (response.data && response.data.records) {
                        const studentRecord = response.data.records.find(r => {
                            const rid = r.student?._id?.toString() || r.student?.toString();
                            return rid === studentId?.toString();
                        });

                        if (studentRecord) {
                            // Зберігаємо повний запис для відображення причини
                            setLessonAttendanceData(prev => ({
                                ...prev,
                                [lesson._id]: studentRecord
                            }));

                            if (studentRecord.status === 'absent') {
                                teacherAttendanceMap[lesson._id] = true;
                                absentFromDB.push(lesson._id);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Помилка завантаження для уроку ${lesson._id}:`, error);
                }
            }

            setTeacherAttendance(teacherAttendanceMap);

            // Якщо є відмітки від предметників, автоматично відмічаємо чекбокси
            if (absentFromDB.length > 0) {
                setSelectedLessons(absentFromDB);
                setIsReadOnly(true);
            } else {
                setIsReadOnly(false);
            }

        } catch (error) {
            console.error('Помилка завантаження даних:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonToggle = (scheduleId) => {
        if (teacherAttendance[scheduleId]) {
            alert('Цей урок вже відмічений вчителем-предметником. Змінити можна тільки в журналі вчителя.');
            return;
        }

        setSelectedLessons(prev => {
            const newSelected = prev.includes(scheduleId)
                ? prev.filter(id => id !== scheduleId)
                : [...prev, scheduleId];
            return newSelected;
        });
    };

    const handleSave = () => {
        const lessonDetails = daySchedule.map(lesson => {
            const isTeacherMarked = teacherAttendance[lesson._id];
            const isSelected = selectedLessons.includes(lesson._id);
            const isAbsent = isTeacherMarked || isSelected;

            return {
                scheduleId: lesson._id,
                subject: lesson.subject,
                timeSlot: {
                    startTime: lesson.timeSlot?.startTime,
                    endTime: lesson.timeSlot?.endTime
                },
                status: isAbsent ? 'absent' : 'present',
                reason: isTeacherMarked ? (lessonAttendanceData[lesson._id]?.reason || '') :
                    (isSelected && reasonType === 'sick' ? 'Хвороба' :
                        isSelected && reasonType === 'family' ? 'Сімейні обставини' : ''),
                markedBy: isTeacherMarked ? 'teacher' : 'class_teacher',
                totalLessons: daySchedule.length // Додаємо totalLessons для кожного уроку
            };
        });

        const totalAbsent = lessonDetails.filter(l => l.status === 'absent').length;

        const attendanceData = {
            status: totalAbsent > 0 ? 'absent' : 'present',
            reasonType,
            lessonsAbsent: totalAbsent,
            totalLessons: daySchedule.length,
            lessonDetails,
            certificate: hasCertificate
        };

        console.log('Saving attendance data:', {
            totalLessons: daySchedule.length,
            lessonsAbsent: totalAbsent,
            lessonDetailsCount: lessonDetails.length,
            absentLessons: lessonDetails.filter(l => l.status === 'absent').map(l => l.subject)
        });

        onSave(attendanceData);
    };

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: isMobile ? '20px' : '24px',
                width: isMobile ? '95%' : '600px',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: 0 }}>
                        Відвідуваність: {studentName}
                    </h3>
                    <button
                        onClick={onHide}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#6b7280'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div style={{
                    backgroundColor: '#f0f9ff',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <div style={{ fontSize: '14px', color: '#0369a1' }}>
                        {date?.formatted} ({date?.dayName})
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Позначте уроки, на яких учень був відсутній:
                    </label>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            Завантаження розкладу...
                        </div>
                    ) : daySchedule.length === 0 ? (
                        <div style={{
                            backgroundColor: '#f9fafb',
                            padding: '20px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            color: '#6b7280'
                        }}>
                            На цей день немає уроків у розкладі
                        </div>
                    ) : (
                        <div style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            {daySchedule.map((lesson, index) => {
                                const teacherMarked = teacherAttendance[lesson._id]; // ВИКОРИСТОВУЄМО teacherAttendance
                                const isSelected = selectedLessons.includes(lesson._id);

                                return (
                                    <div
                                        key={lesson._id}
                                        style={{
                                            padding: '12px',
                                            borderBottom: index < daySchedule.length - 1 ? '1px solid #e5e7eb' : 'none',
                                            backgroundColor: teacherMarked ? '#f0fdf4' : (isSelected ? '#fee2e2' : 'white'),
                                            opacity: teacherMarked ? 0.8 : 1
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            {!teacherMarked ? (
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleLessonToggle(lesson._id)}
                                                    style={{
                                                        marginTop: '2px',
                                                        width: '18px',
                                                        height: '18px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    color: '#10b981',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <FaCheckCircle size={16} />
                                                </div>
                                            )}

                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <FaBook style={{
                                                        color: teacherMarked ? '#10b981' : (isSelected ? '#ef4444' : '#9ca3af')
                                                    }} />
                                                    <span style={{ fontWeight: '500' }}>{lesson.subject}</span>
                                                    {teacherMarked && (
                                                        <span style={{
                                                            backgroundColor: '#10b981',
                                                            color: 'white',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '11px'
                                                        }}>
                                                            Відмічено вчителем
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: teacherMarked ? '#047857' : '#6b7280',
                                                    marginTop: '4px',
                                                    display: 'flex',
                                                    gap: '12px'
                                                }}>
                                                    <span>{lesson.timeSlot?.startTime} - {lesson.timeSlot?.endTime}</span>
                                                    {lesson.teacher && (
                                                        <span>• {lesson.teacher.fullName}</span>
                                                    )}
                                                </div>
                                                {teacherMarked && lessonAttendanceData[lesson._id]?.reason && (
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#6b7280',
                                                        marginTop: '4px',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        Причина: {lessonAttendanceData[lesson._id].reason}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {selectedLessons.length > 0 && (
                    <>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Причина відсутності:
                            </label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px',
                                marginBottom: '10px'
                            }}>
                                {[
                                    { type: 'sick', label: 'Хвороба', icon: <FaStethoscope />, color: '#ef4444' },
                                    { type: 'family', label: 'Сімейні', icon: <FaHome />, color: '#f59e0b' },
                                    { type: 'other', label: 'Інше', icon: <FaExclamationTriangle />, color: '#6b7280' }
                                ].map(option => (
                                    <button
                                        key={option.type}
                                        onClick={() => setReasonType(option.type)}
                                        style={{
                                            padding: '10px',
                                            border: `2px solid ${reasonType === option.type ? option.color : '#e5e7eb'}`,
                                            borderRadius: '8px',
                                            backgroundColor: reasonType === option.type ? `${option.color}20` : 'white',
                                            color: reasonType === option.type ? option.color : '#374151',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '5px',
                                            fontWeight: reasonType === option.type ? '600' : 'normal',
                                            opacity: isReadOnly ? 0.6 : 1
                                        }}
                                        disabled={isReadOnly}
                                    >
                                        <span style={{ fontSize: '18px' }}>{option.icon}</span>
                                        <span style={{ fontSize: '12px' }}>{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '10px',
                                cursor: isReadOnly ? 'not-allowed' : 'pointer',
                                opacity: isReadOnly ? 0.6 : 1
                            }}>
                                <input
                                    type="checkbox"
                                    checked={hasCertificate}
                                    onChange={(e) => setHasCertificate(e.target.checked)}
                                    disabled={isReadOnly}
                                />
                                <FaFileMedical style={{ color: hasCertificate ? '#10b981' : '#9ca3af' }} />
                                <span style={{ fontWeight: '500' }}>
                                    {reasonType === 'sick' ? 'Медична довідка' : 'Записка від батьків'}
                                </span>
                            </label>
                        </div>
                    </>
                )}

                <div style={{
                    padding: '12px',
                    backgroundColor: selectedLessons.length === totalLessons && totalLessons > 0
                        ? '#fee2e2'
                        : selectedLessons.length > 0
                            ? '#fffbeb'
                            : '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '14px',
                    color: selectedLessons.length === totalLessons && totalLessons > 0
                        ? '#dc2626'
                        : selectedLessons.length > 0
                            ? '#d97706'
                            : '#6b7280'
                }}>
                    {totalLessons === 0 ? (
                        'Немає уроків у розкладі'
                    ) : selectedLessons.length === 0 ? (
                        'Учень присутній на всіх уроках'
                    ) : selectedLessons.length === totalLessons ? (
                        'Учень відсутній на всіх уроках'
                    ) : (
                        `Часткова відсутність: ${selectedLessons.length} з ${totalLessons} уроків`
                    )}
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '20px'
                }}>
                    {attendance?._id && (
                        <button
                            onClick={onDelete}
                            style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FaTrash />
                            Видалити всі позначки
                        </button>
                    )}
                    <button
                        onClick={onHide}
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #e5e7eb',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Скасувати
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Зберегти
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceReasonModal;