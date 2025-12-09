import React from "react";
import { FaExclamationTriangle, FaTimes, FaTrash } from "react-icons/fa";

const DeleteClassroom = ({ show, onClose, onConfirm, classroom, isMobile = false }) => {
    if (!show) return null;

    const getTypeLabel = (type) => {
        const labels = {
            'lecture': 'Лекційна',
            'practice': 'Практична',
            'lab': 'Лабораторія',
            'general': 'Загальна'
        };
        return labels[type] || 'Загальна';
    };

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
            alignItems: isMobile ? 'flex-start' : 'center',
            zIndex: 1000,
            padding: isMobile ? '16px' : '0'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '24px',
                width: isMobile ? '100%' : '90%',
                maxWidth: '400px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                marginTop: isMobile ? '0' : 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: isMobile ? '16px' : '20px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '8px' : '10px'
                    }}>
                        <div style={{
                            backgroundColor: '#fef2f2',
                            borderRadius: '50%',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <FaExclamationTriangle style={{
                                color: '#ef4444',
                                fontSize: isMobile ? '18px' : '20px'
                            }} />
                        </div>
                        <h3 style={{
                            margin: 0,
                            fontSize: isMobile ? '16px' : '18px',
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
                            fontSize: isMobile ? '18px' : '20px',
                            color: '#6b7280',
                            padding: '4px',
                            flexShrink: 0
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div style={{ marginBottom: isMobile ? '20px' : '24px' }}>
                    <p style={{
                        margin: '0 0 12px 0',
                        color: '#6b7280',
                        lineHeight: '1.5',
                        fontSize: isMobile ? '14px' : '15px'
                    }}>
                        Ви впевнені, що хочете видалити аудиторію?
                    </p>

                    {classroom && (
                        <div style={{
                            backgroundColor: '#f9fafb',
                            padding: isMobile ? '10px 12px' : '12px 16px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            marginBottom: '12px'
                        }}>
                            <p style={{
                                margin: '0 0 4px 0',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: isMobile ? '14px' : '15px'
                            }}>
                                {classroom.name}
                            </p>
                            <p style={{
                                margin: 0,
                                fontSize: isMobile ? '13px' : '14px',
                                color: '#6b7280'
                            }}>
                                Тип: {getTypeLabel(classroom.type)} • Місткість: {classroom.capacity} осіб
                            </p>
                        </div>
                    )}

                    <div style={{
                        backgroundColor: '#fef2f2',
                        padding: isMobile ? '10px 12px' : '12px 16px',
                        borderRadius: '6px'
                    }}>
                        <p style={{
                            margin: 0,
                            fontSize: isMobile ? '13px' : '14px',
                            color: '#dc2626',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <FaExclamationTriangle />
                            Цю дію неможливо скасувати!
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end',
                    flexDirection: isMobile ? 'column' : 'row'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: isMobile ? '12px' : '12px',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: isMobile ? '14px' : '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaTimes size={isMobile ? 12 : 14} />
                        Скасувати
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        style={{
                            padding: isMobile ? '12px' : '12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: isMobile ? '14px' : '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaTrash size={isMobile ? 12 : 14} />
                        Видалити
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteClassroom;