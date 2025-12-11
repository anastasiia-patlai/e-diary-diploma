import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import ScheduleCard from "./ScheduleCard";

const ScheduleList = ({ schedules, onDelete, isMobile = false }) => {
    if (!Array.isArray(schedules) || schedules.length === 0) {
        return (
            <Card style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                marginBottom: isMobile ? "12px" : "0"
            }}>
                <Card.Header style={{
                    backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                    padding: isMobile ? "12px 16px" : "16px 20px"
                }}>
                    <h5 style={{
                        margin: 0,
                        fontSize: isMobile ? "16px" : "18px",
                        color: "#374151",
                        fontWeight: "600"
                    }}>
                        Поточний розклад
                    </h5>
                </Card.Header>
                <Card.Body style={{ padding: isMobile ? "16px" : "24px" }}>
                    <div style={{
                        textAlign: "center",
                        padding: isMobile ? "20px 16px" : "40px 20px"
                    }}>
                        <h6 style={{
                            color: "#6b7280",
                            marginBottom: "8px",
                            fontSize: isMobile ? "14px" : "16px"
                        }}>
                            Розклад порожній
                        </h6>
                        <p style={{
                            color: "#6b7280",
                            margin: 0,
                            fontSize: isMobile ? "12px" : "14px"
                        }}>
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
            borderRadius: "8px",
            marginBottom: isMobile ? "12px" : "0"
        }}>
            <Card.Header style={{
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                padding: isMobile ? "12px 16px" : "16px 20px"
            }}>
                <h5 style={{
                    margin: 0,
                    fontSize: isMobile ? "16px" : "18px",
                    color: "#374151",
                    fontWeight: "600"
                }}>
                    Поточний розклад ({schedules.length} {schedules.length === 1 ? 'заняття' :
                        schedules.length < 5 ? 'заняття' : 'занять'})
                </h5>
            </Card.Header>
            <Card.Body style={{ padding: isMobile ? "12px" : "24px" }}>
                <Row>
                    {schedules.map((schedule) => (
                        <Col
                            key={schedule._id}
                            xs={12}
                            sm={isMobile ? 12 : 6}
                            lg={4}
                            style={{ marginBottom: isMobile ? "12px" : "16px" }}
                        >
                            <ScheduleCard
                                schedule={schedule}
                                onDelete={onDelete}
                                isMobile={isMobile}
                            />
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
};

export default ScheduleList;