import React from "react";
import { FaSearch, FaSortAlphaDown, FaSortAlphaDownAlt } from "react-icons/fa";

const SearchPanel = ({
    searchTerm,
    setSearchTerm,
    sortOrder,
    toggleSortOrder,
    filteredStudentsCount,
    isMobile
}) => {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '16px',
                marginBottom: '20px'
            }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <FaSearch style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af'
                    }} />
                    <input
                        type="text"
                        placeholder="Пошук учня за ПІБ, телефоном"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 48px',
                            fontSize: isMobile ? '14px' : '16px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(105, 180, 185, 1)'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>

                <div style={{ minWidth: isMobile ? '100%' : 'auto' }}>
                    <button
                        onClick={toggleSortOrder}
                        style={{
                            width: isMobile ? '100%' : 'auto',
                            padding: '12px 20px',
                            backgroundColor: 'rgba(105, 180, 185, 0.1)',
                            color: 'rgba(105, 180, 185, 1)',
                            border: '1px solid rgba(105, 180, 185, 0.2)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                        }}
                    >
                        {sortOrder === "asc" ? (
                            <>
                                <FaSortAlphaDown size={18} />
                                За ПІБ (А-Я)
                            </>
                        ) : (
                            <>
                                <FaSortAlphaDownAlt size={18} />
                                За ПІБ (Я-А)
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid #f3f4f6'
            }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Знайдено: <strong style={{ color: '#1f2937' }}>{filteredStudentsCount}</strong> учнів
                    {sortOrder === "asc" ? " (сортовано А-Я)" : " (сортовано Я-А)"}
                </div>
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    >
                        Очистити пошук
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchPanel;