import React, { useState, useEffect } from 'react';
import { FaPlus, FaSync } from 'react-icons/fa';
import studyCalendarService from '../studyCalendarService';
import QuarterForm from './QuarterForm';
import QuarterList from './QuarterList';
import ConfirmationModal from '../ConfirmationModal';

const QuarterManager = ({ isMobile = false }) => {
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

            const sortedSemesters = semestersRes.data.sort((a, b) => {
                const yearComparison = b.year.localeCompare(a.year);
                if (yearComparison !== 0) return yearComparison;

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

    const groupedData = semesters.reduce((acc, semester) => {
        const year = semester.year;

        if (!acc[year]) {
            acc[year] = {
                year: year,
                semesters: []
            };
        }

        const semesterQuarters = quarters.filter(quarter =>
            quarter.semester && quarter.semester._id === semester._id
        );

        const semesterStatus = getDateStatus(semester.startDate, semester.endDate);

        acc[year].semesters.push({
            ...semester,
            quarters: semesterQuarters,
            dateStatus: semesterStatus
        });

        return acc;
    }, {});

    const sortedYears = Object.keys(groupedData).sort((a, b) => b.localeCompare(a));

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

            const semester = semesters.find(s => s._id === quarter.semester._id);
            if (!semester || !semester.isActive) {
                setError('Не можна активувати чверть неактивного семестру');
                return;
            }

            const quarterStatus = getDateStatus(quarter.startDate, quarter.endDate);

            if (quarterStatus.status === 'завершений') {
                setError('Не можна активувати завершену чверть');
                return;
            }

            if (quarterStatus.status === 'майбутній' && !quarter.isActive) {
                setError('Не можна активувати майбутню чверть');
                return;
            }

            if (quarter.isActive) {
                const updatedQuarter = await studyCalendarService.updateQuarter(quarter._id, {
                    ...quarter,
                    isActive: false
                });

                setQuarters(prev => prev.map(q =>
                    q._id === quarter._id ? updatedQuarter.data : q
                ));
            } else {
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
        return (
            <div style={{
                textAlign: 'center',
                padding: isMobile ? '30px 20px' : '40px',
                color: '#6b7280'
            }}>
                Завантаження чвертей...
            </div>
        );
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: isMobile ? '16px' : '20px',
                gap: isMobile ? '12px' : '0'
            }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: '600'
                    }}>
                        Управління чвертями
                    </h3>
                    <p style={{
                        margin: isMobile ? '2px 0 0 0' : '4px 0 0 0',
                        color: '#6b7280',
                        fontSize: isMobile ? '12px' : '13px'
                    }}>
                        Поточна дата: {currentDate.toLocaleDateString('uk-UA')}
                    </p>
                </div>
                <div style={{
                    display: 'flex',
                    gap: isMobile ? '8px' : '10px',
                    width: isMobile ? '100%' : 'auto'
                }}>
                    <button
                        onClick={loadData}
                        style={{
                            padding: isMobile ? '8px 12px' : '8px 16px',
                            backgroundColor: 'transparent',
                            color: 'rgba(105, 180, 185, 1)',
                            border: '1px solid rgba(105, 180, 185, 1)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: isMobile ? '13px' : '14px',
                            flex: isMobile ? '1' : '0'
                        }}
                    >
                        <FaSync size={isMobile ? 12 : 14} />
                        {isMobile ? 'Онов.' : 'Оновити'}
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={semesters.length === 0}
                        style={{
                            padding: isMobile ? '8px 12px' : '8px 16px',
                            backgroundColor: semesters.length === 0 ? '#d1d5db' : 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: semesters.length === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: isMobile ? '13px' : '14px',
                            flex: isMobile ? '1' : '0'
                        }}
                    >
                        <FaPlus size={isMobile ? 12 : 14} />
                        Додати чверть
                    </button>
                </div>
            </div>

            {semesters.length === 0 && (
                <div style={{
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    padding: isMobile ? '12px' : '12px',
                    borderRadius: '6px',
                    marginBottom: isMobile ? '16px' : '20px',
                    fontSize: isMobile ? '13px' : '14px'
                }}>
                    Для створення чвертей спочатку потрібно додати семестри
                </div>
            )}

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: isMobile ? '12px' : '12px',
                    borderRadius: '6px',
                    marginBottom: isMobile ? '16px' : '20px',
                    fontSize: isMobile ? '13px' : '14px'
                }}>
                    {error}
                </div>
            )}

            {sortedYears.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: isMobile ? '30px 20px' : '40px',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                }}>
                    <p style={{ fontSize: isMobile ? '14px' : '16px' }}>Чверті ще не додані</p>
                    <p style={{ fontSize: isMobile ? '12px' : '14px' }}>Додайте першу чверть для початку роботи</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
                    {sortedYears.map(year => (
                        <div key={year} style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: isMobile ? '12px' : '16px',
                                backgroundColor: '#f8fafc',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <h4 style={{
                                    margin: 0,
                                    fontSize: isMobile ? '15px' : '16px',
                                    color: '#1f2937',
                                    fontWeight: '600'
                                }}>
                                    Навчальний рік: {year}
                                </h4>
                            </div>

                            <div style={{ padding: isMobile ? '16px' : '20px', backgroundColor: 'white' }}>
                                {groupedData[year].semesters.map(semester => (
                                    <div key={semester._id} style={{ marginBottom: isMobile ? '20px' : '24px' }}>
                                        <div style={{
                                            padding: isMobile ? '12px' : '16px',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '6px',
                                            marginBottom: isMobile ? '12px' : '16px',
                                            border: '1px solid #e5e7eb',
                                            borderLeft: `4px solid ${semester.dateStatus.color}`
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: isMobile ? 'column' : 'row',
                                                alignItems: isMobile ? 'flex-start' : 'center',
                                                justifyContent: 'space-between',
                                                gap: isMobile ? '8px' : '12px'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: isMobile ? '8px' : '12px',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <h5 style={{
                                                        margin: 0,
                                                        fontSize: isMobile ? '14px' : '15px',
                                                        color: '#374151',
                                                        fontWeight: '600'
                                                    }}>
                                                        {semester.name}
                                                    </h5>
                                                    {semester.isActive && (
                                                        <span style={{
                                                            backgroundColor: 'rgba(105, 180, 185, 1)',
                                                            color: 'white',
                                                            padding: '3px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: isMobile ? '11px' : '12px',
                                                            fontWeight: '500'
                                                        }}>
                                                            Активний
                                                        </span>
                                                    )}
                                                    <span style={{
                                                        backgroundColor: `${semester.dateStatus.color}15`,
                                                        color: semester.dateStatus.color,
                                                        padding: '3px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: isMobile ? '11px' : '12px',
                                                        fontWeight: '500',
                                                        border: `1px solid ${semester.dateStatus.color}30`
                                                    }}>
                                                        {semester.dateStatus.status}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: isMobile ? '8px' : '12px',
                                                    fontSize: isMobile ? '12px' : '13px',
                                                    color: '#6b7280',
                                                    flexWrap: 'wrap'
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
                                                    padding: isMobile ? '16px' : '20px',
                                                    color: '#9ca3af',
                                                    fontSize: isMobile ? '13px' : '14px',
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
                                                    isMobile={isMobile}
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
                    isMobile={isMobile}
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
                    isMobile={isMobile}
                />
            )}
        </div>
    );
};

export default QuarterManager;