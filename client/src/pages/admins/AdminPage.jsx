import React, { useState, useEffect } from "react";
import {
    FaHome,
    FaUserCog,
    FaCog,
    FaChartLine,
    FaUserTie,
    FaBook,
    FaClock,
    FaDoorOpen,
    FaUserCircle,
    FaCalendar
} from "react-icons/fa";
import AdminUserSystem from "./user_tab/AdminUserSystem";
import AdminShowCurators from "./curator_tab/AdminShowCurators";
import AdminMainPage from "./main_tab/AdminMainPage";
import ScheduleDashboard from "./schedule_tab/ScheduleDashboard";
import TimeSlot from "./time_tab/TimeTab";
import ClassroomsTab from "./classroom_tab/ClassroomsTab";
import AdminInfo from "./adminInfo/AdminInfo";
import StudyCalendar from "./study_calendar_tab/StudyCalendar";

const AdminPage = ({ onLogout, userFullName }) => {
    const [activeSection, setActiveSection] = useState("Головна");
    const [userData, setUserData] = useState(null);
    const [databaseName, setDatabaseName] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const { databaseName: dbName, userId } = userInfo;

            console.log('Дані з localStorage:', userInfo);
            setDatabaseName(dbName);

            if (dbName && userId) {
                console.log('Запит до API...');
                const response = await fetch(`/api/user/me?databaseName=${encodeURIComponent(dbName)}&userId=${encodeURIComponent(userId)}`);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Отримані дані з API:', data);

                    if (data.success) {
                        setUserData(data.user);
                        return;
                    }
                }
            }

            console.log('Використання даних з localStorage');
            setUserData({
                fullName: userInfo.fullName || userFullName,
                role: userInfo.role || 'admin',
                position: userInfo.position || 'Директор',
                positions: userInfo.positions || ['Директор'],
                email: userInfo.email || 'admin@school.edu.ua',
                phone: userInfo.phone || '+380990000001',
                birthDate: null,
                children: [],
                createdAt: new Date().toISOString()
            });

        } catch (error) {
            console.error('Помилка отримання даних:', error);

            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            setUserData({
                fullName: userInfo.fullName || userFullName,
                role: userInfo.role || 'admin',
                position: userInfo.position || 'Директор',
                positions: userInfo.positions || ['Директор'],
                email: userInfo.email || 'admin@school.edu.ua',
                phone: userInfo.phone || '+380990000001',
                birthDate: null,
                children: [],
                createdAt: new Date().toISOString()
            });
        }
    };

    const adminSections = [
        { name: "Головна", icon: <FaHome /> },
        { name: "Мій профіль", icon: <FaUserCircle /> },
        { name: "Користувачі", icon: <FaUserCog /> },
        { name: "Класні керівники", icon: <FaUserTie /> },
        { name: "Навчальний календар", icon: <FaCalendar /> },
        { name: "Розклад занять", icon: <FaBook /> },
        { name: "Розклад часу", icon: <FaClock /> },
        { name: "Кабінети", icon: <FaDoorOpen /> },
        { name: "Налаштування", icon: <FaCog /> },
        { name: "Звіти", icon: <FaChartLine /> }
    ];

    const renderAdminContent = () => {
        switch (activeSection) {
            case "Головна":
                return <AdminMainPage databaseName={databaseName} />;

            case "Мій профіль":
                return userData ? <AdminInfo userData={userData} databaseName={databaseName} /> : <div>Завантаження...</div>;

            case "Користувачі":
                return <AdminUserSystem databaseName={databaseName} />;

            case "Класні керівники":
                return <AdminShowCurators databaseName={databaseName} />;

            case "Навчальний календар":
                return <StudyCalendar databaseName={databaseName} />;

            case "Розклад занять":
                return <ScheduleDashboard databaseName={databaseName} />;

            case "Розклад часу":
                return <TimeSlot databaseName={databaseName} />;

            case "Кабінети":
                return <ClassroomsTab databaseName={databaseName} />;

            case "Налаштування":
                return (
                    <div>
                        <h3>Налаштування системи</h3>
                        <p>Тут будуть налаштування системи, ролей, прав доступу тощо.</p>
                    </div>
                );
            case "Звіти":
                return (
                    <div>
                        <h3>Звіти та статистика</h3>
                        <p>Тут будуть різні звіти та статистика по системі.</p>
                    </div>
                );

            default:
                return (
                    <div>
                        <p>Ласкаво просимо до адміністративної панелі!</p>
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
                padding: '16px 24px',
            }}>

                {/* ПІБ */}
                <div>
                    <span style={{
                        fontSize: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        padding: '4px 12px',
                        borderRadius: '9px'
                    }}>
                        {userFullName}
                    </span>
                </div>

                {/* НАЗВА СТОРІНКИ ПО ЦЕНТРУ*/}
                <h1 style={{
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: '600',
                }}>
                    {activeSection}
                </h1>

                {/* КНОПКА ВИХОДУ */}
                <button
                    onClick={onLogout}
                    style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
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

            <div style={{ display: 'flex', flex: 1 }}>
                {/* БОКОВЕ МЕНЮ */}
                <aside style={{
                    width: '256px',
                    backgroundColor: '#f9fafb',
                    borderRight: '1px solid #e5e7eb',
                    padding: '16px'
                }}>
                    <h2 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginBottom: '16px',
                        color: '#374151'
                    }}>
                        Розділи
                    </h2>
                    <ul style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        listStyle: 'none',
                        padding: 0,
                        margin: 0
                    }}>
                        {adminSections.map((section) => (
                            <li key={section.name}>
                                <button
                                    onClick={() => setActiveSection(section.name)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        backgroundColor: activeSection === section.name ? 'rgba(105, 180, 185, 1)' : 'transparent',
                                        color: activeSection === section.name ? 'white' : '#374151',
                                        fontWeight: activeSection === section.name ? '600' : 'normal',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
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
                                    <span style={{ fontSize: '16px' }}>
                                        {section.icon}
                                    </span>
                                    {section.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* ОСНОВНИЙ КОНТЕНТ*/}
                <main style={{
                    flex: 1,
                    padding: '24px',
                    backgroundColor: 'white',
                    overflowY: 'auto'
                }}>
                    {renderAdminContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminPage;