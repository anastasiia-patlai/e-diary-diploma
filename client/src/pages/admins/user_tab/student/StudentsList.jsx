import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa';
import StudentItem from './StudentItem';

const StudentsList = ({ group, onEditStudent, onDeleteStudent }) => {
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' або 'desc'

    // Функція для сортування студентів за алфавітом
    const getSortedStudents = (students) => {
        if (!students) return [];

        return [...students].sort((a, b) => {
            const compareResult = a.fullName.localeCompare(b.fullName, 'uk');
            return sortOrder === 'asc' ? compareResult : -compareResult;
        });
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const sortedStudents = getSortedStudents(group.students);

    if (sortedStudents.length === 0) {
        return (
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center',
                color: '#6b7280'
            }}>
                <p>У цій групі ще немає студентів</p>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderTop: '1px solid #e5e7eb'
        }}>
            {/* Заголовок з кнопкою сортування */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Студентів: {sortedStudents.length}
                </div>
                <button
                    onClick={toggleSortOrder}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                        color: 'rgba(105, 180, 185, 1)',
                        border: '1px solid rgba(105, 180, 185, 0.3)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(105, 180, 185, 0.2)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                    }}
                >
                    {sortOrder === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
                    {sortOrder === 'asc' ? 'А-Я' : 'Я-А'}
                </button>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {sortedStudents.map(student => (
                    <StudentItem
                        key={student._id}
                        student={student}
                        onEdit={onEditStudent}
                        onDelete={onDeleteStudent}
                    />
                ))}
            </div>
        </div>
    );
};

export default StudentsList;