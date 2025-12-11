import React from "react";
import { Button } from "react-bootstrap";
import { FaTrash, FaChalkboardTeacher, FaDoorOpen } from "react-icons/fa";

const ScheduleCell = ({ schedule, onDelete, isMobile = false }) => {
    if (!schedule) {
        return (
            <div style={{
                height: "100%",
                minHeight: isMobile ? "50px" : "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: isMobile ? "10px" : "12px"
            }}>
                —
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            padding: isMobile ? "6px" : "8px",
            height: "100%",
            minHeight: isMobile ? "50px" : "60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        }}>
            <div style={{ marginBottom: isMobile ? "4px" : "6px" }}>
                <div style={{
                    fontWeight: "600",
                    color: "rgba(105, 180, 185, 1)",
                    fontSize: isMobile ? "11px" : "13px",
                    marginBottom: "2px",
                    lineHeight: "1.2"
                }}>
                    {schedule.subject?.name || schedule.teacher?.position || "Предмет"}
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginBottom: "2px"
                }}>
                    <FaChalkboardTeacher style={{
                        fontSize: isMobile ? "8px" : "10px",
                        color: "#6b7280",
                        flexShrink: 0
                    }} />
                    <small style={{
                        color: "#6b7280",
                        fontSize: isMobile ? "9px" : "11px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                    }}>
                        {schedule.teacher?.fullName}
                    </small>
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                }}>
                    <FaDoorOpen style={{
                        fontSize: isMobile ? "8px" : "10px",
                        color: "#6b7280",
                        flexShrink: 0
                    }} />
                    <small style={{
                        color: "#6b7280",
                        fontSize: isMobile ? "9px" : "11px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                    }}>
                        {schedule.classroom?.name}
                    </small>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(schedule._id);
                    }}
                    style={{
                        padding: isMobile ? "2px 4px" : "2px 6px",
                        fontSize: isMobile ? "9px" : "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        minWidth: isMobile ? "auto" : "unset"
                    }}
                >
                    <FaTrash style={{ fontSize: isMobile ? "7px" : "8px" }} />
                    {!isMobile && "Видалити"}
                </Button>
            </div>
        </div>
    );
};

export default ScheduleCell;