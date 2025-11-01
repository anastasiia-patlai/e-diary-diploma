import React from 'react';
import { FaUser, FaPlus, FaTimes } from 'react-icons/fa';
import GroupWithCurator from './GroupWithCurator';
import GroupWithoutCurator from './GroupWithoutCurator';

const CuratorGroupsList = ({
    groupsWithCurators,
    groupsWithoutCurators,
    onAddCurator,
    onRemoveCurator
}) => {
    return (
        <>
            {/* ГРУПИ З КУРАТОРАМИ */}
            {groupsWithCurators.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ marginBottom: '15px', color: 'rgba(105, 180, 185, 1)' }}>
                        Групи з призначеними кураторами ({groupsWithCurators.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {groupsWithCurators.map(group => (
                            <GroupWithCurator
                                key={group._id}
                                group={group}
                                onRemoveCurator={onRemoveCurator}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ГРУПИ БЕЗ КУРАТОРІВ */}
            {groupsWithoutCurators.length > 0 && (
                <div>
                    <h4 style={{ marginBottom: '15px', color: '#6b7280' }}>
                        Групи без кураторів ({groupsWithoutCurators.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {groupsWithoutCurators.map(group => (
                            <GroupWithoutCurator
                                key={group._id}
                                group={group}
                                onAddCurator={onAddCurator}
                            />
                        ))}
                    </div>
                </div>
            )}

            {groupsWithCurators.length === 0 && groupsWithoutCurators.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>Групи не знайдені</p>
                </div>
            )}
        </>
    );
};

export default CuratorGroupsList;