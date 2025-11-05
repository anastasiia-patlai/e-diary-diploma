import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FaDoorOpen } from "react-icons/fa";
import ClassroomCard from "./ClassroomCard";

const ClassroomsList = ({
    classrooms,
    loading,
    onEditClassroom,
    onDeleteClassroom,
    onToggleClassroom
}) => {
    return (
        <Row>
            <Col>
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
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            <FaDoorOpen />
                            Список аудиторій ({classrooms.length})
                        </h5>
                    </Card.Header>
                    <Card.Body style={{ padding: "24px" }}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                <p style={{ color: "#6b7280", margin: 0 }}>Завантаження аудиторій...</p>
                            </div>
                        ) : classrooms.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                <h6 style={{ color: "#6b7280", marginBottom: "8px" }}>Аудиторії ще не додані</h6>
                                <p style={{ color: "#6b7280", margin: 0 }}>
                                    Натисніть кнопку "Додати аудиторію" щоб створити першу аудиторію
                                </p>
                            </div>
                        ) : (
                            <Row>
                                {classrooms.map((classroom) => (
                                    <Col key={classroom._id} xs={12} md={6} lg={4} style={{ marginBottom: "16px" }}>
                                        <ClassroomCard
                                            classroom={classroom}
                                            onEdit={onEditClassroom}
                                            onDelete={onDeleteClassroom}
                                            onToggle={onToggleClassroom}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ClassroomsList;