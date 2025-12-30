import React, { useState } from "react";
import { Row, Col, Card, Table, Spinner } from "react-bootstrap";
import { FaCalendarAlt, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaChalkboardTeacher, FaDoorOpen, FaUsers, FaTrash, FaEdit, FaUserFriends } from "react-icons/fa";
import EditScheduleModal from "./edit_component/EditScheduleModal";

const ScheduleTable = ({
    schedules,
    groups,
    timeSlots,
    daysOfWeek,
    loading,
    onDeleteSchedule,
    onUpdateSchedule,
    classrooms = [],
    teachers = [],
    isMobile = false,
    databaseName
}) => {
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

    const getSchedulesForSlot = (dayId, groupId, timeSlotId) => {
        return schedules.filter(schedule => {
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

    const handleDaySelect = (day) => {
        setSelectedDay(selectedDay?.id === day.id ? null : day);
    };

    const handleEditSchedule = (schedule) => {
        console.log('Відкриття редагування розкладу:', schedule);
        setSelectedSchedule(schedule);
        setShowEditModal(true);
    };

    const handleSaveSchedule = async (updatedSchedule) => {
        console.log('Збереження оновленого розкладу:', updatedSchedule);

        if (onUpdateSchedule) {
            await onUpdateSchedule(updatedSchedule);
        }

        setShowEditModal(false);
    };

    // КОМПАНЕНТ ДЛЯ КОМІРКИ З ПІДГРУПАМИ
    const ScheduleCellWithSubgroups = ({ day, group, timeSlot }) => {
        const cellSchedules = getSchedulesForSlot(day._id || day.id, group._id, timeSlot._id);

        // ЗНАЙТИ ЗАНЯТТЯ ДЛЯ ВСІЄЇ ГРУПИ
        const fullGroupSchedule = cellSchedules.find(s => s.subgroup === 'all' || s.isFullGroup);

        // ЗНАЙТИ ЗАНЯТТЯ ДЛЯ ПІДГРУП
        const subgroupSchedules = cellSchedules.filter(s => s.subgroup !== 'all');

        // ВИЗНАЧИТИ КІЛЬКІСТЬ ПІДГРУП У ГРУПІ
        const subgroupCount = group.hasSubgroups ? Math.min(group.subgroups?.length || 0, 3) : 0;

        // ВИСОТА КОМІРКИ ЗАЛЕЖИТЬ ВІД КІЛЬКОСТІ ПІДГРУП
        const cellHeight = subgroupCount > 0 ? 100 + (subgroupCount * 60) : 120;

        // ЯКЩО Є ЗАНЯТТЯ ДЛЯ ВСІЄЇ ГРУПИ - ВОНО ЗАЙМАЄ ВСЮ КОМІРКУ
        if (fullGroupSchedule) {
            return (
                <td style={{
                    width: '200px',
                    padding: "4px",
                    borderBottom: "1px solid #e5e7eb",
                    verticalAlign: "top",
                    minHeight: `${cellHeight}px`,
                    backgroundColor: "#f0f9ff",
                    position: 'relative'
                }}>
                    <div style={{
                        height: `${cellHeight}px`,
                        padding: "8px",
                        backgroundColor: "white",
                        border: "2px solid rgba(105, 180, 185, 0.3)",
                        borderRadius: "6px",
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <FullGroupScheduleCard
                            schedule={fullGroupSchedule}
                            onEdit={() => handleEditSchedule(fullGroupSchedule)}
                            onDelete={() => onDeleteSchedule(fullGroupSchedule)}
                            cellHeight={cellHeight}
                        />
                    </div>
                </td>
            );
        }

        // ЯКЩО Є ЗАНЯТТЯ ТІЛЬКИ ДЛЯ ПІДГРУП
        if (subgroupSchedules.length > 0 && subgroupCount > 0) {
            return (
                <td style={{
                    width: '200px',
                    padding: "4px",
                    borderBottom: "1px solid #e5e7eb",
                    verticalAlign: "top",
                    minHeight: `${cellHeight}px`,
                    backgroundColor: "#f0f9ff",
                    position: 'relative'
                }}>
                    <div style={{
                        height: `${cellHeight}px`,
                        padding: "4px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px"
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
                                        padding: "8px",
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        minHeight: '60px'
                                    }}
                                >
                                    {subgroupSchedule ? (
                                        <SubgroupScheduleCard
                                            schedule={subgroupSchedule}
                                            subgroupNumber={subgroupNumber}
                                            onEdit={() => handleEditSchedule(subgroupSchedule)}
                                            onDelete={() => onDeleteSchedule(subgroupSchedule)}
                                        />
                                    ) : (
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "100%",
                                            color: "#9ca3af",
                                            fontSize: "14px",
                                            fontStyle: 'italic'
                                        }}>
                                            Підгрупа {subgroupNumber}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </td>
            );
        }

        // Пуста комірка
        return (
            <td style={{
                width: '200px',
                padding: "4px",
                borderBottom: "1px solid #e5e7eb",
                verticalAlign: "top",
                minHeight: `${cellHeight}px`,
                position: 'relative'
            }}>
                <div style={{
                    height: `${cellHeight}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9ca3af",
                    fontSize: "14px",
                    border: "1px dashed #e5e7eb",
                    borderRadius: "6px",
                    backgroundColor: "#f9fafb"
                }}>
                    —
                </div>
            </td>
        );
    };

    // Картка для заняття всієї групи (займає всю комірку)
    const FullGroupScheduleCard = ({ schedule, onEdit, onDelete, cellHeight }) => {
        return (
            <div style={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
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
                            fontSize: "18px",
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
                                    fontSize: "12px",
                                    backgroundColor: "rgba(105, 180, 185, 1)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '40px'
                                }}
                                title="Редагувати"
                            >
                                <FaEdit size={12} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                style={{
                                    padding: "4px 8px",
                                    fontSize: "12px",
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '40px'
                                }}
                                title="Видалити"
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    </div>

                    <div style={{
                        fontSize: "13px",
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
                            <FaChalkboardTeacher size={12} style={{ color: "#6b7280" }} />
                            <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: "15px"
                            }}>
                                {schedule.teacher?.fullName || "Без викладача"}
                            </span>
                        </div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        }}>
                            <FaDoorOpen size={12} style={{ color: "#6b7280" }} />
                            <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: "14px"
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
                        fontSize: "12px",
                        color: "rgba(105, 180, 185, 1)",
                        fontWeight: "bold",
                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <FaUsers size={10} />
                        ВСЯ ГРУПА
                    </div>
                </div>
            </div>
        );
    };

    // Картка для підгрупи (займає частину комірки)
    const SubgroupScheduleCard = ({ schedule, subgroupNumber, onEdit, onDelete }) => {
        return (
            <div style={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
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
                            fontSize: "16px",
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
                                    fontSize: "11px",
                                    backgroundColor: "rgba(105, 180, 185, 1)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "3px",
                                    cursor: "pointer",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '35px'
                                }}
                                title="Редагувати"
                            >
                                <FaEdit size={12} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                style={{
                                    padding: "3px 6px",
                                    fontSize: "11px",
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "3px",
                                    cursor: "pointer",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '35px'
                                }}
                                title="Видалити"
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    </div>

                    <div style={{
                        fontSize: "12px",
                        color: "#374151",
                        lineHeight: "1.4"
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            marginBottom: "3px"
                        }}>
                            <FaChalkboardTeacher size={11} style={{ color: "#6b7280" }} />
                            <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: "13px"
                            }}>
                                {schedule.teacher?.fullName || "Без викладача"}
                            </span>
                        </div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                        }}>
                            <FaDoorOpen size={11} style={{ color: "#6b7280" }} />
                            <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: "12px"
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
                        fontSize: "11px",
                        color: "rgba(105, 180, 185, 1)",
                        fontWeight: "bold",
                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                        padding: '3px 6px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                    }}>
                        <FaUserFriends size={9} />
                        П{subgroupNumber}
                    </div>
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

    // Мобільний варіант
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
                        {safeDaysOfWeek.map((day) => {
                            const dayTimeSlots = getTimeSlotsForDay(day._id || day.id);
                            const isDayExpanded = selectedDay?.id === day.id;

                            return (
                                <div key={day._id || day.id} style={{
                                    borderBottom: "1px solid #e5e7eb",
                                    backgroundColor: isDayExpanded ? "#f9fafb" : "white"
                                }}>
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

                                                        <div style={{
                                                            display: "grid",
                                                            gap: "8px"
                                                        }}>
                                                            {safeGroups.map((group) => {
                                                                const cellSchedules = getSchedulesForSlot(day._id || day.id, group._id, timeSlot._id);

                                                                if (cellSchedules.length === 0) {
                                                                    return (
                                                                        <div
                                                                            key={group._id}
                                                                            style={{
                                                                                backgroundColor: "#f3f4f6",
                                                                                border: "1px solid #e5e7eb",
                                                                                borderRadius: "6px",
                                                                                padding: "10px",
                                                                                textAlign: "center",
                                                                                color: "#9ca3af",
                                                                                fontSize: "13px"
                                                                            }}
                                                                        >
                                                                            {group.name} - немає заняття
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <div
                                                                        key={group._id}
                                                                        style={{
                                                                            backgroundColor: "white",
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
                                                                        </div>

                                                                        {cellSchedules.map((schedule) => (
                                                                            <div
                                                                                key={schedule._id}
                                                                                style={{
                                                                                    backgroundColor: schedule.subgroup === 'all' ? "#f0f9ff" : "#f9fafb",
                                                                                    border: `1px solid ${schedule.subgroup === 'all' ? "rgba(105, 180, 185, 0.3)" : "#e5e7eb"}`,
                                                                                    borderRadius: "6px",
                                                                                    padding: "8px",
                                                                                    marginBottom: "4px"
                                                                                }}
                                                                            >
                                                                                <div style={{
                                                                                    display: "flex",
                                                                                    justifyContent: "space-between",
                                                                                    alignItems: "flex-start",
                                                                                    marginBottom: "4px"
                                                                                }}>
                                                                                    <div style={{
                                                                                        fontWeight: "600",
                                                                                        color: "rgba(105, 180, 185, 1)",
                                                                                        fontSize: "14px"
                                                                                    }}>
                                                                                        {schedule.subject}
                                                                                        {schedule.subgroup !== 'all' && ` (Підгрупа ${schedule.subgroup})`}
                                                                                    </div>
                                                                                    <div style={{
                                                                                        display: "flex",
                                                                                        gap: "6px"
                                                                                    }}>
                                                                                        <button
                                                                                            onClick={() => handleEditSchedule(schedule)}
                                                                                            style={{
                                                                                                padding: "4px 8px",
                                                                                                fontSize: "11px",
                                                                                                backgroundColor: "rgba(105, 180, 185, 1)",
                                                                                                color: "white",
                                                                                                border: "none",
                                                                                                borderRadius: "3px",
                                                                                                cursor: "pointer"
                                                                                            }}
                                                                                        >
                                                                                            Редаг.
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => onDeleteSchedule(schedule)}
                                                                                            style={{
                                                                                                padding: "4px 8px",
                                                                                                fontSize: "11px",
                                                                                                backgroundColor: "#ef4444",
                                                                                                color: "white",
                                                                                                border: "none",
                                                                                                borderRadius: "3px",
                                                                                                cursor: "pointer"
                                                                                            }}
                                                                                        >
                                                                                            Видел.
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                                <div style={{
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: "6px",
                                                                                    fontSize: "12px",
                                                                                    color: "#6b7280",
                                                                                    marginBottom: "2px"
                                                                                }}>
                                                                                    <FaChalkboardTeacher size={10} />
                                                                                    {schedule.teacher?.fullName || "Викладач не вказаний"}
                                                                                </div>
                                                                                <div style={{
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: "6px",
                                                                                    fontSize: "12px",
                                                                                    color: "#6b7280"
                                                                                }}>
                                                                                    <FaDoorOpen size={10} />
                                                                                    {schedule.classroom?.name || "Аудиторія не вказана"}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </Card.Body>
                </Card>

                <EditScheduleModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    schedule={selectedSchedule}
                    daysOfWeek={safeDaysOfWeek}
                    classrooms={safeClassrooms}
                    timeSlots={timeSlots}
                    teachers={safeTeachers}
                    onSave={handleSaveSchedule}
                    loading={false}
                    databaseName={databaseName}
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
                                                    {group.hasSubgroups && (
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#6b7280',
                                                            fontWeight: 'normal',
                                                            marginTop: '2px'
                                                        }}>
                                                            ({group.subgroups?.length || 0} підгрупи)
                                                        </div>
                                                    )}
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
                                                                        fontSize: "13px",
                                                                        color: "#6b7280",
                                                                        fontWeight: "normal"
                                                                    }}>
                                                                        {day.name}
                                                                    </small>
                                                                </td>
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
                                                                fontSize: "14px",
                                                                position: 'sticky',
                                                                left: '90px',
                                                                zIndex: 10
                                                            }}>
                                                                {timeSlot.order}. {timeSlot.startTime} - {timeSlot.endTime}
                                                            </td>

                                                            {safeGroups.map(group => (
                                                                <ScheduleCellWithSubgroups
                                                                    key={group._id}
                                                                    day={day}
                                                                    group={group}
                                                                    timeSlot={timeSlot}
                                                                />
                                                            ))}
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

            <EditScheduleModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                schedule={selectedSchedule}
                daysOfWeek={safeDaysOfWeek}
                classrooms={safeClassrooms}
                timeSlots={timeSlots}
                teachers={safeTeachers}
                groups={groups}
                onSave={handleSaveSchedule}
                loading={false}
                databaseName={databaseName}
            />
        </>
    );
};

export default ScheduleTable;