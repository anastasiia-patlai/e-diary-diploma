import React from 'react';
import { Form } from 'react-bootstrap';

const TimeSlotSelect = ({
    formData,
    filteredTimeSlots,
    loadingData,
    onInputChange,
    formatTimeSlot,
    schedule
}) => {
    return (
        <Form.Group className="mb-3">
            <Form.Label style={{
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
            }}>
                Час заняття *
            </Form.Label>
            <Form.Select
                value={formData.timeSlot}
                onChange={(e) => onInputChange('timeSlot', e.target.value)}
                disabled={loadingData}
                style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '14px'
                }}
            >
                <option value="">Оберіть час</option>
                {filteredTimeSlots.map(slot => (
                    <option key={slot._id} value={slot._id}>
                        {formatTimeSlot(slot)}
                    </option>
                ))}
            </Form.Select>
            <Form.Text className="text-muted">
                Доступні часові слоти для {schedule.dayOfWeek?.name}
            </Form.Text>
        </Form.Group>
    );
};

export default TimeSlotSelect;