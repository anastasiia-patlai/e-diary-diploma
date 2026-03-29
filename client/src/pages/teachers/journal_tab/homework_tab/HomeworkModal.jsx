import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaTrash, FaPaperclip } from 'react-icons/fa';

const BRAND = 'rgba(105, 180, 185, 1)';

const HomeworkModal = ({
    show,
    onHide,
    onSave,
    existing,      // existing HomeworkEntry or null
    lessonDate,    // 'YYYY-MM-DD'
    lessonNumber,  // number
    availableDates, // array of { fullDate, formatted, dayOfWeek } for dueDate picker
    isMobile,
}) => {
    const [topic, setTopic] = useState('');
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [files, setFiles] = useState([]);       // new File objects
    const [existingFiles, setExistingFiles] = useState([]); // already saved
    const [filesToRemove, setFilesToRemove] = useState([]);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef();

    // Reset form only when the modal is opened (show flips to true) or the target entry changes.
    // availableDates is intentionally excluded — it's a new array reference on every parent
    // render, which would reset the form while the user is typing.
    useEffect(() => {
        if (!show) return; // don't reset when closing
        if (existing) {
            setTopic(existing.topic || '');
            setText(existing.text || '');
            setDueDate(existing.dueDate || '');
            setExistingFiles(existing.files || []);
        } else {
            setTopic('');
            setText('');
            // Pick the next lesson date after the current one as default due date
            const next = availableDates.find(d => d.fullDate > lessonDate);
            setDueDate(next?.fullDate || lessonDate || '');
            setExistingFiles([]);
        }
        setFiles([]);
        setFilesToRemove([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, existing?._id, lessonDate]);
    // existing?._id instead of existing — avoids reset when parent passes a new object
    // reference with the same data. availableDates excluded on purpose (see above).

    const handleFileAdd = (e) => {
        const picked = Array.from(e.target.files || []);
        setFiles(prev => [...prev, ...picked]);
        e.target.value = '';
    };

    const removeNewFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

    const removeExistingFile = (filePath) => {
        setFilesToRemove(prev => [...prev, filePath]);
        setExistingFiles(prev => prev.filter(f => f.path !== filePath));
    };

    const handleSubmit = async () => {
        if (!topic.trim() || !text.trim() || !dueDate) return;
        setSaving(true);
        try {
            await onSave({ topic, text, dueDate, files, filesToRemove });
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    const formatBytes = (n) => {
        if (n < 1024) return `${n} Б`;
        if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} КБ`;
        return `${(n / (1024 * 1024)).toFixed(1)} МБ`;
    };

    const inputStyle = {
        width: '100%',
        padding: '9px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#111827',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: isMobile ? '20px' : '28px',
                width: isMobile ? '96%' : '560px',
                maxWidth: '560px',
                maxHeight: '92vh',
                overflowY: 'auto',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                            {existing ? 'Редагувати ДЗ' : 'Додати домашнє завдання'}
                        </h3>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px' }}>
                            Урок {lessonNumber} · {lessonDate?.slice(8)}.{lessonDate?.slice(5, 7)}.{lessonDate?.slice(0, 4)}
                        </div>
                    </div>
                    <button onClick={onHide} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af' }}>
                        <FaTimes />
                    </button>
                </div>

                {/* Topic */}
                <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                        Тема уроку <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        type="text"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder="Введіть тему уроку"
                        style={inputStyle}
                    />
                </div>

                {/* Homework text */}
                <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                        Домашнє завдання <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Опишіть завдання детально..."
                        rows={4}
                        style={{ ...inputStyle, resize: 'vertical', minHeight: '90px', lineHeight: '1.5' }}
                    />
                </div>

                {/* Due date */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                        Здати до <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    {availableDates.length > 0 ? (
                        <select
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            style={{ ...inputStyle, backgroundColor: 'white' }}
                        >
                            <option value="">Виберіть дату...</option>
                            {availableDates.map(d => (
                                <option key={d.fullDate} value={d.fullDate}>
                                    {d.formatted} ({d.dayOfWeek})
                                    {d.fullDate === lessonDate ? ' — цей урок' : ''}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="date"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            style={inputStyle}
                        />
                    )}
                </div>

                {/* Files */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                        Файли (не обов'язково)
                    </label>

                    {/* Existing files */}
                    {existingFiles.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: '#f9fafb', borderRadius: '6px', marginBottom: '6px', border: '0.5px solid #e5e7eb' }}>
                            <FaPaperclip style={{ color: '#9ca3af', fontSize: '12px', flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: '13px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {f.originalName}
                            </span>
                            <span style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>{formatBytes(f.size || 0)}</span>
                            <button
                                onClick={() => removeExistingFile(f.path)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px 4px', flexShrink: 0 }}
                            >
                                <FaTrash size={11} />
                            </button>
                        </div>
                    ))}

                    {/* New files */}
                    {files.map((f, i) => (
                        <div key={`new-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: '#f0fafb', borderRadius: '6px', marginBottom: '6px', border: '0.5px solid #69b4b9' }}>
                            <FaPaperclip style={{ color: BRAND, fontSize: '12px', flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: '13px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {f.name}
                            </span>
                            <span style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>{formatBytes(f.size)}</span>
                            <button
                                onClick={() => removeNewFile(i)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px 4px', flexShrink: 0 }}
                            >
                                <FaTrash size={11} />
                            </button>
                        </div>
                    ))}

                    <input type="file" ref={fileInputRef} multiple onChange={handleFileAdd} style={{ display: 'none' }} />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px',
                            border: '1px dashed #d1d5db', borderRadius: '7px',
                            background: 'transparent', cursor: 'pointer',
                            fontSize: '13px', color: '#6b7280',
                            marginTop: '4px',
                        }}
                    >
                        <FaPaperclip size={12} /> Прикріпити файл
                    </button>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                    <button
                        onClick={onHide}
                        style={{ padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: '7px', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#6b7280' }}
                    >
                        Скасувати
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!topic.trim() || !text.trim() || !dueDate || saving}
                        style={{
                            padding: '9px 22px', border: 'none', borderRadius: '7px',
                            backgroundColor: (!topic.trim() || !text.trim() || !dueDate || saving) ? '#d1d5db' : BRAND,
                            color: 'white', cursor: (!topic.trim() || !text.trim() || !dueDate || saving) ? 'not-allowed' : 'pointer',
                            fontSize: '14px', fontWeight: '500',
                        }}
                    >
                        {saving ? 'Збереження...' : existing ? 'Зберегти' : 'Додати ДЗ'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeworkModal;