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

    const initializeDays = async () => {
        try {
            setInitializing(true);
            await axios.post("http://localhost:3001/api/days/initialize");
            await loadDaysOfWeek();
            setError("");
        } catch (err) {
            setError("Не вдалося створити дні тижня");
        } finally {
            setInitializing(false);
        }
    };

    const loadDaysOfWeek = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/days/active");
            if (response.data && Array.isArray(response.data)) {
                setDaysOfWeek(response.data);
                if (response.data.length > 0 && !selectedDay) {
                    setSelectedDay(response.data[0].id);
                }
                setError("");
            } else {
                setDaysOfWeek([]);
            }
        } catch (err) {
            setDaysOfWeek([]);
        }
    };

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
            setTimeSlots([]);
            setError("Помилка при завантаженні часу уроків: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const loadDaysSummary = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/time-slots/days/summary");
            if (response.data && Array.isArray(response.data)) {
                setDaysSummary(response.data);
            } else {
                setDaysSummary([]);
            }
        } catch (err) {
            setDaysSummary([]);
        }
    };

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

    const handleDayChange = (dayId) => {
        setSelectedDay(dayId);
    };

    const getCurrentDay = () => {
        return daysOfWeek.find(day => day.id === selectedDay) || daysOfWeek[0] || { name: "Оберіть день" };
    };

    const handleSaveTimeSlots = async (newTimeSlots) => {
        try {
            setLoading(true);
            await axios.post("http://localhost:3001/api/time-slots", {
                dayOfWeekId: selectedDay,
                timeSlots: newTimeSlots
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
        try {
            await axios.delete(`http://localhost:3001/api/time-slots/${id}`);
            await loadTimeSlots();
            await loadDaysSummary();
        } catch (err) {
            setError(err.response?.data?.message || "Помилка при видаленні уроку");
        }
    };

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