import React, { useState, useEffect } from "react";
import { FaTimes, FaInfoCircle, FaLock } from "react-icons/fa";

const EditTeacherPopup = ({ userData, onSave, onClose, isMobile }) => {
    // Функція для ініціалізації даних - тільки дозволені поля
    const initializeFormData = () => {
        console.log("📝 EditTeacherPopup - ініціалізація даних:", userData);

        // Обробка дати народження
        let dateOfBirthValue = "";
        if (userData.dateOfBirth) {
            dateOfBirthValue = new Date(userData.dateOfBirth).toISOString().split('T')[0];
        } else if (userData.birthDate) {
            dateOfBirthValue = new Date(userData.birthDate).toISOString().split('T')[0];
        }

        // Повертаємо лише дозволені для редагування поля
        return {
            fullName: userData.fullName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            dateOfBirth: dateOfBirthValue
        };
    };

    const [formData, setFormData] = useState(initializeFormData());
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        console.log("📝 EditTeacherPopup - formData:", formData);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
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
                if (!value.trim()) error = "ПІБ обов'язкове поле";
                else if (value.trim().length < 2) error = "ПІБ повинно містити щонайменше 2 символи";
                break;
            case "email":
                if (!value.trim()) error = "Електронна пошта обов'язкова";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Невірний формат електронної пошти";
                break;
            case "phone":
                if (!value.trim()) error = "Телефон обов'язковий";
                else if (!/^[\d+\s\-()]{10,}$/.test(value.replace(/[\s\-()]/g, ''))) error = "Невірний формат телефону";
                break;
            // Поле dateOfBirth не обов'язкове і не має спеціальної валідації
            default:
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        const isValid = Object.keys(formData).every(key => validateField(key, formData[key]));

        if (isValid) {
            try {
                console.log("💾 Збереження даних:", formData);

                // Готуємо дані для збереження - тільки дозволені поля
                const dataToSave = {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    // dateOfBirth може бути пустим рядком - конвертуємо в null
                    dateOfBirth: formData.dateOfBirth || null
                };

                await onSave(dataToSave);
            } catch (error) {
                console.error("Помилка збереження:", error);
            }
        }
    };

    const getInputClass = (fieldName) => {
        return `form-control ${touched[fieldName] && errors[fieldName] ? 'is-invalid' : ''}`;
    };

    // Функція для відображення типу вчителя
    const getTeacherTypeDisplayName = (teacherType) => {
        const types = {
            'young': 'Викладач молодших класів (1-4)',
            'middle': 'Викладач середніх класів (5-9)',
            'senior': 'Викладач старших класів (10-11)',
            'middle-senior': 'Викладач середніх та старших класів',
            'all': 'Викладач усіх класів',
            '': 'Не вказано'
        };
        return types[teacherType] || teacherType || 'Не вказано';
    };

    // Функція для форматування дати
    const formatDate = (dateString) => {
        if (!dateString) return 'Не вказано';
        try {
            return new Date(dateString).toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Не вказано';
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
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: isMobile ? '16px' : '0'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: isMobile ? '100%' : '600px',
                maxWidth: '95vw',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                {/* ХЕДЕР */}
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
                        Редагування профілю
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
                        aria-label="Закрити"
                    >
                        <FaTimes size={isMobile ? 18 : 20} color="#6b7280" />
                    </button>
                </div>

                {/* ФОРМА */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: isMobile ? '20px 16px' : '24px'
                }}>
                    <form onSubmit={handleSubmit}>
                        {/* ПІБ */}
                        <div className="mb-4">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '15px' : '16px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                ПІБ *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                className={getInputClass("fullName")}
                                value={formData.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    padding: isMobile ? '10px 12px' : '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                            {errors.fullName && (
                                <div style={{
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: '#dc2626',
                                    marginTop: '6px'
                                }}>
                                    {errors.fullName}
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '15px' : '16px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Електронна пошта *
                            </label>
                            <input
                                type="email"
                                name="email"
                                className={getInputClass("email")}
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    padding: isMobile ? '10px 12px' : '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                            {errors.email && (
                                <div style={{
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: '#dc2626',
                                    marginTop: '6px'
                                }}>
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        {/* Телефон */}
                        <div className="mb-4">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '15px' : '16px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Телефон *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                className={getInputClass("phone")}
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    padding: isMobile ? '10px 12px' : '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s'
                                }}
                                placeholder="+380XXXXXXXXX"
                            />
                            {errors.phone && (
                                <div style={{
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: '#dc2626',
                                    marginTop: '6px'
                                }}>
                                    {errors.phone}
                                </div>
                            )}
                        </div>

                        {/* Дата народження */}
                        <div className="mb-4">
                            <label className="form-label" style={{
                                fontSize: isMobile ? '15px' : '16px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Дата народження
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                className="form-control"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    padding: isMobile ? '10px 12px' : '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                            <small className="text-muted" style={{
                                fontSize: isMobile ? '11px' : '12px',
                                color: '#6b7280',
                                display: 'block',
                                marginTop: '6px'
                            }}>
                                Формат: ДД-ММ-РРРР
                            </small>
                        </div>

                        {/* БЛОК ПОТОЧНОЇ ІНФОРМАЦІЇ (ТІЛЬКИ ДЛЯ ПЕРЕГЛЯДУ) */}
                        <div style={{
                            margin: '20px 0',
                            padding: isMobile ? '16px' : '20px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <h4 style={{
                                fontSize: isMobile ? '15px' : '16px',
                                fontWeight: '600',
                                marginBottom: '16px',
                                color: '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FaLock size={14} color="#9ca3af" />
                                Поточна професійна інформація
                            </h4>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                gap: isMobile ? '12px' : '16px'
                            }}>
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #f3f4f6'
                                }}>
                                    <div style={{
                                        fontSize: isMobile ? '12px' : '13px',
                                        color: '#6b7280',
                                        marginBottom: '4px'
                                    }}>
                                        Тип викладача
                                    </div>
                                    <div style={{
                                        fontSize: isMobile ? '14px' : '15px',
                                        fontWeight: '500',
                                        color: '#1f2937',
                                        wordBreak: 'break-word'
                                    }}>
                                        {getTeacherTypeDisplayName(userData.teacherType)}
                                    </div>
                                </div>

                                <div style={{
                                    padding: '12px',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #f3f4f6'
                                }}>
                                    <div style={{
                                        fontSize: isMobile ? '12px' : '13px',
                                        color: '#6b7280',
                                        marginBottom: '4px'
                                    }}>
                                        Категорія кваліфікації
                                    </div>
                                    <div style={{
                                        fontSize: isMobile ? '14px' : '15px',
                                        fontWeight: '500',
                                        color: '#1f2937',
                                        wordBreak: 'break-word'
                                    }}>
                                        {userData.category || 'Не вказано'}
                                    </div>
                                </div>

                                <div style={{
                                    padding: '12px',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #f3f4f6',
                                    gridColumn: isMobile ? 'auto' : '1 / -1'
                                }}>
                                    <div style={{
                                        fontSize: isMobile ? '12px' : '13px',
                                        color: '#6b7280',
                                        marginBottom: '4px'
                                    }}>
                                        Предмети
                                    </div>
                                    <div style={{
                                        fontSize: isMobile ? '14px' : '15px',
                                        fontWeight: '500',
                                        color: '#1f2937',
                                        wordBreak: 'break-word'
                                    }}>
                                        {userData.positions && userData.positions.length > 0
                                            ? userData.positions.join(', ')
                                            : 'Не вказано'}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: 'rgba(105, 180, 185, 0.05)',
                                borderRadius: '6px',
                                border: '1px dashed rgba(105, 180, 185, 0.3)'
                            }}>
                                <p style={{
                                    margin: 0,
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: '#6b7280',
                                    lineHeight: '1.5',
                                    textAlign: 'center'
                                }}>
                                    Для зміни цих даних зверніться до адміністратора школи
                                </p>
                            </div>
                        </div>

                        {/* КНОПКИ */}
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
                                    padding: isMobile ? '12px' : '14px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: isMobile ? '14px' : '16px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                            >
                                Скасувати
                            </button>
                            <button
                                type="submit"
                                style={{
                                    flex: 1,
                                    padding: isMobile ? '12px' : '14px',
                                    backgroundColor: 'rgba(105, 180, 185, 1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: isMobile ? '14px' : '16px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)'}
                                onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)'}
                                disabled={Object.keys(errors).some(key => errors[key])}
                            >
                                Зберегти зміни
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTeacherPopup;