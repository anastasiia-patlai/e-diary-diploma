import React, { useState, useEffect } from 'react';
import { FaPlus, FaSync } from 'react-icons/fa';
import studyCalendarService from '../studyCalendarService';
import HolidayForm from './HolidayForm';
import HolidayList from './HolidayList';
import ConfirmationModal from '../ConfirmationModal';

const HolidayManager = () => {
    const [holidays, setHolidays] = useState([]);
    const [quarters, setQuarters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [holidayToDelete, setHolidayToDelete] = useState(null);
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
            setError('');
            const [holidaysRes, quartersRes] = await Promise.all([
                studyCalendarService.getHolidays(),
                studyCalendarService.getQuarters()
            ]);
            setHolidays(holidaysRes.data);
            setQuarters(quartersRes.data);
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

    const handleCreate = () => {
        setEditingHoliday(null);
        setShowForm(true);
    };

    const handleEdit = (holiday) => {
        setEditingHoliday(holiday);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingHoliday(null);
        setError('');
    };

    const handleFormSubmit = async (holidayData) => {
        try {
            setError('');
            if (editingHoliday) {
                await studyCalendarService.updateHoliday(editingHoliday._id, holidayData);
            } else {
                await studyCalendarService.createHoliday(holidayData);
            }
            await loadData();
            handleFormClose();
        } catch (err) {
            console.error('Error saving holiday:', err);
            const errorMessage = err.response?.data?.error || 'Помилка збереження канікул';
            setError(errorMessage);
            throw err;
        }
    };

    const handleDeleteClick = (holidayId) => {
        const holiday = holidays.find(h => h._id === holidayId);
        if (holiday) {
            setHolidayToDelete(holiday);
            setShowDeleteConfirm(true);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!holidayToDelete) return;

        try {
            setError('');
            await studyCalendarService.deleteHoliday(holidayToDelete._id);
            await loadData();
            setShowDeleteConfirm(false);
            setHolidayToDelete(null);
        } catch (err) {
            console.error('Error deleting holiday:', err);
            setError(err.response?.data?.error || 'Помилка видалення канікул');
            setShowDeleteConfirm(false);
            setHolidayToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setHolidayToDelete(null);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Завантаження канікул...</div>;
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
                <h3 style={{ margin: 0 }}>Управління канікулами</h3>
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
                        disabled={quarters.length === 0}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: quarters.length === 0 ? '#d1d5db' : 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: quarters.length === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <FaPlus />
                        Додати канікули
                    </button>
                </div>
            </div>

            {quarters.length === 0 && (
                <div style={{
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '20px'
                }}>
                    Для створення канікул спочатку потрібно додати чверті
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

            <HolidayList
                holidays={holidays}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            {showForm && (
                <HolidayForm
                    holiday={editingHoliday}
                    quarters={quarters}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                />
            )}

            {showDeleteConfirm && holidayToDelete && (
                <ConfirmationModal
                    title="Підтвердження видалення"
                    message={`Ви впевнені, що хочете видалити канікули "${holidayToDelete.name}"?`}
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

export default HolidayManager;