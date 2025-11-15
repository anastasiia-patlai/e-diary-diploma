import React, { useState } from "react";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaBriefcase,
    FaBirthdayCake,
    FaCalendar,
    FaUserCog,
    FaEdit
} from "react-icons/fa";
import EditAdminPopup from "./EditAdminPopup";
import Notification from "./Notification"; // Додайте цей імпорт

const AdminInfo = ({ userData }) => {
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [currentUserData, setCurrentUserData] = useState(userData);
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" }); // Додайте стан для сповіщення

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

    const getRoleDisplayName = (role) => {
        const roles = {
            'admin': 'Адміністратор',
            'teacher': 'Вчитель',
            'student': 'Учень',
            'parent': 'Батько'
        };
        return roles[role] || 'Користувач';
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

            console.log('🔄 Початок збереження даних:', { databaseName, userId, updatedData });

            if (!databaseName || !userId) {
                throw new Error('Не вдалося знайти дані для оновлення в localStorage');
            }

            const response = await fetch(`/api/user/me?databaseName=${encodeURIComponent(databaseName)}&userId=${encodeURIComponent(userId)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });

            console.log('📡 Статус відповіді:', response.status);

            const result = await response.json();
            console.log('📦 Відповідь сервера:', result);

            if (!response.ok) {
                throw new Error(result.message || `Помилка сервера: ${response.status}`);
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

                // Замість alert використовуємо кастомне сповіщення
                showNotification('Дані успішно оновлено!');
                setShowEditPopup(false);
            } else {
                throw new Error(result.message || 'Помилка при оновленні');
            }

        } catch (error) {
            console.error('Помилка збереження:', error);
            // Показуємо сповіщення про помилку
            showNotification(`Помилка при збереженні даних: ${error.message}`, "error");
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
                fontSize: '18px',
                color: '#666'
            }}>
                Завантаження інформації...
            </div>
        );
    }

    return (
        <>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '20px'
                }}>
                    <button
                        onClick={() => setShowEditPopup(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        <FaEdit size={16} />
                        Редагувати профіль
                    </button>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '32px',
                        paddingBottom: '24px',
                        borderBottom: '2px solid #f3f4f6'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(105, 180, 185, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '20px'
                        }}>
                            <FaUser size={32} color="rgba(105, 180, 185, 1)" />
                        </div>
                        <div>
                            <h1 style={{
                                margin: 0,
                                fontSize: '28px',
                                fontWeight: '700',
                                color: '#1f2937'
                            }}>
                                {displayData.fullName}
                            </h1>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '8px'
                            }}>
                                <FaUserCog color="rgba(105, 180, 185, 1)" />
                                <span style={{
                                    fontSize: '16px',
                                    color: '#6b7280',
                                    fontWeight: '500'
                                }}>
                                    {getRoleDisplayName(displayData.role)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '24px'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <h3 style={{
                                    margin: '0 0 16px 0',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Контактна інформація
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FaEnvelope color="rgba(105, 180, 185, 1)" />
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                marginBottom: '2px'
                                            }}>
                                                Електронна пошта
                                            </div>
                                            <div style={{
                                                fontSize: '16px',
                                                color: '#1f2937',
                                                fontWeight: '500'
                                            }}>
                                                {displayData.email || 'Не вказано'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FaPhone color="rgba(105, 180, 185, 1)" />
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                marginBottom: '2px'
                                            }}>
                                                Телефон
                                            </div>
                                            <div style={{
                                                fontSize: '16px',
                                                color: '#1f2937',
                                                fontWeight: '500'
                                            }}>
                                                {displayData.phone || 'Не вказано'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <h3 style={{
                                    margin: '0 0 16px 0',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Профільна інформація
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FaBriefcase color="rgba(105, 180, 185, 1)" />
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                marginBottom: '2px'
                                            }}>
                                                Посада
                                            </div>
                                            <div style={{
                                                fontSize: '16px',
                                                color: '#1f2937',
                                                fontWeight: '500'
                                            }}>
                                                {displayData.position || 'Не вказано'}
                                            </div>
                                            {displayData.positions && displayData.positions.length > 1 && (
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#6b7280',
                                                    marginTop: '4px'
                                                }}>
                                                    Додатково: {displayData.positions.slice(1).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FaBirthdayCake color="rgba(105, 180, 185, 1)" />
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                marginBottom: '2px'
                                            }}>
                                                Дата народження
                                            </div>
                                            <div style={{
                                                fontSize: '16px',
                                                color: '#1f2937',
                                                fontWeight: '500'
                                            }}>
                                                {formatDate(displayData.birthDate)}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FaCalendar color="rgba(105, 180, 185, 1)" />
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                marginBottom: '2px'
                                            }}>
                                                Дата реєстрації
                                            </div>
                                            <div style={{
                                                fontSize: '16px',
                                                color: '#1f2937',
                                                fontWeight: '500'
                                            }}>
                                                {formatDate(displayData.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '32px',
                        padding: '20px',
                        backgroundColor: 'rgba(105, 180, 185, 0.05)',
                        border: '1px solid rgba(105, 180, 185, 0.2)',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                        }}>
                            <FaUserCog color="rgba(105, 180, 185, 1)" />
                            <span style={{
                                fontSize: '16px',
                                fontWeight: '600',
                            }}>
                                Статус: {getRoleDisplayName(displayData.role)}
                            </span>
                        </div>
                        <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#6b7280'
                        }}>
                            {displayData.role === 'admin'
                                ? 'Ви маєте повний доступ до всіх функцій системи управління навчальним закладом'
                                : 'Обмежений доступ до функцій системи'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {showEditPopup && (
                <EditAdminPopup
                    userData={displayData}
                    onSave={handleSave}
                    onClose={() => setShowEditPopup(false)}
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