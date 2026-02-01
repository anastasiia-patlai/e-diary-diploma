import React from 'react';
import { Card, Tab, Nav } from 'react-bootstrap';

const DaysOfWeekTabs = ({
    daysOfWeek,
    currentWeekDates,
    showDates,
    activeDayId,
    onDayChange,
    children,
    isMobile = false
}) => {
    return (
        <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
                <Tab.Container activeKey={activeDayId} onSelect={onDayChange}>
                    <Card.Header className="bg-light border-bottom" style={isMobile ? { padding: '0.5rem' } : {}}>
                        <Nav
                            variant={isMobile ? "underline" : "tabs"}
                            className={isMobile ? "border-0" : "border-0"}
                        >
                            {daysOfWeek.map(day => {
                                const weekDate = currentWeekDates[day.order - 1];
                                return (
                                    <Nav.Item key={day._id} style={isMobile ? { flex: '1', minWidth: '0' } : {}}>
                                        <Nav.Link
                                            eventKey={day._id}
                                            className="text-center"
                                            style={isMobile ? {
                                                padding: '0.5rem 0.25rem',
                                                fontSize: '14px',
                                                color: activeDayId === day._id ? '#1f2937' : '#6b7280',
                                                borderBottom: activeDayId === day._id ? '2px solid #1f2937' : '2px solid transparent'
                                            } : {}}
                                        >
                                            <div className="d-flex flex-column">
                                                <span className={isMobile ? '' : 'fw-medium'}>{day.nameShort}</span>
                                                {weekDate && showDates ? (
                                                    <small className="text-muted" style={{ fontSize: isMobile ? '11px' : '' }}>
                                                        {weekDate.short}
                                                    </small>
                                                ) : (
                                                    <small className="text-muted" style={{ visibility: 'hidden', fontSize: isMobile ? '11px' : '' }}>
                                                        00.00
                                                    </small>
                                                )}
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                );
                            })}
                        </Nav>
                    </Card.Header>
                    {children}
                </Tab.Container>
            </Card.Body>
        </Card>
    );
};

export default DaysOfWeekTabs;