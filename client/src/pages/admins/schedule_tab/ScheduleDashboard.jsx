import React, { useState, useEffect } from "react";
import { Container, Alert, Spinner, Toast, ToastContainer } from "react-bootstrap";
import { FaDatabase } from "react-icons/fa";
import axios from "axios";

import ScheduleHeader from "./components/ScheduleHeader";
import ScheduleTable from "./components/ScheduleTable";
import GroupScheduleTable from "./group_schedule/GroupScheduleTable";
import CreateScheduleModal from "./components/CreateScheduleModal";
import DeleteCertainScheduleLesson from "./components/DeleteCertainScheduleLesson";

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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedScheduleToDelete, setSelectedScheduleToDelete] = useState(null);

    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationType, setNotificationType] = useState("success");

    const filteredSchedules = selectedGroup
        ? schedules.filter(schedule => schedule.group?._id === selectedGroup)
        : schedules;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showSystemNotification = (message, type = "success") => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotification(true);

        setTimeout(() => {
            setShowNotification(false);
        }, 5000);
    };

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
            showSystemNotification("Не вдалося визначити базу даних школи", "danger");
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
            console.log(`Запит розкладів для семестру: ${selectedSemester}`);

            const response = await axios.get(`http://localhost:3001/api/schedule`, {
                params: {
                    semester: selectedSemester,
                    databaseName
                },
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });

            console.log(`Отримано ${response.data.length} розкладів`);

            // Перевірка на дублікати
            const uniqueSchedules = [];
            const seenKeys = new Set();

            response.data.forEach(schedule => {
                const dayOfWeekId = schedule.dayOfWeek?._id || schedule.dayOfWeek;
                const timeSlotId = schedule.timeSlot?._id || schedule.timeSlot;
                const key = `${schedule.group?._id}-${dayOfWeekId}-${timeSlotId}`;

                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    uniqueSchedules.push(schedule);
                } else {
                    console.warn("Знайдено дублікат розкладу:", schedule);
                }
            });

            setSchedules(uniqueSchedules);

        } catch (err) {
            console.error('Помилка завантаження розкладів:', err);
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

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log("Кількість розкладів:", schedules.length);

            if (selectedGroup) {
                const groupSchedules = schedules.filter(s => s.group?._id === selectedGroup);
                console.log(`Розкладів для групи ${selectedGroup}:`, groupSchedules.length);
            }
        }
    }, [schedules, selectedGroup]);

    const handleCreateSchedule = async (scheduleData) => {
        if (!databaseName) {
            setError("Не вказано базу даних");
            showSystemNotification("Не вказано базу даних", "danger");
            return;
        }

        try {
            setLoading(true);
            console.log("Створення розкладу з даними:", scheduleData);

            const existingInState = schedules.find(schedule => {
                const scheduleDayOfWeek = schedule.dayOfWeek?._id || schedule.dayOfWeek;
                const scheduleTimeSlot = schedule.timeSlot?._id || schedule.timeSlot;

                return schedule.group?._id === scheduleData.group &&
                    String(scheduleDayOfWeek) === String(scheduleData.dayOfWeek) &&
                    String(scheduleTimeSlot) === String(scheduleData.timeSlot);
            });

            if (existingInState) {
                const errorMsg = `Помилка: Ця група вже має урок в цей час. Предмет: ${existingInState.subject || "Без назви"}`;
                setError(errorMsg);
                showSystemNotification(errorMsg, "danger");
                setLoading(false);
                return;
            }

            const response = await axios.post("http://localhost:3001/api/schedule", {
                ...scheduleData,
                semester: selectedSemester,
                databaseName
            });

            console.log("Успішно створено розклад:", response.data);

            showSystemNotification("Розклад успішно створено!", "success");

            setShowModal(false);
            setError("");

            if (response.data.schedule) {
                setSchedules(prev => [...prev, response.data.schedule]);
            }

            setTimeout(() => {
                loadSchedules();
            }, 300);

        } catch (err) {
            console.error("Помилка створення розкладу:", err.response?.data || err.message);

            if (err.response?.status === 409) {
                const conflictData = err.response.data;
                let errorMessage = "Конфлікт розкладу! ";

                if (conflictData.conflictType === 'GROUP_TIMESLOT_CONFLICT') {
                    const details = conflictData.details;
                    errorMessage += "Група вже має урок в цей час.";

                    if (details.existingLesson?.subject) {
                        errorMessage += ` Предмет: ${details.existingLesson.subject}`;
                    }
                } else {
                    errorMessage += conflictData.message || "Невідомий конфлікт";
                }

                setError(errorMessage);
                showSystemNotification(errorMessage, "danger");

                setTimeout(() => {
                    loadSchedules();
                }, 300);
            } else {
                const errorMsg = err.response?.data?.message || err.message || "Помилка при створенні розкладу";
                setError(errorMsg);
                showSystemNotification(errorMsg, "danger");
            }
        } finally {
            setLoading(false);
        }
    };

    const checkForDuplicates = () => {
        const duplicates = [];
        const seen = new Set();

        schedules.forEach(schedule => {
            if (!schedule.group?._id || !schedule.dayOfWeek || !schedule.timeSlot) return;

            const dayOfWeekId = schedule.dayOfWeek?._id || schedule.dayOfWeek;
            const timeSlotId = schedule.timeSlot?._id || schedule.timeSlot;

            const key = `${schedule.group._id}-${dayOfWeekId}-${timeSlotId}`;
            if (seen.has(key)) {
                duplicates.push(schedule);
            } else {
                seen.add(key);
            }
        });

        if (duplicates.length > 0) {
            console.error("Знайдено дублікати розкладів:", duplicates);
        }

        return duplicates;
    };

    useEffect(() => {
        checkForDuplicates();
    }, [schedules]);

    const handleDeleteSchedule = async (id) => {
        if (!databaseName) {
            setError("Не вказано базу даних");
            showSystemNotification("Не вказано базу даних", "danger");
            return;
        }

        try {
            setLoading(true);
            await axios.delete(`http://localhost:3001/api/schedule/${id}`, {
                data: { databaseName }
            });

            showSystemNotification("Заняття успішно видалено!", "success");

            setShowDeleteModal(false);
            setSelectedScheduleToDelete(null);

            await loadSchedules();
            setError("");
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Помилка при видаленні заняття";
            setError(errorMsg);
            showSystemNotification(errorMsg, "danger");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (schedule) => {
        console.log('Відкриваємо модалку видалення для розкладу:', schedule);
        setSelectedScheduleToDelete(schedule);
        setShowDeleteModal(true);
    };

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

            {/* СИСТЕМНІ СПОВІЩЕННЯ над таблицею */}
            {/* {showNotification && (
                <Alert
                    variant={notificationType === 'success' ? 'success' :
                        notificationType === 'danger' ? 'danger' :
                            notificationType === 'warning' ? 'warning' : 'info'}
                    onClose={() => setShowNotification(false)}
                    dismissible
                    style={{
                        borderRadius: "6px",
                        marginBottom: "16px",
                        fontSize: isMobile ? "14px" : "16px",
                        padding: isMobile ? "12px" : "16px",
                        whiteSpace: 'pre-line',
                        animation: 'slideDown 0.3s ease-out'
                    }}
                >
                    <Alert.Heading>
                        {notificationType === 'success' ? 'Успіх' :
                            notificationType === 'danger' ? 'Помилка' :
                                notificationType === 'warning' ? 'Попередження' : 'Інформація'}
                    </Alert.Heading>
                    {notificationMessage}
                </Alert>
            )} */}
            {/* {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}
                    style={{
                        borderRadius: "6px",
                        marginBottom: "16px",
                        fontSize: isMobile ? "14px" : "16px",
                        padding: isMobile ? "12px" : "16px",
                        whiteSpace: 'pre-line'
                    }}
                >
                    {error}
                </Alert>
            )} */}

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
                    onDeleteSchedule={openDeleteModal}
                    classrooms={classrooms}
                    teachers={teachers}
                    isMobile={isMobile}
                    databaseName={databaseName}
                />
            ) : (
                <ScheduleTable
                    schedules={schedules}
                    groups={groups}
                    timeSlots={timeSlots}
                    daysOfWeek={daysOfWeek}
                    loading={loading}
                    onDeleteSchedule={openDeleteModal}
                    classrooms={classrooms}
                    teachers={teachers}
                    isMobile={isMobile}
                    databaseName={databaseName}
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

            <DeleteCertainScheduleLesson
                show={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedScheduleToDelete(null);
                }}
                onDelete={handleDeleteSchedule}
                schedule={selectedScheduleToDelete}
                loading={loading}
                isMobile={isMobile}
            />
        </Container>
    );
};

export default ScheduleDashboard;