import React, { useState, useEffect } from "react";
import axios from "axios";
import TimeTabHeader from "./components/TimeTabHeader";
import DaysNavigation from "./components/DaysNavigation";
import TimeSlotsList from "./components/TimeSlotsList";
import TimeSettingsModal from "./components/TimeSettingsModal";

const TimeTab = ({ isMobile = false }) => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [daysOfWeek, setDaysOfWeek] = useState([]);
    const [daysSummary, setDaysSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState("");
    const [databaseName, setDatabaseName] = useState("");

    useEffect(() => {
        const getCurrentDatabase = () => {
            let dbName = localStorage.getItem('databaseName');

            if (!dbName) {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        if (user.databaseName) {
                            dbName = user.databaseName;
                        }
                    } catch (e) {
                        console.error("Помилка парсингу user:", e);
                    }
                }
            }

            if (!dbName) {
                const userInfoStr = localStorage.getItem('userInfo');
                if (userInfoStr) {
                    try {
                        const userInfo = JSON.parse(userInfoStr);
                        if (userInfo.databaseName) {
                            dbName = userInfo.databaseName;
                        }
                    } catch (e) {
                        console.error("Помилка парсингу userInfo:", e);
                    }
                }
            }

            return dbName;
        };

        const dbName = getCurrentDatabase();
        if (dbName) {
            setDatabaseName(dbName);
        } else {
            setError("Не вдалося визначити базу даних школи");
            setLoading(false);
        }
    }, []);

    const createDaysOfWeek = async () => {
        if (!databaseName) {
            setError("Не вказано базу даних");
            return;
        }

        try {
            setInitializing(true);
            const response = await axios.post("http://localhost:3001/api/days/initialize", {
                databaseName
            });

            await loadDaysOfWeek();
            setError("");
        } catch (err) {
            if (err.response?.status === 400 && err.response?.data?.message?.includes('вже ініціалізовані')) {
                await loadDaysOfWeek();
                setError("");
            } else {
                setError("Не вдалося створити дні тижня: " + (err.response?.data?.message || err.message));
            }
        } finally {
            setInitializing(false);
        }
    };

    const loadDaysOfWeek = async () => {
        if (!databaseName) return;

        try {
            const response = await axios.get("http://localhost:3001/api/days/active", {
                params: { databaseName }
            });

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setDaysOfWeek(response.data);
                if (!selectedDay) {
                    setSelectedDay(response.data[0].id);
                }
                setError("");
            } else {
                setDaysOfWeek([]);
            }
        } catch (err) {
            if (err.response?.status === 500 || err.code === 'ERR_NETWORK') {
                const localDays = [
                    { id: "1", name: "Понеділок", order: 1, isActive: true },
                    { id: "2", name: "Вівторок", order: 2, isActive: true },
                    { id: "3", name: "Середа", order: 3, isActive: true },
                    { id: "4", name: "Четвер", order: 4, isActive: true },
                    { id: "5", name: "П'ятниця", order: 5, isActive: true }
                ];
                setDaysOfWeek(localDays);
                if (!selectedDay) {
                    setSelectedDay("1");
                }
            } else {
                setDaysOfWeek([]);
            }
        }
    };

    const loadTimeSlots = async (dayId = selectedDay) => {
        if (!dayId || !databaseName) return;

        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3001/api/time-slots`, {
                params: {
                    dayOfWeekId: dayId,
                    databaseName
                }
            });

            if (response.data && Array.isArray(response.data)) {
                setTimeSlots(response.data);
            } else {
                setTimeSlots([]);
            }
        } catch (err) {
            if (err.response?.status === 500 || err.code === 'ERR_NETWORK') {
                const demoTimeSlots = [
                    { id: "1", order: 1, startTime: "08:00", endTime: "08:45", isActive: true },
                    { id: "2", order: 2, startTime: "09:00", endTime: "09:45", isActive: true },
                    { id: "3", order: 3, startTime: "10:00", endTime: "10:45", isActive: true }
                ];
                setTimeSlots(demoTimeSlots);
            } else {
                setTimeSlots([]);
                setError("Помилка при завантаженні часу уроків: " + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const loadDaysSummary = async () => {
        if (!databaseName) return;

        try {
            const response = await axios.get("http://localhost:3001/api/time-slots/days/summary", {
                params: { databaseName }
            });

            if (response.data && Array.isArray(response.data)) {
                setDaysSummary(response.data);
            } else {
                setDaysSummary([]);
            }
        } catch (err) {
            console.error("Помилка завантаження підсумків днів:", err);
            setDaysSummary([]);
        }
    };

    const loadAllData = async () => {
        if (!databaseName) {
            setError("Не вказано базу даних");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");
            await loadDaysOfWeek();
            await loadDaysSummary();
        } catch (err) {
            setError("Помилка при завантаженні даних: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (databaseName) {
            loadAllData();
        }
    }, [databaseName]);

    useEffect(() => {
        if (selectedDay && databaseName) {
            loadTimeSlots();
        }
    }, [selectedDay, databaseName]);

    const handleDayChange = (dayId) => {
        setSelectedDay(dayId);
    };

    const getCurrentDay = () => {
        return daysOfWeek.find(day => day.id === selectedDay) || daysOfWeek[0] || { name: "Оберіть день" };
    };

    const handleSaveTimeSlots = async (timeSlotsToSave) => {
        if (!databaseName) {
            setError("Не вказано базу даних");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("http://localhost:3001/api/time-slots", {
                dayOfWeekId: selectedDay,
                timeSlots: timeSlotsToSave,
                databaseName
            });

            await loadTimeSlots();
            await loadDaysSummary();
            setShowModal(false);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Помилка при збереженні часу уроків");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTimeSlot = async (id) => {
        if (!databaseName) {
            setError("Не вказано базу даних");
            return;
        }

        try {
            await axios.delete(`http://localhost:3001/api/time-slots/${id}`, {
                data: { databaseName }
            });
            await loadTimeSlots();
            await loadDaysSummary();
        } catch (err) {
            setError(err.response?.data?.message || "Помилка при видаленні уроку");
        }
    };

    if (daysOfWeek.length === 0 && !loading) {
        return (
            <div style={{ padding: isMobile ? "12px" : "0 0 24px 0" }}>
                <div style={{
                    textAlign: "center",
                    padding: isMobile ? "40px 20px" : "60px 20px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb"
                }}>
                    <h3 style={{
                        color: "#374151",
                        marginBottom: "16px",
                        fontSize: isMobile ? "18px" : "20px"
                    }}>
                        Дні тижня не знайдені
                    </h3>
                    <p style={{
                        color: "#6b7280",
                        marginBottom: isMobile ? "20px" : "24px",
                        fontSize: isMobile ? "14px" : "16px"
                    }}>
                        Необхідно створити дні тижня для роботи з розкладом дзвінків
                    </p>
                    <button
                        onClick={createDaysOfWeek}
                        disabled={initializing}
                        style={{
                            backgroundColor: initializing ? '#9ca3af' : 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            padding: isMobile ? '10px 20px' : '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: initializing ? 'not-allowed' : 'pointer',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: '600',
                            transition: 'background-color 0.3s ease'
                        }}
                    >
                        {initializing ? 'Створення...' : 'Створити дні тижня'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: isMobile ? "12px" : "0 0 24px 0" }}>
            <TimeTabHeader
                onShowModal={() => setShowModal(true)}
                currentDay={getCurrentDay()}
                isMobile={isMobile}
            />

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: isMobile ? '10px 12px' : '12px 16px',
                    borderRadius: '6px',
                    marginBottom: isMobile ? '12px' : '16px',
                    fontSize: isMobile ? '13px' : '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span>⚠️</span>
                    {error}
                </div>
            )}

            <DaysNavigation
                days={daysOfWeek}
                selectedDay={selectedDay}
                onDayChange={handleDayChange}
                daysSummary={daysSummary}
                isMobile={isMobile}
            />

            <TimeSlotsList
                timeSlots={timeSlots}
                loading={loading}
                currentDay={getCurrentDay()}
                onDeleteTimeSlot={handleDeleteTimeSlot}
                isMobile={isMobile}
            />

            <TimeSettingsModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSaveTimeSlots}
                existingTimeSlots={timeSlots}
                currentDay={getCurrentDay()}
                isMobile={isMobile}
            />
        </div>
    );
};

export default TimeTab;