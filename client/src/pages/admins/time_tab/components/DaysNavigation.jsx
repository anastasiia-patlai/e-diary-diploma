import React from "react";
import { Row, Col, Card, Badge } from "react-bootstrap";
import { FaCalendarAlt } from "react-icons/fa";

const DaysNavigation = ({ days, selectedDay, onDayChange, daysSummary }) => {
    const getLessonCount = (dayId) => {
        const summary = daysSummary.find(item => {
            const day = days.find(d => d._id === item._id);
            return day && day.id === dayId;
        });
        return summary ? summary.count : 0;
    };

    return (
        <Row style={{ marginBottom: "20px" }}>
            <Col>
                <Card style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px"
                }}>
                    <Card.Header style={{
                        backgroundColor: "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                        padding: "12px 16px"
                    }}>
                        <h6 style={{
                            margin: 0,
                            fontSize: "14px",
                            color: "#374151",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            <FaCalendarAlt />
                            Виберіть день тижня для налаштування:
                        </h6>
                    </Card.Header>
                    <Card.Body style={{ padding: "16px" }}>
                        <div style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap"
                        }}>
                            {days.map((day) => (
                                <button
                                    key={day._id}
                                    onClick={() => onDayChange(day.id)}
                                    style={{
                                        flex: "1 1 calc(20% - 8px)",
                                        minWidth: "120px",
                                        padding: "12px 16px",
                                        backgroundColor: selectedDay === day.id
                                            ? "rgba(105, 180, 185, 1)"
                                            : "white",
                                        color: selectedDay === day.id ? "white" : "#374151",
                                        border: `1px solid ${selectedDay === day.id
                                            ? "rgba(105, 180, 185, 1)"
                                            : "#e5e7eb"
                                            }`,
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        fontSize: "14px",
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
                                    <Badge
                                        bg="light"
                                        text="dark"
                                        style={{ fontSize: "10px" }}
                                    >
                                        {getLessonCount(day.id)} уроків
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default DaysNavigation;