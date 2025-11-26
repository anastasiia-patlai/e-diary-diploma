import React, { useState } from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";

const DeleteStudentPopup = ({ student, databaseName, onClose, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        setLoading(true);
        setError("");

        try {
            if (!databaseName) {
                setError("Не вдалося отримати інформацію про базу даних");
                setLoading(false);
                return;
            }

            await axios.delete(`http://localhost:3001/api/users/${student._id}`, {
                data: { databaseName }
            });
            onDelete(student._id);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Помилка при видаленні студента");
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
                        Видалення студента
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

                {/* ПОПЕРЕДЖЕННЯ */}
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
                            Ви впевнені, що хочете видалити студента?
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                            <strong>{student.fullName}</strong>
                            <br />
                            {student.email}
                        </p>
                        <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#dc2626' }}>
                            Цю дію неможливо буде скасувати!
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
                        {loading ? 'Видалення...' : 'Так, видалити'}
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
                        Скасувати
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteStudentPopup;