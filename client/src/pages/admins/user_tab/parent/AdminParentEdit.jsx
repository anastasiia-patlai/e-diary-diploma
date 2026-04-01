import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaTimes } from "react-icons/fa";
import axios from "axios";

const LOGIN_REGEX = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+_[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+$/;

const AdminParentEdit = ({ parent, onClose, onUpdate, databaseName }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        if (parent) {
            setFormData({
                fullName: parent.fullName || '',
                email: parent.email || '',
                phone: parent.phone || ''
            });
        }
    }, [parent]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'email') {
            setLoginError("");
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateLogin = (login) => {
        if (!login.trim()) {
            return t('admin.users.parent.loginRequired');
        }
        if (!LOGIN_REGEX.test(login)) {
            return t('admin.users.parent.loginInvalid');
        }
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!databaseName) {
            setError(t('admin.users.parent.noDatabaseError'));
            return;
        }

        const loginValidationError = validateLogin(formData.email);
        if (loginValidationError) {
            setLoginError(loginValidationError);
            return;
        }

        setLoading(true);
        setError('');
        setLoginError('');

        try {
            await axios.put(`http://localhost:3001/api/users/${parent._id}`, {
                ...formData,
                databaseName
            });

            const response = await axios.get(`http://localhost:3001/api/users/${parent._id}`, {
                params: { databaseName }
            });

            const updatedParent = response.data;

            if (parent.children && (!updatedParent.children || updatedParent.children.length === 0)) {
                updatedParent.children = parent.children;
            }

            onUpdate(updatedParent);
            onClose();
        } catch (err) {
            console.error('Помилка оновлення батька:', err);
            if (err.response?.data?.error?.includes("email") || err.response?.data?.error?.includes("логін")) {
                setLoginError(t('admin.users.parent.loginExists'));
            } else {
                setError(err.response?.data?.error || t('admin.users.parent.updateError'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (!parent) return null;

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
                    <h3 style={{ margin: 0, color: '#374151' }}>
                        {t('admin.users.parent.editParent')}
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
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            <FaUser style={{ marginRight: '8px', color: 'rgba(105, 180, 185, 1)' }} />
                            {t('admin.users.parent.fullName')} *
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#d1d5db';
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            <FaEnvelope style={{ marginRight: '8px', color: 'rgba(105, 180, 185, 1)' }} />
                            {t('admin.users.parent.login')} *
                        </label>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="ivanenko_ivan"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: `1px solid ${loginError ? '#dc2626' : '#d1d5db'}`,
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = loginError ? '#dc2626' : 'rgba(105, 180, 185, 1)';
                            }}
                            onBlur={(e) => {
                                if (!loginError) {
                                    e.target.style.borderColor = '#d1d5db';
                                }
                            }}
                        />
                        {loginError && (
                            <div style={{
                                color: '#dc2626',
                                fontSize: '12px',
                                marginTop: '4px'
                            }}>
                                {loginError}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            <FaPhone style={{ marginRight: '8px', color: 'rgba(105, 180, 185, 1)' }} />
                            {t('admin.users.parent.phone')}
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#d1d5db';
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '10px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            color: '#dc2626',
                            marginBottom: '15px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FaTimes />
                            {t('admin.users.parent.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            <FaSave />
                            {loading ? t('admin.users.parent.saving') : t('admin.users.parent.saveChanges')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminParentEdit;