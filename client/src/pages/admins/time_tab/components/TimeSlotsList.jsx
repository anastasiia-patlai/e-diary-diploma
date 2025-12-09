import React from "react";
import { FaClock, FaTrash, FaExclamationTriangle } from "react-icons/fa";

const TimeSlotsList = ({
    timeSlots,
    loading,
    currentDay,
    onDeleteTimeSlot,
    isMobile = false
}) => {
    return (
        <div style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            overflow: "hidden"
        }}>
            <div style={{
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                padding: isMobile ? "12px 16px" : "16px 20px"
            }}>
                <div style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    gap: isMobile ? "8px" : "0"
                }}>
                    <h5 style={{
                        margin: 0,
                        fontSize: isMobile ? "15px" : "18px",
                        color: "#374151",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        <FaClock size={isMobile ? 14 : 16} />
                        Розклад уроків для {currentDay.name}
                    </h5>
                    <div style={{
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        padding: isMobile ? '3px 8px' : '4px 10px',
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: '600',
                        borderRadius: '12px',
                        whiteSpace: 'nowrap'
                    }}>
                        {timeSlots.length} уроків
                    </div>
                </div>
            </div>
            <div style={{ padding: isMobile ? "16px" : "24px", backgroundColor: "white" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: isMobile ? "30px 20px" : "40px 20px" }}>
                        <p style={{ color: "#6b7280", margin: 0 }}>Завантаження...</p>
                    </div>
                ) : timeSlots.length === 0 ? (
                    <div style={{ textAlign: "center", padding: isMobile ? "30px 20px" : "40px 20px" }}>
                        <FaExclamationTriangle style={{
                            fontSize: isMobile ? "36px" : "48px",
                            color: "#d1d5db",
                            marginBottom: "12px"
                        }} />
                        <h6 style={{
                            color: "#6b7280",
                            marginBottom: "8px",
                            fontSize: isMobile ? "14px" : "16px"
                        }}>
                            Для {currentDay.name} ще не налаштовано розклад
                        </h6>
                        <p style={{
                            color: "#6b7280",
                            margin: 0,
                            fontSize: isMobile ? "12px" : "14px"
                        }}>
                            Натисніть кнопку "Налаштувати час" щоб додати уроки для цього дня
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "8px" : "12px" }}>
                        {timeSlots.map((slot, index) => (
                            <TimeSlotListItem
                                key={slot._id}
                                slot={slot}
                                index={index}
                                onDelete={onDeleteTimeSlot}
                                isMobile={isMobile}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const TimeSlotListItem = ({ slot, index, onDelete, isMobile = false }) => {
    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: isMobile ? "12px" : "16px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            flexWrap: isMobile ? "wrap" : "nowrap",
            gap: isMobile ? "8px" : "0"
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "12px" : "16px",
                flex: 1
            }}>
                <div style={{
                    width: isMobile ? "28px" : "32px",
                    height: isMobile ? "28px" : "32px",
                    backgroundColor: "rgba(105, 180, 185, 1)",
                    color: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "600",
                    fontSize: isMobile ? "13px" : "14px",
                    flexShrink: 0
                }}>
                    {slot.order}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontWeight: "600",
                        color: "#374151",
                        fontSize: isMobile ? "14px" : "15px"
                    }}>
                        Урок {slot.order}
                    </div>
                    <div style={{
                        color: "#6b7280",
                        fontSize: isMobile ? "13px" : "14px"
                    }}>
                        {slot.startTime} - {slot.endTime}
                    </div>
                </div>
            </div>
            <button
                onClick={() => onDelete(slot._id)}
                style={{
                    padding: isMobile ? "6px 10px" : "6px 12px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: isMobile ? "12px" : "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    flexShrink: 0,
                    width: isMobile ? "100%" : "auto"
                }}
            >
                <FaTrash size={isMobile ? 10 : 12} />
                Видалити
            </button>
        </div>
    );
};

export default TimeSlotsList;