import React from "react";
import { Button } from "react-bootstrap";
import { FaTrash, FaChalkboardTeacher, FaDoorOpen } from "react-icons/fa";

const ScheduleCell = ({ schedule, onDelete }) => {
    if (!schedule) {
        return (
            <div style={{
                height: "100%",
                minHeight: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: "12px"
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
            padding: "8px",
            height: "100%",
            minHeight: "60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        }}>
            <div style={{ marginBottom: "6px" }}>
                <div style={{
                    fontWeight: "600",
                    color: "rgba(105, 180, 185, 1)",
                    fontSize: "13px",
                    marginBottom: "2px"
                }}>
                    {schedule.subject?.name || schedule.teacher?.position || "Предмет"}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "2px" }}>
                    <FaChalkboardTeacher style={{ fontSize: "10px", color: "#6b7280" }} />
                    <small style={{ color: "#6b7280" }}>
                        {schedule.teacher?.fullName}
                    </small>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <FaDoorOpen style={{ fontSize: "10px", color: "#6b7280" }} />
                    <small style={{ color: "#6b7280" }}>
                        {schedule.classroom?.name}
                    </small>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(schedule._id)}
                    style={{
                        padding: "2px 6px",
                        fontSize: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px"
                    }}
                >
                    <FaTrash style={{ fontSize: "8px" }} />
                </Button>
            </div>
        </div>
    );
};

export default ScheduleCell;