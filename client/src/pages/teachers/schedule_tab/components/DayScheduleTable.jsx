import React from 'react';
import { Table, Alert, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaBook, FaUserFriends, FaDoorOpen } from 'react-icons/fa';

const DayScheduleTable = ({
    day,
    timeSlots,
    scheduleData,
    getLessonForTimeSlot,
    formatTime,
    getSubgroupLabel,
    weekDate,
    showDates,
    semesterStatus,
    isMobile = false
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
        <div>
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
                    <Badge bg="secondary" className={isMobile ? "fs-7 py-1 px-2" : "fs-6 py-2 px-3"}>
                        <FaClock className="me-1" /> Завершений семестр
                    </Badge>
                ) : semesterStatus === 'future' ? (
                    <Badge bg="info" className="fs-6">
                        <FaCalendarAlt className="me-1" /> Майбутній семестр
                    </Badge>
                ) : null}
            </div>

            {isMobile ? (
                <div className="d-flex flex-column gap-3">
                    {timeSlots.map((slot) => {
                        const lesson = getLessonForTimeSlot(day._id, slot._id);
                        return (
                            <div key={slot._id} className={`card ${lesson ? 'border-primary' : ''}`}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="me-2" style={{
                                                backgroundColor: '#e9ecef',
                                                color: '#495057',
                                                borderRadius: '4px',
                                                padding: '2px 8px',
                                                fontWeight: '600',
                                                fontSize: '0.9rem'
                                            }}>
                                                {slot.order}
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <FaClock className="me-2 text-primary" />
                                                <span className="small">
                                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                </span>
                                            </div>
                                        </div>
                                        {lesson && lesson.subgroup && lesson.subgroup !== 'all' && (
                                            <Badge bg="info">{getSubgroupLabel(lesson.subgroup)}</Badge>
                                        )}
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-12">
                                            <div className="d-flex align-items-start">
                                                <FaBook className="me-2 text-success mt-1" />
                                                <div>
                                                    <div className="text-muted small">Предмет</div>
                                                    <div className="fw-semibold">{lesson?.subject || '—'}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="d-flex align-items-start">
                                                <FaUserFriends className="me-2 text-secondary mt-1" />
                                                <div>
                                                    <div className="text-muted small">Група</div>
                                                    <div className="fw-medium">{lesson?.group?.name || '—'}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="d-flex align-items-start">
                                                <FaDoorOpen className="me-2 text-warning mt-1" />
                                                <div>
                                                    <div className="text-muted small">Аудиторія</div>
                                                    <div>
                                                        {lesson?.classroom?.name || '—'}
                                                        {lesson?.classroom?.type && (
                                                            <div className="text-muted small">({lesson.classroom.type})</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="table-responsive">
                    <Table bordered hover className="align-middle">
                        <thead className="table-light">
                            <tr>
                                <th width="80">№</th>
                                <th width="120">Час</th>
                                <th width="160">Предмет</th>
                                <th width="150">Група</th>
                                <th width="170">Аудиторія</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map((slot) => {
                                const lesson = getLessonForTimeSlot(day._id, slot._id);
                                return (
                                    <tr key={slot._id} style={{
                                        backgroundColor: 'white',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'white';
                                        }}>
                                        <td className="text-center fw-bold">
                                            <div style={{
                                                backgroundColor: '#e9ecef',
                                                color: '#495057',
                                                borderRadius: '4px',
                                                padding: '4px 8px',
                                                fontWeight: '600',
                                                display: 'inline-block',
                                                minWidth: '30px'
                                            }}>
                                                {slot.order}
                                            </div>
                                        </td>
                                        <td className="text-nowrap">
                                            <div className="d-flex align-items-center">
                                                <FaClock className="me-2 text-primary" />
                                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                            </div>
                                        </td>
                                        <td>
                                            {lesson ? (
                                                <div className="d-flex align-items-center">
                                                    <FaBook className="me-2 text-success" />
                                                    <span className="fw-semibold">{lesson.subject}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted">—</span>
                                            )}
                                        </td>
                                        <td>
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
                                        <td>
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
                            })}
                        </tbody>
                    </Table>
                </div>
            )}

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