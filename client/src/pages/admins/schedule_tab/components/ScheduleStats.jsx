import React from "react";
import { Row, Col, Card } from "react-bootstrap";

const ScheduleStats = ({ formData }) => {
    return (
        <Row style={{ marginTop: "16px" }}>
            <Col>
                <Card style={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb"
                }}>
                    <Card.Body style={{ padding: "12px 16px" }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <small style={{ color: "#6b7280", fontWeight: "600" }}>
                                Доступно для створення розкладу:
                            </small>
                            <small style={{ color: "#6b7280" }}>
                                {formData.teachers.length} викладачів • {formData.groups.length} груп • {formData.classrooms.length} аудиторій
                            </small>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ScheduleStats;