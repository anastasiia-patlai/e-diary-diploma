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
    const [touched, setTouched] = useState({});

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
                        error = 'Дата початку не може бути давніше 5 років';
                    }
                }
                break;
            case 'endDate':
                if (!value) error = 'Дата завершення обов\'язкова';
                else if (formData.startDate) {
                    const startDate = new Date(formData.startDate);
                    const endDate = new Date(value);
                    if (endDate <= startDate) {
                        error = 'Дата завершення має бути після дати початку';
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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Валідуємо всі поля
        Object.keys(formData).forEach(field => {
            validateField(field, formData[field]);
            setTouched(prev => ({ ...prev, [field]: true }));
        });

        // Перевіряємо, чи немає помилок
        if (Object.values(errors).every(err => !err)) {
            onSubmit(formData);
        }
    };

    const getInputClass = (name) => {
        if (!touched[name]) return 'form-control';
        if (errors[name]) return 'form-control is-invalid';
        return 'form-control is-valid';
    };

    const getSelectClass = (name) => {
        if (!touched[name]) return 'form-select';
        if (errors[name]) return 'form-select is-invalid';
        return 'form-select is-valid';
    };

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
                            onBlur={handleBlur}
                            className={getSelectClass('quarter')}
                        >
                            <option value="">Оберіть чверть</option>
                            {quarters.map(quarter => (
                                <option key={quarter._id} value={quarter._id}>
                                    {getQuarterDisplayName(quarter)}
                                </option>
                            ))}
                        </select>
                        <div className="invalid-feedback" style={{ display: 'block', fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                            {errors.quarter}
                        </div>
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
                            onBlur={handleBlur}
                            className={getSelectClass('type')}
                        >
                            <option value="">Оберіть тип</option>
                            <option value="Осінні">Осінні</option>
                            <option value="Зимові">Зимові</option>
                            <option value="Весняні">Весняні</option>
                            <option value="Літні">Літні</option>
                        </select>
                        <div className="invalid-feedback" style={{ display: 'block', fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                            {errors.type}
                        </div>
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
                            onBlur={handleBlur}
                            className={getInputClass('name')}
                        />
                        <div className="invalid-feedback" style={{ display: 'block', fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                            {errors.name}
                        </div>
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
                            onBlur={handleBlur}
                            className={getInputClass('startDate')}
                        />
                        <div className="invalid-feedback" style={{ display: 'block', fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                            {errors.startDate}
                        </div>
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
                            onBlur={handleBlur}
                            className={getInputClass('endDate')}
                        />
                        <div className="invalid-feedback" style={{ display: 'block', fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                            {errors.endDate}
                        </div>
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