import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendar } from 'react-icons/fa';

const QuarterForm = ({ quarter, semesters, onClose, onSubmit, isMobile = false }) => {
    const [formData, setFormData] = useState({
        semester: '',
        number: '',
        name: '',
        startDate: '',
        endDate: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (quarter) {
            setFormData({
                semester: quarter.semester?._id || '',
                number: quarter.number || '',
                name: quarter.name || '',
                startDate: quarter.startDate ? quarter.startDate.split('T')[0] : '',
                endDate: quarter.endDate ? quarter.endDate.split('T')[0] : ''
            });
        }
    }, [quarter]);

    const validateField = (name, value) => {
        let error = '';
        const now = new Date();

        switch (name) {
            case 'semester':
                if (!value) error = 'Семестр обов\'язковий';
                break;
            case 'number':
                if (!value) error = 'Номер чверті обов\'язковий';
                else if (value < 1 || value > 4) error = 'Номер чверті має бути від 1 до 4';
                break;
            case 'name':
                if (!value) error = 'Назва чверті обов\'язкова';
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
        if (formData.number && !quarter) {
            const quarterNames = {
                1: 'I чверть',
                2: 'II чверть',
                3: 'III чверть',
                4: 'IV чверть'
            };
            setFormData(prev => ({
                ...prev,
                name: quarterNames[formData.number] || ''
            }));
        }
    }, [formData.number, quarter]);

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
        backgroundColor: name === 'name' && !quarter ? '#f9fafb' : 'white'
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
                        <FaCalendar />
                        {quarter ? 'Редагувати чверть' : 'Додати чверть'}
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
                    {/* СЕМЕСТР */}
                    <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            Семестр *
                        </label>
                        <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={selectStyle('semester')}
                        >
                            <option value="">Оберіть семестр</option>
                            {semesters.map(semester => (
                                <option key={semester._id} value={semester._id}>
                                    {semester.name} {semester.year}
                                </option>
                            ))}
                        </select>
                        {errors.semester && (
                            <div style={{
                                display: 'block',
                                fontSize: '12px',
                                color: '#dc2626',
                                marginTop: '4px'
                            }}>
                                {errors.semester}
                            </div>
                        )}
                    </div>

                    {/* НОМЕР ЧВЕРТІ */}
                    <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            Номер чверті *
                        </label>
                        <select
                            name="number"
                            value={formData.number}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={selectStyle('number')}
                        >
                            <option value="">Оберіть номер</option>
                            <option value="1">I</option>
                            <option value="2">II</option>
                            <option value="3">III</option>
                            <option value="4">IV</option>
                        </select>
                        {errors.number && (
                            <div style={{
                                display: 'block',
                                fontSize: '12px',
                                color: '#dc2626',
                                marginTop: '4px'
                            }}>
                                {errors.number}
                            </div>
                        )}
                    </div>

                    {/* НАЗВА ЧВЕРТІ */}
                    <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            Назва чверті *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={inputStyle('name')}
                            readOnly={!quarter}
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

                    {/* ДАТА ПОЧАТКУ */}
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

                    {/* ДАТА ЗАВЕРШЕННЯ */}
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

                    {/* КНОПКИ */}
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
                            style={{
                                padding: isMobile ? '12px' : '12px',
                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: isMobile ? '14px' : '14px'
                            }}
                        >
                            {quarter ? 'Оновити' : 'Додати'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuarterForm;