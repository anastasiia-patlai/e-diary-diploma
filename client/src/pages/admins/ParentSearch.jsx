import React from 'react';
import { FaSearch } from "react-icons/fa";

const ParentSearch = ({ searchQuery, onSearchChange, filteredParentsCount }) => {
    return (
        <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Пошук батьків за іменем, email, телефоном або іменем дитини..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 45px 12px 15px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
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
            {searchQuery && (
                <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <FaSearch size={12} />
                    Знайдено {filteredParentsCount} батьків за запитом "{searchQuery}"
                </div>
            )}
        </div>
    );
};

export default ParentSearch;