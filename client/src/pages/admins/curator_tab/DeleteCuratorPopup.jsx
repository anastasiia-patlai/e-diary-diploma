import React from 'react';
import { FaExclamationTriangle, FaTimes, FaUser } from 'react-icons/fa';

const DeleteCuratorPopup = ({
    group,
    onConfirm,
    onClose
}) => {
    if (!group || !group.curator) return null;

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
                maxWidth: '450px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
                {/* Заголовок */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#fef2f2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#dc2626'
                        }}>
                            <FaExclamationTriangle />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, color: '#1f2937' }}>
                                Видалення куратора
                            </h3>
                            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                                Підтвердіть видалення
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                            color: '#6b7280',
                            padding: '4px'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* ІНФО ПРО ГРУПУ І КУРАТОРА */}
                <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                            Група
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                            {group.name}
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px solid #f1f5f9'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#475569'
                        }}>
                            <FaUser />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>
                                {group.curator.fullName}
                            </div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                {group.curator.position}
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                {group.curator.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ПОПЕРЕДЖЕННЯ */}
                <div style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fcd34d',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <FaExclamationTriangle style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <div style={{ fontWeight: '600', color: '#92400e', fontSize: '14px' }}>
                                Увага!
                            </div>
                            <div style={{ color: '#b45309', fontSize: '13px', lineHeight: '1.4' }}>
                                Група залишиться без куратора. Студенти не зможуть отримувати повідомлення та підтримку від куратора.
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'white',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                        }}
                    >
                        Скасувати
                    </button>
                    <button
                        onClick={() => onConfirm(group._id)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#b91c1c';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                        }}
                    >
                        Видалити куратора
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCuratorPopup;