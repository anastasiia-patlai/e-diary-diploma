// src/pages/admins/time_tab/components/TimeSlotsList.jsx
import React from "react";
import { Row, Col, Card, Button, Badge } from "react-bootstrap";
import { FaClock, FaTrash, FaExclamationTriangle } from "react-icons/fa";

const TimeSlotsList = ({
    timeSlots,
    loading,
    currentDay,
    onDeleteTimeSlot

}) => {
    return (
        <Row>
            <Col>
                <Card style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px"
                }}>
                    <Card.Header style={{
                        backgroundColor: "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                        padding: "16px 20px"
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <h5 style={{
                                margin: 0,
                                fontSize: "18px",
                                color: "#374151",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}>
                                <FaClock />
                                Розклад уроків для {currentDay.name}
                            </h5>
                            <div style={{
                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                padding: '0.35em 0.65em',
                                fontSize: '0.75em',
                                fontWeight: '700',
                                lineHeight: '1',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'baseline',
                                borderRadius: '0.375rem',
                                display: 'inline-block'
                            }}>
                                {timeSlots.length} уроків
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body style={{ padding: "24px" }}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                <p style={{ color: "#6b7280", margin: 0 }}>Завантаження...</p>
                            </div>
                        ) : timeSlots.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                <FaExclamationTriangle style={{
                                    fontSize: "48px",
                                    color: "#d1d5db",
                                    marginBottom: "16px"
                                }} />
                                <h6 style={{ color: "#6b7280", marginBottom: "8px" }}>
                                    Для {currentDay.name} ще не налаштовано розклад
                                </h6>
                                <p style={{ color: "#6b7280", margin: 0 }}>
                                    Натисніть кнопку "Налаштувати час" щоб додати уроки для цього дня
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {timeSlots.map((slot, index) => (
                                    <TimeSlotListItem
                                        key={slot._id}
                                        slot={slot}
                                        index={index}
                                        onDelete={onDeleteTimeSlot}
                                    />
                                ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

// Допоміжний компонент для елемента списку
const TimeSlotListItem = ({ slot, index, onDelete }) => {  // Видалили onToggle
    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "rgba(105, 180, 185, 1)",
                    color: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "600",
                    fontSize: "14px"
                }}>
                    {slot.order}
                </div>
                <div>
                    <div style={{
                        fontWeight: "600",
                        color: "#374151"
                    }}>
                        Урок {slot.order}
                    </div>
                    <div style={{
                        color: "#6b7280",
                        fontSize: "14px"
                    }}>
                        {slot.startTime} - {slot.endTime}
                    </div>
                </div>
            </div>
            <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(slot._id)}
                style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                }}
            >
                <FaTrash style={{ fontSize: "10px" }} />
                Видалити
            </Button>
        </div>
    );
};

export default TimeSlotsList;