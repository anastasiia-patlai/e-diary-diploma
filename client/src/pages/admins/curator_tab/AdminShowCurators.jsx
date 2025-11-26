import React, { useState, useEffect } from 'react';
import axios from "axios";
import CuratorStatistics from './CuratorStatistics';
import CuratorGroupsList from './CuratorGroupsList';
import CuratorPopup from './CuratorPopup';
import DeleteCuratorPopup from './DeleteCuratorPopup';

const AdminShowCurators = () => {
    const [groups, setGroups] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCuratorPopup, setShowCuratorPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [databaseName, setDatabaseName] = useState("");

    // Отримання databaseName з localStorage
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

    const fetchGroups = async () => {
        if (!databaseName) {
            console.error("Database name відсутній");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get("http://localhost:3001/api/groups", {
                params: { databaseName }
            });
            setGroups(response.data);
            setError("");
        } catch (err) {
            console.error("Помилка завантаження груп:", err);
            setError(err.response?.data?.error || "Помилка завантаження груп");
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        if (!databaseName) {
            console.error("Database name відсутній");
            return;
        }

        try {
            const response = await axios.get("http://localhost:3001/api/users/teachers", {
                params: { databaseName }
            });
            setTeachers(response.data);
        } catch (err) {
            console.error("Помилка завантаження викладачів:", err);
            // Не встановлюємо загальну помилку, щоб не блокувати відображення груп
        }
    };

    useEffect(() => {
        if (databaseName) {
            fetchGroups();
            fetchTeachers();
        }
    }, [databaseName]);

    const handleAddCurator = (group) => {
        setSelectedGroup(group);
        setShowCuratorPopup(true);
    };

    const handleRemoveCurator = async (groupId) => {
        if (!databaseName) {
            alert("Помилка: не вказано базу даних");
            return;
        }

        try {
            console.log("Видалення куратора з групи:", groupId);
            console.log("Database name:", databaseName);

            const response = await axios.delete(`http://localhost:3001/api/groups/${groupId}/curator`, {
                data: { databaseName }
            });

            console.log("Успішна відповідь:", response.data);
            fetchGroups();
            setShowDeletePopup(false);
            setGroupToDelete(null);

        } catch (err) {
            console.error("Повна помилка видалення куратора:", err);
            const errorMessage = err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                "Помилка видалення куратора";

            alert(`Помилка: ${errorMessage}`);
        }
    };

    const openDeleteConfirmation = (group) => {
        setGroupToDelete(group);
        setShowDeletePopup(true);
    };

    const closeDeleteConfirmation = () => {
        setShowDeletePopup(false);
        setGroupToDelete(null);
    };

    const handleSelectCurator = async (teacherId) => {
        if (!databaseName) {
            alert("Помилка: не вказано базу даних");
            return;
        }

        try {
            console.log("Додавання куратора:", {
                groupId: selectedGroup._id,
                teacherId: teacherId,
                databaseName: databaseName
            });

            const response = await axios.put(
                `http://localhost:3001/api/groups/${selectedGroup._id}/curator`,
                {
                    curatorId: teacherId,
                    databaseName: databaseName
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Успішна відповідь:", response.data);
            setShowCuratorPopup(false);
            setSelectedGroup(null);
            fetchGroups();

        } catch (err) {
            console.error("Детальна помилка додавання куратора:", err);

            if (err.response) {
                console.error("Статус помилки:", err.response.status);
                console.error("Дані помилки:", err.response.data);
            }

            const errorMessage = err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                "Невідома помилка додавання куратора";

            alert(`Помилка додавання куратора: ${errorMessage}`);
        }
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const sortGroups = (groups) => {
        return [...groups].sort((a, b) => {
            const getGroupNumber = (groupName) => {
                const match = groupName.match(/\d+/);
                return match ? parseInt(match[0]) : 0;
            };

            const numA = getGroupNumber(a.name);
            const numB = getGroupNumber(b.name);

            if (sortOrder === 'asc') {
                return numA - numB;
            } else {
                return numB - numA;
            }
        });
    };

    const getBusyTeachers = () => {
        const busyTeacherIds = groups
            .filter(group => group.curator)
            .map(group => group.curator._id);
        return teachers.filter(teacher => busyTeacherIds.includes(teacher._id));
    };

    const getAvailableTeachers = () => {
        const busyTeacherIds = groups
            .filter(group => group.curator)
            .map(group => group.curator._id);
        return teachers.filter(teacher => !busyTeacherIds.includes(teacher._id));
    };

    // Функція для повторного завантаження даних
    const handleRetry = () => {
        if (databaseName) {
            setError("");
            setLoading(true);
            fetchGroups();
            fetchTeachers();
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Завантаження груп з кураторами...</p>
            </div>
        );
    }

    if (error && groups.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                <p>{error}</p>
                <button
                    onClick={handleRetry}
                    style={{
                        marginTop: '10px',
                        padding: '8px 16px',
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Спробувати знову
                </button>
            </div>
        );
    }

    const sortedGroups = sortGroups(groups);
    const groupsWithCurators = sortedGroups.filter(group => group.curator);
    const groupsWithoutCurators = sortedGroups.filter(group => !group.curator);
    const busyTeachers = getBusyTeachers();
    const availableTeachers = getAvailableTeachers();

    return (
        <div>
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

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '15px'
                }}>
                    {error}
                    <button
                        onClick={handleRetry}
                        style={{
                            marginLeft: '10px',
                            padding: '2px 8px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Оновити
                    </button>
                </div>
            )}

            <CuratorStatistics
                groups={groups}
                groupsWithCurators={groupsWithCurators}
                groupsWithoutCurators={groupsWithoutCurators}
                availableTeachers={availableTeachers}
                sortOrder={sortOrder}
                toggleSortOrder={toggleSortOrder}
            />

            <CuratorGroupsList
                groupsWithCurators={groupsWithCurators}
                groupsWithoutCurators={groupsWithoutCurators}
                onAddCurator={handleAddCurator}
                onRemoveCurator={openDeleteConfirmation}
            />

            {showCuratorPopup && (
                <CuratorPopup
                    selectedGroup={selectedGroup}
                    availableTeachers={availableTeachers}
                    busyTeachers={busyTeachers}
                    teachers={teachers}
                    groups={groups}
                    onSelectCurator={handleSelectCurator}
                    onClose={() => {
                        setShowCuratorPopup(false);
                        setSelectedGroup(null);
                    }}
                />
            )}

            {showDeletePopup && (
                <DeleteCuratorPopup
                    group={groupToDelete}
                    onConfirm={handleRemoveCurator}
                    onClose={closeDeleteConfirmation}
                />
            )}
        </div>
    );
};

export default AdminShowCurators;