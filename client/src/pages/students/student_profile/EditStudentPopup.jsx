import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendar, FaUsers, FaLock } from "react-icons/fa";

const LOGIN_REGEX = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+_[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+$/;

const EditStudentPopup = ({ userData, onSave, onClose, isMobile }) => {
    const { t } = useTranslation();

    const initializeFormData = () => {
        console.log("📝 EditStudentPopup - ініціалізація даних:", userData);

        let dateOfBirthValue = "";
        if (userData.dateOfBirth) {
            dateOfBirthValue = new Date(userData.dateOfBirth).toISOString().split('T')[0];
        } else if (userData.birthDate) {
            dateOfBirthValue = new Date(userData.birthDate).toISOString().split('T')[0];
        }

        let groupValue = "";
        if (userData.group) {
            if (typeof userData.group === 'object') {
                groupValue = userData.group._id || userData.group.id || "";
            } else {
                groupValue = userData.group;
            }
        }

        return {
            fullName: userData.fullName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            dateOfBirth: dateOfBirthValue,
            group: groupValue
        };
    };

    const [formData, setFormData] = useState(initializeFormData());
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loginError, setLoginError] = useState("");
    const [groups, setGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadGroups = async () => {
            try {
                setLoadingGroups(true);
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                const { databaseName } = userInfo;

                if (!databaseName) {
                    console.error("❌ Немає databaseName в localStorage");
                    return;
                }

                const response = await fetch(`/api/groups?databaseName=${encodeURIComponent(databaseName)}`);
                const result = await response.json();

                if (response.ok && Array.isArray(result)) {
                    setGroups(result);
                    console.log("📚 Групи завантажено:", result);
                } else {
                    console.error("Помилка завантаження груп:", result);
                }
            } catch (error) {
                console.error("Помилка завантаження груп:", error);
            } finally {
                setLoadingGroups(false);
            }
        };

        loadGroups();
    }, []);

    useEffect(() => {
        console.log("📝 EditStudentPopup - formData:", formData);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'email') {
            setLoginError("");
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (touched[name]) {
            validateField(name, value);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "fullName":
                if (!value.trim()) error = t('student.editPopup.errors.fullNameRequired');
                else if (value.trim().length < 2) error = t('student.editPopup.errors.fullNameMinLength');
                break;
            case "email":
                if (!value.trim()) {
                    error = t('student.editPopup.errors.loginRequired');
                } else if (!LOGIN_REGEX.test(value)) {
                    error = t('student.editPopup.errors.loginInvalid');
                }
                break;
            case "phone":
                if (!value.trim()) error = t('student.editPopup.errors.phoneRequired');
                else if (!/^[\d+\s\-()]{10,}$/.test(value.replace(/[\s\-()]/g, ''))) error = t('student.editPopup.errors.phoneInvalid');
                break;
            default:
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const validateLogin = (login) => {
        if (!login.trim()) {
            return t('student.editPopup.errors.loginRequired');
        }
        if (!LOGIN_REGEX.test(login)) {
            return t('student.editPopup.errors.loginInvalid');
        }
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoginError("");

        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        // Валідація логіна
        const loginValidationError = validateLogin(formData.email);
        if (loginValidationError) {
            setLoginError(loginValidationError);
            setLoading(false);
            return;
        }

        const isValid = Object.keys(formData).every(key => validateField(key, formData[key]));

        if (isValid) {
            try {
                console.log("💾 Збереження даних студента:", formData);

                const dataToSave = {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    dateOfBirth: formData.dateOfBirth || null,
                    group: formData.group || null
                };

                await onSave(dataToSave);
            } catch (error) {
                console.error("Помилка збереження:", error);
                if (error.response?.data?.error?.includes("email") || error.response?.data?.error?.includes("логін")) {
                    setLoginError(t('student.editPopup.errors.loginExists'));
                }
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const getInputClass = (fieldName) => {
        return `form-control ${touched[fieldName] && errors[fieldName] ? 'is-invalid' : ''}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return t('common.notSpecified');
        try {
            return new Date(dateString).toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return t('common.notSpecified');
        }
    };

    const getGroupName = () => {
        if (!userData.group) return t('common.notSpecified');
        if (typeof userData.group === 'object') {
            return userData.group.name || t('common.notSpecified');
        }
        return userData.group;
    };

    const getParentsList = () => {
        if (!userData.parents || userData.parents.length === 0) return t('common.notSpecified');
        return userData.parents.map(parent => parent.fullName).join(', ');
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
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: isMobile ? '16px' : '0'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: isMobile ? '100%' : '800px',
                maxWidth: isMobile ? '95vw' : '90vw',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMobile ? '16px' : '24px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: isMobile ? '18px' : '20px',
                        fontWeight: '600',
                        color: '#1f2937'
                    }}>
                        {t('student.editPopup.title')}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        aria-label={t('common.close')}
                    >
                        <FaTimes size={isMobile ? 18 : 20} color="#6b7280" />
                    </button>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: isMobile ? '20px 16px' : '24px'
                }}>
                    <form onSubmit={handleSubmit}>
                        {/* Контейнер з сіткою для полів */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                            gap: isMobile ? '16px' : '20px',
                            marginBottom: '24px'
                        }}>
                            {/* ПІБ */}
                            <div className="mb-2">
                                <label className="form-label" style={{
                                    fontSize: isMobile ? '14px' : '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '6px',
                                    display: 'block'
                                }}>
                                    <FaUser style={{ marginRight: '6px', color: 'rgba(105, 180, 185, 1)', fontSize: '12px' }} />
                                    {t('student.editPopup.fullName')} *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    className={getInputClass("fullName")}
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    style={{
                                        fontSize: isMobile ? '14px' : '14px',
                                        padding: isMobile ? '10px 12px' : '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s'
                                    }}
                                />
                                {errors.fullName && (
                                    <div style={{
                                        fontSize: isMobile ? '11px' : '12px',
                                        color: '#dc2626',
                                        marginTop: '4px'
                                    }}>
                                        {errors.fullName}
                                    </div>
                                )}
                            </div>

                            {/* Логін */}
                            <div className="mb-2">
                                <label className="form-label" style={{
                                    fontSize: isMobile ? '14px' : '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '6px',
                                    display: 'block'
                                }}>
                                    <FaEnvelope style={{ marginRight: '6px', color: 'rgba(105, 180, 185, 1)', fontSize: '12px' }} />
                                    {t('student.editPopup.login')} *
                                </label>
                                <input
                                    type="text"
                                    name="email"
                                    className={getInputClass("email")}
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="ivanenko_ivan"
                                    style={{
                                        fontSize: isMobile ? '14px' : '14px',
                                        padding: isMobile ? '10px 12px' : '10px 12px',
                                        borderRadius: '6px',
                                        border: `1px solid ${loginError ? '#dc2626' : '#d1d5db'}`,
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s'
                                    }}
                                />
                                {loginError && (
                                    <div style={{
                                        fontSize: isMobile ? '11px' : '12px',
                                        color: '#dc2626',
                                        marginTop: '4px'
                                    }}>
                                        {loginError}
                                    </div>
                                )}
                                <div style={{
                                    fontSize: isMobile ? '10px' : '11px',
                                    color: '#6b7280',
                                    marginTop: '4px'
                                }}>
                                    {t('student.editPopup.loginFormatHint')}
                                </div>
                            </div>

                            {/* Телефон */}
                            <div className="mb-2">
                                <label className="form-label" style={{
                                    fontSize: isMobile ? '14px' : '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '6px',
                                    display: 'block'
                                }}>
                                    <FaPhone style={{ marginRight: '6px', color: 'rgba(105, 180, 185, 1)', fontSize: '12px' }} />
                                    {t('student.editPopup.phone')} *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className={getInputClass("phone")}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    style={{
                                        fontSize: isMobile ? '14px' : '14px',
                                        padding: isMobile ? '10px 12px' : '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s'
                                    }}
                                    placeholder="+380XXXXXXXXX"
                                />
                                {errors.phone && (
                                    <div style={{
                                        fontSize: isMobile ? '11px' : '12px',
                                        color: '#dc2626',
                                        marginTop: '4px'
                                    }}>
                                        {errors.phone}
                                    </div>
                                )}
                            </div>

                            {/* Дата народження */}
                            <div className="mb-2">
                                <label className="form-label" style={{
                                    fontSize: isMobile ? '14px' : '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '6px',
                                    display: 'block'
                                }}>
                                    <FaCalendar style={{ marginRight: '6px', color: 'rgba(105, 180, 185, 1)', fontSize: '12px' }} />
                                    {t('student.editPopup.birthDate')}
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    className="form-control"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    style={{
                                        fontSize: isMobile ? '14px' : '14px',
                                        padding: isMobile ? '10px 12px' : '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s'
                                    }}
                                />
                                <small className="text-muted" style={{
                                    fontSize: isMobile ? '10px' : '11px',
                                    color: '#6b7280',
                                    display: 'block',
                                    marginTop: '4px'
                                }}>
                                    {t('student.editPopup.dateFormat')}
                                </small>
                            </div>

                            {/* Група (на всю ширину) */}
                            <div className="mb-2" style={{
                                gridColumn: isMobile ? 'auto' : '1 / -1'
                            }}>
                                <label className="form-label" style={{
                                    fontSize: isMobile ? '14px' : '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <FaUsers size={14} color="rgba(105, 180, 185, 1)" />
                                    {t('student.editPopup.group')}
                                </label>
                                <select
                                    name="group"
                                    className="form-control"
                                    value={formData.group}
                                    onChange={handleChange}
                                    disabled={loadingGroups}
                                    style={{
                                        fontSize: isMobile ? '14px' : '14px',
                                        padding: isMobile ? '10px 12px' : '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        backgroundColor: loadingGroups ? '#f3f4f6' : 'white'
                                    }}
                                >
                                    <option value="">{loadingGroups ? t('common.loading') : t('student.editPopup.selectGroup')}</option>
                                    {groups.map(group => (
                                        <option key={group._id} value={group._id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Поточна інформація про навчання */}
                        <div style={{
                            margin: '20px 0',
                            padding: isMobile ? '16px' : '20px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <h4 style={{
                                fontSize: isMobile ? '14px' : '15px',
                                fontWeight: '600',
                                marginBottom: '16px',
                                color: '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FaLock size={12} color="#9ca3af" />
                                {t('student.editPopup.currentSchoolInfo')}
                            </h4>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                gap: isMobile ? '12px' : '16px'
                            }}>
                                <div style={{
                                    padding: '10px 12px',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #f3f4f6'
                                }}>
                                    <div style={{
                                        fontSize: isMobile ? '11px' : '12px',
                                        color: '#6b7280',
                                        marginBottom: '4px'
                                    }}>
                                        {t('student.profile.group')}
                                    </div>
                                    <div style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        fontWeight: '500',
                                        color: '#1f2937',
                                        wordBreak: 'break-word'
                                    }}>
                                        {getGroupName()}
                                    </div>
                                </div>

                                <div style={{
                                    padding: '10px 12px',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #f3f4f6'
                                }}>
                                    <div style={{
                                        fontSize: isMobile ? '11px' : '12px',
                                        color: '#6b7280',
                                        marginBottom: '4px'
                                    }}>
                                        {t('student.profile.parents')}
                                    </div>
                                    <div style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        fontWeight: '500',
                                        color: '#1f2937',
                                        wordBreak: 'break-word'
                                    }}>
                                        {getParentsList()}
                                    </div>
                                </div>

                                <div style={{
                                    padding: '10px 12px',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #f3f4f6'
                                }}>
                                    <div style={{
                                        fontSize: isMobile ? '11px' : '12px',
                                        color: '#6b7280',
                                        marginBottom: '4px'
                                    }}>
                                        {t('student.profile.birthDate')}
                                    </div>
                                    <div style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        fontWeight: '500',
                                        color: '#1f2937'
                                    }}>
                                        {formatDate(userData.dateOfBirth || userData.birthDate)}
                                    </div>
                                </div>

                                <div style={{
                                    padding: '10px 12px',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #f3f4f6'
                                }}>
                                    <div style={{
                                        fontSize: isMobile ? '11px' : '12px',
                                        color: '#6b7280',
                                        marginBottom: '4px'
                                    }}>
                                        {t('student.profile.enrollmentDate')}
                                    </div>
                                    <div style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        fontWeight: '500',
                                        color: '#1f2937'
                                    }}>
                                        {formatDate(userData.createdAt)}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '16px',
                                padding: '10px 12px',
                                backgroundColor: 'rgba(105, 180, 185, 0.05)',
                                borderRadius: '6px',
                                border: '1px dashed rgba(105, 180, 185, 0.3)'
                            }}>
                                <p style={{
                                    margin: 0,
                                    fontSize: isMobile ? '11px' : '12px',
                                    color: '#6b7280',
                                    lineHeight: '1.4',
                                    textAlign: 'center'
                                }}>
                                    {t('student.editPopup.contactAdmin')}
                                </p>
                            </div>
                        </div>

                        {/* Кнопки */}
                        <div style={{
                            display: 'flex',
                            gap: isMobile ? '12px' : '16px',
                            marginTop: '24px',
                            paddingTop: '20px',
                            borderTop: '1px solid #e5e7eb'
                        }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: isMobile ? '10px' : '12px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: isMobile ? '14px' : '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                            >
                                <FaTimes style={{ marginRight: '6px' }} />
                                {t('student.editPopup.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: isMobile ? '10px' : '12px',
                                    backgroundColor: 'rgba(105, 180, 185, 1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: isMobile ? '14px' : '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    opacity: loading ? 0.6 : 1
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
                                {loading ? t('common.loading') : t('student.editPopup.save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditStudentPopup;