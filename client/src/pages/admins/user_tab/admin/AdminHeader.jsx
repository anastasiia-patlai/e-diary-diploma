import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaSort, FaSearch } from "react-icons/fa";

const AdminHeader = ({ adminCount, searchQuery, onSearchChange, sortOrder, onSortToggle, isMobile }) => {
    const { t } = useTranslation();

    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: isMobile ? '15px' : '20px',
            gap: isMobile ? '12px' : '15px',
            width: '100%',
            marginTop: isMobile ? '-10px' : '-20px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '10px' : '15px',
                flexWrap: 'wrap'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: isMobile ? '18px' : '20px',
                    whiteSpace: 'nowrap'
                }}>
                    {t('admin.users.admin.title')}
                </h3>
                <button
                    onClick={onSortToggle}
                    style={{
                        padding: isMobile ? '6px 10px' : '8px 12px',
                        backgroundColor: 'transparent',
                        color: 'rgba(105, 180, 185, 1)',
                        border: '1px solid rgba(105, 180, 185, 1)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: isMobile ? '13px' : '14px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <FaSort size={isMobile ? 12 : 14} />
                    {sortOrder === 'asc' ? t('admin.users.admin.header.sortAZ') : t('admin.users.admin.header.sortZA')}
                </button>
            </div>

            <div style={{
                position: 'relative',
                width: isMobile ? '100%' : '300px'
            }}>
                <FaSearch style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                    fontSize: isMobile ? '14px' : '16px'
                }} />
                <input
                    type="text"
                    placeholder={t('admin.users.admin.header.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: isMobile ? '8px 8px 8px 35px' : '10px 10px 10px 35px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: isMobile ? '14px' : '14px',
                        boxSizing: 'border-box'
                    }}
                />
            </div>
        </div>
    );
};

export default AdminHeader;