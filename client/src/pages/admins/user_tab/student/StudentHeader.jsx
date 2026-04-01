import React from 'react';
import { useTranslation } from 'react-i18next';

const StudentHeader = ({ onToggleAll, allExpanded, isMobile }) => {
    const { t } = useTranslation();

    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            marginBottom: isMobile ? '16px' : '20px',
            gap: isMobile ? '12px' : '0'
        }}>
            <h3 style={{
                margin: 0,
                fontSize: isMobile ? '18px' : '20px',
                textAlign: isMobile ? 'center' : 'left'
            }}>
                {t('admin.users.student.title')}
            </h3>
            <button
                onClick={onToggleAll}
                style={{
                    backgroundColor: 'rgba(105, 180, 185, 1)',
                    color: 'white',
                    padding: isMobile ? '12px 20px' : '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: isMobile ? '14px' : '12px',
                    width: isMobile ? '100%' : 'auto',
                    minHeight: isMobile ? '44px' : 'auto'
                }}
            >
                {allExpanded ? t('admin.users.student.collapseAll') : t('admin.users.student.expandAll')}
            </button>
        </div>
    );
};

export default StudentHeader;