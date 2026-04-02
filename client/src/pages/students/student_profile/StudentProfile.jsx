import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaBirthdayCake,
    FaCalendar,
    FaUserCog,
    FaEdit,
    FaPlusCircle,
    FaGraduationCap,
    FaUsers,
    FaChalkboardTeacher,
    FaLock
} from "react-icons/fa";
import EditStudentPopup from "./EditStudentPopup";
import Notification from "./Notification";

const StudentProfile = ({ userData }) => {
    const { t } = useTranslation();
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [currentUserData, setCurrentUserData] = useState(userData);
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Завантаження повних даних студента
    useEffect(() => {
        const loadStudentData = async () => {
            if (!userData?.id) return;

            try {
                setLoading(true);
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                const { databaseName } = userInfo;

                if (!databaseName) {
                    console.error("❌ Немає databaseName в localStorage");
                    return;
                }

                console.log("🔄 Завантаження повних даних студента...");

                const response = await fetch(`/api/users/${userData.id}?databaseName=${encodeURIComponent(databaseName)}`);
                const result = await response.json();

                if (response.ok && result) {
                    console.log("Повні дані студента завантажено:", result);
                    setCurrentUserData(prev => ({
                        ...prev,
                        ...result,
                        group: result.group,
                        dateOfBirth: result.dateOfBirth,
                        parents: result.parents
                    }));
                } else {
                    console.error("Помилка завантаження даних:", result);
                }
            } catch (error) {
                console.error("Помилка завантаження даних студента:", error);
            } finally {
                setLoading(false);
            }
        };

        loadStudentData();
    }, [userData?.id]);

    useEffect(() => {
        console.log("StudentInfo - отримані дані:", currentUserData);
        if (currentUserData) {
            console.log("Дані з БД для студента:");
            console.log("- group:", currentUserData.group);
            console.log("- dateOfBirth:", currentUserData.dateOfBirth);
            console.log("- parents:", currentUserData.parents);
            console.log("- Повний об'єкт:", JSON.stringify(currentUserData, null, 2));
        }
    }, [currentUserData]);

    const handleCreateNewSchool = () => {
        navigate('/');
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
            'admin': t('student.roles.admin'),
            'teacher': t('student.roles.teacher'),
            'student': t('student.roles.student'),
            'parent': t('student.roles.parent')
        };
        return roles[role] || t('student.roles.user');
    };

    const getGroupDisplayName = (group) => {
        if (!group) return t('common.notSpecified');
        if (typeof group === 'object') {
            return group.name || t('common.notSpecified');
        }
        return group;
    };

    const getParentsList = (parents) => {
        if (!parents || parents.length === 0) return t('common.notSpecified');
        return parents.map(parent => parent.fullName).join(', ');
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

            console.log('💾 Збереження даних студента:', updatedData);

            if (!databaseName || !userId) {
                throw new Error(t('student.errors.noDataFound'));
            }

            const allowedFields = ['fullName', 'email', 'phone', 'dateOfBirth', 'group'];
            const dataToSend = {};

            allowedFields.forEach(field => {
                if (updatedData[field] !== undefined) {
                    dataToSend[field] = updatedData[field];
                }
            });

            console.log('✅ Відправляємо тільки дозволені поля:', dataToSend);

            const response = await fetch(`/api/user/me?databaseName=${encodeURIComponent(databaseName)}&userId=${encodeURIComponent(userId)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `${t('student.errors.serverError')} ${response.status}`);
            }

            if (result.success) {
                setCurrentUserData(prevData => ({
                    ...prevData,
                    fullName: result.user.fullName || prevData.fullName,
                    email: result.user.email || prevData.email,
                    phone: result.user.phone || prevData.phone,
                    dateOfBirth: result.user.dateOfBirth || prevData.dateOfBirth,
                    group: result.user.group || prevData.group
                }));

                const updatedUserInfo = {
                    ...userInfo,
                    fullName: result.user.fullName,
                    email: result.user.email,
                    phone: result.user.phone,
                    dateOfBirth: result.user.dateOfBirth,
                    group: result.user.group
                };
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

                showNotification(t('student.notifications.updateSuccess'));
                setShowEditPopup(false);
            } else {
                throw new Error(result.message || t('student.errors.updateError'));
            }

        } catch (error) {
            console.error('Помилка збереження даних студента:', error);
            showNotification(`${t('student.errors.saveError')}: ${error.message}`, "error");
            throw error;
        }
    };

    const getDisplayData = () => {
        const data = currentUserData || userData;
        if (!data) return null;

        let group = data.group;
        if (group && typeof group === 'object') {
            group = group;
        }

        const birthDate = data.dateOfBirth || data.birthDate;

        const result = {
            ...data,
            group: group || null,
            birthDate: birthDate,
            parents: data.parents || []
        };

        return result;
    };

    const displayData = getDisplayData();

    if (loading) {
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
                {t('student.errors.loadError')}
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
                {/* <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: isMobile ? '12px' : '16px',
                    marginBottom: isMobile ? '16px' : '24px',
                    flexWrap: 'wrap'
                }}>
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
                        {t('student.buttons.editProfile')}
                    </button>
                </div> */}

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
                            <FaGraduationCap size={isMobile ? 24 : 32} color="rgba(105, 180, 185, 1)" />
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
                                {displayData.group && (
                                    <>
                                        <span style={{ color: '#d1d5db' }}>•</span>
                                        <FaUsers color="rgba(105, 180, 185, 1)" size={isMobile ? 12 : 14} />
                                        <span style={{
                                            fontSize: isMobile ? '14px' : '16px',
                                            color: '#6b7280',
                                            fontWeight: '500'
                                        }}>
                                            {getGroupDisplayName(displayData.group)}
                                        </span>
                                    </>
                                )}
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
                                {t('student.profile.personalInfo')}
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
                                    position: 'relative'
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
                                        <FaGraduationCap color="rgba(105, 180, 185, 1)" size={isMobile ? 14 : 16} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: isMobile ? '13px' : '14px',
                                            color: '#6b7280',
                                            marginBottom: '4px'
                                        }}>
                                            {t('student.profile.group')}
                                        </div>
                                        <div style={{
                                            fontSize: isMobile ? '15px' : '16px',
                                            color: '#1f2937',
                                            fontWeight: '500',
                                            wordBreak: 'break-word'
                                        }}>
                                            {getGroupDisplayName(displayData.group)}
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
                                        <FaBirthdayCake color="rgba(105, 180, 185, 1)" size={isMobile ? 14 : 16} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: isMobile ? '13px' : '14px',
                                            color: '#6b7280',
                                            marginBottom: '4px'
                                        }}>
                                            {t('student.profile.birthDate')}
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

                                {/* <div style={{
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
                                            {t('student.profile.enrollmentDate')}
                                        </div>
                                        <div style={{
                                            fontSize: isMobile ? '15px' : '16px',
                                            color: '#1f2937',
                                            fontWeight: '500'
                                        }}>
                                            {formatDate(displayData.createdAt)}
                                        </div>
                                    </div>
                                </div> */}

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: isMobile ? '10px' : '12px',
                                    padding: isMobile ? '12px' : '16px',
                                    backgroundColor: 'rgba(249, 250, 251, 0.5)',
                                    borderRadius: '8px',
                                    border: '1px solid #f3f4f6'
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
                                        <FaUsers color="rgba(105, 180, 185, 1)" size={isMobile ? 14 : 16} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: isMobile ? '13px' : '14px',
                                            color: '#6b7280',
                                            marginBottom: '4px'
                                        }}>
                                            {t('student.profile.parents')}
                                        </div>
                                        <div style={{
                                            fontSize: isMobile ? '15px' : '16px',
                                            color: '#1f2937',
                                            fontWeight: '500',
                                            wordBreak: 'break-word'
                                        }}>
                                            {getParentsList(displayData.parents)}
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
                                {t('student.profile.contactInfo')}
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
                                            {t('student.profile.login')}
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
                                            {t('student.profile.phone')}
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
                            </div>
                        </div>
                    </div>

                    <div style={{
                        marginTop: useColumns ? '10px' : '10px',
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
                            <FaChalkboardTeacher color="rgba(105, 180, 185, 1)" size={isMobile ? 14 : 16} />
                            <span style={{
                                fontSize: isMobile ? '15px' : '16px',
                                fontWeight: '600',
                            }}>
                                {t('student.profile.status')}: {getRoleDisplayName(displayData.role)}
                            </span>
                        </div>
                        <p style={{
                            margin: 0,
                            fontSize: isMobile ? '13px' : '14px',
                            color: '#6b7280',
                            lineHeight: '1.5'
                        }}>
                            {t('student.profile.accessDescription')}
                        </p>
                    </div>
                </div>
            </div>

            {showEditPopup && (
                <EditStudentPopup
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

export default StudentProfile;