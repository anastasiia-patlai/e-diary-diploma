import React, { useState } from 'react';
import { FaExclamationTriangle, FaTrash, FaTimes } from "react-icons/fa";
import axios from "axios";

const AdminParentDelete = ({ parent, onClose, onDelete, databaseName }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (!databaseName) {
            setError("Не вказано базу даних");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.delete(`http://localhost:3001/api/users/${parent._id}`, {
                params: { databaseName }
            });
            onDelete(parent._id);
            onClose();
        } catch (err) {
            console.error('Помилка видалення батька:', err);
            setError(err.response?.data?.error || 'Помилка видалення батька');
        } finally {
            setLoading(false);
        }
    };

    if (!parent) return null;

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
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: 0, color: '#dc2626' }}>
                        Видалення батька
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '20px',
                            color: '#6b7280'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '8px',
                    border: '1px solid #fecaca'
                }}>
                    <FaExclamationTriangle style={{ color: '#dc2626', fontSize: '24px' }} />
                    <div>
                        <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '5px' }}>
                            Увага! Цю дію не можна скасувати
                        </div>
                        <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                            Ви дійсно хочете видалити цього батька?
                        </div>
                    </div>
                </div>

                <div style={{
                    padding: '15px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                        Інформація про батька:
                    </div>
                    <div style={{ fontSize: '14px', color: '#374151' }}>
                        <div><strong>ПІБ:</strong> {parent.fullName}</div>
                        <div><strong>Email:</strong> {parent.email}</div>
                        {parent.phone && <div><strong>Телефон:</strong> {parent.phone}</div>}
                        {parent.children && parent.children.length > 0 && (
                            <div style={{ color: '#dc2626', marginTop: '8px' }}>
                                <strong>Увага!</strong> У батька є {parent.children.length} дітей
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div style={{
                        padding: '10px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        color: '#dc2626',
                        marginBottom: '15px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaTimes />
                        Скасувати
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        <FaTrash />
                        {loading ? 'Видалення...' : 'Видалити'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminParentDelete;