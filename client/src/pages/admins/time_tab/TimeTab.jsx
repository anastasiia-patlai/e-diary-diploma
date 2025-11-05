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
    const [daysSummary, setDaysSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);

    const daysOfWeek = [
        { id: 1, name: "Понеділок" },
        { id: 2, name: "Вівторок" },
        { id: 3, name: "Середа" },
        { id: 4, name: "Четвер" },
        { id: 5, name: "П'ятниця" },
        { id: 6, name: "Субота" },
        { id: 7, name: "Неділя" }
    ];

    const getCurrentDay = () => {
        return daysOfWeek.find(day => day.id === selectedDay) || daysOfWeek[0];
    };

    const loadTimeSlots = async (day = selectedDay) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3001/api/time-slots?dayOfWeek=${day}`);
            if (response.data && Array.isArray(response.data)) {
                setTimeSlots(response.data);
            } else {
                setTimeSlots([]);
            }
            setError("");
        } catch (err) {
            console.error("Error loading time slots:", err);
            setTimeSlots([]);
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
            console.error("Error loading days summary:", err);
            setDaysSummary([]);
        }
    };

    useEffect(() => {
        loadTimeSlots();
        loadDaysSummary();
    }, []);

    const handleDayChange = (dayId) => {
        setSelectedDay(dayId);
        loadTimeSlots(dayId);
    };

    const handleSaveTimeSlots = async (newTimeSlots) => {
        try {
            setLoading(true);
            const response = await axios.post(
                "http://localhost:3001/api/time-slots",
                {
                    dayOfWeek: selectedDay,
                    timeSlots: newTimeSlots
                }
            );
            await loadTimeSlots();
            await loadDaysSummary();
            setShowModal(false);
            setError("");
        } catch (err) {
            console.error("Error saving time slots:", err);
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