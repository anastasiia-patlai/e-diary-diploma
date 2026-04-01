import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendar, FaUsers } from "react-icons/fa";
import axios from "axios";

const LOGIN_REGEX = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+_[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+$/;

const EditStudentPopup = ({ student, databaseName, onClose, onUpdate }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        group: ""
    });
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingUser, setFetchingUser] = useState(true);
    const [error, setError] = useState("");
    const [loginError, setLoginError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!databaseName) {
                    setError(t('admin.studentManagement.errors.noDatabase'));
                    setFetchingUser(false);
                    return;
                }

                const groupsResponse = await axios.get(`http://localhost:3001/api/groups?databaseName=${encodeURIComponent(databaseName)}`);
                setGroups(groupsResponse.data);

                const userResponse = await axios.get(`http://localhost:3001/api/users/${student._id}?databaseName=${encodeURIComponent(databaseName)}`);
                const userData = userResponse.data;

                setFormData({
                    fullName: userData.fullName || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : "",
                    group: userData.group?._id || userData.group || ""
                });

                setFetchingUser(false);
            } catch (err) {
                console.error("Помилка завантаження даних:", err);
                setError(`${t('admin.studentManagement.errors.loadError')}: ${err.response?.data?.error || err.message}`);
                setFetchingUser(false);
            }
        };

        fetchData();
    }, [student._id, databaseName, t]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'email') {
            setLoginError("");
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateLogin = (login) => {
        if (!login.trim()) {
            return t('admin.studentManagement.errors.loginRequired');
        }
        if (!LOGIN_REGEX.test(login)) {
            return t('admin.studentManagement.errors.loginInvalid');
        }
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setLoginError("");

        try {
            if (!databaseName) {
                setError(t('admin.studentManagement.errors.noDatabase'));
                setLoading(false);
                return;
            }

            const loginValidationError = validateLogin(formData.email);
            if (loginValidationError) {
                setLoginError(loginValidationError);
                setLoading(false);
                return;
            }

            const response = await axios.put(
                `http://localhost:3001/api/users/${student._id}`,
                {
                    ...formData,
                    databaseName
                }
            );

            onUpdate(response.data.user);
            onClose();
        } catch (err) {
            if (err.response?.data?.error?.includes("email") || err.response?.data?.error?.includes("логін")) {
                setLoginError(t('admin.studentManagement.loginExists'));
            } else {
                setError(err.response?.data?.error || t('admin.studentManagement.errors.updateError'));
            }
        } finally {
            setLoading(false);
        }
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
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#374151' }}>
                        {t('admin.studentManagement.editStudent')}
                    </h2>
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

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <FaTimes />
                        {error}
                    </div>
                )}

                {fetchingUser ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p>{t('common.loading')}</p>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                            {t('admin.mainPage.databaseName')}: {databaseName || t('admin.mainPage.notSet')}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                <FaUser style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px'
                                }} />
                                {t('admin.studentManagement.fullName')} *
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
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                <FaEnvelope style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px'
                                }} />
                                {t('admin.studentManagement.login')} *
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
                                    border: `1px solid ${loginError ? '#dc2626' : '#e5e7eb'}`,
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = loginError ? '#dc2626' : 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    if (!loginError) {
                                        e.target.style.borderColor = '#e5e7eb';
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
                            <div style={{
                                fontSize: '11px',
                                color: '#6b7280',
                                marginTop: '4px'
                            }}>
                                {t('admin.studentManagement.loginFormatHint')}
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                <FaPhone style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px'
                                }} />
                                {t('admin.studentManagement.phone')} *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                <FaCalendar style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px'
                                }} />
                                {t('admin.studentManagement.birthDate')}
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                <FaUsers style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px'
                                }} />
                                {t('admin.studentManagement.group')} *
                            </label>
                            <select
                                name="group"
                                value={formData.group}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    cursor: 'pointer'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            >
                                <option value="">{t('admin.studentManagement.selectGroup')}</option>
                                {groups.map(group => (
                                    <option key={group._id} value={group._id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            marginTop: '24px',
                            paddingTop: '16px',
                            borderTop: '1px solid #e5e7eb'
                        }}>
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
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#4b5563';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#6b7280';
                                }}
                            >
                                <FaTimes />
                                {t('admin.studentManagement.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: 'rgba(105, 180, 185, 1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: loading ? 0.6 : 1,
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    if (!loading) {
                                        e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!loading) {
                                        e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                                    }
                                }}
                            >
                                {loading ? t('admin.studentManagement.saving') : t('admin.studentManagement.saveChanges')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditStudentPopup;