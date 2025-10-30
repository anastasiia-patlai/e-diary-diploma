import React, { useState } from "react";
import { FaUserGraduate, FaChalkboardTeacher, FaUserPlus, FaTimes } from "react-icons/fa";
import Signup from "./Signup";

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
                        fontWeight: '600'
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

            {/* ВКЛАДКИ */}
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
                        gap: '8px'
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
                        gap: '8px'
                    }}
                >
                    <FaChalkboardTeacher />
                    Викладачі
                </button>
            </div>

            {/* ВМІСТ ВКЛАДОК*/}
            {activeTab === "students" && (
                <div>
                    <h4>Список учнів/студентів</h4>
                    <p>Тут буде таблиця з усіма учнями/студентами:</p>
                    <ul>
                        <li>Перегляд списку студентів</li>
                        <li>Додавання нових студентів</li>
                        <li>Редагування даних студентів</li>
                        <li>Видалення студентів</li>
                        <li>Прив'язка до груп</li>
                    </ul>
                </div>
            )}

            {activeTab === "teachers" && (
                <div>
                    <h4>Список викладачів</h4>
                    <p>Тут буде таблиця з усіма викладачами:</p>
                    <ul>
                        <li>Перегляд списку викладачів</li>
                        <li>Додавання нових викладачів</li>
                        <li>Редагування даних викладачів</li>
                        <li>Видалення викладачів</li>
                        <li>Призначення кураторів груп</li>
                    </ul>
                </div>
            )}

            {/* ПОКАЗ ПОПАПУ */}
            {showPopup && (
                <Signup onClose={handleClosePopup} />
            )}
        </div>
    );
};

export default AdminUserSystem;