import React from "react";
import { FaPlus, FaCalendarDay } from "react-icons/fa";

const TimeTabHeader = ({ onShowModal, currentDay }) => {
    const safeCurrentDay = currentDay || { id: 1, name: "Понеділок" };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        }}>
            <div>
                <h3 style={{ margin: 0, marginBottom: '4px' }}>Час уроків</h3>
                <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <FaCalendarDay />
                    Обраний день: <strong>{safeCurrentDay.name}</strong>
                </p>
            </div>
            <button
                onClick={onShowModal}
                style={{
                    backgroundColor: 'rgba(105, 180, 185, 1)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.8)';
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                }}
            >
                <FaPlus />
                Налаштувати час для {safeCurrentDay.name}
            </button>
        </div>
    );
};

export default TimeTabHeader;