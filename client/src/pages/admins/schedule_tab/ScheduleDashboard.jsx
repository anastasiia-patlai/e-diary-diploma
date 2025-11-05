import React, { useState, useEffect } from "react";
import { Container, Alert } from "react-bootstrap";
import axios from "axios";

import ScheduleHeader from "./components/ScheduleHeader";
import ScheduleTable from "./components/ScheduleTable";
import CreateScheduleModal from "./components/CreateScheduleModal";

const ScheduleDashboard = () => {
    const [schedules, setSchedules] = useState([]);
    const [groups, setGroups] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState("");

    // Функція для сортування груп від молодших до старших
    const sortGroupsByGrade = (groupsArray) => {
        return groupsArray.sort((a, b) => {
            // Витягуємо цифри з назв груп (наприклад, "6-А" -> 6, "11-В" -> 11)
            const gradeA = parseInt(a.name.match(/\d+/)?.[0] || 0);
            const gradeB = parseInt(b.name.match(/\d+/)?.[0] || 0);

            // Спочатку сортуємо за класом (від меншого до більшого)
            if (gradeA !== gradeB) {
                return gradeA - gradeB;
            }

            // Якщо клас однаковий, сортуємо за літерою в алфавітному порядку
            const letterA = a.name.match(/[А-ЯҐЄІЇ]/)?.[0] || '';
            const letterB = b.name.match(/[А-ЯҐЄІЇ]/)?.[0] || '';

            return letterA.localeCompare(letterB);
        });
    };

    // Завантажити всі дані
    const loadAllData = async () => {
        try {
            setLoading(true);

            const [schedulesRes, groupsRes, teachersRes, classroomsRes] = await Promise.all([
                axios.get("http://localhost:3001/api/schedule"),
                axios.get("http://localhost:3001/api/groups"),
                axios.get("http://localhost:3001/api/users/teachers"),
                axios.get("http://localhost:3001/api/classrooms")
            ]);

            setSchedules(schedulesRes.data);

            const sortedGroups = sortGroupsByGrade(groupsRes.data);
            setGroups(sortedGroups);

            setTeachers(teachersRes.data);
            setClassrooms(classroomsRes.data.filter(classroom => classroom.isActive));
            setError("");
        } catch (err) {
            console.error("Error loading data:", err);
            setError("Помилка при завантаженні даних");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleCreateSchedule = async (scheduleData) => {
        try {
            setLoading(true);
            const response = await axios.post("http://localhost:3001/api/schedule", scheduleData);
            await loadAllData(); // Перезавантажити дані
            setShowModal(false);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Помилка при створенні розкладу");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSchedule = async (id) => {
        if (!window.confirm("Ви впевнені, що хочете видалити це заняття?")) {
            return;
        }

        try {
            await axios.delete(`http://localhost:3001/api/schedule/${id}`);
            await loadAllData();
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Помилка при видаленні заняття");
        }
    };

    // Фільтруємо розклад для вибраної групи
    const filteredSchedules = selectedGroup
        ? schedules.filter(schedule => schedule.group?._id === selectedGroup)
        : schedules;

    return (
        <Container fluid style={{ padding: "0 0 24px 0" }}>
            <ScheduleHeader
                onShowModal={() => setShowModal(true)}
                groups={groups}
                selectedGroup={selectedGroup}
                onGroupChange={setSelectedGroup}
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

            <ScheduleTable
                schedules={filteredSchedules}
                groups={groups}
                timeSlots={timeSlots}
                loading={loading}
                onDeleteSchedule={handleDeleteSchedule}
            />

            <CreateScheduleModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleCreateSchedule}
                groups={groups}
                teachers={teachers}
                classrooms={classrooms}
                timeSlots={timeSlots}
            />
        </Container>
    );
};

export default ScheduleDashboard;