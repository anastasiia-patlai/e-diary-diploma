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

    const fetchGroups = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/groups");
            setGroups(response.data);
            setLoading(false);
        } catch (err) {
            setError("Помилка завантаження груп");
            setLoading(false);
            console.error("Помилка завантаження груп:", err);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/users/teachers");
            setTeachers(response.data);
        } catch (err) {
            console.error("Помилка завантаження викладачів:", err);
        }
    };

    useEffect(() => {
        fetchGroups();
        fetchTeachers();
    }, []);

    const handleAddCurator = (group) => {
        setSelectedGroup(group);
        setShowCuratorPopup(true);
    };

    const handleRemoveCurator = async (groupId) => {
        try {
            console.log("ID групи для видалення куратора:", groupId);

            const response = await axios.delete(`http://localhost:3001/api/groups/${groupId}/curator`);
            console.log("Успішна відповідь:", response.data);

            fetchGroups();
            setShowDeletePopup(false);
            setGroupToDelete(null);
        } catch (err) {
            console.error("Повна помилка видалення куратора:", err);
            console.log("Статус помилки:", err.response?.status);
            console.log("Дані помилки:", err.response?.data);
            console.log("Повний response:", err.response);

            const errorMessage = err.response?.data?.error ||
                err.response?.data?.message ||
                "Помилка видалення куратора";

            alert(`Помилка: ${errorMessage}`);
        }
    };

    // Нова функція для відкриття попапу підтвердження
    const openDeleteConfirmation = (group) => {
        setGroupToDelete(group);
        setShowDeletePopup(true);
    };

    // Нова функція для закриття попапу
    const closeDeleteConfirmation = () => {
        setShowDeletePopup(false);
        setGroupToDelete(null);
    };


    const handleSelectCurator = async (teacherId) => {
        try {
            await axios.put(`http://localhost:3001/api/groups/${selectedGroup._id}/curator`, {
                curatorId: teacherId
            });
            setShowCuratorPopup(false);
            setSelectedGroup(null);
            fetchGroups();
        } catch (err) {
            console.error("Помилка додавання куратора:", err);
            const errorMessage = err.response?.data?.error || "Помилка додавання куратора";
            alert(errorMessage);
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

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Завантаження груп з кураторами...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                <p>{error}</p>
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