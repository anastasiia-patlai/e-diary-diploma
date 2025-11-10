import React from 'react';
import { Form, Spinner, Badge } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';

const TeacherSelect = ({
    formData,
    availableTeachers,
    loadingData,
    availability,
    apiAvailable,
    onInputChange,
    schedule
}) => {
    return (
        <Form.Group className="mb-4">
            <Form.Label style={{
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
            }}>
                Викладач *
                {loadingData && (
                    <Spinner animation="border" size="sm" className="ms-2" />
                )}
                {formData.teacher && availability.conflicts.teacher && (
                    <Badge bg="danger" className="ms-2">Конфлікт</Badge>
                )}
                {formData.teacher && !availability.conflicts.teacher && apiAvailable && (
                    <Badge bg="success" className="ms-2">
                        <FaCheck size={10} /> Вільний
                    </Badge>
                )}
            </Form.Label>
            <Form.Select
                value={formData.teacher}
                onChange={(e) => onInputChange('teacher', e.target.value)}
                disabled={loadingData || !formData.timeSlot}
                style={{
                    border: availability.conflicts.teacher ? '2px solid #dc3545' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '14px'
                }}
            >
                <option value="">Оберіть викладача</option>
                {availableTeachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                        {teacher.fullName}
                        {teacher.email && ` (${teacher.email})`}
                    </option>
                ))}
            </Form.Select>
            <Form.Text className="text-muted">
                {formData.timeSlot ?
                    `Доступні викладачі з предмету "${schedule.subject}": ${availableTeachers.length}`
                    : 'Оберіть час для перегляду викладачів'
                }
                {!apiAvailable && ' (офлайн режим)'}
            </Form.Text>
        </Form.Group>
    );
};

export default TeacherSelect;