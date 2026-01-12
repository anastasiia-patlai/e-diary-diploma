import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
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
    FaDatabase,
    FaChalkboardTeacher,
    FaGraduationCap,
    FaBook,
    FaLock
} from "react-icons/fa";
import EditTeacherPopup from "./EditTeacherPopup";
import Notification from "./Notification";

const TeacherInfo = ({ userData }) => {
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [currentUserData, setCurrentUserData] = useState(userData);
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Завантаження повних даних вчителя
    useEffect(() => {
        const loadTeacherData = async () => {
            if (!userData?.id) return;

            try {
                setLoading(true);
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                const { databaseName } = userInfo;

                if (!databaseName) {
                    console.error("❌ Немає databaseName в localStorage");
                    return;
                }

                console.log("🔄 Завантаження повних даних вчителя...");

                // Завантажуємо дані через API /users/:id
                const response = await fetch(`/api/users/${userData.id}?databaseName=${encodeURIComponent(databaseName)}`);
                const result = await response.json();

                if (response.ok && result) {
                    console.log("Повні дані вчителя завантажено:", result);
                    setCurrentUserData(prev => ({
                        ...prev,
                        ...result,
                        // Зберігаємо всі поля
                        teacherType: result.teacherType,
                        category: result.category,
                        dateOfBirth: result.dateOfBirth,
                        allowedCategories: result.allowedCategories
                    }));
                } else {
                    console.error("Помилка завантаження даних:", result);
                }
            } catch (error) {
                console.error("Помилка завантаження даних вчителя:", error);
            } finally {
                setLoading(false);
            }
        };

        loadTeacherData();
    }, [userData?.id]);


    useEffect(() => {
        console.log("TeacherInfo - отримані дані:", currentUserData);
        if (currentUserData) {
            console.log("Дані з БД для вчителя:");
            console.log("- teacherType:", currentUserData.teacherType);
            console.log("- category:", currentUserData.category);
            console.log("- dateOfBirth:", currentUserData.dateOfBirth);
            console.log("- allowedCategories:", currentUserData.allowedCategories);
            console.log("- Повний об'єкт:", JSON.stringify(currentUserData, null, 2));
        }
    }, [currentUserData]);

    const handleCreateNewSchool = () => {
        navigate('/');
    };

    // ПЕРЕВІРКА, ЧИ КОРИСТУВАЧ Є ДИРЕКТОРОМ
    const isDirector = () => {
        const displayData = currentUserData || userData;
        const position = displayData?.position?.toLowerCase();
        return position?.includes('директор') ||
            position?.includes('завідувач') ||
            position?.includes('керівник');
    };

    // Відслідковуємо зміну розміру вікна
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

    // Функція для отримання відображуваного типу викладача з allowedCategories
    const getTeacherTypeFromAllowedCategories = (allowedCategories) => {
        if (!allowedCategories || !Array.isArray(allowedCategories) || allowedCategories.length === 0) {
            return '';
        }

        console.log("Конвертуємо allowedCategories в teacherType:", allowedCategories);

        const categories = allowedCategories;
        if (categories.includes('young') && categories.includes('middle') && categories.includes('senior')) {
            return 'all';
        } else if (categories.includes('middle') && categories.includes('senior')) {
            return 'middle-senior';
        } else if (categories.includes('young')) {
            return 'young';
        } else if (categories.includes('middle')) {
            return 'middle';
        } else if (categories.includes('senior')) {
            return 'senior';
        }

        return '';
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

            console.log('💾 Збереження даних вчителя:', updatedData);

            if (!databaseName || !userId) {
                throw new Error('Не вдалося знайти дані для оновлення в localStorage');
            }

            // Перевіряємо, що тільки дозволені поля змінюються
            const allowedFields = ['fullName', 'email', 'phone', 'dateOfBirth'];
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
                throw new Error(result.message || `Помилка сервера: ${response.status}`);
            }

            if (result.success) {
                // Оновлюємо лише дозволені поля
                setCurrentUserData(prevData => ({
                    ...prevData,
                    fullName: result.user.fullName || prevData.fullName,
                    email: result.user.email || prevData.email,
                    phone: result.user.phone || prevData.phone,
                    dateOfBirth: result.user.dateOfBirth || prevData.dateOfBirth
                }));

                const updatedUserInfo = {
                    ...userInfo,
                    fullName: result.user.fullName,
                    email: result.user.email,
                    phone: result.user.phone,
                    dateOfBirth: result.user.dateOfBirth
                };
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

                showNotification('Дані успішно оновлено!');
                setShowEditPopup(false);
            } else {
                throw new Error(result.message || 'Помилка при оновленні');
            }

        } catch (error) {
            console.error('Помилка збереження даних вчителя:', error);
            showNotification(`Помилка при збереженні даних: ${error.message}`, "error");
            throw error;
        }
    };

    // Обробка даних для відображення
    const getDisplayData = () => {
        const data = currentUserData || userData;
        if (!data) return null;

        console.log("Обробка даних для відображення:");
        console.log("Оригінальні дані:", data);

        // Визначаємо teacherType з пріоритетом:
        // 1. Якщо є teacherType в даних
        // 2. Якщо немає teacherType, але є allowedCategories - конвертуємо
        let teacherType = data.teacherType;

        if (!teacherType && data.allowedCategories && Array.isArray(data.allowedCategories) && data.allowedCategories.length > 0) {
            teacherType = getTeacherTypeFromAllowedCategories(data.allowedCategories);
            console.log("Конвертовано allowedCategories -> teacherType:", teacherType);
        }

        console.log("Фінальний teacherType:", teacherType);

        // Визначаємо предмети
        let positions = data.positions;
        if ((!positions || positions.length === 0) && data.position) {
            if (data.position.includes(',')) {
                positions = data.position.split(',').map(subject => subject.trim()).filter(subject => subject);
            } else {
                positions = [data.position];
            }
        }

        // Визначаємо дату народження
        const birthDate = data.dateOfBirth || data.birthDate;

        const result = {
            ...data,
            teacherType: teacherType || '',
            positions: positions || [],
            birthDate: birthDate,
            category: data.category || '',
            position: data.position || ''
        };

        console.log("Результат обробки:", {
            teacherType: result.teacherType,
            category: result.category,
            birthDate: result.birthDate,
            formattedBirthDate: formatDate(result.birthDate)
        });

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
                Завантаження інформації...
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
                Не вдалося завантажити дані
            </div>
        );
    }

    const useColumns = !isMobile && !isTablet; // Тільки для великих екранів

    return (
        <>
            <div style={{
                maxWidth: useColumns ? '1000px' : (isMobile ? '100%' : '800px'),
                margin: '0 auto',
                padding: isMobile ? '0 16px' : '0'
            }}>
                {/* КНОПКИ ДІЙ */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: isMobile ? '12px' : '16px',
                    marginBottom: isMobile ? '16px' : '24px',
                    flexWrap: 'wrap'
                }}>
                    {/* КНОПКА СТВОРЕННЯ НОВОЇ ШКОЛИ - ТІЛЬКИ ДЛЯ ДИРЕКТОРА */}
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
                            {isMobile ? 'Створити щоденник' : 'Створити новий щоденник'}
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
                        Редагувати профіль
                    </button>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: isMobile ? '20px 16px' : '32px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e5e7eb'
                }}>
                    {/* ЗАГОЛОВОК З ФОТО */}
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
                            <FaChalkboardTeacher size={isMobile ? 24 : 32} color="rgba(105, 180, 185, 1)" />
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

                    {/* ОСНОВНИЙ КОНТЕНТ - АДАПТИВНА СТРУКТУРА */}
                    <div style={{
                        display: 'flex',
                        flexDirection: useColumns ? 'row' : 'column',
                        gap: useColumns ? '40px' : (isMobile ? '24px' : '32px')
                    }}>
                        {/* ПРОФІЛЬНА ІНФОРМАЦІЯ - ЛІВИЙ СТОВПЧИК НА ДЕСКТОПІ */}
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
                                Профільна інформація
                            </h3>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: isMobile ? '14px' : '16px'
                            }}>
                                {/* Тип викладача*/}
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
                                        <FaLock color="rgba(105, 180, 185, 1)" size={isMobile ? 14 : 16} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: isMobile ? '13px' : '14px',
                                            color: '#6b7280',
                                            marginBottom: '4px'
                                        }}>
                                            Тип викладача
                                        </div>
                                        <div style={{
                                            fontSize: isMobile ? '15px' : '16px',
                                            color: '#1f2937',
                                            fontWeight: '500',
                                            wordBreak: 'break-word'
                                        }}>
                                            {getTeacherTypeDisplayName(displayData.teacherType)}
                                        </div>
                                    </div>
                                </div>

                                {/* Категорія кваліфікації (ТІЛЬКИ ДЛЯ ПЕРЕГЛЯДУ) */}
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
                                        <FaLock color="rgba(105, 180, 185, 1)" size={isMobile ? 14 : 16} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: isMobile ? '13px' : '14px',
                                            color: '#6b7280',
                                            marginBottom: '4px'
                                        }}>
                                            Категорія кваліфікації
                                        </div>
                                        <div style={{
                                            fontSize: isMobile ? '15px' : '16px',
                                            color: '#1f2937',
                                            fontWeight: '500',
                                            wordBreak: 'break-word'
                                        }}>
                                            {displayData.category || 'Не вказано'}
                                        </div>
                                    </div>
                                </div>

                                {/* Дата народження */}
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
                                            Дата народження
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

                                {/* Дата реєстрації */}
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
                                            Дата реєстрації
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

                        {/* КОНТАКТНА ІНФОРМАЦІЯ ТА ПРЕДМЕТИ - ПРАВИЙ СТОВПЧИК НА ДЕСКТОПІ */}
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
                                Контактна інформація та предмети
                            </h3>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: isMobile ? '14px' : '16px'
                            }}>
                                {/* Email */}
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
                                            Електронна пошта
                                        </div>
                                        <div style={{
                                            fontSize: isMobile ? '15px' : '16px',
                                            color: '#1f2937',
                                            fontWeight: '500',
                                            wordBreak: 'break-word'
                                        }}>
                                            {displayData.email || 'Не вказано'}
                                        </div>
                                    </div>
                                </div>

                                {/* Телефон */}
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
                                            Телефон
                                        </div>
                                        <div style={{
                                            fontSize: isMobile ? '15px' : '16px',
                                            color: '#1f2937',
                                            fontWeight: '500',
                                            wordBreak: 'break-word'
                                        }}>
                                            {displayData.phone || 'Не вказано'}
                                        </div>
                                    </div>
                                </div>

                                {/* Предмети */}
                                <div style={{
                                    padding: isMobile ? '16px 12px' : '20px',
                                    backgroundColor: 'rgba(105, 180, 185, 0.05)',
                                    border: '1px solid rgba(105, 180, 185, 0.2)',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: isMobile ? '12px' : '16px'
                                    }}>
                                        <FaBook color="rgba(105, 180, 185, 1)" size={isMobile ? 16 : 18} />
                                        <h4 style={{
                                            margin: 0,
                                            fontSize: isMobile ? '16px' : '18px',
                                            fontWeight: '600',
                                            color: '#1f2937'
                                        }}>
                                            Викладає предмети
                                        </h4>
                                    </div>

                                    {displayData.positions && displayData.positions.length > 0 ? (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: isMobile ? '10px' : '12px'
                                        }}>
                                            {displayData.positions.map((subject, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        padding: isMobile ? '10px 12px' : '12px 16px',
                                                        backgroundColor: 'white',
                                                        borderRadius: '6px',
                                                        border: '1px solid #e5e7eb'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: isMobile ? '28px' : '32px',
                                                        height: isMobile ? '28px' : '32px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        <span style={{
                                                            fontSize: isMobile ? '14px' : '16px',
                                                            fontWeight: '600',
                                                            color: 'rgba(105, 180, 185, 1)'
                                                        }}>
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        fontSize: isMobile ? '15px' : '16px',
                                                        color: '#1f2937',
                                                        fontWeight: '500',
                                                        flex: 1
                                                    }}>
                                                        {subject}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: isMobile ? '20px' : '24px',
                                            color: '#6b7280',
                                            fontSize: isMobile ? '14px' : '16px'
                                        }}>
                                            Предмети не додані
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ДОДАТКОВИЙ ІНФОРМАЦІЙНИЙ БЛОК */}
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
                                Статус: {getRoleDisplayName(displayData.role)}
                            </span>
                        </div>
                        <p style={{
                            margin: 0,
                            fontSize: isMobile ? '13px' : '14px',
                            color: '#6b7280',
                            lineHeight: '1.5'
                        }}>
                            Ви маєте доступ до функцій вчителя: ведення журналу, виставлення оцінок,
                            управління домашніми завданнями та комунікація з учнями та батьками.
                        </p>
                    </div>
                </div>
            </div>

            {showEditPopup && (
                <EditTeacherPopup
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

export default TeacherInfo;