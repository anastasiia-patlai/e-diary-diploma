import React from "react";
import { FaPlus, FaDoorOpen } from "react-icons/fa";

const ClassroomsHeader = ({ onShowCreateModal, isMobile = false }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: isMobile ? '16px' : '20px',
            gap: isMobile ? '12px' : '0'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '8px' : '12px',
                flex: 1
            }}>
                <FaDoorOpen size={isMobile ? 20 : 24} style={{
                    color: 'rgba(105, 180, 185, 1)',
                    flexShrink: 0
                }} />
                <div>
                    <h3 style={{
                        margin: 0,
                        fontSize: '26px',
                        fontWeight: '500',
                        color: '#1f2937'
                    }}>
                        Управління аудиторіями
                    </h3>
                    <p style={{
                        margin: isMobile ? '2px 0 0 0' : '4px 0 0 0',
                        color: '#6b7280',
                        fontSize: isMobile ? '12px' : '14px'
                    }}>
                        Створення та редагування навчальних приміщень
                    </p>
                </div>
            </div>

            <button
                onClick={onShowCreateModal}
                style={{
                    backgroundColor: 'rgba(105, 180, 185, 1)',
                    color: 'white',
                    padding: isMobile ? '10px 16px' : '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: isMobile ? '14px' : '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    width: isMobile ? '100%' : 'auto',
                    minWidth: isMobile ? 'auto' : '180px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.9)';
                    e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
            >
                <FaPlus size={isMobile ? 14 : 16} />
                Додати аудиторію
            </button>
        </div>
    );
};

export default ClassroomsHeader;