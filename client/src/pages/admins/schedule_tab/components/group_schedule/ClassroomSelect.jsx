import React from 'react';
import { Form, Spinner, Badge } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';

const ClassroomSelect = ({
    formData,
    availableClassrooms,
    loadingData,
    availability,
    apiAvailable,
    onInputChange
}) => {
    return (
        <Form.Group className="mb-3">
            <Form.Label style={{
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
            }}>
                Аудиторія *
                {loadingData && (
                    <Spinner animation="border" size="sm" className="ms-2" />
                )}
                {formData.classroom && availability.conflicts.classroom && (
                    <Badge bg="danger" className="ms-2">Конфлікт</Badge>
                )}
                {formData.classroom && !availability.conflicts.classroom && apiAvailable && (
                    <Badge bg="success" className="ms-2">
                        <FaCheck size={10} /> Вільна
                    </Badge>
                )}
            </Form.Label>
            <Form.Select
                value={formData.classroom}
                onChange={(e) => onInputChange('classroom', e.target.value)}
                disabled={loadingData || !formData.timeSlot}
                style={{
                    border: availability.conflicts.classroom ? '2px solid #dc3545' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '14px'
                }}
            >
                <option value="">Оберіть аудиторію</option>
                {availableClassrooms.map(classroom => (
                    <option key={classroom._id} value={classroom._id}>
                        {classroom.name}
                        {classroom.building && ` (${classroom.building})`}
                        {classroom.capacity && ` - ${classroom.capacity} місць`}
                    </option>
                ))}
            </Form.Select>
            <Form.Text className="text-muted">
                {formData.timeSlot ?
                    `Доступні аудиторії: ${availableClassrooms.length}`
                    : 'Оберіть час для перегляду аудиторій'
                }
                {!apiAvailable && ' (офлайн режим)'}
            </Form.Text>
        </Form.Group>
    );
};

export default ClassroomSelect;