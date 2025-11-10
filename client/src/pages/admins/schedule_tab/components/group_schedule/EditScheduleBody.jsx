import React from 'react';
import { Modal, Form, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import CurrentScheduleInfo from './CurrentScheduleInfo';
import TimeSlotSelect from './TimeSlotSelect';
import ClassroomSelect from './ClassroomSelect';
import TeacherSelect from './TeacherSelect';

const EditScheduleBody = ({
    schedule,
    formData,
    filteredTimeSlots,
    availableClassrooms,
    availableTeachers,
    loadingData,
    error,
    availability,
    apiAvailable,
    hasConflicts,
    onInputChange,
    formatTimeSlot
}) => {
    return (
        <Modal.Body style={{ padding: '24px' }}>
            {schedule && (
                <>
                    <CurrentScheduleInfo
                        schedule={schedule}
                        formatTimeSlot={formatTimeSlot}
                    />

                    {!apiAvailable && (
                        <Alert variant="warning" className="mb-3">
                            <FaExclamationTriangle className="me-2" />
                            <strong>Увага:</strong> API недоступне. Використовуються всі доступні варіанти без перевірки конфліктів.
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="warning" className="mb-3">
                            <FaExclamationTriangle className="me-2" />
                            {error}
                        </Alert>
                    )}

                    {hasConflicts && (
                        <Alert variant="danger" className="mb-3">
                            <FaExclamationTriangle className="me-2" />
                            <strong>Знайдено конфлікти:</strong>
                            <ul className="mb-0 mt-2">
                                {availability.conflicts.classroom && (
                                    <li>Аудиторія зайнята: {availability.conflicts.classroom.conflict.group} - {availability.conflicts.classroom.conflict.subject} ({availability.conflicts.classroom.conflict.teacher})</li>
                                )}
                                {availability.conflicts.teacher && (
                                    <li>Викладач зайнятий: {availability.conflicts.teacher.conflict.group} - {availability.conflicts.teacher.conflict.subject} (ауд. {availability.conflicts.teacher.conflict.classroom})</li>
                                )}
                            </ul>
                        </Alert>
                    )}

                    <Form>
                        <Row>
                            <Col md={6}>
                                <TimeSlotSelect
                                    formData={formData}
                                    filteredTimeSlots={filteredTimeSlots}
                                    loadingData={loadingData}
                                    onInputChange={onInputChange}
                                    formatTimeSlot={formatTimeSlot}
                                    schedule={schedule}
                                />
                            </Col>

                            <Col md={6}>
                                <ClassroomSelect
                                    formData={formData}
                                    availableClassrooms={availableClassrooms}
                                    loadingData={loadingData}
                                    availability={availability}
                                    apiAvailable={apiAvailable}
                                    onInputChange={onInputChange}
                                />
                            </Col>
                        </Row>

                        <TeacherSelect
                            formData={formData}
                            availableTeachers={availableTeachers}
                            loadingData={loadingData}
                            availability={availability}
                            apiAvailable={apiAvailable}
                            onInputChange={onInputChange}
                            schedule={schedule}
                        />
                    </Form>
                </>
            )}
        </Modal.Body>
    );
};

export default EditScheduleBody;