import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaChevronLeft, FaChevronRight, FaBookOpen } from 'react-icons/fa';
import HomeworkRow from './HomeworkRow';
import HomeworkModal from './HomeworkModal';
import HomeworkDeleteConfirm from './HomeworkDeleteConfirm';

const BRAND = 'rgba(105, 180, 185, 1)';

const HomeworkTab = ({
    scheduleId,
    allScheduleIds,
    databaseName,
    dates,
    availableMonths,
    currentMonth,
    onPrevMonth,
    onNextMonth,
    onMonthSelect,
    isMobile,
}) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editEntry, setEditEntry] = useState(null);
    const [modalDate, setModalDate] = useState(null);   // lessonDate for new entry
    const [modalLessonNum, setModalLessonNum] = useState(1);
    const [deleteId, setDeleteId] = useState(null);
    const [success, setSuccess] = useState(null);

    const currentMonthIdx = availableMonths.findIndex(m =>
        m.date.getMonth() === currentMonth.getMonth() &&
        m.date.getFullYear() === currentMonth.getFullYear()
    );

    const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

    useEffect(() => {
        if (scheduleId && databaseName) loadEntries();
    }, [scheduleId, databaseName, monthStr]);

    useEffect(() => {
        if (success) {
            const t = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(t);
        }
    }, [success]);

    const loadEntries = async () => {
        setLoading(true);
        try {
            const ids = (allScheduleIds || [scheduleId]).join(',');
            const res = await axios.get('/api/homework/by-schedules', {
                params: { databaseName, ids, month: monthStr }
            });
            setEntries(res.data || []);
        } catch (err) {
            console.error('Помилка завантаження ДЗ:', err);
        } finally {
            setLoading(false);
        }
    };

    // Open modal for a specific lesson date
    const openAddForDate = (date) => {
        // Find lessonNumber for this date from the dates array index
        const lessonNum = dates.filter(d => d.fullDate <= date.fullDate && !d.isHoliday).length;
        setModalDate(date.fullDate);
        setModalLessonNum(lessonNum || 1);
        setEditEntry(null);
        setShowModal(true);
    };

    // Open modal for a new entry (no specific date pre-selected)
    const openAddGeneral = () => {
        setModalDate(dates.find(d => !d.isHoliday)?.fullDate || '');
        setModalLessonNum(1);
        setEditEntry(null);
        setShowModal(true);
    };

    const openEdit = (entry) => {
        setEditEntry(entry);
        setModalDate(entry.lessonDate);
        setModalLessonNum(entry.lessonNumber);
        setShowModal(true);
    };

    const handleSave = async ({ topic, text, dueDate, files, filesToRemove }) => {
        try {
            const formData = new FormData();
            formData.append('databaseName', databaseName);
            formData.append('topic', topic);
            formData.append('text', text);
            formData.append('dueDate', dueDate);

            if (editEntry) {
                // PUT
                if (filesToRemove?.length) formData.append('removeFiles', JSON.stringify(filesToRemove));
                files.forEach(f => formData.append('files', f));
                await axios.put(`/api/homework/${editEntry._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccess('ДЗ оновлено');
            } else {
                // POST
                formData.append('scheduleId', scheduleId);
                formData.append('lessonDate', modalDate);
                formData.append('lessonNumber', String(modalLessonNum));
                files.forEach(f => formData.append('files', f));
                await axios.post('/api/homework', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccess('ДЗ додано');
            }
            setShowModal(false);
            loadEntries();
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            alert(`Помилка: ${msg}`);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`/api/homework/${deleteId}`, { data: { databaseName } });
            setEntries(prev => prev.filter(e => e._id !== deleteId));
            setSuccess('ДЗ видалено');
        } catch (err) {
            alert('Помилка видалення');
        } finally {
            setDeleteId(null);
        }
    };

    // Map entries by lessonDate for quick lookup
    const entryByDate = {};
    entries.forEach(e => { entryByDate[e.lessonDate] = e; });

    return (
        <div style={{ marginTop: '28px' }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaBookOpen style={{ color: BRAND, fontSize: '20px' }} />
                    <h3 style={{ margin: 0, fontSize: isMobile ? '17px' : '20px', fontWeight: '500', color: '#1f2937' }}>
                        Домашні завдання
                    </h3>
                    {entries.length > 0 && (
                        <span style={{ backgroundColor: '#e0f4f5', color: '#0e6b72', fontSize: '12px', fontWeight: '600', padding: '2px 10px', borderRadius: '12px' }}>
                            {entries.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={openAddGeneral}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px',
                        backgroundColor: BRAND, color: 'white',
                        border: 'none', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '14px', fontWeight: '500',
                    }}
                >
                    <FaPlus size={12} />
                    {isMobile ? 'Додати' : 'Додати ДЗ'}
                </button>
            </div>

            {/* Success banner */}
            {success && (
                <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: '6px', marginBottom: '14px', fontSize: '14px' }}>
                    {success}
                </div>
            )}

            {/* Month navigation — reuses GradebookPage month switcher */}
            {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', backgroundColor: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <button
                    onClick={onPrevMonth}
                    disabled={currentMonthIdx === 0}
                    style={{ background: 'none', border: 'none', cursor: currentMonthIdx === 0 ? 'not-allowed' : 'pointer', color: currentMonthIdx === 0 ? '#d1d5db' : '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px' }}
                >
                    <FaChevronLeft />
                </button>

                {isMobile ? (
                    <select
                        value={currentMonthIdx}
                        onChange={e => onMonthSelect(parseInt(e.target.value))}
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }}
                    >
                        {availableMonths.map((m, i) => (
                            <option key={i} value={i}>{m.label}</option>
                        ))}
                    </select>
                ) : (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {availableMonths.map((m, i) => (
                            <button
                                key={i}
                                onClick={() => onMonthSelect(i)}
                                style={{
                                    padding: '6px 14px', borderRadius: '6px', border: 'none',
                                    backgroundColor: currentMonthIdx === i ? BRAND : '#f3f4f6',
                                    color: currentMonthIdx === i ? 'white' : '#374151',
                                    cursor: 'pointer', fontSize: '13px',
                                    fontWeight: currentMonthIdx === i ? '600' : '400',
                                }}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                )}

                <button
                    onClick={onNextMonth}
                    disabled={currentMonthIdx === availableMonths.length - 1}
                    style={{ background: 'none', border: 'none', cursor: currentMonthIdx === availableMonths.length - 1 ? 'not-allowed' : 'pointer', color: currentMonthIdx === availableMonths.length - 1 ? '#d1d5db' : '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px' }}
                >
                    <FaChevronRight />
                </button>
            </div> */}

            {/* Main table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Завантаження...</div>
            ) : (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'white' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '500px' : '700px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ padding: '11px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>Дата уроку</th>
                                    <th style={{ padding: '11px 12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151', width: '52px' }}>№</th>
                                    <th style={{ padding: '11px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Тема уроку</th>
                                    {!isMobile && <th style={{ padding: '11px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Домашнє завдання</th>}
                                    <th style={{ padding: '11px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>Здати до</th>
                                    <th style={{ padding: '11px 12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151', width: '50px' }}>Файли</th>
                                    <th style={{ padding: '11px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', width: '110px' }}>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Rows per lesson date */}
                                {dates.filter(d => !d.isHoliday).map((date, idx) => {
                                    const entry = entryByDate[date.fullDate];
                                    if (entry) {
                                        return (
                                            <HomeworkRow
                                                key={entry._id}
                                                entry={entry}
                                                index={idx}
                                                onEdit={openEdit}
                                                onDelete={setDeleteId}
                                                isMobile={isMobile}
                                            />
                                        );
                                    }
                                    // Empty row — quick-add button
                                    return (
                                        <tr
                                            key={date.fullDate}
                                            style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa' }}
                                        >
                                            <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
                                                {date.formatted}
                                            </td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                <span style={{ backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td colSpan={isMobile ? 3 : 4} style={{ padding: '10px 12px' }}>
                                                <button
                                                    onClick={() => openAddForDate(date)}
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                        padding: '4px 12px',
                                                        border: `1px dashed ${BRAND}`, borderRadius: '6px',
                                                        background: 'transparent', color: BRAND,
                                                        cursor: 'pointer', fontSize: '12px',
                                                    }}
                                                >
                                                    <FaPlus size={10} /> Додати ДЗ
                                                </button>
                                            </td>
                                            <td style={{ padding: '10px 12px' }} />
                                        </tr>
                                    );
                                })}

                                {dates.filter(d => !d.isHoliday).length === 0 && (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                                            Немає уроків у цьому місяці
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            <HomeworkModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSave={handleSave}
                existing={editEntry}
                lessonDate={modalDate}
                lessonNumber={modalLessonNum}
                availableDates={dates.filter(d => !d.isHoliday)}
                isMobile={isMobile}
            />

            <HomeworkDeleteConfirm
                show={!!deleteId}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};

export default HomeworkTab;