import React, { useState, useEffect } from 'react';

const HomeworkModal = ({ show, onHide, onSave, onDelete, existingHomework, isMobile }) => {
    const [text, setText] = useState('');

    useEffect(() => {
        if (existingHomework) {
            setText(existingHomework.text || '');
        } else {
            setText('');
        }
    }, [existingHomework, show]);

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: isMobile ? '20px' : '24px',
                width: isMobile ? '90%' : '500px',
                maxWidth: '500px'
            }}>
                <h3 style={{ margin: '0 0 20px 0' }}>
                    {existingHomework ? 'Редагувати домашнє завдання' : 'Додати домашнє завдання'}
                </h3>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Введіть текст домашнього завдання..."
                    rows={5}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        marginBottom: '20px',
                        resize: 'vertical'
                    }}
                />

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end'
                }}>
                    {existingHomework && (
                        <button
                            onClick={onDelete}
                            style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Видалити
                        </button>
                    )}
                    <button
                        onClick={onHide}
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #e5e7eb',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Скасувати
                    </button>
                    <button
                        onClick={() => onSave(text)}
                        disabled={!text.trim()}
                        style={{
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: text.trim() ? 'pointer' : 'not-allowed',
                            opacity: text.trim() ? 1 : 0.5
                        }}
                    >
                        Зберегти
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeworkModal;