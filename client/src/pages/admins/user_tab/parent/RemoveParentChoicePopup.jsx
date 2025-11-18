import React from 'react';
import { FaUserMinus, FaTimes } from 'react-icons/fa';

const RemoveParentChoicePopup = ({ child, onClose, onRemoveParent, onRemoveBothParents }) => {
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
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                maxWidth: '500px',
                width: '100%'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: 0, color: '#1f2937' }}>
                        Відв'язати батька від дитини
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            fontSize: '20px'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <p style={{ margin: '0 0 20px 0', color: '#6b7280' }}>
                    Оберіть, кого видалити з дитини <strong>{child.fullName}</strong>:
                </p>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '20px'
                }}>
                    {child.parents && child.parents.map(parent => (
                        <button
                            key={parent._id}
                            onClick={() => onRemoveParent(child._id, parent._id)}
                            style={{
                                padding: '12px 16px',
                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background-color 0.2s',
                                textAlign: 'left'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                            }}
                        >
                            <FaUserMinus />
                            <div>
                                <div style={{ fontWeight: '500' }}>{parent.fullName}</div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>{parent.email}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '16px',
                    display: 'flex',
                    gap: '10px'
                }}>
                    <button
                        onClick={() => onRemoveBothParents(child._id)}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                        }}
                    >
                        Видалити обох батьків
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#4b5563';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#6b7280';
                        }}
                    >
                        Скасувати
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RemoveParentChoicePopup;