import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    FaTimes,
    FaSave,
    FaCalendar,
    FaClock,
    FaChalkboardTeacher,
    FaDoorOpen,
    FaExclamationTriangle,
    FaCheckCircle,
    FaExchangeAlt,
    FaInfoCircle,
    FaUsers,
    FaUserFriends
} from "react-icons/fa";
import axios from "axios";
import CurrentScheduleInfo from "./CurrentScheduleInfo";

const EditScheduleModal = ({
    show,
    onHide,
    schedule,
    daysOfWeek,
    classrooms,
    timeSlots,
    teachers,
    groups = [],
    onSave,
    loading = false,
    databaseName
}) => {
    const [formData, setFormData] = useState({
        dayOfWeek: "",
        timeSlot: "",
        classroom: "",
        teacher: "",
    });

    const [originalData, setOriginalData] = useState({
        dayOfWeek: "",
        timeSlot: "",
        classroom: "",
        teacher: "",
    });

    const [errors, setErrors] = useState({
        general: "",
        validationErrors: [],
        conflictErrors: []
    });

    const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [availability, setAvailability] = useState({
        available: true,
        checking: false,
        conflicts: [],
        duplicateConflict: null
    });

    const [isChanged, setIsChanged] = useState(false);
    const [showConflictAlert, setShowConflictAlert] = useState(false);
    const [conflictDetails, setConflictDetails] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedGroupInfo, setSelectedGroupInfo] = useState(null);
    const [subgroupsInfo, setSubgroupsInfo] = useState([]);

    const databaseNameRef = useRef(databaseName);
    const checkAvailabilityTimeoutRef = useRef(null);
    const previousScheduleIdRef = useRef(null);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        databaseNameRef.current = databaseName;
    }, [databaseName]);

    // Ініціалізація даних при відкритті модального вікна (лише один раз при відкритті)
    useEffect(() => {
        // Перевіряємо, чи модальне вікно відкрито і чи є schedule
        if (show && schedule && schedule._id) {
            // Перевіряємо, чи це той самий schedule, щоб уникнути повторної ініціалізації
            const scheduleId = schedule._id;

            if (previousScheduleIdRef.current !== scheduleId || !isInitializedRef.current) {
                console.log('EditScheduleModal ініціалізується з новим schedule:', scheduleId);

                const initialData = {
                    dayOfWeek: schedule.dayOfWeek?._id || schedule.dayOfWeek?.id || schedule.dayOfWeek || "",
                    timeSlot: schedule.timeSlot?._id || schedule.timeSlot || "",
                    classroom: schedule.classroom?._id || schedule.classroom || "",
                    teacher: schedule.teacher?._id || schedule.teacher || "",
                };

                setFormData(initialData);
                setOriginalData(initialData);
                setErrors({ general: "", validationErrors: [], conflictErrors: [] });
                setAvailability({ available: true, checking: false, conflicts: [], duplicateConflict: null });
                setIsChanged(false);
                setShowConflictAlert(false);
                setConflictDetails(null);
                setSaveSuccess(false);

                // Знаходимо інформацію про групу (тільки для відображення)
                const groupId = schedule.group?._id || schedule.group;
                if (groupId && groups.length > 0) {
                    const group = groups.find(g => g._id === groupId);
                    setSelectedGroupInfo(group);

                    if (group?.hasSubgroups && group?.subgroups?.length > 0) {
                        setSubgroupsInfo(group.subgroups);
                    } else {
                        setSubgroupsInfo([]);
                    }
                }

                // Оновлення фільтрованих часових слотів
                if (initialData.dayOfWeek) {
                    updateTimeSlots(initialData.dayOfWeek);
                }

                // Оновлення фільтрованих викладачів
                updateFilteredTeachers();

                previousScheduleIdRef.current = scheduleId;
                isInitializedRef.current = true;
            }
        }

        // Скидання при закритті модального вікна
        if (!show) {
            isInitializedRef.current = false;
            previousScheduleIdRef.current = null;
        }

        return () => {
            // Очищення таймаутів при розмонтуванні
            if (checkAvailabilityTimeoutRef.current) {
                clearTimeout(checkAvailabilityTimeoutRef.current);
            }
        };
    }, [show, schedule, groups]);

    // Мемоізована функція для оновлення часових слотів
    const updateTimeSlots = useCallback((dayOfWeekId) => {
        if (!dayOfWeekId || !timeSlots || !Array.isArray(timeSlots)) {
            setFilteredTimeSlots([]);
            return;
        }

        const filtered = timeSlots.filter(slot => {
            if (!slot) return false;
            const slotDayId = slot.dayOfWeek?._id || slot.dayOfWeek?.id || slot.dayOfWeek;
            return slotDayId === dayOfWeekId;
        });

        const uniqueSlots = [];
        const seen = new Set();

        filtered.forEach(slot => {
            const key = `${slot.order}-${slot.startTime}-${slot.endTime}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueSlots.push(slot);
            }
        });

        const sortedSlots = uniqueSlots.sort((a, b) => a.order - b.order);
        setFilteredTimeSlots(sortedSlots);

        // Перевіряємо, чи поточний обраний слот є в новому списку
        const currentTimeSlotId = formData.timeSlot;
        if (currentTimeSlotId) {
            const currentSlotExists = sortedSlots.some(slot => slot._id === currentTimeSlotId);
            if (!currentSlotExists) {
                setFormData(prev => ({ ...prev, timeSlot: "" }));
            }
        }
    }, [timeSlots, formData.timeSlot]);

    // Мемоізована функція для оновлення списку викладачів
    const updateFilteredTeachers = useCallback(() => {
        if (!teachers || !Array.isArray(teachers)) {
            setFilteredTeachers([]);
            return;
        }

        const subject = schedule?.subject || "";
        if (subject) {
            const subjectLower = subject.toLowerCase();
            const filtered = teachers.filter(teacher => {
                if (!teacher) return false;
                const positions = teacher.positions || [];
                const position = teacher.position || "";
                const fullName = teacher.fullName || "";
                return positions.some(pos => pos.toLowerCase().includes(subjectLower)) ||
                    position.toLowerCase().includes(subjectLower) ||
                    fullName.toLowerCase().includes(subjectLower);
            });
            setFilteredTeachers(filtered);
        } else {
            setFilteredTeachers(teachers);
        }
    }, [teachers, schedule]);

    // ПЕРЕВІРКА ДОСТУПНОСТІ РЕСУРСІВ З УРАХУВАННЯМ ПІДГРУП
    const checkAvailability = useCallback(async () => {
        const dbName = databaseNameRef.current;
        if (!dbName || !schedule?._id) return;

        // МІНІМАЛЬНІ УМОВИ ДЛЯ ПЕРЕВІРКИ
        const hasDataToCheck = formData.dayOfWeek && formData.timeSlot &&
            (formData.classroom || formData.teacher || schedule.group?._id || schedule.group);

        if (!hasDataToCheck) {
            setAvailability({ available: true, checking: false, conflicts: [], duplicateConflict: null });
            return;
        }

        try {
            setAvailability(prev => ({ ...prev, checking: true }));

            const checkData = {
                databaseName: dbName,
                group: schedule.group?._id || schedule.group,
                subgroup: schedule.subgroup || "all", // Використовуємо поточну підгрупу з schedule
                teacher: formData.teacher,
                classroom: formData.classroom,
                dayOfWeek: formData.dayOfWeek,
                timeSlot: formData.timeSlot,
                excludeId: schedule._id
            };

            // ПЕРЕВІРКА ДОСТУПНОСТІ
            const response = await axios.post("http://localhost:3001/api/schedule/check-availability", checkData);

            const uniqueConflicts = response.data.conflicts || [];

            // ФІЛЬТРУЄМО ДУБЛІКАТИ ЗА ТИПОМ
            const filteredConflicts = [];
            const seenTypes = new Set();

            uniqueConflicts.forEach(conflict => {
                if (!seenTypes.has(conflict.type)) {
                    seenTypes.add(conflict.type);
                    filteredConflicts.push(conflict);
                }
            });

            // ПЕРЕВІРКА, ЧИ Є КОНФЛІКТ ДВОХ УРОКІВ В ОДНІЙ КОМІРЦІ
            const duplicateConflict = filteredConflicts.find(c =>
                c.type === 'GROUP_TIMESLOT_CONFLICT' ||
                c.type === 'SUBGROUP_CONFLICT' ||
                c.type === 'FULL_GROUP_CONFLICT'
            );

            setAvailability({
                available: response.data.available,
                checking: false,
                conflicts: filteredConflicts,
                duplicateConflict: duplicateConflict
            });

            // ПОКАЗУЄМО СПОВІЩЕННЯ ПРО КОНФЛІКТИ
            if (duplicateConflict) {
                setShowConflictAlert(true);
                setConflictDetails(duplicateConflict);
                setErrors(prev => ({
                    ...prev,
                    conflictErrors: [duplicateConflict.message]
                }));
            } else {
                setShowConflictAlert(false);
                setConflictDetails(null);
                setErrors(prev => ({ ...prev, conflictErrors: [] }));
            }

        } catch (err) {
            console.error("Error checking availability:", err);
            setAvailability({
                available: true,
                checking: false,
                conflicts: [],
                duplicateConflict: null
            });
            setShowConflictAlert(false);
            setConflictDetails(null);
        }
    }, [schedule, formData.dayOfWeek, formData.timeSlot, formData.classroom, formData.teacher]);

    // ПЕРЕВІРКА ЗМІН У ФОРМІ з дебаунсом
    useEffect(() => {
        if (!schedule) return;

        const hasChanges =
            formData.dayOfWeek !== originalData.dayOfWeek ||
            formData.timeSlot !== originalData.timeSlot ||
            formData.classroom !== originalData.classroom ||
            formData.teacher !== originalData.teacher;

        setIsChanged(hasChanges);

        // Очистити попередній таймаут
        if (checkAvailabilityTimeoutRef.current) {
            clearTimeout(checkAvailabilityTimeoutRef.current);
        }

        // АВТОМАТИЧНА ПЕРЕВІРКА ДОСТУПНОСТІ ПРИ ЗМІНІ з дебаунсом
        if (hasChanges) {
            checkAvailabilityTimeoutRef.current = setTimeout(() => {
                checkAvailability();
            }, 500); // Затримка 500мс
        } else {
            setAvailability({ available: true, checking: false, conflicts: [], duplicateConflict: null });
            setShowConflictAlert(false);
        }

        // Очищення таймауту при розмонтуванні
        return () => {
            if (checkAvailabilityTimeoutRef.current) {
                clearTimeout(checkAvailabilityTimeoutRef.current);
            }
        };
    }, [formData, originalData, schedule, checkAvailability]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = { ...prev };

            if (name === "dayOfWeek") {
                newData.dayOfWeek = value;
                newData.timeSlot = ""; // СКИДАЄМО ЧАС ПРИ ЗМІНІ ДНЯ
                updateTimeSlots(value);
            } else {
                newData[name] = value;
            }

            return newData;
        });

        // ОЧИСТИТИ ПОМИЛКИ ПРИ ЗМІНІ ПОЛЯ
        if (errors.general || errors.validationErrors.length > 0 || errors.conflictErrors.length > 0) {
            setErrors({ general: "", validationErrors: [], conflictErrors: [] });
        }
    };

    const validateForm = () => {
        const validationErrors = [];
        let isValid = true;

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

        setErrors(prev => ({
            ...prev,
            validationErrors
        }));

        return isValid;
    };

    const formatTimeSlot = (timeSlot) => {
        if (!timeSlot) return 'Не вказано';
        if (typeof timeSlot === 'object') {
            return `${timeSlot.order}. ${timeSlot.startTime} - ${timeSlot.endTime}`;
        }
        return timeSlot;
    };

    const handleSave = async () => {
        const dbName = databaseNameRef.current;
        if (!dbName || !schedule?._id) {
            setErrors({
                general: "Відсутні обов'язкові дані",
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

        // Якщо є конфлікт двох уроків в одній комірці, запитати підтвердження
        if (availability.duplicateConflict) {
            const conflictType = availability.duplicateConflict.type;
            let message = "";

            if (conflictType === 'SUBGROUP_CONFLICT') {
                message = `Увага! Ви намагаєтесь перемістити урок для підгрупи на час, де вже є урок для цієї ж підгрупи.\n\n` +
                    `Поточний урок: ${availability.duplicateConflict.details?.existingSubject || 'Невідомий предмет'}\n` +
                    `Викладач: ${availability.duplicateConflict.details?.existingTeacher || 'Невідомий'}\n` +
                    `Підгрупа: ${schedule.subgroup || 'Вся група'}\n\n` +
                    "Ви впевнені, що хочете продовжити?";
            } else if (conflictType === 'FULL_GROUP_CONFLICT') {
                message = `Увага! Ви намагаєтесь перемістити урок для підгрупи на час, де вже є урок для всієї групи.\n\n` +
                    `Поточний урок: ${availability.duplicateConflict.details?.existingSubject || 'Невідомий предмет'}\n` +
                    `Викладач: ${availability.duplicateConflict.details?.existingTeacher || 'Невідомий'}\n\n` +
                    "Ви впевнені, що хочете продовжити?";
            } else {
                message = "Увага! Ви намагаєтесь перемістити урок на час, де вже є інший урок.\n\n" +
                    `Поточний урок: ${availability.duplicateConflict.details?.existingSubject || 'Невідомий предмет'}\n` +
                    `Викладач: ${availability.duplicateConflict.details?.existingTeacher || 'Невідомий'}\n\n` +
                    "Ви впевнені, що хочете продовжити?";
            }

            const userConfirmed = window.confirm(message);

            if (!userConfirmed) {
                return;
            }
        }

        setIsSaving(true);

        try {
            // Підготуємо дані для оновлення (підгрупа залишається незмінною)
            const updateData = {
                databaseName: dbName,
                dayOfWeek: formData.dayOfWeek,
                timeSlot: formData.timeSlot,
                teacher: formData.teacher,
                classroom: formData.classroom,
                subject: schedule.subject,
                group: schedule.group?._id || schedule.group,
                subgroup: schedule.subgroup || "all", // Беремо підгрупу з початкового schedule
                semester: schedule.semester?._id || schedule.semester
            };

            console.log('Оновлення розкладу з даними:', updateData);

            // Використовуємо PUT endpoint для оновлення
            const response = await axios.put(`http://localhost:3001/api/schedule/${schedule._id}`, updateData);

            if (response.data && response.data.schedule) {
                setSaveSuccess(true);

                if (onSave) {
                    onSave(response.data.schedule);
                }

                setTimeout(() => {
                    setSaveSuccess(false);
                    onHide();
                }, 2000);
            }

        } catch (error) {
            console.error("Error updating schedule:", error);

            if (error.response) {
                const errorData = error.response.data;

                if (error.response.status === 409) {
                    const conflictMessages = [];

                    if (errorData.conflictType === 'GROUP_TIMESLOT_CONFLICT') {
                        conflictMessages.push(errorData.details?.message || "Група вже має урок в цей час");
                    } else if (errorData.conflictType === 'SUBGROUP_CONFLICT') {
                        conflictMessages.push(errorData.details?.message || "Підгрупа вже має урок в цей час");
                    } else if (errorData.conflictType === 'FULL_GROUP_CONFLICT') {
                        conflictMessages.push(errorData.details?.message || "Вся група вже має урок в цей час");
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
                } else {
                    setErrors({
                        general: "Помилка сервера",
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
            setIsSaving(false);
        }
    };

    const getAllErrors = () => {
        const allErrors = [
            ...errors.validationErrors,
            ...errors.conflictErrors
        ];
        return [...new Set(allErrors)];
    };

    // Отримати інформацію про обраний часовий слот
    const selectedTimeSlotInfo = filteredTimeSlots.find(slot => slot._id === formData.timeSlot);

    // Отримати інформацію про обраний день тижня
    const selectedDayInfo = Array.isArray(daysOfWeek)
        ? daysOfWeek.find(day => (day._id || day.id) === formData.dayOfWeek)
        : null;

    // Отримати інформацію про обрану аудиторію
    const selectedClassroomInfo = Array.isArray(classrooms)
        ? classrooms.find(classroom => classroom._id === formData.classroom)
        : null;

    // Отримати інформацію про обраного викладача
    const selectedTeacherInfo = filteredTeachers.find(teacher => teacher._id === formData.teacher);

    const allErrors = getAllErrors();

    if (!show || !schedule) return null;

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
                maxWidth: '600px',
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
                        <FaExchangeAlt />
                        Редагування заняття
                        {schedule.subgroup && schedule.subgroup !== 'all' &&
                            ` (Підгрупа ${schedule.subgroup})`
                        }
                    </h2>
                    <button
                        onClick={onHide}
                        disabled={isSaving}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontSize: '20px',
                            color: '#6b7280',
                            transition: 'color 0.2s',
                            opacity: isSaving ? 0.5 : 1
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

                {/* Повідомлення про успішне збереження */}
                {saveSuccess && (
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
                        <FaCheckCircle />
                        <strong>Заняття успішно оновлено!</strong>
                    </div>
                )}

                {/* Поточна інформація про заняття */}
                <CurrentScheduleInfo
                    schedule={schedule}
                    formatTimeSlot={formatTimeSlot}
                />

                {/* Заголовок для редагування */}
                <div style={{
                    backgroundColor: '#f0f9ff',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid rgba(105, 180, 185, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <FaInfoCircle style={{ color: 'rgba(105, 180, 185, 1)' }} />
                    <div>
                        <strong style={{ color: '#374151' }}>Змініть параметри заняття нижче</strong>
                    </div>
                </div>

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
                    isChanged && (
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
                            <FaCheckCircle /> Ресурси доступні для зміни
                        </div>
                    )}

                {/* Секція всіх помилок */}
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

                {/* Форма редагування - тільки день, час, викладач, аудиторія */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* День тижня */}
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
                        {selectedDayInfo && (
                            <div style={{
                                fontSize: '12px',
                                color: '#059669',
                                marginTop: '4px'
                            }}>
                                Обрано: {selectedDayInfo.name}
                            </div>
                        )}
                    </div>

                    {/* Час уроку */}
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
                            disabled={!formData.dayOfWeek}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: errors.validationErrors.some(e => e.includes("час уроку")) ?
                                    '1px solid #dc2626' : '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                opacity: !formData.dayOfWeek ? 0.6 : 1
                            }}
                        >
                            <option value="">
                                {!formData.dayOfWeek ? 'Спочатку оберіть день' :
                                    filteredTimeSlots.length === 0 ? 'Немає доступних часових слотів' :
                                        'Оберіть час'}
                            </option>
                            {filteredTimeSlots.map(slot => (
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

                    {/* Викладач */}
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
                            {schedule.subject && (
                                <span style={{
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    fontWeight: 'normal',
                                    marginLeft: '8px'
                                }}>
                                    ({filteredTeachers.length} доступних для предмета)
                                </span>
                            )}
                        </label>
                        <select
                            name="teacher"
                            value={formData.teacher}
                            onChange={handleChange}
                            disabled={filteredTeachers.length === 0}
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
                                opacity: filteredTeachers.length === 0 ? 0.6 : 1,
                                backgroundColor: availability.conflicts.some(c => c.type === 'TEACHER_BUSY') ? '#fef2f2' : 'white'
                            }}
                        >
                            <option value="">
                                {filteredTeachers.length === 0 ?
                                    'Немає доступних викладачів' : 'Оберіть викладача'
                                }
                            </option>
                            {filteredTeachers.map(teacher => (
                                <option key={teacher?._id} value={teacher?._id}>
                                    {teacher?.fullName}
                                    {teacher?.position && ` - ${teacher.position}`}
                                </option>
                            ))}
                        </select>
                        {selectedTeacherInfo && (
                            <div style={{
                                fontSize: '12px',
                                color: '#059669',
                                marginTop: '4px'
                            }}>
                                Обрано: {selectedTeacherInfo.fullName}
                            </div>
                        )}
                    </div>

                    {/* Аудиторія */}
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
                                border: errors.validationErrors.some(e => e.includes("аудиторію")) ||
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
                            {Array.isArray(classrooms) && classrooms.map(classroom => (
                                <option key={classroom?._id} value={classroom?._id}>
                                    {classroom?.name} ({classroom?.type === 'lecture' ? 'Лекційна' :
                                        classroom?.type === 'practice' ? 'Практична' :
                                            classroom?.type === 'lab' ? 'Лабораторія' : 'Загальна'})
                                </option>
                            ))}
                        </select>
                        {selectedClassroomInfo && (
                            <div style={{
                                fontSize: '12px',
                                color: '#059669',
                                marginTop: '4px'
                            }}>
                                Обрано: {selectedClassroomInfo.name} ({selectedClassroomInfo.type === 'lecture' ? 'Лекційна' :
                                    selectedClassroomInfo.type === 'practice' ? 'Практична' :
                                        selectedClassroomInfo.type === 'lab' ? 'Лабораторія' : 'Загальна'})
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
                        onClick={onHide}
                        disabled={isSaving}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s',
                            opacity: isSaving ? 0.5 : 1
                        }}
                    >
                        <FaTimes />
                        Скасувати
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || !isChanged || availability.checking ||
                            (!availability.available && !availability.duplicateConflict)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: (isSaving || !isChanged || availability.checking ||
                                (!availability.available && !availability.duplicateConflict)) ?
                                '#d1d5db' : 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: (isSaving || !isChanged || availability.checking ||
                                (!availability.available && !availability.duplicateConflict)) ?
                                'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s',
                            opacity: isSaving ? 0.5 : 1
                        }}
                    >
                        {isSaving ? (
                            <>
                                <div className="spinner" style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                Оновлення...
                            </>
                        ) : (
                            <>
                                <FaSave />
                                Зберегти зміни
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditScheduleModal;
