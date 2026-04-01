import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendar, FaChalkboardTeacher, FaPlus, FaMinus, FaCertificate, FaUserTie } from "react-icons/fa";
import axios from "axios";

const LOGIN_REGEX = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+_[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+$/;

const EditTeacherPopup = ({ teacher, onClose, onUpdate, databaseName, isMobile }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        positions: [""],
        category: "",
        teacherType: ""
    });
    const [loading, setLoading] = useState(false);
    const [fetchingUser, setFetchingUser] = useState(true);
    const [error, setError] = useState("");
    const [loginError, setLoginError] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            if (!databaseName) {
                setError(t('admin.teacher.errors.noDatabase'));
                setFetchingUser(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3001/api/users/${teacher._id}`, {
                    params: { databaseName }
                });
                const userData = response.data;

                let positionsArray = [""];
                if (userData.positions && userData.positions.length > 0) {
                    positionsArray = [...userData.positions];
                } else if (userData.position) {
                    positionsArray = userData.position.split(',').map(pos => pos.trim()).filter(pos => pos !== "");
                }

                setFormData({
                    fullName: userData.fullName || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : "",
                    positions: positionsArray.length > 0 ? positionsArray : [""],
                    category: userData.category || "",
                    teacherType: userData.teacherType || ""
                });

                setFetchingUser(false);
            } catch (err) {
                console.error("Помилка завантаження даних:", err);
                setError(t('admin.teacher.errors.loadError'));
                setFetchingUser(false);
            }
        };

        fetchUserData();
    }, [teacher._id, databaseName, t]);

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

    const addPositionField = () => {
        setFormData(prev => ({
            ...prev,
            positions: [...prev.positions, ""]
        }));
    };

    const removePositionField = (index) => {
        if (formData.positions.length > 1) {
            setFormData(prev => ({
                ...prev,
                positions: prev.positions.filter((_, i) => i !== index)
            }));
        }
    };

    const updatePosition = (index, value) => {
        setFormData(prev => ({
            ...prev,
            positions: prev.positions.map((pos, i) => i === index ? value : pos)
        }));
    };

    const validateLogin = (login) => {
        if (!login.trim()) {
            return t('admin.teacher.errors.loginRequired');
        }
        if (!LOGIN_REGEX.test(login)) {
            return t('admin.teacher.errors.loginInvalid');
        }
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setLoginError("");

        if (!databaseName) {
            setError(t('admin.teacher.errors.noDatabase'));
            setLoading(false);
            return;
        }

        const loginValidationError = validateLogin(formData.email);
        if (loginValidationError) {
            setLoginError(loginValidationError);
            setLoading(false);
            return;
        }

        try {
            const filteredPositions = formData.positions.filter(pos => pos.trim() !== "");

            if (filteredPositions.length === 0) {
                setError(t('admin.teacher.errors.subjectRequired'));
                setLoading(false);
                return;
            }

            const submitData = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                positions: filteredPositions,
                position: filteredPositions.join(", "),
                category: formData.category,
                teacherType: formData.teacherType,
                databaseName: databaseName
            };

            if (formData.teacherType === "young") {
                submitData.allowedCategories = ["young"];
            } else if (formData.teacherType === "middle") {
                submitData.allowedCategories = ["middle"];
            } else if (formData.teacherType === "senior") {
                submitData.allowedCategories = ["senior"];
            } else if (formData.teacherType === "middle-senior") {
                submitData.allowedCategories = ["middle", "senior"];
            } else if (formData.teacherType === "all") {
                submitData.allowedCategories = ["young", "middle", "senior"];
            }

            const response = await axios.put(
                `http://localhost:3001/api/users/${teacher._id}`,
                submitData
            );

            onUpdate(response.data.user);
            onClose();
        } catch (err) {
            if (err.response?.data?.error?.includes("email") || err.response?.data?.error?.includes("логін")) {
                setLoginError(t('admin.teacher.errors.loginExists'));
            } else {
                setError(err.response?.data?.error || t('admin.teacher.errors.updateError'));
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
            zIndex: 1000,
            padding: isMobile ? '16px' : '0',
            overflowY: 'auto'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: isMobile ? '0px 16px 20px 16px' : '24px',
                width: isMobile ? '100%' : '90%',
                maxWidth: isMobile ? '100%' : '500px',
                maxHeight: isMobile ? 'calc(100vh - 32px)' : '90vh',
                overflowY: 'auto',
                marginTop: '0'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: isMobile ? '16px' : '20px',
                    position: 'sticky',
                    top: isMobile ? '0' : 'auto',
                    backgroundColor: 'white',
                    paddingTop: isMobile ? '12px' : '0',
                    paddingBottom: isMobile ? '10px' : '0',
                    zIndex: 10
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: isMobile ? '18px' : '20px',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flex: 1
                    }}>
                        <FaChalkboardTeacher size={isMobile ? 18 : 20} />
                        {t('admin.teacher.editTitle')}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: isMobile ? '18px' : '20px',
                            color: '#6b7280',
                            transition: isMobile ? 'none' : 'color 0.2s',
                            padding: isMobile ? '4px' : '0',
                            flexShrink: 0
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: isMobile ? '10px' : '12px',
                        borderRadius: '6px',
                        marginBottom: isMobile ? '12px' : '16px',
                        fontSize: isMobile ? '13px' : '14px'
                    }}>
                        {error}
                    </div>
                )}

                {fetchingUser ? (
                    <div style={{
                        textAlign: 'center',
                        padding: isMobile ? '40px 20px' : '20px'
                    }}>
                        <p style={{ fontSize: isMobile ? '16px' : '14px' }}>{t('common.loading')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: isMobile ? '20px' : '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isMobile ? '10px' : '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '16px'
                            }}>
                                <FaUser style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px',
                                    flexShrink: 0
                                }} />
                                {t('admin.teacher.fullName')} *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: isMobile ? '14px 16px' : '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    height: isMobile ? '40px' : 'auto'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: isMobile ? '20px' : '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isMobile ? '10px' : '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '16px'
                            }}>
                                <FaEnvelope style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px',
                                    flexShrink: 0
                                }} />
                                {t('admin.teacher.login')} *
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
                                    padding: isMobile ? '14px 16px' : '10px 12px',
                                    border: `1px solid ${loginError ? '#dc2626' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    height: isMobile ? '40px' : 'auto'
                                }}
                            />
                            {loginError && (
                                <div style={{
                                    color: '#dc2626',
                                    fontSize: isMobile ? '12px' : '12px',
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
                                {t('admin.teacher.loginFormatHint')}
                            </div>
                        </div>

                        <div style={{ marginBottom: isMobile ? '20px' : '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isMobile ? '10px' : '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '16px'
                            }}>
                                <FaPhone style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px',
                                    flexShrink: 0
                                }} />
                                {t('admin.teacher.phone')} *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: isMobile ? '14px 16px' : '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    height: isMobile ? '40px' : 'auto'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: isMobile ? '20px' : '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isMobile ? '10px' : '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '16px'
                            }}>
                                <FaCalendar style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px',
                                    flexShrink: 0
                                }} />
                                {t('admin.teacher.birthDate')}
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: isMobile ? '14px 16px' : '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    height: isMobile ? '40px' : 'auto'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: isMobile ? '20px' : '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isMobile ? '10px' : '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '16px'
                            }}>
                                <FaUserTie style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: isMobile ? '14px' : '12px',
                                    flexShrink: 0
                                }} />
                                {t('admin.teacher.teacherType')} *
                            </label>
                            <select
                                name="teacherType"
                                value={formData.teacherType}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: isMobile ? '14px 16px' : '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    backgroundColor: 'white',
                                    height: isMobile ? '50px' : 'auto'
                                }}
                            >
                                <option value="">-- {t('admin.teacher.selectType')} --</option>
                                <option value="young">{t('admin.teacher.types.young')}</option>
                                <option value="middle">{t('admin.teacher.types.middle')}</option>
                                <option value="senior">{t('admin.teacher.types.senior')}</option>
                                <option value="middle-senior">{t('admin.teacher.types.middleSenior')}</option>
                                <option value="all">{t('admin.teacher.types.all')}</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: isMobile ? '20px' : '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isMobile ? '10px' : '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '16px'
                            }}>
                                <FaCertificate style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: isMobile ? '14px' : '12px',
                                    flexShrink: 0
                                }} />
                                {t('admin.teacher.qualificationCategory')}
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: isMobile ? '14px 16px' : '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    backgroundColor: 'white',
                                    height: isMobile ? '50px' : 'auto'
                                }}
                            >
                                <option value="">-- {t('admin.teacher.selectCategory')} --</option>
                                <option value="Вища категорія">{t('admin.teacher.qualifications.highest')}</option>
                                <option value="Перша категорія">{t('admin.teacher.qualifications.first')}</option>
                                <option value="Друга категорія">{t('admin.teacher.qualifications.second')}</option>
                                <option value="Спеціаліст">{t('admin.teacher.qualifications.specialist')}</option>
                                <option value="Молодший спеціаліст">{t('admin.teacher.qualifications.juniorSpecialist')}</option>
                                <option value="Без категорії">{t('admin.teacher.qualifications.noCategory')}</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: isMobile ? '20px' : '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isMobile ? '10px' : '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '16px'
                            }}>
                                <FaChalkboardTeacher style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: isMobile ? '14px' : '12px',
                                    flexShrink: 0
                                }} />
                                {t('admin.teacher.subjects')} *
                            </label>

                            {formData.positions.map((position, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginBottom: '8px',
                                    alignItems: 'center'
                                }}>
                                    <input
                                        type="text"
                                        value={position}
                                        onChange={(e) => updatePosition(index, e.target.value)}
                                        placeholder={`${t('admin.teacher.subject')} ${index + 1}`}
                                        style={{
                                            flex: 1,
                                            padding: isMobile ? '14px 16px' : '10px 12px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            height: isMobile ? '40px' : 'auto'
                                        }}
                                    />
                                    {formData.positions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removePositionField(index)}
                                            style={{
                                                padding: isMobile ? '14px' : '10px 12px',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: isMobile ? 'none' : 'background-color 0.2s',
                                                height: isMobile ? '40px' : 'auto',
                                                minWidth: isMobile ? '40px' : 'auto'
                                            }}
                                        >
                                            <FaMinus size={isMobile ? 16 : 14} />
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addPositionField}
                                disabled={loading}
                                style={{
                                    padding: isMobile ? '14px 16px' : '8px 12px',
                                    backgroundColor: 'rgba(105, 180, 185, 1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: isMobile ? '14px' : '12px',
                                    transition: isMobile ? 'none' : 'background-color 0.2s',
                                    justifyContent: 'center',
                                    height: isMobile ? '40px' : 'auto',
                                    marginTop: '8px'
                                }}
                            >
                                <FaPlus size={isMobile ? 14 : 12} />
                                {t('admin.teacher.addSubject')}
                            </button>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? '12px' : '10px',
                            marginTop: isMobile ? '24px' : '24px',
                            paddingTop: isMobile ? '20px' : '16px',
                            borderTop: '1px solid #e5e7eb'
                        }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: isMobile ? '10px' : '8px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: isMobile ? '14px' : '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: isMobile ? 'none' : 'background-color 0.2s',
                                    minHeight: '40px',
                                    height: '40px'
                                }}
                            >
                                <FaTimes size={isMobile ? 14 : 12} />
                                {t('admin.teacher.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: isMobile ? '10px' : '8px',
                                    backgroundColor: 'rgba(105, 180, 185, 1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    fontSize: isMobile ? '14px' : '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    opacity: loading ? 0.6 : 1,
                                    transition: isMobile ? 'none' : 'background-color 0.2s',
                                    minHeight: '40px',
                                    height: '40px'
                                }}
                            >
                                {loading ? t('admin.teacher.saving') : t('admin.teacher.saveChanges')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditTeacherPopup;