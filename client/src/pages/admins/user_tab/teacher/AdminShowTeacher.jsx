import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from "axios";
import TeacherHeader from './TeacherHeader';
import SubjectsList from './SubjectsList';
import EditTeacherPopup from "./EditTeacherPopup";
import DeleteTeacherPopup from "./DeleteTeacherPopup";

const AdminShowTeacher = ({ isMobile }) => {
    const { t } = useTranslation();
    const [teachers, setTeachers] = useState([]);
    const [expandedSubjects, setExpandedSubjects] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [databaseName, setDatabaseName] = useState("");

    // Функція для перекладу назви предмета
    const getTranslatedSubject = (subjectName) => {
        const translated = t(`subjects.${subjectName}`, { defaultValue: subjectName });
        return translated;
    };

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
        } else {
            console.error("Database name не знайдено!");
            setError(t('admin.users.errors.noDatabase'));
            setLoading(false);
        }
    }, [t]);

    const fetchTeachers = async () => {
        if (!databaseName) {
            return;
        }

        try {
            const response = await axios.get("http://localhost:3001/api/users/teachers", {
                params: {
                    databaseName: databaseName
                }
            });
            setTeachers(response.data);
            setLoading(false);
        } catch (err) {
            setError(t('admin.users.errors.loadError'));
            setLoading(false);
            console.error("Детальна помилка завантаження викладачів:", err);
        }
    };

    useEffect(() => {
        if (databaseName) {
            fetchTeachers();
        }
    }, [databaseName]);

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
                teacherSubjects = [t('admin.users.teacher.noSubject')];
            }

            teacherSubjects.forEach(subject => {
                // Використовуємо оригінальну назву як ключ, але для відображення буде переклад
                if (!subjects[subject]) {
                    subjects[subject] = [];
                }
                if (!subjects[subject].some(t => t._id === teacher._id)) {
                    subjects[subject].push(teacher);
                }
            });
        });

        // Сортування з урахуванням перекладу
        const sortedSubjects = {};
        Object.keys(subjects)
            .sort((a, b) => {
                const translatedA = getTranslatedSubject(a);
                const translatedB = getTranslatedSubject(b);
                return translatedA.localeCompare(translatedB);
            })
            .forEach(key => {
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
            <div style={{
                textAlign: 'center',
                padding: isMobile ? '40px 20px' : '20px'
            }}>
                <p style={{ fontSize: isMobile ? '16px' : '14px' }}>{t('common.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                textAlign: 'center',
                padding: isMobile ? '30px 16px' : '20px',
                color: 'red',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                margin: isMobile ? '10px' : '20px'
            }}>
                <p style={{
                    fontSize: isMobile ? '15px' : '14px',
                    marginBottom: '12px'
                }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '10px',
                        padding: isMobile ? '12px 20px' : '8px 16px',
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '14px' : '12px',
                        minHeight: isMobile ? '44px' : 'auto',
                        minWidth: isMobile ? '140px' : 'auto'
                    }}
                >
                    {t('admin.errorState.retry')}
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
                isMobile={isMobile}
            />

            <SubjectsList
                subjects={subjects}
                expandedSubjects={expandedSubjects}
                onToggleSubject={toggleSubject}
                onEditTeacher={handleEditTeacher}
                onDeleteTeacher={handleDeleteTeacher}
                isMobile={isMobile}
            />

            {showEditPopup && selectedTeacher && (
                <EditTeacherPopup
                    teacher={selectedTeacher}
                    onClose={() => {
                        setShowEditPopup(false);
                        setSelectedTeacher(null);
                    }}
                    onUpdate={handleUpdateTeacher}
                    databaseName={databaseName}
                    isMobile={isMobile}
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
                    isMobile={isMobile}
                />
            )}
        </div>
    );
};

export default AdminShowTeacher;