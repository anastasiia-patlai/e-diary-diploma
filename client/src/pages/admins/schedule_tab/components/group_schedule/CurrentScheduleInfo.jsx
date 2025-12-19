import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { FaChalkboardTeacher, FaUsers, FaCalendarDay, FaClock, FaBook, FaDoorOpen } from 'react-icons/fa';

const CurrentScheduleInfo = ({ schedule, formatTimeSlot }) => {
    return (
        <div style={{
            backgroundColor: '#f0f9ff',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #e5e7eb'
        }}>
            <h6 style={{
                fontWeight: '600',
                color: '#374151',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px'
            }}>
                <FaBook size={16} />
                Поточне заняття:
            </h6>

            {/* ПЕРШИЙ РЯД - предмет та група з роздільною лінією */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '10px',
                paddingBottom: '10px',
                borderBottom: '2px solid rgba(105, 180, 185, 0.3)'
            }}>
                <Row className="g-4">
                    {/* ЛІВИЙ СТОВПЧИК - Предмет */}
                    <Col xs={6}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px'
                        }}>
                            <div style={{
                                color: 'rgba(105, 180, 185, 1)',
                                flexShrink: 0,
                                marginTop: '2px'
                            }}>
                                <FaBook size={16} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#6b7280',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '6px'
                                }}>
                                    Предмет
                                </div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#374151',
                                    fontSize: '16px',
                                    lineHeight: '1.4'
                                }}>
                                    {schedule.subject || 'Не вказано'}
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* ПРАВИЙ СТОВПЧИК - Група */}
                    <Col xs={6}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px'
                        }}>
                            <div style={{
                                color: 'rgba(105, 180, 185, 1)',
                                flexShrink: 0,
                                marginTop: '2px'
                            }}>
                                <FaUsers size={16} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#6b7280',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '6px'
                                }}>
                                    Група
                                </div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#374151',
                                    fontSize: '16px',
                                    lineHeight: '1.4',
                                    marginBottom: '2px'
                                }}>
                                    {schedule.group?.name || 'Не вказано'}
                                </div>
                                {schedule.group?.gradeLevel && (
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#6b7280',
                                        fontWeight: '500'
                                    }}>
                                        Клас: {schedule.group.gradeLevel}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* ДРУГИЙ РЯД - інша інформація */}
            <Row className="g-4">
                {/* ЛІВИЙ СТОВПЧИК */}
                <Col xs={6}>
                    {/* Викладач */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        marginBottom: '16px'
                    }}>
                        <div style={{
                            color: 'rgba(105, 180, 185, 1)',
                            flexShrink: 0,
                            marginTop: '2px'
                        }}>
                            <FaChalkboardTeacher size={14} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '11px',
                                color: '#6b7280',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '4px'
                            }}>
                                Викладач
                            </div>
                            <div style={{
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: '14px',
                                lineHeight: '1.4'
                            }}>
                                {schedule.teacher?.fullName || 'Не вказано'}
                            </div>
                        </div>
                    </div>

                    {/* День тижня */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                    }}>
                        <div style={{
                            color: 'rgba(105, 180, 185, 1)',
                            flexShrink: 0,
                            marginTop: '2px'
                        }}>
                            <FaCalendarDay size={14} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '11px',
                                color: '#6b7280',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '4px'
                            }}>
                                День
                            </div>
                            <div style={{
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: '14px',
                                lineHeight: '1.4'
                            }}>
                                {schedule.dayOfWeek?.name || 'Не вказано'}
                            </div>
                        </div>
                    </div>
                </Col>

                {/* ПРАВИЙ СТОВПЧИК */}
                <Col xs={6}>
                    {/* Час заняття */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        marginBottom: '16px'
                    }}>
                        <div style={{
                            color: 'rgba(105, 180, 185, 1)',
                            flexShrink: 0,
                            marginTop: '2px'
                        }}>
                            <FaClock size={14} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '11px',
                                color: '#6b7280',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '4px'
                            }}>
                                Час
                            </div>
                            <div style={{
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: '14px',
                                lineHeight: '1.4'
                            }}>
                                {schedule.timeSlot ? formatTimeSlot(schedule.timeSlot) : 'Не вказано'}
                            </div>
                        </div>
                    </div>

                    {/* Аудиторія */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                    }}>
                        <div style={{
                            color: 'rgba(105, 180, 185, 1)',
                            flexShrink: 0,
                            marginTop: '2px'
                        }}>
                            <FaDoorOpen size={14} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '11px',
                                color: '#6b7280',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '4px'
                            }}>
                                Аудиторія
                            </div>
                            <div style={{
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: '14px',
                                lineHeight: '1.4',
                                marginBottom: '2px'
                            }}>
                                {schedule.classroom?.name || 'Не вказано'}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px'
                            }}>
                                {schedule.classroom?.building && (
                                    <span>Корпус: {schedule.classroom.building}</span>
                                )}
                                {schedule.classroom?.capacity && (
                                    <span>{schedule.classroom.capacity} місць</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default CurrentScheduleInfo;