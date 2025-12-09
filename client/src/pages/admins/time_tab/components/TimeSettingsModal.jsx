import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaSave, FaCalendarDay } from "react-icons/fa";
import TimeSlotItem from "./TimeSlotItem";

const TimeSettingsModal = ({ show, onClose, onSave, existingTimeSlots, currentDay, isMobile = false }) => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [error, setError] = useState("");
    const [databaseName, setDatabaseName] = useState("");

    useEffect(() => {
        const getCurrentDatabase = () => {
            let dbName = localStorage.getItem('databaseName');
            if (!dbName) {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        if (user.databaseName) {
                            dbName = user.databaseName;
                        }
                    } catch (e) { }
                }
            }
            return dbName;
        };

        const dbName = getCurrentDatabase();
        if (dbName) {
            setDatabaseName(dbName);
        }
    }, []);

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

    const updateTimeSlot = (index, field, value) => {
        const newTimeSlots = timeSlots.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        );
        setTimeSlots(newTimeSlots);
    };

    const handleSave = () => {
        for (let i = 0; i < timeSlots.length; i++) {
            const slot = timeSlots[i];
            if (!slot.startTime || !slot.endTime) {
                setError("Усі поля повинні бути заповнені");
                return;
            }
            if (slot.startTime >= slot.endTime) {
                setError(`Урок ${i + 1}: час початку повинен бути раніше за час закінчення`);
                return;
            }
        }

        const timeSlotsToSave = timeSlots.map(slot => ({
            order: parseInt(slot.order) || 1,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isActive: slot.isActive !== false
        }));

        onSave(timeSlotsToSave);
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
            alignItems: isMobile ? 'flex-start' : 'center',
            zIndex: 1000,
            padding: isMobile ? '16px' : '0',
            overflowY: 'auto'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '24px',
                width: isMobile ? '100%' : '90%',
                maxWidth: '600px',
                maxHeight: isMobile ? 'calc(100vh - 32px)' : '90vh',
                overflowY: 'auto',
                marginTop: isMobile ? '0' : 'auto'
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
                            <FaCalendarDay size={isMobile ? 16 : 18} />
                            Налаштування часу уроків
                        </h2>
                        <p style={{
                            margin: isMobile ? '2px 0 0 0' : '4px 0 0 0',
                            color: '#6b7280',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            Для дня: <strong>{currentDay.name}</strong>
                        </p>
                        {databaseName && (
                            <p style={{
                                margin: 0,
                                color: '#9ca3af',
                                fontSize: '12px',
                                marginTop: '2px'
                            }}>
                                База даних: {databaseName}
                            </p>
                        )}
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

                <div style={{ marginBottom: isMobile ? '16px' : '20px' }}>
                    {timeSlots.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: isMobile ? '30px 20px' : '40px 20px',
                            color: '#6b7280',
                            fontSize: isMobile ? '14px' : '16px'
                        }}>
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
                                isMobile={isMobile}
                            />
                        ))
                    )}
                </div>

                <button
                    type="button"
                    onClick={addTimeSlot}
                    style={{
                        width: '100%',
                        padding: isMobile ? '10px' : '12px',
                        backgroundColor: 'transparent',
                        color: 'rgba(105, 180, 185, 1)',
                        border: '2px dashed rgba(105, 180, 185, 1)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: isMobile ? '13px' : '14px',
                        fontWeight: '600',
                        marginBottom: isMobile ? '16px' : '20px',
                        transition: 'all 0.2s'
                    }}
                >
                    <FaPlus size={isMobile ? 12 : 14} />
                    Додати урок для {currentDay.name}
                </button>

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
                            padding: isMobile ? '10px' : '12px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: isMobile ? '13px' : '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <FaTimes size={isMobile ? 12 : 14} />
                        Скасувати
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!databaseName}
                        style={{
                            padding: isMobile ? '10px' : '12px',
                            backgroundColor: !databaseName ? '#d1d5db' : 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: !databaseName ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: isMobile ? '13px' : '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <FaSave size={isMobile ? 12 : 14} />
                        Зберегти для {currentDay.name}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimeSettingsModal;