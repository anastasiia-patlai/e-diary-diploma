import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaUsers, FaCalendar, FaClock, FaChalkboardTeacher, FaDoorOpen } from "react-icons/fa";

const CreateScheduleModal = ({ show, onClose, onSave, groups, teachers, classrooms, timeSlots }) => {
    const [formData, setFormData] = useState({
        group: "",
        dayOfWeek: 1,
        timeSlot: "",
        teacher: "",
        classroom: ""
    });
    const [error, setError] = useState("");
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [filteredClassrooms, setFilteredClassrooms] = useState([]);

    // Скидання форми при відкритті
    useEffect(() => {
        if (show) {
            setFormData({
                group: "",
                dayOfWeek: 1,
                timeSlot: "",
                teacher: "",
                classroom: ""
            });
            setError("");
            setFilteredTeachers(teachers);
            setFilteredClassrooms(classrooms);
        }
    }, [show, teachers, classrooms]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        // Валідація
        if (!formData.group || !formData.timeSlot || !formData.teacher || !formData.classroom) {
            setError("Усі поля повинні бути заповнені");
            return;
        }

        onSave(formData);
    };

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
                {/* Заголовок */}
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

                {/* Повідомлення про помилку */}
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

                {/* Форма */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Група */}
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
                            {groups.map(group => (
                                <option key={group._id} value={group._id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>

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
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                        >
                            <option value={1}>Понеділок</option>
                            <option value={2}>Вівторок</option>
                            <option value={3}>Середа</option>
                            <option value={4}>Четвер</option>
                            <option value={5}>П'ятниця</option>
                        </select>
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
                            <option value="">Оберіть час</option>
                            {timeSlots.map(slot => (
                                <option key={slot._id} value={slot._id}>
                                    {slot.order}. {slot.startTime} - {slot.endTime}
                                </option>
                            ))}
                        </select>
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
                        </label>
                        <select
                            name="teacher"
                            value={formData.teacher}
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
                            <option value="">Оберіть викладача</option>
                            {teachers.map(teacher => (
                                <option key={teacher._id} value={teacher._id}>
                                    {teacher.fullName} ({teacher.position || teacher.positions?.[0] || 'Предмет не вказано'})
                                </option>
                            ))}
                        </select>
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
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                        >
                            <option value="">Оберіть аудиторію</option>
                            {classrooms.map(classroom => (
                                <option key={classroom._id} value={classroom._id}>
                                    {classroom.name} ({classroom.type === 'lecture' ? 'Лекційна' :
                                        classroom.type === 'practice' ? 'Практична' :
                                            classroom.type === 'lab' ? 'Лабораторія' : 'Загальна'})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Кнопки дій */}
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
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: 'rgba(105, 180, 185, 1)',
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
                            e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                        }}
                        onMouseOut={(e) => {
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