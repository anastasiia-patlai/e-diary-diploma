import React from 'react';
import { FaUser, FaEnvelope } from 'react-icons/fa';

const StudentItem = ({ student, onEdit, onDelete }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '12px 15px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(105, 180, 185, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(105, 180, 185, 1)'
            }}>
                <FaUser />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {student.fullName}
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#6b7280'
                }}>
                    <FaEnvelope size={12} />
                    {student.email}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(student);
                    }}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    Редагувати
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(student);
                    }}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    Видалити
                </button>
            </div>
        </div>
    );
};

export default StudentItem;