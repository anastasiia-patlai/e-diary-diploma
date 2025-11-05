import React from "react";
import { Card, Button } from "react-bootstrap";
import { FaEdit, FaTrash, FaChalkboardTeacher, FaUsers, FaDoorOpen, FaCalendarAlt } from "react-icons/fa";
import { getSubjectName, getDayOfWeek, getLessonType, getCardColorClass } from "../scheduleHelpers";

const ScheduleCard = ({ schedule, onEdit, onDelete }) => {
    if (!schedule || typeof schedule !== "object") {
        return null;
    }

    return (
        <Card className={`h-100 ${getCardColorClass(schedule.lessonType)}`}
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
                    {getDayOfWeek(schedule.dayOfWeek)} • {schedule.startTime} - {schedule.endTime}
                </small>
            </Card.Header>
            <Card.Body style={{ padding: "16px" }}>
                <h6 style={{
                    color: "rgba(105, 180, 185, 1)",
                    marginBottom: "12px",
                    fontWeight: "600"
                }}>
                    {getSubjectName(schedule.teacher)}
                </h6>
                <div style={{ marginBottom: "12px" }}>
                    <small style={{ color: "#6b7280", display: "block", marginBottom: "4px" }}>
                        <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaChalkboardTeacher style={{ fontSize: "12px" }} />
                            Викладач:
                        </strong>
                        {schedule.teacher?.fullName || "Не вказано"}
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
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <span style={{
                        backgroundColor: "#6b7280",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500"
                    }}>
                        {getLessonType(schedule.lessonType)}
                    </span>
                    <div>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onEdit(schedule)}
                            style={{
                                marginRight: "8px",
                                padding: "4px 8px",
                                fontSize: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                            }}
                        >
                            <FaEdit style={{ fontSize: "10px" }} />
                            Редагувати
                        </Button>
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
                </div>
            </Card.Body>
        </Card>
    );
};

export default ScheduleCard;