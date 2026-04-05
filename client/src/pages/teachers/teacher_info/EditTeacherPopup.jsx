import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaTimes, FaInfoCircle, FaLock } from "react-icons/fa";

const EditTeacherPopup = ({ userData, onSave, onClose, isMobile }) => {
    const { t } = useTranslation();

    const initializeFormData = () => {
        console.log("📝 EditTeacherPopup - ініціалізація даних:", userData);

        let dateOfBirthValue = "";
        if (userData.dateOfBirth) {
            dateOfBirthValue = new Date(userData.dateOfBirth).toISOString().split('T')[0];
        } else if (userData.birthDate) {
            dateOfBirthValue = new Date(userData.birthDate).toISOString().split('T')[0];
        }

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

    // Функція для перекладу предметів
    const translateSubject = (subject) => {
        if (!subject) return subject;
        const translated = t(`subjects.${subject}`, { defaultValue: subject });
        return translated;
    };

    // Функція для перекладу категорії кваліфікації
    const getQualificationTranslation = (category) => {
        if (!category) return t('common.notSpecified');

        const qualificationMap = {
            'Вища категорія': t('teacher.qualifications.highest'),
            'Перша категорія': t('teacher.qualifications.first'),
            'Друга категорія': t('teacher.qualifications.second'),
            'Спеціаліст вищої категорії': t('teacher.qualifications.specialistHighest'),
            'Спеціаліст першої категорії': t('teacher.qualifications.specialistFirst'),
            'Спеціаліст другої категорії': t('teacher.qualifications.specialistSecond'),
            'Спеціаліст': t('teacher.qualifications.specialist'),
            'Молодший спеціаліст': t('teacher.qualifications.juniorSpecialist'),
            'Без категорії': t('teacher.qualifications.noCategory'),
            'Higher category': t('teacher.qualifications.highest'),
            'First category': t('teacher.qualifications.first'),
            'Second category': t('teacher.qualifications.second'),
            'Specialist of highest category': t('teacher.qualifications.specialistHighest'),
            'Specialist of first category': t('teacher.qualifications.specialistFirst'),
            'Specialist of second category': t('teacher.qualifications.specialistSecond'),
            'Specialist': t('teacher.qualifications.specialist'),
            'Junior specialist': t('teacher.qualifications.juniorSpecialist'),
            'Without category': t('teacher.qualifications.noCategory')
        };

        return qualificationMap[category] || category;
    };

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
                if (!value.trim()) error = t('teacher.editPopup.errors.fullNameRequired');
                else if (value.trim().length < 2) error = t('teacher.editPopup.errors.fullNameMinLength');
                break;
            case "email":
                if (!value.trim()) error = t('teacher.editPopup.errors.emailRequired');
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = t('teacher.editPopup.errors.emailInvalid');
                break;
            case "phone":
                if (!value.trim()) error = t('teacher.editPopup.errors.phoneRequired');
                else if (!/^[\d+\s\-()]{10,}$/.test(value.replace(/[\s\-()]/g, ''))) error = t('teacher.editPopup.errors.phoneInvalid');
                break;
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

                const dataToSave = {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
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

    const getTeacherTypeDisplayName = (teacherType) => {
        const types = {
            'young': t('teacher.teacherTypes.young'),
            'middle': t('teacher.teacherTypes.middle'),
            'senior': t('teacher.teacherTypes.senior'),
            'middle-senior': t('teacher.teacherTypes.middleSenior'),
            'all': t('teacher.teacherTypes.all'),
            '': t('common.notSpecified')
        };
        return types[teacherType] || teacherType || t('common.notSpecified');
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
                width: isMobile ? '100%' : '700px',
                maxWidth: '95vw',
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
                        {t('teacher.profileEditPopup.title')}
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
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                            gap: isMobile ? '16px' : '20px',
                            marginBottom: '-20px'
                        }}>
                            {/* Ліва колонка */}
                            <div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        fontSize: isMobile ? '15px' : '16px',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        {t('teacher.profileEditPopup.fullName')} *
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

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        fontSize: isMobile ? '15px' : '16px',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        {t('teacher.profileEditPopup.login')} *
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
                            </div>

                            {/* Права колонка */}
                            <div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        fontSize: isMobile ? '15px' : '16px',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        {t('teacher.profileEditPopup.phone')} *
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

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        fontSize: isMobile ? '15px' : '16px',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        {t('teacher.profileEditPopup.birthDate')}
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
                                    <small style={{
                                        fontSize: isMobile ? '11px' : '12px',
                                        color: '#6b7280',
                                        display: 'block',
                                        marginTop: '6px'
                                    }}>
                                        {t('teacher.profileEditPopup.dateFormat')}
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Професійна інформація (закоментована, залишаємо як є) */}
                        {/* <div style={{
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
                                {t('teacher.editPopup.currentProfessionalInfo')}
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
                                        {t('teacher.profile.teacherType')}
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
                                        {t('teacher.profile.qualificationCategory')}
                                    </div>
                                    <div style={{
                                        fontSize: isMobile ? '14px' : '15px',
                                        fontWeight: '500',
                                        color: '#1f2937',
                                        wordBreak: 'break-word'
                                    }}>
                                        {getQualificationTranslation(userData.category)}
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
                                        {t('teacher.profile.subjects')}
                                    </div>
                                    <div style={{
                                        fontSize: isMobile ? '14px' : '15px',
                                        fontWeight: '500',
                                        color: '#1f2937',
                                        wordBreak: 'break-word'
                                    }}>
                                        {userData.positions && userData.positions.length > 0
                                            ? userData.positions.map(s => translateSubject(s)).join(', ')
                                            : t('common.notSpecified')}
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
                                    {t('teacher.editPopup.contactAdmin')}
                                </p>
                            </div>
                        </div> */}

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
                                {t('teacher.profileEditPopup.cancel')}
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
                                {t('teacher.profileEditPopup.save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTeacherPopup;