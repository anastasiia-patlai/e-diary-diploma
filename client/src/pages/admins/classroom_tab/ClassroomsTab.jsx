import React, { useState, useEffect } from "react";
import { Container, Alert } from "react-bootstrap";
import axios from "axios";

import ClassroomsHeader from "./components/ClassroomsHeader";
import ClassroomsList from "./components/ClassroomsList";
import ClassroomModal from "./components/ClassroomModal";
import DeleteClassroom from "./components/DeleteClassroom";

const ClassroomsTab = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingClassroom, setEditingClassroom] = useState(null);
    const [deletingClassroom, setDeletingClassroom] = useState(null);
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
            console.log("Database name встановлено для аудиторій:", dbName);
        } else {
            console.error("Database name не знайдено для аудиторій!");
            setError("Не вдалося визначити базу даних школи");
            setLoading(false);
        }
    }, []);

    const loadClassrooms = async () => {
        if (!databaseName) {
            console.error("Database name відсутній для запиту аудиторій");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get("http://localhost:3001/api/classrooms", {
                params: { databaseName }
            });

            if (response.data && Array.isArray(response.data)) {
                setClassrooms(response.data);
                console.log("Аудиторії завантажені:", response.data.length);
            } else {
                setClassrooms([]);
            }
            setError("");
        } catch (err) {
            console.error("Error loading classrooms:", err);
            setError("Помилка при завантаженні аудиторій: " + (err.response?.data?.message || err.message));
            setClassrooms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (databaseName) {
            loadClassrooms();
        }
    }, [databaseName]);

    const handleShowCreateModal = () => {
        setEditingClassroom(null);
        setShowModal(true);
    };

    const handleShowEditModal = (classroom) => {
        setEditingClassroom(classroom);
        setShowModal(true);
    };

    const handleShowDeleteModal = (classroom) => {
        setDeletingClassroom(classroom);
        setShowDeleteModal(true);
    };

    // Функція для підтвердження видалення
    const handleConfirmDelete = async () => {
        if (!databaseName || !deletingClassroom) {
            setError("Помилка: не вказано базу даних або аудиторію");
            return;
        }

        try {
            await axios.delete(`http://localhost:3001/api/classrooms/${deletingClassroom._id}`, {
                data: { databaseName }
            });
            await loadClassrooms();
            setShowDeleteModal(false);
            setDeletingClassroom(null);
            setError("");
        } catch (err) {
            console.error("Error deleting classroom:", err);
            setError(err.response?.data?.message || "Помилка при видаленні аудиторії");
            setShowDeleteModal(false);
            setDeletingClassroom(null);
        }
    };

    // Функція для закриття попапу видалення
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingClassroom(null);
    };

    const handleSaveClassroom = async (classroomData) => {
        if (!databaseName) {
            setError("Не вказано базу даних");
            return;
        }

        try {
            setLoading(true);
            let response;

            const dataWithDatabase = {
                ...classroomData,
                databaseName
            };

            if (editingClassroom) {
                // ОНОВЛЕННЯ ІСНУЮЧОЇ АУДИТОРІЇ
                response = await axios.put(
                    `http://localhost:3001/api/classrooms/${editingClassroom._id}`,
                    dataWithDatabase
                );
            } else {
                // СТВОРЕННЯ НОВОЇ АУДИТОРІЇ
                response = await axios.post(
                    "http://localhost:3001/api/classrooms",
                    dataWithDatabase
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

    const handleToggleClassroom = async (id) => {
        if (!databaseName) {
            setError("Не вказано базу даних");
            return;
        }

        try {
            await axios.patch(`http://localhost:3001/api/classrooms/${id}/toggle`, {
                databaseName
            });
            await loadClassrooms();
            setError("");
        } catch (err) {
            console.error("Error toggling classroom:", err);
            setError(err.response?.data?.message || "Помилка при зміні статусу аудиторії");
        }
    };

    return (
        <Container fluid style={{ padding: "0 0 24px 0" }}>
            {/* {databaseName && (
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
            )} */}

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
                onDeleteClassroom={handleShowDeleteModal}
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

            <DeleteClassroom
                show={showDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                classroom={deletingClassroom}
            />
        </Container>
    );
};

export default ClassroomsTab;