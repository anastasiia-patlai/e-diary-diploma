import React from 'react';
import { FaUser, FaTimes } from 'react-icons/fa';

const GroupWithCurator = ({ group, onRemoveCurator, isMobile }) => {
    return (
        <div style={{
            border: '2px solid rgba(105, 180, 185, 0.3)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#f9fafb'
        }}>
            <div style={{
                backgroundColor: 'rgba(105, 180, 185, 0.1)',
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
                        color: 'rgba(105, 180, 185, 1)',
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

                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    gap: isMobile ? '12px' : '15px',
                    width: isMobile ? '100%' : 'auto'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '10px' : '12px',
                        backgroundColor: 'rgba(105, 180, 185, 0.2)',
                        padding: isMobile ? '10px' : '10px 15px',
                        borderRadius: '6px',
                        flex: isMobile ? 1 : 'none'
                    }}>
                        <div style={{
                            width: isMobile ? '36px' : '40px',
                            height: isMobile ? '36px' : '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(105, 180, 185, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(105, 180, 185, 1)',
                            flexShrink: 0
                        }}>
                            <FaUser size={isMobile ? 16 : 18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontWeight: '600',
                                fontSize: isMobile ? '14px' : '14px',
                                lineHeight: '1.3',
                                wordBreak: 'break-word'
                            }}>
                                {group.curator.fullName}
                            </div>
                            <div style={{
                                fontSize: isMobile ? '12px' : '13px',
                                color: '#6b7280',
                                wordBreak: 'break-word'
                            }}>
                                {group.curator.position}
                            </div>
                            <div style={{
                                fontSize: isMobile ? '11px' : '12px',
                                color: '#6b7280',
                                wordBreak: 'break-word'
                            }}>
                                {group.curator.email}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => onRemoveCurator(group)}
                        style={{
                            padding: isMobile ? '10px' : '8px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: isMobile ? '14px' : '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            width: isMobile ? '100%' : 'auto'
                        }}
                    >
                        <FaTimes size={isMobile ? 14 : 12} />
                        {isMobile ? 'Видалити куратора' : 'Видалити'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupWithCurator;