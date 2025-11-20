import React from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

const ConfirmationModal = ({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Підтвердити",
    cancelText = "Скасувати",
    type = "info"
}) => {
    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <FaExclamationTriangle style={{ color: '#dc2626' }} />;
            case 'success':
                return <FaCheckCircle style={{ color: '#10b981' }} />;
            default:
                return <FaInfoCircle style={{ color: '#3b82f6' }} />;
        }
    };

    const getConfirmButtonStyle = () => {
        switch (type) {
            case 'danger':
                return { backgroundColor: '#dc2626', color: 'white' };
            case 'success':
                return { backgroundColor: '#10b981', color: 'white' };
            default:
                return { backgroundColor: '#3b82f6', color: 'white' };
        }
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
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                }}>
                    <div style={{ fontSize: '24px' }}>
                        {getIcon()}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#1f2937' }}>
                        {title}
                    </h3>
                </div>

                <p style={{
                    margin: '0 0 24px 0',
                    color: '#6b7280',
                    fontSize: '14px',
                    lineHeight: '1.5'
                }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '10px 20px',
                            ...getConfirmButtonStyle(),
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;