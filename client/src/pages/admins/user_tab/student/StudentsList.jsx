import React, { useState } from 'react';
import { FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa';
import StudentItem from './StudentItem';

const StudentsList = ({ group, onEditStudent, onDeleteStudent, isMobile, isClass }) => {
    const [sortOrder, setSortOrder] = useState('asc');

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
                padding: isMobile ? '24px 16px' : '20px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center',
                color: '#6b7280'
            }}>
                <p style={{
                    fontSize: isMobile ? '15px' : '14px',
                    margin: 0
                }}>
                    {isClass ? 'У цьому класі ще немає учнів' : 'У цій групі ще немає студентів'}
                </p>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: 'white',
            padding: isMobile ? '16px 12px' : '20px',
            borderTop: '1px solid #e5e7eb'
        }}>
            {/* Заголовок з кнопкою сортування */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                marginBottom: isMobile ? '16px' : '15px',
                paddingBottom: isMobile ? '12px' : '10px',
                borderBottom: '1px solid #e5e7eb',
                gap: isMobile ? '12px' : '0'
            }}>
                <div style={{
                    fontSize: isMobile ? '14px' : '12px',
                    color: '#6b7280',
                    textAlign: isMobile ? 'center' : 'left'
                }}>
                    {isClass ? 'Учнів' : 'Студентів'}: {sortedStudents.length}
                </div>
                <button
                    onClick={toggleSortOrder}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: isMobile ? '12px' : '6px 12px',
                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                        color: 'rgba(105, 180, 185, 1)',
                        border: '1px solid rgba(105, 180, 185, 0.3)',
                        borderRadius: isMobile ? '8px' : '6px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '14px' : '12px',
                        transition: isMobile ? 'none' : 'all 0.2s',
                        width: isMobile ? '100%' : 'auto',
                        minHeight: isMobile ? '44px' : 'auto'
                    }}
                    onMouseOver={(e) => {
                        if (!isMobile) {
                            e.currentTarget.style.backgroundColor = 'rgba(105, 180, 185, 0.2)';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!isMobile) {
                            e.currentTarget.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                        }
                    }}
                >
                    {sortOrder === 'asc' ?
                        <FaSortAlphaDown size={isMobile ? 16 : 14} /> :
                        <FaSortAlphaUp size={isMobile ? 16 : 14} />
                    }
                    {sortOrder === 'asc' ? 'Сортувати А-Я' : 'Сортувати Я-А'}
                </button>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '16px' : '12px'
            }}>
                {sortedStudents.map(student => (
                    <StudentItem
                        key={student._id}
                        student={student}
                        onEdit={onEditStudent}
                        onDelete={onDeleteStudent}
                        isMobile={isMobile}
                        isClass={isClass}
                    />
                ))}
            </div>
        </div>
    );
};

export default StudentsList;