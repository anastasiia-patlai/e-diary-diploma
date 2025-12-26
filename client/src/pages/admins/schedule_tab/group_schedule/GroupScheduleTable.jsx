import React, { useState, useEffect } from "react";
import { Card, Tab, Nav, Spinner } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
// import EditScheduleModal from "./edit_component/EditScheduleModal";

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

    // ДОДАНО: Логування для діагностики
    useEffect(() => {
        console.log('GroupScheduleTable Props:', {
            daysOfWeek: safeDaysOfWeek.length,
            classrooms: safeClassrooms.length,
            teachers: safeTeachers.length,
            timeSlots: timeSlots?.length
        });
    }, [safeDaysOfWeek, safeClassrooms, safeTeachers, timeSlots]);

    const getSelectedGroup = () => {
        return groups.find(group => group._id === selectedGroup);
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

        return [];
    };

    const getScheduleForSlot = (dayId, timeSlotId) => {
        return schedules.find(schedule => {
            const scheduleDayId = schedule.dayOfWeek?._id || schedule.dayOfWeek?.id;
            return scheduleDayId === dayId &&
                schedule.timeSlot?._id === timeSlotId;
        });
    };

    const handleEditSchedule = (schedule) => {
        console.log('🎯 Відкриття модалки редагування для:', schedule);
        console.log('📊 Доступні дані:', {
            daysOfWeek: safeDaysOfWeek.length,
            classrooms: safeClassrooms.length,
            teachers: safeTeachers.length
        });
        setSelectedSchedule(schedule);
        setShowEditModal(true);
    };

    const handleSaveSchedule = async (updatedSchedule) => {
        setSaveLoading(true);
        try {
            console.log('💾 Оновлений розклад:', updatedSchedule);
            setShowEditModal(false);
        } catch (error) {
            console.error('❌ Помилка при оновленні розкладу:', error);
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
                                        <h6 style={{
                                            margin: 0,
                                            color: "#374151",
                                            fontWeight: "600",
                                            fontSize: "16px",
                                            textAlign: isMobile ? "center" : "left"
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
                                            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(400px, 1fr))",
                                            gap: isMobile ? "12px" : "16px"
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
                                                            transition: "all 0.2s"
                                                        }}
                                                    >
                                                        <div style={{
                                                            padding: isMobile ? "12px" : "16px",
                                                            backgroundColor: schedule ? "rgba(105, 180, 185, 0.1)" : "#f3f4f6",
                                                            borderBottom: "1px solid #e5e7eb"
                                                        }}>
                                                            <div style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: isMobile ? "8px" : "12px"
                                                            }}>
                                                                <div style={{
                                                                    fontSize: isMobile ? "20px" : "24px",
                                                                    fontWeight: "600",
                                                                    color: schedule ? "rgba(105, 180, 185, 1)" : "#6b7280",
                                                                    minWidth: isMobile ? "30px" : "40px"
                                                                }}>
                                                                    {timeSlot.order}
                                                                </div>
                                                                <div style={{
                                                                    fontSize: isMobile ? "14px" : "16px",
                                                                    fontWeight: "500",
                                                                    color: "#374151"
                                                                }}>
                                                                    {timeSlot.startTime} - {timeSlot.endTime}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            padding: isMobile ? "12px" : "16px",
                                                            minHeight: isMobile ? "auto" : "120px"
                                                        }}>
                                                            {schedule ? (
                                                                <>
                                                                    <div style={{
                                                                        fontSize: isMobile ? "16px" : "18px",
                                                                        fontWeight: "600",
                                                                        color: "#374151",
                                                                        marginBottom: "8px"
                                                                    }}>
                                                                        {schedule.subject}
                                                                    </div>
                                                                    <div style={{
                                                                        fontSize: isMobile ? "14px" : "15px",
                                                                        color: "#6b7280",
                                                                        marginBottom: "4px"
                                                                    }}>
                                                                        <strong>Викладач:</strong> {schedule.teacher?.fullName}
                                                                    </div>
                                                                    <div style={{
                                                                        fontSize: isMobile ? "14px" : "15px",
                                                                        color: "#6b7280"
                                                                    }}>
                                                                        <strong>Аудиторія:</strong> {schedule.classroom?.name}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div style={{
                                                                    textAlign: "center",
                                                                    color: "#9ca3af",
                                                                    fontStyle: "italic",
                                                                    padding: isMobile ? "20px 0" : "24px 0",
                                                                    fontSize: isMobile ? "14px" : "15px"
                                                                }}>
                                                                    Вікно для заняття
                                                                </div>
                                                            )}
                                                        </div>

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
                                                                        padding: isMobile ? "8px 12px" : "8px 16px",
                                                                        fontSize: "14px",
                                                                        backgroundColor: "rgba(105, 180, 185, 1)",
                                                                        color: "white",
                                                                        border: "none",
                                                                        borderRadius: "6px",
                                                                        cursor: "pointer",
                                                                        fontWeight: "500",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: isMobile ? "4px" : "6px"
                                                                    }}
                                                                >
                                                                    <FaEdit size={isMobile ? 12 : 14} />
                                                                    {isMobile ? "Ред." : "Редагувати"}
                                                                </button>
                                                                <button
                                                                    onClick={() => onDeleteSchedule(schedule)}
                                                                    style={{
                                                                        padding: isMobile ? "8px 12px" : "8px 16px",
                                                                        fontSize: "14px",
                                                                        backgroundColor: "#ef4444",
                                                                        color: "white",
                                                                        border: "none",
                                                                        borderRadius: "6px",
                                                                        cursor: "pointer",
                                                                        fontWeight: "500",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: isMobile ? "4px" : "6px"
                                                                    }}
                                                                >
                                                                    <FaTrash size={isMobile ? 12 : 14} />
                                                                    {isMobile ? "Вид." : "Видалити"}
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