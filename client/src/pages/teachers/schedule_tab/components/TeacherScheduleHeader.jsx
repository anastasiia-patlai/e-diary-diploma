import React from 'react';
import { Form } from 'react-bootstrap';
import { FaCalendarCheck, FaFilter } from 'react-icons/fa';

const TeacherScheduleHeader = ({
    teacherName,
    semesters,
    selectedSemester,
    scheduleData,
    onSemesterChange,
    checkSemesterStatus,
    isMobile = false
}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: isMobile ? '16px' : '24px',
            gap: isMobile ? '16px' : '0'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '10px' : '14px',
                flex: 1
            }}>
                <div>
                    <h3 style={{
                        margin: 0,
                        fontSize: '26px',
                        fontWeight: '500',
                        color: '#1f2937'
                    }}>
                        Розклад занять
                    </h3>
                    <p style={{
                        margin: isMobile ? '2px 0 0 0' : '4px 0 0 0',
                        color: '#6b7280',
                        fontSize: isMobile ? '12px' : '14px'
                    }}>
                        {teacherName}
                    </p>
                </div>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '12px' : '16px',
                width: isMobile ? '100%' : 'auto'
            }}>
                <div style={{
                    width: isMobile ? '100%' : 'auto'
                }}>
                    <small style={{
                        display: 'block',
                        marginBottom: '6px',
                        color: '#6b7280',
                        fontSize: isMobile ? '12px' : '14px'
                    }}>
                        Семестр
                    </small>
                    <Form.Select
                        value={selectedSemester || ''}
                        onChange={onSemesterChange}
                        style={{
                            width: isMobile ? '100%' : '280px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white',
                            fontSize: isMobile ? '14px' : '14px',
                            color: '#374151'
                        }}
                    >
                        <option value="">Оберіть семестр</option>
                        {semesters.map(semester => {
                            const status = checkSemesterStatus(semester);
                            return (
                                <option key={semester._id} value={semester._id}>
                                    {semester.name} {semester.year}
                                    {status === 'active' && ' (активний)'}
                                    {status === 'past' && ' (завершений)'}
                                    {status === 'future' && ' (майбутній)'}
                                </option>
                            );
                        })}
                    </Form.Select>
                </div>

                <div style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: isMobile ? '14px' : '14px',
                    fontWeight: '600',
                    height: '42px',
                    minWidth: isMobile ? 'auto' : '140px'
                }}>
                    <FaFilter size={isMobile ? 14 : 16} color="#6b7280" />
                    {scheduleData.length} заняття
                </div>
            </div>
        </div>
    );
};

export default TeacherScheduleHeader;