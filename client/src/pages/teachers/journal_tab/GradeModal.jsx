import React, { useState, useEffect } from 'react';
import { FaStar, FaUserClock, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const GradeModal = ({
    show,
    onHide,
    onSave,
    onDelete,
    existingGrade,
    isMobile,
    scheduleId,
    databaseName,
    date,
    studentId,
    studentName
}) => {
    const [mode, setMode] = useState('grade');
    const [grade, setGrade] = useState('');
    const [attendanceStatus, setAttendanceStatus] = useState('present');
    const [attendanceReason, setAttendanceReason] = useState('');

    useEffect(() => {
        if (existingGrade) {
            setGrade(existingGrade.value.toString());
            setMode('grade');
        } else {
            setGrade('');
            setMode('grade');
        }
    }, [existingGrade, show]);

    const handleSave = () => {
        if (mode === 'grade') {
            onSave({
                type: 'grade',
                value: parseInt(grade)
            });
        } else {
            // Для вчителя-предметника - тільки один урок
            onSave({
                type: 'attendance',
                status: attendanceStatus,
                reason: attendanceReason,
                records: [{
                    scheduleId: scheduleId,
                    status: attendanceStatus === 'absent' ? 'absent' : 'present'
                }],
                lessonsAbsent: attendanceStatus === 'absent' ? 1 : 0,
                totalLessons: 1
            });
        }
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
                width: isMobile ? '95%' : '450px',
                maxWidth: '450px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: 0 }}>
                        {studentName}
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

                {/* Вибір режиму */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px'
                }}>
                    <button
                        onClick={() => setMode('grade')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: `2px solid ${mode === 'grade' ? 'rgba(105, 180, 185, 1)' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            backgroundColor: mode === 'grade' ? 'rgba(105, 180, 185, 0.1)' : 'white',
                            color: mode === 'grade' ? 'rgba(105, 180, 185, 1)' : '#374151',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: mode === 'grade' ? '600' : 'normal'
                        }}
                    >
                        <FaStar />
                        Оцінка
                    </button>
                    <button
                        onClick={() => setMode('attendance')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: `2px solid ${mode === 'attendance' ? '#f59e0b' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            backgroundColor: mode === 'attendance' ? '#fffbeb' : 'white',
                            color: mode === 'attendance' ? '#d97706' : '#374151',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: mode === 'attendance' ? '600' : 'normal'
                        }}
                    >
                        <FaUserClock />
                        Відвідуваність
                    </button>
                </div>

                {mode === 'grade' ? (
                    // Режим оцінки
                    <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '16px',
                            marginBottom: '20px'
                        }}
                    >
                        <option value="">Оберіть оцінку</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                ) : (
                    // Режим відвідуваності - тільки для поточного уроку
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            marginBottom: '15px'
                        }}>
                            <button
                                onClick={() => setAttendanceStatus('present')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    border: `2px solid ${attendanceStatus === 'present' ? '#10b981' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    backgroundColor: attendanceStatus === 'present' ? '#d1fae5' : 'white',
                                    color: attendanceStatus === 'present' ? '#065f46' : '#374151',
                                    cursor: 'pointer'
                                }}
                            >
                                Присутній
                            </button>
                            <button
                                onClick={() => setAttendanceStatus('absent')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    border: `2px solid ${attendanceStatus === 'absent' ? '#ef4444' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    backgroundColor: attendanceStatus === 'absent' ? '#fee2e2' : 'white',
                                    color: attendanceStatus === 'absent' ? '#dc2626' : '#374151',
                                    cursor: 'pointer'
                                }}
                            >
                                Відсутній
                            </button>
                        </div>

                        {attendanceStatus === 'absent' && (
                            <input
                                type="text"
                                placeholder="Причина відсутності (необов'язково)"
                                value={attendanceReason}
                                onChange={(e) => setAttendanceReason(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                        )}
                    </div>
                )}

                {/* Кнопки */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '20px'
                }}>
                    {existingGrade && mode === 'grade' && (
                        <button
                            onClick={onDelete}
                            style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Видалити
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
                        disabled={mode === 'grade' && !grade}
                        style={{
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: (mode === 'grade' && !grade) ? 'not-allowed' : 'pointer',
                            opacity: (mode === 'grade' && !grade) ? 0.5 : 1
                        }}
                    >
                        Зберегти
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GradeModal;