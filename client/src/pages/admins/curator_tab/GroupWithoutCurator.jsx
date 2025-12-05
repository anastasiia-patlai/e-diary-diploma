import React from 'react';
import { FaPlus } from 'react-icons/fa';

const GroupWithoutCurator = ({ group, onAddCurator, isMobile }) => {
    return (
        <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white'
        }}>
            <div style={{
                padding: isMobile ? '12px 15px' : '15px 20px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '12px' : '0'
            }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{
                        margin: 0,
                        fontSize: isMobile ? '16px' : '18px',
                        lineHeight: '1.3'
                    }}>
                        {group.name}
                    </h4>
                    <div style={{
                        fontSize: isMobile ? '13px' : '14px',
                        color: '#6b7280',
                        marginTop: '5px'
                    }}>
                        Студентів: {group.students?.length || 0}
                    </div>
                </div>

                <button
                    onClick={() => onAddCurator(group)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: isMobile ? '10px 16px' : '8px 16px',
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '14px' : '14px',
                        width: isMobile ? '100%' : 'auto',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <FaPlus size={isMobile ? 14 : 16} />
                    Призначити куратора
                </button>
            </div>
        </div>
    );
};

export default GroupWithoutCurator;