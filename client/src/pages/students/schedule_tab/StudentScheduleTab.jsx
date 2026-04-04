import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    FaCalendarAlt, FaClock, FaChalkboardTeacher,
    FaBook, FaDoorOpen, FaListOl, FaUserGraduate, FaSpinner
} from "react-icons/fa";

const fmt = (t) => {
    if (!t) return "—";
    const p = t.split(":");
    return p.length >= 2 ? `${p[0]}:${p[1]}` : t;
};

const StudentScheduleTab = ({ userData, databaseName: dbProp, isMobile: mobileProp }) => {
    const { t } = useTranslation();

    const [days, setDays] = useState([]);
    const [slotsByDay, setSlotsByDay] = useState({});
    const [schedule, setSchedule] = useState([]);
    const [activeDay, setActiveDay] = useState(null);
    const [subgroup, setSubgroup] = useState(null);
    const [groupName, setGroupName] = useState("");
    const [status, setStatus] = useState("loading");
    const [errorMsg, setErrorMsg] = useState("");
    const [isMobile, setIsMobile] = useState(mobileProp ?? window.innerWidth <= 768);

    useEffect(() => {
        if (mobileProp !== undefined) setIsMobile(mobileProp);
    }, [mobileProp]);

    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    const getDb = () =>
        dbProp || JSON.parse(localStorage.getItem("userInfo") || "{}").databaseName || "";

    useEffect(() => {
        const load = async () => {
            const db = getDb();
            const userId = userData?._id || userData?.id;

            if (!db || !userId) {
                setErrorMsg(t("student.errors.noDataFound"));
                setStatus("error");
                return;
            }

            try {
                setStatus("loading");

                /* 1. Отримати дані студента — знаходимо groupId */
                const stuRes = await fetch(`/api/users/${userId}?databaseName=${encodeURIComponent(db)}`);
                if (!stuRes.ok) throw new Error(`Users HTTP ${stuRes.status}`);
                const student = await stuRes.json();

                console.log("👤 Студент:", student);

                // groupId може бути рядком або populate'd об'єктом
                const groupId = student.group?._id || student.group || userData?.group?._id || userData?.group;
                const gName = student.group?.name || userData?.group?.name || "";
                const stuSubgroup = student.subgroup || userData?.subgroup || null;

                if (!groupId) {
                    setErrorMsg(t("student.errors.noDataFound"));
                    setStatus("error");
                    return;
                }

                setGroupName(gName);
                setSubgroup(stuSubgroup);
                console.log(`📚 Група: ${groupId} (${gName}), підгрупа: ${stuSubgroup}`);

                /* 2. Активні дні тижня з БД */
                const daysRes = await fetch(`/api/days/active?databaseName=${encodeURIComponent(db)}`);
                if (!daysRes.ok) throw new Error(`Days HTTP ${daysRes.status}`);
                const daysData = await daysRes.json();

                if (!Array.isArray(daysData) || daysData.length === 0) {
                    setErrorMsg(t("student.errors.noDataFound"));
                    setStatus("error");
                    return;
                }

                console.log(`📅 Днів з БД: ${daysData.length}`, daysData.map(d => d.name));

                const slotResults = await Promise.all(
                    daysData.map(async (day) => {
                        try {
                            const r = await fetch(
                                `/api/time-slots?dayOfWeekId=${day.id}&databaseName=${encodeURIComponent(db)}`
                            );
                            const slots = r.ok ? await r.json() : [];
                            const sorted = Array.isArray(slots)
                                ? slots.sort((a, b) => a.order - b.order)
                                : [];
                            console.log(`⏰ ${day.name}: ${sorted.length} слотів`);
                            // Ключ — MongoDB _id дня (саме він зберігається в Schedule.dayOfWeek)
                            return { key: day._id.toString(), slots: sorted };
                        } catch {
                            return { key: day._id.toString(), slots: [] };
                        }
                    })
                );

                const slotsMap = {};
                slotResults.forEach(({ key, slots }) => { slotsMap[key] = slots; });

                /* 4. Розклад для групи */
                const schRes = await fetch(
                    `/api/schedule/group/${groupId}?databaseName=${encodeURIComponent(db)}`
                );
                if (!schRes.ok) throw new Error(`Schedule HTTP ${schRes.status}`);
                const schData = await schRes.json();

                console.log(`📋 Уроків у розкладі: ${Array.isArray(schData) ? schData.length : 0}`);
                if (Array.isArray(schData) && schData.length > 0) {
                    const ex = schData[0];
                    console.log("Приклад уроку:", {
                        subject: ex.subject,
                        dayOfWeek: ex.dayOfWeek,
                        timeSlot: ex.timeSlot,
                        subgroup: ex.subgroup
                    });
                }

                const totalSlots = Object.values(slotsMap).reduce((s, arr) => s + arr.length, 0);
                if (totalSlots === 0 && Array.isArray(schData) && schData.length > 0) {
                    console.warn("⚠️ timetab порожній — будуємо слоти з розкладу групи");
                    const fallbackMap = {};
                    schData.forEach(lesson => {
                        const ts = lesson.timeSlot;
                        const dw = lesson.dayOfWeek;
                        if (!ts || typeof ts !== "object" || !dw || typeof dw !== "object") return;
                        const dayKey = dw._id?.toString();
                        if (!dayKey) return;
                        if (!fallbackMap[dayKey]) fallbackMap[dayKey] = new Map();
                        const tsKey = ts._id?.toString();
                        if (tsKey && !fallbackMap[dayKey].has(tsKey)) {
                            fallbackMap[dayKey].set(tsKey, {
                                _id: ts._id,
                                order: ts.order,
                                startTime: ts.startTime,
                                endTime: ts.endTime
                            });
                        }
                    });
                    Object.keys(fallbackMap).forEach(dayKey => {
                        slotsMap[dayKey] = Array.from(fallbackMap[dayKey].values())
                            .sort((a, b) => a.order - b.order);
                    });
                    console.log("✅ Fallback слоти побудовано для днів:", Object.keys(fallbackMap).length);
                }

                const todayIso = new Date().getDay();           // 0=нд,1=пн…
                const todayDbId = todayIso === 0 ? 7 : todayIso; // DayOfWeek.id
                const today = daysData.find(d => d.id === todayDbId) || daysData[0];

                setDays(daysData);
                setSlotsByDay(slotsMap);
                setSchedule(Array.isArray(schData) ? schData : []);
                setActiveDay(today);
                setStatus("ok");

            } catch (err) {
                console.error("❌ Помилка завантаження:", err);
                setErrorMsg(t("student.errors.loadError"));
                setStatus("error");
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData?._id, userData?.id]);

    const getLessons = () => {
        if (!schedule.length || !activeDay) return [];

        return schedule
            .filter(lesson => {
                const ld = lesson.dayOfWeek;
                if (!ld) return false;
                // dayOfWeek populate'd → об'єкт з _id
                const ldId = typeof ld === "object" ? ld._id?.toString() : ld.toString();
                return ldId === activeDay._id?.toString();
            })
            .filter(lesson => {
                const ls = lesson.subgroup;
                // subgroup 'all' або порожній → для всієї групи, показуємо завжди
                if (!ls || ls === "all" || ls === "0") return true;
                // якщо підгрупа студента невідома → показуємо всі уроки
                if (!subgroup) return true;
                return String(ls) === String(subgroup);
            })
            .sort((a, b) => (a.timeSlot?.order ?? 999) - (b.timeSlot?.order ?? 999));
    };

    /* ── рендер ─────────────────────────────────────────────── */
    if (status === "loading") {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 340 }}>
                <FaSpinner style={{ fontSize: 30, color: "rgba(105,180,185,1)", animation: "spin 1s linear infinite" }} />
                <p style={{ marginTop: 12, color: "#6b7280" }}>{t("common.loading")}</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#dc2626", padding: 20, textAlign: "center" }}>
                {errorMsg}
            </div>
        );
    }

    const lessons = getLessons();
    const activeSlots = activeDay ? (slotsByDay[activeDay._id?.toString()] || []) : [];

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "0 12px" : "0" }}>

            {/* ── Картка студента ── */}
            <div style={{
                backgroundColor: "white", borderRadius: 12, padding: isMobile ? "14px 16px" : "16px 20px",
                marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb",
                display: "flex", alignItems: "center", gap: 14
            }}>
                <FaCalendarAlt size={isMobile ? 20 : 24} color="rgba(105,180,185,1)" />
                <div>
                    <h2 style={{ margin: 0, fontSize: isMobile ? 17 : 20, fontWeight: 600, color: "#1f2937" }}>
                        {t("student.schedule.title")}
                    </h2>
                    <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span>{groupName || t("common.notSpecified")}</span>
                        {subgroup && (
                            <span style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                padding: "2px 8px", backgroundColor: "rgba(105,180,185,0.12)",
                                borderRadius: 12, fontSize: 12, color: "rgba(105,180,185,1)"
                            }}>
                                <FaUserGraduate size={10} />
                                {t("student.schedule.subgroup")} {subgroup}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* ── Вкладки днів (з БД) ── */}
            <div style={{ display: "flex", gap: isMobile ? 4 : 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
                {days.map(day => {
                    const isActive = activeDay?._id?.toString() === day._id?.toString();

                    // Функція для перекладу назв днів
                    const getTranslatedDayName = (dayName, isShort = false) => {
                        if (!dayName) return '';

                        // Мапа для відповідності назв з БД до ключів перекладу
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
                            // Використовуємо правильний шлях: student.schedule.days
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

            {/* ── Таблиця розкладу ── */}
            <div style={{ backgroundColor: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>

                {/* заголовок */}
                <div style={{
                    padding: "13px 20px", backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8
                }}>
                    <h3 style={{ margin: 0, fontSize: isMobile ? 15 : 17, fontWeight: 600, color: "rgba(105,180,185,1)" }}>
                        {activeDay?.name}
                        {activeSlots.length > 0 && (
                            <span style={{ marginLeft: 8, fontSize: 12, color: "#9ca3af", fontWeight: 400 }}>
                                ({activeSlots.length} {isMobile ? t("student.schedule.timeSlotsShort") : t("student.schedule.timeSlots")})
                            </span>
                        )}
                    </h3>
                    {subgroup && (
                        <span style={{ fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", gap: 5 }}>
                            <FaUserGraduate size={12} color="rgba(105,180,185,1)" />
                            {t("student.schedule.showingForSubgroup")} {subgroup}
                        </span>
                    )}
                </div>

                {/* немає слотів */}
                {activeSlots.length === 0 ? (
                    <div style={{ textAlign: "center", padding: isMobile ? "50px 20px" : "70px 20px", color: "#9ca3af" }}>
                        <FaClock size={isMobile ? 34 : 42} style={{ marginBottom: 12, opacity: 0.35 }} />
                        <p style={{ fontSize: isMobile ? 14 : 15, margin: 0 }}>{t("student.schedule.noLessons")}</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? 320 : 580 }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                                    {/* № */}
                                    <th style={{ padding: isMobile ? "10px 8px" : "12px 14px", textAlign: "center", fontWeight: 600, color: "#374151", fontSize: isMobile ? 12 : 13, width: isMobile ? 42 : 58 }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                            <FaListOl size={isMobile ? 10 : 12} />{t("student.schedule.number")}
                                        </span>
                                    </th>
                                    {/* Час */}
                                    <th style={{ padding: isMobile ? "10px 8px" : "12px 14px", textAlign: "center", fontWeight: 600, color: "#374151", fontSize: isMobile ? 12 : 13, width: isMobile ? 72 : 110 }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                            <FaClock size={isMobile ? 10 : 12} />{t("student.schedule.time")}
                                        </span>
                                    </th>
                                    {/* Предмет */}
                                    <th style={{ padding: isMobile ? "10px 8px" : "12px 14px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: isMobile ? 12 : 13 }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                            <FaBook size={isMobile ? 10 : 12} />{t("student.schedule.subject")}
                                        </span>
                                    </th>
                                    {/* Кабінет — тільки desktop */}
                                    {!isMobile && (
                                        <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 13 }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                <FaDoorOpen size={12} />{t("student.schedule.classroom")}
                                            </span>
                                        </th>
                                    )}
                                    {/* Вчитель */}
                                    <th style={{ padding: isMobile ? "10px 8px" : "12px 14px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: isMobile ? 12 : 13 }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                            <FaChalkboardTeacher size={isMobile ? 10 : 12} />{t("student.schedule.teacher")}
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/*
                                  Перебираємо ВСІ часові слоти активного дня.
                                  Для кожного слоту шукаємо урок у розкладі групи:
                                    lesson.timeSlot._id === slot._id
                                  Якщо урок є — показуємо його дані.
                                  Якщо немає — рядок порожній (вікно).
                                */}
                                {activeSlots.map((slot, idx) => {
                                    // Пошук уроку для цього слоту
                                    const lesson = lessons.find(l => {
                                        const tsId = typeof l.timeSlot === "object"
                                            ? l.timeSlot?._id?.toString()
                                            : l.timeSlot?.toString();
                                        return tsId === slot._id?.toString();
                                    });

                                    const hasLesson = !!lesson;

                                    return (
                                        <tr key={slot._id} style={{
                                            borderBottom: "1px solid #f3f4f6",
                                            backgroundColor: hasLesson
                                                ? (idx % 2 === 0 ? "white" : "#fdfdfd")
                                                : "#fafafa"
                                        }}>
                                            {/* № слоту */}
                                            <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", textAlign: "center" }}>
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

                                            {/* Час зі слоту — завжди є */}
                                            <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", textAlign: "center", color: "#6b7280", fontSize: isMobile ? 11 : 13 }}>
                                                <span style={{ fontWeight: 500, color: "#374151" }}>{fmt(slot.startTime)}</span>
                                                <br />
                                                <span style={{ fontSize: 11, color: "#9ca3af" }}>{fmt(slot.endTime)}</span>
                                            </td>

                                            {/* Предмет */}
                                            <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", color: hasLesson ? "#1f2937" : "#d1d5db", fontWeight: hasLesson ? 500 : 400, fontSize: isMobile ? 13 : 14 }}>
                                                {hasLesson ? (
                                                    <>
                                                        {lesson.subject?.name || lesson.subject || "—"}
                                                        {lesson.subgroup && lesson.subgroup !== "all" && lesson.subgroup !== "0" && (
                                                            <span style={{
                                                                marginLeft: 6, fontSize: 10,
                                                                color: "rgba(105,180,185,1)",
                                                                backgroundColor: "rgba(105,180,185,0.1)",
                                                                padding: "1px 6px", borderRadius: 8
                                                            }}>
                                                                ({t("student.schedule.subgroup")} {lesson.subgroup})
                                                            </span>
                                                        )}
                                                    </>
                                                ) : "—"}
                                            </td>

                                            {/* Кабінет (desktop) */}
                                            {!isMobile && (
                                                <td style={{ padding: "13px 14px", color: "#6b7280", fontSize: 13 }}>
                                                    {hasLesson ? (lesson.classroom?.name || lesson.classroom || "—") : "—"}
                                                </td>
                                            )}

                                            {/* Вчитель */}
                                            <td style={{ padding: isMobile ? "11px 8px" : "13px 14px", color: "#6b7280", fontSize: isMobile ? 12 : 13 }}>
                                                {hasLesson
                                                    ? (lesson.teacher?.fullName || lesson.teacher?.name || lesson.teacher || "—")
                                                    : "—"}
                                            </td>
                                        </tr>
                                    );
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