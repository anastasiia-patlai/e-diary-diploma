import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaCalendarWeek, FaClock, FaChalkboardTeacher, FaMapMarkerAlt } from "react-icons/fa";

const StudentScheduleTab = ({ databaseName, userData, isMobile }) => {
    const { t } = useTranslation();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());

    const daysOfWeek = [
        t("schedule.monday"),
        t("schedule.tuesday"),
        t("schedule.wednesday"),
        t("schedule.thursday"),
        t("schedule.friday"),
        t("schedule.saturday")
    ];

    useEffect(() => {
        fetchSchedule();
    }, [databaseName, userData]);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            if (databaseName && userData?.groupId) {
                const response = await fetch(`/api/schedule/group/${userData.groupId}?databaseName=${databaseName}`);
                if (response.ok) {
                    const data = await response.json();
                    setSchedule(data);
                } else {
                    // Тестові дані
                    setSchedule([
                        { day: 1, subject: "Математика", teacher: "Іванова М.П.", time: "08:30-09:15", room: "205" },
                        { day: 1, subject: "Українська мова", teacher: "Петренко О.В.", time: "09:25-10:10", room: "210" },
                        { day: 2, subject: "Англійська мова", teacher: "Сміт Дж.", time: "08:30-09:15", room: "305" },
                        { day: 2, subject: "Історія", teacher: "Коваленко Т.М.", time: "09:25-10:10", room: "215" }
                    ]);
                }
            } else {
                // Тестові дані
                setSchedule([
                    { day: 1, subject: "Математика", teacher: "Іванова М.П.", time: "08:30-09:15", room: "205" },
                    { day: 1, subject: "Українська мова", teacher: "Петренко О.В.", time: "09:25-10:10", room: "210" },
                    { day: 2, subject: "Англійська мова", teacher: "Сміт Дж.", time: "08:30-09:15", room: "305" },
                    { day: 2, subject: "Історія", teacher: "Коваленко Т.М.", time: "09:25-10:10", room: "215" }
                ]);
            }
        } catch (error) {
            console.error('Помилка отримання розкладу:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScheduleForDay = (day) => {
        return schedule.filter(lesson => lesson.day === day);
    };

    if (loading) {
        return <div>{t("common.loading")}</div>;
    }

    return (
        <div>
            <h3 style={{ fontSize: isMobile ? '18px' : '24px', marginBottom: '20px' }}>
                {t("student.schedule.title")}
            </h3>

            <div style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                marginBottom: '20px',
                paddingBottom: '10px'
            }}>
                {daysOfWeek.map((day, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedDay(index + 1)}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: selectedDay === index + 1 ? 'rgba(105, 180, 185, 1)' : '#f3f4f6',
                            color: selectedDay === index + 1 ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s'
                        }}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
            }}>
                {getScheduleForDay(selectedDay).length > 0 ? (
                    getScheduleForDay(selectedDay).map((lesson, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '15px',
                                borderBottom: index !== getScheduleForDay(selectedDay).length - 1 ? '1px solid #e5e7eb' : 'none',
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                justifyContent: 'space-between',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                gap: isMobile ? '10px' : '0'
                            }}
                        >
                            <div style={{ minWidth: '80px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaClock style={{ color: '#9ca3af' }} />
                                    <span style={{ fontWeight: '500' }}>{lesson.time}</span>
                                </div>
                            </div>

                            <div style={{ flex: 1, marginLeft: isMobile ? '0' : '20px' }}>
                                <h4 style={{ margin: 0, fontSize: '16px' }}>{lesson.subject}</h4>
                                <div style={{ display: 'flex', gap: '15px', marginTop: '5px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#666' }}>
                                        <FaChalkboardTeacher />
                                        <span>{lesson.teacher}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#666' }}>
                                        <FaMapMarkerAlt />
                                        <span>{t("schedule.room")}: {lesson.room}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#9ca3af'
                    }}>
                        {t("student.schedule.noLessons")}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentScheduleTab;