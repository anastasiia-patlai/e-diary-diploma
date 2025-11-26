import React from "react";
import { FaExclamationTriangle, FaTimes, FaTrash } from "react-icons/fa";

const DeleteClassroom = ({ show, onClose, onConfirm, classroom }) => {
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
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <div style={{
                            backgroundColor: '#fef2f2',
                            borderRadius: '50%',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FaExclamationTriangle style={{
                                color: '#ef4444',
                                fontSize: '20px'
                            }} />
                        </div>
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            color: '#374151',
                            fontWeight: '600'
                        }}>
                            Видалення аудиторії
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                            color: '#6b7280',
                            transition: 'color 0.2s',
                            padding: '4px'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.color = '#374151';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = '#6b7280';
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <p style={{
                        margin: '0 0 12px 0',
                        color: '#6b7280',
                        lineHeight: '1.5'
                    }}>
                        Ви впевнені, що хочете видалити аудиторію?
                    </p>

                    {classroom && (
                        <div style={{
                            backgroundColor: '#f9fafb',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <p style={{
                                margin: '0 0 4px 0',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                {classroom.name}
                            </p>
                            <p style={{
                                margin: 0,
                                fontSize: '14px',
                                color: '#6b7280'
                            }}>
                                Тип: {getTypeLabel(classroom.type)} • Місткість: {classroom.capacity} осіб
                            </p>
                        </div>
                    )}

                    <div style={{
                        backgroundColor: '#fef2f2',
                        padding: '12px',
                        borderRadius: '6px',
                        marginTop: '12px'
                    }}>
                        <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#dc2626',
                            fontWeight: '500'
                        }}>
                            ⚠️ Цю дію неможливо скасувати!
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#e5e7eb';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#f3f4f6';
                        }}
                    >
                        <FaTimes />
                        Скасувати
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#dc2626';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#ef4444';
                        }}
                    >
                        <FaTrash />
                        Видалити
                    </button>
                </div>
            </div>
        </div>
    );
};

const getTypeLabel = (type) => {
    const labels = {
        'lecture': 'Лекційна',
        'practice': 'Практична',
        'lab': 'Лабораторія',
        'general': 'Загальна'
    };
    return labels[type] || 'Загальна';
};

export default DeleteClassroom;