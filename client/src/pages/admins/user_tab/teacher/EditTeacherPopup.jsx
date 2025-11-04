import React, { useState, useEffect } from "react";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendar, FaChalkboardTeacher, FaPlus, FaMinus } from "react-icons/fa";
import axios from "axios";

const EditTeacherPopup = ({ teacher, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        positions: [""]
    });
    const [loading, setLoading] = useState(false);
    const [fetchingUser, setFetchingUser] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/users/${teacher._id}`);
                const userData = response.data;

                let positionsArray = [""];
                if (userData.positions && userData.positions.length > 0) {
                    positionsArray = [...userData.positions];
                } else if (userData.position) {
                    positionsArray = userData.position.split(',').map(pos => pos.trim()).filter(pos => pos !== "");
                }

                setFormData({
                    fullName: userData.fullName || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : "",
                    positions: positionsArray.length > 0 ? positionsArray : [""]
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

    // НОВЕ ПОЛЕ ДЛЯ ПРЕДМЕТУ
    const addPositionField = () => {
        setFormData(prev => ({
            ...prev,
            positions: [...prev.positions, ""]
        }));
    };

    // ВИДАЛИТИ ПОЛЕ ПРЕДМЕТУ
    const removePositionField = (index) => {
        if (formData.positions.length > 1) {
            setFormData(prev => ({
                ...prev,
                positions: prev.positions.filter((_, i) => i !== index)
            }));
        }
    };

    // Оновити конкретний предмет
    const updatePosition = (index, value) => {
        setFormData(prev => ({
            ...prev,
            positions: prev.positions.map((pos, i) => i === index ? value : pos)
        }));
    };

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
            // Фільтруємо порожні предмети
            const filteredPositions = formData.positions.filter(pos => pos.trim() !== "");

            if (filteredPositions.length === 0) {
                setError("Вкажіть хоча б один предмет");
                setLoading(false);
                return;
            }

            const submitData = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                positions: filteredPositions,
                position: filteredPositions.join(", ") // Для зворотної сумісності
            };

            const response = await axios.put(
                `http://localhost:3001/api/users/${teacher._id}`,
                submitData
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
                        <FaChalkboardTeacher />
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

                        {/* КІЛЬКА ПРЕДМЕТІВ */}
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
                                Предмети *
                            </label>

                            {formData.positions.map((position, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginBottom: '8px',
                                    alignItems: 'center'
                                }}>
                                    <input
                                        type="text"
                                        value={position}
                                        onChange={(e) => updatePosition(index, e.target.value)}
                                        placeholder={`Предмет ${index + 1} (напр. Математика)`}
                                        style={{
                                            flex: 1,
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
                                    {formData.positions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removePositionField(index)}
                                            style={{
                                                padding: '10px 12px',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.backgroundColor = '#dc2626';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.backgroundColor = '#ef4444';
                                            }}
                                        >
                                            <FaMinus />
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addPositionField}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: 'transparent',
                                    color: 'rgba(255, 255, 255, 1)',
                                    border: '1px solid rgba(105, 180, 185, 1)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
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
                                <FaPlus />
                                Додати ще предмет
                            </button>
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