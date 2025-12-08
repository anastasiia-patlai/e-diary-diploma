import React from 'react';
import { FaEdit, FaTrash, FaCalendar, FaSchool, FaCheck, FaTimes } from 'react-icons/fa';

const SemesterList = ({ semesters, onEdit, onDelete, onToggleActive, isMobile = false }) => {
    if (semesters.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: isMobile ? '30px 20px' : '40px',
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                margin: isMobile ? '10px 0' : '0'
            }}>
                <FaSchool size={isMobile ? 36 : 48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ fontSize: isMobile ? '14px' : '16px', marginBottom: '8px' }}>Семестри ще не додані</p>
                <p style={{ fontSize: isMobile ? '12px' : '14px', opacity: 0.7 }}>Додайте перший семестр для початку роботи</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px' }}>
            {semesters.map(semester => (
                <div key={semester._id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: isMobile ? '12px' : '16px',
                    backgroundColor: semester.isActive ? '#f0f9ff' : '#ffffff',
                    transition: 'all 0.2s'
                }}>
                    {/* ВЕРХНЯ ЧАСТИНА: ІКОНКА ТА НАЗВА СЕМЕСТРА */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: isMobile ? '8px' : '12px',
                        marginBottom: isMobile ? '10px' : '12px'
                    }}>
                        <div style={{
                            width: isMobile ? '32px' : '40px',
                            height: isMobile ? '32px' : '40px',
                            borderRadius: '8px',
                            backgroundColor: semester.isActive ? 'rgba(105, 180, 185, 0.2)' : '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: semester.isActive ? 'rgba(105, 180, 185, 1)' : '#6b7280',
                            flexShrink: 0
                        }}>
                            <FaSchool size={isMobile ? 14 : 16} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px',
                                flexWrap: 'wrap'
                            }}>
                                <h4 style={{
                                    margin: 0,
                                    fontSize: isMobile ? '14px' : '16px',
                                    fontWeight: '600',
                                    lineHeight: '1.3'
                                }}>
                                    {semester.name} • {semester.year}
                                </h4>
                                {semester.isActive && (
                                    <span style={{
                                        backgroundColor: 'rgba(105, 180, 185, 1)',
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: isMobile ? '10px' : '12px',
                                        fontWeight: '500'
                                    }}>
                                        Активний
                                    </span>
                                )}
                            </div>

                            {/* ДАТИ ДЛЯ ДЕСКТОПА */}
                            {!isMobile && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    color: '#6b7280',
                                    fontSize: '13px',
                                    flexWrap: 'wrap'
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <FaCalendar size={12} />
                                        {new Date(semester.startDate).toLocaleDateString('uk-UA')}
                                    </span>
                                    <span style={{ color: '#d1d5db' }}>→</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <FaCalendar size={12} />
                                        {new Date(semester.endDate).toLocaleDateString('uk-UA')}
                                    </span>
                                    <span style={{ color: '#d1d5db' }}>•</span>
                                    <span>
                                        {calculateDuration(semester.startDate, semester.endDate)} днів
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* КНОПКИ В ОДНІЙ ЛІНІЇ */}
                    <div style={{
                        display: 'flex',
                        gap: isMobile ? '8px' : '10px',
                        marginBottom: isMobile ? '12px' : '0'
                    }}>
                        <button
                            onClick={() => onToggleActive(semester)}
                            style={{
                                flex: 1,
                                padding: isMobile ? '8px 6px' : '8px 12px',
                                backgroundColor: semester.isActive ? '#6b7280' : 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: isMobile ? '12px' : '13px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                minHeight: isMobile ? '36px' : 'auto'
                            }}
                        >
                            {semester.isActive ? (
                                <>
                                    <FaTimes size={isMobile ? 12 : 14} />
                                    Деактивувати
                                </>
                            ) : (
                                <>
                                    <FaCheck size={isMobile ? 12 : 14} />
                                    Активувати
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => onEdit(semester)}
                            style={{
                                flex: 1,
                                padding: isMobile ? '8px 6px' : '8px 12px',
                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: isMobile ? '12px' : '13px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                minHeight: isMobile ? '36px' : 'auto'
                            }}
                        >
                            <FaEdit size={isMobile ? 12 : 14} />
                            Редагувати
                        </button>

                        <button
                            onClick={() => onDelete(semester)}
                            style={{
                                flex: 1,
                                padding: isMobile ? '8px 6px' : '8px 12px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: isMobile ? '12px' : '13px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                minHeight: isMobile ? '36px' : 'auto'
                            }}
                        >
                            <FaTrash size={isMobile ? 12 : 14} />
                            Видалити
                        </button>
                    </div>

                    {/* НИЖНЯ ЧАСТИНА З ДАТАМИ (ТІЛЬКИ ДЛЯ МОБІЛЬНИХ) */}
                    {isMobile && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            paddingTop: '10px',
                            borderTop: '1px solid #f3f4f6',
                            fontSize: '13px',
                            color: '#6b7280'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaCalendar size={12} />
                                    <span>Початок:</span>
                                </div>
                                <span style={{ fontWeight: '500' }}>
                                    {new Date(semester.startDate).toLocaleDateString('uk-UA')}
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaCalendar size={12} />
                                    <span>Кінець:</span>
                                </div>
                                <span style={{ fontWeight: '500' }}>
                                    {new Date(semester.endDate).toLocaleDateString('uk-UA')}
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                marginTop: '4px',
                                paddingTop: '6px',
                                borderTop: '1px solid #f3f4f6'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaCalendar size={12} />
                                    <span>Тривалість:</span>
                                </div>
                                <span style={{ fontWeight: '500' }}>
                                    {calculateDuration(semester.startDate, semester.endDate)} днів
                                </span>
                            </div>

                            {semester.isActive && (
                                <div style={{
                                    backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                    color: 'rgba(105, 180, 185, 1)',
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    textAlign: 'center',
                                    marginTop: '8px'
                                }}>
                                    Поточний активний семестр
                                </div>
                            )}
                        </div>
                    )}

                    {/* ДЛЯ ДЕСКТОПА: ПОКАЗАТЕЛЬ АКТИВНОГО СЕМЕСТРА */}
                    {!isMobile && semester.isActive && (
                        <div style={{
                            fontSize: '12px',
                            color: 'rgba(105, 180, 185, 1)',
                            fontWeight: '500',
                            textAlign: 'center',
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: '1px solid #f3f4f6'
                        }}>
                            Поточний активний семестр
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
};

export default SemesterList;