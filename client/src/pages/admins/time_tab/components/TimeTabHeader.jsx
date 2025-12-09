import React from "react";
import { FaPlus, FaCalendarDay } from "react-icons/fa";

const TimeTabHeader = ({ onShowModal, currentDay, isMobile = false }) => {
    const safeCurrentDay = currentDay || { id: 1, name: "Понеділок" };

    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            marginBottom: isMobile ? '16px' : '20px',
            gap: isMobile ? '12px' : '0',
            padding: isMobile ? '0' : '0'
        }}>
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: isMobile ? 'flex-start' : 'center'
            }}>
                <h3 style={{
                    margin: 0,
                    marginBottom: isMobile ? '6px' : '4px',
                    fontSize: isMobile ? '18px' : '24px',
                    fontWeight: '600',
                    color: '#1f2937',
                    lineHeight: '1.3'
                }}>
                    Час уроків
                </h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap'
                }}>
                    <FaCalendarDay
                        size={isMobile ? 14 : 16}
                        style={{
                            color: '#6b7280',
                            flexShrink: 0
                        }}
                    />
                    <span style={{
                        color: '#6b7280',
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: '500'
                    }}>
                        Обраний день:
                    </span>
                    <span style={{
                        color: 'rgba(105, 180, 185, 1)',
                        fontSize: isMobile ? '13px' : '15px',
                        fontWeight: '600',
                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        marginLeft: '4px'
                    }}>
                        {safeCurrentDay.name}
                    </span>
                </div>
            </div>

            <div style={{
                width: isMobile ? '100%' : 'auto',
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'flex-end'
            }}>
                <button
                    onClick={onShowModal}
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
                        minWidth: isMobile ? 'auto' : '220px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.9)';
                        e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        e.target.style.transform = 'translateY(0)';
                    }}
                    onMouseDown={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseUp={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <FaPlus size={isMobile ? 14 : 16} />
                    {isMobile ? `Налаштувати` : `Налаштувати час`}
                </button>
            </div>
        </div>
    );
};

export default TimeTabHeader;