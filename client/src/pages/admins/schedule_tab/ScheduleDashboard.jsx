import React, { useState, useEffect } from "react";
import { Container, Alert, Spinner } from "react-bootstrap";
import { FaDatabase } from "react-icons/fa";
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
    const [databaseName, setDatabaseName] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Перевірка ширини екрану
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        } else {
            console.error("Database name не знайдено!");
            setError("Не вдалося визначити базу даних школи");
            setLoading(false);
        }
    }, []);

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
        if (!databaseName) {
            console.error("Database name відсутній для запиту семестрів");
            return;
        }

        try {
            const response = await axios.get("http://localhost:3001/api/study-calendar/semesters", {
                params: { databaseName }
            });
            setSemesters(response.data);

            const activeSemester = response.data.find(sem => sem.isActive);
            if (activeSemester) {
                setSelectedSemester(activeSemester._id);
            } else if (response.data.length > 0) {
                setSelectedSemester(response.data[0]._id);
            } else {
                setSelectedSemester("");
            }
        } catch (err) {
            console.error("Помилка завантаження семестрів:", err);
            setSemesters([]);
            setSelectedSemester("");
        }
    };

    const loadTimeSlots = async () => {
        if (!databaseName) {
            console.error("Database name відсутній для запиту часових слотів");
            return;
        }

        try {
            const response = await axios.get("http://localhost:3001/api/time-slots", {
                params: { databaseName }
            });
            setTimeSlots(response.data);
        } catch (err) {
            console.error("Помилка завантаження часових слотів:", err);
            setTimeSlots([]);
        }
    };

    const loadDaysOfWeek = async () => {
        if (!databaseName) {
            console.error("Database name відсутній для запиту днів тижня");
            return;
        }

        try {
            const response = await axios.get("http://localhost:3001/api/days/active", {
                params: { databaseName }
            });
            setDaysOfWeek(response.data);
        } catch (err) {
            console.error("Помилка завантаження днів тижня:", err);
            setDaysOfWeek([]);
        }
    };

    const loadGroups = async () => {
        if (!databaseName) {
            console.error("Database name відсутній для запиту груп");
            return;
        }

        try {
            const response = await axios.get("http://localhost:3001/api/groups", {
                params: { databaseName }
            });
            const sortedGroups = sortGroupsByGrade(response.data);
            setGroups(sortedGroups);
        } catch (err) {
            console.error("Помилка завантаження груп:", err);
            setGroups([]);
        }
    };

    const loadTeachers = async () => {
        if (!databaseName) {
            console.error("Database name відсутній для запиту викладачів");
            return;
        }

        try {
            const response = await axios.get("http://localhost:3001/api/users/teachers", {
                params: { databaseName }
            });
            setTeachers(response.data);
        } catch (err) {
            console.error("Помилка завантаження викладачів:", err);
            setTeachers([]);
        }
    };

    const loadClassrooms = async () => {
        if (!databaseName) {
            console.error("Database name відсутній для запиту аудиторій");
            return;
        }

        try {
            const response = await axios.get("http://localhost:3001/api/classrooms", {
                params: { databaseName }
            });
            const activeClassrooms = response.data.filter(classroom => classroom.isActive);
            setClassrooms(activeClassrooms);
        } catch (err) {
            console.error("Помилка завантаження аудиторій:", err);
            setClassrooms([]);
        }
    };

    const loadSchedules = async () => {
        if (!selectedSemester || !databaseName) {
            setSchedules([]);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:3001/api/schedule`, {
                params: {
                    semester: selectedSemester,
                    databaseName
                }
            });
            setSchedules(response.data);
        } catch (err) {
            console.error("Помилка завантаження розкладів:", err);
            setSchedules([]);
        }
    };

    const loadAllData = async () => {
        if (!databaseName) {
            setError("Не вказано базу даних");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

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

        } catch (err) {
            console.error("Критична помилка завантаження даних:", err);
            setError("Помилка при завантаженні даних: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (databaseName) {
            loadAllData();
        }
    }, [databaseName]);

    useEffect(() => {
        if (selectedSemester && databaseName) {
            loadSchedules();
        } else {
            setSchedules([]);
        }
    }, [selectedSemester, databaseName]);

    const handleCreateSchedule = async (scheduleData) => {
        if (!databaseName) {
            setError("Не вказано базу даних");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("http://localhost:3001/api/schedule", {
                ...scheduleData,
                semester: selectedSemester,
                databaseName
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

        if (!databaseName) {
            setError("Не вказано базу даних");
            return;
        }

        try {
            await axios.delete(`http://localhost:3001/api/schedule/${id}`, {
                data: { databaseName }
            });
            await loadSchedules();
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Помилка при видаленні заняття");
        }
    };

    const filteredSchedules = selectedGroup
        ? schedules.filter(schedule => schedule.group?._id === selectedGroup)
        : schedules;

    if (loading) {
        return (
            <Container fluid style={{
                padding: isMobile ? "16px" : "24px",
                minHeight: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div style={{ textAlign: "center" }}>
                    <Spinner animation="border" variant="primary" />
                    <p style={{ color: "#6b7280", marginTop: "16px" }}>
                        Завантаження розкладу...
                    </p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid style={{
            padding: isMobile ? "12px" : "0 0 24px 0",
            maxWidth: "100%",
            overflowX: "hidden"
        }}>
            <ScheduleHeader
                onShowModal={() => setShowModal(true)}
                groups={groups}
                selectedGroup={selectedGroup}
                onGroupChange={setSelectedGroup}
                semesters={semesters}
                selectedSemester={selectedSemester}
                onSemesterChange={setSelectedSemester}
                isMobile={isMobile}
            />

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        borderRadius: "6px",
                        marginBottom: "16px",
                        fontSize: isMobile ? "14px" : "16px",
                        padding: isMobile ? "12px" : "16px"
                    }}
                >
                    {error}
                </Alert>
            )}

            {!selectedSemester && semesters.length > 0 && (
                <Alert variant="warning" style={{
                    marginBottom: "16px",
                    fontSize: isMobile ? "14px" : "16px",
                    padding: isMobile ? "12px" : "16px"
                }}>
                    Оберіть семестр для перегляду розкладу
                </Alert>
            )}

            {semesters.length === 0 && !loading && (
                <Alert variant="info" style={{
                    marginBottom: "16px",
                    fontSize: isMobile ? "14px" : "16px",
                    padding: isMobile ? "12px" : "16px"
                }}>
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
                    isMobile={isMobile}
                />
            ) : (
                <ScheduleTable
                    schedules={schedules}
                    groups={groups}
                    timeSlots={timeSlots}
                    daysOfWeek={daysOfWeek}
                    loading={loading}
                    onDeleteSchedule={handleDeleteSchedule}
                    isMobile={isMobile}
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
                schoolDatabaseName={databaseName}
                isMobile={isMobile}
            />
        </Container>
    );
};

export default ScheduleDashboard;