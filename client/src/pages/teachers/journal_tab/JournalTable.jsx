import React from 'react';

const JournalTable = ({
    students,
    dates,
    getGradeForStudentAndDate,
    onCellClick,
    isMobile
}) => {
    if (students.length === 0) {
        return (
            <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280'
            }}>
                Немає учнів для відображення
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '70vh'
        }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: dates.length > 0 ? `${dates.length * 100 + 200}px` : 'auto'
            }}>
                <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th style={{
                            padding: '12px',
                            textAlign: 'left',
                            borderBottom: '2px solid #e5e7eb',
                            position: 'sticky',
                            top: 0,
                            left: 0,
                            backgroundColor: '#f9fafb',
                            zIndex: 2,
                            minWidth: '200px',
                            boxShadow: '2px 0 0 #e5e7eb'
                        }}>
                            Учень
                        </th>
                        {dates.map((date, index) => (
                            <th key={index} style={{
                                padding: '12px',
                                textAlign: 'center',
                                borderBottom: '2px solid #e5e7eb',
                                borderLeft: '1px solid #e5e7eb',
                                position: 'sticky',
                                top: 0,
                                backgroundColor: date.isHoliday ? '#fff3f0' : '#f9fafb',
                                zIndex: 1,
                                minWidth: '100px',
                                color: date.isHoliday ? '#ef4444' : 'inherit'
                            }}>
                                <div>{date.formatted}</div>
                                <div style={{ fontSize: '11px', color: date.isHoliday ? '#ef4444' : '#6b7280' }}>
                                    {date.dayOfWeek}
                                </div>
                                {date.isHoliday && (
                                    <div style={{
                                        fontSize: '10px',
                                        color: '#ef4444',
                                        fontWeight: '600',
                                        marginTop: '2px'
                                    }}>
                                        Канікули
                                    </div>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {students.map((student, rowIndex) => (
                        <tr key={student._id}>
                            <td style={{
                                padding: '10px 12px',
                                borderBottom: '1px solid #e5e7eb',
                                position: 'sticky',
                                left: 0,
                                backgroundColor: 'white',
                                fontWeight: '500',
                                boxShadow: '2px 0 0 #e5e7eb',
                                zIndex: 1
                            }}>
                                {student.fullName}
                            </td>
                            {dates.map((date, colIndex) => {
                                const grade = getGradeForStudentAndDate(student._id, date);

                                // Якщо це канікули - відображаємо неактивну клітинку
                                if (date.isHoliday) {
                                    return (
                                        <td
                                            key={`${rowIndex}-${colIndex}`}
                                            style={{
                                                padding: '8px',
                                                textAlign: 'center',
                                                borderBottom: '1px solid #e5e7eb',
                                                borderLeft: '1px solid #e5e7eb',
                                                backgroundColor: '#fff3f0',
                                                color: '#d1d5db',
                                                cursor: 'not-allowed'
                                            }}
                                        >
                                            <span style={{ color: '#ef4444', fontSize: '12px' }}>✕</span>
                                        </td>
                                    );
                                }

                                // Звичайна клітинка
                                return (
                                    <td
                                        key={`${rowIndex}-${colIndex}`}
                                        onClick={() => onCellClick(student._id, date)}
                                        style={{
                                            padding: '8px',
                                            textAlign: 'center',
                                            borderBottom: '1px solid #e5e7eb',
                                            borderLeft: '1px solid #e5e7eb',
                                            cursor: 'pointer',
                                            backgroundColor: grade ? '#f0f9ff' : 'white',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            if (!grade) e.currentTarget.style.backgroundColor = '#f3f4f6';
                                        }}
                                        onMouseOut={(e) => {
                                            if (!grade) e.currentTarget.style.backgroundColor = 'white';
                                        }}
                                    >
                                        {grade ? (
                                            <span style={{
                                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                                color: 'white',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '14px'
                                            }}>
                                                {grade}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#d1d5db' }}>—</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default JournalTable;