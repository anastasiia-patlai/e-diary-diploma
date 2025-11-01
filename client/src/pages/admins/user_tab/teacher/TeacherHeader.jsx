import React from 'react';

const TeacherHeader = ({ onToggleAll, allExpanded }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        }}>
            <h3>Список викладачів за предметами</h3>
            <button
                onClick={onToggleAll}
                style={{
                    backgroundColor: 'rgba(105, 180, 185, 1)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                }}
            >
                {allExpanded ? 'Згорнути всі' : 'Розгорнути всі'}
            </button>
        </div>
    );
};

export default TeacherHeader;