import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import ScheduleCard from "./ScheduleCard";

const ScheduleList = ({ schedules, onDelete }) => {
    console.log("ScheduleList отримав schedules:", schedules);

    if (!Array.isArray(schedules) || schedules.length === 0) {
        return (
            <Card style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
            }}>
                <Card.Header style={{
                    backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                    padding: "16px 20px"
                }}>
                    <h5 style={{
                        margin: 0,
                        fontSize: "18px",
                        color: "#374151",
                        fontWeight: "600"
                    }}>
                        Поточний розклад
                    </h5>
                </Card.Header>
                <Card.Body style={{ padding: "24px" }}>
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                        <h6 style={{ color: "#6b7280", marginBottom: "8px" }}>Розклад порожній</h6>
                        <p style={{ color: "#6b7280", margin: 0 }}>
                            Натисніть кнопку "Додати заняття" щоб створити перше заняття
                        </p>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px"
        }}>
            <Card.Header style={{
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                padding: "16px 20px"
            }}>
                <h5 style={{
                    margin: 0,
                    fontSize: "18px",
                    color: "#374151",
                    fontWeight: "600"
                }}>
                    Поточний розклад ({schedules.length} заняття)
                </h5>
            </Card.Header>
            <Card.Body style={{ padding: "24px" }}>
                <Row>
                    {schedules.map((schedule) => (
                        <Col key={schedule._id} xs={12} md={6} lg={4} style={{ marginBottom: "16px" }}>
                            <ScheduleCard
                                schedule={schedule}
                                onDelete={onDelete}
                            />
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
};

export default ScheduleList;