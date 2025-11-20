import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendar } from 'react-icons/fa';

const SemesterForm = ({ semester, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        year: '',
        startDate: '',
        endDate: '',
        isActive: false
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Отримуємо поточний рік
    const getCurrentYear = () => {
        return new Date().getFullYear();
    };

    useEffect(() => {
        const currentYear = getCurrentYear();
        const defaultYear = `${currentYear}-${currentYear + 1}`;

        if (semester) {
            const formatDate = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            };

            setFormData({
                name: semester.name || '',
                year: semester.year || defaultYear,
                startDate: formatDate(semester.startDate),
                endDate: formatDate(semester.endDate),
                isActive: semester.isActive || false
            });
        } else {
            setFormData(prev => ({
                ...prev,
                year: defaultYear
            }));
        }
    }, [semester]);

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Назва обов\'язкова';

        if (!formData.year.trim()) {
            newErrors.year = 'Рік обов\'язковий';
        } else if (!/^\d{4}-\d{4}$/.test(formData.year)) {
            newErrors.year = 'Формат року: XXXX-XXXX (наприклад, 2024-2025)';
        }

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const submitData = {
                name: formData.name,
                year: formData.year,
                startDate: formData.startDate,
                endDate: formData.endDate,
                isActive: formData.isActive
            };

            console.log('Відправляємо дані:', submitData);

            await onSubmit(submitData);
        } catch (err) {
            console.error('Помилка в формі:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const generateYearOptions = () => {
        const currentYear = getCurrentYear();
        const options = [];

        for (let i = -1; i <= 1; i++) {
            const startYear = currentYear + i;
            const endYear = startYear + 1;
            const yearValue = `${startYear}-${endYear}`;
            options.push(yearValue);
        }

        return options;
    };

    const yearOptions = generateYearOptions();

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
                        <FaCalendar />
                        {semester ? 'Редагувати семестр' : 'Додати семестр'}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '20px',
                            color: '#6b7280'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Назва семестру */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                            Назва семестру *
                        </label>
                        <select
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${errors.name ? '#dc2626' : '#d1d5db'}`,
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: loading ? '#f9fafb' : 'white'
                            }}
                        >
                            <option value="">Оберіть семестр</option>
                            <option value="I. Осінньо-зимовий">I. Осінньо-зимовий семестр</option>
                            <option value="II. Зимово-весняний">II. Зимово-весняний семестр</option>
                        </select>
                        {errors.name && (
                            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                {errors.name}
                            </div>
                        )}
                    </div>

                    {/* Рік */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                            Навчальний рік *
                        </label>
                        <select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${errors.year ? '#dc2626' : '#d1d5db'}`,
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: loading ? '#f9fafb' : 'white'
                            }}
                        >
                            <option value="">Оберіть навчальний рік</option>
                            {yearOptions.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        {errors.year && (
                            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                {errors.year}
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
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${errors.startDate ? '#dc2626' : '#d1d5db'}`,
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: loading ? '#f9fafb' : 'white'
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
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${errors.endDate ? '#dc2626' : '#d1d5db'}`,
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: loading ? '#f9fafb' : 'white'
                            }}
                        />
                        {errors.endDate && (
                            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                {errors.endDate}
                            </div>
                        )}
                    </div>

                    {/* Активний семестр */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                disabled={loading}
                                style={{ width: '16px', height: '16px' }}
                            />
                            <span style={{ fontWeight: '500' }}>Активний семестр</span>
                        </label>
                    </div>

                    {/* Кнопки */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: loading ? '#d1d5db' : '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: loading ? '#d1d5db' : 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            {loading ? 'Збереження...' : (semester ? 'Оновити' : 'Додати')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SemesterForm;