import React from 'react';

const StudentHeader = ({ onToggleAll, allExpanded, isMobile }) => {
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
                fontSize: '24px',
                textAlign: isMobile ? 'center' : 'left'
            }}>
                Список студентів за групами
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
                {allExpanded ? 'Згорнути всі' : 'Розгорнути всі'}
            </button>
        </div>
    );
};

export default StudentHeader;