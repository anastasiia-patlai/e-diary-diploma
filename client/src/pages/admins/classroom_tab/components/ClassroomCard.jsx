import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import {
    FaEdit,
    FaTrash,
    FaDoorOpen,
    FaUsers,
    FaPowerOff,
    FaPlay,
    FaChalkboard,
    FaFlask,
    FaCogs
} from "react-icons/fa";

const ClassroomCard = ({ classroom, onEdit, onDelete, onToggle }) => {
    const getTypeIcon = (type) => {
        const icons = {
            'lecture': FaChalkboard,
            'practice': FaCogs,
            'lab': FaFlask,
            'general': FaDoorOpen
        };
        const IconComponent = icons[type] || FaDoorOpen;
        return <IconComponent />;
    };

    const getTypeLabel = (type) => {
        const labels = {
            'lecture': 'Лекційна',
            'practice': 'Практична',
            'lab': 'Лабораторія',
            'general': 'Загальна'
        };
        return labels[type] || 'Загальна';
    };

    const getTypeColor = (type) => {
        const colors = {
            'lecture': 'primary',
            'practice': 'success',
            'lab': 'warning',
            'general': 'secondary'
        };
        return colors[type] || 'secondary';
    };

    return (
        <Card className="h-100" style={{
            border: `1px solid ${classroom.isActive ? '#e5e7eb' : '#fca5a5'}`,
            borderRadius: "8px",
            opacity: classroom.isActive ? 1 : 0.7,
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
                backgroundColor: classroom.isActive ? "#f9fafb" : "#fef2f2",
                borderBottom: "1px solid #e5e7eb",
                padding: "12px 16px"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {getTypeIcon(classroom.type)}
                        <h6 style={{
                            margin: 0,
                            color: classroom.isActive ? "#374151" : "#ef4444",
                            fontWeight: "600"
                        }}>
                            {classroom.name}
                        </h6>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                        <Badge bg={getTypeColor(classroom.type)}>
                            {getTypeLabel(classroom.type)}
                        </Badge>
                        <Badge bg={classroom.isActive ? "success" : "danger"}>
                            {classroom.isActive ? "Активна" : "Неактивна"}
                        </Badge>
                    </div>
                </div>
            </Card.Header>
            <Card.Body style={{ padding: "16px" }}>
                <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <FaUsers style={{ color: "#6b7280", fontSize: "12px" }} />
                        <small style={{ color: "#6b7280" }}>
                            <strong>Місткість:</strong> {classroom.capacity} осіб
                        </small>
                    </div>

                    {classroom.equipment && classroom.equipment.length > 0 && (
                        <div style={{ marginBottom: "4px" }}>
                            <small style={{ color: "#6b7280" }}>
                                <strong>Обладнання:</strong> {classroom.equipment.join(', ')}
                            </small>
                        </div>
                    )}

                    {classroom.description && (
                        <div>
                            <small style={{ color: "#6b7280" }}>
                                <strong>Опис:</strong> {classroom.description}
                            </small>
                        </div>
                    )}
                </div>

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onEdit(classroom)}
                            style={{
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
                            variant={classroom.isActive ? "outline-warning" : "outline-success"}
                            size="sm"
                            onClick={() => onToggle(classroom._id)}
                            style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                            }}
                        >
                            {classroom.isActive ? <FaPowerOff /> : <FaPlay />}
                            {classroom.isActive ? "Деактив." : "Актив."}
                        </Button>
                    </div>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDelete(classroom)}
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

export default ClassroomCard;