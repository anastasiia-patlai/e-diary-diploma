import React from 'react';
import GroupItem from './GroupItem';

const GroupsList = ({ groups, expandedGroups, onToggleGroup, onEditStudent, onDeleteStudent, isMobile }) => {
    if (groups.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: isMobile ? '30px 20px' : '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px dashed #e5e7eb'
            }}>
                <p style={{
                    fontSize: isMobile ? '16px' : '14px',
                    color: '#6b7280',
                    margin: 0
                }}>
                    Групи не знайдені
                </p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '12px' : '15px',
            padding: isMobile ? '0 8px' : '0'
        }}>
            {groups.map(group => (
                <GroupItem
                    key={group._id}
                    group={group}
                    isExpanded={expandedGroups[group._id]}
                    onToggle={onToggleGroup}
                    onEditStudent={onEditStudent}
                    onDeleteStudent={onDeleteStudent}
                    isMobile={isMobile}
                />
            ))}
        </div>
    );
};

export default GroupsList;