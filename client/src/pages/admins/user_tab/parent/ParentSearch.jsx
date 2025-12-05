import React from 'react';
import { FaSearch } from "react-icons/fa";

const ParentSearch = ({ searchQuery, onSearchChange, filteredParentsCount, isMobile }) => {
    return (
        <div style={{
            marginBottom: isMobile ? '15px' : '20px',
            padding: isMobile ? '12px' : '15px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder={isMobile ? "Пошук батьків..." : "Пошук батьків за іменем, email, телефоном або іменем дитини..."}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: isMobile ? '10px 40px 10px 12px' : '12px 45px 12px 15px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: isMobile ? '14px' : '14px',
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
                        right: isMobile ? '12px' : '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280',
                        fontSize: isMobile ? '14px' : '16px'
                    }}
                />
            </div>
            {searchQuery && (
                <div style={{
                    fontSize: isMobile ? '13px' : '14px',
                    color: '#6b7280',
                    marginTop: isMobile ? '6px' : '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <FaSearch size={isMobile ? 11 : 12} />
                    Знайдено {filteredParentsCount} батьків за запитом "{searchQuery}"
                </div>
            )}
        </div>
    );
};

export default ParentSearch;