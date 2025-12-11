import React from "react";
import { Card, Button } from "react-bootstrap";
import { FaTrash, FaChalkboardTeacher, FaUsers, FaDoorOpen, FaCalendarAlt, FaClock, FaBook } from "react-icons/fa";

const ScheduleCard = ({ schedule, onDelete, isMobile = false }) => {
    if (!schedule || typeof schedule !== "object") {
        return null;
    }

    return (
        <Card className="h-100"
            style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                transition: "box-shadow 0.2s",
                marginBottom: isMobile ? "0" : "auto"
            }}
            onMouseOver={(e) => {
                if (!isMobile) {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                }
            }}
            onMouseOut={(e) => {
                if (!isMobile) {
                    e.currentTarget.style.boxShadow = "none";
                }
            }}
        >
            <Card.Header style={{
                backgroundColor: "transparent",
                borderBottom: "1px solid #e5e7eb",
                padding: isMobile ? "10px 12px" : "12px 16px"
            }}>
                <small style={{
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: isMobile ? "11px" : "12px"
                }}>
                    <FaCalendarAlt style={{ fontSize: isMobile ? "10px" : "12px" }} />
                    {schedule.dayOfWeek?.name || 'День не вказано'}
                </small>
            </Card.Header>
            <Card.Body style={{ padding: isMobile ? "12px" : "16px" }}>
                <div style={{ marginBottom: isMobile ? "10px" : "12px" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "8px"
                    }}>
                        <FaBook style={{
                            fontSize: isMobile ? "10px" : "12px",
                            color: "rgba(105, 180, 185, 1)",
                            flexShrink: 0
                        }} />
                        <span style={{
                            fontWeight: "600",
                            color: "rgba(105, 180, 185, 1)",
                            fontSize: isMobile ? "13px" : "14px",
                            wordBreak: "break-word"
                        }}>
                            {schedule.subject || 'Предмет не вказано'}
                        </span>
                    </div>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "8px"
                    }}>
                        <FaClock style={{
                            fontSize: isMobile ? "10px" : "12px",
                            color: "rgba(105, 180, 185, 1)",
                            flexShrink: 0
                        }} />
                        <span style={{
                            fontWeight: "600",
                            color: "rgba(105, 180, 185, 1)",
                            fontSize: isMobile ? "13px" : "14px"
                        }}>
                            {schedule.timeSlot ?
                                isMobile ?
                                    `${schedule.timeSlot.order}. ${schedule.timeSlot.startTime}-${schedule.timeSlot.endTime}` :
                                    `${schedule.timeSlot.order}. ${schedule.timeSlot.startTime} - ${schedule.timeSlot.endTime}`
                                : 'Час не вказано'
                            }
                        </span>
                    </div>

                    <small style={{
                        color: "#6b7280",
                        display: "block",
                        marginBottom: "4px",
                        fontSize: isMobile ? "11px" : "12px"
                    }}>
                        <strong style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "2px"
                        }}>
                            <FaChalkboardTeacher style={{ fontSize: isMobile ? "10px" : "12px" }} />
                            Викладач:
                        </strong>
                        <div style={{
                            paddingLeft: isMobile ? "18px" : "20px",
                            wordBreak: "break-word"
                        }}>
                            {schedule.teacher?.fullName || "Не вказано"}
                            {schedule.teacher?.position && ` (${schedule.teacher.position})`}
                        </div>
                    </small>

                    <small style={{
                        color: "#6b7280",
                        display: "block",
                        marginBottom: "4px",
                        fontSize: isMobile ? "11px" : "12px"
                    }}>
                        <strong style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "2px"
                        }}>
                            <FaUsers style={{ fontSize: isMobile ? "10px" : "12px" }} />
                            Група:
                        </strong>
                        <div style={{ paddingLeft: isMobile ? "18px" : "20px" }}>
                            {schedule.group?.name || "Не вказано"}
                        </div>
                    </small>

                    <small style={{
                        color: "#6b7280",
                        display: "block",
                        marginBottom: "4px",
                        fontSize: isMobile ? "11px" : "12px"
                    }}>
                        <strong style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "2px"
                        }}>
                            <FaDoorOpen style={{ fontSize: isMobile ? "10px" : "12px" }} />
                            Аудиторія:
                        </strong>
                        <div style={{ paddingLeft: isMobile ? "18px" : "20px" }}>
                            {schedule.classroom?.name || "Не вказано"}
                        </div>
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
                            padding: isMobile ? "4px 8px" : "4px 8px",
                            fontSize: isMobile ? "11px" : "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            minWidth: isMobile ? "auto" : "unset"
                        }}
                    >
                        <FaTrash style={{ fontSize: isMobile ? "9px" : "10px" }} />
                        Видалити
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ScheduleCard;