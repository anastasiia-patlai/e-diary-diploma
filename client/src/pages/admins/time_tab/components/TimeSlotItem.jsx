// src/pages/admins/time_tab/components/TimeSlotItem.jsx
import React from "react";
import { FaTrash } from "react-icons/fa";

const TimeSlotItem = ({ slot, index, onUpdate, onRemove }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
        }}>
            {/* Номер уроку */}
            <div style={{
                minWidth: '32px',
                height: '32px',
                backgroundColor: 'rgba(105, 180, 185, 1)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '14px'
            }}>
                {slot.order}
            </div>

            {/* Початок уроку */}
            <div style={{ flex: 1 }}>
                <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151'
                }}>
                    Початок
                </label>
                <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => onUpdate('startTime', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                    }}
                />
            </div>

            {/* Кінець уроку */}
            <div style={{ flex: 1 }}>
                <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151'
                }}>
                    Кінець
                </label>
                <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => onUpdate('endTime', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                    }}
                />
            </div>

            {/* Кнопка видалення */}
            <button
                type="button"
                onClick={onRemove}
                style={{
                    padding: '8px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '20px',
                    transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#ef4444';
                }}
            >
                <FaTrash />
            </button>
        </div>
    );
};

export default TimeSlotItem;