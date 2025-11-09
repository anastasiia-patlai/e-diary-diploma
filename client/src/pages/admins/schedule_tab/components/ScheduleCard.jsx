import React from "react";
import { Card, Button } from "react-bootstrap";
import { FaTrash, FaChalkboardTeacher, FaUsers, FaDoorOpen, FaCalendarAlt, FaClock, FaBook } from "react-icons/fa";

const ScheduleCard = ({ schedule, onDelete }) => {
    if (!schedule || typeof schedule !== "object") {
        return null;
    }

    return (
        <Card className="h-100"
            style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                transition: "box-shadow 0.2s"
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            <Card.Header style={{
                backgroundColor: "transparent",
                borderBottom: "1px solid #e5e7eb",
                padding: "12px 16px"
            }}>
                <small style={{ color: "#6b7280", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaCalendarAlt style={{ fontSize: "12px" }} />
                    {schedule.dayOfWeek?.name || 'День не вказано'}
                </small>
            </Card.Header>
            <Card.Body style={{ padding: "16px" }}>
                <div style={{ marginBottom: "12px" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "8px"
                    }}>
                        <FaBook style={{ fontSize: "12px", color: "rgba(105, 180, 185, 1)" }} />
                        <span style={{
                            fontWeight: "600",
                            color: "rgba(105, 180, 185, 1)",
                            fontSize: "14px"
                        }}>
                            {schedule.subject || 'Предмет не вказано'}
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                        <FaClock style={{ fontSize: "12px", color: "rgba(105, 180, 185, 1)" }} />
                        <span style={{ fontWeight: "600", color: "rgba(105, 180, 185, 1)" }}>
                            {schedule.timeSlot ?
                                `${schedule.timeSlot.order}. ${schedule.timeSlot.startTime} - ${schedule.timeSlot.endTime}`
                                : 'Час не вказано'
                            }
                        </span>
                    </div>

                    <small style={{ color: "#6b7280", display: "block", marginBottom: "4px" }}>
                        <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaChalkboardTeacher style={{ fontSize: "12px" }} />
                            Викладач:
                        </strong>
                        {schedule.teacher?.fullName || "Не вказано"}
                        {schedule.teacher?.position && ` (${schedule.teacher.position})`}
                    </small>

                    <small style={{ color: "#6b7280", display: "block", marginBottom: "4px" }}>
                        <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaUsers style={{ fontSize: "12px" }} />
                            Група:
                        </strong>
                        {schedule.group?.name || "Не вказано"}
                    </small>

                    <small style={{ color: "#6b7280", display: "block", marginBottom: "4px" }}>
                        <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaDoorOpen style={{ fontSize: "12px" }} />
                            Аудиторія:
                        </strong>
                        {schedule.classroom?.name || "Не вказано"}
                    </small>
                </div>

                <div style={{
                    display: "flex",
                    justifyContent: "flex-end"
                }}>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDelete(schedule._id)}
                        style={{
                            padding: "4px 8px",
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
            </Card.Body>
        </Card>
    );
};

export default ScheduleCard;