import React from "react";
import { Row, Col, Card, Table, Spinner } from "react-bootstrap";
import { FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";

const ScheduleTable = ({ schedules, groups, timeSlots, daysOfWeek, loading, onDeleteSchedule }) => {
    const getAllUniqueTimeSlots = () => {
        const safeTimeSlots = Array.isArray(timeSlots) ? timeSlots : [];
        const uniqueSlots = [];
        const seen = new Set();

        safeTimeSlots.forEach(slot => {
            const key = `${slot.order}-${slot.startTime}-${slot.endTime}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueSlots.push(slot);
            }
        });

        return uniqueSlots.sort((a, b) => a.order - b.order);
    };

    const getScheduleForSlot = (dayId, groupId, timeSlotId) => {
        return schedules.find(schedule => {
            const scheduleDayId = schedule.dayOfWeek?._id || schedule.dayOfWeek?.id;
            return scheduleDayId === dayId &&
                schedule.group?._id === groupId &&
                schedule.timeSlot?._id === timeSlotId;
        });
    };

    const getTimeSlotsForDay = (dayId) => {
        const dayTimeSlotsFromDB = Array.isArray(timeSlots)
            ? timeSlots.filter(slot =>
                slot.dayOfWeek?._id === dayId || slot.dayOfWeek?.id === dayId
            )
            : [];

        if (dayTimeSlotsFromDB.length > 0) {
            const uniqueSlots = [];
            const seen = new Set();

            dayTimeSlotsFromDB.forEach(slot => {
                const key = `${slot.order}-${slot.startTime}-${slot.endTime}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueSlots.push(slot);
                }
            });

            return uniqueSlots.sort((a, b) => a.order - b.order);
        }

        return getAllUniqueTimeSlots();
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <Spinner animation="border" variant="primary" />
                <p style={{ color: "#6b7280", marginTop: "16px" }}>Завантаження розкладу...</p>
            </div>
        );
    }

    const safeGroups = Array.isArray(groups) ? groups : [];
    const safeDaysOfWeek = Array.isArray(daysOfWeek) ? daysOfWeek : [];
    const allUniqueTimeSlots = getAllUniqueTimeSlots();

    if (safeDaysOfWeek.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <FaExclamationTriangle style={{
                    fontSize: "48px",
                    color: "#d1d5db",
                    marginBottom: "16px"
                }} />
                <h6 style={{
                    color: "#6b7280",
                    marginBottom: "8px"
                }}>
                    Дні тижня не знайдені
                </h6>
                <p style={{
                    color: "#6b7280",
                    margin: 0
                }}>
                    Спочатку налаштуйте дні тижня
                </p>
            </div>
        );
    }

    if (allUniqueTimeSlots.length === 0) {
        return (
            <div style={{
                textAlign: "center",
                padding: "40px 20px"
            }}>
                <FaExclamationTriangle style={{
                    fontSize: "48px",
                    color: "#d1d5db",
                    marginBottom: "16px"
                }} />
                <h6 style={{
                    color: "#6b7280",
                    marginBottom: "8px"
                }}>
                    Часові слоти не налаштовані
                </h6>
                <p style={{
                    color: "#6b7280",
                    margin: 0
                }}>
                    Спочатку налаштуйте розклад дзвінків
                </p>
            </div>
        );
    }

    return (
        <Row>
            <Col>
                <Card style={{ border: "1px solid #e5e7eb", borderRadius: "8px" }}>
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
                            Загальний розклад занять
                            {/* {schedules.length === 0 && (
                                <span style={{
                                    fontSize: "14px",
                                    color: "#6b7280",
                                    fontWeight: "normal",
                                    marginLeft: "8px"
                                }}>
                                    (порожній)
                                </span>
                            )} */}
                        </h5>
                    </Card.Header>

                    <Card.Body style={{ padding: 0 }}>
                        <div style={{
                            overflow: "auto",
                            maxHeight: "70vh",
                            position: "relative"
                        }}>
                            <Table style={{
                                margin: 0,
                                tableLayout: 'fixed',
                                minWidth: '100%'
                            }}>
                                <thead style={{ backgroundColor: "#f9fafb" }}>
                                    <tr>
                                        <th style={{
                                            width: '90px',
                                            padding: "12px 8px",
                                            borderBottom: "1px solid #e5e7eb",
                                            fontWeight: "600",
                                            color: "#374151",
                                            textAlign: "center",
                                            verticalAlign: "middle",
                                            position: 'sticky',
                                            left: 0,
                                            top: 0,
                                            backgroundColor: '#f9fafb',
                                            zIndex: 110
                                        }}>День</th>

                                        <th style={{
                                            width: '144px',
                                            padding: "12px 8px",
                                            borderBottom: "1px solid #e5e7eb",
                                            fontWeight: "600",
                                            color: "#374151",
                                            textAlign: "center",
                                            verticalAlign: "middle",
                                            position: 'sticky',
                                            left: '90px',
                                            top: 0,
                                            backgroundColor: '#f9fafb',
                                            zIndex: 110
                                        }}>Час</th>

                                        {safeGroups.map(group => (
                                            <th key={group._id} style={{
                                                width: '200px',
                                                padding: "12px 8px",
                                                borderBottom: "1px solid #e5e7eb",
                                                fontWeight: "600",
                                                color: "#374151",
                                                textAlign: "center",
                                                verticalAlign: "middle",
                                                position: 'sticky',
                                                top: 0,
                                                backgroundColor: '#f9fafb',
                                                zIndex: 100
                                            }}>
                                                {group.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {safeDaysOfWeek.map(day => {
                                        const dayTimeSlots = getTimeSlotsForDay(day._id || day.id);

                                        return (
                                            <React.Fragment key={day._id || day.id}>
                                                {dayTimeSlots.map((timeSlot, index) => (
                                                    <tr key={`${day._id || day.id}-${timeSlot._id}`}>
                                                        {index === 0 && (
                                                            <td
                                                                rowSpan={dayTimeSlots.length}
                                                                style={{
                                                                    width: '90px',
                                                                    padding: "12px 8px",
                                                                    borderBottom: "1px solid #e5e7eb",
                                                                    fontWeight: "600",
                                                                    color: "#374151",
                                                                    backgroundColor: "#f3f4f6",
                                                                    textAlign: "center",
                                                                    verticalAlign: "middle",
                                                                    fontSize: "16px",
                                                                    position: 'sticky',
                                                                    left: 0,
                                                                    zIndex: 10
                                                                }}
                                                            >
                                                                {day.nameShort || day.name}
                                                                <br />
                                                                <small style={{
                                                                    fontSize: "12px",
                                                                    color: "#6b7280",
                                                                    fontWeight: "normal"
                                                                }}>
                                                                    {day.name}
                                                                </small>                                                            </td>
                                                        )}

                                                        <td style={{
                                                            width: '144px',
                                                            padding: "12px 8px",
                                                            borderBottom: "1px solid #e5e7eb",
                                                            fontWeight: "600",
                                                            color: "#374151",
                                                            backgroundColor: "#f9fafb",
                                                            whiteSpace: "nowrap",
                                                            textAlign: "center",
                                                            verticalAlign: "middle",
                                                            position: 'sticky',
                                                            left: '90px',
                                                            zIndex: 10
                                                        }}>
                                                            {timeSlot.order}. {timeSlot.startTime} - {timeSlot.endTime}
                                                        </td>

                                                        {safeGroups.map(group => {
                                                            const schedule = getScheduleForSlot(day._id || day.id, group._id, timeSlot._id);
                                                            return (
                                                                <td key={group._id} style={{
                                                                    width: '200px',
                                                                    padding: "8px",
                                                                    borderBottom: "1px solid #e5e7eb",
                                                                    verticalAlign: "top",
                                                                    minHeight: "80px",
                                                                    backgroundColor: schedule ? "#f0f9ff" : "transparent"
                                                                }}>
                                                                    {schedule ? (
                                                                        <div style={{
                                                                            padding: "8px",
                                                                            border: "1px solid #e5e7eb",
                                                                            borderRadius: "6px",
                                                                            backgroundColor: "white",
                                                                            fontSize: "12px"
                                                                        }}>
                                                                            <div style={{
                                                                                fontWeight: "600",
                                                                                color: "#374151",
                                                                                marginBottom: "4px"
                                                                            }}>
                                                                                {schedule.subject}
                                                                            </div>
                                                                            <div style={{
                                                                                color: "#6b7280",
                                                                                marginBottom: "2px",
                                                                                fontSize: "11px"
                                                                            }}>
                                                                                {schedule.teacher?.fullName}
                                                                            </div>
                                                                            <div style={{
                                                                                color: "#6b7280",
                                                                                marginBottom: "4px",
                                                                                fontSize: "11px"
                                                                            }}>
                                                                                {schedule.classroom?.name}
                                                                            </div>
                                                                            <br />
                                                                            <button
                                                                                onClick={() => onDeleteSchedule(schedule._id)}
                                                                                style={{
                                                                                    padding: "2px 6px",
                                                                                    fontSize: "10px",
                                                                                    backgroundColor: "#ef4444",
                                                                                    color: "white",
                                                                                    border: "none",
                                                                                    borderRadius: "4px",
                                                                                    cursor: "pointer",
                                                                                }}
                                                                            >
                                                                                Видалити
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{
                                                                            textAlign: "center",
                                                                            color: "#9ca3af",
                                                                            fontSize: "12px",
                                                                            padding: "12px 0"
                                                                        }}>—</div>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ScheduleTable;
