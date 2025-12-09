import React, { useState, useEffect } from "react";
import axios from "axios";
import ClassroomsHeader from "./components/ClassroomsHeader";
import ClassroomsList from "./components/ClassroomsList";
import ClassroomModal from "./components/ClassroomModal";
import DeleteClassroom from "./components/DeleteClassroom";

const ClassroomsTab = ({ isMobile = false }) => {
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
                        if (user.databaseName) dbName = user.databaseName;
                    } catch (e) { }
                }
            }
            if (!dbName) {
                const userInfoStr = localStorage.getItem('userInfo');
                if (userInfoStr) {
                    try {
                        const userInfo = JSON.parse(userInfoStr);
                        if (userInfo.databaseName) dbName = userInfo.databaseName;
                    } catch (e) { }
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

    const loadClassrooms = async () => {
        if (!databaseName) return;

        try {
            setLoading(true);
            const response = await axios.get("http://localhost:3001/api/classrooms", {
                params: { databaseName }
            });

            if (response.data && Array.isArray(response.data)) {
                setClassrooms(response.data);
            } else {
                setClassrooms([]);
            }
            setError("");
        } catch (err) {
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
            setError(err.response?.data?.message || "Помилка при видаленні аудиторії");
            setShowDeleteModal(false);
            setDeletingClassroom(null);
        }
    };

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
                response = await axios.put(
                    `http://localhost:3001/api/classrooms/${editingClassroom._id}`,
                    dataWithDatabase
                );
            } else {
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
            setError(err.response?.data?.message || "Помилка при зміні статусу аудиторії");
        }
    };

    return (
        <div style={{ padding: isMobile ? "12px" : "0 0 24px 0" }}>
            <ClassroomsHeader
                onShowCreateModal={handleShowCreateModal}
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

            <ClassroomsList
                classrooms={classrooms}
                loading={loading}
                onEditClassroom={handleShowEditModal}
                onDeleteClassroom={handleShowDeleteModal}
                onToggleClassroom={handleToggleClassroom}
                isMobile={isMobile}
            />

            <ClassroomModal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingClassroom(null);
                }}
                onSave={handleSaveClassroom}
                classroom={editingClassroom}
                isMobile={isMobile}
            />

            <DeleteClassroom
                show={showDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                classroom={deletingClassroom}
                isMobile={isMobile}
            />
        </div>
    );
};

export default ClassroomsTab;