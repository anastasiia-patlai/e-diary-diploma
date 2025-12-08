import React, { useState, useEffect } from "react";
import {
    FaUserGraduate,
    FaChalkboardTeacher,
    FaUserPlus,
    FaUserFriends,
    FaUserShield,
    FaBars,
    FaTimes
} from "react-icons/fa";
import Signup from "../Signup";
import AdminShowStudent from "./student/AdminShowStudent";
import AdminShowTeacher from "./teacher/AdminShowTeacher";
import AdminShowParent from "./parent/AdminShowParent";
import AdminShowAdmin from "./admin/AdminShowAdmin";

const AdminUserSystem = () => {
    const [activeTab, setActiveTab] = useState("students");
    const [showPopup, setShowPopup] = useState(false);
    const [databaseName, setDatabaseName] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) {
                setShowMobileMenu(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const getDatabaseName = () => {
            // СПРОБА 1: ОКРЕМЕ ПОЛЕ databaseName
            let dbName = localStorage.getItem('databaseName');

            // СПРОБА 2: З ОБ'ЄКТАа user
            if (!dbName) {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        dbName = user.databaseName;
                    } catch (e) {
                        console.error("Помилка парсингу user:", e);
                    }
                }
            }

            // СПРОБА 3: З ОБ'ЄКТА userInfo
            if (!dbName) {
                const userInfoStr = localStorage.getItem('userInfo');
                if (userInfoStr) {
                    try {
                        const userInfo = JSON.parse(userInfoStr);
                        dbName = userInfo.databaseName;
                    } catch (e) {
                        console.error("Помилка парсингу userInfo:", e);
                    }
                }
            }

            if (dbName) {
                setDatabaseName(dbName);
                console.log("Database name отримано:", dbName);
            } else {
                console.warn("Database name не знайдено в localStorage!");
                console.log("Доступні дані в localStorage:");
                console.log("- databaseName:", localStorage.getItem('databaseName'));
                console.log("- user:", localStorage.getItem('user'));
                console.log("- userInfo:", localStorage.getItem('userInfo'));
            }
        };

        getDatabaseName();
    }, []);

    const handleAddUser = () => {
        if (!databaseName) {
            alert("Помилка: не вдалося визначити базу даних школи. Будь ласка, перезавантажте сторінку або увійдіть знову.");
            console.error("Database name відсутній при спробі додати користувача");
            return;
        }
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        if (isMobile) {
            setShowMobileMenu(false);
        }
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    const tabButtons = [
        { id: "students", label: "Учні/Студенти", icon: <FaUserGraduate /> },
        { id: "teachers", label: "Викладачі", icon: <FaChalkboardTeacher /> },
        { id: "parents", label: "Батьки", icon: <FaUserFriends /> },
        { id: "admins", label: "Адміністратори", icon: <FaUserShield /> }
    ];

    const getActiveTabLabel = () => {
        const activeTabObj = tabButtons.find(tab => tab.id === activeTab);
        return activeTabObj ? activeTabObj.label : "Учні/Студенти";
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                marginBottom: '20px',
                gap: isMobile ? '16px' : '0'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '26px',
                        fontWeight: '500',
                        textAlign: 'left'
                    }}>
                        Управління користувачами
                    </h3>
                    {/* {databaseName && !isMobile && (
                        <small style={{
                            color: '#666',
                            fontSize: isMobile ? '10px' : '12px',
                            marginTop: isMobile ? '4px' : '0'
                        }}>
                            База даних: {databaseName}
                        </small>
                    )} */}
                </div>

                <button
                    onClick={handleAddUser}
                    style={{
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        padding: isMobile ? '12px 16px' : '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: isMobile ? '6px' : '8px',
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: '600',
                        transition: isMobile ? 'none' : 'background-color 0.3s ease',
                        width: isMobile ? '100%' : 'auto',
                        minHeight: isMobile ? '44px' : 'auto'
                    }}
                    onMouseOver={(e) => {
                        if (!isMobile) {
                            e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.8)';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!isMobile) {
                            e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                        }
                    }}
                >
                    <FaUserPlus size={isMobile ? 14 : 16} />
                    Додати користувача
                </button>
            </div>

            {/* МОБІЛЬНЕ МЕНЮ ТАБІВ */}
            {isMobile ? (
                <div style={{ marginBottom: '20px' }}>
                    {/* КНОПКА ВИБОРУ ТАБУ НА МОБІЛЬНИХ ПРИСТРОЯХ */}
                    <button
                        onClick={toggleMobileMenu}
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '16px',
                            fontWeight: '600',
                            marginBottom: '8px'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {tabButtons.find(tab => tab.id === activeTab)?.icon}
                            {getActiveTabLabel()}
                        </span>
                        {showMobileMenu ? <FaTimes size={18} /> : <FaBars size={18} />}
                    </button>

                    {/* ВИСПАДАЮЧИЙ СПИСОК ТАБІВ */}
                    {showMobileMenu && (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden',
                            marginBottom: '16px'
                        }}>
                            {tabButtons.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: 'none',
                                        backgroundColor: activeTab === tab.id ? 'rgba(105, 180, 185, 0.1)' : 'transparent',
                                        color: activeTab === tab.id ? 'rgba(105, 180, 185, 1)' : '#374151',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        fontSize: '15px',
                                        borderBottom: '1px solid #f3f4f6',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <span style={{ fontSize: '16px' }}>
                                        {tab.icon}
                                    </span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* ДЕСКОТНЕ МЕНЮ ТАЮІВ */
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #e5e7eb',
                    marginBottom: '20px',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    {tabButtons.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                backgroundColor: activeTab === tab.id ? 'rgba(105, 180, 185, 1)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#374151',
                                borderBottom: activeTab === tab.id ? '2px solid rgba(105, 180, 185, 1)' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                            }}
                            onMouseOver={(e) => {
                                if (!isMobile && activeTab !== tab.id) {
                                    e.target.style.backgroundColor = 'rgba(61, 117, 121, 1)';
                                    e.target.style.color = 'white';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isMobile && activeTab !== tab.id) {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = '#374151';
                                }
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* КОНТЕНТ */}
            <div style={{
                padding: isMobile ? '0 8px' : '0'
            }}>
                {activeTab === "students" && (
                    <AdminShowStudent isMobile={isMobile} />
                )}

                {activeTab === "teachers" && (
                    <AdminShowTeacher isMobile={isMobile} />
                )}

                {activeTab === "parents" && (
                    <AdminShowParent isMobile={isMobile} />
                )}

                {activeTab === "admins" && (
                    <AdminShowAdmin isMobile={isMobile} />
                )}
            </div>

            {/* ПОПАП ДЛЯ РЕЄСТРАЦІЇ */}
            {showPopup && (
                <Signup
                    onClose={handleClosePopup}
                    databaseName={databaseName}
                    isMobile={isMobile}
                />
            )}
        </div>
    );
};

export default AdminUserSystem;