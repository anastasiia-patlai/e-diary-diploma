import React, { useState, useEffect } from 'react';
import { FaTimes, FaUmbrellaBeach } from 'react-icons/fa';

const HolidayForm = ({ holiday, quarters, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        quarter: '',
        name: '',
        type: '',
        startDate: '',
        endDate: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (holiday) {
            setFormData({
                quarter: holiday.quarter?._id || '',
                name: holiday.name || '',
                type: holiday.type || '',
                startDate: holiday.startDate ? holiday.startDate.split('T')[0] : '',
                endDate: holiday.endDate ? holiday.endDate.split('T')[0] : ''
            });
        }
    }, [holiday]);

    const validate = () => {
        const newErrors = {};

        if (!formData.quarter) newErrors.quarter = 'Чверть обов\'язкова';
        if (!formData.name) newErrors.name = 'Назва обов\'язкова';
        if (!formData.type) newErrors.type = 'Тип канікул обов\'язковий';
        if (!formData.startDate) newErrors.startDate = 'Дата початку обов\'язкова';
        if (!formData.endDate) newErrors.endDate = 'Дата завершення обов\'язкова';

        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end <= start) {
                newErrors.endDate = 'Дата завершення має бути після дати початку';
            }
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validate();

        if (Object.keys(newErrors).length === 0) {
            onSubmit(formData);
        } else {
            setErrors(newErrors);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Автоматично встановлюємо назву при зміні типу
    useEffect(() => {
        if (formData.type && !holiday) {
            const typeNames = {
                'Осінні': 'Осінні канікули',
                'Зимові': 'Зимові канікули',
                'Весняні': 'Весняні канікули',
                'Літні': 'Літні канікули'
            };
            setFormData(prev => ({
                ...prev,
                name: typeNames[formData.type] || ''
            }));
        }
    }, [formData.type, holiday]);

    // Функція для отримання назви чверті з безпечним доступом
    const getQuarterDisplayName = (quarter) => {
        const quarterName = quarter?.name || 'Невідома чверть';
        const semesterName = quarter?.semester?.name || 'Невідомий семестр';
        const semesterYear = quarter?.semester?.year || 'Невідомий рік';

        return `${quarterName} (${semesterName} ${semesterYear})`;
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
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaUmbrellaBeach />
                        {holiday ? 'Редагувати канікули' : 'Додати канікули'}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '20px',
                            color: '#6b7280'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Чверть */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                            Чверть *
                        </label>
                        <select
                            name="quarter"
                            value={formData.quarter}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${errors.quarter ? '#dc2626' : '#d1d5db'}`,
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Оберіть чверть</option>
                            {quarters.map(quarter => (
                                <option key={quarter._id} value={quarter._id}>
                                    {getQuarterDisplayName(quarter)}
                                </option>
                            ))}
                        </select>
                        {errors.quarter && (
                            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                {errors.quarter}
                            </div>
                        )}
                    </div>

                    {/* Тип канікул */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                            Тип канікул *
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${errors.type ? '#dc2626' : '#d1d5db'}`,
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Оберіть тип</option>
                            <option value="Осінні">Осінні</option>
                            <option value="Зимові">Зимові</option>
                            <option value="Весняні">Весняні</option>
                            <option value="Літні">Літні</option>
                        </select>
                        {errors.type && (
                            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                {errors.type}
                            </div>
                        )}
                    </div>

                    {/* Назва канікул */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                            Назва канікул *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${errors.name ? '#dc2626' : '#d1d5db'}`,
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                        {errors.name && (
                            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                {errors.name}
                            </div>
                        )}
                    </div>

                    {/* Дата початку */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                            Дата початку *
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${errors.startDate ? '#dc2626' : '#d1d5db'}`,
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                        {errors.startDate && (
                            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                {errors.startDate}
                            </div>
                        )}
                    </div>

                    {/* Дата завершення */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                            Дата завершення *
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${errors.endDate ? '#dc2626' : '#d1d5db'}`,
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                        {errors.endDate && (
                            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                {errors.endDate}
                            </div>
                        )}
                    </div>

                    {/* Кнопки */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {holiday ? 'Оновити' : 'Додати'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HolidayForm;