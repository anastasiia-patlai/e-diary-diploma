import React, { useState, useEffect } from "react";
import { Card, Tab, Nav, Spinner, Row, Col } from "react-bootstrap";
import { FaEdit, FaTrash, FaUserFriends, FaUsers, FaChalkboardTeacher, FaDoorOpen, FaBook, FaClock, FaCalendarAlt } from "react-icons/fa";
// import EditScheduleModal from "./edit_component/EditScheduleModal";

const GroupScheduleTable = ({
    schedules,
    groups,
    timeSlots,
    daysOfWeek,
    selectedGroup,
    loading,
    onDeleteSchedule,
    onUpdateSchedule,
    classrooms,
    teachers,
    isMobile = false,
    databaseName
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [activeDay, setActiveDay] = useState(0);

    // Безпечні масиви - завжди масив, ніколи undefined
    const safeDaysOfWeek = Array.isArray(daysOfWeek) ? daysOfWeek : [];
    const safeClassrooms = Array.isArray(classrooms) ? classrooms : [];
    const safeTeachers = Array.isArray(teachers) ? teachers : [];

    // Отримати вибрану групу
    const getSelectedGroup = () => {
        return groups.find(group => group._id === selectedGroup);
    };

    // Отримати часові слоти для дня
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

    // Отримати всі розклади для слоту з урахуванням підгруп
    const getSchedulesForSlot = (dayId, timeSlotId) => {
        return schedules.filter(schedule => {
            const scheduleDayId = schedule.dayOfWeek?._id || schedule.dayOfWeek?.id;
            return scheduleDayId === dayId &&
                schedule.timeSlot?._id === timeSlotId;
        });
    };

    // Обробка редагування
    const handleEditSchedule = (schedule) => {
        console.log('Відкриття редагування розкладу:', schedule);
        setSelectedSchedule(schedule);
        setShowEditModal(true);
    };

    // Обробка збереження
    const handleSaveSchedule = async (updatedSchedule) => {
        if (onUpdateSchedule) {
            await onUpdateSchedule(updatedSchedule);
        }
        setShowEditModal(false);
    };

    // Картка для заняття всієї групи
    const FullGroupScheduleCard = ({ schedule, onEdit, onDelete, isMobile }) => {
        return (
            <div style={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: 'white',
                border: '2px solid rgba(105, 180, 185, 0.3)',
                borderRadius: '6px',
                padding: isMobile ? '10px' : '12px',
                minHeight: '120px'
            }}>
                {/* Верхня частина - інформація про заняття */}
                <div>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px"
                    }}>
                        <div style={{
                            fontWeight: "600",
                            color: "rgba(105, 180, 185, 1)",
                            fontSize: isMobile ? "14px" : "15px",
                            lineHeight: "1.3",
                            maxWidth: '70%',
                            wordBreak: 'break-word'
                        }}>
                            {schedule.subject}
                        </div>
                        <div style={{
                            display: "flex",
                            gap: "6px"
                        }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                style={{
                                    padding: "4px 8px",
                                    fontSize: isMobile ? "11px" : "12px",
                                    backgroundColor: "rgba(105, 180, 185, 1)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: isMobile ? '35px' : '40px'
                                }}
                                title="Редагувати"
                            >
                                <FaEdit size={isMobile ? 10 : 12} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                style={{
                                    padding: "4px 8px",
                                    fontSize: isMobile ? "11px" : "12px",
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: isMobile ? '35px' : '40px'
                                }}
                                title="Видалити"
                            >
                                <FaTrash size={isMobile ? 10 : 12} />
                            </button>
                        </div>
                    </div>

                    <div style={{
                        fontSize: isMobile ? "12px" : "13px",
                        color: "#374151",
                        lineHeight: "1.4",
                        marginBottom: "8px"
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "4px"
                        }}>
                            <FaChalkboardTeacher size={isMobile ? 11 : 12} style={{ color: "#6b7280" }} />
                            <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: isMobile ? "12px" : "13px"
                            }}>
                                {schedule.teacher?.fullName || "Без викладача"}
                            </span>
                        </div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        }}>
                            <FaDoorOpen size={isMobile ? 11 : 12} style={{ color: "#6b7280" }} />
                            <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: isMobile ? "12px" : "13px"
                            }}>
                                {schedule.classroom?.name || "Без аудиторії"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Нижня частина - бейдж "ВСЯ ГРУПА" */}
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    marginTop: "auto",
                    paddingTop: "8px",
                    borderTop: "1px solid rgba(105, 180, 185, 0.2)"
                }}>
                    <div style={{
                        fontSize: isMobile ? "11px" : "12px",
                        color: "rgba(105, 180, 185, 1)",
                        fontWeight: "bold",
                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <FaUsers size={isMobile ? 10 : 12} />
                        ВСЯ ГРУПА
                    </div>
                </div>
            </div>
        );
    };

    // Картка для підгрупи
    const SubgroupScheduleCard = ({ schedule, subgroupNumber, onEdit, onDelete, isMobile }) => {
        return (
            <div style={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: 'white',
                border: '1px solid rgba(105, 180, 185, 0.3)',
                borderRadius: '6px',
                padding: isMobile ? '8px' : '10px',
                minHeight: '100px'
            }}>
                {/* Верхня частина - інформація про заняття */}
                <div>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "6px"
                    }}>
                        <div style={{
                            fontWeight: "600",
                            color: "rgba(105, 180, 185, 1)",
                            fontSize: isMobile ? "13px" : "14px",
                            lineHeight: "1.3",
                            maxWidth: '70%',
                            wordBreak: 'break-word'
                        }}>
                            {schedule.subject}
                        </div>
                        <div style={{
                            display: "flex",
                            gap: "4px"
                        }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                style={{
                                    padding: "3px 6px",
                                    fontSize: isMobile ? "10px" : "11px",
                                    backgroundColor: "rgba(105, 180, 185, 1)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "3px",
                                    cursor: "pointer",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: isMobile ? '30px' : '35px'
                                }}
                                title="Редагувати"
                            >
                                <FaEdit size={isMobile ? 9 : 10} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                style={{
                                    padding: "3px 6px",
                                    fontSize: isMobile ? "10px" : "11px",
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "3px",
                                    cursor: "pointer",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: isMobile ? '30px' : '35px'
                                }}
                                title="Видалити"
                            >
                                <FaTrash size={isMobile ? 9 : 10} />
                            </button>
                        </div>
                    </div>

                    <div style={{
                        fontSize: isMobile ? "11px" : "12px",
                        color: "#374151",
                        lineHeight: "1.4"
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            marginBottom: "3px"
                        }}>
                            <FaChalkboardTeacher size={isMobile ? 10 : 11} style={{ color: "#6b7280" }} />
                            <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: isMobile ? "11px" : "12px"
                            }}>
                                {schedule.teacher?.fullName || "Без викладача"}
                            </span>
                        </div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                        }}>
                            <FaDoorOpen size={isMobile ? 10 : 11} style={{ color: "#6b7280" }} />
                            <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: isMobile ? "11px" : "12px"
                            }}>
                                {schedule.classroom?.name || "Без аудиторії"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Нижня частина - бейдж підгрупи */}
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    marginTop: "auto",
                    paddingTop: "4px",
                    borderTop: "1px solid rgba(105, 180, 185, 0.1)"
                }}>
                    <div style={{
                        fontSize: isMobile ? "10px" : "11px",
                        color: "rgba(105, 180, 185, 1)",
                        fontWeight: "bold",
                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                        padding: '3px 6px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                    }}>
                        <FaUserFriends size={isMobile ? 9 : 10} />
                        П{subgroupNumber}
                    </div>
                </div>
            </div>
        );
    };

    // Комірка для відображення з підгрупами
    const ScheduleCell = ({ day, timeSlot }) => {
        const cellSchedules = getSchedulesForSlot(day._id || day.id, timeSlot._id);

        // Знайти заняття для всієї групи
        const fullGroupSchedule = cellSchedules.find(s => s.subgroup === 'all' || s.isFullGroup);

        // Знайти заняття для підгруп
        const subgroupSchedules = cellSchedules.filter(s => s.subgroup !== 'all');

        // Отримати групу
        const selectedGroupData = getSelectedGroup();

        // Визначити кількість підгруп у групі
        const subgroupCount = selectedGroupData?.hasSubgroups ?
            Math.min(selectedGroupData.subgroups?.length || 0, 3) : 0;

        // Висота комірки залежить від кількості підгруп
        const cellHeight = subgroupCount > 0 ? 120 + (subgroupCount * 80) : 120;

        // Якщо є заняття для всієї групи - воно займає всю комірку
        if (fullGroupSchedule) {
            return (
                <div style={{
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                    height: `${cellHeight}px`,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <FullGroupScheduleCard
                        schedule={fullGroupSchedule}
                        onEdit={() => handleEditSchedule(fullGroupSchedule)}
                        onDelete={() => onDeleteSchedule(fullGroupSchedule)}
                        isMobile={isMobile}
                    />
                </div>
            );
        }

        // Якщо є заняття тільки для підгруп
        if (subgroupSchedules.length > 0 && subgroupCount > 0) {
            return (
                <div style={{
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                    height: `${cellHeight}px`,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        height: '100%',
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px"
                    }}>
                        {Array.from({ length: subgroupCount }).map((_, index) => {
                            const subgroupNumber = index + 1;
                            const subgroupSchedule = subgroupSchedules.find(s => s.subgroup === String(subgroupNumber));

                            return (
                                <div
                                    key={index}
                                    style={{
                                        flex: 1,
                                        backgroundColor: subgroupSchedule ? "white" : "#f9fafb",
                                        border: `1px solid ${subgroupSchedule ? "rgba(105, 180, 185, 0.3)" : "#e5e7eb"}`,
                                        borderRadius: "6px",
                                        padding: "10px",
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    {subgroupSchedule ? (
                                        <SubgroupScheduleCard
                                            schedule={subgroupSchedule}
                                            subgroupNumber={subgroupNumber}
                                            onEdit={() => handleEditSchedule(subgroupSchedule)}
                                            onDelete={() => onDeleteSchedule(subgroupSchedule)}
                                            isMobile={isMobile}
                                        />
                                    ) : (
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "100%",
                                            color: "#9ca3af",
                                            fontSize: isMobile ? "13px" : "14px",
                                            fontStyle: 'italic'
                                        }}>
                                            Підгрупа {subgroupNumber}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // Пуста комірка
        return (
            <div style={{
                backgroundColor: "#f9fafb",
                border: "1px dashed #e5e7eb",
                borderRadius: "8px",
                padding: "12px",
                height: `${cellHeight}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    color: "#9ca3af",
                    fontSize: isMobile ? "14px" : "15px",
                    fontStyle: 'italic',
                    textAlign: 'center'
                }}>
                    Немає заняття
                </div>
            </div>
        );
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
                <p style={{ color: "#dc3545", margin: "16px 0 0 0", fontWeight: "600" }}>
                    ⚠️ Дні тижня не налаштовані або не завантажені
                </p>
                <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>
                    Перевірте налаштування календаря
                </p>
            </div>
        );
    }

    // Рендер контенту
    const renderContent = () => (
        <Card style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px"
        }}>
            <Card.Header style={{
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                padding: isMobile ? "12px 16px" : "16px 20px"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: isMobile ? "column" : "row",
                    gap: isMobile ? "12px" : "0"
                }}>
                    <h5 style={{
                        margin: 0,
                        fontSize: isMobile ? "16px" : "18px",
                        color: "#374151",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        <FaCalendarAlt />
                        Розклад для {selectedGroupData.name}
                        {selectedGroupData.hasSubgroups && (
                            <span style={{
                                fontSize: "14px",
                                color: "#6b7280",
                                fontWeight: "normal"
                            }}>
                                ({selectedGroupData.subgroups?.length || 0} підгрупи)
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

            <Card.Body style={{ padding: 0 }}>
                <Tab.Container activeKey={activeDay} onSelect={(k) => setActiveDay(parseInt(k))}>
                    <Nav variant="tabs" style={{
                        borderBottom: "1px solid #e5e7eb",
                        padding: isMobile ? "0 12px" : "0 20px",
                        display: "flex",
                        overflowX: isMobile ? "auto" : "flex",
                        whiteSpace: isMobile ? "nowrap" : "normal"
                    }}>
                        {safeDaysOfWeek.map((day, index) => (
                            <Nav.Item key={day._id || day.id}>
                                <Nav.Link
                                    eventKey={index}
                                    style={{
                                        padding: isMobile ? "12px 14px" : "16px 20px",
                                        border: "none",
                                        fontWeight: "500",
                                        color: activeDay === index ? "#374151" : "#6b7280",
                                        backgroundColor: "transparent",
                                        borderBottom: activeDay === index ? "2px solid rgba(105, 180, 185, 1)" : "none",
                                        fontSize: isMobile ? "14px" : "15px",
                                        minWidth: isMobile ? "50px" : "auto",
                                        textAlign: "center"
                                    }}
                                >
                                    {isMobile ? (day.nameShort || day.name.substring(0, 2)) : day.name}
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
                                    style={{ padding: isMobile ? "16px" : "20px" }}
                                >
                                    <div style={{
                                        backgroundColor: "#f9fafb",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        marginBottom: "20px",
                                        border: "1px solid #e5e7eb"
                                    }}>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            flexDirection: isMobile ? "column" : "row",
                                            gap: isMobile ? "8px" : "0"
                                        }}>
                                            <h6 style={{
                                                margin: 0,
                                                color: "#374151",
                                                fontWeight: "600",
                                                fontSize: "16px"
                                            }}>
                                                Розклад на {day.name}
                                            </h6>
                                            <div style={{
                                                fontSize: "14px",
                                                color: "#6b7280"
                                            }}>
                                                {dayTimeSlots.length} уроків
                                            </div>
                                        </div>
                                    </div>

                                    {dayTimeSlots.length === 0 ? (
                                        <div style={{
                                            textAlign: "center",
                                            padding: "40px 20px",
                                            color: "#6b7280",
                                            backgroundColor: "#f9fafb",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px"
                                        }}>
                                            <p style={{ margin: 0, fontSize: "16px" }}>
                                                Немає уроків для {day.name}
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: "grid",
                                            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
                                            gap: isMobile ? "16px" : "20px"
                                        }}>
                                            {dayTimeSlots.map((timeSlot) => (
                                                <div
                                                    key={timeSlot._id}
                                                    style={{
                                                        backgroundColor: "#f0f9ff",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "8px",
                                                        overflow: "hidden"
                                                    }}
                                                >
                                                    {/* Заголовок з часом уроку */}
                                                    <div style={{
                                                        padding: isMobile ? "12px" : "16px",
                                                        backgroundColor: "rgba(105, 180, 185, 0.1)",
                                                        borderBottom: "1px solid rgba(105, 180, 185, 0.3)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between"
                                                    }}>
                                                        <div style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: isMobile ? "8px" : "12px"
                                                        }}>
                                                            <div style={{
                                                                fontSize: isMobile ? "20px" : "24px",
                                                                fontWeight: "600",
                                                                color: "rgba(105, 180, 185, 1)",
                                                                minWidth: isMobile ? "30px" : "40px"
                                                            }}>
                                                                {timeSlot.order}
                                                            </div>
                                                            <div style={{
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                gap: "2px"
                                                            }}>
                                                                <div style={{
                                                                    fontSize: isMobile ? "14px" : "16px",
                                                                    fontWeight: "500",
                                                                    color: "#374151"
                                                                }}>
                                                                    {timeSlot.startTime} - {timeSlot.endTime}
                                                                </div>
                                                                <div style={{
                                                                    fontSize: isMobile ? "12px" : "13px",
                                                                    color: "#6b7280"
                                                                }}>
                                                                    Урок {timeSlot.order}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            padding: "4px 8px",
                                                            backgroundColor: "rgba(105, 180, 185, 0.2)",
                                                            color: "rgba(105, 180, 185, 1)",
                                                            borderRadius: "4px",
                                                            fontSize: isMobile ? "12px" : "13px",
                                                            fontWeight: "600",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "4px"
                                                        }}>
                                                            <FaClock size={isMobile ? 12 : 14} />
                                                            {timeSlot.startTime}
                                                        </div>
                                                    </div>

                                                    {/* Тіло з розкладом */}
                                                    <div style={{
                                                        padding: isMobile ? "12px" : "16px"
                                                    }}>
                                                        <ScheduleCell
                                                            day={day}
                                                            timeSlot={timeSlot}
                                                        />
                                                    </div>

                                                    {/* Інформація про кількість занять */}
                                                    <div style={{
                                                        padding: "8px 16px",
                                                        backgroundColor: "#f9fafb",
                                                        borderTop: "1px solid #e5e7eb",
                                                        fontSize: isMobile ? "12px" : "13px",
                                                        color: "#6b7280"
                                                    }}>
                                                        {(() => {
                                                            const cellSchedules = getSchedulesForSlot(day._id || day.id, timeSlot._id);
                                                            const fullGroup = cellSchedules.filter(s => s.subgroup === 'all').length;
                                                            const subgroups = cellSchedules.filter(s => s.subgroup !== 'all').length;

                                                            if (fullGroup > 0) {
                                                                return "Заняття для всієї групи";
                                                            } else if (subgroups > 0) {
                                                                return `${subgroups} з ${selectedGroupData.subgroups?.length || 0} підгруп`;
                                                            } else {
                                                                return "Немає занять";
                                                            }
                                                        })()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Tab.Pane>
                            );
                        })}
                    </Tab.Content>
                </Tab.Container>
            </Card.Body>
        </Card>
    );

    return (
        <>
            {renderContent()}

            {/* КРИТИЧНО ВАЖЛИВО: Рендерити модалку ТІЛЬКИ якщо є всі дані */}
            {/* {showEditModal && safeDaysOfWeek.length > 0 && (
                <EditScheduleModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    schedule={selectedSchedule}
                    daysOfWeek={safeDaysOfWeek}
                    classrooms={safeClassrooms}
                    timeSlots={timeSlots}
                    teachers={safeTeachers}
                    onSave={handleSaveSchedule}
                    loading={saveLoading}
                    databaseName={databaseName}
                />
            )} */}
        </>
    );
};

export default GroupScheduleTable;