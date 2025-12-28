import React, { useState } from 'react';
import { FaCog, FaUsers } from 'react-icons/fa';

const ConfigureSubgroupsButton = ({ group, databaseName, isMobile, onSubgroupsConfigured }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [numberOfSubgroups, setNumberOfSubgroups] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleConfigure = () => {
        setShowPopup(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!databaseName) {
                throw new Error('Не вказано базу даних');
            }

            const response = await fetch('http://localhost:3001/api/groups/subgroups/create-subgroups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    databaseName,
                    groupId: group._id,
                    numberOfSubgroups
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Помилка при створенні підгруп');
            }

            alert(data.message);
            setShowPopup(false);
            if (onSubgroupsConfigured) {
                onSubgroupsConfigured();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleConfigure}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: isMobile ? '8px 12px' : '6px 10px',
                    backgroundColor: 'rgba(105, 180, 185, 1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '13px' : '11px',
                    transition: 'background-color 0.2s'
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
                <FaCog size={isMobile ? 14 : 16} />
                <span style={{ fontSize: isMobile ? '12px' : '14px' }}>
                    {isMobile ? 'Підгрупи' : 'Налаштувати підгрупи'}
                </span>
            </button>

            {showPopup && (
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
                        maxWidth: '500px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '20px', color: '#374151' }}>
                                Налаштування підгруп
                            </h3>
                            <button
                                onClick={() => setShowPopup(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    color: '#6b7280'
                                }}
                            >
                                ×
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

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Група
                                </label>
                                <div style={{
                                    padding: '10px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <strong>{group.name}</strong>
                                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                                        Студентів: {group.students?.length || 0}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Кількість підгруп
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {[1, 2, 3].map(num => (
                                        <label key={num} style={{
                                            flex: 1,
                                            padding: '12px',
                                            backgroundColor: numberOfSubgroups === num ? 'rgba(105, 180, 185, 0.2)' : '#f9fafb',
                                            border: `2px solid ${numberOfSubgroups === num ? 'rgba(105, 180, 185, 1)' : '#e5e7eb'}`,
                                            borderRadius: '6px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}>
                                            <input
                                                type="radio"
                                                name="subgroups"
                                                value={num}
                                                checked={numberOfSubgroups === num}
                                                onChange={(e) => setNumberOfSubgroups(parseInt(e.target.value))}
                                                style={{ display: 'none' }}
                                            />
                                            <div style={{
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                color: numberOfSubgroups === num ? 'rgba(105, 180, 185, 1)' : '#374151'
                                            }}>
                                                {num}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                marginTop: '4px'
                                            }}>
                                                підгруп{num === 1 ? 'а' : 'и'}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    marginTop: '8px'
                                }}>
                                    Максимум 3 підгрупи
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: '#f0f9ff',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                border: '1px solid #bae6fd'
                            }}>
                                <h4 style={{
                                    margin: '0 0 8px 0',
                                    fontSize: '16px',
                                    color: '#0369a1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FaUsers />
                                    План розподілу
                                </h4>
                                <div style={{ fontSize: '14px', color: '#374151' }}>
                                    {(() => {
                                        const totalStudents = group.students?.length || 0;
                                        const subgroups = numberOfSubgroups;
                                        const baseSize = Math.floor(totalStudents / subgroups);
                                        const remainder = totalStudents % subgroups;

                                        return (
                                            <div>
                                                <p>Загальна кількість студентів: {totalStudents}</p>
                                                <p>Розподіл по {subgroups} підгрупах:</p>
                                                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                                    {Array.from({ length: subgroups }).map((_, index) => {
                                                        const size = index < remainder ? baseSize + 1 : baseSize;
                                                        return (
                                                            <li key={index}>
                                                                Підгрупа {index + 1}: {size} студентів
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                marginTop: '24px'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowPopup(false)}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: '#6b7280',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        opacity: loading ? 0.6 : 1
                                    }}
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: 'rgba(105, 180, 185, 1)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        opacity: loading ? 0.6 : 1
                                    }}
                                >
                                    {loading ? 'Створення...' : 'Створити підгрупи'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ConfigureSubgroupsButton;