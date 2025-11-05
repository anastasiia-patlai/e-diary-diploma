import React, { useState, useEffect } from "react";
import { Container, Alert } from "react-bootstrap";
import axios from "axios";

import TimeTabHeader from "./components/TimeTabHeader";
import TimeSlotsList from "./components/TimeSlotsList";
import TimeSettingsModal from "./components/TimeSettingsModal";

const TimeTab = () => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);

    // ЗАВАНТАЖИТИ ВСІ СЛОТИ ЧАСУ
    const loadTimeSlots = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:3001/api/time-slots");
            if (response.data && Array.isArray(response.data)) {
                setTimeSlots(response.data);
            } else {
                setTimeSlots([]);
            }
            setError("");
        } catch (err) {
            console.error("Error loading time slots:", err);
            setTimeSlots([]);
            if (err.response?.status === 404) {
                setError("Сервер не відповідає. Перевірте, чи запущено бекенд.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTimeSlots();
    }, []);

    const handleSaveTimeSlots = async (newTimeSlots) => {
        try {
            setLoading(true);
            const response = await axios.post(
                "http://localhost:3001/api/time-slots",
                { timeSlots: newTimeSlots }
            );
            setTimeSlots(response.data);
            setShowModal(false);
            setError("");
        } catch (err) {
            console.error("Error saving time slots:", err);
            if (err.response?.status === 404) {
                setError("Сервер не знайдено. Перевірте URL та запуск бекенду.");
            } else {
                setError("Помилка при збереженні часу уроків: " + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTimeSlot = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/time-slots/${id}`);
            loadTimeSlots();
        } catch (err) {
            console.error("Error deleting time slot:", err);
            if (err.response?.status === 404) {
                setError("Сервер не знайдено. Перевірте URL та запуск бекенду.");
            } else {
                setError("Помилка при видаленні уроку: " + (err.response?.data?.message || err.message));
            }
        }
    };


    return (
        <Container fluid style={{ padding: "0 0 24px 0" }}>
            <TimeTabHeader onShowModal={() => setShowModal(true)} />

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

            <TimeSlotsList
                timeSlots={timeSlots}
                loading={loading}
                onDeleteTimeSlot={handleDeleteTimeSlot}
            />

            <TimeSettingsModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSaveTimeSlots}
                existingTimeSlots={timeSlots}
            />
        </Container>
    );
};

export default TimeTab;