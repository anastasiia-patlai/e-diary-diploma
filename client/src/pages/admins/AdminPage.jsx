import React, { useState } from "react";
import {
    FaHome,
    FaUserCog,
    FaCog,
    FaChartLine,
    FaUserTie
} from "react-icons/fa";
import AdminUserSystem from "./AdminUserSystem";
import AdminShowCurators from "./curator_tab/AdminShowCurators";

const AdminPage = ({ onLogout, userFullName }) => {
    const [activeSection, setActiveSection] = useState("Головна");

    const adminSections = [
        { name: "Головна", icon: <FaHome /> },
        { name: "Користувачі", icon: <FaUserCog /> },
        { name: "Класні керівники", icon: <FaUserTie /> },
        { name: "Налаштування", icon: <FaCog /> },
        { name: "Звіти", icon: <FaChartLine /> }
    ];

    const renderAdminContent = () => {
        switch (activeSection) {
            case "Користувачі":
                return <AdminUserSystem />;

            case "Налаштування":
                return (
                    <div>
                        <h3>Налаштування системи</h3>
                        <p>Тут будуть налаштування системи, ролей, прав доступу тощо.</p>
                    </div>
                );

            case "Класні керівники":
                return <AdminShowCurators />;

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