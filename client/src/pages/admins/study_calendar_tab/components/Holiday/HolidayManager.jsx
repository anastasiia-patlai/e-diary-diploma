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

    const loadData = async () => {
        try {
            setLoading(true);
            const [holidaysRes, quartersRes] = await Promise.all([
                studyCalendarService.getHolidays(),
                studyCalendarService.getQuarters()
            ]);
            setHolidays(holidaysRes.data);
            setQuarters(quartersRes.data);
        } catch (err) {
            setError('Помилка завантаження даних');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

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
            setError('Помилка збереження канікул');
            console.error('Error saving holiday:', err);
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
            setError('Помилка видалення канікул');
            console.error('Error deleting holiday:', err);
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