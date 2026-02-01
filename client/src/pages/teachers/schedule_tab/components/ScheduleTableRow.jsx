import React from 'react';
import { Badge } from 'react-bootstrap';
import { FaClock, FaBook, FaUserFriends, FaDoorOpen } from 'react-icons/fa';

const ScheduleTableRow = ({
    slot,
    lesson,
    formatTime,
    getSubgroupLabel
}) => {
    return (
        <tr className={lesson ? 'table-row-hover' : ''}>
            <td className="text-center fw-bold" width="5%">
                {slot.order}
            </td>
            <td className="text-nowrap" width="15%">
                <div className="d-flex align-items-center">
                    <FaClock className="me-2 text-primary" />
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </div>
            </td>
            <td width="30%">
                {lesson ? (
                    <div className="d-flex align-items-center">
                        <FaBook className="me-2 text-success" />
                        <span className="fw-semibold">{lesson.subject}</span>
                    </div>
                ) : (
                    <span className="text-muted">—</span>
                )}
            </td>
            <td width="15%"> {/* Зменшена ширина стовпця Група */}
                {lesson ? (
                    <div>
                        <div className="d-flex align-items-center">
                            <FaUserFriends className="me-2 text-secondary" />
                            <span className="fw-medium">{lesson.group?.name}</span>
                        </div>
                        {lesson.subgroup && lesson.subgroup !== 'all' && (
                            <Badge bg="info" className="ms-2 mt-1">
                                {getSubgroupLabel(lesson.subgroup)}
                            </Badge>
                        )}
                    </div>
                ) : (
                    <span className="text-muted">—</span>
                )}
            </td>
            <td width="35%"> {/* Збільшена ширина стовпця Аудиторія */}
                {lesson?.classroom ? (
                    <div className="d-flex align-items-center">
                        <FaDoorOpen className="me-2 text-warning" />
                        <div>
                            <div className="fw-medium">{lesson.classroom.name}</div>
                            {lesson.classroom.type && (
                                <small className="text-muted">({lesson.classroom.type})</small>
                            )}
                        </div>
                    </div>
                ) : (
                    <span className="text-muted">—</span>
                )}
            </td>
        </tr>
    );
};

export default ScheduleTableRow;