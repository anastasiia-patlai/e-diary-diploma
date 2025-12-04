import React from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { FaCalendar } from 'react-icons/fa';

const DayOfWeekSelect = ({
    formData,
    daysOfWeek,
    onInputChange,
    schedule
}) => {
    const safeDaysOfWeek = Array.isArray(daysOfWeek) ? daysOfWeek : [];

    if (!safeDaysOfWeek || safeDaysOfWeek.length === 0) {
        return (
            <Form.Group className="mb-3">
                <Form.Label style={{
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                }}>
                    День тижня *
                </Form.Label>
                <div style={{
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                    textAlign: 'center'
                }}>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Завантаження днів тижня...
                </div>
            </Form.Group>
        );
    }

    return (
        <Form.Group className="mb-3">
            <Form.Label style={{
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                <FaCalendar />
                День тижня *
            </Form.Label>
            <Form.Select
                value={formData.dayOfWeek}
                onChange={(e) => onInputChange('dayOfWeek', e.target.value)}
                style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '14px'
                }}
            >
                <option value="">Оберіть день</option>
                {safeDaysOfWeek.map(day => (
                    <option key={day._id || day.id} value={day._id || day.id}>
                        {day.name}
                    </option>
                ))}
            </Form.Select>
            <Form.Text className="text-muted">
                Поточний день: {schedule.dayOfWeek?.name || 'Не вказано'}
            </Form.Text>
        </Form.Group>
    );
};

export default DayOfWeekSelect;