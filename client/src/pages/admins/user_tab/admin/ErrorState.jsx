import React from 'react';
import { FaExclamationTriangle } from "react-icons/fa";

const ErrorState = ({ error, onRetry }) => {
    return (
        <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#ef4444'
        }}>
            <FaExclamationTriangle size={32} style={{ marginBottom: '10px' }} />
            <p style={{ marginBottom: '15px' }}>{error}</p>
            <button
                onClick={onRetry}
                style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(105, 180, 185, 1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}
            >
                Спробувати знову
            </button>
        </div>
    );
};

export default ErrorState;