import React from 'react';
import { Row, Col } from 'react-bootstrap';

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
                marginBottom: '12px'
            }}>
                Поточне заняття:
            </h6>
            <Row>
                <Col md={6}>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{
                            fontSize: '12px',
                            color: '#6b7280'
                        }}>
                            Предмет:
                        </span>
                        <div style={{
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            {schedule.subject}
                        </div>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{
                            fontSize: '12px',
                            color: '#6b7280'
                        }}>
                            Група:
                        </span>
                        <div style={{
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            {schedule.group?.name}
                        </div>
                    </div>
                </Col>
                <Col md={6}>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{
                            fontSize: '12px',
                            color: '#6b7280'
                        }}>
                            День:
                        </span>
                        <div style={{
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            {schedule.dayOfWeek?.name}
                        </div>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{
                            fontSize: '12px',
                            color: '#6b7280'
                        }}>
                            Поточний час:
                        </span>
                        <div style={{
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            {schedule.timeSlot ?
                                formatTimeSlot(schedule.timeSlot)
                                : 'Не вказано'
                            }
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default CurrentScheduleInfo;