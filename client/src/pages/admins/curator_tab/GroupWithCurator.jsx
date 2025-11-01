import React from 'react';
import { FaUser, FaTimes } from 'react-icons/fa';

const GroupWithCurator = ({ group, onRemoveCurator }) => {
    return (
        <div style={{
            border: '2px solid rgba(105, 180, 185, 0.3)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#f9fafb'
        }}>
            <div style={{
                backgroundColor: 'rgba(105, 180, 185, 0.1)',
                padding: '15px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '18px', color: 'rgba(105, 180, 185, 1)' }}>
                        {group.name}
                    </h4>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                        Студентів: {group.students?.length || 0}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backgroundColor: 'rgba(105, 180, 185, 0.2)',
                        padding: '10px 15px',
                        borderRadius: '6px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(105, 180, 185, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(105, 180, 185, 1)'
                        }}>
                            <FaUser />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                {group.curator.fullName}
                            </div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                {group.curator.position}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {group.curator.email}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => onRemoveCurator(group)}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <FaTimes />
                        Видалити
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupWithCurator;