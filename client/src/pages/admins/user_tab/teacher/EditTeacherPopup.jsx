import React, { useState, useEffect } from "react";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendar, FaChalkboardTeacher, FaPlus, FaMinus, FaCertificate } from "react-icons/fa";
import axios from "axios";

const EditTeacherPopup = ({ teacher, onClose, onUpdate, databaseName, isMobile }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        positions: [""],
        category: "" // ДОДАНО: поле категорії
    });
    const [loading, setLoading] = useState(false);
    const [fetchingUser, setFetchingUser] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            if (!databaseName) {
                setError("Не вказано базу даних");
                setFetchingUser(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3001/api/users/${teacher._id}`, {
                    params: { databaseName }
                });
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
                    positions: positionsArray.length > 0 ? positionsArray : [""],
                    category: userData.category || "" // ДОДАНО: завантаження категорії
                });

                setFetchingUser(false);
            } catch (err) {
                console.error("Помилка завантаження даних:", err);
                setError("Помилка завантаження даних користувача");
                setFetchingUser(false);
            }
        };

        fetchUserData();
    }, [teacher._id, databaseName]);

    // Функція для обробки зміни полів
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Функція для додавання нового поля предмету
    const addPositionField = () => {
        setFormData(prev => ({
            ...prev,
            positions: [...prev.positions, ""]
        }));
    };

    // Функція для видалення поля предмету
    const removePositionField = (index) => {
        if (formData.positions.length > 1) {
            setFormData(prev => ({
                ...prev,
                positions: prev.positions.filter((_, i) => i !== index)
            }));
        }
    };

    // Функція для оновлення конкретного предмету
    const updatePosition = (index, value) => {
        setFormData(prev => ({
            ...prev,
            positions: prev.positions.map((pos, i) => i === index ? value : pos)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!databaseName) {
            setError("Не вказано базу даних");
            setLoading(false);
            return;
        }

        try {
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
                position: filteredPositions.join(", "),
                category: formData.category, // ДОДАНО: категорія
                databaseName: databaseName
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
            zIndex: 1000,
            padding: isMobile ? '16px' : '0',
            overflowY: 'auto'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: isMobile ? '20px 16px' : '24px',
                width: isMobile ? '100%' : '90%',
                maxWidth: isMobile ? '100%' : '500px',
                maxHeight: isMobile ? 'calc(100vh - 32px)' : '90vh',
                overflowY: 'auto',
                marginTop: isMobile ? '0' : '0'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: isMobile ? '16px' : '20px',
                    position: 'sticky',
                    top: isMobile ? '0' : 'auto',
                    backgroundColor: 'white',
                    paddingTop: isMobile ? '0' : '0',
                    zIndex: 10
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: isMobile ? '18px' : '20px',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flex: 1
                    }}>
                        <FaChalkboardTeacher size={isMobile ? 18 : 20} />
                        Редагувати викладача
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: isMobile ? '18px' : '20px',
                            color: '#6b7280',
                            transition: isMobile ? 'none' : 'color 0.2s',
                            padding: isMobile ? '4px' : '0',
                            flexShrink: 0
                        }}
                        onMouseOver={(e) => {
                            if (!isMobile) {
                                e.target.style.color = '#374151';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!isMobile) {
                                e.target.style.color = '#6b7280';
                            }
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: isMobile ? '10px' : '12px',
                        borderRadius: '6px',
                        marginBottom: isMobile ? '12px' : '16px',
                        fontSize: isMobile ? '13px' : '14px'
                    }}>
                        {error}
                    </div>
                )}

                {fetchingUser ? (
                    <div style={{
                        textAlign: 'center',
                        padding: isMobile ? '40px 20px' : '20px'
                    }}>
                        <p style={{ fontSize: isMobile ? '16px' : '14px' }}>Завантаження даних...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: isMobile ? '20px' : '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isMobile ? '10px' : '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '13px'
                            }}>
                                <FaUser style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: isMobile ? '14px' : '12px',
                                    flexShrink: 0
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
                                    padding: isMobile ? '14px 16px' : '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: isMobile ? '16px' : '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    height: isMobile ? '40px' : 'auto'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: isMobile ? '20px' : '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isMobile ? '10px' : '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '13px'
                            }}>
                                <FaEnvelope style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: isMobile ? '14px' : '12px',
                                    flexShrink: 0
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
                                    padding: isMobile ? '14px 16px' : '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: isMobile ? '16px' : '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    height: isMobile ? '40px' : 'auto'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: isMobile ? '20px' : '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isMobile ? '10px' : '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '13px'
                            }}>
                                <FaPhone style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: isMobile ? '14px' : '12px',
                                    flexShrink: 0
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
                                    padding: isMobile ? '14px 16px' : '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: isMobile ? '16px' : '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    height: isMobile ? '40px' : 'auto'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: isMobile ? '20px' : '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isMobile ? '10px' : '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '13px'
                            }}>
                                <FaCalendar style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: isMobile ? '14px' : '12px',
                                    flexShrink: 0
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
                                    padding: isMobile ? '14px 16px' : '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: isMobile ? '16px' : '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    height: isMobile ? '40px' : 'auto'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            />
                        </div>

                        {/* КАТЕГОРІЯ ВЧИТЕЛЯ - ДОДАНО */}
                        <div style={{ marginBottom: isMobile ? '20px' : '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isMobile ? '10px' : '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '13px'
                            }}>
                                <FaCertificate style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: isMobile ? '14px' : '12px',
                                    flexShrink: 0
                                }} />
                                Категорія
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: isMobile ? '14px 16px' : '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: isMobile ? '16px' : '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    backgroundColor: 'white',
                                    height: isMobile ? '40px' : 'auto'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            >
                                <option value="">-- Оберіть категорію --</option>
                                <option value="Вища категорія">Вища категорія</option>
                                <option value="Перша категорія">Перша категорія</option>
                                <option value="Друга категорія">Друга категорія</option>
                                <option value="Спеціаліст">Спеціаліст</option>
                                <option value="Молодший спеціаліст">Молодший спеціаліст</option>
                                <option value="Без категорії">Без категорії</option>
                            </select>
                        </div>

                        {/* КІЛЬКА ПРЕДМЕТІВ */}
                        <div style={{ marginBottom: isMobile ? '20px' : '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: isMobile ? '10px' : '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '13px'
                            }}>
                                <FaChalkboardTeacher style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: isMobile ? '14px' : '12px',
                                    flexShrink: 0
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
                                        placeholder={`Предмет ${index + 1}`}
                                        style={{
                                            flex: 1,
                                            padding: isMobile ? '14px 16px' : '10px 12px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '6px',
                                            fontSize: isMobile ? '16px' : '14px',
                                            boxSizing: 'border-box',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            height: isMobile ? '40px' : 'auto'
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
                                                padding: isMobile ? '14px' : '10px 12px',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: isMobile ? 'none' : 'background-color 0.2s',
                                                height: isMobile ? '40px' : 'auto',
                                                minWidth: isMobile ? '40px' : 'auto'
                                            }}
                                            onMouseOver={(e) => {
                                                if (!isMobile) {
                                                    e.target.style.backgroundColor = '#dc2626';
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                if (!isMobile) {
                                                    e.target.style.backgroundColor = '#ef4444';
                                                }
                                            }}
                                        >
                                            <FaMinus size={isMobile ? 16 : 14} />
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addPositionField}
                                disabled={loading}
                                style={{
                                    padding: isMobile ? '14px 16px' : '8px 12px',
                                    backgroundColor: 'rgba(105, 180, 185, 1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: isMobile ? '14px' : '12px',
                                    transition: isMobile ? 'none' : 'background-color 0.2s',
                                    justifyContent: 'center',
                                    height: isMobile ? '40px' : 'auto',
                                    marginTop: '8px'
                                }}
                                onMouseOver={(e) => {
                                    if (!isMobile && !loading) {
                                        e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isMobile && !loading) {
                                        e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                                    }
                                }}
                            >
                                <FaPlus size={isMobile ? 14 : 12} />
                                Додати ще предмет
                            </button>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? '12px' : '10px',
                            marginTop: isMobile ? '24px' : '24px',
                            paddingTop: isMobile ? '20px' : '16px',
                            borderTop: '1px solid #e5e7eb'
                        }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: isMobile ? '10px' : '8px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: isMobile ? '14px' : '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: isMobile ? 'none' : 'background-color 0.2s',
                                    minHeight: '40px',
                                    height: '40px'
                                }}
                                onMouseOver={(e) => {
                                    if (!isMobile) {
                                        e.target.style.backgroundColor = '#4b5563';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isMobile) {
                                        e.target.style.backgroundColor = '#6b7280';
                                    }
                                }}
                            >
                                <FaTimes size={isMobile ? 14 : 12} />
                                Скасувати
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: isMobile ? '10px' : '8px',
                                    backgroundColor: 'rgba(105, 180, 185, 1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    fontSize: isMobile ? '14px' : '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    opacity: loading ? 0.6 : 1,
                                    transition: isMobile ? 'none' : 'background-color 0.2s',
                                    minHeight: '40px',
                                    height: '40px'
                                }}
                                onMouseOver={(e) => {
                                    if (!isMobile && !loading) {
                                        e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isMobile && !loading) {
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