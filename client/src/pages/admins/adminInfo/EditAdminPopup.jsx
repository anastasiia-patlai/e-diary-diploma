import React, { useState, useEffect } from "react";
import {
    FaTimes,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaBriefcase,
    FaMapMarkerAlt,
    FaBirthdayCake,
    FaSave
} from "react-icons/fa";

const EditAdminPopup = ({ userData, onSave, onClose }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setFormData({
                fullName: userData.fullName || "",
                email: userData.email || "",
                phone: userData.phone || "",
                position: userData.position || "",
                positions: userData.positions ? userData.positions.join(', ') : "",
                address: userData.address || "",
                birthDate: userData.birthDate ? userData.birthDate.split('T')[0] : ""
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName?.trim()) {
            newErrors.fullName = "ПІБ обов'язкове поле";
        }

        if (!formData.email?.trim()) {
            newErrors.email = "Електронна пошта обов'язкова";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Некоректна електронна пошта";
        }

        if (!formData.phone?.trim()) {
            newErrors.phone = "Телефон обов'язковий";
        }

        if (!formData.position?.trim()) {
            newErrors.position = "Посада обов'язкова";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const saveData = {
                fullName: formData.fullName?.trim(),
                email: formData.email?.trim(),
                phone: formData.phone?.trim(),
                position: formData.position?.trim(),
                birthDate: formData.birthDate || null
            };

            if (formData.positions) {
                const positionsArray = formData.positions.split(',')
                    .map(pos => pos.trim())
                    .filter(pos => pos !== '' && pos !== saveData.position);

                if (positionsArray.length > 0) {
                    saveData.positions = positionsArray;
                }
            }

            console.log('Дані для відправки:', saveData);
            await onSave(saveData);
        } catch (error) {
            console.error('Помилка збереження:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            style={{
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
                padding: '20px'
            }}
            onClick={handleOverlayClick}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    position: 'relative'
                }}
            >
                {/* Заголовок і кнопка закриття */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #f3f4f6'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <FaUser color="rgba(105, 180, 185, 1)" />
                        Редагування профілю
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '8px',
                            borderRadius: '8px',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#f3f4f6';
                            e.target.style.color = '#374151';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#6b7280';
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        {/* ПІБ */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                ПІБ *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName || ''}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `2px solid ${errors.fullName ? '#ef4444' : '#d1d5db'}`,
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = errors.fullName ? '#ef4444' : 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = errors.fullName ? '#ef4444' : '#d1d5db';
                                }}
                                placeholder="Введіть ПІБ"
                            />
                            {errors.fullName && (
                                <div style={{
                                    color: '#ef4444',
                                    fontSize: '14px',
                                    marginTop: '4px'
                                }}>
                                    {errors.fullName}
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FaEnvelope size={14} />
                                Електронна пошта *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `2px solid ${errors.email ? '#ef4444' : '#d1d5db'}`,
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = errors.email ? '#ef4444' : 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db';
                                }}
                                placeholder="example@school.edu.ua"
                            />
                            {errors.email && (
                                <div style={{
                                    color: '#ef4444',
                                    fontSize: '14px',
                                    marginTop: '4px'
                                }}>
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        {/* Телефон */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FaPhone size={14} />
                                Телефон *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `2px solid ${errors.phone ? '#ef4444' : '#d1d5db'}`,
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = errors.phone ? '#ef4444' : 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = errors.phone ? '#ef4444' : '#d1d5db';
                                }}
                                placeholder="+380 (XX) XXX-XXXX"
                            />
                            {errors.phone && (
                                <div style={{
                                    color: '#ef4444',
                                    fontSize: '14px',
                                    marginTop: '4px'
                                }}>
                                    {errors.phone}
                                </div>
                            )}
                        </div>

                        {/* Посада */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FaBriefcase size={14} />
                                Посада *
                            </label>
                            <input
                                type="text"
                                name="position"
                                value={formData.position || ''}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `2px solid ${errors.position ? '#ef4444' : '#d1d5db'}`,
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = errors.position ? '#ef4444' : 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = errors.position ? '#ef4444' : '#d1d5db';
                                }}
                                placeholder="Наприклад: Директор"
                            />
                            {errors.position && (
                                <div style={{
                                    color: '#ef4444',
                                    fontSize: '14px',
                                    marginTop: '4px'
                                }}>
                                    {errors.position}
                                </div>
                            )}
                        </div>

                        {/* Додаткові посади */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Додаткові посади
                            </label>
                            <input
                                type="text"
                                name="positions"
                                value={formData.positions || ''}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#d1d5db';
                                }}
                                placeholder="Через кому: Вчитель математики, Керівник гуртка"
                            />
                            <div style={{
                                color: '#6b7280',
                                fontSize: '12px',
                                marginTop: '4px'
                            }}>
                                Перелічіть посади через кому
                            </div>
                        </div>

                        {/* Дата народження */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FaBirthdayCake size={14} />
                                Дата народження
                            </label>
                            <input
                                type="date"
                                name="birthDate"
                                value={formData.birthDate || ''}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#d1d5db';
                                }}
                            />
                        </div>
                    </div>

                    {/* Кнопки дій */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'flex-end',
                        marginTop: '32px',
                        paddingTop: '20px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '12px 24px',
                                border: '2px solid #d1d5db',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                color: '#374151',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.borderColor = '#9ca3af';
                                e.target.style.backgroundColor = '#f9fafb';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.borderColor = '#d1d5db';
                                e.target.style.backgroundColor = 'white';
                            }}
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                borderRadius: '8px',
                                backgroundColor: isLoading ? '#9ca3af' : 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseOver={(e) => {
                                if (!isLoading) {
                                    e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isLoading) {
                                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                                }
                            }}
                        >
                            <FaSave size={16} />
                            {isLoading ? 'Збереження...' : 'Зберегти зміни'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAdminPopup;