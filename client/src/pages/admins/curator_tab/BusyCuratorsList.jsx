import React from 'react';
import { FaUser, FaExclamationTriangle } from 'react-icons/fa';

const BusyCuratorsList = ({ busyTeachers, groups }) => {
    if (busyTeachers.length === 0) return null;

    return (
        <div>
            <h4 style={{ marginBottom: '10px', color: '#6b7280' }}>
                Викладачі вже з групами ({busyTeachers.length})
            </h4>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                opacity: 0.6
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
                                gap: '12px',
                                padding: '12px 15px',
                                backgroundColor: '#f9fafb',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6b7280'
                            }}>
                                <FaUser />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                    {teacher.fullName}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    marginBottom: '2px'
                                }}>
                                    {teacher.position}
                                </div>
                                <div style={{
                                    fontSize: '13px',
                                    color: '#6b7280',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    <FaExclamationTriangle size={12} />
                                    Куратор групи: {teacherGroup?.name || 'Невідомо'}
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