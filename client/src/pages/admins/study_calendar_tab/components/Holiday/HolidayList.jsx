import React from 'react';
import { FaEdit, FaTrash, FaCalendar, FaUmbrellaBeach } from 'react-icons/fa';

const HolidayList = ({ holidays, onEdit, onDelete }) => {
    if (holidays.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
            }}>
                <FaUmbrellaBeach size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>Канікули ще не додані</p>
                <p style={{ fontSize: '14px' }}>Додайте перші канікули для початку роботи</p>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {holidays.map(holiday => {
                const quarterName = holiday.quarter?.name || 'Невідома чверть';
                const semesterName = holiday.quarter?.semester?.name || 'Невідомий семестр';
                const semesterYear = holiday.quarter?.semester?.year || 'Невідомий рік';

                return (
                    <div key={holiday._id} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        backgroundColor: '#ffffff',
                        transition: 'all 0.2s'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '12px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    backgroundColor: `${getHolidayColor(holiday.type)}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: getHolidayColor(holiday.type),
                                    flexShrink: 0
                                }}>
                                    <FaUmbrellaBeach />
                                </div>
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '4px'
                                    }}>
                                        <h4 style={{ margin: 0, fontSize: '16px' }}>
                                            {holiday.name || 'Без назви'}
                                        </h4>
                                        <span style={{
                                            backgroundColor: `${getHolidayColor(holiday.type)}20`,
                                            color: getHolidayColor(holiday.type),
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            {holiday.type || 'Невідомий тип'}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                                        {quarterName} • {semesterName} {semesterYear}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={() => onEdit(holiday)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: 'rgba(105, 180, 185, 1)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <FaEdit size={12} />
                                    Редагувати
                                </button>
                                <button
                                    onClick={() => onDelete(holiday._id)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <FaTrash size={12} />
                                    Видалити
                                </button>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            paddingTop: '12px',
                            borderTop: '1px solid #f3f4f6',
                            fontSize: '13px',
                            color: '#6b7280',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaCalendar size={12} />
                                Початок: {formatDate(holiday.startDate)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaCalendar size={12} />
                                Кінець: {formatDate(holiday.endDate)}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: getHolidayColor(holiday.type),
                                fontWeight: '500'
                            }}>
                                <FaUmbrellaBeach size={12} />
                                Тривалість: {calculateDuration(holiday.startDate, holiday.endDate)} днів
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ФУНКЦІЯ РОЗРАХУНКУ ТРИВАЛОСТІ КАНІКУЛ
const calculateDuration = (startDate, endDate) => {
    try {
        if (!startDate || !endDate) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Перевірка на коректність дат
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return 0;
        }

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 для включення початкової дати
        return diffDays;
    } catch (error) {
        console.error('Помилка розрахунку тривалості:', error);
        return 0;
    }
};

export default HolidayList;