import React, { useState, useEffect } from 'react';
import { FaPlus, FaSync } from 'react-icons/fa';
import studyCalendarService from '../studyCalendarService';
import QuarterForm from './QuarterForm';
import QuarterList from './QuarterList';
import ConfirmationModal from '../ConfirmationModal';

const QuarterManager = () => {
    const [quarters, setQuarters] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingQuarter, setEditingQuarter] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [quarterToDelete, setQuarterToDelete] = useState(null);
    const [databaseName, setDatabaseName] = useState('');

    useEffect(() => {
        const getCurrentDatabase = () => {
            let dbName = localStorage.getItem('databaseName');

            if (!dbName) {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        if (user.databaseName) {
                            dbName = user.databaseName;
                        }
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
                        if (userInfo.databaseName) {
                            dbName = userInfo.databaseName;
                        }
                    } catch (e) {
                        console.error("Помилка парсингу userInfo:", e);
                    }
                }
            }

            return dbName;
        };

        const dbName = getCurrentDatabase();
        if (dbName) {
            setDatabaseName(dbName);
        } else {
            setError("Не вдалося визначити базу даних школи");
            setLoading(false);
        }
    }, []);

    const loadData = async () => {
        if (!databaseName) {
            setError("Не вказано базу даних");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const [quartersRes, semestersRes] = await Promise.all([
                studyCalendarService.getQuarters(),
                studyCalendarService.getSemesters()
            ]);
            setQuarters(quartersRes.data);

            // СОРТУЄМО СЕМЕСТРИ 
            const sortedSemesters = semestersRes.data.sort((a, b) => {
                // СПОЧАТКУ СОРТУЄМО ЗА РОКОМ 
                const yearComparison = b.year.localeCompare(a.year);
                if (yearComparison !== 0) return yearComparison;

                // ПОТІМ СОРТУЄМО ЗА НАЗВОЮ
                const order = { 'I. Осінньо-зимовий': 1, 'II. Зимово-весняний': 2 };
                return order[a.name] - order[b.name];
            });

            setSemesters(sortedSemesters);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.response?.data?.error || 'Помилка завантаження даних');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (databaseName) {
            loadData();
        }
    }, [databaseName]);

    // ФУНКЦІЯ ДЛЯ ВИЗНАЧЕННЯ СТАТУСУ СЕМЕСТРУ ЗА ДАТАМИ
    const getDateStatus = (startDate, endDate) => {
        const now = currentDate;
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (now < start) {
            return { status: 'майбутній', color: '#f59e0b' };
        } else if (now > end) {
            return { status: 'завершений', color: '#6b7280' };
        } else {
            return { status: 'поточний', color: '#10b981' };
        }
    };

    // ГРУПУВАННЯ ДАНИХ З ДОДАВАННЯМ СТАТУСІВ
    const groupedData = semesters.reduce((acc, semester) => {
        const year = semester.year;

        if (!acc[year]) {
            acc[year] = {
                year: year,
                semesters: []
            };
        }

        // ЗНАХОДИМО ЧВЕРТІ ДЛЯ ПЕВНОГО СЕМЕСТРУ
        const semesterQuarters = quarters.filter(quarter =>
            quarter.semester && quarter.semester._id === semester._id
        );

        // ДОДАЄМО СТАТУС СЕМЕСТРУ
        const semesterStatus = getDateStatus(semester.startDate, semester.endDate);

        acc[year].semesters.push({
            ...semester,
            quarters: semesterQuarters,
            dateStatus: semesterStatus
        });

        return acc;
    }, {});

    // СОРТУВАННЯ РОКІВ ЗА СПАДАННЯМ
    const sortedYears = Object.keys(groupedData).sort((a, b) => b.localeCompare(a));

    // СОРТУЄМО СЕМЕСТРУ В СЕРЕДИНІ КОЖНОГО РОКУ
    sortedYears.forEach(year => {
        groupedData[year].semesters.sort((a, b) => {
            const order = { 'I. Осінньо-зимовий': 1, 'II. Зимово-весняний': 2 };
            return order[a.name] - order[b.name];
        });
    });

    const handleCreate = () => {
        setEditingQuarter(null);
        setShowForm(true);
    };

    const handleEdit = (quarter) => {
        setEditingQuarter(quarter);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingQuarter(null);
        setError('');
    };

    const handleFormSubmit = async (quarterData) => {
        try {
            setError('');
            if (editingQuarter) {
                await studyCalendarService.updateQuarter(editingQuarter._id, quarterData);
            } else {
                await studyCalendarService.createQuarter(quarterData);
            }
            await loadData();
            handleFormClose();
        } catch (err) {
            console.error('Error saving quarter:', err);
            const errorMessage = err.response?.data?.error || 'Помилка збереження чверті';
            setError(errorMessage);
            throw err;
        }
    };

    const handleDeleteClick = (quarterId) => {
        const quarter = quarters.find(q => q._id === quarterId);
        if (quarter) {
            setQuarterToDelete(quarter);
            setShowDeleteConfirm(true);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!quarterToDelete) return;

        try {
            setError('');
            await studyCalendarService.deleteQuarter(quarterToDelete._id);
            await loadData();
            setShowDeleteConfirm(false);
            setQuarterToDelete(null);
        } catch (err) {
            console.error('Error deleting quarter:', err);
            setError(err.response?.data?.error || 'Помилка видалення чверті');
            setShowDeleteConfirm(false);
            setQuarterToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setQuarterToDelete(null);
    };

    const handleToggleActive = async (quarter) => {
        try {
            setError('');

            // ПЕРЕВІРЯЄМО, ЧИ СЕМЕСТР І ЧВЕРТІ АКТИВНІ
            const semester = semesters.find(s => s._id === quarter.semester._id);
            if (!semester || !semester.isActive) {
                setError('Не можна активувати чверть неактивного семестру');
                return;
            }

            // ПЕРЕВІРЯЄМО СТАТУС ЧВЕРТІ ЗА ДАТАМИ
            const quarterStatus = getDateStatus(quarter.startDate, quarter.endDate);

            // ЯКЩО ЧВЕРТЬ ЗАВЕРШЕНА - НЕ МОЖНА ЇЇ АКТИВУВАТИ
            if (quarterStatus.status === 'завершений') {
                setError('Не можна активувати завершену чверть');
                return;
            }

            // ЯКЩО ЧВЕРТЬ МАЙБУТЬНЯ - НЕ МОЖНА ЇЇ АКТИВУВАТИ
            if (quarterStatus.status === 'майбутній' && !quarter.isActive) {
                setError('Не можна активувати майбутню чверть');
                return;
            }

            if (quarter.isActive) {
                // ДЕАКТИВУЄМО ЧВЕРТЬ
                const updatedQuarter = await studyCalendarService.updateQuarter(quarter._id, {
                    ...quarter,
                    isActive: false
                });

                setQuarters(prev => prev.map(q =>
                    q._id === quarter._id ? updatedQuarter.data : q
                ));
            } else {
                // АКТИВУЄМО ЧВЕРТЬ - ДЕАКТИВУЄМО ІНШІ
                const updatePromises = quarters.map(q => {
                    if (q._id === quarter._id) {
                        return studyCalendarService.updateQuarter(q._id, { ...q, isActive: true });
                    } else if (q.isActive) {
                        return studyCalendarService.updateQuarter(q._id, { ...q, isActive: false });
                    }
                    return Promise.resolve(null);
                });

                await Promise.all(updatePromises);
                await loadData();
            }
        } catch (err) {
            console.error('Error toggling quarter active status:', err);
            setError(err.response?.data?.error || 'Помилка зміни статусу чверті');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Завантаження чвертей...</div>;
    }

    return (
        <div>
            {/* {databaseName && (
                <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '4px'
                }}>
                    База даних: {databaseName}
                </div>
            )} */}

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <div>
                    <h3 style={{ margin: 0 }}>Управління чвертями</h3>
                    <p style={{
                        margin: '4px 0 0 0',
                        color: '#6b7280',
                        fontSize: '13px'
                    }}>
                        Поточна дата: {currentDate.toLocaleDateString('uk-UA')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={loadData}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: 'rgba(105, 180, 185, 1)',
                            border: '1px solid rgba(105, 180, 185, 1)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <FaSync />
                        Оновити
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={semesters.length === 0}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: semesters.length === 0 ? '#d1d5db' : 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: semesters.length === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <FaPlus />
                        Додати чверть
                    </button>
                </div>
            </div>

            {semesters.length === 0 && (
                <div style={{
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '20px'
                }}>
                    Для створення чвертей спочатку потрібно додати семестри
                </div>
            )}

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '20px'
                }}>
                    {error}
                </div>
            )}

            {sortedYears.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                }}>
                    <p>Чверті ще не додані</p>
                    <p style={{ fontSize: '14px' }}>Додайте першу чверть для початку роботи</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {sortedYears.map(year => (
                        <div key={year} style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#f8fafc',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <h4 style={{
                                    margin: 0,
                                    fontSize: '16px',
                                    color: '#1f2937'
                                }}>
                                    Навчальний рік: {year}
                                </h4>
                            </div>

                            <div style={{ padding: '20px', backgroundColor: 'white' }}>
                                {groupedData[year].semesters.map(semester => (
                                    <div key={semester._id} style={{ marginBottom: '32px' }}>
                                        <div style={{
                                            padding: '16px',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '6px',
                                            marginBottom: '20px',
                                            border: '1px solid #e5e7eb',
                                            borderLeft: `4px solid ${semester.dateStatus.color}`
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                flexWrap: 'wrap',
                                                gap: '12px'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <h5 style={{
                                                        margin: 0,
                                                        fontSize: '15px',
                                                        color: '#374151',
                                                        fontWeight: '600'
                                                    }}>
                                                        {semester.name}
                                                    </h5>
                                                    {semester.isActive && (
                                                        <span style={{
                                                            backgroundColor: 'rgba(105, 180, 185, 1)',
                                                            color: 'white',
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '12px',
                                                            fontWeight: '500'
                                                        }}>
                                                            Активний
                                                        </span>
                                                    )}
                                                    <span style={{
                                                        backgroundColor: `${semester.dateStatus.color}15`,
                                                        color: semester.dateStatus.color,
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        border: `1px solid ${semester.dateStatus.color}30`
                                                    }}>
                                                        {semester.dateStatus.status}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '16px',
                                                    fontSize: '13px',
                                                    color: '#6b7280'
                                                }}>
                                                    <span>
                                                        {semester.quarters.length} чверті
                                                    </span>
                                                    <span>
                                                        {new Date(semester.startDate).toLocaleDateString('uk-UA')} - {new Date(semester.endDate).toLocaleDateString('uk-UA')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ЧВЕРТІ СЕМЕСТРУ */}
                                        <div>
                                            {semester.quarters.length === 0 ? (
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '20px',
                                                    color: '#9ca3af',
                                                    fontSize: '14px',
                                                    backgroundColor: '#f9fafb',
                                                    borderRadius: '6px'
                                                }}>
                                                    Немає чвертей для цього семестру
                                                </div>
                                            ) : (
                                                <QuarterList
                                                    quarters={semester.quarters}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDeleteClick}
                                                    onToggleActive={handleToggleActive}
                                                    compact={false}
                                                    currentDate={currentDate}
                                                    isSemesterActive={semester.isActive}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ФОРМА РЕДАГУВАННЯ/ДОДАВАННЯ */}
            {showForm && (
                <QuarterForm
                    quarter={editingQuarter}
                    semesters={semesters}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                />
            )}

            {showDeleteConfirm && quarterToDelete && (
                <ConfirmationModal
                    title="Підтвердження видалення"
                    message={`Ви впевнені, що хочете видалити чверть "${quarterToDelete.name}"? Ця дія також видалить всі пов'язані канікули.`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                    confirmText="Видалити"
                    cancelText="Скасувати"
                    type="danger"
                />
            )}
        </div>
    );
};

export default QuarterManager;