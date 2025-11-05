import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaDoorOpen, FaUsers, FaList, FaPlus, FaMinus } from "react-icons/fa";

const ClassroomModal = ({ show, onClose, onSave, classroom }) => {
    const [formData, setFormData] = useState({
        name: "",
        capacity: 30,
        type: "general",
        equipment: [""],
        description: "",
        isActive: true
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (show) {
            if (classroom) {
                // Режим редагування
                setFormData({
                    name: classroom.name || "",
                    capacity: classroom.capacity || 30,
                    type: classroom.type || "general",
                    equipment: classroom.equipment && classroom.equipment.length > 0
                        ? [...classroom.equipment]
                        : [""],
                    description: classroom.description || "",
                    isActive: classroom.isActive !== undefined ? classroom.isActive : true
                });
            } else {
                // Режим створення
                setFormData({
                    name: "",
                    capacity: 30,
                    type: "general",
                    equipment: [""],
                    description: "",
                    isActive: true
                });
            }
            setError("");
        }
    }, [show, classroom]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEquipmentChange = (index, value) => {
        const newEquipment = [...formData.equipment];
        newEquipment[index] = value;
        setFormData(prev => ({
            ...prev,
            equipment: newEquipment
        }));
    };

    const addEquipmentField = () => {
        setFormData(prev => ({
            ...prev,
            equipment: [...prev.equipment, ""]
        }));
    };

    const removeEquipmentField = (index) => {
        if (formData.equipment.length > 1) {
            setFormData(prev => ({
                ...prev,
                equipment: prev.equipment.filter((_, i) => i !== index)
            }));
        }
    };

    // ВАЛІДАЦІЯ ТА ЗБЕРЕЖЕННЯ
    const handleSave = () => {
        // Валідація
        if (!formData.name.trim()) {
            setError("Назва аудиторії обов'язкова");
            return;
        }
        if (formData.capacity < 1 || formData.capacity > 500) {
            setError("Місткість повинна бути від 1 до 500 осіб");
            return;
        }

        const filteredEquipment = formData.equipment.filter(item => item.trim() !== "");

        const saveData = {
            ...formData,
            equipment: filteredEquipment,
            name: formData.name.trim()
        };

        onSave(saveData);
    };

    if (!show) return null;

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
                        <FaDoorOpen />
                        {classroom ? 'Редагувати аудиторію' : 'Додати аудиторію'}
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            <FaDoorOpen style={{
                                marginRight: '8px',
                                color: 'rgba(105, 180, 185, 1)',
                                fontSize: '14px'
                            }} />
                            Назва аудиторії *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Наприклад: 101, Актовий зал, Лабораторія 2А"
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

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
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
                                Місткість *
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                min="1"
                                max="500"
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

                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                <FaList style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: '14px'
                                }} />
                                Тип аудиторії
                            </label>
                            <select
                                name="type"
                                value={formData.type}
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
                            >
                                <option value="general">Загальна</option>
                                <option value="lecture">Лекційна</option>
                                <option value="practice">Практична</option>
                                <option value="lab">Лабораторія</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            <FaList style={{
                                marginRight: '8px',
                                color: 'rgba(105, 180, 185, 1)',
                                fontSize: '14px'
                            }} />
                            Обладнання
                        </label>
                        {formData.equipment.map((item, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                gap: '8px',
                                marginBottom: '8px',
                                alignItems: 'center'
                            }}>
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => handleEquipmentChange(index, e.target.value)}
                                    placeholder="Наприклад: проектор, комп'ютери, мікроскопи"
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
                                {formData.equipment.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeEquipmentField(index)}
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
                            onClick={addEquipmentField}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: 'transparent',
                                color: 'rgba(105, 180, 185, 1)',
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
                                e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                            }}
                        >
                            <FaPlus />
                            Додати обладнання
                        </button>
                    </div>

                    {/* Опис */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            Опис (необов'язково)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Додатковий опис аудиторії..."
                            rows="3"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                            }}
                        />
                    </div>

                    {classroom && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                id="isActive"
                            />
                            <label htmlFor="isActive" style={{
                                fontWeight: '600',
                                color: '#374151',
                                cursor: 'pointer'
                            }}>
                                Аудиторія активна
                            </label>
                        </div>
                    )}
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
                        type="button"
                        onClick={handleSave}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: 'rgba(105, 180, 185, 1)',
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
                            e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                        }}
                    >
                        <FaSave />
                        {classroom ? 'Оновити' : 'Створити'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassroomModal;