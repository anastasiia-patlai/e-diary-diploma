import React, { useState, useEffect } from "react";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendar, FaUsers } from "react-icons/fa";
import axios from "axios";

const EditStudentPopup = ({ student, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        group: ""
    });
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingUser, setFetchingUser] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const groupsResponse = await axios.get("http://localhost:3001/api/groups");
                setGroups(groupsResponse.data);

                const userResponse = await axios.get(`http://localhost:3001/api/users/${student._id}`);
                const userData = userResponse.data;

                setFormData({
                    fullName: userData.fullName || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : "",
                    group: userData.group?._id || userData.group || ""
                });

                setFetchingUser(false);
            } catch (err) {
                console.error("Помилка завантаження даних:", err);
                setError("Помилка завантаження даних користувача");
                setFetchingUser(false);
            }
        };

        fetchData();
    }, [student._id]);

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
                `http://localhost:3001/api/users/${student._id}`,
                formData
            );

            onUpdate(response.data.user);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Помилка при оновленні студента");
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
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#374151' }}>
                        Редагувати студента
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '20px',
                            color: '#6b7280'
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
                        {/* ПІБ */}
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

                        {/* ПОШТА */}
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

                        {/* ТЕЛЕФОН */}
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

                        {/* ДН */}
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

                        {/* ГРУПА */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                <FaUsers style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px'
                                }} />
                                Група *
                            </label>
                            <select
                                name="group"
                                value={formData.group}
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
                                    transition: 'border-color 0.2s',
                                    cursor: 'pointer'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            >
                                <option value="">Оберіть групу</option>
                                {groups.map(group => (
                                    <option key={group._id} value={group._id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
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

export default EditStudentPopup;