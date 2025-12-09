import React, { useState, useEffect } from 'react';
import { FaTimes, FaUmbrellaBeach } from 'react-icons/fa';

const HolidayForm = ({ holiday, quarters, onClose, onSubmit, isMobile = false }) => {
    const [formData, setFormData] = useState({
        quarter: '',
        name: '',
        type: '',
        startDate: '',
        endDate: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [enrichedQuarters, setEnrichedQuarters] = useState([]);

    useEffect(() => {
        if (quarters && quarters.length > 0) {
            const validQuarters = quarters.filter(quarter =>
                quarter.semester &&
                quarter.semester.name &&
                quarter.semester.year
            );
            setEnrichedQuarters(validQuarters);
        }
    }, [quarters]);

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

    const validateField = (name, value) => {
        let error = '';
        const now = new Date();

        switch (name) {
            case 'quarter':
                if (!value) error = 'Чверть обов\'язкова';
                break;
            case 'name':
                if (!value) error = 'Назва канікул обов\'язкова';
                break;
            case 'type':
                if (!value) error = 'Тип канікул обов\'язковий';
                break;
            case 'startDate':
                if (!value) error = 'Дата початку обов\'язкова';
                else {
                    const startDate = new Date(value);
                    if (startDate < new Date(now.getFullYear() - 5, 0, 1)) {
                        error = 'Дата не може бути давніше 5 років';
                    }
                }
                break;
            case 'endDate':
                if (!value) error = 'Дата завершення обов\'язкова';
                else if (formData.startDate) {
                    const startDate = new Date(formData.startDate);
                    const endDate = new Date(value);
                    if (endDate <= startDate) {
                        error = 'Дата має бути після дати початку';
                    }
                }
                break;
            default:
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touched[name]) validateField(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

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

    const handleSubmit = (e) => {
        e.preventDefault();

        Object.keys(formData).forEach(field => {
            validateField(field, formData[field]);
            setTouched(prev => ({ ...prev, [field]: true }));
        });

        if (Object.values(errors).every(err => !err)) {
            onSubmit(formData);
        }
    };

    const inputStyle = (name) => ({
        width: '100%',
        padding: isMobile ? '10px 12px' : '12px 14px',
        border: `1px solid ${touched[name] ? (errors[name] ? '#dc2626' : '#10b981') : '#d1d5db'}`,
        borderRadius: '6px',
        fontSize: isMobile ? '14px' : '15px',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.2s',
        backgroundColor: name === 'name' && !holiday ? '#f9fafb' : 'white'
    });

    const selectStyle = (name) => ({
        width: '100%',
        padding: isMobile ? '10px 12px' : '12px 14px',
        border: `1px solid ${touched[name] ? (errors[name] ? '#dc2626' : '#10b981') : '#d1d5db'}`,
        borderRadius: '6px',
        fontSize: isMobile ? '14px' : '15px',
        backgroundColor: 'white',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.2s'
    });

    const getQuarterDisplayName = (quarter) => {
        if (!quarter.semester) {
            return `${quarter.name} (Невідомий семестр)`;
        }

        const semesterName = quarter.semester.name || 'Невідомий семестр';
        const semesterYear = quarter.semester.year || 'Невідомий рік';
        const isActive = quarter.isActive ? ' • Активна' : '';

        return `${quarter.name} • ${semesterName} ${semesterYear}${isActive}`;
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
            alignItems: isMobile ? 'flex-start' : 'center',
            zIndex: 1000,
            padding: isMobile ? '16px' : '0',
            overflowY: 'auto'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '24px',
                width: isMobile ? '100%' : '90%',
                maxWidth: '500px',
                maxHeight: isMobile ? 'calc(100vh - 32px)' : '90vh',
                overflowY: 'auto',
                marginTop: isMobile ? '0' : 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: isMobile ? '16px' : '20px'
                }}>
                    <h3 style={{
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: isMobile ? '16px' : '18px'
                    }}>
                        <FaUmbrellaBeach />
                        {holiday ? 'Редагувати канікули' : 'Додати канікули'}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: isMobile ? '18px' : '20px',
                            color: '#6b7280',
                            padding: '4px'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {enrichedQuarters.length === 0 && quarters.length > 0 && (
                    <div style={{
                        backgroundColor: '#fef3c7',
                        color: '#d97706',
                        padding: isMobile ? '10px 12px' : '12px',
                        borderRadius: '6px',
                        marginBottom: isMobile ? '12px' : '16px',
                        fontSize: isMobile ? '13px' : '14px'
                    }}>
                        Не знайдено чвертей з інформацією про семестри. Спробуйте оновити дані.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            Чверть *
                        </label>
                        <select
                            name="quarter"
                            value={formData.quarter}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={selectStyle('quarter')}
                            disabled={enrichedQuarters.length === 0}
                        >
                            <option value="">
                                {enrichedQuarters.length === 0 ? 'Немає доступних чвертей' : 'Оберіть чверть'}
                            </option>
                            {enrichedQuarters.map(quarter => (
                                <option key={quarter._id} value={quarter._id}>
                                    {isMobile ? `${quarter.name}` : getQuarterDisplayName(quarter)}
                                </option>
                            ))}
                        </select>
                        {errors.quarter && (
                            <div style={{
                                display: 'block',
                                fontSize: '12px',
                                color: '#dc2626',
                                marginTop: '4px'
                            }}>
                                {errors.quarter}
                            </div>
                        )}
                        {enrichedQuarters.length === 0 && quarters.length > 0 && (
                            <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginTop: '4px'
                            }}>
                                Переконайтеся, що чверті мають пов'язані семестри
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            Тип канікул *
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={selectStyle('type')}
                        >
                            <option value="">Оберіть тип</option>
                            <option value="Осінні">Осінні</option>
                            <option value="Зимові">Зимові</option>
                            <option value="Весняні">Весняні</option>
                            <option value="Літні">Літні</option>
                        </select>
                        {errors.type && (
                            <div style={{
                                display: 'block',
                                fontSize: '12px',
                                color: '#dc2626',
                                marginTop: '4px'
                            }}>
                                {errors.type}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            Назва канікул *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={inputStyle('name')}
                            placeholder="Наприклад: Осінні канікули"
                        />
                        {errors.name && (
                            <div style={{
                                display: 'block',
                                fontSize: '12px',
                                color: '#dc2626',
                                marginTop: '4px'
                            }}>
                                {errors.name}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            Дата початку *
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={inputStyle('startDate')}
                        />
                        {errors.startDate && (
                            <div style={{
                                display: 'block',
                                fontSize: '12px',
                                color: '#dc2626',
                                marginTop: '4px'
                            }}>
                                {errors.startDate}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            Дата завершення *
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={inputStyle('endDate')}
                        />
                        {errors.endDate && (
                            <div style={{
                                display: 'block',
                                fontSize: '12px',
                                color: '#dc2626',
                                marginTop: '4px'
                            }}>
                                {errors.endDate}
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        flexDirection: isMobile ? 'column' : 'row'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: isMobile ? '12px' : '12px',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: isMobile ? '14px' : '14px'
                            }}
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            disabled={enrichedQuarters.length === 0}
                            style={{
                                padding: isMobile ? '12px' : '12px',
                                backgroundColor: enrichedQuarters.length === 0 ? '#d1d5db' : 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: enrichedQuarters.length === 0 ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                fontSize: isMobile ? '14px' : '14px'
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