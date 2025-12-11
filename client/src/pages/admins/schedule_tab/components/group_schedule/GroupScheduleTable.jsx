import React, { useState } from "react";
import { Card, Tab, Nav, Spinner } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditScheduleModal from "./EditScheduleModal";

const GroupScheduleTable = ({
    schedules,
    groups,
    timeSlots,
    daysOfWeek,
    selectedGroup,
    loading,
    onDeleteSchedule,
    classrooms,
    teachers,
    isMobile = false
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [activeDay, setActiveDay] = useState(0);

    // Отримати обрану групу
    const getSelectedGroup = () => {
        return groups.find(group => group._id === selectedGroup);
    };

    // Отримати часові слоти для конкретного дня тижня
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

        return [];
    };

    // Отримати заняття для конкретного дня та часового слоту
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
            console.log('Оновлений розклад:', updatedSchedule);
            setShowEditModal(false);
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
                <p style={{ color: "#6b7280", marginTop: "16px" }}>Завантаження розкладу...</p>
            </div>
        );
    }

    const selectedGroupData = getSelectedGroup();
    const safeDaysOfWeek = Array.isArray(daysOfWeek) ? daysOfWeek : [];
    const safeClassrooms = Array.isArray(classrooms) ? classrooms : [];
    const safeTeachers = Array.isArray(teachers) ? teachers : [];

    if (!selectedGroup) {
        return (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ color: "#6b7280", margin: "16px 0 0 0" }}>
                    Оберіть групу для перегляду розкладу
                </p>
            </div>
        );
    }

    if (!selectedGroupData) {
        return (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ color: "#6b7280", margin: "16px 0 0 0" }}>
                    Групу не знайдено
                </p>
            </div>
        );
    }

    if (safeDaysOfWeek.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ color: "#6b7280", margin: "16px 0 0 0" }}>
                    Дні тижня не налаштовані
                </p>
            </div>
        );
    }

    // Десктопна версія - компактна таблиця
    if (!isMobile) {
        return (
            <>
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
                                fontWeight: "600"
                            }}>
                                Розклад для {selectedGroupData.name}
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

                    <Card.Body style={{ padding: 0 }}>
                        {/* Вкладки для днів тижня */}
                        <Tab.Container activeKey={activeDay} onSelect={(k) => setActiveDay(parseInt(k))}>
                            <Nav variant="tabs" style={{
                                borderBottom: "1px solid #e5e7eb",
                                padding: "0 20px",
                                display: "flex"
                            }}>
                                {safeDaysOfWeek.map((day, index) => (
                                    <Nav.Item key={day._id || day.id}>
                                        <Nav.Link
                                            eventKey={index}
                                            style={{
                                                padding: "16px 20px",
                                                border: "none",
                                                fontWeight: "500",
                                                color: activeDay === index ? "#374151" : "#6b7280",
                                                backgroundColor: "transparent",
                                                borderBottom: activeDay === index ? "2px solid rgba(105, 180, 185, 1)" : "none",
                                                fontSize: "15px"
                                            }}
                                        >
                                            {day.name}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>

                            <Tab.Content>
                                {safeDaysOfWeek.map((day, index) => {
                                    const dayTimeSlots = getTimeSlotsForDay(day._id || day.id);

                                    return (
                                        <Tab.Pane
                                            key={day._id || day.id}
                                            eventKey={index}
                                            style={{ padding: "20px" }}
                                        >
                                            <div style={{
                                                backgroundColor: "#f9fafb",
                                                padding: "12px 16px",
                                                borderRadius: "8px",
                                                marginBottom: "20px",
                                                border: "1px solid #e5e7eb"
                                            }}>
                                                <h6 style={{
                                                    margin: 0,
                                                    color: "#374151",
                                                    fontWeight: "600",
                                                    fontSize: "16px"
                                                }}>
                                                    Розклад на {day.name}
                                                </h6>
                                            </div>

                                            {dayTimeSlots.length === 0 ? (
                                                <div style={{
                                                    textAlign: "center",
                                                    padding: "40px 20px",
                                                    color: "#6b7280"
                                                }}>
                                                    <p style={{ margin: 0 }}>
                                                        Немає уроків для {day.name}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                                                    gap: "16px"
                                                }}>
                                                    {dayTimeSlots.map((timeSlot) => {
                                                        const schedule = getScheduleForSlot(day._id || day.id, timeSlot._id);

                                                        return (
                                                            <div
                                                                key={timeSlot._id}
                                                                style={{
                                                                    border: "1px solid #e5e7eb",
                                                                    borderRadius: "8px",
                                                                    backgroundColor: schedule ? "#f8fafc" : "#f9fafb",
                                                                    overflow: "hidden",
                                                                    transition: "all 0.2s",
                                                                    display: "flex",
                                                                    flexDirection: "column"
                                                                }}
                                                            >
                                                                {/* Заголовок з номером уроку та часом */}
                                                                <div style={{
                                                                    padding: "16px",
                                                                    backgroundColor: schedule ? "rgba(105, 180, 185, 0.1)" : "#f3f4f6",
                                                                    borderBottom: "1px solid #e5e7eb",
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center"
                                                                }}>
                                                                    <div style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "12px"
                                                                    }}>
                                                                        <div style={{
                                                                            fontSize: "24px",
                                                                            fontWeight: "600",
                                                                            color: schedule ? "rgba(105, 180, 185, 1)" : "#6b7280",
                                                                            minWidth: "40px"
                                                                        }}>
                                                                            {timeSlot.order}
                                                                        </div>
                                                                        <div>
                                                                            <div style={{
                                                                                fontSize: "16px",
                                                                                fontWeight: "500",
                                                                                color: "#374151"
                                                                            }}>
                                                                                {timeSlot.startTime} - {timeSlot.endTime}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Основна інформація */}
                                                                <div style={{
                                                                    padding: "16px",
                                                                    flex: 1
                                                                }}>
                                                                    {schedule ? (
                                                                        <div style={{
                                                                            display: "flex",
                                                                            flexDirection: "column",
                                                                            height: "100%"
                                                                        }}>
                                                                            <div style={{
                                                                                marginBottom: "12px"
                                                                            }}>
                                                                                <div style={{
                                                                                    fontSize: "18px",
                                                                                    fontWeight: "600",
                                                                                    color: "#374151",
                                                                                    marginBottom: "8px"
                                                                                }}>
                                                                                    {schedule.subject}
                                                                                </div>
                                                                                <div style={{
                                                                                    fontSize: "15px",
                                                                                    color: "#6b7280",
                                                                                    marginBottom: "4px"
                                                                                }}>
                                                                                    <strong>Викладач:</strong> {schedule.teacher?.fullName}
                                                                                </div>
                                                                                <div style={{
                                                                                    fontSize: "15px",
                                                                                    color: "#6b7280"
                                                                                }}>
                                                                                    <strong>Аудиторія:</strong> {schedule.classroom?.name}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{
                                                                            textAlign: "center",
                                                                            color: "#9ca3af",
                                                                            fontStyle: "italic",
                                                                            padding: "24px 0",
                                                                            fontSize: "15px"
                                                                        }}>
                                                                            Вікно для заняття
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Кнопки дій - завжди праворуч */}
                                                                {schedule && (
                                                                    <div style={{
                                                                        padding: "12px 16px",
                                                                        borderTop: "1px solid #e5e7eb",
                                                                        backgroundColor: "#f9fafb",
                                                                        display: "flex",
                                                                        justifyContent: "flex-end",
                                                                        gap: "8px"
                                                                    }}>
                                                                        <button
                                                                            onClick={() => handleEditSchedule(schedule)}
                                                                            style={{
                                                                                padding: "8px 16px",
                                                                                fontSize: "14px",
                                                                                backgroundColor: "rgba(105, 180, 185, 1)",
                                                                                color: "white",
                                                                                border: "none",
                                                                                borderRadius: "6px",
                                                                                cursor: "pointer",
                                                                                fontWeight: "500",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: "6px",
                                                                                transition: "background-color 0.2s"
                                                                            }}
                                                                            onMouseOver={(e) => {
                                                                                e.target.style.backgroundColor = "rgba(85, 160, 165, 1)";
                                                                            }}
                                                                            onMouseOut={(e) => {
                                                                                e.target.style.backgroundColor = "rgba(105, 180, 185, 1)";
                                                                            }}
                                                                        >
                                                                            <FaEdit size={14} />
                                                                            Редагувати
                                                                        </button>
                                                                        <button
                                                                            onClick={() => onDeleteSchedule(schedule._id)}
                                                                            style={{
                                                                                padding: "8px 16px",
                                                                                fontSize: "14px",
                                                                                backgroundColor: "#ef4444",
                                                                                color: "white",
                                                                                border: "none",
                                                                                borderRadius: "6px",
                                                                                cursor: "pointer",
                                                                                fontWeight: "500",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: "6px",
                                                                                transition: "background-color 0.2s"
                                                                            }}
                                                                            onMouseOver={(e) => {
                                                                                e.target.style.backgroundColor = "#dc2626";
                                                                            }}
                                                                            onMouseOut={(e) => {
                                                                                e.target.style.backgroundColor = "#ef4444";
                                                                            }}
                                                                        >
                                                                            <FaTrash size={14} />
                                                                            Видалити
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </Tab.Pane>
                                    );
                                })}
                            </Tab.Content>
                        </Tab.Container>
                    </Card.Body>
                </Card>

                <EditScheduleModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    schedule={selectedSchedule}
                    classrooms={safeClassrooms}
                    timeSlots={timeSlots}
                    teachers={safeTeachers}
                    onSave={handleSaveSchedule}
                    loading={saveLoading}
                />
            </>
        );
    }

    // Мобільна версія - вкладки з блоками
    return (
        <>
            <Card style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
            }}>
                <Card.Header style={{
                    backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                    padding: "12px 16px"
                }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px"
                    }}>
                        <div>
                            <h5 style={{
                                margin: 0,
                                fontSize: "16px",
                                color: "#374151",
                                fontWeight: "600"
                            }}>
                                Розклад для {selectedGroupData.name}
                            </h5>
                            <p style={{
                                margin: "4px 0 0 0",
                                color: "#6b7280",
                                fontSize: "13px"
                            }}>
                                {schedules.length} {schedules.length === 1 ? 'заняття' :
                                    schedules.length < 5 ? 'заняття' : 'занять'}
                            </p>
                        </div>
                    </div>
                </Card.Header>

                <Card.Body style={{ padding: 0 }}>
                    {/* Вкладки для днів тижня - мобільна версія */}
                    <Tab.Container activeKey={activeDay} onSelect={(k) => setActiveDay(parseInt(k))}>
                        <Nav variant="tabs" style={{
                            borderBottom: "1px solid #e5e7eb",
                            padding: "0 12px",
                            display: "flex",
                            overflowX: "auto",
                            whiteSpace: "nowrap"
                        }}>
                            {safeDaysOfWeek.map((day, index) => (
                                <Nav.Item key={day._id || day.id}>
                                    <Nav.Link
                                        eventKey={index}
                                        style={{
                                            padding: "12px 14px",
                                            border: "none",
                                            fontWeight: "500",
                                            color: activeDay === index ? "#374151" : "#6b7280",
                                            backgroundColor: "transparent",
                                            borderBottom: activeDay === index ? "2px solid rgba(105, 180, 185, 1)" : "none",
                                            fontSize: "14px",
                                            marginRight: "2px",
                                            minWidth: "50px",
                                            textAlign: "center"
                                        }}
                                    >
                                        {day.nameShort || day.name.substring(0, 2)}
                                    </Nav.Link>
                                </Nav.Item>
                            ))}
                        </Nav>

                        <Tab.Content>
                            {safeDaysOfWeek.map((day, index) => {
                                const dayTimeSlots = getTimeSlotsForDay(day._id || day.id);

                                return (
                                    <Tab.Pane
                                        key={day._id || day.id}
                                        eventKey={index}
                                        style={{ padding: "16px" }}
                                    >
                                        <div style={{
                                            marginBottom: "16px",
                                            padding: "12px",
                                            backgroundColor: "#f9fafb",
                                            borderRadius: "8px",
                                            border: "1px solid #e5e7eb"
                                        }}>
                                            <h6 style={{
                                                margin: 0,
                                                color: "#374151",
                                                fontWeight: "600",
                                                fontSize: "16px",
                                                textAlign: "center"
                                            }}>
                                                {day.name}
                                            </h6>
                                        </div>

                                        {dayTimeSlots.length === 0 ? (
                                            <div style={{
                                                textAlign: "center",
                                                padding: "40px 20px",
                                                color: "#6b7280"
                                            }}>
                                                <p style={{ margin: 0 }}>
                                                    Немає уроків для {day.name}
                                                </p>
                                            </div>
                                        ) : (
                                            <div style={{
                                                display: "grid",
                                                gap: "12px"
                                            }}>
                                                {dayTimeSlots.map((timeSlot) => {
                                                    const schedule = getScheduleForSlot(day._id || day.id, timeSlot._id);

                                                    return (
                                                        <div
                                                            key={timeSlot._id}
                                                            style={{
                                                                border: "1px solid #e5e7eb",
                                                                borderRadius: "8px",
                                                                overflow: "hidden",
                                                                backgroundColor: schedule ? "#f8fafc" : "#f9fafb"
                                                            }}
                                                        >
                                                            {/* Заголовок з номером уроку та часом */}
                                                            <div style={{
                                                                padding: "12px",
                                                                backgroundColor: schedule ? "rgba(105, 180, 185, 0.1)" : "#f3f4f6",
                                                                borderBottom: "1px solid #e5e7eb",
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center"
                                                            }}>
                                                                <div style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px"
                                                                }}>
                                                                    <div style={{
                                                                        fontSize: "20px",
                                                                        fontWeight: "600",
                                                                        color: schedule ? "rgba(105, 180, 185, 1)" : "#6b7280"
                                                                    }}>
                                                                        {timeSlot.order}
                                                                    </div>
                                                                    <div style={{
                                                                        fontSize: "14px",
                                                                        color: "#374151"
                                                                    }}>
                                                                        {timeSlot.startTime}-{timeSlot.endTime}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Основна інформація */}
                                                            <div style={{ padding: "12px" }}>
                                                                {schedule ? (
                                                                    <div>
                                                                        <div style={{
                                                                            marginBottom: "12px"
                                                                        }}>
                                                                            <div style={{
                                                                                fontSize: "16px",
                                                                                fontWeight: "600",
                                                                                color: "#374151",
                                                                                marginBottom: "6px"
                                                                            }}>
                                                                                {schedule.subject}
                                                                            </div>
                                                                            <div style={{
                                                                                fontSize: "14px",
                                                                                color: "#6b7280",
                                                                                marginBottom: "4px"
                                                                            }}>
                                                                                <strong>Викладач:</strong> {schedule.teacher?.fullName}
                                                                            </div>
                                                                            <div style={{
                                                                                fontSize: "14px",
                                                                                color: "#6b7280"
                                                                            }}>
                                                                                <strong>Аудиторія:</strong> {schedule.classroom?.name}
                                                                            </div>
                                                                        </div>

                                                                        {/* Кнопки дій - праворуч */}
                                                                        <div style={{
                                                                            display: "flex",
                                                                            justifyContent: "flex-end",
                                                                            gap: "8px"
                                                                        }}>
                                                                            <button
                                                                                onClick={() => handleEditSchedule(schedule)}
                                                                                style={{
                                                                                    padding: "8px 12px",
                                                                                    fontSize: "14px",
                                                                                    backgroundColor: "rgba(105, 180, 185, 1)",
                                                                                    color: "white",
                                                                                    border: "none",
                                                                                    borderRadius: "6px",
                                                                                    cursor: "pointer",
                                                                                    fontWeight: "500",
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: "4px"
                                                                                }}
                                                                            >
                                                                                <FaEdit size={12} />
                                                                                Редаг.
                                                                            </button>
                                                                            <button
                                                                                onClick={() => onDeleteSchedule(schedule._id)}
                                                                                style={{
                                                                                    padding: "8px 12px",
                                                                                    fontSize: "14px",
                                                                                    backgroundColor: "#ef4444",
                                                                                    color: "white",
                                                                                    border: "none",
                                                                                    borderRadius: "6px",
                                                                                    cursor: "pointer",
                                                                                    fontWeight: "500",
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: "4px"
                                                                                }}
                                                                            >
                                                                                <FaTrash size={12} />
                                                                                Видел.
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{
                                                                        textAlign: "center",
                                                                        color: "#9ca3af",
                                                                        fontStyle: "italic",
                                                                        padding: "20px 0",
                                                                        fontSize: "14px"
                                                                    }}>
                                                                        Вікно для заняття
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Tab.Pane>
                                );
                            })}
                        </Tab.Content>
                    </Tab.Container>
                </Card.Body>
            </Card>

            <EditScheduleModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                schedule={selectedSchedule}
                classrooms={safeClassrooms}
                timeSlots={timeSlots}
                teachers={safeTeachers}
                onSave={handleSaveSchedule}
                loading={saveLoading}
            />
        </>
    );
};

export default GroupScheduleTable;