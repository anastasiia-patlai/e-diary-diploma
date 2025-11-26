import React, { useState, useEffect } from 'react';
import { FaPlus, FaSync } from 'react-icons/fa';
import studyCalendarService from '../studyCalendarService';
import SemesterForm from './SemesterForm';
import SemesterList from './SemesterList';
import ConfirmationModal from '../ConfirmationModal';

const SemesterManager = () => {
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
                // СПОЧАТКУ сортуємо за роком у спадному порядку
                const yearComparison = b.year.localeCompare(a.year);
                if (yearComparison !== 0) return yearComparison;

                // ПОТІМ СОРТУЄМО ЗА НАЗВОЮ СЕМЕСТРУ
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
                // ДЕАКТИВУЄМО СЕМЕСТР ТА ВСІ ЙОГО ЧВЕРТІ
                const updatedSemester = await studyCalendarService.updateSemester(semester._id, {
                    ...semester,
                    isActive: false
                });

                // ДЕАКТИВУЄМО ЧВЕРТІ СЕМЕСТРУ
                await studyCalendarService.syncSemesterQuarters(semester._id);

                setSemesters(prev => prev.map(s =>
                    s._id === semester._id ? updatedSemester.data : s
                ));
            } else {
                // АКТИВУЄМО СЕМЕСТР І ДЕАКТИВУЄМО ІНШІ СЕМЕСТРИ ТА ЇХНІ ЧВЕРТІ
                const updatePromises = semesters.map(s => {
                    if (s._id === semester._id) {
                        return studyCalendarService.updateSemester(s._id, { ...s, isActive: true });
                    } else if (s.isActive) {
                        return studyCalendarService.updateSemester(s._id, { ...s, isActive: false });
                    }
                    return Promise.resolve(null);
                });

                await Promise.all(updatePromises);

                // СИНХРОНІЗУЄМО ЧВЕРТІ АКТИВНОГО СЕМЕСТРУ
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
        return <div style={{ textAlign: 'center', padding: '40px' }}>Завантаження семестрів...</div>;
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
                    <h3 style={{ margin: 0 }}>Управління семестрами</h3>
                    {activeSemester && (
                        <p style={{
                            margin: '4px 0 0 0',
                            color: 'rgba(105, 180, 185, 1)',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            Активний семестр: {activeSemester.name} {activeSemester.year}
                        </p>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={loadSemesters}
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
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <FaPlus />
                        Додати семестр
                    </button>
                </div>
            </div>

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

            {/* ІНФОРМАЦІЯ ПРО АКТИВНИЙ СЕМЕСТР*/}
            {!activeSemester && (
                <div style={{
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '20px'
                }}>
                    Жоден семестр не активний. Будь ласка, активуйте семестр для використання в системі.
                </div>
            )}

            <SemesterList
                semesters={semesters}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onToggleActive={handleToggleActive}
            />

            {showForm && (
                <SemesterForm
                    semester={editingSemester}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
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
                />
            )}
        </div>
    );
};

export default SemesterManager;