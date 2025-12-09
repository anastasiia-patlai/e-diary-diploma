import React from "react";
import { FaDoorOpen } from "react-icons/fa";
import ClassroomCard from "./ClassroomCard";

const ClassroomsList = ({
    classrooms,
    loading,
    onEditClassroom,
    onDeleteClassroom,
    onToggleClassroom,
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
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        <FaDoorOpen size={isMobile ? 16 : 20} style={{ color: "rgba(105, 180, 185, 1)" }} />
                        <h5 style={{
                            margin: 0,
                            fontSize: isMobile ? "16px" : "18px",
                            color: "#374151",
                            fontWeight: "600"
                        }}>
                            Список аудиторій
                        </h5>
                    </div>
                    <div style={{
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        padding: isMobile ? '3px 8px' : '4px 10px',
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: '600',
                        borderRadius: '12px',
                        whiteSpace: 'nowrap'
                    }}>
                        {classrooms.length} аудиторій
                    </div>
                </div>
            </div>
            <div style={{
                padding: isMobile ? "16px" : "24px",
                backgroundColor: "white",
                minHeight: '200px'
            }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: isMobile ? "40px 20px" : "60px 20px" }}>
                        <p style={{ color: "#6b7280", margin: 0 }}>Завантаження аудиторій...</p>
                    </div>
                ) : classrooms.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: isMobile ? "40px 20px" : "60px 20px",
                        border: '2px dashed #e5e7eb',
                        borderRadius: '8px'
                    }}>
                        <FaDoorOpen size={isMobile ? 48 : 64} style={{
                            color: "#d1d5db",
                            marginBottom: isMobile ? "16px" : "20px"
                        }} />
                        <h6 style={{
                            color: "#6b7280",
                            marginBottom: "8px",
                            fontSize: isMobile ? "16px" : "18px"
                        }}>
                            Аудиторії ще не додані
                        </h6>
                        <p style={{
                            color: "#6b7280",
                            margin: 0,
                            fontSize: isMobile ? "13px" : "14px"
                        }}>
                            Натисніть кнопку "Додати аудиторію" щоб створити першу аудиторію
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: isMobile ? "12px" : "16px"
                    }}>
                        {classrooms.map((classroom) => (
                            <ClassroomCard
                                key={classroom._id}
                                classroom={classroom}
                                onEdit={onEditClassroom}
                                onDelete={onDeleteClassroom}
                                onToggle={onToggleClassroom}
                                isMobile={isMobile}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassroomsList;