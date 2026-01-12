import React, { useState, useEffect } from "react";
import {
    FaHome,
    FaBook,
    FaChalkboardTeacher,
    FaCalendarAlt,
    FaUserCheck,
    FaTasks,
    FaChartBar,
    FaComments,
    FaFileAlt,
    FaCog,
    FaUserCircle,
    FaDoorOpen,
    FaClock,
    FaBars,
    FaTimes,
    FaUsers,
    FaBookOpen,
    FaClipboardList
} from "react-icons/fa";

// Імпортуйте ваші компоненти для вчителя (потрібно буде створити аналогічно Admin)
// import TeacherMainPage from "./teacher_tab/TeacherMainPage";
// import TeacherJournal from "./journal_tab/TeacherJournal";
// import TeacherSchedule from "./schedule_tab/TeacherSchedule";
// import TeacherAttendance from "./attendance_tab/TeacherAttendance";
// import TeacherHomework from "./homework_tab/TeacherHomework";
// import TeacherStudents from "./students_tab/TeacherStudents";
// import TeacherReports from "./reports_tab/TeacherReports";
import TeacherInfo from "./teacher_info/TeacherInfo";

const TeacherPage = ({ onLogout, userFullName }) => {
    const [activeSection, setActiveSection] = useState("Головна");
    const [userData, setUserData] = useState(null);
    const [databaseName, setDatabaseName] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        fetchUserData();

        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchUserData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const { databaseName: dbName, userId } = userInfo;

            setDatabaseName(dbName);

            if (dbName && userId) {
                const response = await fetch(`/api/user/me?databaseName=${encodeURIComponent(dbName)}&userId=${encodeURIComponent(userId)}`);

                if (response.ok) {
                    const data = await response.json();

                    if (data.success) {
                        setUserData(data.user);
                        return;
                    }
                }
            }

            // Запасний варіант з localStorage
            setUserData({
                fullName: userInfo.fullName || userFullName,
                role: userInfo.role || 'teacher',
                position: userInfo.position || 'Вчитель',
                subject: userInfo.subject || 'Математика',
                email: userInfo.email || 'teacher@school.edu.ua',
                phone: userInfo.phone || '+380990000000',
                createdAt: new Date().toISOString()
            });

        } catch (error) {
            console.error('Помилка отримання даних:', error);

            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            setUserData({
                fullName: userInfo.fullName || userFullName,
                role: userInfo.role || 'teacher',
                position: userInfo.position || 'Вчитель',
                subject: userInfo.subject || 'Математика',
                email: userInfo.email || 'teacher@school.edu.ua',
                phone: userInfo.phone || '+380990000000',
                createdAt: new Date().toISOString()
            });
        }
    };

    // Розділи для вчителя
    const teacherSections = [
        { name: "Головна", icon: <FaHome /> },
        { name: "Мій профіль", icon: <FaUserCircle /> },
        { name: "Журнал", icon: <FaBook /> },
        { name: "Відвідуваність", icon: <FaUserCheck /> },
        { name: "Домашні завдання", icon: <FaTasks /> },
        { name: "Мої учні", icon: <FaUsers /> },
        { name: "Мій розклад", icon: <FaCalendarAlt /> },
        { name: "Повідомлення", icon: <FaComments /> },
        { name: "Звіти", icon: <FaChartBar /> },
        { name: "Матеріали", icon: <FaBookOpen /> },
        { name: "Контрольні роботи", icon: <FaClipboardList /> },
        { name: "Налаштування предмету", icon: <FaCog /> }
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSectionClick = (sectionName) => {
        setActiveSection(sectionName);
        if (isMobile) {
            setIsMenuOpen(false);
        }
    };

    const renderTeacherContent = () => {
        switch (activeSection) {
            case "Головна":
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>Головна панель вчителя</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            Ласкаво просимо, {userData?.fullName || userFullName}!<br />
                            Предмет: {userData?.subject || 'Не вказано'}
                        </p>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '10px',
                                flex: '1',
                                minWidth: '200px'
                            }}>
                                <h4 style={{ marginTop: 0 }}>Найближчі уроки</h4>
                                <p>Понеділок, 9:00 - 9А клас</p>
                                <p>Понеділок, 10:00 - 10Б клас</p>
                            </div>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f0fdf4',
                                borderRadius: '10px',
                                flex: '1',
                                minWidth: '200px'
                            }}>
                                <h4 style={{ marginTop: 0 }}>Статистика</h4>
                                <p>Учнів: 45</p>
                                <p>Середній бал: 8.7</p>
                            </div>
                        </div>
                    </div>
                );

            case "Мій профіль":
                return userData ? <TeacherInfo userData={userData} isMobile={isMobile} /> : <div>Завантаження...</div>;

            case "Журнал":
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>Журнал успішності</h3>
                        <div style={{ marginTop: '20px' }}>
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                marginBottom: '20px',
                                flexWrap: 'wrap'
                            }}>
                                <select style={{ padding: '8px', borderRadius: '6px' }}>
                                    <option>Оберіть клас</option>
                                    <option>9А</option>
                                    <option>10Б</option>
                                </select>
                                <select style={{ padding: '8px', borderRadius: '6px' }}>
                                    <option>Оберіть предмет</option>
                                    <option>Математика</option>
                                    <option>Фізика</option>
                                </select>
                                <input
                                    type="date"
                                    style={{ padding: '8px', borderRadius: '6px' }}
                                />
                            </div>
                            <div style={{
                                overflowX: 'auto',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                            }}>
                                <p style={{ padding: '20px', textAlign: 'center' }}>
                                    Тут буде таблиця з оцінками учнів
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case "Відвідуваність":
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>Відвідуваність</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            Тут можна відмічати присутність учнів на уроках
                        </p>
                    </div>
                );

            case "Домашні завдання":
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>Домашні завдання</h3>
                        <div style={{ marginTop: '20px' }}>
                            <button style={{
                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                marginBottom: '20px'
                            }}>
                                + Створити завдання
                            </button>
                            <div style={{
                                display: 'grid',
                                gap: '15px',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
                            }}>
                                {/* Приклад завдань */}
                                <div style={{
                                    padding: '15px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}>
                                    <h4>Завдання з математики</h4>
                                    <p>Клас: 9А</p>
                                    <p>Дедлайн: 15.03.2024</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "Мої учні":
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>Мої учні</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            Тут буде список учнів за класами
                        </p>
                    </div>
                );

            case "Мій розклад":
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>Мій розклад</h3>
                        <div style={{
                            display: 'flex',
                            gap: '20px',
                            marginTop: '20px',
                            flexDirection: isMobile ? 'column' : 'row'
                        }}>
                            <div style={{ flex: 1 }}>
                                <h4>Розклад на тиждень</h4>
                                {/* Тут буде компонент розкладу */}
                            </div>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '10px',
                                width: isMobile ? '100%' : '300px'
                            }}>
                                <h4>Найближчі уроки</h4>
                                <ul style={{ paddingLeft: '20px' }}>
                                    <li>Понеділок: 9А, 10Б</li>
                                    <li>Вівторок: 9Б, 11А</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case "Повідомлення":
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>Повідомлення</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            Система спілкування з учнями та батьками
                        </p>
                    </div>
                );

            case "Звіти":
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>Звіти та статистика</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                            gap: '20px',
                            marginTop: '20px'
                        }}>
                            <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                <h4>Успішність класів</h4>
                                <p>Графіки успішності</p>
                            </div>
                            <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                <h4>Відвідуваність</h4>
                                <p>Статистика відвідувань</p>
                            </div>
                        </div>
                    </div>
                );

            case "Матеріали":
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>Навчальні матеріали</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            Бібліотека матеріалів для уроків
                        </p>
                    </div>
                );

            case "Контрольні роботи":
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>Контрольні роботи</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            Планування та результати контрольних робіт
                        </p>
                    </div>
                );

            case "Налаштування предмету":
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>Налаштування предмету</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            Налаштування критеріїв оцінювання, ваги оцінок тощо
                        </p>
                    </div>
                );

            default:
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>Ласкаво просимо!</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            Оберіть розділ з меню для початку роботи
                        </p>
                    </div>
                );
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <header style={{
                backgroundColor: 'rgba(105, 180, 185, 1)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: isMobile ? '12px 16px' : '16px 24px',
                position: 'relative',
                zIndex: 100
            }}>
                {isMobile && (
                    <button
                        onClick={toggleMenu}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '8px'
                        }}
                    >
                        {isMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                )}

                {!isMobile && (
                    <div>
                        <span style={{
                            fontSize: '18px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            padding: '4px 12px',
                            borderRadius: '9px'
                        }}>
                            {userFullName}
                        </span>
                    </div>
                )}

                <h1 style={{
                    margin: 0,
                    fontSize: isMobile ? '18px' : '24px',
                    fontWeight: '600',
                    textAlign: 'center',
                    flex: 1
                }}>
                    {activeSection} {userData?.subject ? `(${userData.subject})` : ''}
                </h1>

                <button
                    onClick={onLogout}
                    style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: isMobile ? '6px 12px' : '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: isMobile ? '14px' : '16px',
                        transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#db1a1aff';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#ef4444';
                    }}
                >
                    Вихід
                </button>
            </header>

            <div style={{
                display: 'flex',
                flex: 1,
                position: 'relative'
            }}>
                <aside style={{
                    width: isMobile ? (isMenuOpen ? '260px' : '0') : '270px',
                    backgroundColor: '#f9fafb',
                    borderRight: '1px solid #e5e7eb',
                    padding: isMobile ? (isMenuOpen ? '18px' : '0') : '18px',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    position: isMobile ? 'absolute' : 'relative',
                    left: isMobile ? '0' : 'auto',
                    top: isMobile ? '0' : 'auto',
                    height: isMobile ? '100%' : 'auto',
                    zIndex: 90,
                    boxShadow: isMobile && isMenuOpen ? '2px 0 8px rgba(0,0,0,0.1)' : 'none'
                }}>
                    {(!isMobile || isMenuOpen) && (
                        <>
                            <h2 style={{
                                fontSize: isMobile ? '17px' : '20px',
                                fontWeight: 'bold',
                                marginBottom: '18px',
                                color: '#374151'
                            }}>
                                Розділи вчителя
                            </h2>
                            <ul style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                listStyle: 'none',
                                padding: 0,
                                margin: 0
                            }}>
                                {teacherSections.map((section) => (
                                    <li key={section.name}>
                                        <button
                                            onClick={() => handleSectionClick(section.name)}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: isMobile ? '12px 14px' : '10px 14px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                backgroundColor: activeSection === section.name ? 'rgba(105, 180, 185, 1)' : 'transparent',
                                                color: activeSection === section.name ? 'white' : '#374151',
                                                fontWeight: activeSection === section.name ? '600' : 'normal',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                fontSize: isMobile ? '15px' : '18px'
                                            }}
                                            onMouseOver={(e) => {
                                                if (activeSection !== section.name) {
                                                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                if (activeSection !== section.name) {
                                                    e.target.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            <span style={{ fontSize: isMobile ? '15px' : '18px' }}>
                                                {section.icon}
                                            </span>
                                            {section.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </aside>

                {isMobile && isMenuOpen && (
                    <div
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 80
                        }}
                    />
                )}

                <main style={{
                    flex: 1,
                    padding: isMobile ? '16px' : '24px',
                    backgroundColor: 'white',
                    overflowY: 'auto'
                }}>
                    {renderTeacherContent()}
                </main>
            </div>
        </div>
    );
};

export default TeacherPage;