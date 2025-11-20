import React, { useState, useEffect } from 'react';
import { FaTimes, FaList } from 'react-icons/fa';

const QuarterForm = ({ quarter, semesters, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        semester: '',
        number: '',
        name: '',
        startDate: '',
        endDate: '',
        isActive: false
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (quarter) {
            setFormData({
                semester: quarter.semester?._id || quarter.semester,
                number: quarter.number.toString(),
                name: quarter.name,
                startDate: quarter.startDate.split('T')[0],
                endDate: quarter.endDate.split('T')[0],
                isActive: quarter.isActive
            });
        }
    }, [quarter]);

    const validate = () => {
        const newErrors = {};

        if (!formData.semester) newErrors.semester = 'Семестр обов\'язковий';
        if (!formData.number) newErrors.number = 'Номер чверті обов\'язковий';
        if (!formData.name) newErrors.name = 'Назва обов\'язкова';
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
            onSubmit({
                ...formData,
                number: parseInt(formData.number)
            });
        } else {
            setErrors(newErrors);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const getQuarterName = (number) => {
        const names = {
            1: 'I чверть',
            2: 'II чверть',
            3: 'III чверть',
            4: 'IV чверть'
        };
        return names[number] || '';
    };

    // Автоматично встановлюємо назву при зміні номера
    useEffect(() => {
        if (formData.number && !quarter) {
            setFormData(prev => ({
                ...prev,
                name: getQuarterName(parseInt(formData.number))
            }));
        }
    }, [formData.number, quarter]);

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
                        <FaList />
                        {quarter ? 'Редагувати чверть' : 'Додати чверть'}
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
                    {/* Семестр */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                            Семестр *
                        </label>
                        <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${errors.semester ? '#dc2626' : '#d1d5db'}`,
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Оберіть семестр</option>
                            {semesters.map(semester => (
                                <option key={semester._id} value={semester._id}>
                                    {semester.name} {semester.year}
                                </option>
                            ))}
                        </select>
                        {errors.semester && (
                            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                {errors.semester}
                            </div>
                        )}
                    </div>

                    {/* Номер чверті */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                            Номер чверті *
                        </label>
                        <select
                            name="number"
                            value={formData.number}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${errors.number ? '#dc2626' : '#d1d5db'}`,
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Оберіть номер</option>
                            <option value="1">I чверть</option>
                            <option value="2">II чверть</option>
                            <option value="3">III чверть</option>
                            <option value="4">IV чверть</option>
                        </select>
                        {errors.number && (
                            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                {errors.number}
                            </div>
                        )}
                    </div>

                    {/* Назва чверті */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                            Назва чверті *
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
                    <div style={{ marginBottom: '20px' }}>
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

                    {/* Активна чверть */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                style={{ width: '16px', height: '16px' }}
                            />
                            <span style={{ fontWeight: '500' }}>Активна чверть</span>
                        </label>
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
                            {quarter ? 'Оновити' : 'Додати'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuarterForm; 