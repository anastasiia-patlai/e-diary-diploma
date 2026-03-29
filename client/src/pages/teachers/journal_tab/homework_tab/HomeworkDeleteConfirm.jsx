import React from 'react';

const HomeworkDeleteConfirm = ({ show, onConfirm, onCancel }) => {
    if (!show) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000,
        }}>
            <div style={{
                background: 'white', borderRadius: '12px', padding: '28px 24px',
                width: '340px', maxWidth: '95vw',
                border: '0.5px solid #e5e7eb',
            }}>
                <div style={{ fontWeight: '500', fontSize: '16px', marginBottom: '10px', color: '#111827' }}>
                    Видалити домашнє завдання?
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
                    Запис про ДЗ та прикріплені файли будуть видалені. Це незворотно.
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        style={{ padding: '9px 18px', borderRadius: '7px', border: '1px solid #e5e7eb', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#6b7280' }}
                    >
                        Скасувати
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{ padding: '9px 18px', borderRadius: '7px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                    >
                        Видалити
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeworkDeleteConfirm;