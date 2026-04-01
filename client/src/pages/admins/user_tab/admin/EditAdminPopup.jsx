import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaUser, FaPhone, FaEnvelope, FaBriefcase, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';

const LOGIN_REGEX = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+_[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+$/;

const EditAdminPopup = ({ admin, databaseName, onClose, onUpdate }) => {
    const { t } = useTranslation();
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
                if (!value.trim()) error = t('admin.editPopup.errors.fullNameRequired');
                break;
            case 'phone':
                if (!/^\+380\d{9}$/.test(value)) error = t('admin.editPopup.errors.phoneInvalid');
                break;
            case 'email':
                if (!value.trim()) {
                    error = t('admin.editPopup.errors.loginRequired');
                } else if (!LOGIN_REGEX.test(value)) {
                    error = t('admin.editPopup.errors.loginInvalid');
                }
                break;
            case 'jobPosition':
                if (!value.trim()) error = t('admin.editPopup.errors.positionRequired');
                break;
            case 'dateOfBirth':
                if (!value) error = t('admin.editPopup.errors.birthDateRequired');
                else {
                    const birthDate = new Date(value);
                    const today = new Date();
                    const minDate = new Date();
                    minDate.setFullYear(today.getFullYear() - 100);

                    if (birthDate > today) {
                        error = t('admin.editPopup.errors.birthDateFuture');
                    } else if (birthDate < minDate) {
                        error = t('admin.editPopup.errors.birthDateTooOld');
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

        // Очищаємо помилку логіна при зміні поля email
        if (name === 'email' && errors.submit) {
            setErrors(prev => ({ ...prev, submit: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!databaseName) {
            setErrors({ submit: t('admin.editPopup.errors.noDatabase') });
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

            setSuccessMessage(t('admin.admineditPopup.success'));

            setTimeout(() => {
                onUpdate(response.data.admin);
                onClose();
            }, 1500);

        } catch (err) {
            console.error('Помилка оновлення адміністратора:', err);
            // Перевіряємо помилку дублювання логіна
            if (err.response?.data?.error?.includes("email") || err.response?.data?.error?.includes("логін")) {
                setErrors({ email: "Користувач з таким логіном вже існує" });
            } else {
                setErrors({ submit: err.response?.data?.error || t('admin.editPopup.errors.updateError') });
            }
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

                <h4 className="text-center mb-4">{t('admin.users.admin.editTitle')}</h4>

                {successMessage && (
                    <div className="alert alert-success" role="alert">
                        {successMessage}
                    </div>
                )}

                {errors.submit && (
                    <div className="alert alert-danger" role="alert">
                        {errors.submit}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">
                            <FaUser className="me-2" />
                            {t('admin.users.admin.editPopup.fullName')}
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            className={getInputClass('fullName')}
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder={t('admin.users.admin.editPopup.fullNamePlaceholder')}
                            required
                        />
                        <div className="invalid-feedback">{errors.fullName}</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            <FaPhone className="me-2" />
                            {t('admin.users.admin.editPopup.phone')}
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
                            {t('admin.users.admin.editPopup.login')}
                        </label>
                        <input
                            type="text"
                            name="email"
                            className={getInputClass('email')}
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="ivanenko_ivan"
                            required
                        />
                        <div className="invalid-feedback">{errors.email}</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            <FaBriefcase className="me-2" />
                            {t('admin.users.admin.editPopup.position')}
                        </label>
                        <input
                            type="text"
                            name="jobPosition"
                            className={getInputClass('jobPosition')}
                            value={formData.jobPosition}
                            onChange={handleChange}
                            placeholder={t('admin.users.admin.editPopup.positionPlaceholder')}
                            required
                        />
                        <div className="invalid-feedback">{errors.jobPosition}</div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label">
                            <FaCalendarAlt className="me-2" />
                            {t('admin.users.admin.editPopup.birthDate')}
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
                            {t('admin.users.admin.editPopup.cancel')}
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
                            {loading ? t('admin.users.admin.editPopup.saving') : t('admin.users.admin.editPopup.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAdminPopup;