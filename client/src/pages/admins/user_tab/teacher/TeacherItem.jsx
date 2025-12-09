import React from 'react';
import { FaUser, FaEnvelope } from "react-icons/fa";

const TeacherItem = ({ teacher, onEdit, onDelete, isMobile }) => {
    return (
        <div key={teacher._id} style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '12px' : '15px',
            padding: isMobile ? '16px' : '12px 15px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            marginBottom: isMobile ? '12px' : '0'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '12px' : '15px',
                flex: 1
            }}>
                <div style={{
                    width: isMobile ? '48px' : '40px',
                    height: isMobile ? '48px' : '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(105, 180, 185, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(105, 180, 185, 1)',
                    flexShrink: 0
                }}>
                    <FaUser size={isMobile ? 18 : 16} />
                </div>
                <div style={{
                    flex: 1,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        fontWeight: '600',
                        marginBottom: isMobile ? '6px' : '4px',
                        fontSize: isMobile ? '16px' : '14px',
                        wordBreak: 'break-word'
                    }}>
                        {teacher.fullName}
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: isMobile ? '13px' : '12px',
                        color: '#6b7280',
                        marginBottom: isMobile ? '8px' : '4px'
                    }}>
                        <FaEnvelope size={isMobile ? 12 : 10} />
                        <span style={{
                            wordBreak: 'break-word'
                        }}>
                            {teacher.email}
                        </span>
                    </div>

                    {/* КАТЕГОРІЯ ВЧИТЕЛЯ */}
                    {teacher.category && (
                        <div style={{
                            fontSize: isMobile ? '12px' : '11px',
                            color: '#059669',
                            fontWeight: '500',
                            backgroundColor: 'rgba(5, 150, 105, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            marginBottom: isMobile ? '6px' : '4px',
                            display: 'inline-block'
                        }}>
                            {teacher.category}
                        </div>
                    )}

                    {teacher.phone && (
                        <div style={{
                            fontSize: isMobile ? '13px' : '12px',
                            color: '#6b7280'
                        }}>
                            📞 {teacher.phone}
                        </div>
                    )}
                </div>
            </div>
            <div style={{
                display: 'flex',
                gap: '10px',
                width: isMobile ? '100%' : 'auto'
            }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(teacher);
                    }}
                    style={{
                        padding: isMobile ? '8px' : '4px 8px',
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: isMobile ? '6px' : '4px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '13px' : '11px',
                        flex: 1,
                        minHeight: '32px',
                        height: '32px',
                        transition: isMobile ? 'none' : 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseOver={(e) => {
                        if (!isMobile) {
                            e.currentTarget.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!isMobile) {
                            e.currentTarget.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                        }
                    }}
                >
                    Редагувати
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(teacher);
                    }}
                    style={{
                        padding: isMobile ? '8px' : '4px 8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: isMobile ? '6px' : '4px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '13px' : '11px',
                        flex: 1,
                        minHeight: '32px',
                        height: '32px',
                        transition: isMobile ? 'none' : 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseOver={(e) => {
                        if (!isMobile) {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!isMobile) {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                        }
                    }}
                >
                    Видалити
                </button>
            </div>
        </div>
    );
};

export default TeacherItem;