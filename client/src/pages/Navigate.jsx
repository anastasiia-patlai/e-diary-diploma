import React, { useState, useEffect } from "react";
import {
    FaHome,
    FaChartBar,
    FaCalendarAlt,
    FaBook,
    FaUserCheck,
    FaUsers,
    FaBookOpen,
    FaEnvelope,
    FaBars,
    FaTimes
} from "react-icons/fa";

const Navigate = ({ role = "", onLogout, userFullName }) => {
    const [activeSection, setActiveSection] = useState("Головна");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Відслідковуємо зміну розміру вікна
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMenuOpen(false); // Закриваємо меню на десктопі
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sectionsByRole = {
        student: [
            { name: "Головна", icon: <FaHome /> },
            { name: "Оцінки", icon: <FaChartBar /> },
            { name: "Розклад", icon: <FaCalendarAlt /> },
            { name: "Домашні завдання", icon: <FaBook /> },
            { name: "Відвідуваність", icon: <FaUserCheck /> }
        ],
        parent: [
            { name: "Головна", icon: <FaHome /> },
            { name: "Оцінки дитини", icon: <FaChartBar /> },
            { name: "Відвідуваність", icon: <FaUserCheck /> },
            { name: "Зв'язок з викладачами", icon: <FaEnvelope /> }
        ]
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSectionClick = (sectionName) => {
        setActiveSection(sectionName);
        if (isMobile) {
            setIsMenuOpen(false); // Закриваємо меню на мобільних
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
                {/* Кнопка меню для мобільних */}
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

                {/* ПІБ - приховано для мобільних */}
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

                {/* НАЗВА СТОРІНКИ */}
                <h1 style={{
                    margin: 0,
                    fontSize: isMobile ? '18px' : '20px',
                    fontWeight: '600',
                    textAlign: 'center',
                    flex: 1
                }}>
                    {activeSection}
                </h1>

                {/* КНОПКА ВИХОДУ */}
                <button
                    onClick={onLogout}
                    style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: isMobile ? '6px 12px' : '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: isMobile ? '14px' : '16px'
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
                {/* БОКОВЕ МЕНЮ */}
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
                                Розділи
                            </h2>
                            <ul style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px', // +2px
                                listStyle: 'none',
                                padding: 0,
                                margin: 0
                            }}>
                                {sectionsByRole[role].map((section) => (
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
                                                gap: '12px', // +2px
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

                {/* Оверлей для закриття меню на мобільних */}
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

                {/* ОСНОВНИЙ КОНТЕНТ */}
                <main style={{
                    flex: 1,
                    padding: isMobile ? '16px' : '24px',
                    backgroundColor: 'white',
                    overflowY: 'auto'
                }}>
                    <h2 style={{
                        fontSize: isMobile ? '20px' : '24px',
                        fontWeight: '600',
                        marginBottom: '16px',
                        color: '#1f2937'
                    }}>
                        {activeSection}
                    </h2>
                    <p style={{
                        color: '#374151',
                        fontSize: isMobile ? '14px' : '16px'
                    }}>
                        Тут відображається інформація розділу <b>"{activeSection}"</b> для ролі{" "}
                        <b>{role}</b>.
                    </p>
                </main>
            </div>
        </div>
    );
};

export default Navigate;