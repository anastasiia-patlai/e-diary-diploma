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
    const [timeSlots, setTimeSlots] = useState([]); // Додаємо стан для timeSlots
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState("");

    // Функція для сортування груп від молодших до старших
    const sortGroupsByGrade = (groupsArray) => {
        return groupsArray.sort((a, b) => {
            const gradeA = parseInt(a.name.match(/\d+/)?.[0] || 0);
            const gradeB = parseInt(b.name.match(/\d+/)?.[0] || 0);

            if (gradeA !== gradeB) {
                return gradeA - gradeB;
            }

            const letterA = a.name.match(/[А-ЯҐЄІЇ]/)?.[0] || '';
            const letterB = b.name.match(/[А-ЯҐЄІЇ]/)?.[0] || '';

            return letterA.localeCompare(letterB);
        });
    };

    // Завантажити часові слоти
    const loadTimeSlots = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/time-slots");
            setTimeSlots(response.data);
        } catch (err) {
            console.error("❌ Помилка завантаження часових слотів:", err);
            setTimeSlots([]); // Встановлюємо пустий масив у разі помилки
        }
    };

    // Завантажити всі дані
    const loadAllData = async () => {
        try {
            setLoading(true);
            setError("");

            console.log("🔄 Початок завантаження даних...");

            // Завантажуємо часові слоти окремо
            await loadTimeSlots();

            // Решта запитів
            let schedulesRes, groupsRes, teachersRes, classroomsRes;

            try {
                schedulesRes = await axios.get("http://localhost:3001/api/schedule");
                console.log("✅ Розклади завантажені:", schedulesRes.data.length);
            } catch (err) {
                console.error("❌ Помилка завантаження розкладів:", err.response?.data || err.message);
                throw new Error(`Розклади: ${err.response?.data?.message || err.message}`);
            }

            try {
                groupsRes = await axios.get("http://localhost:3001/api/groups");
                console.log("✅ Групи завантажені:", groupsRes.data.length);
            } catch (err) {
                console.error("❌ Помилка завантаження груп:", err.response?.data || err.message);
                throw new Error(`Групи: ${err.response?.data?.message || err.message}`);
            }

            try {
                teachersRes = await axios.get("http://localhost:3001/api/users/teachers");
                console.log("✅ Викладачі завантажені:", teachersRes.data.length);
            } catch (err) {
                console.error("❌ Помилка завантаження викладачів:", err.response?.data || err.message);
                throw new Error(`Викладачі: ${err.response?.data?.message || err.message}`);
            }

            try {
                classroomsRes = await axios.get("http://localhost:3001/api/classrooms");
                console.log("✅ Аудиторії завантажені:", classroomsRes.data.length);
            } catch (err) {
                console.error("❌ Помилка завантаження аудиторій:", err.response?.data || err.message);
                throw new Error(`Аудиторії: ${err.response?.data?.message || err.message}`);
            }

            setSchedules(schedulesRes.data);
            setGroups(sortGroupsByGrade(groupsRes.data));
            setTeachers(teachersRes.data);
            setClassrooms(classroomsRes.data.filter(classroom => classroom.isActive));

            console.log("✅ Всі дані успішно завантажені");

        } catch (err) {
            console.error("❌ Критична помилка завантаження даних:", err);
            setError("Помилка при завантаженні даних: " + err.message);
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
            await loadAllData();
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
                timeSlots={timeSlots} // Тепер передаємо timeSlots
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
            />
        </Container>
    );
};

export default ScheduleDashboard;