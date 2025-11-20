import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendar } from 'react-icons/fa';

const QuarterForm = ({ quarter, semesters, onClose, onSubmit }) => {
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

    // Автоматично генеруємо назву при зміні номера
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
                            onBlur={handleBlur}
                            className={getSelectClass('semester')}
                        >
                            <option value="">Оберіть семестр</option>
                            {semesters.map(semester => (
                                <option key={semester._id} value={semester._id}>
                                    {semester.name} {semester.year}
                                </option>
                            ))}
                        </select>
                        <div className="invalid-feedback" style={{ display: 'block', fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                            {errors.semester}
                        </div>
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
                            onBlur={handleBlur}
                            className={getSelectClass('number')}
                        >
                            <option value="">Оберіть номер</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                        <div className="invalid-feedback" style={{ display: 'block', fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                            {errors.number}
                        </div>
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
                            onBlur={handleBlur}
                            className={getInputClass('name')}
                            readOnly={!quarter} // Тільки для редагування можна змінювати назву
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
                            {quarter ? 'Оновити' : 'Додати'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuarterForm;