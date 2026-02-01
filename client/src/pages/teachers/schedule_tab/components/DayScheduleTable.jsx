import React from 'react';
import { Table, Alert, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import ScheduleTableRow from './ScheduleTableRow';

const DayScheduleTable = ({
    day,
    timeSlots,
    scheduleData,
    getLessonForTimeSlot,
    formatTime,
    getSubgroupLabel,
    weekDate,
    showDates,
    semesterStatus
}) => {
    const hasLessons = scheduleData.some(lesson =>
        lesson.dayOfWeek?._id === day._id ||
        lesson.dayOfWeek?._id?.toString() === day._id
    );

    if (timeSlots.length === 0) {
        return (
            <Alert variant="info">
                <FaClock className="me-2" />
                Час уроків для цього дня не налаштовано
            </Alert>
        );
    }

    return (
        <div className="table-responsive">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">
                    <FaCalendarAlt className="me-2" />
                    {day.name}
                </h5>
                {weekDate && showDates ? (
                    <Badge bg="light" text="dark" className="fs-6">
                        {weekDate.formatted}
                    </Badge>
                ) : semesterStatus === 'past' ? (
                    <Badge bg="secondary" className="fs-6">
                        <FaClock className="me-1" /> Завершений семестр
                    </Badge>
                ) : semesterStatus === 'future' ? (
                    <Badge bg="info" className="fs-6">
                        <FaCalendarAlt className="me-1" /> Майбутній семестр
                    </Badge>
                ) : null}
            </div>

            <Table striped bordered hover className="align-middle">
                <thead className="table-light">
                    <tr>
                        <th width="80">№</th>
                        <th width="120">Час</th>
                        <th>Предмет</th>
                        <th>Група</th>
                        <th width="150">Аудиторія</th>
                    </tr>
                </thead>
                <tbody>
                    {timeSlots.map((slot) => {
                        const lesson = getLessonForTimeSlot(day._id, slot._id);
                        return (
                            <ScheduleTableRow
                                key={slot._id}
                                slot={slot}
                                lesson={lesson}
                                formatTime={formatTime}
                                getSubgroupLabel={getSubgroupLabel}
                            />
                        );
                    })}
                </tbody>
            </Table>

            {!hasLessons && (
                <Alert variant="secondary" className="mt-3">
                    <FaCalendarAlt className="me-2" />
                    Немає занять на цей день
                </Alert>
            )}
        </div>
    );
};

export default DayScheduleTable;