import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

const DaysNavigation = ({ days, selectedDay, onDayChange, daysSummary, isMobile = false }) => {
    const getLessonCount = (dayId) => {
        const summary = daysSummary.find(item => {
            const day = days.find(d => d._id === item._id);
            return day && day.id === dayId;
        });
        return summary ? summary.count : 0;
    };

    return (
        <div style={{ marginBottom: isMobile ? "16px" : "20px" }}>
            <div style={{
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                padding: isMobile ? "10px 12px" : "12px 16px",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px"
            }}>
                <h6 style={{
                    margin: 0,
                    fontSize: isMobile ? "13px" : "14px",
                    color: "#374151",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    <FaCalendarAlt size={isMobile ? 12 : 14} />
                    Виберіть день тижня для налаштування:
                </h6>
            </div>
            <div style={{
                padding: isMobile ? "12px" : "16px",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderTop: "none",
                borderBottomLeftRadius: "8px",
                borderBottomRightRadius: "8px"
            }}>
                <div style={{
                    display: "flex",
                    gap: isMobile ? "6px" : "8px",
                    flexWrap: "wrap"
                }}>
                    {days.map((day) => (
                        <button
                            key={day._id}
                            onClick={() => onDayChange(day.id)}
                            style={{
                                flex: isMobile ? "1 1 calc(50% - 6px)" : "1 1 calc(20% - 8px)",
                                minWidth: isMobile ? "calc(50% - 6px)" : "120px",
                                padding: isMobile ? "10px 12px" : "12px 16px",
                                backgroundColor: selectedDay === day.id
                                    ? "rgba(105, 180, 185, 1)"
                                    : "white",
                                color: selectedDay === day.id ? "white" : "#374151",
                                border: `1px solid ${selectedDay === day.id
                                    ? "rgba(105, 180, 185, 1)"
                                    : "#e5e7eb"
                                    }`,
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: isMobile ? "13px" : "14px",
                                transition: "all 0.2s",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "4px"
                            }}
                            onMouseOver={(e) => {
                                if (selectedDay !== day.id) {
                                    e.target.style.backgroundColor = "#f9fafb";
                                    e.target.style.borderColor = "rgba(105, 180, 185, 1)";
                                }
                            }}
                            onMouseOut={(e) => {
                                if (selectedDay !== day.id) {
                                    e.target.style.backgroundColor = "white";
                                    e.target.style.borderColor = "#e5e7eb";
                                }
                            }}
                        >
                            <span>{day.name}</span>
                            <span style={{
                                backgroundColor: selectedDay === day.id ? "rgba(255, 255, 255, 0.2)" : "#f3f4f6",
                                color: selectedDay === day.id ? "white" : "#6b7280",
                                padding: "2px 6px",
                                borderRadius: "12px",
                                fontSize: "10px",
                                fontWeight: "500"
                            }}>
                                {getLessonCount(day.id)} уроків
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DaysNavigation;