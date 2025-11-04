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

    const fetchTeachers = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/users/teachers");
            setTeachers(response.data);
            setLoading(false);
        } catch (err) {
            setError("Помилка завантаження викладачів");
            setLoading(false);
            console.error("Помилка завантаження викладачів:", err);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    // НОВА ФУНКЦІЯ ДЛЯ РОЗДІЛЕННЯ ПРЕДМЕТІВ
    const groupTeachersBySubject = () => {
        const subjects = {};

        teachers.forEach(teacher => {
            let teacherSubjects = [];

            // Якщо є поле position з кількома предметами через кому
            if (teacher.position) {
                // Розділяємо предмети по комах та обрізаємо пробіли
                teacherSubjects = teacher.position.split(',').map(subj => subj.trim());
            }

            // Якщо є поле positions (масив)
            if (teacher.positions && teacher.positions.length > 0) {
                teacherSubjects = [...teacherSubjects, ...teacher.positions];
            }

            // Якщо немає предметів
            if (teacherSubjects.length === 0) {
                teacherSubjects = ["Без предмета"];
            }

            // Додаємо викладача до кожного предмету окремо
            teacherSubjects.forEach(subject => {
                if (!subjects[subject]) {
                    subjects[subject] = [];
                }
                // Перевіряємо, щоб не додавати дублікати
                if (!subjects[subject].some(t => t._id === teacher._id)) {
                    subjects[subject].push(teacher);
                }
            });
        });

        // Сортування предметів за алфавітом
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
                />
            )}
        </div>
    );
};

export default AdminShowTeacher;