import React from "react";
import { Row, Col, Card, Table, Spinner } from "react-bootstrap";
import { FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";
import ScheduleCell from "./ScheduleCell";

const ScheduleTable = ({ schedules, groups, timeSlots, loading, onDeleteSchedule }) => {
    const daysOfWeek = [
        { id: 1, name: "Понеділок" },
        { id: 2, name: "Вівторок" },
        { id: 3, name: "Середа" },
        { id: 4, name: "Четвер" },
        { id: 5, name: "П'ятниця" },
        { id: 6, name: "Субота" },
        { id: 7, name: "Неділя" }
    ];

    // Отримати заняття для конкретного часу та дня
    const getScheduleForSlot = (dayId, timeSlotId) => {
        return schedules.find(schedule =>
            schedule.dayOfWeek === dayId &&
            schedule.timeSlot?._id === timeSlotId
        );
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <Spinner animation="border" variant="primary" />
                <p style={{ color: "#6b7280", margin: "16px 0 0 0" }}>Завантаження розкладу...</p>
            </div>
        );
    }

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
                            <FaCalendarAlt />
                            Таблиця розкладу
                        </h5>
                    </Card.Header>
                    <Card.Body style={{ padding: "0" }}>
                        {schedules.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                <FaExclamationTriangle style={{
                                    fontSize: "48px",
                                    color: "#d1d5db",
                                    marginBottom: "16px"
                                }} />
                                <h6 style={{ color: "#6b7280", marginBottom: "8px" }}>
                                    Розклад ще не створений
                                </h6>
                                <p style={{ color: "#6b7280", margin: 0 }}>
                                    Додайте перше заняття, щоб побачити його в таблиці
                                </p>
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <Table responsive style={{ margin: 0 }}>
                                    <thead style={{ backgroundColor: "#f9fafb" }}>
                                        <tr>
                                            <th style={{
                                                padding: "12px 16px",
                                                borderBottom: "1px solid #e5e7eb",
                                                fontWeight: "600",
                                                color: "#374151",
                                                minWidth: "120px"
                                            }}>
                                                Час / День
                                            </th>
                                            {daysOfWeek.map(day => (
                                                <th key={day.id} style={{
                                                    padding: "12px 16px",
                                                    borderBottom: "1px solid #e5e7eb",
                                                    fontWeight: "600",
                                                    color: "#374151",
                                                    textAlign: "center",
                                                    minWidth: "200px"
                                                }}>
                                                    {day.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timeSlots.map(timeSlot => (
                                            <tr key={timeSlot._id}>
                                                <td style={{
                                                    padding: "12px 16px",
                                                    borderBottom: "1px solid #e5e7eb",
                                                    fontWeight: "600",
                                                    color: "#374151",
                                                    backgroundColor: "#f9fafb",
                                                    whiteSpace: "nowrap"
                                                }}>
                                                    {timeSlot.order}. {timeSlot.startTime} - {timeSlot.endTime}
                                                </td>
                                                {daysOfWeek.map(day => (
                                                    <td key={day.id} style={{
                                                        padding: "8px",
                                                        borderBottom: "1px solid #e5e7eb",
                                                        verticalAlign: "top",
                                                        minHeight: "80px"
                                                    }}>
                                                        <ScheduleCell
                                                            schedule={getScheduleForSlot(day.id, timeSlot._id)}
                                                            onDelete={onDeleteSchedule}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ScheduleTable;