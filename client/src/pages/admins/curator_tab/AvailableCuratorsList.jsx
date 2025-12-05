import React from 'react';
import { FaUser } from 'react-icons/fa';

const AvailableCuratorsList = ({ availableTeachers, onSelectCurator, isMobile }) => {
    if (availableTeachers.length === 0) return null;

    return (
        <div style={{ marginBottom: isMobile ? '20px' : '24px' }}>
            <h4 style={{
                marginBottom: isMobile ? '12px' : '16px',
                color: 'rgba(34, 197, 94, 1)',
                fontSize: isMobile ? '16px' : '18px'
            }}>
                Вільні викладачі ({availableTeachers.length})
            </h4>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '12px' : '16px'
            }}>
                {availableTeachers.map(teacher => (
                    <div
                        key={teacher._id}
                        onClick={() => onSelectCurator(teacher._id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '12px' : '16px',
                            padding: isMobile ? '12px' : '16px',
                            backgroundColor: 'rgba(34, 197, 94, 0.05)',
                            borderRadius: '8px',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{
                            width: isMobile ? '40px' : '48px',
                            height: isMobile ? '40px' : '48px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(34, 197, 94, 1)',
                            flexShrink: 0
                        }}>
                            <FaUser size={isMobile ? 18 : 20} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontWeight: '600',
                                marginBottom: isMobile ? '4px' : '6px',
                                fontSize: isMobile ? '15px' : '16px',
                                lineHeight: '1.3',
                                wordBreak: 'break-word'
                            }}>
                                {teacher.fullName}
                            </div>
                            <div style={{
                                fontSize: isMobile ? '13px' : '14px',
                                color: '#6b7280',
                                marginBottom: isMobile ? '2px' : '4px',
                                wordBreak: 'break-word'
                            }}>
                                {teacher.position}
                            </div>
                            <div style={{
                                fontSize: isMobile ? '12px' : '13px',
                                color: '#6b7280',
                                wordBreak: 'break-word'
                            }}>
                                {teacher.email}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AvailableCuratorsList;