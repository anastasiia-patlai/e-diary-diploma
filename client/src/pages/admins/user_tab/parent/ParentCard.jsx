import React from 'react';
import {
    FaUserFriends, FaEnvelope, FaPhone, FaChild,
    FaSearch, FaEdit, FaTrash, FaTimes
} from "react-icons/fa";

const ParentCard = ({
    parent,
    onAddChild,
    onEdit,
    onDelete,
    onRemoveChild
}) => {
    return (
        <div key={parent._id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9fafb',
            transition: 'box-shadow 0.2s'
        }}
            onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(105, 180, 185, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(105, 180, 185, 1)'
                    }}>
                        <FaUserFriends />
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                            {parent.fullName}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            color: '#6b7280'
                        }}>
                            <FaEnvelope size={12} />
                            {parent.email}
                        </div>
                        {parent.phone && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                color: '#6b7280',
                                marginTop: '2px'
                            }}>
                                <FaPhone size={12} />
                                {parent.phone}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => onAddChild(parent)}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <FaSearch />
                        Знайти дитину
                    </button>
                    <button
                        onClick={() => onEdit(parent)}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <FaEdit />
                        Редагувати
                    </button>
                    <button
                        onClick={() => onDelete(parent)}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <FaTrash />
                        Видалити
                    </button>
                </div>
            </div>

            {/* Діти батька */}
            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                }}>
                    <div style={{
                        fontWeight: '600',
                        color: 'rgba(105, 180, 185, 1)'
                    }}>
                        Діти ({parent.children ? parent.children.length : 0})
                    </div>
                </div>

                {parent.children && parent.children.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {parent.children.map(child => (
                            <div key={child._id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 12px',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                transition: 'background-color 0.2s'
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaChild style={{ color: 'rgba(105, 180, 185, 1)' }} />
                                    <span style={{ fontWeight: '500' }}>{child.fullName}</span>
                                    {child.group && (
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#6b7280',
                                            backgroundColor: '#f3f4f6',
                                            padding: '2px 6px',
                                            borderRadius: '4px'
                                        }}>
                                            {child.group.name}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => onRemoveChild(parent._id, child._id)}
                                    style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <FaTimes size={10} />
                                    Видалити
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#6b7280',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px dashed #e5e7eb'
                    }}>
                        <p>Дітей не додано</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentCard;