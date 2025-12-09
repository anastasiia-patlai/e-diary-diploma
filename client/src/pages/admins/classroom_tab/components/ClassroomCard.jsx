import React from "react";
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

const ClassroomCard = ({ classroom, onEdit, onDelete, onToggle, isMobile = false }) => {
    const getTypeIcon = (type) => {
        const icons = {
            'lecture': FaChalkboard,
            'practice': FaCogs,
            'lab': FaFlask,
            'general': FaDoorOpen
        };
        const IconComponent = icons[type] || FaDoorOpen;
        return <IconComponent size={isMobile ? 14 : 16} />;
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
            'lecture': '#3b82f6',
            'practice': '#10b981',
            'lab': '#f59e0b',
            'general': '#6b7280'
        };
        return colors[type] || '#6b7280';
    };

    return (
        <div style={{
            border: `1px solid ${classroom.isActive ? '#e5e7eb' : '#fca5a5'}`,
            borderRadius: "8px",
            backgroundColor: 'white',
            opacity: classroom.isActive ? 1 : 0.8,
            transition: "all 0.2s ease",
            overflow: 'hidden'
        }}
            onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            <div style={{
                backgroundColor: classroom.isActive ? "#f9fafb" : "#fef2f2",
                borderBottom: "1px solid #e5e7eb",
                padding: isMobile ? "12px" : "16px"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: 'wrap',
                    gap: isMobile ? '8px' : '0'
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flex: 1
                    }}>
                        {getTypeIcon(classroom.type)}
                        <h6 style={{
                            margin: 0,
                            color: classroom.isActive ? "#374151" : "#ef4444",
                            fontWeight: "600",
                            fontSize: isMobile ? '14px' : '16px',
                            wordBreak: 'break-word'
                        }}>
                            {classroom.name}
                        </h6>
                    </div>
                    <div style={{
                        display: "flex",
                        gap: "6px",
                        flexWrap: 'wrap'
                    }}>
                        <span style={{
                            backgroundColor: `${getTypeColor(classroom.type)}20`,
                            color: getTypeColor(classroom.type),
                            padding: isMobile ? '3px 8px' : '4px 10px',
                            borderRadius: "12px",
                            fontSize: isMobile ? '11px' : '12px',
                            fontWeight: "500",
                            border: `1px solid ${getTypeColor(classroom.type)}40`
                        }}>
                            {getTypeLabel(classroom.type)}
                        </span>
                        <span style={{
                            backgroundColor: classroom.isActive ? "#10b98120" : "#ef444420",
                            color: classroom.isActive ? "#10b981" : "#ef4444",
                            padding: isMobile ? '3px 8px' : '4px 10px',
                            borderRadius: "12px",
                            fontSize: isMobile ? '11px' : '12px',
                            fontWeight: "500",
                            border: `1px solid ${classroom.isActive ? '#10b98140' : '#ef444440'}`
                        }}>
                            {classroom.isActive ? "Активна" : "Неактивна"}
                        </span>
                    </div>
                </div>
            </div>
            <div style={{ padding: isMobile ? "12px" : "16px" }}>
                <div style={{ marginBottom: isMobile ? "12px" : "16px" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "6px"
                    }}>
                        <FaUsers style={{
                            color: "#6b7280",
                            fontSize: isMobile ? "12px" : "14px"
                        }} />
                        <span style={{
                            color: "#6b7280",
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            <strong>Місткість:</strong> {classroom.capacity} осіб
                        </span>
                    </div>

                    {classroom.equipment && classroom.equipment.length > 0 && (
                        <div style={{ marginBottom: "6px" }}>
                            <span style={{
                                color: "#6b7280",
                                fontSize: isMobile ? '13px' : '14px'
                            }}>
                                <strong>Обладнання:</strong> {classroom.equipment.join(', ')}
                            </span>
                        </div>
                    )}

                    {classroom.description && (
                        <div>
                            <span style={{
                                color: "#6b7280",
                                fontSize: isMobile ? '13px' : '14px'
                            }}>
                                <strong>Опис:</strong> {classroom.description}
                            </span>
                        </div>
                    )}
                </div>

                <div style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "stretch" : "center",
                    gap: isMobile ? "8px" : "0"
                }}>
                    <div style={{
                        display: "flex",
                        gap: "6px",
                        flex: isMobile ? '1' : '0'
                    }}>
                        <button
                            onClick={() => onEdit(classroom)}
                            style={{
                                padding: isMobile ? "8px 12px" : "8px 12px",
                                backgroundColor: "rgba(105, 180, 185, 1)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: isMobile ? "12px" : "13px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                flex: isMobile ? "1" : "0",
                                transition: "background-color 0.2s"
                            }}
                        >
                            <FaEdit size={isMobile ? 12 : 14} />
                            {isMobile ? "Ред." : "Редагувати"}
                        </button>
                        <button
                            onClick={() => onToggle(classroom._id)}
                            style={{
                                padding: isMobile ? "8px 12px" : "8px 12px",
                                backgroundColor: classroom.isActive ? "#6b7280" : "#10b981",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: isMobile ? "12px" : "13px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                flex: isMobile ? "1" : "0",
                                transition: "background-color 0.2s"
                            }}
                        >
                            {classroom.isActive ? <FaPowerOff size={isMobile ? 12 : 14} /> : <FaPlay size={isMobile ? 12 : 14} />}
                            {isMobile ? (classroom.isActive ? "Деакт." : "Акт.") : (classroom.isActive ? "Деактив." : "Актив.")}
                        </button>
                    </div>
                    <button
                        onClick={() => onDelete(classroom)}
                        style={{
                            padding: isMobile ? "8px 12px" : "8px 12px",
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: isMobile ? "12px" : "13px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            flex: isMobile ? "1" : "0",
                            transition: "background-color 0.2s"
                        }}
                    >
                        <FaTrash size={isMobile ? 12 : 14} />
                        {isMobile ? "Вид." : "Видалити"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassroomCard;