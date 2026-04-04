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
                const groupNameValue = student.group?.name || "";
                const subgroupValue = student.subgroup || null;

                if (!groupId) {
                    setError(t("schedule.errors.noDataFound"));
                    setLoading(false);
                    return;
                }

                setGroupName(groupNameValue);
                setStudentSubgroup(subgroupValue);

                const groupRes = await fetch(`/api/groups/${groupId}?databaseName=${encodeURIComponent(db)}`);
                if (groupRes.ok) {
                    const groupData = await groupRes.json();
                    if (groupData.subgroups && Array.isArray(groupData.subgroups) && groupData.subgroups.length > 0) {
                        setGroupSubgroups(groupData.subgroups);
                    }
                }

                const daysRes = await fetch(`/api/days/active?databaseName=${encodeURIComponent(db)}`);
                if (!daysRes.ok) throw new Error("Помилка завантаження днів");
                const daysData = await daysRes.json();

                if (!daysData || daysData.length === 0) {
                    setError(t("schedule.errors.noDataFound"));
                    setLoading(false);
                    return;
                }

                const slotsMap = {};
                for (const day of daysData) {
                    try {
                        const slotsRes = await fetch(`/api/time-slots?dayOfWeekId=${day.id}&databaseName=${encodeURIComponent(db)}`);
                        const slots = slotsRes.ok ? await slotsRes.json() : [];
                        slotsMap[day._id.toString()] = Array.isArray(slots) ? slots.sort((a, b) => a.order - b.order) : [];
                    } catch (err) {
                        slotsMap[day._id.toString()] = [];
                    }
                }

                const scheduleRes = await fetch(`/api/schedule/group/${groupId}?databaseName=${encodeURIComponent(db)}`);
                const scheduleData = scheduleRes.ok ? await scheduleRes.json() : [];

                const today = new Date().getDay();
                const todayId = today === 0 ? 7 : today;
                const activeDayData = daysData.find(d => d.id === todayId) || daysData[0];

                setDays(daysData);
                setSlotsByDay(slotsMap);
                setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
                setActiveDay(activeDayData);
                setLoading(false);

            } catch (err) {
                console.error("Помилка завантаження:", err);
                setError(t("schedule.errors.loadError"));
                setLoading(false);
            }
        };

        loadAllData();
    }, [userData?._id, userData?.id, getDatabaseName, t]);

    const getLessonsForDay = useCallback(() => {
        if (!schedule.length || !activeDay) return [];

        const activeDayId = activeDay._id?.toString();

        return schedule.filter(lesson => {
            const dayOfWeek = lesson.dayOfWeek;
            if (!dayOfWeek) return false;
            const dayId = typeof dayOfWeek === "object" ? dayOfWeek._id?.toString() : dayOfWeek?.toString();
            return dayId === activeDayId;
        }).sort((a, b) => (a.timeSlot?.order ?? 999) - (b.timeSlot?.order ?? 999));
    }, [schedule, activeDay]);

    const getSubgroupsList = () => {
        if (showAllSubgroups && groupSubgroups.length > 0) {
            return groupSubgroups;
        }
        if (studentSubgroup) {
            const found = groupSubgroups.find(sg => String(sg.order) === String(studentSubgroup));
            if (found) return [found];
            return [{ name: `${t("schedule.subgroup")} ${studentSubgroup}`, order: studentSubgroup }];
        }
        return [{ name: t("schedule.entireGroup"), order: 0 }];
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

    const allLessons = getLessonsForDay();
    const activeDayId = activeDay?._id?.toString();
    const timeSlots = activeDayId ? (slotsByDay[activeDayId] || []) : [];

    const lessonsMap = new Map();
    allLessons.forEach(lesson => {
        const timeSlotId = typeof lesson.timeSlot === "object" ? lesson.timeSlot?._id?.toString() : lesson.timeSlot?.toString();
        const subgroupId = lesson.subgroup || "all";
        lessonsMap.set(`${timeSlotId}_${subgroupId}`, lesson);
    });

    const subgroupsList = getSubgroupsList();
    const hasMultiple = groupSubgroups.length > 1;
    const showSubgroupColumn = hasMultiple && showAllSubgroups;

    const isAllGroupLesson = (timeSlotId) => {
        return lessonsMap.has(`${timeSlotId}_all`);
    };

    const getAllGroupLesson = (timeSlotId) => {
        return lessonsMap.get(`${timeSlotId}_all`);
    };

    const getSubgroupLesson = (timeSlotId, subgroupId) => {
        return lessonsMap.get(`${timeSlotId}_${subgroupId}`);
    };

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 12px" : "0" }}>

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
                {hasMultiple && (
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

            <div style={{ display: "flex", gap: isMobile ? 4 : 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
                {days.map(day => {
                    const isActive = activeDay?._id?.toString() === day._id?.toString();

                    const getTranslatedDayName = (dayName, isShort = false) => {
                        if (!dayName) return '';

                        const dayMap = {
                            'понеділок': isShort ? 'mondayShort' : 'monday',
                            'вівторок': isShort ? 'tuesdayShort' : 'tuesday',
                            'середа': isShort ? 'wednesdayShort' : 'wednesday',
                            'четвер': isShort ? 'thursdayShort' : 'thursday',
                            "п'ятниця": isShort ? 'fridayShort' : 'friday',
                            'пятниця': isShort ? 'fridayShort' : 'friday',
                            'субота': isShort ? 'saturdayShort' : 'saturday',
                            'monday': isShort ? 'mondayShort' : 'monday',
                            'tuesday': isShort ? 'tuesdayShort' : 'tuesday',
                            'wednesday': isShort ? 'wednesdayShort' : 'wednesday',
                            'thursday': isShort ? 'thursdayShort' : 'thursday',
                            'friday': isShort ? 'fridayShort' : 'friday',
                            'saturday': isShort ? 'saturdayShort' : 'saturday'
                        };

                        const key = dayMap[dayName?.toLowerCase()];
                        if (key) {
                            return t(`student.schedule.days.${key}`, { defaultValue: dayName });
                        }
                        return dayName;
                    };

                    const displayName = isMobile
                        ? getTranslatedDayName(day.name, true)
                        : getTranslatedDayName(day.name, false);

                    return (
                        <button
                            key={day._id}
                            onClick={() => setActiveDay(day)}
                            style={{
                                padding: isMobile ? "9px 13px" : "11px 22px",
                                backgroundColor: isActive ? "rgba(105,180,185,1)" : "white",
                                color: isActive ? "white" : "#374151",
                                border: isActive ? "none" : "1px solid #e5e7eb",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontSize: isMobile ? 13 : 15,
                                fontWeight: isActive ? 600 : 400,
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                transition: "all 0.18s"
                            }}
                        >
                            {displayName}
                        </button>
                    );
                })}
            </div>

            <div style={{ backgroundColor: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>

                <div style={{
                    padding: "13px 20px", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb",
                    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8
                }}>
                    <h3 style={{ margin: 0, fontSize: isMobile ? 15 : 17, fontWeight: 600, color: "rgba(105,180,185,1)" }}>
                        {t(`schedule.days.${activeDay?.name?.toLowerCase()}`, { defaultValue: activeDay?.name })}
                        {timeSlots.length > 0 && (
                            <span style={{ marginLeft: 8, fontSize: 12, color: "#9ca3af" }}>
                                ({timeSlots.length} {t("student.schedule.slotsCount")})
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
                                    {showSubgroupColumn && (
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
                                {timeSlots.map((slot, slotIdx) => {
                                    const hasAllGroupLesson = isAllGroupLesson(slot._id?.toString());
                                    const allGroupLesson = hasAllGroupLesson ? getAllGroupLesson(slot._id?.toString()) : null;

                                    if (hasAllGroupLesson && !showSubgroupColumn) {
                                        const lesson = allGroupLesson;
                                        const hasLesson = !!lesson;

                                        return (
                                            <tr key={`${slot._id}_all`} style={{
                                                borderBottom: "1px solid #f3f4f6",
                                                backgroundColor: slotIdx % 2 === 0 ? "white" : "#fdfdfd"
                                            }}>
                                                <td style={{ textAlign: "center", verticalAlign: "middle", padding: isMobile ? "11px 8px" : "13px 14px" }}>
                                                    <span style={{
                                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                        width: 28, height: 28, borderRadius: "50%",
                                                        backgroundColor: "rgba(105,180,185,0.15)",
                                                        color: "rgba(105,180,185,1)",
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
                                                <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", color: "#1f2937", fontWeight: 500 }}>
                                                    {hasLesson ? (lesson.subject?.name || lesson.subject || "—") : "—"}
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

                                    if (hasAllGroupLesson && showSubgroupColumn) {
                                        const lesson = allGroupLesson;
                                        const hasLesson = !!lesson;

                                        return (
                                            <tr key={`${slot._id}_all`} style={{
                                                borderBottom: "1px solid #f3f4f6",
                                                backgroundColor: slotIdx % 2 === 0 ? "white" : "#fdfdfd"
                                            }}>
                                                <td style={{ textAlign: "center", verticalAlign: "middle", padding: isMobile ? "11px 8px" : "13px 14px" }}>
                                                    <span style={{
                                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                        width: 28, height: 28, borderRadius: "50%",
                                                        backgroundColor: "rgba(105,180,185,0.15)",
                                                        color: "rgba(105,180,185,1)",
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
                                                <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", textAlign: "center", color: "#059669", fontWeight: 500 }}>
                                                    {t("student.schedule.allGroup")}
                                                </td>
                                                <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", color: "#1f2937", fontWeight: 500 }}>
                                                    {hasLesson ? (lesson.subject?.name || lesson.subject || "—") : "—"}
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

                                    return subgroupsList.map((subgroupItem, subIdx) => {
                                        const subgroupKey = subgroupItem.order || subgroupItem.id || "all";
                                        const lesson = getSubgroupLesson(slot._id?.toString(), subgroupKey);
                                        const hasLesson = !!lesson;
                                        const isFirst = subIdx === 0;

                                        return (
                                            <tr key={`${slot._id}_${subgroupKey}`} style={{
                                                borderBottom: subIdx === subgroupsList.length - 1 ? "1px solid #f3f4f6" : "none",
                                                backgroundColor: !hasLesson ? "#fafafa" : (slotIdx % 2 === 0 ? "white" : "#fdfdfd")
                                            }}>
                                                {isFirst && (
                                                    <>
                                                        <td rowSpan={subgroupsList.length} style={{ textAlign: "center", verticalAlign: "middle", padding: isMobile ? "11px 8px" : "13px 14px" }}>
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
                                                        <td rowSpan={subgroupsList.length} style={{ textAlign: "center", verticalAlign: "middle", padding: isMobile ? "11px 8px" : "13px 14px" }}>
                                                            <span style={{ fontWeight: 500 }}>{formatTime(slot.startTime)}</span>
                                                            <br />
                                                            <span style={{ fontSize: 11, color: "#9ca3af" }}>{formatTime(slot.endTime)}</span>
                                                        </td>
                                                    </>
                                                )}
                                                {showSubgroupColumn && (
                                                    <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", textAlign: "center" }}>
                                                        {subgroupItem.name || `${t("schedule.subgroup")} ${subgroupItem.order}`}
                                                    </td>
                                                )}
                                                <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", color: hasLesson ? "#1f2937" : "#d1d5db", fontWeight: hasLesson ? 500 : 400 }}>
                                                    {hasLesson ? (lesson.subject?.name || lesson.subject || "—") : "—"}
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