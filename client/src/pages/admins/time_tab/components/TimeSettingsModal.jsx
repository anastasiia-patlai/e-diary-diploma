import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaSave, FaCalendarDay } from "react-icons/fa";

import { validateTimeSlots } from "./timeValidation";
import TimeSlotItem from "./TimeSlotItem";

const TimeSettingsModal = ({ show, onClose, onSave, existingTimeSlots, currentDay }) => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (show) {
            if (existingTimeSlots.length > 0) {
                setTimeSlots([...existingTimeSlots]);
            } else {
                setTimeSlots([]);
            }
            setError("");
        }
    }, [show, existingTimeSlots]);

    // ДОДАТИ НОВИЙ УРОК
    const addTimeSlot = () => {
        const newOrder = timeSlots.length + 1;
        setTimeSlots([
            ...timeSlots,
            {
                order: newOrder,
                startTime: "08:00",
                endTime: "08:45",
                isActive: true
            }
        ]);
    };

    // ВИДАЛИТИ УРОК
    const removeTimeSlot = (index) => {
        if (timeSlots.length > 0) {
            const newTimeSlots = timeSlots.filter((_, i) => i !== index);
            const reorderedSlots = newTimeSlots.map((slot, idx) => ({
                ...slot,
                order: idx + 1
            }));
            setTimeSlots(reorderedSlots);
        }
    };

    // ОНОВИТИ ЧАС УРОКУ
    const updateTimeSlot = (index, field, value) => {
        const newTimeSlots = timeSlots.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        );
        setTimeSlots(newTimeSlots);
    };

    // ЗБЕРЕГТИ НАЛАШТУВАННЯ
    const handleSave = () => {
        console.log("timeSlots перед валідацією:", timeSlots);

        // Валідація
        for (let i = 0; i < timeSlots.length; i++) {
            const slot = timeSlots[i];
            console.log(`Перевірка уроку ${i + 1}:`, slot);

            if (!slot.startTime || !slot.endTime) {
                setError("Усі поля повинні бути заповнені");
                return;
            }
            if (slot.startTime >= slot.endTime) {
                setError(`У уроку ${i + 1} час початку повинен бути раніше за час закінчення`);
                return;
            }
        }

        const dataToSave = timeSlots.map(slot => ({
            order: parseInt(slot.order) || 1,
            startTime: slot.startTime,
            endTime: slot.endTime
        }));

        console.log("ДАНІ ГОТОВІ ДО ЗБЕРЕЖЕННЯ:", dataToSave);
        onSave(dataToSave);
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
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '20px',
                            color: '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <FaCalendarDay />
                            Налаштування часу уроків
                        </h2>
                        <p style={{
                            margin: 0,
                            color: '#6b7280',
                            fontSize: '14px',
                            marginTop: '4px'
                        }}>
                            Для дня: <strong>{currentDay.name}</strong>
                        </p>
                    </div>
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

                <div style={{ marginBottom: '20px' }}>
                    {timeSlots.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                            Ще не додано жодного уроку для {currentDay.name}
                        </div>
                    ) : (
                        timeSlots.map((slot, index) => (
                            <TimeSlotItem
                                key={index}
                                slot={slot}
                                index={index}
                                onUpdate={(field, value) => updateTimeSlot(index, field, value)}
                                onRemove={() => removeTimeSlot(index)}
                            />
                        ))
                    )}
                </div>

                <button
                    type="button"
                    onClick={addTimeSlot}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'transparent',
                        color: 'rgba(105, 180, 185, 1)',
                        border: '2px dashed rgba(105, 180, 185, 1)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '20px',
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
                    Додати урок для {currentDay.name}
                </button>

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
                        Зберегти для {currentDay.name}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimeSettingsModal;