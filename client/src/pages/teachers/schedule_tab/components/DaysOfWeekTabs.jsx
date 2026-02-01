import React from 'react';
import { Card, Tab, Nav, Badge } from 'react-bootstrap';

const DaysOfWeekTabs = ({
    daysOfWeek,
    currentWeekDates,
    showDates,
    activeDayId,
    onDayChange,
    children
}) => {
    return (
        <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
                <Tab.Container
                    activeKey={activeDayId || daysOfWeek[0]?._id}
                    onSelect={onDayChange}
                >
                    <Card.Header className="bg-light border-bottom">
                        <Nav variant="tabs" className="border-0">
                            {daysOfWeek.map(day => {
                                const weekDate = currentWeekDates[day.order - 1];
                                return (
                                    <Nav.Item key={day._id}>
                                        <Nav.Link eventKey={day._id} className="text-center">
                                            <div className="d-flex flex-column">
                                                <span className="fw-medium">{day.nameShort}</span>
                                                {weekDate && showDates ? (
                                                    <small className="text-muted">{weekDate.short}</small>
                                                ) : (
                                                    <small className="text-muted" style={{ visibility: 'hidden' }}>00.00</small>
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