import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
    FaCalendar,
    FaBars,
    FaTimes
} from "react-icons/fa";
import AdminUserSystem from "./user_tab/AdminUserSystem";
import AdminShowCurators from "./curator_tab/AdminShowCurators";
import AdminMainPage from "./main_tab/AdminMainPage";
import ScheduleDashboard from "./schedule_tab/ScheduleDashboard";
import TimeSlot from "./time_tab/TimeTab";
import ClassroomsTab from "./classroom_tab/ClassroomsTab";
import AdminInfo from "./adminInfo/AdminInfo";
import StudyCalendar from "./study_calendar_tab/StudyCalendar";
import LanguageSwitcher from "../../i18n/components/LanguageSwitcher";

const AdminPage = ({ onLogout, userFullName }) => {
    const { t, i18n } = useTranslation();
    const [activeSection, setActiveSection] = useState("home");
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
                position: userInfo.position || t("admin.defaults.director"),
                positions: userInfo.positions || [t("admin.defaults.director")],
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
                position: userInfo.position || t("admin.defaults.director"),
                positions: userInfo.positions || [t("admin.defaults.director")],
                email: userInfo.email || 'admin@school.edu.ua',
                phone: userInfo.phone || '+380990000001',
                birthDate: null,
                children: [],
                createdAt: new Date().toISOString()
            });
        }
    };

    const adminSections = [
        { key: "home", nameKey: "admin.sections.home", icon: <FaHome /> },
        { key: "profile", nameKey: "admin.sections.profile", icon: <FaUserCircle /> },
        { key: "users", nameKey: "admin.sections.users", icon: <FaUserCog /> },
        { key: "curators", nameKey: "admin.sections.curators", icon: <FaUserTie /> },
        { key: "calendar", nameKey: "admin.sections.calendar", icon: <FaCalendar /> },
        { key: "schedule", nameKey: "admin.sections.schedule", icon: <FaBook /> },
        { key: "timeSchedule", nameKey: "admin.sections.timeSchedule", icon: <FaClock /> },
        { key: "classrooms", nameKey: "admin.sections.classrooms", icon: <FaDoorOpen /> },
        { key: "settings", nameKey: "admin.sections.settings", icon: <FaCog /> },
        { key: "reports", nameKey: "admin.sections.reports", icon: <FaChartLine /> }
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSectionClick = (sectionKey) => {
        setActiveSection(sectionKey);
        if (isMobile) {
            setIsMenuOpen(false);
        }
    };

    const renderAdminContent = () => {
        switch (activeSection) {
            case "home":
                return <AdminMainPage databaseName={databaseName} />;

            case "profile":
                return userData ? <AdminInfo userData={userData} databaseName={databaseName} /> : <div>{t("common.loading")}</div>;

            case "users":
                return <AdminUserSystem databaseName={databaseName} />;

            case "curators":
                return <AdminShowCurators databaseName={databaseName} />;

            case "calendar":
                return <StudyCalendar databaseName={databaseName} />;

            case "schedule":
                return <ScheduleDashboard databaseName={databaseName} />;

            case "timeSchedule":
                return <TimeSlot databaseName={databaseName} />;

            case "classrooms":
                return <ClassroomsTab databaseName={databaseName} />;

            case "settings":
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>{t("admin.settings.title")}</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>{t("admin.settings.description")}</p>
                    </div>
                );
            case "reports":
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>{t("admin.reports.title")}</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>{t("admin.reports.description")}</p>
                    </div>
                );

            default:
                return (
                    <div>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>{t("admin.welcome")}</p>
                    </div>
                );
        }
    };

    const getActiveSectionTitle = () => {
        const section = adminSections.find(s => s.key === activeSection);
        return section ? t(section.nameKey) : t("admin.welcome");
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
                    {getActiveSectionTitle()}
                </h1>

                {/* Контейнер для LanguageSwitcher та кнопки вихід */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '12px' : '16px'
                }}>
                    <LanguageSwitcher
                        onLogout={onLogout}
                        isLoginPage={false}
                    />
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
                        {t("common.exit")}
                    </button>
                </div>
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
                                {t("admin.sectionsTitle")}
                            </h2>
                            <ul style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                listStyle: 'none',
                                padding: 0,
                                margin: 0
                            }}>
                                {adminSections.map((section) => (
                                    <li key={section.key}>
                                        <button
                                            onClick={() => handleSectionClick(section.key)}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: isMobile ? '12px 14px' : '10px 14px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                backgroundColor: activeSection === section.key ? 'rgba(105, 180, 185, 1)' : 'transparent',
                                                color: activeSection === section.key ? 'white' : '#374151',
                                                fontWeight: activeSection === section.key ? '600' : 'normal',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                fontSize: isMobile ? '15px' : '18px'
                                            }}
                                            onMouseOver={(e) => {
                                                if (activeSection !== section.key) {
                                                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                if (activeSection !== section.key) {
                                                    e.target.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            <span style={{ fontSize: isMobile ? '15px' : '18px' }}>
                                                {section.icon}
                                            </span>
                                            {t(section.nameKey)}
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
                    {renderAdminContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminPage;