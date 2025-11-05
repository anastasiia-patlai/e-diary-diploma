import React from "react";
import { FaPlus } from "react-icons/fa";

const ScheduleHeader = ({ onShowModal, groups, selectedGroup, onGroupChange }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        }}>
            <div>
                <h3 style={{ margin: 0, marginBottom: '4px' }}>Розклад занять</h3>
                <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: '14px'
                }}>
                    Управління розкладом для груп
                </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* Фільтр по групах */}
                {groups.length > 0 && (
                    <select
                        value={selectedGroup}
                        onChange={(e) => onGroupChange(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none',
                            minWidth: '200px'
                        }}
                    >
                        <option value="">Всі групи</option>
                        {groups.map(group => (
                            <option key={group._id} value={group._id}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                )}

                {/* Кнопка додавання */}
                <button
                    onClick={onShowModal}
                    style={{
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.8)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                    }}
                >
                    <FaPlus />
                    Додати заняття
                </button>
            </div>
        </div>
    );
};

export default ScheduleHeader;