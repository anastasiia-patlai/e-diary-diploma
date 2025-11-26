import React, { useState, useEffect } from "react";
import { Container, Alert } from "react-bootstrap";
import axios from "axios";

import TimeTabHeader from "./components/TimeTabHeader";
import DaysNavigation from "./components/DaysNavigation";
import TimeSlotsList from "./components/TimeSlotsList";
import TimeSettingsModal from "./components/TimeSettingsModal";

const TimeTab = () => {
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
            console.log("Database name встановлено:", dbName);
        } else {
            console.error("Database name не знайдено!");
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

            console.log("Дні тижня успішно створені:", response.data);
            await loadDaysOfWeek();
            setError("");

        } catch (err) {
            console.error("Помилка створення днів тижня:", err);

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
        if (!databaseName) {
            console.error("Database name відсутній для запиту днів тижня");
            return;
        }

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
                console.log("Дні тижня завантажені:", response.data.length);
            } else {
                setDaysOfWeek([]);
            }
        } catch (err) {
            console.error("Помилка завантаження днів тижня:", err);

            if (err.response?.status === 500 || err.code === 'ERR_NETWORK') {
                console.log("Використовуємо локальні дні тижня...");
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
        if (!dayId || !databaseName) {
            console.error("Day ID або database name відсутній для запиту часових слотів");
            return;
        }

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
                console.log("Часові слоти завантажені:", response.data.length);
            } else {
                setTimeSlots([]);
            }
        } catch (err) {
            console.error("Помилка при завантаженні часу уроків:", err);

            // Якщо API недоступне, використовуємо демо-дані
            if (err.response?.status === 500 || err.code === 'ERR_NETWORK') {
                console.log("Використовуємо демо часові слоти...");
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
        if (!databaseName) {
            console.error("Database name відсутній для запиту підсумків днів");
            return;
        }

        try {
            const response = await axios.get("http://localhost:3001/api/time-slots/days/summary", {
                params: { databaseName }
            });

            if (response.data && Array.isArray(response.data)) {
                setDaysSummary(response.data);
                console.log("Підсумки днів завантажені:", response.data.length);
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
            console.error("Database name відсутній для завантаження даних");
            setError("Не вказано базу даних");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");
            await loadDaysOfWeek();
            await loadDaysSummary();
            console.log("Всі дані успішно завантажені");
        } catch (err) {
            console.error("Error loading data:", err);
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

            console.log("Дані для відправки на сервер:", {
                dayOfWeekId: selectedDay,
                timeSlots: timeSlotsToSave,
                databaseName,
                selectedDayType: typeof selectedDay,
                timeSlotsCount: timeSlotsToSave.length,
                firstTimeSlot: timeSlotsToSave[0]
            });

            const response = await axios.post("http://localhost:3001/api/time-slots", {
                dayOfWeekId: selectedDay,
                timeSlots: timeSlotsToSave,
                databaseName
            });

            console.log("Успішна відповідь від сервера:", response.data);

            await loadTimeSlots();
            await loadDaysSummary();
            setShowModal(false);
            setError("");
        } catch (err) {
            console.error("Помилка збереження часових слотів:", err);
            console.error("Деталі помилки:", {
                status: err.response?.status,
                data: err.response?.data,
                message: err.response?.data?.message
            });
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
            console.error("Помилка видалення часового слоту:", err);
            setError(err.response?.data?.message || "Помилка при видаленні уроку");
        }
    };

    if (daysOfWeek.length === 0 && !loading) {
        return (
            <Container fluid style={{ padding: "0 0 24px 0" }}>
                {databaseName && (
                    <div style={{
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '10px',
                        padding: '5px 10px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px'
                    }}>
                        База даних: {databaseName}
                    </div>
                )}

                <div style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb"
                }}>
                    <h3 style={{ color: "#374151", marginBottom: "16px" }}>
                        Дні тижня не знайдені
                    </h3>
                    <p style={{ color: "#6b7280", marginBottom: "24px" }}>
                        Необхідно створити дні тижня для роботи з розкладом дзвінків
                    </p>
                    <button
                        onClick={createDaysOfWeek}
                        disabled={initializing}
                        style={{
                            backgroundColor: initializing ? '#9ca3af' : 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: initializing ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            transition: 'background-color 0.3s ease'
                        }}
                    >
                        {initializing ? 'Створення...' : 'Створити дні тижня'}
                    </button>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid style={{ padding: "0 0 24px 0" }}>
            {databaseName && (
                <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '4px'
                }}>
                    База даних: {databaseName}
                </div>
            )}

            <TimeTabHeader
                onShowModal={() => setShowModal(true)}
                currentDay={getCurrentDay()}
            />

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        borderRadius: "6px",
                        marginBottom: "16px"
                    }}
                >
                    {error}
                </Alert>
            )}

            <DaysNavigation
                days={daysOfWeek}
                selectedDay={selectedDay}
                onDayChange={handleDayChange}
                daysSummary={daysSummary}
            />

            <TimeSlotsList
                timeSlots={timeSlots}
                loading={loading}
                currentDay={getCurrentDay()}
                onDeleteTimeSlot={handleDeleteTimeSlot}
            />

            <TimeSettingsModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSaveTimeSlots}
                existingTimeSlots={timeSlots}
                currentDay={getCurrentDay()}
            />
        </Container>
    );
};

export default TimeTab;