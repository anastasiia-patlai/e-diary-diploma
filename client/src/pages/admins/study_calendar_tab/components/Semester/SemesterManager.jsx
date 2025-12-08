import React, { useState, useEffect } from 'react';
import { FaPlus, FaSync } from 'react-icons/fa';
import studyCalendarService from '../studyCalendarService';
import SemesterForm from './SemesterForm';
import SemesterList from './SemesterList';
import ConfirmationModal from '../ConfirmationModal';

const SemesterManager = ({ isMobile = false }) => {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingSemester, setEditingSemester] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [semesterToDelete, setSemesterToDelete] = useState(null);
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

    const loadSemesters = async () => {
        if (!databaseName) {
            setError("Не вказано базу даних");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await studyCalendarService.getSemesters();

            const sortedSemesters = response.data.sort((a, b) => {
                const yearComparison = b.year.localeCompare(a.year);
                if (yearComparison !== 0) return yearComparison;

                const order = { 'I. Осінньо-зимовий': 1, 'II. Зимово-весняний': 2 };
                return order[a.name] - order[b.name];
            });

            setSemesters(sortedSemesters);
        } catch (err) {
            console.error('Error loading semesters:', err);
            setError(err.response?.data?.error || 'Помилка завантаження семестрів');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (databaseName) {
            loadSemesters();
        }
    }, [databaseName]);

    const handleCreate = () => {
        setEditingSemester(null);
        setShowForm(true);
    };

    const handleEdit = (semester) => {
        setEditingSemester(semester);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingSemester(null);
        setError('');
    };

    const handleFormSubmit = async (semesterData) => {
        try {
            setError('');
            if (editingSemester) {
                await studyCalendarService.updateSemester(editingSemester._id, semesterData);
            } else {
                await studyCalendarService.createSemester(semesterData);
            }
            await loadSemesters();
            handleFormClose();
        } catch (err) {
            console.error('Error saving semester:', err);
            const errorMessage = err.response?.data?.error || 'Помилка збереження семестру';
            setError(errorMessage);
            throw err;
        }
    };

    const handleDeleteClick = (semester) => {
        setSemesterToDelete(semester);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!semesterToDelete) return;

        try {
            setError('');
            await studyCalendarService.deleteSemester(semesterToDelete._id);
            await loadSemesters();
            setShowDeleteConfirm(false);
            setSemesterToDelete(null);
        } catch (err) {
            console.error('Error deleting semester:', err);
            setError(err.response?.data?.error || 'Помилка видалення семестру');
            setShowDeleteConfirm(false);
            setSemesterToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setSemesterToDelete(null);
    };

    const handleToggleActive = async (semester) => {
        try {
            setError('');

            if (semester.isActive) {
                const updatedSemester = await studyCalendarService.updateSemester(semester._id, {
                    ...semester,
                    isActive: false
                });

                await studyCalendarService.syncSemesterQuarters(semester._id);

                setSemesters(prev => prev.map(s =>
                    s._id === semester._id ? updatedSemester.data : s
                ));
            } else {
                const updatePromises = semesters.map(s => {
                    if (s._id === semester._id) {
                        return studyCalendarService.updateSemester(s._id, { ...s, isActive: true });
                    } else if (s.isActive) {
                        return studyCalendarService.updateSemester(s._id, { ...s, isActive: false });
                    }
                    return Promise.resolve(null);
                });

                await Promise.all(updatePromises);
                await studyCalendarService.syncSemesterQuarters(semester._id);
                await loadSemesters();
            }
        } catch (err) {
            console.error('Error toggling semester active status:', err);
            setError(err.response?.data?.error || 'Помилка зміни статусу семестру');
        }
    };

    const activeSemester = semesters.find(s => s.isActive);

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                padding: isMobile ? '30px 20px' : '40px',
                color: '#6b7280'
            }}>
                Завантаження семестрів...
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
                        Управління семестрами
                    </h3>
                    {activeSemester && (
                        <p style={{
                            margin: isMobile ? '2px 0 0 0' : '4px 0 0 0',
                            color: 'rgba(105, 180, 185, 1)',
                            fontSize: isMobile ? '12px' : '14px',
                            fontWeight: '500'
                        }}>
                            Активний семестр: {activeSemester.name} {activeSemester.year}
                        </p>
                    )}
                </div>
                <div style={{
                    display: 'flex',
                    gap: isMobile ? '8px' : '10px',
                    width: isMobile ? '100%' : 'auto'
                }}>
                    <button
                        onClick={loadSemesters}
                        style={{
                            padding: isMobile ? '8px 12px' : '8px 16px',
                            backgroundColor: 'transparent',
                            color: 'rgba(105, 180, 185, 1)',
                            border: '1px solid rgba(105, 180, 185, 1)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
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
                        style={{
                            padding: isMobile ? '8px 12px' : '8px 16px',
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: isMobile ? '13px' : '14px',
                            flex: isMobile ? '1' : '0'
                        }}
                    >
                        <FaPlus size={isMobile ? 12 : 14} />
                        Додати семестр
                    </button>
                </div>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: isMobile ? '10px 12px' : '12px',
                    borderRadius: '6px',
                    marginBottom: isMobile ? '16px' : '20px',
                    fontSize: isMobile ? '13px' : '14px'
                }}>
                    {error}
                </div>
            )}

            {!activeSemester && (
                <div style={{
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    padding: isMobile ? '10px 12px' : '12px',
                    borderRadius: '6px',
                    marginBottom: isMobile ? '16px' : '20px',
                    fontSize: isMobile ? '13px' : '14px'
                }}>
                    Жоден семестр не активний. Будь ласка, активуйте семестр для використання в системі.
                </div>
            )}

            <SemesterList
                semesters={semesters}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onToggleActive={handleToggleActive}
                isMobile={isMobile}
            />

            {showForm && (
                <SemesterForm
                    semester={editingSemester}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                    isMobile={isMobile}
                />
            )}

            {showDeleteConfirm && semesterToDelete && (
                <ConfirmationModal
                    title="Підтвердження видалення"
                    message={`Ви впевнені, що хочете видалити семестр "${semesterToDelete.name} ${semesterToDelete.year}"? Ця дія також видалить всі пов'язані чверті та канікули.`}
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

export default SemesterManager;