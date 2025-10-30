import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaUser, FaEnvelope, FaBook } from "react-icons/fa";
import axios from "axios";

const AdminShowTeacher = () => {
    const [teachers, setTeachers] = useState([]);
    const [expandedSubjects, setExpandedSubjects] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await axios.get("http://localhost:3001/api/teachers");
                setTeachers(response.data);
                setLoading(false);
            } catch (err) {
                setError("Помилка завантаження викладачів");
                setLoading(false);
                console.error("Помилка завантаження викладачів:", err);
            }
        };

        fetchTeachers();
    }, []);

    // Групування викладачів по предметах
    const groupTeachersBySubject = () => {
        const subjects = {};

        teachers.forEach(teacher => {
            const subject = teacher.position || "Без предмета";
            if (!subjects[subject]) {
                subjects[subject] = [];
            }
            subjects[subject].push(teacher);
        });

        // Сортування предметів за алфавітом
        const sortedSubjects = {};
        Object.keys(subjects).sort().forEach(key => {
            sortedSubjects[key] = subjects[key];
        });

        return sortedSubjects;
    };

    // Функція для розгортання/згортання предмету
    const toggleSubject = (subject) => {
        setExpandedSubjects(prev => ({
            ...prev,
            [subject]: !prev[subject]
        }));
    };

    // Розгорнути/згорнути всі предмети
    const toggleAllSubjects = () => {
        const subjects = groupTeachersBySubject();
        const allExpanded = Object.values(expandedSubjects).every(Boolean);
        const newExpandedState = {};
        Object.keys(subjects).forEach(subject => {
            newExpandedState[subject] = !allExpanded;
        });
        setExpandedSubjects(newExpandedState);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Завантаження викладачів...</p>
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

    const subjects = groupTeachersBySubject();

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h3>Список викладачів за предметами</h3>
                <button
                    onClick={toggleAllSubjects}
                    style={{
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    {Object.values(expandedSubjects).every(Boolean) ? 'Згорнути всі' : 'Розгорнути всі'}
                </button>
            </div>

            {Object.keys(subjects).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Викладачі не знайдені</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.keys(subjects).map(subject => (
                        <div key={subject} style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            {/* Заголовок предмету */}
                            <div
                                style={{
                                    backgroundColor: expandedSubjects[subject] ? 'rgba(105, 180, 185, 0.1)' : '#f9fafb',
                                    padding: '15px 20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'background-color 0.3s ease'
                                }}
                                onClick={() => toggleSubject(subject)}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.2)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = expandedSubjects[subject] ? 'rgba(105, 180, 185, 0.1)' : '#f9fafb';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaBook style={{ color: 'rgba(105, 180, 185, 1)' }} />
                                    <span style={{ fontWeight: '600', fontSize: '16px' }}>
                                        {subject}
                                    </span>
                                    <span style={{
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        backgroundColor: '#f3f4f6',
                                        padding: '2px 8px',
                                        borderRadius: '12px'
                                    }}>
                                        Викладачів: {subjects[subject].length}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {expandedSubjects[subject] ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                            </div>

                            {/* Вміст предмету (викладачі) */}
                            {expandedSubjects[subject] && (
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '20px',
                                    borderTop: '1px solid #e5e7eb'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {subjects[subject].map(teacher => (
                                            <div key={teacher._id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '15px',
                                                padding: '12px 15px',
                                                backgroundColor: '#f9fafb',
                                                borderRadius: '6px',
                                                border: '1px solid #e5e7eb'
                                            }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'rgba(105, 180, 185, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'rgba(105, 180, 185, 1)'
                                                }}>
                                                    <FaUser />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                        {teacher.fullName}
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontSize: '14px',
                                                        color: '#6b7280',
                                                        marginBottom: '4px'
                                                    }}>
                                                        <FaEnvelope size={12} />
                                                        {teacher.email}
                                                    </div>
                                                    {teacher.phone && (
                                                        <div style={{
                                                            fontSize: '14px',
                                                            color: '#6b7280'
                                                        }}>
                                                            📞 {teacher.phone}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: 'rgba(105, 180, 185, 1)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        Редагувати
                                                    </button>
                                                    <button
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        Видалити
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminShowTeacher;