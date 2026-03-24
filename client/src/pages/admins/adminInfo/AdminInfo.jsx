import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaBriefcase,
    FaBirthdayCake,
    FaCalendar,
    FaUserCog,
    FaEdit,
    FaPlusCircle,
    FaDatabase
} from "react-icons/fa";
import EditAdminPopup from "./EditAdminPopup";
import Notification from "./Notification";

const AdminInfo = ({ userData }) => {
    const { t } = useTranslation();
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [currentUserData, setCurrentUserData] = useState(userData);
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
    const navigate = useNavigate();

    // Функція для перекладу посади
    const translatePosition = (position) => {
        if (!position) return t('common.notSpecified');

        // Мапа відповідності українських назв до ключів
        const positionMap = {
            'Директор': 'director',
            'Заступник директора': 'deputyDirector',
            'Завідувач навчальної частини': 'headTeacher',
            'Методист': 'methodologist',
            'Психолог': 'psychologist',
            'Соціальний педагог': 'socialPedagogue',
            'Principal': 'director',
            'Deputy Principal': 'deputyDirector',
            'Head Teacher': 'headTeacher',
            'Methodologist': 'methodologist',
            'Psychologist': 'psychologist',
            'Social Pedagogue': 'socialPedagogue'
        };

        const key = positionMap[position];
        if (key) {
            const translated = t(`admin.positions.${key}`);
            // Якщо переклад існує, повертаємо його, інакше повертаємо оригінал
            if (translated && translated !== `admin.positions.${key}`) {
                return translated;
            }
        }

        return position;
    };

    const handleCreateNewSchool = () => {
        navigate('/');
    };

    const isDirector = () => {
        const displayData = currentUserData || userData;
        const position = displayData?.position?.toLowerCase();
        return position?.includes('директор') ||
            position?.includes('завідувач') ||
            position?.includes('керівник');
    };

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width <= 768);
            setIsTablet(width <= 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const getRoleDisplayName = (role) => {
        const roles = {
            'admin': t('admin.roles.admin'),
            'teacher': t('admin.roles.teacher'),
            'student': t('admin.roles.student'),
            'parent': t('admin.roles.parent')
        };
        return roles[role] || t('admin.roles.user');
    };

    const showNotification = (message, type = "success") => {
        setNotification({ show: true, message, type });
    };

    const hideNotification = () => {
        setNotification({ show: false, message: "", type: "success" });
    };

    const handleSave = async (updatedData) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const { databaseName, userId } = userInfo;

            console.log('Початок збереження даних:', { databaseName, userId, updatedData });

            if (!databaseName || !userId) {
                throw new Error(t('admin.errors.noDataFound'));
            }

            const response = await fetch(`/api/user/me?databaseName=${encodeURIComponent(databaseName)}&userId=${encodeURIComponent(userId)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });

            console.log('Статус відповіді:', response.status);

            const result = await response.json();
            console.log('Відповідь сервера:', result);

            if (!response.ok) {
                throw new Error(result.message || `${t('admin.errors.serverError')} ${response.status}`);
            }

            if (result.success) {
                setCurrentUserData(prevData => ({
                    ...prevData,
                    ...result.user
                }));

                const updatedUserInfo = {
                    ...userInfo,
                    fullName: result.user.fullName,
                    email: result.user.email,
                    phone: result.user.phone,
                    position: result.user.position,
                    positions: result.user.positions
                };
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

                console.log('Дані успішно оновлено в стані:', result.user);

                showNotification(t('admin.notifications.updateSuccess'));
                setShowEditPopup(false);
            } else {
                throw new Error(result.message || t('admin.errors.updateError'));
            }

        } catch (error) {
            console.error('Помилка збереження:', error);
            showNotification(`${t('admin.errors.saveError')}: ${error.message}`, "error");
            throw error;
        }
    };

    const displayData = currentUserData || userData;

    if (!displayData) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                fontSize: isMobile ? '16px' : '18px',
                color: '#666'
            }}>
                {t('common.loading')}
            </div>
        );
    }

    const useColumns = !isMobile && !isTablet;

    return (
        <>
            <div style={{
                maxWidth: useColumns ? '1000px' : (isMobile ? '100%' : '800px'),
                margin: '0 auto',
                padding: isMobile ? '0 16px' : '0'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: isMobile ? '12px' : '16px',
                    marginBottom: isMobile ? '16px' : '24px',
                    flexWrap: 'wrap'
                }}>
                    {isDirector() && (
                        <button
                            onClick={handleCreateNewSchool}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: isMobile ? '6px' : '8px',
                                padding: isMobile ? '10px 16px' : '12px 24px',
                                backgroundColor: 'rgba(85, 160, 165, 1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: isMobile ? '14px' : '16px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                width: isMobile ? '100%' : 'auto',
                                maxWidth: isMobile ? '190px' : 'none'
                            }}
                            onMouseOver={(e) => {
                                if (!isMobile) {
                                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isMobile) {
                                    e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                                }
                            }}
                        >
                            <FaPlusCircle size={isMobile ? 14 : 16} />
                            {isMobile ? t('admin.buttons.createDiary') : t('admin.buttons.createNewDiary')}
                        </button>
                    )}

                    <button
                        onClick={() => setShowEditPopup(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '6px' : '8px',
                            padding: isMobile ? '10px 16px' : '12px 24px',
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            width: isMobile ? '100%' : 'auto',
                            maxWidth: isMobile ? '190px' : 'none'
                        }}
                        onMouseOver={(e) => {
                            if (!isMobile) {
                                e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!isMobile) {
                                e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                            }
                        }}
                    >
                        <FaEdit size={isMobile ? 14 : 16} />
                        {t('admin.buttons.editProfile')}
                    </button>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: isMobile ? '20px 16px' : '32px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'center' : 'flex-start',
                        marginBottom: isMobile ? '24px' : '32px',
                        paddingBottom: isMobile ? '20px' : '24px',
                        borderBottom: '2px solid #f3f4f6'
                    }}>
                        <div style={{
                            width: isMobile ? '70px' : '80px',
                            height: isMobile ? '70px' : '80px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(105, 180, 185, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: isMobile ? '0' : '20px',
                            marginBottom: isMobile ? '16px' : '0',
                            flexShrink: 0
                        }}>
                            <FaUser size={isMobile ? 24 : 32} color="rgba(105, 180, 185, 1)" />
                        </div>
                        <div style={{
                            textAlign: isMobile ? 'center' : 'left',
                            width: isMobile ? '100%' : 'auto',
                            flex: 1
                        }}>
                            <h1 style={{
                                margin: 0,
                                fontSize: isMobile ? '22px' : '28px',
                                fontWeight: '700',
                                color: '#1f2937',
                                lineHeight: '1.2'
                            }}>
                                {displayData.fullName}
                            </h1>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '8px',
                                justifyContent: isMobile ? 'center' : 'flex-start',
                                flexWrap: 'wrap'
                            }}>
                                <FaUserCog color="rgba(105, 180, 185, 1)" size={isMobile ? 14 : 16} />
                                <span style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    color: '#6b7280',
                                    fontWeight: '500'
                                }}>
                                    {getRoleDisplayName(displayData.role)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: useColumns ? 'row' : 'column',
                        gap: useColumns ? '40px' : (isMobile ? '24px' : '32px')
                    }}>
                        <div style={{
                            flex: useColumns ? 1 : 'none',
                            width: useColumns ? '50%' : '100%'
                        }}>
                            <h3 style={{
                                margin: '0 0 16px 0',
                                fontSize: isMobile ? '16px' : '18px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                {t('admin.profile.profileInfo')}
                            </h3>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: isMobile ? '14px' : '16px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: isMobile ? '10px' : '12px',
                                    padding: isMobile ? '12px' : '16px',
                                    backgroundColor: 'rgba(249, 250, 251, 0.5)',
                                    borderRadius: '8px',
                                    border: '1px solid #f3f4f6',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{
                                        width: isMobile ? '36px' : '40px',
                                        height: isMobile ? '36px' : '40px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <FaBriefcase color="rgba(105, 180, 185, 1)" size={isMobile ? 14 : 16} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: isMobile ? '13px' : '14px',
                                            color: '#6b7280',
                                            marginBottom: '4px'
                                        }}>
                                            {t('admin.profile.position')}
                                        </div>
                                        <div style={{
                                            fontSize: isMobile ? '15px' : '16px',
                                            color: '#1f2937',
                                            fontWeight: '500',
                                            wordBreak: 'break-word'
                                        }}>
                                            {translatePosition(displayData.position)}
                                        </div>
                                        {displayData.positions && displayData.positions.length > 1 && (
                                            <div style={{
                                                fontSize: isMobile ? '12px' : '13px',
                                                color: '#6b7280',
                                                marginTop: '6px',
                                                paddingTop: '6px',
                                                borderTop: '1px solid #e5e7eb',
                                                wordBreak: 'break-word'
                                            }}>
                                                <strong>{t('admin.profile.additionalSubjects')}:</strong> {displayData.positions.slice(1).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: isMobile ? '10px' : '12px',
                                    padding: isMobile ? '12px' : '16px',
                                    backgroundColor: 'rgba(249, 250, 251, 0.5)',
                                    borderRadius: '8px',
                                    border: '1px solid #f3f4f6',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{
                                        width: isMobile ? '36px' : '40px',
                                        height: isMobile ? '36px' : '40px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <FaBirthdayCake color="rgba(105, 180, 185, 1)" size={isMobile ? 14 : 16} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: isMobile ? '13px' : '14px',
                                            color: '#6b7280',
                                            marginBottom: '4px'
                                        }}>
                                            {t('admin.profile.birthDate')}
                                        </div>
                                        <div style={{
                                            fontSize: isMobile ? '15px' : '16px',
                                            color: '#1f2937',
                                            fontWeight: '500'
                                        }}>
                                            {formatDate(displayData.birthDate)}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: isMobile ? '10px' : '12px',
                                    padding: isMobile ? '12px' : '16px',
                                    backgroundColor: 'rgba(249, 250, 251, 0.5)',
                                    borderRadius: '8px',
                                    border: '1px solid #f3f4f6',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{
                                        width: isMobile ? '36px' : '40px',
                                        height: isMobile ? '36px' : '40px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <FaCalendar color="rgba(105, 180, 185, 1)" size={isMobile ? 14 : 16} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: isMobile ? '13px' : '14px',
                                            color: '#6b7280',
                                            marginBottom: '4px'
                                        }}>
                                            {t('admin.profile.registrationDate')}
                                        </div>
                                        <div style={{
                                            fontSize: isMobile ? '15px' : '16px',
                                            color: '#1f2937',
                                            fontWeight: '500'
                                        }}>
                                            {formatDate(displayData.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            flex: useColumns ? 1 : 'none',
                            width: useColumns ? '50%' : '100%'
                        }}>
                            <h3 style={{
                                margin: '0 0 16px 0',
                                fontSize: isMobile ? '16px' : '18px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                {t('admin.profile.contactInfo')}
                            </h3>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: isMobile ? '14px' : '16px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: isMobile ? '10px' : '12px',
                                    padding: isMobile ? '12px' : '16px',
                                    backgroundColor: 'rgba(249, 250, 251, 0.5)',
                                    borderRadius: '8px',
                                    border: '1px solid #f3f4f6',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{
                                        width: isMobile ? '36px' : '40px',
                                        height: isMobile ? '36px' : '40px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <FaEnvelope color="rgba(105, 180, 185, 1)" size={isMobile ? 14 : 16} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: isMobile ? '13px' : '14px',
                                            color: '#6b7280',
                                            marginBottom: '4px'
                                        }}>
                                            {t('admin.profile.email')}
                                        </div>
                                        <div style={{
                                            fontSize: isMobile ? '15px' : '16px',
                                            color: '#1f2937',
                                            fontWeight: '500',
                                            wordBreak: 'break-word'
                                        }}>
                                            {displayData.email || t('common.notSpecified')}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: isMobile ? '10px' : '12px',
                                    padding: isMobile ? '12px' : '16px',
                                    backgroundColor: 'rgba(249, 250, 251, 0.5)',
                                    borderRadius: '8px',
                                    border: '1px solid #f3f4f6',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{
                                        width: isMobile ? '36px' : '40px',
                                        height: isMobile ? '36px' : '40px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <FaPhone color="rgba(105, 180, 185, 1)" size={isMobile ? 14 : 16} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: isMobile ? '13px' : '14px',
                                            color: '#6b7280',
                                            marginBottom: '4px'
                                        }}>
                                            {t('admin.profile.phone')}
                                        </div>
                                        <div style={{
                                            fontSize: isMobile ? '15px' : '16px',
                                            color: '#1f2937',
                                            fontWeight: '500',
                                            wordBreak: 'break-word'
                                        }}>
                                            {displayData.phone || t('common.notSpecified')}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: useColumns ? '0' : '20px',
                                    padding: isMobile ? '16px 12px' : '20px',
                                    backgroundColor: 'rgba(105, 180, 185, 0.05)',
                                    border: '1px solid rgba(105, 180, 185, 0.2)',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: isMobile ? '6px' : '8px'
                                    }}>
                                        <FaUserCog color="rgba(105, 180, 185, 1)" size={isMobile ? 14 : 16} />
                                        <span style={{
                                            fontSize: isMobile ? '15px' : '16px',
                                            fontWeight: '600',
                                        }}>
                                            {t('admin.profile.status')}: {getRoleDisplayName(displayData.role)}
                                        </span>
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        fontSize: isMobile ? '13px' : '14px',
                                        color: '#6b7280',
                                        lineHeight: '1.5'
                                    }}>
                                        {displayData.role === 'admin'
                                            ? t('admin.profile.adminDescription')
                                            : t('admin.profile.limitedAccess')
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showEditPopup && (
                <EditAdminPopup
                    userData={displayData}
                    onSave={handleSave}
                    onClose={() => setShowEditPopup(false)}
                    isMobile={isMobile}
                />
            )}

            {notification.show && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={hideNotification}
                    duration={5000}
                />
            )}
        </>
    );
};

export default AdminInfo;