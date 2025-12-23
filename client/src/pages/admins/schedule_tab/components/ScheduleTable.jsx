import React, { useState } from "react";
import { Row, Col, Card, Table, Spinner } from "react-bootstrap";
import { FaCalendarAlt, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaChalkboardTeacher, FaDoorOpen, FaBook, FaTrash, FaEdit } from "react-icons/fa";
import ScheduleCell from "./ScheduleCell";
import EditScheduleModal from "./group_schedule/EditScheduleModal";

const ScheduleTable = ({
    schedules,
    groups,
    timeSlots,
    daysOfWeek,
    loading,
    onDeleteSchedule,
    classrooms = [],
    teachers = [],
    isMobile = false
}) => {
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [selectedDay, setSelectedDay] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

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

    const navigateDay = (direction) => {
        setCurrentDayIndex(prev => {
            if (direction === 'prev' && prev > 0) return prev - 1;
            if (direction === 'next' && prev < safeDaysOfWeek.length - 1) return prev + 1;
            return prev;
        });
    };

    const handleDaySelect = (day) => {
        setSelectedDay(selectedDay?.id === day.id ? null : day);
    };

    // Функція для відкриття модального вікна редагування
    const handleEditSchedule = (schedule) => {
        console.log('Відкриття редагування розкладу:', schedule);
        setSelectedSchedule(schedule);
        setShowEditModal(true);
    };

    // Функція для збереження змін
    const handleSaveSchedule = async (updatedSchedule) => {
        console.log('Збереження оновленого розкладу:', updatedSchedule);
        // Тут повинен бути ваш API виклик для оновлення розкладу
        // Наприклад: await updateScheduleAPI(updatedSchedule);
        setShowEditModal(false);
        // Можливо, потрібно оновити дані на сторінці
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
    const safeClassrooms = Array.isArray(classrooms) ? classrooms : [];
    const safeTeachers = Array.isArray(teachers) ? teachers : [];

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

    // Мобільний варіант - акордеон з днями тижня
    if (isMobile) {
        return (
            <>
                <Card style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    marginBottom: "16px"
                }}>
                    <Card.Header style={{
                        backgroundColor: "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                        padding: "16px"
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <FaCalendarAlt />
                                <h5 style={{
                                    margin: 0,
                                    fontSize: "18px",
                                    color: "#374151",
                                    fontWeight: "600"
                                }}>
                                    Загальний розклад
                                </h5>
                            </div>

                            <div style={{
                                fontSize: "14px",
                                color: "#6b7280"
                            }}>
                                {safeGroups.length} груп
                            </div>
                        </div>
                    </Card.Header>

                    <Card.Body style={{ padding: "0" }}>
                        {/* Список днів тижня з акордеоном */}
                        {safeDaysOfWeek.map((day) => {
                            const dayTimeSlots = getTimeSlotsForDay(day._id || day.id);
                            const isDayExpanded = selectedDay?.id === day.id;

                            return (
                                <div key={day._id || day.id} style={{
                                    borderBottom: "1px solid #e5e7eb",
                                    backgroundColor: isDayExpanded ? "#f9fafb" : "white"
                                }}>
                                    {/* Заголовок дня */}
                                    <button
                                        onClick={() => handleDaySelect(day)}
                                        style={{
                                            width: "100%",
                                            padding: "16px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            backgroundColor: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            textAlign: "left"
                                        }}
                                    >
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px"
                                        }}>
                                            <div style={{
                                                width: "36px",
                                                height: "36px",
                                                backgroundColor: "rgba(105, 180, 185, 0.1)",
                                                color: "rgba(105, 180, 185, 1)",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: "600",
                                                fontSize: "16px"
                                            }}>
                                                {day.order}
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontWeight: "600",
                                                    color: "#374151",
                                                    fontSize: "16px"
                                                }}>
                                                    {day.name}
                                                </div>
                                                <div style={{
                                                    fontSize: "14px",
                                                    color: "#6b7280"
                                                }}>
                                                    {dayTimeSlots.length} уроків
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{
                                            transform: isDayExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                            transition: "transform 0.2s",
                                            fontSize: "20px",
                                            color: "#6b7280"
                                        }}>
                                            ▼
                                        </div>
                                    </button>

                                    {/* Контент дня (акордеон) */}
                                    {isDayExpanded && dayTimeSlots.length > 0 && (
                                        <div style={{
                                            padding: "16px",
                                            backgroundColor: "white",
                                            borderTop: "1px solid #e5e7eb"
                                        }}>
                                            <div style={{
                                                display: "grid",
                                                gap: "12px"
                                            }}>
                                                {dayTimeSlots.map((timeSlot) => (
                                                    <div key={timeSlot._id} style={{
                                                        backgroundColor: "#f9fafb",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "8px",
                                                        padding: "12px"
                                                    }}>
                                                        <div style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            marginBottom: "12px",
                                                            paddingBottom: "8px",
                                                            borderBottom: "1px solid #e5e7eb"
                                                        }}>
                                                            <div style={{
                                                                fontWeight: "600",
                                                                color: "#374151",
                                                                fontSize: "16px"
                                                            }}>
                                                                {timeSlot.order} урок
                                                            </div>
                                                            <div style={{
                                                                fontSize: "14px",
                                                                color: "#6b7280"
                                                            }}>
                                                                {timeSlot.startTime} - {timeSlot.endTime}
                                                            </div>
                                                        </div>

                                                        {/* Список груп для цього часового слоту */}
                                                        <div style={{
                                                            display: "grid",
                                                            gap: "8px"
                                                        }}>
                                                            {safeGroups.map((group) => {
                                                                const schedule = getScheduleForSlot(day._id || day.id, group._id, timeSlot._id);

                                                                return (
                                                                    <div
                                                                        key={group._id}
                                                                        style={{
                                                                            backgroundColor: schedule ? "white" : "#f3f4f6",
                                                                            border: "1px solid #e5e7eb",
                                                                            borderRadius: "6px",
                                                                            padding: "10px",
                                                                            display: "flex",
                                                                            flexDirection: "column",
                                                                            gap: "6px"
                                                                        }}
                                                                    >
                                                                        <div style={{
                                                                            display: "flex",
                                                                            justifyContent: "space-between",
                                                                            alignItems: "flex-start"
                                                                        }}>
                                                                            <div style={{
                                                                                fontWeight: "600",
                                                                                color: "#374151",
                                                                                fontSize: "15px"
                                                                            }}>
                                                                                {group.name}
                                                                            </div>
                                                                            {schedule && (
                                                                                <div style={{
                                                                                    display: "flex",
                                                                                    gap: "6px"
                                                                                }}>
                                                                                    <button
                                                                                        onClick={() => handleEditSchedule(schedule)}
                                                                                        style={{
                                                                                            padding: "6px 10px",
                                                                                            fontSize: "12px",
                                                                                            backgroundColor: "rgba(105, 180, 185, 1)",
                                                                                            color: "white",
                                                                                            border: "none",
                                                                                            borderRadius: "4px",
                                                                                            cursor: "pointer",
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                            gap: "4px",
                                                                                            minWidth: "80px"
                                                                                        }}
                                                                                    >
                                                                                        <FaEdit size={10} />
                                                                                        Редаг.
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => onDeleteSchedule && onDeleteSchedule(schedule._id)}
                                                                                        style={{
                                                                                            padding: "6px 10px",
                                                                                            fontSize: "12px",
                                                                                            backgroundColor: "#ef4444",
                                                                                            color: "white",
                                                                                            border: "none",
                                                                                            borderRadius: "4px",
                                                                                            cursor: "pointer",
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                            gap: "4px",
                                                                                            minWidth: "80px"
                                                                                        }}
                                                                                    >
                                                                                        <FaTrash size={10} />
                                                                                        Видел.
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {schedule ? (
                                                                            <div style={{
                                                                                display: "flex",
                                                                                flexDirection: "column",
                                                                                gap: "4px"
                                                                            }}>
                                                                                <div style={{
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: "6px"
                                                                                }}>
                                                                                    <FaBook style={{ fontSize: "12px", color: "rgba(105, 180, 185, 1)" }} />
                                                                                    <span style={{
                                                                                        fontWeight: "500",
                                                                                        color: "rgba(105, 180, 185, 1)",
                                                                                        fontSize: "14px"
                                                                                    }}>
                                                                                        {schedule.subject || schedule.subject?.name || "Без назви"}
                                                                                    </span>
                                                                                </div>
                                                                                <div style={{
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: "6px",
                                                                                    fontSize: "13px",
                                                                                    color: "#6b7280"
                                                                                }}>
                                                                                    <FaChalkboardTeacher style={{ fontSize: "12px", color: "#6b7280" }} />
                                                                                    {schedule.teacher?.fullName || "Викладач не вказаний"}
                                                                                </div>
                                                                                <div style={{
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: "6px",
                                                                                    fontSize: "13px",
                                                                                    color: "#6b7280"
                                                                                }}>
                                                                                    <FaDoorOpen style={{ fontSize: "12px", color: "#6b7280" }} />
                                                                                    {schedule.classroom?.name || "Аудиторія не вказана"}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div style={{
                                                                                color: "#9ca3af",
                                                                                fontSize: "13px",
                                                                                textAlign: "center",
                                                                                padding: "8px 0",
                                                                                fontStyle: "italic"
                                                                            }}>
                                                                                Немає заняття
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {isDayExpanded && dayTimeSlots.length === 0 && (
                                        <div style={{
                                            padding: "16px",
                                            backgroundColor: "white",
                                            borderTop: "1px solid #e5e7eb",
                                            textAlign: "center",
                                            color: "#6b7280",
                                            fontStyle: "italic"
                                        }}>
                                            Немає уроків для цього дня
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </Card.Body>
                </Card>

                {/* Модальне вікно редагування */}
                <EditScheduleModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    schedule={selectedSchedule}
                    classrooms={safeClassrooms}
                    timeSlots={allUniqueTimeSlots}
                    teachers={safeTeachers}
                    onSave={handleSaveSchedule}
                    loading={false} // Можна додати стан завантаження якщо потрібно
                />
            </>
        );
    }

    // Десктопний варіант
    return (
        <>
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
                                                                                <div style={{
                                                                                    display: "flex",
                                                                                    gap: "8px",
                                                                                    justifyContent: "flex-end"
                                                                                }}>
                                                                                    <button
                                                                                        onClick={() => handleEditSchedule(schedule)}
                                                                                        style={{
                                                                                            padding: "4px 8px",
                                                                                            fontSize: "10px",
                                                                                            backgroundColor: "rgba(105, 180, 185, 1)",
                                                                                            color: "white",
                                                                                            border: "none",
                                                                                            borderRadius: "4px",
                                                                                            cursor: "pointer",
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                            gap: "4px"
                                                                                        }}
                                                                                    >
                                                                                        <FaEdit size={8} />
                                                                                        Редаг.
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => onDeleteSchedule(schedule._id)}
                                                                                        style={{
                                                                                            padding: "4px 8px",
                                                                                            fontSize: "10px",
                                                                                            backgroundColor: "#ef4444",
                                                                                            color: "white",
                                                                                            border: "none",
                                                                                            borderRadius: "4px",
                                                                                            cursor: "pointer",
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                            gap: "4px"
                                                                                        }}
                                                                                    >
                                                                                        <FaTrash size={8} />
                                                                                        Видел.
                                                                                    </button>
                                                                                </div>
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

            {/* Модальне вікно редагування для десктопної версії */}
            <EditScheduleModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                schedule={selectedSchedule}
                classrooms={safeClassrooms}
                timeSlots={allUniqueTimeSlots}
                teachers={safeTeachers}
                onSave={handleSaveSchedule}
                loading={false}
            />
        </>
    );
};

export default ScheduleTable;