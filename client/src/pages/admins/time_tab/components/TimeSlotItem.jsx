import React from "react";
import { FaTrash } from "react-icons/fa";

const TimeSlotItem = ({ slot, index, onUpdate, onRemove, isMobile = false }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '12px' : '12px',
            marginBottom: isMobile ? '12px' : '12px',
            padding: isMobile ? '12px' : '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            position: 'relative'
        }}>
            {/* Номер уроку */}
            <div style={{
                minWidth: isMobile ? '28px' : '32px',
                height: isMobile ? '28px' : '32px',
                backgroundColor: 'rgba(105, 180, 185, 1)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: isMobile ? '13px' : '14px',
                flexShrink: 0
            }}>
                {slot.order}
            </div>

            {/* Часові поля */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '12px' : '16px',
                flex: 1,
                width: '100%'
            }}>
                <div style={{ flex: 1, width: '100%' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: isMobile ? '12px' : '12px',
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
                            padding: isMobile ? '8px 10px' : '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: isMobile ? '14px' : '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ flex: 1, width: '100%' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: isMobile ? '12px' : '12px',
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
                            padding: isMobile ? '8px 10px' : '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: isMobile ? '14px' : '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
            </div>

            {/* Кнопка видалення */}
            <button
                type="button"
                onClick={onRemove}
                style={{
                    padding: isMobile ? '8px 10px' : '8px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s',
                    width: isMobile ? '100%' : 'auto',
                    position: isMobile ? 'relative' : 'absolute',
                    right: isMobile ? 'auto' : '12px',
                    top: isMobile ? 'auto' : '50%',
                    transform: isMobile ? 'none' : 'translateY(-50%)'
                }}
            >
                <FaTrash size={isMobile ? 12 : 14} />
                {isMobile && ' Видалити'}
            </button>
        </div>
    );
};

export default TimeSlotItem;