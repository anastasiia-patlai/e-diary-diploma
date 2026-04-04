import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    FaCalendarAlt, FaClock, FaChalkboardTeacher,
    FaBook, FaDoorOpen, FaListOl, FaUserGraduate, FaSpinner, FaUsers
} from "react-icons/fa";

const formatTime = (time) => {
    if (!time) return "—";
    const parts = time.split(":");
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
};

const StudentScheduleTab = ({ userData, databaseName: dbProp, isMobile: mobileProp }) => {
    const { t } = useTranslation();

    const [days, setDays] = useState([]);
    const [slotsByDay, setSlotsByDay] = useState({});
    const [schedule, setSchedule] = useState([]);
    const [activeDay, setActiveDay] = useState(null);
    const [studentSubgroup, setStudentSubgroup] = useState(null);
    const [groupName, setGroupName] = useState("");
    const [groupSubgroups, setGroupSubgroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isMobile, setIsMobile] = useState(mobileProp ?? window.innerWidth <= 768);
    const [showAllSubgroups, setShowAllSubgroups] = useState(false);

    useEffect(() => {
        if (mobileProp !== undefined) setIsMobile(mobileProp);
    }, [mobileProp]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getDatabaseName = useCallback(() => {
        return dbProp || JSON.parse(localStorage.getItem("userInfo") || "{}").databaseName || "";
    }, [dbProp]);

    useEffect(() => {
        const loadAllData = async () => {
            const db = getDatabaseName();
            const userId = userData?._id || userData?.id;

            if (!db || !userId) {
                setError(t("schedule.errors.noDataFound"));
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const studentRes = await fetch(`/api/users/${userId}?databaseName=${encodeURIComponent(db)}`);
                if (!studentRes.ok) throw new Error("Помилка завантаження студента");
                const student = await studentRes.json();

                const groupId = student.group?._id || student.group;
                setGroupName(student.group?.name || "");
                setStudentSubgroup(student.subgroup || null);

                if (!groupId) {
                    setError(t("schedule.errors.noDataFound"));
                    setLoading(false);
                    return;
                }

                const groupRes = await fetch(`/api/groups/${groupId}?databaseName=${encodeURIComponent(db)}`);
                if (groupRes.ok) {
                    const groupData = await groupRes.json();
                    setGroupSubgroups(groupData.subgroups || []);
                }

                const daysRes = await fetch(`/api/days/active?databaseName=${encodeURIComponent(db)}`);
                const daysData = await daysRes.json();

                const slotsMap = {};
                for (const day of daysData) {
                    const slotsRes = await fetch(`/api/time-slots?dayOfWeekId=${day.id}&databaseName=${encodeURIComponent(db)}`);
                    const slots = slotsRes.ok ? await slotsRes.json() : [];
                    slotsMap[day._id.toString()] = Array.isArray(slots) ? slots.sort((a, b) => a.order - b.order) : [];
                }

                const scheduleRes = await fetch(`/api/schedule/group/${groupId}?databaseName=${encodeURIComponent(db)}`);
                const scheduleData = scheduleRes.ok ? await scheduleRes.json() : [];

                const today = new Date().getDay();
                const todayId = today === 0 ? 7 : today;
                const activeDayData = daysData.find(d => d.id === todayId) || daysData[0];

                setDays(daysData);
                setSlotsByDay(slotsMap);
                setSchedule(scheduleData);
                setActiveDay(activeDayData);
                setLoading(false);
            } catch (err) {
                setError(t("schedule.errors.loadError"));
                setLoading(false);
            }
        };
        loadAllData();
    }, [userData?._id, getDatabaseName, t]);

    // Допоміжна функція для пошуку уроку
    const findLesson = (timeSlotId, subOrder) => {
        // Спочатку шукаємо урок для конкретної підгрупи
        const specificLesson = schedule.find(lesson => {
            const dayId = (lesson.dayOfWeek?._id || lesson.dayOfWeek)?.toString();
            const slotId = (lesson.timeSlot?._id || lesson.timeSlot)?.toString();

            if (dayId !== activeDay?._id?.toString() || slotId !== timeSlotId) return false;

            const lessonSub = String(lesson.subgroup || "all");
            return lessonSub === String(subOrder);
        });

        if (specificLesson) return specificLesson;

        // Якщо немає уроку для конкретної підгрупи, шукаємо урок для всієї групи
        const allGroupLesson = schedule.find(lesson => {
            const dayId = (lesson.dayOfWeek?._id || lesson.dayOfWeek)?.toString();
            const slotId = (lesson.timeSlot?._id || lesson.timeSlot)?.toString();

            if (dayId !== activeDay?._id?.toString() || slotId !== timeSlotId) return false;

            const lessonSub = String(lesson.subgroup || "all");
            return lessonSub === "all" || lessonSub === "0";
        });

        return allGroupLesson;
    };

    // Перевіряє, чи всі підгрупи мають однаковий урок (або урок для всієї групи)
    const shouldMergeSubgroups = (slotId) => {
        if (!showAllSubgroups || groupSubgroups.length <= 1) return false;

        // Перевіряємо, чи є урок для всієї групи
        const allGroupLesson = schedule.find(lesson => {
            const dayId = (lesson.dayOfWeek?._id || lesson.dayOfWeek)?.toString();
            const slotId_ = (lesson.timeSlot?._id || lesson.timeSlot)?.toString();
            if (dayId !== activeDay?._id?.toString() || slotId_ !== slotId) return false;
            const lessonSub = String(lesson.subgroup || "all");
            return lessonSub === "all" || lessonSub === "0";
        });

        // Якщо є урок для всієї групи - об'єднуємо
        if (allGroupLesson) return true;

        // Інакше перевіряємо, чи всі підгрупи мають однаковий урок
        let firstLesson = null;

        for (const sub of groupSubgroups) {
            const lesson = findLesson(slotId, sub.order);
            if (!lesson) return false; // Якщо хоч в однієї підгрупи немає уроку

            const lessonKey = `${lesson.subject?._id || lesson.subject}_${lesson.teacher?._id || lesson.teacher?.fullName}_${lesson.classroom?._id || lesson.classroom?.name}`;

            if (firstLesson === null) {
                firstLesson = lessonKey;
            } else if (firstLesson !== lessonKey) {
                return false; // Уроки різні
            }
        }

        return true; // Всі уроки однакові
    };

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 340 }}>
                <FaSpinner style={{ fontSize: 30, color: "rgba(105,180,185,1)", animation: "spin 1s linear infinite" }} />
                <p style={{ marginTop: 12, color: "#6b7280" }}>{t("common.loading")}</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#dc2626", padding: 20, textAlign: "center" }}>
                {error}
            </div>
        );
    }

    const timeSlots = activeDay ? (slotsByDay[activeDay._id.toString()] || []) : [];

    const renderSubgroups = showAllSubgroups && groupSubgroups.length > 0
        ? groupSubgroups
        : [{ order: studentSubgroup || 1, name: `${t("schedule.subgroup")} ${studentSubgroup || 1}` }];

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 12px" : "0" }}>
            {/* Картка студента */}
            <div style={{
                backgroundColor: "white", borderRadius: 12, padding: isMobile ? "14px 16px" : "16px 20px",
                marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb",
                display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap"
            }}>
                <FaCalendarAlt size={isMobile ? 20 : 24} color="rgba(105,180,185,1)" />
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 600, color: "#1f2937" }}>
                        {t("student.schedule.title")}
                    </h2>
                    <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>
                        {groupName || t("common.notSpecified")}
                        {studentSubgroup && !showAllSubgroups && (
                            <span style={{
                                marginLeft: 8, padding: "2px 8px", backgroundColor: "rgba(105,180,185,0.12)",
                                borderRadius: 12, fontSize: 12, color: "rgba(105,180,185,1)"
                            }}>
                                {t("student.schedule.subgroup")} {studentSubgroup}
                            </span>
                        )}
                    </p>
                </div>
                {groupSubgroups.length > 1 && (
                    <button
                        onClick={() => setShowAllSubgroups(!showAllSubgroups)}
                        style={{
                            padding: isMobile ? "6px 12px" : "8px 16px",
                            backgroundColor: showAllSubgroups ? "rgba(105,180,185,1)" : "white",
                            color: showAllSubgroups ? "white" : "rgba(105,180,185,1)",
                            border: "1px solid rgba(105,180,185,0.5)",
                            borderRadius: 8, cursor: "pointer", fontSize: isMobile ? 12 : 14,
                            display: "flex", alignItems: "center", gap: 6
                        }}
                    >
                        <FaUsers size={isMobile ? 12 : 14} />
                        {showAllSubgroups ? t("student.schedule.showMySubgroup") : t("student.schedule.showAllSubgroups")}
                    </button>
                )}
            </div>

            {/* Вкладки днів */}
            <div style={{ display: "flex", gap: isMobile ? 4 : 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
                {days.map(day => {
                    const isActive = activeDay?._id === day._id;
                    return (
                        <button
                            key={day._id}
                            onClick={() => setActiveDay(day)}
                            style={{
                                padding: isMobile ? "9px 13px" : "11px 22px",
                                backgroundColor: isActive ? "rgba(105,180,185,1)" : "white",
                                color: isActive ? "white" : "#374151",
                                border: isActive ? "none" : "1px solid #e5e7eb",
                                borderRadius: 8, cursor: "pointer", fontSize: isMobile ? 13 : 15,
                                fontWeight: isActive ? 600 : 400, whiteSpace: "nowrap", flexShrink: 0
                            }}
                        >
                            {isMobile ? day.nameShort : day.name}
                        </button>
                    );
                })}
            </div>

            {/* Таблиця розкладу */}
            <div style={{ backgroundColor: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <div style={{
                    padding: "13px 20px", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb",
                    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8
                }}>
                    <h3 style={{ margin: 0, fontSize: isMobile ? 15 : 17, fontWeight: 600, color: "rgba(105,180,185,1)" }}>
                        {activeDay?.name}
                        {timeSlots.length > 0 && (
                            <span style={{ marginLeft: 8, fontSize: 12, color: "#9ca3af" }}>
                                ({timeSlots.length} слотів)
                            </span>
                        )}
                    </h3>
                </div>

                {timeSlots.length === 0 ? (
                    <div style={{ textAlign: "center", padding: isMobile ? "50px 20px" : "70px 20px", color: "#9ca3af" }}>
                        <FaClock size={isMobile ? 34 : 42} style={{ marginBottom: 12, opacity: 0.35 }} />
                        <p>{t("student.schedule.noLessons")}</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                                    <th style={{ padding: isMobile ? "10px 8px" : "12px 14px", textAlign: "center", width: 60 }}>
                                        {t("student.schedule.number")}
                                    </th>
                                    <th style={{ padding: isMobile ? "10px 8px" : "12px 14px", textAlign: "center", width: 110 }}>
                                        {t("student.schedule.time")}
                                    </th>
                                    {showAllSubgroups && (
                                        <th style={{ padding: isMobile ? "10px 8px" : "12px 14px", textAlign: "center", width: 80 }}>
                                            {t("student.schedule.subgroup")}
                                        </th>
                                    )}
                                    <th style={{ padding: isMobile ? "10px 8px" : "12px 14px", textAlign: "left" }}>
                                        {t("student.schedule.subject")}
                                    </th>
                                    {!isMobile && (
                                        <th style={{ padding: "12px 14px", textAlign: "left" }}>
                                            {t("student.schedule.classroom")}
                                        </th>
                                    )}
                                    <th style={{ padding: isMobile ? "10px 8px" : "12px 14px", textAlign: "left" }}>
                                        {t("student.schedule.teacher")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map((slot, sIdx) => {
                                    const slotId = slot._id.toString();
                                    const shouldMerge = shouldMergeSubgroups(slotId);

                                    // Якщо потрібно об'єднати всі підгрупи
                                    if (showAllSubgroups && shouldMerge && groupSubgroups.length > 1) {
                                        const lesson = findLesson(slotId, groupSubgroups[0].order);
                                        const hasLesson = !!lesson;

                                        return (
                                            <tr key={`${slotId}_merged`} style={{
                                                borderBottom: "1px solid #f3f4f6",
                                                backgroundColor: sIdx % 2 === 0 ? "white" : "#fdfdfd"
                                            }}>
                                                <td style={{ textAlign: "center", verticalAlign: "middle", padding: isMobile ? "11px 8px" : "13px 14px" }}>
                                                    <span style={{
                                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                        width: 28, height: 28, borderRadius: "50%",
                                                        backgroundColor: hasLesson ? "rgba(105,180,185,0.15)" : "#f3f4f6",
                                                        color: hasLesson ? "rgba(105,180,185,1)" : "#d1d5db",
                                                        fontWeight: 700, fontSize: 13
                                                    }}>
                                                        {slot.order}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center", verticalAlign: "middle", padding: isMobile ? "11px 8px" : "13px 14px" }}>
                                                    <span style={{ fontWeight: 500 }}>{formatTime(slot.startTime)}</span>
                                                    <br />
                                                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{formatTime(slot.endTime)}</span>
                                                </td>
                                                {showAllSubgroups && (
                                                    <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", textAlign: "center", color: "#059669", fontWeight: 500 }}>
                                                        {t("student.schedule.allGroup")}
                                                    </td>
                                                )}
                                                <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", color: hasLesson ? "#1f2937" : "#d1d5db", fontWeight: hasLesson ? 500 : 400 }}>
                                                    {hasLesson ? (
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{lesson.subject?.name || lesson.subject || "—"}</div>
                                                            {isMobile && (
                                                                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                                                                    <FaDoorOpen size={10} /> {lesson.classroom?.name || "—"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : "—"}
                                                </td>
                                                {!isMobile && (
                                                    <td style={{ padding: "13px 14px", color: "#6b7280" }}>
                                                        {hasLesson ? (lesson.classroom?.name || lesson.classroom || "—") : "—"}
                                                    </td>
                                                )}
                                                <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", color: "#6b7280" }}>
                                                    {hasLesson ? (lesson.teacher?.fullName || lesson.teacher?.name || lesson.teacher || "—") : "—"}
                                                </td>
                                            </tr>
                                        );
                                    }

                                    // Стандартне відображення (окремі рядки для кожної підгрупи)
                                    return renderSubgroups.map((sub, subIdx) => {
                                        const lesson = findLesson(slotId, sub.order);
                                        const isFirstSub = subIdx === 0;
                                        const hasLesson = !!lesson;

                                        return (
                                            <tr key={`${slotId}_${sub.order}`} style={{
                                                borderBottom: subIdx === renderSubgroups.length - 1 ? "1px solid #f3f4f6" : "none",
                                                backgroundColor: !hasLesson ? "#fafafa" : (sIdx % 2 === 0 ? "white" : "#fdfdfd")
                                            }}>
                                                {isFirstSub && (
                                                    <>
                                                        <td rowSpan={renderSubgroups.length} style={{ textAlign: "center", verticalAlign: "middle", padding: isMobile ? "11px 8px" : "13px 14px" }}>
                                                            <span style={{
                                                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                                width: 28, height: 28, borderRadius: "50%",
                                                                backgroundColor: hasLesson ? "rgba(105,180,185,0.15)" : "#f3f4f6",
                                                                color: hasLesson ? "rgba(105,180,185,1)" : "#d1d5db",
                                                                fontWeight: 700, fontSize: 13
                                                            }}>
                                                                {slot.order}
                                                            </span>
                                                        </td>
                                                        <td rowSpan={renderSubgroups.length} style={{ textAlign: "center", verticalAlign: "middle", padding: isMobile ? "11px 8px" : "13px 14px" }}>
                                                            <span style={{ fontWeight: 500 }}>{formatTime(slot.startTime)}</span>
                                                            <br />
                                                            <span style={{ fontSize: 11, color: "#9ca3af" }}>{formatTime(slot.endTime)}</span>
                                                        </td>
                                                    </>
                                                )}
                                                {showAllSubgroups && (
                                                    <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", textAlign: "center" }}>
                                                        {sub.name || sub.order}
                                                    </td>
                                                )}
                                                <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", color: hasLesson ? "#1f2937" : "#d1d5db", fontWeight: hasLesson ? 500 : 400 }}>
                                                    {hasLesson ? (
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{lesson.subject?.name || lesson.subject || "—"}</div>
                                                            {isMobile && (
                                                                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                                                                    <FaDoorOpen size={10} /> {lesson.classroom?.name || "—"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : "—"}
                                                </td>
                                                {!isMobile && (
                                                    <td style={{ padding: "13px 14px", color: "#6b7280" }}>
                                                        {hasLesson ? (lesson.classroom?.name || lesson.classroom || "—") : "—"}
                                                    </td>
                                                )}
                                                <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", color: "#6b7280" }}>
                                                    {hasLesson ? (lesson.teacher?.fullName || lesson.teacher?.name || lesson.teacher || "—") : "—"}
                                                </td>
                                            </tr>
                                        );
                                    });
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default StudentScheduleTab;