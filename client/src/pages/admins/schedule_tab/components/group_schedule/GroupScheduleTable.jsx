import React, { useState } from "react";
import { Row, Col, Card, Table, Spinner } from "react-bootstrap";
import { FaCalendarAlt, FaExclamationTriangle, FaUsers, FaEdit, FaTrash } from "react-icons/fa";
import EditScheduleModal from "./EditScheduleModal";

const GroupScheduleTable = ({ schedules, groups, timeSlots, daysOfWeek, selectedGroup, loading, onDeleteSchedule, classrooms, teachers }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false);

    // ОТРИМАТИ ВИБРАНУ ГРУПУ
    const getSelectedGroup = () => {
        return groups.find(group => group._id === selectedGroup);
    };

    // ОТРИМАТИ ВСІ УНІКАЛЬНІ ЧАСОВІ СЛОТИ
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

    // ОТРИМАТИ ЧАСОВІ СЛОТИ ДЛЯ КОНКРЕТНОГО ДНЯ ТИЖНЯ
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

    // ОТРИМАТИ ЗАНЯТТЯ ДЛЯ КОНКРЕТНОГО ДНЯ ТА ЧАСОВОГО СЛОТА
    const getScheduleForSlot = (dayId, timeSlotId) => {
        return schedules.find(schedule => {
            const scheduleDayId = schedule.dayOfWeek?._id || schedule.dayOfWeek?.id;
            return scheduleDayId === dayId &&
                schedule.timeSlot?._id === timeSlotId;
        });
    };

    const handleEditSchedule = (schedule) => {
        setSelectedSchedule(schedule);
        setShowEditModal(true);
    };

    const handleSaveSchedule = async (updatedSchedule) => {
        setSaveLoading(true);
        try {
            // Тут ваш API виклик для оновлення розкладу
            // await updateScheduleAPI(updatedSchedule);
            console.log('Оновлений розклад:', updatedSchedule);
            // Тут ви можете викликати ваш API для оновлення розкладу

            setShowEditModal(false);
            // Оновити дані розкладу (можливо, викликати callback для оновлення батьківського компонента)
        } catch (error) {
            console.error('Помилка при оновленні розкладу:', error);
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <Spinner animation="border" variant="primary" />
                <p style={{ color: "#6b7280", margin: "16px 0 0 0" }}>Завантаження розкладу...</p>
            </div>
        );
    }

    const selectedGroupData = getSelectedGroup();
    const safeDaysOfWeek = Array.isArray(daysOfWeek) ? daysOfWeek : [];
    const allUniqueTimeSlots = getAllUniqueTimeSlots();
    const safeClassrooms = Array.isArray(classrooms) ? classrooms : [];
    const safeTeachers = Array.isArray(teachers) ? teachers : [];

    if (!selectedGroup) {
        return (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <FaUsers style={{
                    fontSize: "48px",
                    color: "#d1d5db",
                    marginBottom: "16px"
                }} />
                <h6 style={{ color: "#6b7280", marginBottom: "8px" }}>
                    Оберіть групу для перегляду розкладу
                </h6>
                <p style={{ color: "#6b7280", margin: 0 }}>
                    Виберіть групу з випадаючого списку вище
                </p>
            </div>
        );
    }

    if (!selectedGroupData) {
        return (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <FaExclamationTriangle style={{
                    fontSize: "48px",
                    color: "#d1d5db",
                    marginBottom: "16px"
                }} />
                <h6 style={{ color: "#6b7280", marginBottom: "8px" }}>
                    Групу не знайдено
                </h6>
                <p style={{ color: "#6b7280", margin: 0 }}>
                    Обрана група не існує або була видалена
                </p>
            </div>
        );
    }

    if (safeDaysOfWeek.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <FaExclamationTriangle style={{
                    fontSize: "48px",
                    color: "#d1d5db",
                    marginBottom: "16px"
                }} />
                <h6 style={{ color: "#6b7280", marginBottom: "8px" }}>
                    Дні тижня не знайдені
                </h6>
                <p style={{ color: "#6b7280", margin: 0 }}>
                    Спочатку налаштуйте дні тижня
                </p>
            </div>
        );
    }

    if (allUniqueTimeSlots.length === 0) {
        return (
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
        );
    }

    return (
        <>
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
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
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
                                    Розклад занять для {selectedGroupData.name}
                                    {schedules.length === 0 && (
                                        <span style={{
                                            fontSize: "14px",
                                            color: "#6b7280",
                                            fontWeight: "normal",
                                            marginLeft: "8px"
                                        }}>
                                            (порожній)
                                        </span>
                                    )}
                                </h5>
                                <div style={{
                                    padding: "6px 12px",
                                    backgroundColor: "rgba(105, 180, 185, 0.1)",
                                    color: "rgba(105, 180, 185, 1)",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    fontWeight: "600"
                                }}>
                                    {selectedGroupData.name}
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body style={{ padding: "0" }}>
                            <div style={{
                                overflowX: "auto",
                                overflowY: "auto",
                                maxHeight: "70vh"
                            }}>
                                <Table responsive style={{
                                    margin: 0,
                                    tableLayout: 'fixed',
                                    minWidth: '800px'
                                }}>
                                    <thead style={{
                                        backgroundColor: "#f9fafb",
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 100
                                    }}>
                                        <tr>
                                            {/* День - фіксована ширина 90px */}
                                            <th style={{
                                                width: '90px',
                                                minWidth: '90px',
                                                padding: "12px 8px",
                                                borderBottom: "1px solid #e5e7eb",
                                                fontWeight: "600",
                                                color: "#374151",
                                                textAlign: "center",
                                                verticalAlign: "middle",
                                                position: 'sticky',
                                                left: 0,
                                                backgroundColor: '#f9fafb',
                                                zIndex: 110
                                            }}>
                                                День
                                            </th>
                                            {/* Час - фіксована ширина 144px */}
                                            <th style={{
                                                width: '144px',
                                                minWidth: '144px',
                                                padding: "12px 8px",
                                                borderBottom: "1px solid #e5e7eb",
                                                fontWeight: "600",
                                                color: "#374151",
                                                textAlign: "center",
                                                verticalAlign: "middle",
                                                position: 'sticky',
                                                left: '90px',
                                                backgroundColor: '#f9fafb',
                                                zIndex: 110
                                            }}>
                                                Час
                                            </th>
                                            {/* Предмет */}
                                            <th style={{
                                                width: '200px',
                                                minWidth: '200px',
                                                padding: "12px 8px",
                                                borderBottom: "1px solid #e5e7eb",
                                                fontWeight: "600",
                                                color: "#374151",
                                                textAlign: "center",
                                                verticalAlign: "middle"
                                            }}>
                                                Предмет
                                            </th>
                                            {/* Викладач */}
                                            <th style={{
                                                width: '180px',
                                                minWidth: '180px',
                                                padding: "12px 8px",
                                                borderBottom: "1px solid #e5e7eb",
                                                fontWeight: "600",
                                                color: "#374151",
                                                textAlign: "center",
                                                verticalAlign: "middle"
                                            }}>
                                                Викладач
                                            </th>
                                            {/* Аудиторія */}
                                            <th style={{
                                                width: '120px',
                                                minWidth: '120px',
                                                padding: "12px 8px",
                                                borderBottom: "1px solid #e5e7eb",
                                                fontWeight: "600",
                                                color: "#374151",
                                                textAlign: "center",
                                                verticalAlign: "middle"
                                            }}>
                                                Аудиторія
                                            </th>
                                            {/* Дії */}
                                            <th style={{
                                                width: '140px',
                                                minWidth: '140px',
                                                padding: "12px 8px",
                                                borderBottom: "1px solid #e5e7eb",
                                                fontWeight: "600",
                                                color: "#374151",
                                                textAlign: "center",
                                                verticalAlign: "middle"
                                            }}>
                                                Дії
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {safeDaysOfWeek.map(day => {
                                            // Отримуємо часові слоти конкретно для цього дня
                                            const dayTimeSlots = getTimeSlotsForDay(day._id || day.id);

                                            return (
                                                <React.Fragment key={day._id || day.id}>
                                                    {dayTimeSlots.map((timeSlot, index) => {
                                                        const schedule = getScheduleForSlot(day._id || day.id, timeSlot._id);

                                                        return (
                                                            <tr key={`${day._id || day.id}-${timeSlot._id}`}>
                                                                {/* Стовпець День - ширина 90px */}
                                                                {index === 0 ? (
                                                                    <td
                                                                        rowSpan={dayTimeSlots.length}
                                                                        style={{
                                                                            width: '90px',
                                                                            minWidth: '90px',
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
                                                                            backgroundColor: '#f3f4f6',
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
                                                                        </small>
                                                                    </td>
                                                                ) : null}

                                                                {/* Стовпець Час - ширина 144px */}
                                                                <td style={{
                                                                    width: '144px',
                                                                    minWidth: '144px',
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
                                                                    backgroundColor: '#f9fafb',
                                                                    zIndex: 10
                                                                }}>
                                                                    {timeSlot.order}. {timeSlot.startTime} - {timeSlot.endTime}
                                                                </td>

                                                                {/* Стовпець Предмет */}
                                                                <td style={{
                                                                    width: '200px',
                                                                    minWidth: '200px',
                                                                    padding: "12px 8px",
                                                                    borderBottom: "1px solid #e5e7eb",
                                                                    verticalAlign: "middle",
                                                                    backgroundColor: schedule ? "#f0f9ff" : "transparent"
                                                                }}>
                                                                    {schedule ? (
                                                                        <div style={{
                                                                            fontWeight: "600",
                                                                            color: "#374151"
                                                                        }}>
                                                                            {schedule.subject}
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{
                                                                            textAlign: "center",
                                                                            color: "#9ca3af",
                                                                            fontStyle: "italic"
                                                                        }}>
                                                                            —
                                                                        </div>
                                                                    )}
                                                                </td>

                                                                {/* Стовпець Викладач */}
                                                                <td style={{
                                                                    width: '180px',
                                                                    minWidth: '180px',
                                                                    padding: "12px 8px",
                                                                    borderBottom: "1px solid #e5e7eb",
                                                                    verticalAlign: "middle",
                                                                    backgroundColor: schedule ? "#f0f9ff" : "transparent"
                                                                }}>
                                                                    {schedule ? (
                                                                        <div style={{
                                                                            color: "#374151"
                                                                        }}>
                                                                            {schedule.teacher?.fullName}
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{
                                                                            textAlign: "center",
                                                                            color: "#9ca3af",
                                                                            fontStyle: "italic"
                                                                        }}>
                                                                            —
                                                                        </div>
                                                                    )}
                                                                </td>

                                                                {/* Стовпець Аудиторія */}
                                                                <td style={{
                                                                    width: '120px',
                                                                    minWidth: '120px',
                                                                    padding: "12px 8px",
                                                                    borderBottom: "1px solid #e5e7eb",
                                                                    verticalAlign: "middle",
                                                                    textAlign: "center",
                                                                    backgroundColor: schedule ? "#f0f9ff" : "transparent"
                                                                }}>
                                                                    {schedule ? (
                                                                        <div style={{
                                                                            fontWeight: "500",
                                                                            color: "#374151",
                                                                            backgroundColor: "white",
                                                                            padding: "4px 8px",
                                                                            borderRadius: "4px",
                                                                            border: "1px solid #e5e7eb",
                                                                            display: "inline-block"
                                                                        }}>
                                                                            {schedule.classroom?.name}
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{
                                                                            textAlign: "center",
                                                                            color: "#9ca3af",
                                                                            fontStyle: "italic"
                                                                        }}>
                                                                            —
                                                                        </div>
                                                                    )}
                                                                </td>

                                                                {/* Стовпець Дії */}
                                                                <td style={{
                                                                    width: '140px',
                                                                    minWidth: '140px',
                                                                    padding: "12px 8px",
                                                                    borderBottom: "1px solid #e5e7eb",
                                                                    verticalAlign: "middle",
                                                                    textAlign: "center",
                                                                    backgroundColor: schedule ? "#f0f9ff" : "transparent"
                                                                }}>
                                                                    {schedule ? (
                                                                        <div style={{
                                                                            display: "flex",
                                                                            gap: "12px",
                                                                            justifyContent: "center",
                                                                            alignItems: "center"
                                                                        }}>
                                                                            {/* Кнопка редагування з вашими кольорами */}
                                                                            <button
                                                                                onClick={() => handleEditSchedule(schedule)}
                                                                                onMouseOver={(e) => {
                                                                                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.8)';
                                                                                    e.target.style.transform = 'scale(1.05)';
                                                                                }}
                                                                                onMouseOut={(e) => {
                                                                                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                                                                                    e.target.style.transform = 'scale(1)';
                                                                                }}
                                                                                style={{
                                                                                    padding: "10px 12px",
                                                                                    fontSize: "14px",
                                                                                    backgroundColor: "rgba(105, 180, 185, 1)",
                                                                                    color: "white",
                                                                                    border: "none",
                                                                                    borderRadius: "6px",
                                                                                    cursor: "pointer",
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: "6px",
                                                                                    fontWeight: "500",
                                                                                    transition: 'all 0.2s ease-in-out',
                                                                                    minWidth: '50px',
                                                                                    justifyContent: 'center'
                                                                                }}
                                                                                title="Редагувати заняття"
                                                                            >
                                                                                <FaEdit size={14} />
                                                                                <span>Редаг.</span>
                                                                            </button>

                                                                            {/* Кнопка видалення */}
                                                                            <button
                                                                                onClick={() => onDeleteSchedule(schedule._id)}
                                                                                onMouseOver={(e) => {
                                                                                    e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
                                                                                    e.target.style.transform = 'scale(1.05)';
                                                                                }}
                                                                                onMouseOut={(e) => {
                                                                                    e.target.style.backgroundColor = 'rgba(239, 68, 68, 1)';
                                                                                    e.target.style.transform = 'scale(1)';
                                                                                }}
                                                                                style={{
                                                                                    padding: "10px 12px",
                                                                                    fontSize: "14px",
                                                                                    backgroundColor: "rgba(239, 68, 68, 1)",
                                                                                    color: "white",
                                                                                    border: "none",
                                                                                    borderRadius: "6px",
                                                                                    cursor: "pointer",
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: "6px",
                                                                                    fontWeight: "500",
                                                                                    transition: 'all 0.2s ease-in-out',
                                                                                    minWidth: '50px',
                                                                                    justifyContent: 'center'
                                                                                }}
                                                                                title="Видалити заняття"
                                                                            >
                                                                                <FaTrash size={14} />
                                                                                <span>Видел.</span>
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{
                                                                            textAlign: "center",
                                                                            color: "#9ca3af",
                                                                            fontStyle: "italic",
                                                                            padding: "12px 0"
                                                                        }}>
                                                                            —
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
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

            {/* Модальне вікно редагування */}
            <EditScheduleModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                schedule={selectedSchedule}
                classrooms={safeClassrooms}
                timeSlots={allUniqueTimeSlots}
                teachers={safeTeachers}
                onSave={handleSaveSchedule}
                loading={saveLoading}
            />
        </>
    );
};

export default GroupScheduleTable;