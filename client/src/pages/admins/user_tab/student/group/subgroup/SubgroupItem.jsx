import React from 'react';
import { FaChevronDown, FaChevronUp, FaUsers } from 'react-icons/fa';
import StudentsList from '../../StudentsList';

const SubgroupItem = ({ subgroup, group, index, isExpanded, onToggle, onEditStudent, onDeleteStudent, isMobile, isClass }) => {
    return (
        <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden'
        }}>
            <div
                style={{
                    backgroundColor: isExpanded ? 'rgba(85, 160, 165, 0.1)' : '#f9fafb',
                    padding: isMobile ? '12px 16px' : '15px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: isMobile ? 'none' : 'background-color 0.3s ease'
                }}
                onClick={onToggle}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '10px' : '12px',
                    flex: 1
                }}>
                    <div style={{
                        width: isMobile ? '32px' : '36px',
                        height: isMobile ? '32px' : '36px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(15, 139, 98, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(105, 180, 185, 1)',
                        fontWeight: '600'
                    }}>
                        {index + 1}
                    </div>
                    <div>
                        <div style={{
                            fontWeight: '600',
                            fontSize: isMobile ? '14px' : '16px',
                            color: '#374151'
                        }}>
                            {subgroup.name}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: isMobile ? '11px' : '12px',
                            color: '#6b7280',
                            marginTop: '2px'
                        }}>
                            <FaUsers size={isMobile ? 10 : 12} />
                            <span>
                                {isClass ? 'Учнів' : 'Студентів'}: {subgroup.students?.length || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    {isExpanded ?
                        <FaChevronUp size={isMobile ? 16 : 18} color="#6b7280" /> :
                        <FaChevronDown size={isMobile ? 16 : 18} color="#6b7280" />
                    }
                </div>
            </div>

            {isExpanded && subgroup.students && subgroup.students.length > 0 && (
                <StudentsList
                    group={{ ...group, students: subgroup.students }}
                    onEditStudent={onEditStudent}
                    onDeleteStudent={onDeleteStudent}
                    isMobile={isMobile}
                    isClass={isClass}
                    showHeader={false}
                />
            )}

            {isExpanded && (!subgroup.students || subgroup.students.length === 0) && (
                <div style={{
                    padding: isMobile ? '20px 16px' : '24px 20px',
                    textAlign: 'center',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb'
                }}>
                    <p style={{ margin: 0, fontSize: isMobile ? '14px' : '15px' }}>
                        Немає студентів у цій підгрупі
                    </p>
                </div>
            )}
        </div>
    );
};

export default SubgroupItem;