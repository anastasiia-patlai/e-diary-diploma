import React, { useState, useEffect } from "react";
import { FaUserGraduate, FaChalkboardTeacher, FaUserPlus, FaUserFriends, FaUserShield } from "react-icons/fa";
import Signup from "../Signup";
import AdminShowStudent from "./student/AdminShowStudent";
import AdminShowTeacher from "./teacher/AdminShowTeacher";
import AdminShowParent from "./parent/AdminShowParent";
import AdminShowAdmin from "./admin/AdminShowAdmin";

const AdminUserSystem = () => {
    const [activeTab, setActiveTab] = useState("students");
    const [showPopup, setShowPopup] = useState(false);
    const [databaseName, setDatabaseName] = useState("");

    // Покращене отримання databaseName
    useEffect(() => {
        const getDatabaseName = () => {
            // Спроба 1: Окреме поле databaseName
            let dbName = localStorage.getItem('databaseName');

            // Спроба 2: З об'єкта user
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

            // Спроба 3: З об'єкта userInfo
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
                console.log("✅ Database name отримано:", dbName);
            } else {
                console.warn("❌ Database name не знайдено в localStorage!");
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

    return (
        <div>
            {/* Заголовок з інформацією про базу даних */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <div>
                    <h3 style={{ margin: 0 }}>Управління користувачами</h3>
                    {databaseName && (
                        <small style={{ color: '#666', fontSize: '12px' }}>
                            База даних: {databaseName}
                        </small>
                    )}
                </div>
                <button
                    onClick={handleAddUser}
                    style={{
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.8)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                    }}
                >
                    <FaUserPlus />
                    Додати користувача
                </button>
            </div>

            {/* Решта коду залишається без змін */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #e5e7eb',
                marginBottom: '20px'
            }}>
                <button
                    onClick={() => setActiveTab("students")}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        backgroundColor: activeTab === "students" ? 'rgba(105, 180, 185, 1)' : 'transparent',
                        color: activeTab === "students" ? 'white' : '#374151',
                        borderBottom: activeTab === "students" ? '2px solid rgba(105, 180, 185, 1)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        if (activeTab !== "students") {
                            e.target.style.backgroundColor = 'rgba(61, 117, 121, 1)';
                            e.target.style.color = 'white';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (activeTab !== "students") {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#374151';
                        }
                    }}
                >
                    <FaUserGraduate />
                    Учні/Студенти
                </button>

                {/* Решта кнопок залишається без змін */}
                <button
                    onClick={() => setActiveTab("teachers")}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        backgroundColor: activeTab === "teachers" ? 'rgba(105, 180, 185, 1)' : 'transparent',
                        color: activeTab === "teachers" ? 'white' : '#374151',
                        borderBottom: activeTab === "teachers" ? '2px solid rgba(105, 180, 185, 1)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        if (activeTab !== "teachers") {
                            e.target.style.backgroundColor = 'rgba(61, 117, 121, 1)';
                            e.target.style.color = 'white';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (activeTab !== "teachers") {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#374151';
                        }
                    }}
                >
                    <FaChalkboardTeacher />
                    Викладачі
                </button>
                <button
                    onClick={() => setActiveTab("parents")}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        backgroundColor: activeTab === "parents" ? 'rgba(105, 180, 185, 1)' : 'transparent',
                        color: activeTab === "parents" ? 'white' : '#374151',
                        borderBottom: activeTab === "parents" ? '2px solid rgba(105, 180, 185, 1)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        if (activeTab !== "parents") {
                            e.target.style.backgroundColor = 'rgba(61, 117, 121, 1)';
                            e.target.style.color = 'white';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (activeTab !== "parents") {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#374151';
                        }
                    }}
                >
                    <FaUserFriends />
                    Батьки
                </button>
                <button
                    onClick={() => setActiveTab("admins")}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        backgroundColor: activeTab === "admins" ? 'rgba(105, 180, 185, 1)' : 'transparent',
                        color: activeTab === "admins" ? 'white' : '#374151',
                        borderBottom: activeTab === "admins" ? '2px solid rgba(105, 180, 185, 1)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        if (activeTab !== "admins") {
                            e.target.style.backgroundColor = 'rgba(61, 117, 121, 1)';
                            e.target.style.color = 'white';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (activeTab !== "admins") {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#374151';
                        }
                    }}
                >
                    <FaUserShield />
                    Адміністратори
                </button>
            </div>

            {/* КОНТЕНТ */}
            {activeTab === "students" && (
                <AdminShowStudent />
            )}

            {activeTab === "teachers" && (
                <AdminShowTeacher />
            )}

            {activeTab === "parents" && (
                <AdminShowParent />
            )}

            {activeTab === "admins" && (
                <AdminShowAdmin />
            )}

            {/* Попап для реєстрації */}
            {showPopup && (
                <Signup
                    onClose={handleClosePopup}
                    databaseName={databaseName}
                />
            )}
        </div>
    );
};

export default AdminUserSystem;