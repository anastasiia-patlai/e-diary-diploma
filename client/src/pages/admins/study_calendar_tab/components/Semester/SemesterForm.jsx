import React, { useState, useEffect } from 'react';
import { FaTimes, FaSchool } from 'react-icons/fa';

const SemesterForm = ({ semester, onClose, onSubmit, isMobile = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        year: '',
        startDate: '',
        endDate: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (semester) {
            setFormData({
                name: semester.name || '',
                year: semester.year || '',
                startDate: semester.startDate ? semester.startDate.split('T')[0] : '',
                endDate: semester.endDate ? semester.endDate.split('T')[0] : ''
            });
        }
    }, [semester]);

    const validateField = (name, value) => {
        let error = '';
        const now = new Date();

        switch (name) {
            case 'name':
                if (!value) error = 'Назва семестру обов\'язкова';
                break;
            case 'year':
                if (!value) error = 'Навчальний рік обов\'язковий';
                else if (!/^\d{4}-\d{4}$/.test(value)) error = 'Формат року: XXXX-XXXX';
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

    const getInputClass = (name) => {
        if (!touched[name]) return '';
        if (errors[name]) return 'invalid';
        return 'valid';
    };

    const getSelectClass = (name) => {
        if (!touched[name]) return '';
        if (errors[name]) return 'invalid';
        return 'valid';
    };

    const inputStyle = (name) => ({
        width: '100%',
        padding: isMobile ? '10px 12px' : '12px 14px',
        border: `1px solid ${getInputClass(name) === 'invalid' ? '#dc2626' : getInputClass(name) === 'valid' ? '#10b981' : '#d1d5db'}`,
        borderRadius: '6px',
        fontSize: isMobile ? '14px' : '15px',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.2s'
    });

    const selectStyle = (name) => ({
        width: '100%',
        padding: isMobile ? '10px 12px' : '12px 14px',
        border: `1px solid ${getSelectClass(name) === 'invalid' ? '#dc2626' : getSelectClass(name) === 'valid' ? '#10b981' : '#d1d5db'}`,
        borderRadius: '6px',
        fontSize: isMobile ? '14px' : '15px',
        backgroundColor: 'white',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.2s'
    });

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
                        <FaSchool />
                        {semester ? 'Редагувати семестр' : 'Додати семестр'}
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

                <form onSubmit={handleSubmit}>
                    {/* Назва семестру */}
                    <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            Назва семестру *
                        </label>
                        <select
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={selectStyle('name')}
                        >
                            <option value="">Оберіть семестр</option>
                            <option value="I. Осінньо-зимовий">I. Осінньо-зимовий</option>
                            <option value="II. Зимово-весняний">II. Зимово-весняний</option>
                        </select>
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

                    {/* Навчальний рік */}
                    <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            Навчальний рік *
                        </label>
                        <input
                            type="text"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={inputStyle('year')}
                            placeholder="Напр. 2024-2025"
                        />
                        {errors.year && (
                            <div style={{
                                display: 'block',
                                fontSize: '12px',
                                color: '#dc2626',
                                marginTop: '4px'
                            }}>
                                {errors.year}
                            </div>
                        )}
                    </div>

                    {/* Дата початку */}
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

                    {/* Дата завершення */}
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

                    {/* Кнопки */}
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
                                fontSize: isMobile ? '14px' : '14px',
                                flex: isMobile ? '1' : '1'
                            }}
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: isMobile ? '12px' : '12px',
                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: isMobile ? '14px' : '14px',
                                flex: isMobile ? '1' : '1'
                            }}
                        >
                            {semester ? 'Оновити' : 'Додати'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SemesterForm;