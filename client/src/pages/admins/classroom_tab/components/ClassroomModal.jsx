import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaDoorOpen, FaUsers, FaList, FaPlus, FaMinus } from "react-icons/fa";

const ClassroomModal = ({ show, onClose, onSave, classroom, isMobile = false }) => {
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

    const handleSave = () => {
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
            zIndex: 1000,
            padding: isMobile ? '16px' : '0',
            overflowY: 'auto'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '24px',
                width: isMobile ? 'calc(100% - 32px)' : '90%',
                maxWidth: '500px',
                maxHeight: isMobile ? 'calc(100vh - 32px)' : '90vh',
                overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                // Додаємо для центрування
                position: 'relative',
                margin: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: isMobile ? '16px' : '20px',
                    gap: '12px'
                }}>
                    <div style={{ flex: 1 }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: isMobile ? '18px' : '20px',
                            color: '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '8px' : '10px'
                        }}>
                            <FaDoorOpen size={isMobile ? 16 : 18} />
                            {classroom ? 'Редагувати аудиторію' : 'Додати аудиторію'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: isMobile ? '18px' : '20px',
                            color: '#6b7280',
                            transition: 'color 0.2s',
                            padding: '4px',
                            flexShrink: 0
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: isMobile ? '10px 12px' : '12px',
                        borderRadius: '6px',
                        marginBottom: isMobile ? '12px' : '16px',
                        fontSize: isMobile ? '13px' : '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <FaTimes />
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px' }}>
                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#374151',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            <FaDoorOpen style={{
                                marginRight: '8px',
                                color: 'rgba(105, 180, 185, 1)',
                                fontSize: isMobile ? '13px' : '14px'
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
                                padding: isMobile ? '10px 12px' : '12px 14px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: isMobile ? '14px' : '15px',
                                boxSizing: 'border-box',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '12px' : '12px'
                    }}>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '6px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '13px' : '14px'
                            }}>
                                <FaUsers style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: isMobile ? '13px' : '14px'
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
                                    padding: isMobile ? '10px 12px' : '12px 14px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: isMobile ? '14px' : '15px',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '6px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '13px' : '14px'
                            }}>
                                <FaList style={{
                                    marginRight: '8px',
                                    color: 'rgba(105, 180, 185, 1)',
                                    fontSize: isMobile ? '13px' : '14px'
                                }} />
                                Тип аудиторії
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: isMobile ? '10px 12px' : '12px 14px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: isMobile ? '14px' : '15px',
                                    boxSizing: 'border-box',
                                    outline: 'none'
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
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#374151',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            <FaList style={{
                                marginRight: '8px',
                                color: 'rgba(105, 180, 185, 1)',
                                fontSize: isMobile ? '13px' : '14px'
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
                                        padding: isMobile ? '10px 12px' : '12px 14px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        fontSize: isMobile ? '14px' : '15px',
                                        boxSizing: 'border-box',
                                        outline: 'none'
                                    }}
                                />
                                {formData.equipment.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeEquipmentField(index)}
                                        style={{
                                            padding: isMobile ? '10px 12px' : '12px 14px',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        <FaMinus size={isMobile ? 12 : 14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addEquipmentField}
                            style={{
                                padding: isMobile ? '8px 12px' : '10px 14px',
                                backgroundColor: 'transparent',
                                color: 'rgba(105, 180, 185, 1)',
                                border: '1px solid rgba(105, 180, 185, 1)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: isMobile ? '13px' : '14px',
                                width: '100%'
                            }}
                        >
                            <FaPlus size={isMobile ? 12 : 14} />
                            Додати обладнання
                        </button>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#374151',
                            fontSize: isMobile ? '13px' : '14px'
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
                                padding: isMobile ? '10px 12px' : '12px 14px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: isMobile ? '14px' : '15px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {classroom && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '8px'
                        }}>
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                id="isActive"
                                style={{
                                    width: '18px',
                                    height: '18px'
                                }}
                            />
                            <label htmlFor="isActive" style={{
                                fontWeight: '600',
                                color: '#374151',
                                cursor: 'pointer',
                                fontSize: isMobile ? '13px' : '14px'
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
                    borderTop: '1px solid #e5e7eb',
                    flexDirection: isMobile ? 'column' : 'row'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: isMobile ? '12px' : '12px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: isMobile ? '14px' : '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaTimes size={isMobile ? 12 : 14} />
                        Скасувати
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        style={{
                            padding: isMobile ? '12px' : '12px',
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: isMobile ? '14px' : '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaSave size={isMobile ? 12 : 14} />
                        {classroom ? 'Оновити' : 'Створити'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassroomModal;