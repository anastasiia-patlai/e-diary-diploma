import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaUsers, FaChevronDown, FaChevronRight, FaBookOpen } from 'react-icons/fa';

const JournalTab = ({ databaseName, isMobile, onOpenGradebook }) => {
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [expandedSubjects, setExpandedSubjects] = useState({});

    useEffect(() => {
        if (databaseName) {
            loadTeacherJournals();
        }
    }, [databaseName]);

    const loadTeacherJournals = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            // Отримуємо всі уроки вчителя
            const response = await axios.get('/api/schedule', {
                params: {
                    databaseName,
                    teacher: userInfo.userId
                }
            });

            // Групуємо уроки за предметами
            const groupedBySubject = {};

            response.data.forEach(lesson => {
                const subject = lesson.subject;
                if (!groupedBySubject[subject]) {
                    groupedBySubject[subject] = {
                        name: subject,
                        lessons: []
                    };
                }

                // Додаємо урок з потрібною інформацією
                groupedBySubject[subject].lessons.push({
                    _id: lesson._id,
                    groupName: lesson.group?.name,
                    subgroup: lesson.subgroup || 'all',
                    dayOfWeek: lesson.dayOfWeek?.name,
                    timeSlot: lesson.timeSlot,
                    classroom: lesson.classroom?.name
                });
            });

            // Сортуємо предмети за алфавітом
            const sortedSubjects = Object.values(groupedBySubject).sort((a, b) =>
                a.name.localeCompare(b.name, 'uk')
            );

            setSubjects(sortedSubjects);

            // Спочатку всі предмети згорнуті
            const initialExpanded = {};
            sortedSubjects.forEach(subject => {
                initialExpanded[subject.name] = false;
            });
            setExpandedSubjects(initialExpanded);

        } catch (error) {
            console.error('Помилка завантаження журналів:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSubject = (subjectName) => {
        setExpandedSubjects(prev => ({
            ...prev,
            [subjectName]: !prev[subjectName]
        }));
    };

    const getSubgroupLabel = (subgroup) => {
        switch (subgroup) {
            case 'all': return '';
            case '1': return '(Підгрупа 1)';
            case '2': return '(Підгрупа 2)';
            case '3': return '(Підгрупа 3)';
            default: return '';
        }
    };

    const formatTime = (timeSlot) => {
        if (!timeSlot) return '';
        return `${timeSlot.startTime?.slice(0, 5)}-${timeSlot.endTime?.slice(0, 5)}`;
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Завантаження...</span>
                    </div>
                    <p style={{ marginTop: '10px', color: '#6b7280' }}>
                        Завантаження журналів...
                    </p>
                </div>
            </div>
        );
    }

    if (subjects.length === 0) {
        return (
            <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '60px 20px',
                textAlign: 'center'
            }}>
                <FaBook style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
                <h3 style={{ color: '#374151', marginBottom: '8px' }}>
                    Немає доступних журналів
                </h3>
                <p style={{ color: '#6b7280' }}>
                    У вас поки немає уроків у розкладі
                </p>
            </div>
        );
    }

    return (
        <div>
            <h3 style={{
                fontSize: isMobile ? '18px' : '24px',
                marginBottom: '24px',
                color: '#374151'
            }}>
                Журнали за предметами
            </h3>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {subjects.map(subject => (
                    <div
                        key={subject.name}
                        style={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Заголовок предмета */}
                        <div
                            onClick={() => toggleSubject(subject.name)}
                            style={{
                                padding: '16px 20px',
                                backgroundColor: expandedSubjects[subject.name] ? '#f9fafb' : 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: expandedSubjects[subject.name] ? '1px solid #e5e7eb' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {expandedSubjects[subject.name] ? (
                                    <FaChevronDown style={{ color: '#9ca3af' }} />
                                ) : (
                                    <FaChevronRight style={{ color: '#9ca3af' }} />
                                )}
                                <FaBook style={{ color: 'rgba(105, 180, 185, 1)' }} />
                                <span style={{
                                    fontWeight: '600',
                                    fontSize: isMobile ? '16px' : '18px',
                                    color: '#374151'
                                }}>
                                    {subject.name}
                                </span>
                                <span style={{
                                    backgroundColor: '#e5e7eb',
                                    color: '#4b5563',
                                    padding: '2px 10px',
                                    borderRadius: '20px',
                                    fontSize: '14px'
                                }}>
                                    {subject.lessons.length} {subject.lessons.length === 1 ? 'урок' :
                                        subject.lessons.length < 5 ? 'уроки' : 'уроків'}
                                </span>
                            </div>
                        </div>

                        {/* Список уроків предмета */}
                        {expandedSubjects[subject.name] && (
                            <div style={{
                                padding: '8px'
                            }}>
                                {subject.lessons.map(lesson => (
                                    <div
                                        key={lesson._id}
                                        style={{
                                            padding: '12px 16px',
                                            margin: '4px 8px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            backgroundColor: '#f9fafb',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                flexWrap: 'wrap'
                                            }}>
                                                <FaUsers style={{ color: '#6b7280' }} />
                                                <span style={{
                                                    fontWeight: '500',
                                                    color: '#374151'
                                                }}>
                                                    {lesson.groupName}
                                                </span>
                                                {lesson.subgroup && lesson.subgroup !== 'all' && (
                                                    <span style={{
                                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                                        color: 'rgba(105, 180, 185, 1)',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px'
                                                    }}>
                                                        Підгрупа {lesson.subgroup}
                                                    </span>
                                                )}
                                                <span style={{
                                                    color: '#6b7280',
                                                    fontSize: '14px'
                                                }}>
                                                    {lesson.dayOfWeek}
                                                </span>
                                                <span style={{
                                                    color: '#6b7280',
                                                    fontSize: '14px'
                                                }}>
                                                    {formatTime(lesson.timeSlot)}
                                                </span>
                                                {lesson.classroom && (
                                                    <span style={{
                                                        color: '#6b7280',
                                                        fontSize: '14px'
                                                    }}>
                                                        • {lesson.classroom}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => onOpenGradebook(lesson._id)}
                                            style={{
                                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '14px',
                                                transition: 'background-color 0.2s',
                                                whiteSpace: 'nowrap',
                                                marginLeft: '16px'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                                            }}
                                        >
                                            <FaBookOpen />
                                            {isMobile ? 'Журнал' : 'Відкрити журнал'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JournalTab;