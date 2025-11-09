import React from "react";
import { Row, Col, Card, Table, Spinner } from "react-bootstrap";
import { FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";

const ScheduleTable = ({ schedules, groups, timeSlots, loading, onDeleteSchedule }) => {
    const daysOfWeek = [
        { id: 1, name: "ПН", fullName: "Понеділок" },
        { id: 2, name: "ВТ", fullName: "Вівторок" },
        { id: 3, name: "СР", fullName: "Середа" },
        { id: 4, name: "ЧТ", fullName: "Четвер" },
        { id: 5, name: "ПТ", fullName: "П'ятниця" }
    ];

    // Отримати унікальні часові слоти, відсортовані за порядком (без дублікатів)
    const getUniqueTimeSlots = () => {
        const safeTimeSlots = Array.isArray(timeSlots) ? timeSlots : [];

        // Фільтруємо унікальні часові слоти за order, startTime, endTime
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

    // Отримати заняття для конкретного дня, групи та часового слота
    const getScheduleForSlot = (dayId, groupId, timeSlotId) => {
        return schedules.find(schedule => {
            const scheduleDayId = schedule.dayOfWeek?._id || schedule.dayOfWeek?.id;
            return scheduleDayId === dayId &&
                schedule.group?._id === groupId &&
                schedule.timeSlot?._id === timeSlotId;
        });
    };

    // Перевірити, чи день має будь-які заняття
    const hasSchedulesForDay = (dayId) => {
        return schedules.some(schedule => {
            const scheduleDayId = schedule.dayOfWeek?._id || schedule.dayOfWeek?.id;
            return scheduleDayId === dayId;
        });
    };

    // Отримати часові слоти для конкретного дня
    const getTimeSlotsForDay = (dayId) => {
        const daySchedules = schedules.filter(schedule => {
            const scheduleDayId = schedule.dayOfWeek?._id || schedule.dayOfWeek?.id;
            return scheduleDayId === dayId;
        });

        // Отримуємо ID часових слотів, які використовуються в цей день
        const timeSlotIds = [...new Set(daySchedules.map(schedule => schedule.timeSlot?._id))];
        const uniqueTimeSlots = getUniqueTimeSlots();

        // Фільтруємо часові слоти, які використовуються в цей день
        return uniqueTimeSlots.filter(timeSlot =>
            timeSlotIds.includes(timeSlot._id)
        );
    };

    // Альтернативний підхід: показати всі дні з усіма часовими слотами, але без дублікатів
    const getAllTimeSlotsForDisplay = () => {
        const uniqueTimeSlots = getUniqueTimeSlots();

        // Якщо є заняття, показуємо всі унікальні часові слоти
        if (schedules.length > 0) {
            return uniqueTimeSlots;
        }

        return [];
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <Spinner animation="border" variant="primary" />
                <p style={{ color: "#6b7280", margin: "16px 0 0 0" }}>Завантаження розкладу...</p>
            </div>
        );
    }

    const safeGroups = Array.isArray(groups) ? groups : [];
    const uniqueTimeSlots = getUniqueTimeSlots();
    const allTimeSlotsForDisplay = getAllTimeSlotsForDisplay();

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
                            Загальний розклад занять
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
                        ) : safeGroups.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                <FaExclamationTriangle style={{
                                    fontSize: "48px",
                                    color: "#d1d5db",
                                    marginBottom: "16px"
                                }} />
                                <h6 style={{ color: "#6b7280", marginBottom: "8px" }}>
                                    Групи не знайдені
                                </h6>
                                <p style={{ color: "#6b7280", margin: 0 }}>
                                    Спочатку додайте групи
                                </p>
                            </div>
                        ) : uniqueTimeSlots.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                <FaExclamationTriangle style={{
                                    fontSize: "48px",
                                    color: "#d1d5db",
                                    marginBottom: "16px"
                                }} />
                                <h6 style={{ color: "#6b7280", marginBottom: "8px" }}>
                                    Часові слоти не налаштовані
                                </h6>
                                <p style={{ color: "#6b7280", margin: 0 }}>
                                    Спочатку налаштуйте розклад дзвінків
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
                                                minWidth: "80px",
                                                textAlign: "center",
                                                verticalAlign: "middle"
                                            }}>
                                                День
                                            </th>
                                            <th style={{
                                                padding: "12px 16px",
                                                borderBottom: "1px solid #e5e7eb",
                                                fontWeight: "600",
                                                color: "#374151",
                                                minWidth: "120px",
                                                textAlign: "center",
                                                verticalAlign: "middle"
                                            }}>
                                                Час
                                            </th>
                                            {safeGroups.map(group => (
                                                <th key={group._id} style={{
                                                    padding: "12px 16px",
                                                    borderBottom: "1px solid #e5e7eb",
                                                    fontWeight: "600",
                                                    color: "#374151",
                                                    textAlign: "center",
                                                    minWidth: "200px",
                                                    verticalAlign: "middle"
                                                }}>
                                                    {group.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {daysOfWeek.map(day => {
                                            // Отримати часові слоти для цього дня
                                            const dayTimeSlots = getTimeSlotsForDay(day.id);

                                            // Використовуємо часові слоти дня, або всі унікальні, якщо день має заняття
                                            const timeSlotsToShow = dayTimeSlots.length > 0 ? dayTimeSlots : allTimeSlotsForDisplay;

                                            // Пропускати дні без занять і без часових слотів
                                            if (timeSlotsToShow.length === 0) {
                                                return null;
                                            }

                                            return (
                                                <React.Fragment key={day.id}>
                                                    {timeSlotsToShow.map((timeSlot, index) => (
                                                        <tr key={`${day.id}-${timeSlot._id}`}>
                                                            {/* Стовпець з днем тижня - показуємо тільки для першого рядка дня */}
                                                            {index === 0 ? (
                                                                <td
                                                                    rowSpan={timeSlotsToShow.length}
                                                                    style={{
                                                                        padding: "12px 16px",
                                                                        borderBottom: "1px solid #e5e7eb",
                                                                        fontWeight: "600",
                                                                        color: "#374151",
                                                                        backgroundColor: "#f3f4f6",
                                                                        textAlign: "center",
                                                                        verticalAlign: "middle",
                                                                        fontSize: "16px"
                                                                    }}
                                                                >
                                                                    {day.name}
                                                                    <br />
                                                                    <small style={{
                                                                        fontSize: "12px",
                                                                        color: "#6b7280",
                                                                        fontWeight: "normal"
                                                                    }}>
                                                                        {day.fullName}
                                                                    </small>
                                                                </td>
                                                            ) : null}

                                                            {/* Стовпець з часом */}
                                                            <td style={{
                                                                padding: "12px 16px",
                                                                borderBottom: "1px solid #e5e7eb",
                                                                fontWeight: "600",
                                                                color: "#374151",
                                                                backgroundColor: "#f9fafb",
                                                                whiteSpace: "nowrap",
                                                                textAlign: "center",
                                                                verticalAlign: "middle"
                                                            }}>
                                                                {timeSlot.order}. {timeSlot.startTime} - {timeSlot.endTime}
                                                            </td>

                                                            {/* Стовпці з заняттями для кожного класу */}
                                                            {safeGroups.map(group => {
                                                                const schedule = getScheduleForSlot(day.id, group._id, timeSlot._id);

                                                                return (
                                                                    <td key={group._id} style={{
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
                                                                                <button
                                                                                    onClick={() => onDeleteSchedule(schedule._id)}
                                                                                    style={{
                                                                                        padding: "2px 6px",
                                                                                        fontSize: "10px",
                                                                                        backgroundColor: "#ef4444",
                                                                                        color: "white",
                                                                                        border: "none",
                                                                                        borderRadius: "4px",
                                                                                        cursor: "pointer"
                                                                                    }}
                                                                                    title="Видалити заняття"
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
                                                                            }}>
                                                                                —
                                                                            </div>
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
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ScheduleTable;