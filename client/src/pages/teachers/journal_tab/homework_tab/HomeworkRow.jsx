import React, { useState } from 'react';
import { FaEdit, FaTrash, FaPaperclip, FaCheck } from 'react-icons/fa';

const BRAND = 'rgba(105, 180, 185, 1)';

const HomeworkRow = ({ entry, index, onEdit, onDelete, isMobile }) => {
    const [expanded, setExpanded] = useState(false);

    const formatDate = (str) => {
        if (!str) return '—';
        const [y, m, d] = str.split('-');
        return `${d}.${m}.${y}`;
    };

    const duePassed = entry.dueDate && new Date(entry.dueDate) < new Date();

    return (
        <>
            <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}>
                {/* Lesson date */}
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontSize: '13px', color: '#374151' }}>
                    {formatDate(entry.lessonDate)}
                </td>

                {/* Lesson number */}
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                        backgroundColor: '#e5e7eb', color: '#374151',
                        borderRadius: '50%', width: '24px', height: '24px',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: '600',
                    }}>
                        {entry.lessonNumber}
                    </span>
                </td>

                {/* Topic */}
                <td style={{ padding: '10px 12px', fontSize: '13px', color: '#111827', fontWeight: '500', maxWidth: isMobile ? '100px' : '200px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.topic}
                    </div>
                </td>

                {/* HW text preview */}
                {!isMobile && (
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#4b5563', maxWidth: '240px' }}>
                        <div
                            style={{
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                cursor: 'pointer', color: BRAND,
                            }}
                            onClick={() => setExpanded(v => !v)}
                            title="Натисніть для перегляду"
                        >
                            {entry.text}
                        </div>
                    </td>
                )}

                {/* Due date */}
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    <span style={{
                        fontSize: '12px', fontWeight: '500',
                        color: duePassed ? '#dc2626' : '#059669',
                        backgroundColor: duePassed ? '#fef2f2' : '#f0fdf4',
                        padding: '3px 8px', borderRadius: '12px',
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                    }}>
                        {duePassed ? null : <FaCheck size={9} />}
                        {formatDate(entry.dueDate)}
                    </span>
                </td>

                {/* Files count */}
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {entry.files?.length > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                            <FaPaperclip size={11} />
                            {entry.files.length}
                        </span>
                    ) : (
                        <span style={{ color: '#d1d5db', fontSize: '12px' }}>—</span>
                    )}
                </td>

                {/* Actions */}
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            onClick={() => onEdit(entry)}
                            style={{
                                padding: '5px 10px', border: `1px solid ${BRAND}`,
                                borderRadius: '5px', background: 'transparent',
                                color: BRAND, cursor: 'pointer', fontSize: '12px',
                                display: 'flex', alignItems: 'center', gap: '4px',
                            }}
                        >
                            <FaEdit size={11} />
                            {!isMobile && 'Ред.'}
                        </button>
                        <button
                            onClick={() => onDelete(entry._id)}
                            style={{
                                padding: '5px 10px', border: '1px solid #fca5a5',
                                borderRadius: '5px', background: 'transparent',
                                color: '#dc2626', cursor: 'pointer', fontSize: '12px',
                                display: 'flex', alignItems: 'center', gap: '4px',
                            }}
                        >
                            <FaTrash size={11} />
                            {!isMobile && 'Вид.'}
                        </button>
                    </div>
                </td>
            </tr>

            {/* Expanded row for full HW text */}
            {expanded && (
                <tr style={{ backgroundColor: '#f0fafb' }}>
                    <td colSpan={7} style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            Тема: {entry.topic}
                        </div>
                        <div style={{ fontSize: '13px', color: '#4b5563', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                            {entry.text}
                        </div>
                        {entry.files?.length > 0 && (
                            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {entry.files.map((f, i) => (
                                    <a
                                        key={i}
                                        href={f.path}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                            padding: '4px 10px',
                                            backgroundColor: 'white', border: '1px solid #e5e7eb',
                                            borderRadius: '6px', fontSize: '12px', color: BRAND,
                                            textDecoration: 'none',
                                        }}
                                    >
                                        <FaPaperclip size={10} />
                                        {f.originalName}
                                    </a>
                                ))}
                            </div>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
};

export default HomeworkRow;