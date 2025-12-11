import React, { useState, useEffect, useRef } from "react"; // Додайте useRef
import {
    FaTimes,
    FaSave,
    FaUsers,
    FaCalendar,
    FaClock,
    FaChalkboardTeacher,
    FaDoorOpen,
    FaBook,
    FaGraduationCap
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
    const [error, setError] = useState("");
    const [timeSlots, setTimeSlots] = useState([]);
    const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
    const [daysOfWeek, setDaysOfWeek] = useState([]);
    const [availability, setAvailability] = useState({ available: true, conflicts: {} });
    const [filteredTeachers, setFilteredTeachers] = useState([]);

    // Використовуємо useRef для стабільної версії databaseName
    const databaseNameRef = useRef(schoolDatabaseName);

    // Оновлюємо ref коли змінюється schoolDatabaseName
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
            }
        };

        if (show) {
            loadDaysOfWeek();
            setFormData(prev => ({
                ...prev,
                semester: selectedSemester
            }));
        }
    }, [show, selectedSemester]); // Видалили schoolDatabaseName з залежностей

    useEffect(() => {
        if (show) {
            setFormData({
                subject: "",
                group: "",
                dayOfWeek: "",
                timeSlot: "",
                teacher: "",
                classroom: "",
                semester: selectedSemester || ""
            });
            setError("");
            setTimeSlots([]);
            setAvailability({ available: true, conflicts: {} });
            setFilteredTeachers([]);
        }
    }, [show, selectedSemester]);

    // Фільтрація викладачів за предметом
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
                console.log("Завантаження часових слотів для дня:", formData.dayOfWeek);

                const response = await axios.get("http://localhost:3001/api/time-slots", {
                    params: { databaseName: dbName }
                });
                console.log("Усі часові слоти:", response.data);

                const dayTimeSlots = (response.data || []).filter(slot => {
                    if (!slot) return false;
                    const slotDayId = slot.dayOfWeek?._id || slot.dayOfWeek?.id;
                    const selectedDayId = formData.dayOfWeek;
                    return slotDayId === selectedDayId;
                });

                const availableTimeSlots = dayTimeSlots.filter(slot => slot.isAvailable !== false);
                console.log("Відфільтровані часові слоти:", availableTimeSlots);

                setTimeSlots(availableTimeSlots);
                setError("");
            } catch (err) {
                console.error("Error loading time slots:", err);
                setTimeSlots([]);
                setError("Помилка при завантаженні часу уроків");
            } finally {
                setLoadingTimeSlots(false);
            }
        };

        loadTimeSlots();
    }, [formData.dayOfWeek]); // Видалили schoolDatabaseName з залежностей

    useEffect(() => {
        const checkAvailability = async () => {
            const dbName = databaseNameRef.current;
            if (!formData.dayOfWeek || !formData.timeSlot || !formData.classroom || !formData.teacher || !dbName) {
                return;
            }

            try {
                const params = new URLSearchParams({
                    dayOfWeekId: formData.dayOfWeek,
                    timeSlotId: formData.timeSlot,
                    classroomId: formData.classroom,
                    teacherId: formData.teacher,
                    databaseName: dbName
                });

                const response = await axios.get(`http://localhost:3001/api/available/check-availability?${params}`);
                setAvailability(response.data || { available: true, conflicts: {} });
            } catch (err) {
                console.error("Error checking availability:", err);
                setAvailability({ available: true, conflicts: {} });
            }
        };

        checkAvailability();
    }, [formData.classroom, formData.teacher, formData.dayOfWeek, formData.timeSlot]); // Видалили schoolDatabaseName з залежностей

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            if (name === "dayOfWeek") {
                return {
                    ...prev,
                    [name]: value,
                    timeSlot: ""
                };
            }
            if (name === "subject") {
                return {
                    ...prev,
                    [name]: value,
                    teacher: ""
                };
            }
            return {
                ...prev,
                [name]: value
            };
        });
    };

    const handleSave = () => {
        const dbName = databaseNameRef.current;
        if (!dbName) {
            setError("Не вказано базу даних школи");
            return;
        }

        if (!formData.subject || !formData.group || !formData.dayOfWeek ||
            !formData.timeSlot || !formData.teacher || !formData.classroom) {
            setError("Усі поля повинні бути заповнені");
            return;
        }

        if (!availability.available) {
            setError("Знайдено конфлікти розкладу. Виправте їх перед збереженням.");
            return;
        }

        const selectedDay = daysOfWeek.find(day => (day._id || day.id) === formData.dayOfWeek);
        if (!selectedDay) {
            setError("Обраний день тижня не знайдений");
            return;
        }

        const scheduleData = {
            subject: formData.subject,
            group: formData.group,
            dayOfWeek: selectedDay._id || selectedDay.id,
            timeSlot: formData.timeSlot,
            teacher: formData.teacher,
            classroom: formData.classroom,
            semester: selectedSemester,
            databaseName: dbName // Додаємо databaseName до даних для збереження
        };

        onSave(scheduleData);
    };

    const availableClassrooms = Array.isArray(classrooms)
        ? classrooms.filter(classroom => classroom?.isAvailable !== false)
        : [];

    const availableTeachers = Array.isArray(filteredTeachers)
        ? filteredTeachers.filter(teacher => teacher?.isAvailable !== false)
        : [];

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
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '20px',
                            color: '#6b7280',
                            transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.color = '#374151';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = '#6b7280';
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {error && (
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
                        <FaTimes />
                        {error}
                    </div>
                )}

                {!availability.available && (
                    <div style={{
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px'
                    }}>
                        <strong>Конфлікти розкладу:</strong>
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                            {availability.conflicts.classroom && (
                                <li>Аудиторія зайнята</li>
                            )}
                            {availability.conflicts.teacher && (
                                <li>Викладач зайнятий</li>
                            )}
                        </ul>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                                border: '1px solid #e5e7eb',
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
                                e.target.style.borderColor = '#e5e7eb';
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
                                border: '1px solid #e5e7eb',
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
                                e.target.style.borderColor = '#e5e7eb';
                            }}
                        >
                            <option value="">Оберіть групу</option>
                            {Array.isArray(groups) && groups.map(group => (
                                <option key={group?._id} value={group?._id}>
                                    {group?.name}
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
                                border: '1px solid #e5e7eb',
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
                                border: '1px solid #e5e7eb',
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
                        {formData.dayOfWeek && timeSlots.length === 0 && !loadingTimeSlots && (
                            <div style={{
                                fontSize: '12px',
                                color: '#dc2626',
                                marginTop: '4px'
                            }}>
                                Для цього дня не налаштовано розклад дзвінків
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
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                opacity: availableTeachers.length === 0 ? 0.6 : 1
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
                                    {teacher?.positions && Array.isArray(teacher.positions) && teacher.positions.length > 0 && ` (${teacher.positions.join(', ')})`}
                                </option>
                            ))}
                        </select>
                        {formData.subject && availableTeachers.length === 0 && (
                            <div style={{
                                fontSize: '12px',
                                color: '#dc2626',
                                marginTop: '4px'
                            }}>
                                Не знайдено викладачів для предмета "{formData.subject}"
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
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s'
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
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#4b5563';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#6b7280';
                        }}
                    >
                        <FaTimes />
                        Скасувати
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!formData.subject || !formData.group || !formData.dayOfWeek ||
                            !formData.timeSlot || !formData.teacher || !formData.classroom ||
                            !availability.available}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: (!formData.subject || !formData.group || !formData.dayOfWeek ||
                                !formData.timeSlot || !formData.teacher || !formData.classroom ||
                                !availability.available) ? '#d1d5db' : 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: (!formData.subject || !formData.group || !formData.dayOfWeek ||
                                !formData.timeSlot || !formData.teacher || !formData.classroom ||
                                !availability.available) ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => {
                            if (!formData.subject || !formData.group || !formData.dayOfWeek ||
                                !formData.timeSlot || !formData.teacher || !formData.classroom ||
                                !availability.available) return;
                            e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                        }}
                        onMouseOut={(e) => {
                            if (!formData.subject || !formData.group || !formData.dayOfWeek ||
                                !formData.timeSlot || !formData.teacher || !formData.classroom ||
                                !availability.available) return;
                            e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                        }}
                    >
                        <FaSave />
                        Створити
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateScheduleModal;