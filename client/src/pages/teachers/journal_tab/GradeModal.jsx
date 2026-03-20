import React, { useState, useEffect } from 'react';
import { FaStar, FaUserClock, FaTimes, FaTrash, FaExclamationCircle } from 'react-icons/fa';

const GradeModal = ({
    show,
    onHide,
    onSave,
    onDelete,
    onDeleteAttendance,
    existingGrade,
    isMobile,
    scheduleId,
    databaseName,
    date,
    studentId,
    studentName,
    hasAttendance
}) => {
    const [mode, setMode] = useState('grade');
    const [grade, setGrade] = useState('');
    const [attendanceReason, setAttendanceReason] = useState('');

    useEffect(() => {
        if (existingGrade) {
            setGrade(existingGrade.value.toString());
            setMode('grade');
        } else {
            setGrade('');
            setMode('grade');
        }
        setAttendanceReason('');
    }, [existingGrade, show]);

    const handleSave = () => {
        if (mode === 'grade') {
            onSave({ type: 'grade', value: parseInt(grade) });
        } else {
            // В режимі відвідуваності — завжди ставимо "н"
            onSave({
                type: 'attendance',
                status: 'absent',
                reason: attendanceReason,
                records: [{ scheduleId, status: 'absent' }],
                lessonsAbsent: 1,
                totalLessons: 1
            });
        }
    };

    const handleDeleteAttendance = () => {
        if (onDeleteAttendance && date && studentId) {
            onDeleteAttendance(studentId, date);
            onHide();
        }
    };

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: isMobile ? '20px' : '24px',
                width: isMobile ? '95%' : '420px',
                maxWidth: '420px'
            }}>
                {/* Шапка */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        {studentName}
                    </h3>
                    <button onClick={onHide} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>
                        <FaTimes />
                    </button>
                </div>

                {/* Дата */}
                <div style={{ backgroundColor: '#f0f9ff', padding: '10px 12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#0369a1' }}>
                    {date?.formatted} ({date?.dayName})
                </div>

                {/* Перемикач режимів */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    {[
                        { key: 'grade', icon: <FaStar size={13} />, label: 'Оцінка' },
                        { key: 'attendance', icon: <FaUserClock size={13} />, label: 'Відвідуваність' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setMode(tab.key)}
                            style={{
                                flex: 1, padding: '9px 10px',
                                border: `2px solid ${mode === tab.key ? 'rgba(105,180,185,1)' : '#e5e7eb'}`,
                                borderRadius: '8px',
                                backgroundColor: mode === tab.key ? 'rgba(105,180,185,0.08)' : 'white',
                                color: mode === tab.key ? 'rgba(105,180,185,1)' : '#6b7280',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                fontWeight: mode === tab.key ? '600' : 'normal',
                                fontSize: '14px',
                                transition: 'all 0.15s'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Режим оцінки ── */}
                {mode === 'grade' && (
                    <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        style={{
                            width: '100%', padding: '11px 12px',
                            border: '1px solid #e5e7eb', borderRadius: '8px',
                            fontSize: '15px', marginBottom: '20px',
                            color: grade ? '#111827' : '#9ca3af'
                        }}
                    >
                        <option value="">Оберіть оцінку</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                )}

                {/* ── Режим відвідуваності ── */}
                {mode === 'attendance' && (
                    <div style={{ marginBottom: '20px' }}>
                        {hasAttendance ? (
                            // Вже є "н" — показуємо інфо-блок
                            <div style={{
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '10px',
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px'
                            }}>
                                <FaExclamationCircle size={18} style={{ color: '#ef4444', marginTop: '1px', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '4px', fontSize: '14px' }}>
                                        Учень відсутній на цьому уроці
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#b91c1c' }}>
                                        Щоб прибрати відмітку — натисніть «Видалити н»
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Немає "н" — форма для виставлення
                            <>
                                <div style={{
                                    backgroundColor: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '10px',
                                    padding: '14px',
                                    marginBottom: '12px',
                                    fontSize: '13px',
                                    color: '#6b7280'
                                }}>
                                    Буде поставлено відмітку про <strong style={{ color: '#374151' }}>відсутність</strong> на цьому уроці
                                </div>
                                <input
                                    type="text"
                                    placeholder="Причина відсутності (необов'язково)"
                                    value={attendanceReason}
                                    onChange={(e) => setAttendanceReason(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px 12px',
                                        border: '1px solid #e5e7eb', borderRadius: '8px',
                                        fontSize: '14px', boxSizing: 'border-box'
                                    }}
                                />
                            </>
                        )}
                    </div>
                )}

                {/* Кнопки дій */}
                <div style={{
                    display: 'flex', gap: '8px', justifyContent: 'flex-end',
                    borderTop: '1px solid #f3f4f6', paddingTop: '16px'
                }}>
                    {/* Видалити оцінку */}
                    {existingGrade && mode === 'grade' && (
                        <button onClick={onDelete} style={{
                            backgroundColor: '#ef4444', color: 'white',
                            padding: '9px 16px', border: 'none', borderRadius: '7px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px'
                        }}>
                            <FaTrash size={12} /> Видалити оцінку
                        </button>
                    )}

                    {/* Видалити "н" */}
                    {hasAttendance && mode === 'attendance' && (
                        <button onClick={handleDeleteAttendance} style={{
                            backgroundColor: '#ef4444', color: 'white',
                            padding: '9px 16px', border: 'none', borderRadius: '7px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px'
                        }}>
                            <FaTrash size={12} /> Видалити н
                        </button>
                    )}

                    <button onClick={onHide} style={{
                        backgroundColor: 'transparent', border: '1px solid #e5e7eb',
                        padding: '9px 16px', borderRadius: '7px', cursor: 'pointer',
                        color: '#6b7280', fontSize: '14px'
                    }}>
                        Скасувати
                    </button>

                    {!(mode === 'attendance' && hasAttendance) && (
                        <button
                            onClick={handleSave}
                            disabled={mode === 'grade' && !grade}
                            style={{
                                backgroundColor: 'rgba(105,180,185,1)', color: 'white',
                                padding: '9px 18px', border: 'none', borderRadius: '7px',
                                cursor: (mode === 'grade' && !grade) ? 'not-allowed' : 'pointer',
                                opacity: (mode === 'grade' && !grade) ? 0.45 : 1,
                                fontWeight: '600', fontSize: '14px'
                            }}
                        >
                            {mode === 'attendance' ? 'Поставити н' : 'Зберегти'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GradeModal;