import React, { useState, useEffect } from 'react';
import {
    FaTimes,
    FaStethoscope,
    FaHome,
    FaFileMedical,
    FaExclamationTriangle,
    FaTrash
} from 'react-icons/fa';

const AttendanceReasonModal = ({
    show,
    onHide,
    onSave,
    onDelete,
    attendance,
    date,
    studentName,
    isMobile
}) => {
    const [reasonType, setReasonType] = useState('other');
    const [hasCertificate, setHasCertificate] = useState(false);
    const [lessonsAbsent, setLessonsAbsent] = useState(0);
    const [totalLessons, setTotalLessons] = useState(8);
    const [absenceType, setAbsenceType] = useState('full'); // 'full' або 'partial'

    useEffect(() => {
        if (attendance) {
            setReasonType(attendance.reasonType || 'other');
            setHasCertificate(!!attendance.certificate);
            setLessonsAbsent(attendance.lessonsAbsent || 0);
            setTotalLessons(attendance.totalLessons || 8);
            setAbsenceType(attendance.lessonsAbsent === attendance.totalLessons ? 'full' : 'partial');
        } else {
            // Значення за замовчуванням для нового запису
            setReasonType('other');
            setHasCertificate(false);
            setLessonsAbsent(0);
            setTotalLessons(8);
            setAbsenceType('full');
        }
    }, [attendance, show]);

    if (!show) return null;

    const handleSave = () => {
        const attendanceData = {
            status: 'absent',
            reasonType,
            lessonsAbsent: absenceType === 'full' ? totalLessons : lessonsAbsent,
            totalLessons,
            certificate: hasCertificate ? { has: true } : null
        };
        onSave(attendanceData);
    };

    const getReasonTypeLabel = (type) => {
        switch (type) {
            case 'sick': return 'Хвороба';
            case 'family': return 'Сімейні обставини';
            default: return 'Інша причина';
        }
    };

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
                width: isMobile ? '95%' : '500px',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                {/* Заголовок */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: 0 }}>
                        Відсутність учня
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

                {/* Інформація про учня та дату */}
                <div style={{
                    backgroundColor: '#f0f9ff',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                        {studentName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#0369a1' }}>
                        {date?.formatted} ({date?.dayName})
                    </div>
                </div>

                {/* Тип відсутності */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Тип відсутності:
                    </label>
                    <div style={{
                        display: 'flex',
                        gap: '10px'
                    }}>
                        <button
                            onClick={() => setAbsenceType('full')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: `2px solid ${absenceType === 'full' ? '#ef4444' : '#e5e7eb'}`,
                                borderRadius: '8px',
                                backgroundColor: absenceType === 'full' ? '#fee2e2' : 'white',
                                color: absenceType === 'full' ? '#dc2626' : '#374151',
                                cursor: 'pointer',
                                fontWeight: absenceType === 'full' ? '600' : 'normal'
                            }}
                        >
                            Повна відсутність
                        </button>
                        <button
                            onClick={() => setAbsenceType('partial')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: `2px solid ${absenceType === 'partial' ? '#f59e0b' : '#e5e7eb'}`,
                                borderRadius: '8px',
                                backgroundColor: absenceType === 'partial' ? '#fffbeb' : 'white',
                                color: absenceType === 'partial' ? '#d97706' : '#374151',
                                cursor: 'pointer',
                                fontWeight: absenceType === 'partial' ? '600' : 'normal'
                            }}
                        >
                            Часткова відсутність
                        </button>
                    </div>
                </div>

                {/* Кількість уроків (для часткової відсутності) */}
                {absenceType === 'partial' && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Кількість пропущених уроків:
                        </label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="number"
                                min="1"
                                max={totalLessons}
                                value={lessonsAbsent}
                                onChange={(e) => setLessonsAbsent(parseInt(e.target.value) || 0)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px'
                                }}
                            />
                            <span>з</span>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={totalLessons}
                                onChange={(e) => setTotalLessons(parseInt(e.target.value) || 1)}
                                style={{
                                    width: '80px',
                                    padding: '10px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px'
                                }}
                            />
                            <span>уроків</span>
                        </div>
                    </div>
                )}

                {/* Причина відсутності (спрощена) */}
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
                                    fontWeight: reasonType === option.type ? '600' : 'normal'
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>{option.icon}</span>
                                <span style={{ fontSize: '12px' }}>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Довідка/записка */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '10px',
                        cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            checked={hasCertificate}
                            onChange={(e) => setHasCertificate(e.target.checked)}
                        />
                        <FaFileMedical style={{ color: hasCertificate ? '#10b981' : '#9ca3af' }} />
                        <span style={{ fontWeight: '500' }}>
                            {reasonType === 'sick' ? 'Медична довідка' : 'Записка від батьків'}
                        </span>
                    </label>
                </div>

                {/* Кнопки */}
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