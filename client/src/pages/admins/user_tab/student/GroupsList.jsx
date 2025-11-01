import React from 'react';
import GroupItem from './GroupItem';

const GroupsList = ({ groups, expandedGroups, onToggleGroup, onEditStudent, onDeleteStudent }) => {
    if (groups.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Групи не знайдені</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {groups.map(group => (
                <GroupItem
                    key={group._id}
                    group={group}
                    isExpanded={expandedGroups[group._id]}
                    onToggle={onToggleGroup}
                    onEditStudent={onEditStudent}
                    onDeleteStudent={onDeleteStudent}
                />
            ))}
        </div>
    );
};

export default GroupsList;