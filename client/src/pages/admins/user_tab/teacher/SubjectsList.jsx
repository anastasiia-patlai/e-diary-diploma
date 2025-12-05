import React from 'react';
import SubjectItem from './SubjectItem';

const SubjectsList = ({ subjects, expandedSubjects, onToggleSubject, onEditTeacher, onDeleteTeacher, isMobile }) => {
    if (Object.keys(subjects).length === 0) {
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
                    Викладачі не знайдені
                </p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '12px' : '10px',
            padding: isMobile ? '0 8px' : '0'
        }}>
            {Object.keys(subjects).map(subject => (
                <SubjectItem
                    key={subject}
                    subject={subject}
                    teachers={subjects[subject]}
                    isExpanded={expandedSubjects[subject]}
                    onToggle={onToggleSubject}
                    onEditTeacher={onEditTeacher}
                    onDeleteTeacher={onDeleteTeacher}
                    isMobile={isMobile}
                />
            ))}
        </div>
    );
};

export default SubjectsList;