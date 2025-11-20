import React, { useState } from "react";
import { FaUserGraduate, FaChalkboardTeacher, FaUserPlus, FaUserFriends, FaUserShield } from "react-icons/fa";
import Signup from "../Signup";
import AdminShowStudent from "./student/AdminShowStudent";
import AdminShowTeacher from "./teacher/AdminShowTeacher";
import AdminShowParent from "./parent/AdminShowParent";
import AdminShowAdmin from "./admin/AdminShowAdmin";

const AdminUserSystem = () => {
    const [activeTab, setActiveTab] = useState("students");
    const [showPopup, setShowPopup] = useState(false);

    const handleAddUser = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    return (
        <div>
            {/* ЗАГОЛОВОК І КНОПКА */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: 0 }}>Управління користувачами</h3>
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

            {/* САМІ ВКЛАДКИ */}
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
                <Signup onClose={handleClosePopup} />
            )}
        </div>
    );
};

export default AdminUserSystem;