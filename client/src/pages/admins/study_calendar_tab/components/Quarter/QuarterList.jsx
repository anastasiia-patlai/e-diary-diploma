import React from 'react';
import { FaEdit, FaTrash, FaCalendar, FaCheck, FaTimes } from 'react-icons/fa';

const QuarterList = ({ quarters, onEdit, onDelete, onToggleActive, compact = false, currentDate = new Date(), isSemesterActive = false, isMobile = false }) => {

    const getDateStatus = (startDate, endDate) => {
        const now = currentDate;
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (now < start) {
            return { status: 'майбутня', color: '#f59e0b' };
        } else if (now > end) {
            return { status: 'завершена', color: '#6b7280' };
        } else {
            return { status: 'поточна', color: '#10b981' };
        }
    };

    if (quarters.length === 0 && !compact) {
        return (
            <div style={{
                textAlign: 'center',
                padding: isMobile ? '30px 20px' : '40px',
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
            }}>
                <p style={{ fontSize: isMobile ? '14px' : '16px' }}>Чверті ще не додані</p>
                <p style={{ fontSize: isMobile ? '12px' : '14px' }}>Додайте першу чверть для початку роботи</p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: compact ? (isMobile ? '6px' : '8px') : (isMobile ? '8px' : '12px')
        }}>
            {quarters.map(quarter => {
                const dateStatus = getDateStatus(quarter.startDate, quarter.endDate);

                const canToggleActive = isSemesterActive &&
                    dateStatus.status !== 'завершена' &&
                    !(dateStatus.status === 'майбутня' && !quarter.isActive);

                return (
                    <div key={quarter._id} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: isMobile ? '12px' : (compact ? '12px' : '16px'),
                        backgroundColor: quarter.isActive ? '#f0f9ff' : '#ffffff',
                        transition: 'all 0.2s',
                        borderLeft: `4px solid ${dateStatus.color}`
                    }}>
                        {/* ВЕРХНЯ ЧАСТИНА: ІНФОРМАЦІЯ ПРО ЧВЕРТЬ */}
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between',
                            alignItems: isMobile ? 'flex-start' : 'flex-start',
                            marginBottom: isMobile ? '10px' : (compact ? '8px' : '12px'),
                            gap: isMobile ? '8px' : '0'
                        }}>
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
                                        fontSize: isMobile ? '14px' : (compact ? '14px' : '16px'),
                                        fontWeight: '600'
                                    }}>
                                        {quarter.name}
                                    </h4>
                                    {quarter.isActive && (
                                        <span style={{
                                            backgroundColor: 'rgba(105, 180, 185, 1)',
                                            color: 'white',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: isMobile ? '10px' : '12px',
                                            fontWeight: '500'
                                        }}>
                                            Активна
                                        </span>
                                    )}
                                    <span style={{
                                        backgroundColor: `${dateStatus.color}15`,
                                        color: dateStatus.color,
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: isMobile ? '10px' : '12px',
                                        fontWeight: '500',
                                        border: `1px solid ${dateStatus.color}30`
                                    }}>
                                        {dateStatus.status}
                                    </span>
                                    {!isSemesterActive && quarter.isActive && (
                                        <span style={{
                                            backgroundColor: '#fef3c7',
                                            color: '#d97706',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: isMobile ? '9px' : '10px',
                                            fontWeight: '500',
                                            border: '1px solid #f59e0b'
                                        }}>
                                            Семестр неактивний
                                        </span>
                                    )}
                                </div>
                                <p style={{
                                    margin: 0,
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: '#6b7280'
                                }}>
                                    Семестр: {quarter.semester?.name} {quarter.semester?.year}
                                </p>
                            </div>

                            {/* КНОПКИ УПРАВЛІННЯ */}
                            {!compact && (
                                <div style={{
                                    display: 'flex',
                                    gap: isMobile ? '6px' : '8px',
                                    flexShrink: 0,
                                    flexWrap: 'wrap',
                                    justifyContent: isMobile ? 'flex-start' : 'flex-end',
                                    width: isMobile ? '100%' : 'auto'
                                }}>
                                    <button
                                        onClick={() => onToggleActive(quarter)}
                                        disabled={!canToggleActive}
                                        style={{
                                            padding: isMobile ? '8px 10px' : '8px 12px',
                                            backgroundColor: !canToggleActive ? '#d1d5db' :
                                                quarter.isActive ? '#6b7280' : 'rgba(105, 180, 185, 1)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: !canToggleActive ? 'not-allowed' : 'pointer',
                                            fontSize: isMobile ? '12px' : '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            flex: isMobile ? '1' : '0'
                                        }}
                                        title={!canToggleActive ?
                                            (!isSemesterActive ? 'Семестр неактивний' :
                                                dateStatus.status === 'завершена' ?
                                                    'Не можна активувати завершену чверть' :
                                                    'Не можна активувати майбутню чверть') :
                                            ''}
                                    >
                                        {quarter.isActive ? <FaTimes size={isMobile ? 12 : 14} /> : <FaCheck size={isMobile ? 12 : 14} />}
                                        {isMobile ? (quarter.isActive ? 'Деакт.' : 'Акт.') : (quarter.isActive ? 'Деактивувати' : 'Активувати')}
                                    </button>
                                    <button
                                        onClick={() => onEdit(quarter)}
                                        style={{
                                            padding: isMobile ? '8px 10px' : '8px 12px',
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
                                            flex: isMobile ? '1' : '0'
                                        }}
                                    >
                                        <FaEdit size={isMobile ? 12 : 14} />
                                        {isMobile ? 'Ред.' : 'Редагувати'}
                                    </button>
                                    <button
                                        onClick={() => onDelete(quarter._id)}
                                        style={{
                                            padding: isMobile ? '8px 10px' : '8px 12px',
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
                                            flex: isMobile ? '1' : '0'
                                        }}
                                    >
                                        <FaTrash size={isMobile ? 12 : 14} />
                                        {isMobile ? 'Вид.' : 'Видалити'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ДАТИ */}
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? '6px' : '12px',
                            paddingTop: isMobile ? '8px' : '10px',
                            borderTop: '1px solid #f3f4f6',
                            fontSize: isMobile ? '12px' : '13px',
                            color: '#6b7280'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                flexWrap: 'wrap'
                            }}>
                                <FaCalendar size={isMobile ? 12 : 12} />
                                Початок: {new Date(quarter.startDate).toLocaleDateString('uk-UA')}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                flexWrap: 'wrap'
                            }}>
                                <FaCalendar size={isMobile ? 12 : 12} />
                                Кінець: {new Date(quarter.endDate).toLocaleDateString('uk-UA')}
                            </div>
                        </div>

                        {/* КНОПКИ ДЛЯ COMPACT ВЕРСІЇ */}
                        {compact && (
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginTop: '10px',
                                paddingTop: '10px',
                                borderTop: '1px solid #f3f4f6'
                            }}>
                                <button
                                    onClick={() => onToggleActive(quarter)}
                                    disabled={!canToggleActive}
                                    style={{
                                        flex: 1,
                                        padding: '6px 8px',
                                        backgroundColor: !canToggleActive ? '#d1d5db' :
                                            quarter.isActive ? '#6b7280' : 'rgba(105, 180, 185, 1)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: !canToggleActive ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    {quarter.isActive ? <FaTimes size={12} /> : <FaCheck size={12} />}
                                    {quarter.isActive ? 'Деакт.' : 'Акт.'}
                                </button>
                                <button
                                    onClick={() => onEdit(quarter)}
                                    style={{
                                        flex: 1,
                                        padding: '6px 8px',
                                        backgroundColor: 'rgba(105, 180, 185, 1)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <FaEdit size={12} />
                                    Ред.
                                </button>
                                <button
                                    onClick={() => onDelete(quarter._id)}
                                    style={{
                                        flex: 1,
                                        padding: '6px 8px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <FaTrash size={12} />
                                    Вид.
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default QuarterList;