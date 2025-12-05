import React from 'react';
import { FaTimes, FaSearch, FaChild } from "react-icons/fa";

const AddChildPopup = ({
    selectedParent,
    searchQuery,
    searchResults,
    isSearching,
    databaseName,
    onClose,
    onSearchChange,
    onAddChild
}) => {
    if (!selectedParent) return null;

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
                maxWidth: '500px',
                maxHeight: '80vh',
                overflowY: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: 0 }}>Знайти дитину для {selectedParent.fullName}</h3>
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

                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Введіть ім'я, email або назву групи (мінімум 3 символи)..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)} // Повертаємо оригінальну функцію
                            style={{
                                width: '100%',
                                padding: '12px 45px 12px 15px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                        />
                        <FaSearch
                            style={{
                                position: 'absolute',
                                right: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#6b7280'
                            }}
                        />
                    </div>

                    {searchQuery.length > 0 && searchQuery.length < 3 && (
                        <div style={{
                            fontSize: '12px',
                            color: '#ef4444',
                            marginTop: '5px'
                        }}>
                            Введіть щонайменше 3 символи для пошуку
                        </div>
                    )}
                </div>

                <div>
                    {isSearching && searchQuery.length >= 3 && (
                        <div style={{ marginBottom: '10px', fontSize: '14px', color: '#6b7280' }}>
                            Знайдено: {searchResults.length} студентів
                        </div>
                    )}

                    {searchQuery.length >= 3 ? (
                        searchResults.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {searchResults.map(student => (
                                    <div
                                        key={student._id}
                                        onClick={() => onAddChild(student._id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 15px',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = '#f3f4f6';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = '#f9fafb';
                                        }}
                                    >
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
                                            <FaChild />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                {student.fullName}
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                marginBottom: '2px'
                                            }}>
                                                {student.email}
                                            </div>
                                            {student.group && (
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: '#6b7280'
                                                }}>
                                                    Група: {student.group.name}
                                                </div>
                                            )}
                                            {student.parents && student.parents.length > 0 && (
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: student.parents.length >= 2 ? '#ef4444' : '#f59e0b'
                                                }}>
                                                    Батьків: {student.parents.length}/2
                                                    {student.parents.length >= 2 && ' (максимум)'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                <p>Студентів за запитом "{searchQuery}" не знайдено</p>
                            </div>
                        )
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                            <p>Введіть запит для пошуку студентів</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddChildPopup;