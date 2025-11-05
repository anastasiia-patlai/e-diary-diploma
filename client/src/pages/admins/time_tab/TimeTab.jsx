import React, { useState, useEffect } from "react";
import { Container, Alert } from "react-bootstrap";
import axios from "axios";

// Імпорт компонентів
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

    // Функція для створення днів тижня
    const initializeDays = async () => {
        try {
            setInitializing(true);
            const response = await axios.post("http://localhost:3001/api/days/initialize");
            console.log("Дні тижня створені:", response.data.message);
            await loadDaysOfWeek(); // Перезавантажити дні після створення
            setError("");
        } catch (err) {
            console.error("Помилка створення днів тижня:", err);
            setError("Не вдалося створити дні тижня");
        } finally {
            setInitializing(false);
        }
    };

    // Завантажити дні тижня
    const loadDaysOfWeek = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/days/active");
            if (response.data && Array.isArray(response.data)) {
                setDaysOfWeek(response.data);
                // Встановити перший день як обраний за замовчуванням
                if (response.data.length > 0 && !selectedDay) {
                    setSelectedDay(response.data[0]._id);
                }
                setError("");
            } else {
                setDaysOfWeek([]);
            }
        } catch (err) {
            console.error("Error loading days of week:", err);
            // Не показуємо помилку тут - може бути, що дні ще не створені
            setDaysOfWeek([]);
        }
    };

    // Завантажити часові слоти для вибраного дня
    const loadTimeSlots = async (dayId = selectedDay) => {
        if (!dayId) return;

        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3001/api/time-slots?dayOfWeekId=${dayId}`);
            if (response.data && Array.isArray(response.data)) {
                setTimeSlots(response.data);
            } else {
                setTimeSlots([]);
            }
        } catch (err) {
            console.error("Error loading time slots:", err);
            setTimeSlots([]);
        } finally {
            setLoading(false);
        }
    };

    // Завантажити резюме по днях
    const loadDaysSummary = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/time-slots/days/summary");
            if (response.data && Array.isArray(response.data)) {
                setDaysSummary(response.data);
            } else {
                setDaysSummary([]);
            }
        } catch (err) {
            console.error("Error loading days summary:", err);
            setDaysSummary([]);
        }
    };

    // Завантажити всі дані
    const loadAllData = async () => {
        try {
            setLoading(true);
            await loadDaysOfWeek();
            await loadDaysSummary();
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        if (selectedDay) {
            loadTimeSlots();
        }
    }, [selectedDay]);

    // Обробник зміни дня
    const handleDayChange = (dayId) => {
        setSelectedDay(dayId);
    };

    // Отримати поточний день
    const getCurrentDay = () => {
        return daysOfWeek.find(day => day._id === selectedDay) || daysOfWeek[0] || { name: "Оберіть день" };
    };

    const handleSaveTimeSlots = async (newTimeSlots) => {
        try {
            setLoading(true);
            const response = await axios.post(
                "http://localhost:3001/api/time-slots",
                {
                    dayOfWeekId: selectedDay,
                    timeSlots: newTimeSlots
                }
            );
            await loadTimeSlots();
            await loadDaysSummary();
            setShowModal(false);
            setError("");
        } catch (err) {
            console.error("Error saving time slots:", err);
            console.error("Деталі помилки:", err.response?.data);
            setError(err.response?.data?.message || "Помилка при збереженні часу уроків");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTimeSlot = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/time-slots/${id}`);
            await loadTimeSlots();
            await loadDaysSummary();
        } catch (err) {
            console.error("Error deleting time slot:", err);
            setError(err.response?.data?.message || "Помилка при видаленні уроку");
        }
    };

    // Якщо дні не завантажилися, показуємо кнопку для створення
    if (daysOfWeek.length === 0 && !loading) {
        return (
            <Container fluid style={{ padding: "0 0 24px 0" }}>
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
                        onClick={initializeDays}
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