import React from 'react';
import { FaUser, FaExclamationTriangle } from 'react-icons/fa';

const BusyCuratorsList = ({ busyTeachers, groups, isMobile }) => {
    if (busyTeachers.length === 0) return null;

    return (
        <div>
            <h4 style={{
                marginBottom: isMobile ? '12px' : '16px',
                color: '#6b7280',
                fontSize: isMobile ? '16px' : '18px'
            }}>
                Викладачі вже з групами ({busyTeachers.length})
            </h4>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '12px' : '16px',
                opacity: 0.7
            }}>
                {busyTeachers.map(teacher => {
                    const teacherGroup = groups.find(group =>
                        group.curator && group.curator._id === teacher._id
                    );
                    return (
                        <div
                            key={teacher._id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: isMobile ? '12px' : '16px',
                                padding: isMobile ? '12px' : '16px',
                                backgroundColor: '#f9fafb',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                            }}
                        >
                            <div style={{
                                width: isMobile ? '40px' : '48px',
                                height: isMobile ? '40px' : '48px',
                                borderRadius: '50%',
                                backgroundColor: '#e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6b7280',
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
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: isMobile ? '5px' : '8px',
                                    wordBreak: 'break-word'
                                }}>
                                    <FaExclamationTriangle
                                        size={isMobile ? 12 : 14}
                                        style={{ flexShrink: 0, marginTop: '2px' }}
                                    />
                                    <span>Куратор групи: {teacherGroup?.name || 'Невідомо'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BusyCuratorsList;