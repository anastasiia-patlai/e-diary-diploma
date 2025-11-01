import React from 'react';
import SubjectItem from './SubjectItem';

const SubjectsList = ({ subjects, expandedSubjects, onToggleSubject, onEditTeacher, onDeleteTeacher }) => {
    if (Object.keys(subjects).length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Викладачі не знайдені</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.keys(subjects).map(subject => (
                <SubjectItem
                    key={subject}
                    subject={subject}
                    teachers={subjects[subject]}
                    isExpanded={expandedSubjects[subject]}
                    onToggle={onToggleSubject}
                    onEditTeacher={onEditTeacher}
                    onDeleteTeacher={onDeleteTeacher}
                />
            ))}
        </div>
    );
};

export default SubjectsList;