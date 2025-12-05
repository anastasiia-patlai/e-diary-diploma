import React from 'react';
import { FaUser, FaPlus, FaTimes } from 'react-icons/fa';
import GroupWithCurator from './GroupWithCurator';
import GroupWithoutCurator from './GroupWithoutCurator';

const CuratorGroupsList = ({
    groupsWithCurators,
    groupsWithoutCurators,
    onAddCurator,
    onRemoveCurator,
    isMobile
}) => {
    return (
        <>
            {/* ГРУПИ З КУРАТОРАМИ */}
            {groupsWithCurators.length > 0 && (
                <div style={{ marginBottom: isMobile ? '24px' : '30px' }}>
                    <h4 style={{
                        marginBottom: isMobile ? '12px' : '15px',
                        color: 'rgba(105, 180, 185, 1)',
                        fontSize: isMobile ? '16px' : '18px'
                    }}>
                        Групи з призначеними кураторами ({groupsWithCurators.length})
                    </h4>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: isMobile ? '12px' : '15px'
                    }}>
                        {groupsWithCurators.map(group => (
                            <GroupWithCurator
                                key={group._id}
                                group={group}
                                onRemoveCurator={onRemoveCurator}
                                isMobile={isMobile}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ГРУПИ БЕЗ КУРАТОРІВ */}
            {groupsWithoutCurators.length > 0 && (
                <div>
                    <h4 style={{
                        marginBottom: isMobile ? '12px' : '15px',
                        color: '#6b7280',
                        fontSize: isMobile ? '16px' : '18px'
                    }}>
                        Групи без кураторів ({groupsWithoutCurators.length})
                    </h4>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: isMobile ? '12px' : '15px'
                    }}>
                        {groupsWithoutCurators.map(group => (
                            <GroupWithoutCurator
                                key={group._id}
                                group={group}
                                onAddCurator={onAddCurator}
                                isMobile={isMobile}
                            />
                        ))}
                    </div>
                </div>
            )}

            {groupsWithCurators.length === 0 && groupsWithoutCurators.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: isMobile ? '30px 15px' : '40px 20px',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <p style={{ fontSize: isMobile ? '16px' : '18px' }}>
                        Групи не знайдені
                    </p>
                </div>
            )}
        </>
    );
};

export default CuratorGroupsList;