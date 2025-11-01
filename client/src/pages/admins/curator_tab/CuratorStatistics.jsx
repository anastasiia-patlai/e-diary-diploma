import React from 'react';
import { FaSort } from 'react-icons/fa';

const CuratorStatistics = ({
    groups,
    groupsWithCurators,
    groupsWithoutCurators,
    availableTeachers,
    sortOrder,
    toggleSortOrder
}) => {
    return (
        <>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: 0 }}>Групи з кураторами</h3>
                <button
                    onClick={toggleSortOrder}
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
                    <FaSort />
                    {sortOrder === 'asc' ? 'Від молодшої до старшої' : 'Від старшої до молодшої'}
                </button>
            </div>

            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(105, 180, 185, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(105, 180, 185, 0.3)'
                }}>
                    <div style={{ fontWeight: '600', color: 'rgba(105, 180, 185, 1)' }}>Всього груп</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{groups.length}</div>
                </div>
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                    <div style={{ fontWeight: '600', color: 'rgba(34, 197, 94, 1)' }}>З кураторами</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{groupsWithCurators.length}</div>
                </div>
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(251, 146, 60, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(251, 146, 60, 0.3)'
                }}>
                    <div style={{ fontWeight: '600', color: 'rgba(251, 146, 60, 1)' }}>Без кураторів</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{groupsWithoutCurators.length}</div>
                </div>
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                    <div style={{ fontWeight: '600', color: 'rgba(59, 130, 246, 1)' }}>Вільних викладачів</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{availableTeachers.length}</div>
                </div>
            </div>
        </>
    );
};

export default CuratorStatistics;