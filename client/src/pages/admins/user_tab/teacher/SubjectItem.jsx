import React from 'react';
import { FaChevronDown, FaChevronUp, FaBook } from "react-icons/fa";
import TeachersList from './TeachersList';

const SubjectItem = ({ subject, teachers, isExpanded, onToggle, onEditTeacher, onDeleteTeacher, isMobile }) => {
    return (
        <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: isMobile ? '8px' : '10px'
        }}>
            <div
                style={{
                    backgroundColor: isExpanded ? 'rgba(105, 180, 185, 0.1)' : '#f9fafb',
                    padding: isMobile ? '12px 16px' : '15px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: isMobile ? 'none' : 'background-color 0.3s ease',
                    minHeight: isMobile ? '60px' : 'auto'
                }}
                onClick={() => onToggle(subject)}
                onMouseOver={(e) => {
                    if (!isMobile) {
                        e.currentTarget.style.backgroundColor = 'rgba(105, 180, 185, 0.2)';
                    }
                }}
                onMouseOut={(e) => {
                    if (!isMobile) {
                        e.currentTarget.style.backgroundColor = isExpanded ? 'rgba(105, 180, 185, 0.1)' : '#f9fafb';
                    }
                }}
            >
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? '6px' : '10px',
                    flex: 1,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '8px' : '10px'
                    }}>
                        <FaBook style={{
                            color: 'rgba(105, 180, 185, 1)',
                            fontSize: isMobile ? '16px' : '14px'
                        }} />
                        <span style={{
                            fontWeight: '600',
                            fontSize: isMobile ? '15px' : '16px',
                            wordBreak: 'break-word'
                        }}>
                            {subject}
                        </span>
                    </div>
                    <span style={{
                        fontSize: isMobile ? '12px' : '14px',
                        color: '#6b7280',
                        backgroundColor: '#f3f4f6',
                        padding: isMobile ? '2px 8px' : '2px 8px',
                        borderRadius: '12px',
                        whiteSpace: 'nowrap'
                    }}>
                        Викладачів: {teachers.length}
                    </span>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '6px' : '10px',
                    marginLeft: isMobile ? '8px' : '0',
                    flexShrink: 0
                }}>
                    {isExpanded ?
                        <FaChevronUp size={isMobile ? 16 : 18} /> :
                        <FaChevronDown size={isMobile ? 16 : 18} />
                    }
                </div>
            </div>

            {isExpanded && (
                <TeachersList
                    teachers={teachers}
                    onEditTeacher={onEditTeacher}
                    onDeleteTeacher={onDeleteTeacher}
                    isMobile={isMobile}
                />
            )}
        </div>
    );
};

export default SubjectItem;