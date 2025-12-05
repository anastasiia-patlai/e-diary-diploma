import React from 'react';
import { FaSort } from 'react-icons/fa';

const CuratorStatistics = ({
    groups,
    groupsWithCurators,
    groupsWithoutCurators,
    availableTeachers,
    sortOrder,
    toggleSortOrder,
    isMobile,
    isTablet
}) => {
    return (
        <>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: isMobile ? '16px' : '20px',
                gap: isMobile ? '12px' : '0'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '28px',
                    lineHeight: '1.2'
                }}>
                    Групи з кураторами
                </h3>
                <button
                    onClick={toggleSortOrder}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: isMobile ? '8px 12px' : '8px 16px',
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '13px' : '14px',
                        whiteSpace: 'nowrap',
                        width: isMobile ? '100%' : 'auto'
                    }}
                >
                    <FaSort size={isMobile ? 14 : 16} />
                    {sortOrder === 'asc'
                        ? 'Від молодшої до старшої'
                        : 'Від старшої до молодшої'}
                </button>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: isMobile ? '10px' : '15px',
                marginBottom: isMobile ? '16px' : '20px',
                justifyContent: 'space-between'
            }}>
                {/* БЛОК 1: ВСЬОГО ГРУП */}
                <div style={{
                    padding: isMobile ? '12px' : '12px 16px',
                    backgroundColor: 'rgba(105, 180, 185, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(105, 180, 185, 0.3)',
                    flex: '0 0 calc(50% - 8px)',
                    boxSizing: 'border-box',
                    minWidth: isMobile ? 'calc(50% - 5px)' : 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)'
                }}>
                    <div style={{
                        fontWeight: '600',
                        color: 'rgba(105, 180, 185, 1)',
                        fontSize: isMobile ? '14px' : '15px',
                        marginBottom: '4px'
                    }}>
                        Всього груп
                    </div>
                    <div style={{
                        fontSize: isMobile ? '20px' : '24px',
                        fontWeight: 'bold',
                        color: 'rgba(105, 180, 185, 1)'
                    }}>
                        {groups.length}
                    </div>
                </div>

                {/* БЛОК 2: З КУРАТОРАМИ */}
                <div style={{
                    padding: isMobile ? '12px' : '12px 16px',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    flex: '0 0 calc(50% - 8px)',
                    boxSizing: 'border-box',
                    minWidth: isMobile ? 'calc(50% - 5px)' : 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)'
                }}>
                    <div style={{
                        fontWeight: '600',
                        color: 'rgba(34, 197, 94, 1)',
                        fontSize: isMobile ? '14px' : '15px',
                        marginBottom: '4px'
                    }}>
                        З кураторами
                    </div>
                    <div style={{
                        fontSize: isMobile ? '20px' : '24px',
                        fontWeight: 'bold',
                        color: 'rgba(34, 197, 94, 1)'
                    }}>
                        {groupsWithCurators.length}
                    </div>
                </div>

                {/* БЛОК 3: БЕЗ КУРАТОРІВ */}
                <div style={{
                    padding: isMobile ? '12px' : '12px 16px',
                    backgroundColor: 'rgba(251, 146, 60, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(251, 146, 60, 0.3)',
                    flex: '0 0 calc(50% - 8px)',
                    boxSizing: 'border-box',
                    minWidth: isMobile ? 'calc(50% - 5px)' : 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)'
                }}>
                    <div style={{
                        fontWeight: '600',
                        color: 'rgba(251, 146, 60, 1)',
                        fontSize: isMobile ? '14px' : '15px',
                        marginBottom: '4px'
                    }}>
                        Без кураторів
                    </div>
                    <div style={{
                        fontSize: isMobile ? '20px' : '24px',
                        fontWeight: 'bold',
                        color: 'rgba(251, 146, 60, 1)'
                    }}>
                        {groupsWithoutCurators.length}
                    </div>
                </div>

                {/* БЛОК 4: ВІЛЬНІ ВИКЛАДАЧІ */}
                <div style={{
                    padding: isMobile ? '12px' : '12px 16px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    flex: '0 0 calc(50% - 8px)',
                    boxSizing: 'border-box',
                    minWidth: isMobile ? 'calc(50% - 5px)' : 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)'
                }}>
                    <div style={{
                        fontWeight: '600',
                        color: 'rgba(59, 130, 246, 1)',
                        fontSize: isMobile ? '14px' : '15px',
                        marginBottom: '4px'
                    }}>
                        Вільних викладачів
                    </div>
                    <div style={{
                        fontSize: isMobile ? '20px' : '24px',
                        fontWeight: 'bold',
                        color: 'rgba(59, 130, 246, 1)'
                    }}>
                        {availableTeachers.length}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CuratorStatistics;