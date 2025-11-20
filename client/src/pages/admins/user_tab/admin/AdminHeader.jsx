import React from 'react';
import { FaSort, FaSearch } from "react-icons/fa";

const AdminHeader = ({ adminCount, searchQuery, onSearchChange, sortOrder, onSortToggle }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '15px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h3 style={{ margin: 0 }}>Адміністратори ({adminCount})</h3>
                <button
                    onClick={onSortToggle}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: 'transparent',
                        color: 'rgba(105, 180, 185, 1)',
                        border: '1px solid rgba(105, 180, 185, 1)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <FaSort />
                    {sortOrder === 'asc' ? 'А-Я' : 'Я-А'}
                </button>
            </div>

            <div style={{ position: 'relative', width: '300px' }}>
                <FaSearch style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280'
                }} />
                <input
                    type="text"
                    placeholder="Пошук адміністраторів..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 10px 10px 35px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px'
                    }}
                />
            </div>
        </div>
    );
};

export default AdminHeader;