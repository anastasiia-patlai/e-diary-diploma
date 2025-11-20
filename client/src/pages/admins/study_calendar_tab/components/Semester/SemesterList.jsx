import React from 'react';
import { FaEdit, FaTrash, FaCalendar, FaSchool, FaCheck, FaTimes } from 'react-icons/fa';

const SemesterList = ({ semesters, onEdit, onDelete, onToggleActive }) => {
    if (semesters.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
            }}>
                <FaSchool size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>Семестри ще не додані</p>
                <p style={{ fontSize: '14px' }}>Додайте перший семестр для початку роботи</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {semesters.map(semester => (
                <div key={semester._id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: semester.isActive ? '#f0f9ff' : '#ffffff',
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
                                backgroundColor: semester.isActive ? 'rgba(105, 180, 185, 0.2)' : '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: semester.isActive ? 'rgba(105, 180, 185, 1)' : '#6b7280',
                                flexShrink: 0
                            }}>
                                <FaSchool />
                            </div>
                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '4px'
                                }}>
                                    <h4 style={{ margin: 0, fontSize: '16px' }}>
                                        {semester.name}
                                    </h4>
                                    {semester.isActive && (
                                        <span style={{
                                            backgroundColor: 'rgba(105, 180, 185, 1)',
                                            color: 'white',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            Активний
                                        </span>
                                    )}
                                </div>
                                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                                    Навчальний рік: {semester.year}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={() => onToggleActive(semester)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: semester.isActive ? '#6b7280' : 'rgba(105, 180, 185, 1)',
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
                                    {semester.isActive ? <FaTimes size={10} /> : <FaCheck size={10} />}
                                    {semester.isActive ? 'Деактивувати' : 'Активувати'}
                                </button>
                                <button
                                    onClick={() => onEdit(semester)}
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
                                    <FaEdit size={10} />
                                    Редагувати
                                </button>
                                <button
                                    onClick={() => onDelete(semester)}
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
                                    <FaTrash size={10} />
                                    Видалити
                                </button>
                            </div>
                            {semester.isActive && (
                                <div style={{
                                    fontSize: '11px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontWeight: '500',
                                    marginTop: '4px'
                                }}>
                                    Поточний активний семестр
                                </div>
                            )}
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
                            Початок: {new Date(semester.startDate).toLocaleDateString('uk-UA')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaCalendar size={12} />
                            Кінець: {new Date(semester.endDate).toLocaleDateString('uk-UA')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaCalendar size={12} />
                            Тривалість: {calculateDuration(semester.startDate, semester.endDate)} днів
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ДЛЯ ВИЗНАЧЕННЯ ТРИВАЛОСТІ СЕМЕСТРУ
const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
};

export default SemesterList;