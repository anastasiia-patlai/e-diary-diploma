import React, { useState, useEffect } from "react";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendar, FaChalkboardTeacher } from "react-icons/fa";
import axios from "axios";

const EditTeacherPopup = ({ teacher, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        position: ""
    });
    const [loading, setLoading] = useState(false);
    const [fetchingUser, setFetchingUser] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/users/${teacher._id}`);
                const userData = response.data;

                setFormData({
                    fullName: userData.fullName || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : "",
                    position: userData.position || ""
                });

                setFetchingUser(false);
            } catch (err) {
                console.error("Помилка завантаження даних:", err);
                setError("Помилка завантаження даних користувача");
                setFetchingUser(false);
            }
        };

        fetchUserData();
    }, [teacher._id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.put(
                `http://localhost:3001/api/users/${teacher._id}`,
                formData
            );

            onUpdate(response.data.user);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Помилка при оновленні викладача");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '20px',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        {/* <FaChalkboardTeacher /> */}
                        Редагувати викладача
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '20px',
                            color: '#6b7280',
                            transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.color = '#374151';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = '#6b7280';
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <FaTimes />
                        {error}
                    </div>
                )}

                {fetchingUser ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p>Завантаження даних...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                <FaUser style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px'
                                }} />
                                ПІБ *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                <FaEnvelope style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px'
                                }} />
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                <FaPhone style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px'
                                }} />
                                Телефон *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                <FaCalendar style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px'
                                }} />
                                Дата народження
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                <FaChalkboardTeacher style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px'
                                }} />
                                Предмет *
                            </label>
                            <input
                                type="text"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                required
                                placeholder="Наприклад: Математика"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            marginTop: '24px',
                            paddingTop: '16px',
                            borderTop: '1px solid #e5e7eb'
                        }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#4b5563';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#6b7280';
                                }}
                            >
                                <FaTimes />
                                Скасувати
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: 'rgba(105, 180, 185, 1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: loading ? 0.6 : 1,
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    if (!loading) {
                                        e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!loading) {
                                        e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                                    }
                                }}
                            >
                                {loading ? 'Збереження...' : 'Зберегти зміни'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditTeacherPopup;