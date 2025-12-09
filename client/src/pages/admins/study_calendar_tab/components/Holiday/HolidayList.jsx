import React from 'react';
import { FaEdit, FaTrash, FaCalendar, FaUmbrellaBeach } from 'react-icons/fa';

const HolidayList = ({ holidays, onEdit, onDelete, isMobile = false }) => {
    if (holidays.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: isMobile ? '30px 20px' : '40px',
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                margin: isMobile ? '10px 0' : '0'
            }}>
                <FaUmbrellaBeach size={isMobile ? 36 : 48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ fontSize: isMobile ? '14px' : '16px', marginBottom: '8px' }}>Канікули ще не додані</p>
                <p style={{ fontSize: isMobile ? '12px' : '14px', opacity: 0.7 }}>Додайте перші канікули для початку роботи</p>
            </div>
        );
    }

    const getHolidayColor = (type) => {
        const colors = {
            'Осінні': '#f59e0b',
            'Зимові': '#3b82f6',
            'Весняні': '#10b981',
            'Літні': '#ef4444'
        };
        return colors[type] || '#6b7280';
    };

    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'Невідома дата';
            const date = new Date(dateString);
            return date.toLocaleDateString('uk-UA');
        } catch (error) {
            console.error('Помилка форматування дати:', error);
            return 'Невідома дата';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px' }}>
            {holidays.map(holiday => {
                const quarterName = holiday.quarter?.name || 'Невідома чверть';
                const semesterName = holiday.quarter?.semester?.name || 'Невідомий семестр';
                const semesterYear = holiday.quarter?.semester?.year || 'Невідомий рік';

                return (
                    <div key={holiday._id} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: isMobile ? '12px' : '16px',
                        backgroundColor: '#ffffff',
                        transition: 'all 0.2s'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between',
                            alignItems: isMobile ? 'flex-start' : 'flex-start',
                            marginBottom: isMobile ? '10px' : '12px',
                            gap: isMobile ? '10px' : '0'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: isMobile ? '8px' : '12px',
                                flex: 1
                            }}>
                                <div style={{
                                    width: isMobile ? '32px' : '40px',
                                    height: isMobile ? '32px' : '40px',
                                    borderRadius: '8px',
                                    backgroundColor: `${getHolidayColor(holiday.type)}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: getHolidayColor(holiday.type),
                                    flexShrink: 0
                                }}>
                                    <FaUmbrellaBeach size={isMobile ? 14 : 16} />
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
                                            fontWeight: '600'
                                        }}>
                                            {holiday.name || 'Без назви'}
                                        </h4>
                                        <span style={{
                                            backgroundColor: `${getHolidayColor(holiday.type)}20`,
                                            color: getHolidayColor(holiday.type),
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: isMobile ? '10px' : '12px',
                                            fontWeight: '500'
                                        }}>
                                            {holiday.type || 'Невідомий тип'}
                                        </span>
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        color: '#6b7280',
                                        fontSize: isMobile ? '12px' : '14px'
                                    }}>
                                        {quarterName} • {semesterName} {semesterYear}
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: isMobile ? '6px' : '8px',
                                width: isMobile ? '100%' : 'auto'
                            }}>
                                <button
                                    onClick={() => onEdit(holiday)}
                                    style={{
                                        padding: isMobile ? '8px 12px' : '8px 12px',
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
                                    onClick={() => onDelete(holiday._id)}
                                    style={{
                                        padding: isMobile ? '8px 12px' : '8px 12px',
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
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? '8px' : '16px',
                            paddingTop: isMobile ? '10px' : '12px',
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
                                Початок: {formatDate(holiday.startDate)}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                flexWrap: 'wrap'
                            }}>
                                <FaCalendar size={isMobile ? 12 : 12} />
                                Кінець: {formatDate(holiday.endDate)}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                flexWrap: 'wrap',
                                color: getHolidayColor(holiday.type),
                                fontWeight: '500'
                            }}>
                                <FaUmbrellaBeach size={isMobile ? 12 : 12} />
                                Тривалість: {calculateDuration(holiday.startDate, holiday.endDate)} днів
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const calculateDuration = (startDate, endDate) => {
    try {
        if (!startDate || !endDate) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return 0;
        }

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    } catch (error) {
        console.error('Помилка розрахунку тривалості:', error);
        return 0;
    }
};

export default HolidayList;