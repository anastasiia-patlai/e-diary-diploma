import React from 'react';
import TeacherItem from './TeacherItem';

const TeachersList = ({ teachers, onEditTeacher, onDeleteTeacher }) => {
    // Сортування викладачів за алфавітом
    const getSortedTeachers = (teachers) => {
        return [...teachers].sort((a, b) => {
            return a.fullName.localeCompare(b.fullName, 'uk');
        });
    };

    const sortedTeachers = getSortedTeachers(teachers);

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderTop: '1px solid #e5e7eb'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedTeachers.map(teacher => (
                    <TeacherItem
                        key={teacher._id}
                        teacher={teacher}
                        onEdit={onEditTeacher}
                        onDelete={onDeleteTeacher}
                    />
                ))}
            </div>
        </div>
    );
};

export default TeachersList;