import React, { useState, useEffect, useRef } from "react";
import {
    FaTimes,
    FaSave,
    FaUsers,
    FaCalendar,
    FaClock,
    FaChalkboardTeacher,
    FaDoorOpen,
    FaBook,
    FaGraduationCap,
    FaExclamationTriangle,
    FaCheckCircle,
    FaCalendarCheck
} from "react-icons/fa";
import axios from "axios";

const CreateScheduleModal = ({
    show,
    onClose,
    onSave,
    groups = [],
    teachers = [],
    classrooms = [],
    semesters = [],
    selectedSemester,
    schoolDatabaseName
}) => {
    const [formData, setFormData] = useState({
        subject: "",
        group: "",
        dayOfWeek: "",
        timeSlot: "",
        teacher: "",
        classroom: "",
        semester: selectedSemester || ""
    });

    const [errors, setErrors] = useState({
        general: "",
        validationErrors: [], // Помилки валідації полів
        conflictErrors: []    // Конфлікти розкладу
    });

    const [timeSlots, setTimeSlots] = useState([]);
    const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
    const [daysOfWeek, setDaysOfWeek] = useState([]);
    const [availability, setAvailability] = useState({
        available: true,
        checking: false,
        conflicts: [], // Унікальні конфлікти
        groupTimeslotConflict: null
    });
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [loading, setLoading] = useState(false);

    const databaseNameRef = useRef(schoolDatabaseName);

    useEffect(() => {
        databaseNameRef.current = schoolDatabaseName;
    }, [schoolDatabaseName]);

    useEffect(() => {
        const loadDaysOfWeek = async () => {
            try {
                const dbName = databaseNameRef.current;
                if (!dbName) {
                    console.error("schoolDatabaseName не вказано");
                    setDaysOfWeek([]);
                    return;
                }

                const response = await axios.get("http://localhost:3001/api/days/active", {
                    params: { databaseName: dbName }
                });
                setDaysOfWeek(response.data || []);
            } catch (err) {
                console.error("Error loading days of week:", err);
                setDaysOfWeek([]);
                setErrors(prev => ({
                    ...prev,
                    general: "Помилка завантаження днів тижня"
                }));
            }
        };

        if (show) {
            loadDaysOfWeek();
            setFormData(prev => ({
                ...prev,
                semester: selectedSemester
            }));
            setErrors({ general: "", validationErrors: [], conflictErrors: [] });
        }
    }, [show, selectedSemester]);

    useEffect(() => {
        if (show) {
            resetForm();
        }
    }, [show, selectedSemester]);

    const resetForm = () => {
        setFormData({
            subject: "",
            group: "",
            dayOfWeek: "",
            timeSlot: "",
            teacher: "",
            classroom: "",
            semester: selectedSemester || ""
        });
        setErrors({ general: "", validationErrors: [], conflictErrors: [] });
        setTimeSlots([]);
        setAvailability({
            available: true,
            checking: false,
            conflicts: [],
            groupTimeslotConflict: null
        });
        setFilteredTeachers([]);
        setLoading(false);
    };

    useEffect(() => {
        if (formData.subject && teachers.length > 0) {
            const subject = formData.subject.toLowerCase();
            const filtered = teachers.filter(teacher => {
                if (!teacher) return false;

                const positions = teacher.positions || [];
                const position = teacher.position || "";
                const fullName = teacher.fullName || "";

                return positions.some(pos => pos.toLowerCase().includes(subject)) ||
                    position.toLowerCase().includes(subject) ||
                    fullName.toLowerCase().includes(subject);
            });
            setFilteredTeachers(filtered);
        } else {
            setFilteredTeachers(teachers);
        }
    }, [formData.subject, teachers]);

    useEffect(() => {
        const loadTimeSlots = async () => {
            const dbName = databaseNameRef.current;
            if (!formData.dayOfWeek || !dbName) {
                setTimeSlots([]);
                return;
            }

            try {
                setLoadingTimeSlots(true);
                const response = await axios.get("http://localhost:3001/api/time-slots", {
                    params: { databaseName: dbName }
                });

                const dayTimeSlots = (response.data || []).filter(slot => {
                    if (!slot) return false;
                    const slotDayId = slot.dayOfWeek?._id || slot.dayOfWeek?.id;
                    const selectedDayId = formData.dayOfWeek;
                    return slotDayId === selectedDayId;
                });

                const availableTimeSlots = dayTimeSlots.filter(slot => slot.isAvailable !== false);
                setTimeSlots(availableTimeSlots);

                if (availableTimeSlots.length === 0) {
                    setErrors(prev => ({
                        ...prev,
                        validationErrors: [...prev.validationErrors, "Для цього дня не налаштовано часових слотів"]
                    }));
                }
            } catch (err) {
                console.error("Error loading time slots:", err);
                setTimeSlots([]);
                setErrors(prev => ({
                    ...prev,
                    general: "Помилка при завантаженні часу уроків"
                }));
            } finally {
                setLoadingTimeSlots(false);
            }
        };

        loadTimeSlots();
    }, [formData.dayOfWeek]);

    // Автоматична перевірка доступності при зміні даних
    useEffect(() => {
        const checkAllAvailability = async () => {
            const dbName = databaseNameRef.current;

            // Мінімальні умови для перевірки
            if (!formData.dayOfWeek || !formData.timeSlot || !dbName) {
                return;
            }

            // Перевіряємо тільки якщо є що перевіряти
            const hasResourcesToCheck = formData.classroom || formData.teacher || formData.group;
            if (!hasResourcesToCheck) {
                return;
            }

            try {
                setAvailability(prev => ({ ...prev, checking: true }));

                // Використовуємо ТІЛЬКИ ОДИН endpoint для перевірки
                const checkData = {
                    databaseName: dbName,
                    group: formData.group,
                    teacher: formData.teacher,
                    classroom: formData.classroom,
                    dayOfWeek: formData.dayOfWeek,
                    timeSlot: formData.timeSlot,
                    subject: formData.subject
                };

                // Використовуємо тільки /api/schedule/check-availability
                const scheduleCheckResponse = await axios.post("http://localhost:3001/api/schedule/check-availability", checkData);

                // Отримуємо унікальні конфлікти
                const uniqueConflicts = scheduleCheckResponse.data.conflicts || [];

                // Фільтруємо дублікати за типом
                const filteredConflicts = [];
                const seenTypes = new Set();

                uniqueConflicts.forEach(conflict => {
                    if (!seenTypes.has(conflict.type)) {
                        seenTypes.add(conflict.type);
                        filteredConflicts.push(conflict);
                    }
                });

                setAvailability({
                    available: scheduleCheckResponse.data.available,
                    checking: false,
                    conflicts: filteredConflicts,
                    groupTimeslotConflict: filteredConflicts.find(c => c.type === 'GROUP_TIMESLOT_CONFLICT')
                });

                // Оновлюємо список конфліктних помилок (без дублікатів)
                if (filteredConflicts.length > 0) {
                    const conflictMessages = filteredConflicts.map(c => c.message);
                    setErrors(prev => ({
                        ...prev,
                        conflictErrors: conflictMessages
                    }));
                } else {
                    setErrors(prev => ({ ...prev, conflictErrors: [] }));
                }
            } catch (err) {
                console.error("Error checking availability:", err);
                setAvailability({
                    available: true,
                    checking: false,
                    conflicts: [],
                    groupTimeslotConflict: null
                });
                setErrors(prev => ({ ...prev, conflictErrors: [] }));
            }
        };

        // Дебаунс запиту
        const timeoutId = setTimeout(checkAllAvailability, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.classroom, formData.teacher, formData.group, formData.dayOfWeek, formData.timeSlot, formData.subject]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = { ...prev };

            if (name === "dayOfWeek") {
                newData.dayOfWeek = value;
                newData.timeSlot = ""; // Скидаємо час при зміні дня
            } else if (name === "subject") {
                newData.subject = value;
                newData.teacher = ""; // Скидаємо викладача при зміні предмета
            } else if (name === "group") {
                newData.group = value;
            } else {
                newData[name] = value;
            }

            return newData;
        });

        // Очистити помилки при зміні поля
        if (errors.general || errors.validationErrors.length > 0 || errors.conflictErrors.length > 0) {
            setErrors({ general: "", validationErrors: [], conflictErrors: [] });
        }
    };

    const validateForm = () => {
        const validationErrors = [];
        let isValid = true;

        if (!formData.subject) {
            validationErrors.push("Вкажіть предмет");
            isValid = false;
        }
        if (!formData.group) {
            validationErrors.push("Оберіть групу");
            isValid = false;
        }
        if (!formData.dayOfWeek) {
            validationErrors.push("Оберіть день тижня");
            isValid = false;
        }
        if (!formData.timeSlot) {
            validationErrors.push("Оберіть час уроку");
            isValid = false;
        }
        if (!formData.teacher) {
            validationErrors.push("Оберіть викладача");
            isValid = false;
        }
        if (!formData.classroom) {
            validationErrors.push("Оберіть аудиторію");
            isValid = false;
        }

        // Додаткові перевірки
        if (formData.teacher && filteredTeachers.length === 0) {
            validationErrors.push("Не знайдено викладачів для обраного предмета");
            isValid = false;
        }

        setErrors(prev => ({
            ...prev,
            validationErrors
        }));

        return isValid;
    };

    const getAllErrors = () => {
        const allErrors = [
            ...errors.validationErrors,
            ...errors.conflictErrors
        ];

        // Видаляємо дублікати
        return [...new Set(allErrors)];
    };

    const handleSave = async () => {
        const dbName = databaseNameRef.current;
        if (!dbName) {
            setErrors({
                general: "Не вказано базу даних школи",
                validationErrors: [],
                conflictErrors: []
            });
            return;
        }

        if (!validateForm()) {
            return;
        }

        if (availability.checking) {
            setErrors({
                general: "Триває перевірка доступності...",
                validationErrors: [],
                conflictErrors: []
            });
            return;
        }

        if (!availability.available) {
            setErrors({
                general: "Знайдено конфлікти розкладу. Виправте їх перед збереженням.",
                validationErrors: errors.validationErrors,
                conflictErrors: errors.conflictErrors
            });
            return;
        }

        setLoading(true);

        try {
            const selectedDay = daysOfWeek.find(day => (day._id || day.id) === formData.dayOfWeek);
            if (!selectedDay) {
                setErrors({
                    general: "Обраний день тижня не знайдений",
                    validationErrors: [],
                    conflictErrors: []
                });
                setLoading(false);
                return;
            }

            // Створюємо дані БЕЗ _id
            const scheduleData = {
                subject: formData.subject,
                group: formData.group,
                dayOfWeek: selectedDay._id || selectedDay.id,
                timeSlot: formData.timeSlot,
                teacher: formData.teacher,
                classroom: formData.classroom,
                semester: selectedSemester,
                databaseName: dbName
                // НЕ додаємо _id - MongoDB згенерує його автоматично
            };

            console.log('Відправляємо дані для створення розкладу:', scheduleData);

            // Викликаємо API для створення розкладу
            const response = await axios.post("http://localhost:3001/api/schedule", scheduleData);

            if (response.data && response.data.schedule) {
                onSave(response.data.schedule);
                onClose();
            }
        } catch (error) {
            console.error("Error saving schedule:", error);

            if (error.response) {
                const errorData = error.response.data;

                if (error.response.status === 409) {
                    // Конфлікти
                    const conflictMessages = [];

                    if (errorData.conflictType === 'GROUP_TIMESLOT_CONFLICT') {
                        conflictMessages.push(errorData.details?.message || "Група вже має урок в цей час");
                    } else if (errorData.details?.message) {
                        conflictMessages.push(errorData.details.message);
                    } else if (errorData.message) {
                        conflictMessages.push(errorData.message);
                    }

                    setErrors({
                        general: "Конфлікт розкладу",
                        validationErrors: [],
                        conflictErrors: [...new Set(conflictMessages)]
                    });
                } else if (error.response.status === 400) {
                    // Помилки валідації, включаючи duplicate _id
                    if (errorData.error === 'DUPLICATE_ID_ERROR') {
                        setErrors({
                            general: "Технічна помилка: спроба створити запис з уже існуючим ID",
                            validationErrors: ["Будь ласка, спробуйте ще раз. Система автоматично згенерує новий ID."],
                            conflictErrors: []
                        });
                    } else {
                        const validationErrors = [];

                        if (errorData.missingFields) {
                            validationErrors.push(...errorData.missingFields.map(field => `Відсутнє поле: ${field}`));
                        }
                        if (errorData.message) {
                            validationErrors.push(errorData.message);
                        }

                        setErrors({
                            general: "Помилка валідації",
                            validationErrors: [...new Set(validationErrors)],
                            conflictErrors: []
                        });
                    }
                } else {
                    setErrors({
                        general: "Помилка сервера при створенні розкладу",
                        validationErrors: [],
                        conflictErrors: [errorData.message || error.message]
                    });
                }
            } else {
                setErrors({
                    general: "Помилка мережі",
                    validationErrors: [],
                    conflictErrors: ["Не вдалося з'єднатися з сервером"]
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const availableClassrooms = Array.isArray(classrooms)
        ? classrooms.filter(classroom => classroom?.isAvailable !== false && classroom?.isActive !== false)
        : [];

    const availableTeachers = Array.isArray(filteredTeachers)
        ? filteredTeachers.filter(teacher => teacher?.isAvailable !== false)
        : [];

    // Отримати інформацію про обраний часовий слот
    const selectedTimeSlotInfo = timeSlots.find(slot => slot._id === formData.timeSlot);

    // ОТРИМАТИ ВСІ УНІКАЛЬНІ ПОМИЛКИ
    const allErrors = getAllErrors();

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '20px',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <FaCalendar />
                        Додати заняття до розкладу
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '20px',
                            color: '#6b7280',
                            transition: 'color 0.2s',
                            opacity: loading ? 0.5 : 1
                        }}
                        onMouseOver={(e) => {
                            if (!loading) e.target.style.color = '#374151';
                        }}
                        onMouseOut={(e) => {
                            if (!loading) e.target.style.color = '#6b7280';
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Секція загальних помилок */}
                {errors.general && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <FaExclamationTriangle />
                        <strong>{errors.general}</strong>
                    </div>
                )}

                {/* Секція всіх помилок (включаючи конфлікти) */}
                {allErrors.length > 0 && (
                    <div style={{
                        backgroundColor: '#fef3c7',
                        border: '1px solid #f59e0b',
                        color: '#92400e',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <FaExclamationTriangle />
                            <strong>Знайдено помилки:</strong>
                        </div>
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                            {allErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Статус перевірки доступності */}
                {availability.checking && (
                    <div style={{
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <FaClock /> Перевірка доступності ресурсів...
                    </div>
                )}

                {/* Статус доступності */}
                {!availability.checking && availability.available && availability.conflicts.length === 0 &&
                    formData.dayOfWeek && formData.timeSlot &&
                    (formData.classroom || formData.teacher || formData.group) && (
                        <div style={{
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <FaCheckCircle /> Всі ресурси доступні
                        </div>
                    )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Поля форми */}
                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            <FaGraduationCap style={{
                                marginRight: '8px',
                                color: 'rgba(105, 180, 185, 1)',
                                fontSize: '14px'
                            }} />
                            Семестр *
                        </label>
                        <select
                            value={formData.semester}
                            disabled
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                backgroundColor: '#f9fafb',
                                color: '#6b7280'
                            }}
                        >
                            <option value={selectedSemester}>
                                {Array.isArray(semesters) && semesters.find(s => s?._id === selectedSemester)?.name}
                                {Array.isArray(semesters) && semesters.find(s => s?._id === selectedSemester)?.year}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            <FaBook style={{
                                marginRight: '8px',
                                color: 'rgba(105, 180, 185, 1)',
                                fontSize: '14px'
                            }} />
                            Предмет *
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Введіть назву предмета"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: errors.validationErrors.some(e => e.includes("предмет")) ?
                                    '1px solid #dc2626' : '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = errors.validationErrors.some(e => e.includes("предмет")) ?
                                    '#dc2626' : '#e5e7eb';
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            <FaUsers style={{
                                marginRight: '8px',
                                color: 'rgba(105, 180, 185, 1)',
                                fontSize: '14px'
                            }} />
                            Група *
                        </label>
                        <select
                            name="group"
                            value={formData.group}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: errors.validationErrors.some(e => e.includes("груп")) ||
                                    availability.conflicts.some(c => c.type === 'GROUP_TIMESLOT_CONFLICT') ?
                                    '1px solid #dc2626' : '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                backgroundColor: availability.conflicts.some(c => c.type === 'GROUP_TIMESLOT_CONFLICT') ? '#fef2f2' : 'white'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = errors.validationErrors.some(e => e.includes("груп")) ||
                                    availability.conflicts.some(c => c.type === 'GROUP_TIMESLOT_CONFLICT') ?
                                    '#dc2626' : '#e5e7eb';
                            }}
                        >
                            <option value="">Оберіть групу</option>
                            {Array.isArray(groups) && groups.map(group => (
                                <option key={group?._id} value={group?._id}>
                                    {group?.name}
                                </option>
                            ))}
                        </select>
                        {availability.conflicts.some(c => c.type === 'GROUP_TIMESLOT_CONFLICT') && (
                            <div style={{
                                fontSize: '12px',
                                color: '#dc2626',
                                marginTop: '4px'
                            }}>
                                ⚠️ Група вже має урок в цей час
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            <FaCalendar style={{
                                marginRight: '8px',
                                color: 'rgba(105, 180, 185, 1)',
                                fontSize: '14px'
                            }} />
                            День тижня *
                        </label>
                        <select
                            name="dayOfWeek"
                            value={formData.dayOfWeek}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: errors.validationErrors.some(e => e.includes("день тижня")) ?
                                    '1px solid #dc2626' : '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                        >
                            <option value="">Оберіть день</option>
                            {Array.isArray(daysOfWeek) && daysOfWeek.map(day => (
                                <option key={day?._id || day?.id} value={day?._id || day?.id}>
                                    {day?.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            <FaClock style={{
                                marginRight: '8px',
                                color: 'rgba(105, 180, 185, 1)',
                                fontSize: '14px'
                            }} />
                            Час уроку *
                        </label>
                        <select
                            name="timeSlot"
                            value={formData.timeSlot}
                            onChange={handleChange}
                            disabled={!formData.dayOfWeek || loadingTimeSlots}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: errors.validationErrors.some(e => e.includes("час уроку") || e.includes("час")) ?
                                    '1px solid #dc2626' : '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                opacity: !formData.dayOfWeek || loadingTimeSlots ? 0.6 : 1
                            }}
                        >
                            <option value="">
                                {loadingTimeSlots ? 'Завантаження...' :
                                    !formData.dayOfWeek ? 'Спочатку оберіть день' :
                                        timeSlots.length === 0 ? 'Немає доступних часових слотів' :
                                            'Оберіть час'}
                            </option>
                            {Array.isArray(timeSlots) && timeSlots.map(slot => (
                                <option key={slot?._id} value={slot?._id}>
                                    {slot?.order}. {slot?.startTime} - {slot?.endTime}
                                </option>
                            ))}
                        </select>
                        {formData.timeSlot && selectedTimeSlotInfo && (
                            <div style={{
                                fontSize: '12px',
                                color: '#059669',
                                marginTop: '4px'
                            }}>
                                Обрано: Урок {selectedTimeSlotInfo.order} ({selectedTimeSlotInfo.startTime} - {selectedTimeSlotInfo.endTime})
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            <FaChalkboardTeacher style={{
                                marginRight: '8px',
                                color: 'rgba(105, 180, 185, 1)',
                                fontSize: '14px'
                            }} />
                            Викладач *
                            {formData.subject && (
                                <span style={{
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    fontWeight: 'normal',
                                    marginLeft: '8px'
                                }}>
                                    ({availableTeachers.length} доступних)
                                </span>
                            )}
                        </label>
                        <select
                            name="teacher"
                            value={formData.teacher}
                            onChange={handleChange}
                            disabled={availableTeachers.length === 0}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: errors.validationErrors.some(e => e.includes("викладач")) ||
                                    availability.conflicts.some(c => c.type === 'TEACHER_BUSY') ?
                                    '1px solid #dc2626' : '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                opacity: availableTeachers.length === 0 ? 0.6 : 1,
                                backgroundColor: availability.conflicts.some(c => c.type === 'TEACHER_BUSY') ? '#fef2f2' : 'white'
                            }}
                        >
                            <option value="">
                                {availableTeachers.length === 0 ?
                                    (formData.subject ? 'Немає викладачів для цього предмета' : 'Оберіть викладача')
                                    : 'Оберіть викладача'
                                }
                            </option>
                            {availableTeachers.map(teacher => (
                                <option key={teacher?._id} value={teacher?._id}>
                                    {teacher?.fullName}
                                    {teacher?.position && ` - ${teacher.position}`}
                                </option>
                            ))}
                        </select>
                        {availability.conflicts.some(c => c.type === 'TEACHER_BUSY') && (
                            <div style={{
                                fontSize: '12px',
                                color: '#dc2626',
                                marginTop: '4px'
                            }}>
                                ⚠️ Викладач вже веде урок в цей час
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            <FaDoorOpen style={{
                                marginRight: '8px',
                                color: 'rgba(105, 180, 185, 1)',
                                fontSize: '14px'
                            }} />
                            Аудиторія *
                        </label>
                        <select
                            name="classroom"
                            value={formData.classroom}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: errors.validationErrors.some(e => e.includes("аудиторію") || e.includes("аудиторія")) ||
                                    availability.conflicts.some(c => c.type === 'CLASSROOM_BUSY') ?
                                    '1px solid #dc2626' : '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                backgroundColor: availability.conflicts.some(c => c.type === 'CLASSROOM_BUSY') ? '#fef2f2' : 'white'
                            }}
                        >
                            <option value="">Оберіть аудиторію</option>
                            {availableClassrooms.map(classroom => (
                                <option key={classroom?._id} value={classroom?._id}>
                                    {classroom?.name} ({classroom?.type === 'lecture' ? 'Лекційна' :
                                        classroom?.type === 'practice' ? 'Практична' :
                                            classroom?.type === 'lab' ? 'Лабораторія' : 'Загальна'})
                                </option>
                            ))}
                        </select>
                        {availability.conflicts.some(c => c.type === 'CLASSROOM_BUSY') && (
                            <div style={{
                                fontSize: '12px',
                                color: '#dc2626',
                                marginTop: '4px'
                            }}>
                                ⚠️ Аудиторія вже зайнята в цей час
                            </div>
                        )}
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '24px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s',
                            opacity: loading ? 0.5 : 1
                        }}
                        onMouseOver={(e) => {
                            if (!loading) e.target.style.backgroundColor = '#4b5563';
                        }}
                        onMouseOut={(e) => {
                            if (!loading) e.target.style.backgroundColor = '#6b7280';
                        }}
                    >
                        <FaTimes />
                        Скасувати
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading || availability.checking || !availability.available || availability.conflicts.length > 0}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: (loading || availability.checking || !availability.available || availability.conflicts.length > 0) ?
                                '#d1d5db' : 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: (loading || availability.checking || !availability.available || availability.conflicts.length > 0) ?
                                'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s',
                            opacity: loading ? 0.5 : 1
                        }}
                        onMouseOver={(e) => {
                            if (loading || availability.checking || !availability.available || availability.conflicts.length > 0) return;
                            e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                        }}
                        onMouseOut={(e) => {
                            if (loading || availability.checking || !availability.available || availability.conflicts.length > 0) return;
                            e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                Створення...
                            </>
                        ) : (
                            <>
                                <FaSave />
                                Створити
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateScheduleModal;