import React from 'react';
import { FaChevronDown, FaChevronUp, FaBook } from "react-icons/fa";
import TeachersList from './TeachersList';

const SubjectItem = ({ subject, teachers, isExpanded, onToggle, onEditTeacher, onDeleteTeacher }) => {
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
                onClick={() => onToggle(subject)}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(105, 180, 185, 0.2)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = isExpanded ? 'rgba(105, 180, 185, 0.1)' : '#f9fafb';
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaBook style={{ color: 'rgba(105, 180, 185, 1)' }} />
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>
                        {subject}
                    </span>
                    <span style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        backgroundColor: '#f3f4f6',
                        padding: '2px 8px',
                        borderRadius: '12px'
                    }}>
                        Викладачів: {teachers.length}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </div>
            </div>

            {isExpanded && (
                <TeachersList
                    teachers={teachers}
                    onEditTeacher={onEditTeacher}
                    onDeleteTeacher={onDeleteTeacher}
                />
            )}
        </div>
    );
};

export default SubjectItem;