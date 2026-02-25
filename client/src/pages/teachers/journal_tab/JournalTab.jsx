import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaUsers, FaBookOpen, FaGraduationCap } from 'react-icons/fa';

const JournalTab = ({ databaseName, isMobile, onOpenGradebook }) => {
    const [loading, setLoading] = useState(true);
    const [journals, setJournals] = useState([]);

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

            console.log('Завантажені уроки:', response.data);

            // Форматуємо дані для відображення
            const formattedJournals = response.data.map(lesson => {
                // Витягуємо номер класу з назви групи (наприклад, "5-А" -> 5)
                let classNumber = 999; // велике число для груп без номера
                const groupName = lesson.group?.name || '';
                const match = groupName.match(/^(\d+)/);
                if (match) {
                    classNumber = parseInt(match[1], 10);
                }

                return {
                    _id: lesson._id,
                    subject: lesson.subject,
                    groupName: groupName,
                    subgroup: lesson.subgroup || 'all',
                    groupId: lesson.group?._id,
                    teacherId: lesson.teacher?._id,
                    semesterId: lesson.semester?._id,
                    classNumber: classNumber
                };
            });

            // Сортуємо за предметом, потім за номером класу
            formattedJournals.sort((a, b) => {
                // Спочатку за предметом
                const subjectCompare = a.subject.localeCompare(b.subject, 'uk');
                if (subjectCompare !== 0) {
                    return subjectCompare;
                }
                // Потім за номером класу (від меншого до більшого)
                return a.classNumber - b.classNumber;
            });

            setJournals(formattedJournals);
        } catch (error) {
            console.error('Помилка завантаження журналів:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGroupDisplayName = (journal) => {
        if (journal.subgroup && journal.subgroup !== 'all') {
            return `${journal.groupName} (Підгрупа ${journal.subgroup})`;
        }
        return journal.groupName;
    };

    // Групуємо журнали за предметами для відображення
    const groupBySubject = () => {
        const grouped = {};
        journals.forEach(journal => {
            if (!grouped[journal.subject]) {
                grouped[journal.subject] = [];
            }
            grouped[journal.subject].push(journal);
        });
        return grouped;
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

    if (journals.length === 0) {
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

    const groupedJournals = groupBySubject();

    return (
        <div>
            <h3 style={{
                fontSize: isMobile ? '18px' : '24px',
                marginBottom: '24px',
                color: '#374151'
            }}>
                Мої журнали
            </h3>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                {Object.keys(groupedJournals).sort().map(subject => (
                    <div key={subject} style={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }}>
                        {/* Заголовок предмета */}
                        <div style={{
                            padding: '16px 20px',
                            backgroundColor: '#f8fafc',
                            borderBottom: '2px solid rgba(105, 180, 185, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(105, 180, 185, 0.15)',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FaBook style={{ color: 'rgba(105, 180, 185, 1)', fontSize: '18px' }} />
                                <span style={{
                                    fontWeight: '600',
                                    fontSize: isMobile ? '16px' : '18px',
                                    color: '#1f2937'
                                }}>
                                    {subject}
                                </span>
                            </div>
                            <span style={{
                                backgroundColor: '#e5e7eb',
                                color: '#4b5563',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                {groupedJournals[subject].length} {groupedJournals[subject].length === 1 ? 'клас' : 'класів'}
                            </span>
                        </div>

                        {/* Список класів для предмета */}
                        <div style={{
                            padding: '12px'
                        }}>
                            {groupedJournals[subject].map(journal => (
                                <div
                                    key={journal._id}
                                    style={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '10px',
                                        padding: '16px 20px',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        flex: 1
                                    }}>
                                        <div style={{
                                            backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FaGraduationCap style={{ color: 'rgba(105, 180, 185, 1)', fontSize: '20px' }} />
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                flexWrap: 'wrap'
                                            }}>
                                                <span style={{
                                                    fontWeight: '600',
                                                    fontSize: isMobile ? '16px' : '18px',
                                                    color: '#1f2937'
                                                }}>
                                                    {getGroupDisplayName(journal)}
                                                </span>
                                                {journal.subgroup && journal.subgroup !== 'all' && (
                                                    <span style={{
                                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                                        color: 'rgba(105, 180, 185, 1)',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        border: '1px solid rgba(105, 180, 185, 0.3)'
                                                    }}>
                                                        Підгрупа {journal.subgroup}
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                color: '#4b5563',
                                                fontSize: isMobile ? '13px' : '14px'
                                            }}>
                                                <FaUsers style={{ fontSize: '14px', color: '#9ca3af' }} />
                                                <span style={{
                                                    backgroundColor: '#f3f4f6',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    color: '#374151'
                                                }}>
                                                    {journal.groupName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onOpenGradebook(journal._id)}
                                        style={{
                                            backgroundColor: 'rgba(105, 180, 185, 1)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            transition: 'all 0.2s',
                                            whiteSpace: 'nowrap',
                                            marginLeft: '16px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                                            e.target.style.transform = 'translateY(-1px)';
                                            e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                        }}
                                    >
                                        <FaBookOpen />
                                        {isMobile ? 'Відкрити' : 'Журнал'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {journals.length > 0 && (
                <div style={{
                    marginTop: '24px',
                    padding: '16px 20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#4b5563'
                }}>
                    <span>Всього журналів: <strong>{journals.length}</strong></span>
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#6b7280'
                    }}>
                        <FaBook style={{ fontSize: '14px' }} />
                        <span>Предметів: <strong>{Object.keys(groupedJournals).length}</strong></span>
                    </span>
                </div>
            )}
        </div>
    );
};

export default JournalTab;