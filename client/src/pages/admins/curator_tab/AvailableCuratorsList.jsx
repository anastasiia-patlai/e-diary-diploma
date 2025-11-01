import React from 'react';
import { FaUser } from 'react-icons/fa';

const AvailableCuratorsList = ({ availableTeachers, onSelectCurator }) => {
    if (availableTeachers.length === 0) return null;

    return (
        <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '10px', color: 'rgba(34, 197, 94, 1)' }}>
                Вільні викладачі ({availableTeachers.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {availableTeachers.map(teacher => (
                    <div
                        key={teacher._id}
                        onClick={() => onSelectCurator(teacher._id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 15px',
                            backgroundColor: 'rgba(34, 197, 94, 0.05)',
                            borderRadius: '6px',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.05)';
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(34, 197, 94, 1)'
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
                                color: '#6b7280'
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