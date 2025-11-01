import React from 'react';
import { FaPlus } from 'react-icons/fa';

const GroupWithoutCurator = ({ group, onAddCurator }) => {
    return (
        <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white'
        }}>
            <div style={{
                padding: '15px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: '18px' }}>{group.name}</h4>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                        Студентів: {group.students?.length || 0}
                    </div>
                </div>

                <button
                    onClick={() => onAddCurator(group)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    <FaPlus />
                    Призначити куратора
                </button>
            </div>
        </div>
    );
};

export default GroupWithoutCurator;