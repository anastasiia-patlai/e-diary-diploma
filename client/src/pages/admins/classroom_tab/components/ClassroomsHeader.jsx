import React from "react";
import { FaPlus } from "react-icons/fa";

const ClassroomsHeader = ({ onShowCreateModal }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        }}>
            <h3 style={{ margin: 0 }}>Управління аудиторіями</h3>
            <button
                onClick={onShowCreateModal}
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
                Додати аудиторію
            </button>
        </div>
    );
};

export default ClassroomsHeader;