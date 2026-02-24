import React, { useState, useEffect } from 'react';

const GradeModal = ({ show, onHide, onSave, onDelete, existingGrade, isMobile }) => {
    const [grade, setGrade] = useState('');

    useEffect(() => {
        if (existingGrade) {
            setGrade(existingGrade.value.toString());
        } else {
            setGrade('');
        }
    }, [existingGrade, show]);

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
                width: isMobile ? '90%' : '400px',
                maxWidth: '400px'
            }}>
                <h3 style={{ margin: '0 0 20px 0' }}>
                    {existingGrade ? 'Редагувати оцінку' : 'Додати оцінку'}
                </h3>

                <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        marginBottom: '20px'
                    }}
                >
                    <option value="">Оберіть оцінку</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                        <option key={num} value={num}>{num}</option>
                    ))}
                </select>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end'
                }}>
                    {existingGrade && (
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
                        onClick={() => onSave({ value: parseInt(grade) })}
                        disabled={!grade}
                        style={{
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: grade ? 'pointer' : 'not-allowed',
                            opacity: grade ? 1 : 0.5
                        }}
                    >
                        Зберегти
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GradeModal;