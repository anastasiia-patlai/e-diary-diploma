import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";

const DeleteTeacherPopup = ({ teacher, onClose, onDelete, databaseName }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        if (!databaseName) {
            setError(t('admin.teacher.errors.noDatabase'));
            return;
        }

        setLoading(true);
        setError("");

        try {
            await axios.delete(`http://localhost:3001/api/users/${teacher._id}`, {
                data: { databaseName }
            });
            onDelete(teacher._id);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || t('admin.teacher.errors.deleteError'));
        } finally {
            setLoading(false);
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
                maxWidth: '450px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#dc2626' }}>
                        {t('admin.teacher.deleteTitle')}
                    </h2>
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

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #fecaca'
                }}>
                    <FaExclamationTriangle style={{ color: '#dc2626', fontSize: '24px', flexShrink: 0 }} />
                    <div>
                        <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                            {t('admin.teacher.deleteConfirmQuestion')}
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                            <strong>{teacher.fullName}</strong>
                            <br />
                            {teacher.email}
                            {teacher.position && (
                                <>
                                    <br />
                                    {t('admin.teacher.subject')}: {teacher.position}
                                </>
                            )}
                        </p>
                        <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#dc2626' }}>
                            {t('admin.teacher.deleteWarning')}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? t('admin.teacher.deleting') : t('admin.teacher.confirmDelete')}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {t('admin.teacher.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteTeacherPopup;