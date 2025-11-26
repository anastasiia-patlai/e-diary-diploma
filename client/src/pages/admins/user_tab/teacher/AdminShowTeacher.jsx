import React, { useState, useEffect } from 'react';
import axios from "axios";
import TeacherHeader from './TeacherHeader';
import SubjectsList from './SubjectsList';
import EditTeacherPopup from "./EditTeacherPopup";
import DeleteTeacherPopup from "./DeleteTeacherPopup";

const AdminShowTeacher = () => {
    const [teachers, setTeachers] = useState([]);
    const [expandedSubjects, setExpandedSubjects] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [databaseName, setDatabaseName] = useState("");

    // Отримуємо databaseName з localStorage
    useEffect(() => {
        const getDatabaseName = () => {
            let dbName = localStorage.getItem('databaseName');
            if (!dbName) {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        dbName = user.databaseName;
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
                        dbName = userInfo.databaseName;
                    } catch (e) {
                        console.error("Помилка парсингу userInfo:", e);
                    }
                }
            }
            return dbName;
        };

        const dbName = getDatabaseName();
        if (dbName) {
            setDatabaseName(dbName);
            console.log("Database name для запиту:", dbName);
        } else {
            console.error("Database name не знайдено!");
            setError("Не вдалося визначити базу даних школи");
            setLoading(false);
        }
    }, []);

    const fetchTeachers = async () => {
        if (!databaseName) {
            console.error("Database name відсутній для запиту");
            return;
        }

        try {
            console.log("Запит викладачів для бази:", databaseName);
            const response = await axios.get("http://localhost:3001/api/users/teachers", {
                params: {
                    databaseName: databaseName
                }
            });
            setTeachers(response.data);
            setLoading(false);
        } catch (err) {
            setError("Помилка завантаження викладачів");
            setLoading(false);
            console.error("Детальна помилка завантаження викладачів:", err);

            // Детальніше про помилку
            if (err.response) {
                console.error("Статус помилки:", err.response.status);
                console.error("Дані помилки:", err.response.data);
                console.error("Заголовки запиту:", err.config.headers);
                console.error("URL запиту:", err.config.url);
            }
        }
    };

    useEffect(() => {
        if (databaseName) {
            fetchTeachers();
        }
    }, [databaseName]);

    // Решта коду залишається без змін
    const groupTeachersBySubject = () => {
        const subjects = {};

        teachers.forEach(teacher => {
            let teacherSubjects = [];

            if (teacher.position) {
                teacherSubjects = teacher.position.split(',').map(subj => subj.trim());
            }

            if (teacher.positions && teacher.positions.length > 0) {
                teacherSubjects = [...teacherSubjects, ...teacher.positions];
            }

            if (teacherSubjects.length === 0) {
                teacherSubjects = ["Без предмета"];
            }

            teacherSubjects.forEach(subject => {
                if (!subjects[subject]) {
                    subjects[subject] = [];
                }
                if (!subjects[subject].some(t => t._id === teacher._id)) {
                    subjects[subject].push(teacher);
                }
            });
        });

        const sortedSubjects = {};
        Object.keys(subjects).sort().forEach(key => {
            sortedSubjects[key] = subjects[key];
        });

        return sortedSubjects;
    };

    const toggleSubject = (subject) => {
        setExpandedSubjects(prev => ({
            ...prev,
            [subject]: !prev[subject]
        }));
    };

    const toggleAllSubjects = () => {
        const subjects = groupTeachersBySubject();
        const allExpanded = Object.values(expandedSubjects).every(Boolean);
        const newExpandedState = {};
        Object.keys(subjects).forEach(subject => {
            newExpandedState[subject] = !allExpanded;
        });
        setExpandedSubjects(newExpandedState);
    };

    const handleEditTeacher = (teacher) => {
        setSelectedTeacher(teacher);
        setShowEditPopup(true);
    };

    const handleDeleteTeacher = (teacher) => {
        setSelectedTeacher(teacher);
        setShowDeletePopup(true);
    };

    const handleUpdateTeacher = () => {
        fetchTeachers();
        setShowEditPopup(false);
        setSelectedTeacher(null);
    };

    const handleDeleteConfirm = () => {
        fetchTeachers();
        setShowDeletePopup(false);
        setSelectedTeacher(null);
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
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '10px',
                        padding: '8px 16px',
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Спробувати знову
                </button>
            </div>
        );
    }

    const subjects = groupTeachersBySubject();

    return (
        <div>
            <TeacherHeader
                onToggleAll={toggleAllSubjects}
                allExpanded={Object.values(expandedSubjects).every(Boolean)}
            />

            <SubjectsList
                subjects={subjects}
                expandedSubjects={expandedSubjects}
                onToggleSubject={toggleSubject}
                onEditTeacher={handleEditTeacher}
                onDeleteTeacher={handleDeleteTeacher}
            />

            {/* Попапи */}
            {showEditPopup && selectedTeacher && (
                <EditTeacherPopup
                    teacher={selectedTeacher}
                    onClose={() => {
                        setShowEditPopup(false);
                        setSelectedTeacher(null);
                    }}
                    onUpdate={handleUpdateTeacher}
                    databaseName={databaseName}
                />
            )}

            {showDeletePopup && selectedTeacher && (
                <DeleteTeacherPopup
                    teacher={selectedTeacher}
                    onClose={() => {
                        setShowDeletePopup(false);
                        setSelectedTeacher(null);
                    }}
                    onDelete={handleDeleteConfirm}
                    databaseName={databaseName}
                />
            )}
        </div>
    );
};

export default AdminShowTeacher;