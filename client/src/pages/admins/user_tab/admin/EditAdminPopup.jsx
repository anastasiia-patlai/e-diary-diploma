import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaPhone, FaEnvelope, FaBriefcase, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';

const EditAdminPopup = ({ admin, databaseName, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        jobPosition: '',
        dateOfBirth: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (admin) {
            const formattedDate = admin.dateOfBirth
                ? new Date(admin.dateOfBirth).toISOString().split('T')[0]
                : '';

            setFormData({
                fullName: admin.fullName || '',
                phone: admin.phone || '',
                email: admin.email || '',
                jobPosition: admin.jobPosition || '',
                dateOfBirth: formattedDate
            });
        }
    }, [admin]);

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'fullName':
                if (!value.trim()) error = 'ПІБ обов\'язкове поле';
                break;
            case 'phone':
                if (!/^\+380\d{9}$/.test(value)) error = 'Телефон у форматі +380XXXXXXXXX';
                break;
            case 'email':
                if (!/\S+@\S+\.\S+/.test(value)) error = 'Некоректна електронна адреса';
                break;
            case 'jobPosition':
                if (!value.trim()) error = 'Посада обов\'язкова';
                break;
            case 'dateOfBirth':
                if (!value) error = 'Дата народження обов\'язкова';
                else {
                    const birthDate = new Date(value);
                    const today = new Date();
                    const minDate = new Date();
                    minDate.setFullYear(today.getFullYear() - 100);

                    if (birthDate > today) {
                        error = 'Дата народження не може бути у майбутньому';
                    } else if (birthDate < minDate) {
                        error = 'Дата народження не може бути більше 100 років тому';
                    }
                }
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!databaseName) {
            setErrors({ submit: 'Не вказано базу даних' });
            return;
        }

        const newErrors = {};
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put(`http://localhost:3001/api/users/admin/${admin._id}`,
                formData,
                {
                    params: { databaseName }
                }
            );

            setSuccessMessage('Адміністратора успішно оновлено');

            setTimeout(() => {
                onUpdate(response.data.admin);
                onClose();
            }, 1500);

        } catch (err) {
            console.error('Помилка оновлення адміністратора:', err);
            setErrors({ submit: err.response?.data?.error || 'Помилка оновлення адміністратора' });
        } finally {
            setLoading(false);
        }
    };

    const getInputClass = (name) => {
        if (errors[name]) return 'form-control is-invalid';
        if (formData[name] && !errors[name]) return 'form-control is-valid';
        return 'form-control';
    };

    const getMinMaxDates = () => {
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 100);

        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 18);

        return {
            min: minDate.toISOString().split('T')[0],
            max: maxDate.toISOString().split('T')[0]
        };
    };

    const { min, max } = getMinMaxDates();

    if (!admin) return null;

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
                position: 'relative',
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '25px',
                width: '500px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#666'
                    }}
                >
                    <FaTimes />
                </button>

                <h4 className="text-center mb-4">Редагувати адміністратора</h4>

                {/* {databaseName && (
                    <div style={{
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '15px',
                        padding: '5px 10px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        textAlign: 'center'
                    }}>
                        База даних: {databaseName}
                    </div>
                )} */}

                {/* ПОВІДОМЛЕННЯ ПРО УСПІХ*/}
                {successMessage && (
                    <div className="alert alert-success" role="alert">
                        {successMessage}
                    </div>
                )}

                {/* ЗАГАЛЬНА ПОМИЛКА */}
                {errors.submit && (
                    <div className="alert alert-danger" role="alert">
                        {errors.submit}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">
                            <FaUser className="me-2" />
                            ПІБ
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            className={getInputClass('fullName')}
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Введіть ПІБ"
                            required
                        />
                        <div className="invalid-feedback">{errors.fullName}</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            <FaPhone className="me-2" />
                            Телефон
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            className={getInputClass('phone')}
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+380XXXXXXXXX"
                            required
                        />
                        <div className="invalid-feedback">{errors.phone}</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            <FaEnvelope className="me-2" />
                            Електронна пошта
                        </label>
                        <input
                            type="email"
                            name="email"
                            className={getInputClass('email')}
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="email@example.com"
                            required
                        />
                        <div className="invalid-feedback">{errors.email}</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            <FaBriefcase className="me-2" />
                            Посада
                        </label>
                        <input
                            type="text"
                            name="jobPosition"
                            className={getInputClass('jobPosition')}
                            value={formData.jobPosition}
                            onChange={handleChange}
                            placeholder="Введіть посаду"
                            required
                        />
                        <div className="invalid-feedback">{errors.jobPosition}</div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label">
                            <FaCalendarAlt className="me-2" />
                            Дата народження
                        </label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            className={getInputClass('dateOfBirth')}
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            min={min}
                            max={max}
                            required
                        />
                        <div className="invalid-feedback">{errors.dateOfBirth}</div>
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-fill"
                            disabled={loading}
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-fill"
                            disabled={loading}
                            style={{
                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                borderColor: 'rgba(105, 180, 185, 1)'
                            }}
                        >
                            {loading ? 'Оновлення...' : 'Оновити'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAdminPopup;