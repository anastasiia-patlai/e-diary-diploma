import React, { useState, useEffect } from "react";
import { Container, Alert } from "react-bootstrap";
import axios from "axios";

import ScheduleHeader from "./components/ScheduleHeader";
import ScheduleTable from "./components/ScheduleTable";
import GroupScheduleTable from "./components/group_schedule/GroupScheduleTable";
import CreateScheduleModal from "./components/CreateScheduleModal";

const ScheduleDashboard = () => {
    const [schedules, setSchedules] = useState([]);
    const [groups, setGroups] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [daysOfWeek, setDaysOfWeek] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState("");

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

    const loadSemesters = async () => {
        try {
            console.log("Завантаження семестрів...");
            const response = await axios.get("http://localhost:3001/api/study-calendar/semesters");
            console.log("Семестри отримані:", response.data);
            setSemesters(response.data);

            const activeSemester = response.data.find(sem => sem.isActive);
            if (activeSemester) {
                console.log("Активний семестр:", activeSemester);
                setSelectedSemester(activeSemester._id);
            } else if (response.data.length > 0) {
                console.log("Перший семестр:", response.data[0]);
                setSelectedSemester(response.data[0]._id);
            } else {
                console.log("Семестрів не знайдено");
                setSelectedSemester("");
            }
        } catch (err) {
            console.error("Помилка завантаження семестрів:", err);
            console.error("URL запиту:", "http://localhost:3001/api/study-calendar/semesters");
            console.error("Статус помилки:", err.response?.status);
            console.error("Дані помилки:", err.response?.data);
            setSemesters([]);
            setSelectedSemester("");
        }
    };

    const loadTimeSlots = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/time-slots");
            setTimeSlots(response.data);
        } catch (err) {
            console.error("Помилка завантаження часових слотів:", err);
            setTimeSlots([]);
        }
    };

    const loadDaysOfWeek = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/days/active");
            setDaysOfWeek(response.data);
        } catch (err) {
            console.error("Помилка завантаження днів тижня:", err);
            setDaysOfWeek([]);
        }
    };

    const loadGroups = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/groups");
            const sortedGroups = sortGroupsByGrade(response.data);
            setGroups(sortedGroups);
            console.log("Групи завантажені:", sortedGroups.length);
        } catch (err) {
            console.error("Помилка завантаження груп:", err);
            setGroups([]);
        }
    };

    const loadTeachers = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/users/teachers");
            setTeachers(response.data);
            console.log("Викладачі завантажені:", response.data.length);
        } catch (err) {
            console.error("Помилка завантаження викладачів:", err);
            setTeachers([]);
        }
    };

    const loadClassrooms = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/classrooms");
            const activeClassrooms = response.data.filter(classroom => classroom.isActive);
            setClassrooms(activeClassrooms);
            console.log("Аудиторії завантажені:", activeClassrooms.length);
        } catch (err) {
            console.error("Помилка завантаження аудиторій:", err);
            setClassrooms([]);
        }
    };

    const loadSchedules = async () => {
        if (!selectedSemester) {
            setSchedules([]);
            return;
        }

        try {
            console.log("Завантаження розкладу для семестру:", selectedSemester);
            const response = await axios.get(`http://localhost:3001/api/schedule?semester=${selectedSemester}`);
            setSchedules(response.data);
            console.log("Розклади завантажені:", response.data.length);
        } catch (err) {
            console.error("Помилка завантаження розкладів:", err);
            setSchedules([]);
        }
    };

    const loadAllData = async () => {
        try {
            setLoading(true);
            setError("");

            console.log("Початок завантаження даних...");

            // Спочатку завантажуємо семестри
            await loadSemesters();

            // Потім інші дані
            await Promise.all([
                loadGroups(),
                loadTeachers(),
                loadClassrooms(),
                loadTimeSlots(),
                loadDaysOfWeek()
            ]);

            console.log("Всі дані успішно завантажені");

        } catch (err) {
            console.error("Критична помилка завантаження даних:", err);
            setError("Помилка при завантаженні даних: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        if (selectedSemester) {
            loadSchedules();
        } else {
            setSchedules([]);
        }
    }, [selectedSemester]);

    const handleCreateSchedule = async (scheduleData) => {
        try {
            setLoading(true);
            const response = await axios.post("http://localhost:3001/api/schedule", {
                ...scheduleData,
                semester: selectedSemester
            });
            await loadSchedules();
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
            await loadSchedules();
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Помилка при видаленні заняття");
        }
    };

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
                semesters={semesters}
                selectedSemester={selectedSemester}
                onSemesterChange={setSelectedSemester}
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

            {!selectedSemester && semesters.length > 0 && (
                <Alert variant="warning" style={{ marginBottom: "16px" }}>
                    Оберіть семестр для перегляду розкладу
                </Alert>
            )}

            {semesters.length === 0 && !loading && (
                <Alert variant="info" style={{ marginBottom: "16px" }}>
                    Немає доступних семестрів. Спочатку створіть семестр в розділі "Навчальний календар".
                </Alert>
            )}

            {selectedSemester && (selectedGroup ? (
                <GroupScheduleTable
                    schedules={filteredSchedules}
                    groups={groups}
                    timeSlots={timeSlots}
                    daysOfWeek={daysOfWeek}
                    selectedGroup={selectedGroup}
                    loading={loading}
                    onDeleteSchedule={handleDeleteSchedule}
                />
            ) : (
                <ScheduleTable
                    schedules={schedules}
                    groups={groups}
                    timeSlots={timeSlots}
                    daysOfWeek={daysOfWeek}
                    loading={loading}
                    onDeleteSchedule={handleDeleteSchedule}
                />
            ))}

            <CreateScheduleModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleCreateSchedule}
                groups={groups}
                teachers={teachers}
                classrooms={classrooms}
                semesters={semesters}
                selectedSemester={selectedSemester}
            />
        </Container>
    );
};

export default ScheduleDashboard;