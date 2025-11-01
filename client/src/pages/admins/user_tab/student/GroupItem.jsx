import React from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import StudentsList from './StudentsList';

const GroupItem = ({ group, isExpanded, onToggle, onEditStudent, onDeleteStudent }) => {
    const getGroupType = (groupName) => {
        const lowerName = groupName.toLowerCase();
        if (lowerName.includes('а') || lowerName.includes('б') || lowerName.includes('в') ||
            lowerName.includes('г') || lowerName.match(/\d+-[абвг]/i)) {
            return 'school';
        }
        return 'university';
    };

    const groupType = getGroupType(group.name);

    return (
        <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden'
        }}>
            <div
                style={{
                    backgroundColor: isExpanded ? 'rgba(105, 180, 185, 0.1)' : '#f9fafb',
                    padding: '15px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.3s ease'
                }}
                onClick={() => onToggle(group._id)}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(105, 180, 185, 0.2)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = isExpanded ? 'rgba(105, 180, 185, 0.1)' : '#f9fafb';
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        fontWeight: '600',
                        fontSize: '16px',
                    }}>
                        {group.name}
                    </span>
                    {group.curator && (
                        <span style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            backgroundColor: 'rgba(105, 180, 185, 0.2)',
                            padding: '2px 8px',
                            borderRadius: '12px'
                        }}>
                            Куратор: {group.curator.fullName}
                        </span>
                    )}
                    <span style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        backgroundColor: '#f3f4f6',
                        padding: '2px 8px',
                        borderRadius: '12px'
                    }}>
                        Студентів: {group.students?.length || 0}
                    </span>
                    <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        backgroundColor: groupType === 'school' ? '#fef2f2' : '#f0fdf4',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        border: `1px solid ${groupType === 'school' ? '#fecaca' : '#bbf7d0'}`
                    }}>
                        {groupType === 'school' ? 'Шкільний клас' : 'Університетська група'}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </div>
            </div>

            {isExpanded && (
                <StudentsList
                    group={group}
                    onEditStudent={onEditStudent}
                    onDeleteStudent={onDeleteStudent}
                />
            )}
        </div>
    );
};

export default GroupItem;