import React, { useState, useEffect } from "react";
import { Container, Alert } from "react-bootstrap";
import axios from "axios";

import ClassroomsHeader from "./components/ClassroomsHeader";
import ClassroomsList from "./components/ClassroomsList";
import ClassroomModal from "./components/ClassroomModal";

const ClassroomsTab = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingClassroom, setEditingClassroom] = useState(null);

    const loadClassrooms = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:3001/api/classrooms");
            if (response.data && Array.isArray(response.data)) {
                setClassrooms(response.data);
            } else {
                setClassrooms([]);
            }
            setError("");
        } catch (err) {
            console.error("Error loading classrooms:", err);
            setError("Помилка при завантаженні аудиторій");
            setClassrooms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClassrooms();
    }, []);

    const handleShowCreateModal = () => {
        setEditingClassroom(null);
        setShowModal(true);
    };

    const handleShowEditModal = (classroom) => {
        setEditingClassroom(classroom);
        setShowModal(true);
    };

    const handleSaveClassroom = async (classroomData) => {
        try {
            setLoading(true);
            let response;

            if (editingClassroom) {
                // ОНОВЛЕННЯ ІСНУЮЧОЇ АУДИТОРІЇ
                response = await axios.put(
                    `http://localhost:3001/api/classrooms/${editingClassroom._id}`,
                    classroomData
                );
            } else {
                // СТВОРЕННЯ НОВОЇ АУДИТОРІЇ
                response = await axios.post(
                    "http://localhost:3001/api/classrooms",
                    classroomData
                );
            }

            await loadClassrooms();
            setShowModal(false);
            setEditingClassroom(null);
            setError("");
        } catch (err) {
            console.error("Error saving classroom:", err);
            setError(err.response?.data?.message || "Помилка при збереженні аудиторії");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClassroom = async (id) => {
        if (!window.confirm("Ви впевнені, що хочете видалити цю аудиторію?")) {
            return;
        }

        try {
            await axios.delete(`http://localhost:3001/api/classrooms/${id}`);
            await loadClassrooms();
            setError("");
        } catch (err) {
            console.error("Error deleting classroom:", err);
            setError(err.response?.data?.message || "Помилка при видаленні аудиторії");
        }
    };

    const handleToggleClassroom = async (id) => {
        try {
            await axios.patch(`http://localhost:3001/api/classrooms/${id}/toggle`);
            await loadClassrooms();
            setError("");
        } catch (err) {
            console.error("Error toggling classroom:", err);
            setError(err.response?.data?.message || "Помилка при зміні статусу аудиторії");
        }
    };

    return (
        <Container fluid style={{ padding: "0 0 24px 0" }}>
            <ClassroomsHeader onShowCreateModal={handleShowCreateModal} />

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

            <ClassroomsList
                classrooms={classrooms}
                loading={loading}
                onEditClassroom={handleShowEditModal}
                onDeleteClassroom={handleDeleteClassroom}
                onToggleClassroom={handleToggleClassroom}
            />

            <ClassroomModal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingClassroom(null);
                }}
                onSave={handleSaveClassroom}
                classroom={editingClassroom}
            />
        </Container>
    );
};

export default ClassroomsTab;