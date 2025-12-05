import React from 'react';
import { FaExclamationTriangle } from "react-icons/fa";

const ErrorState = ({ error, onRetry, isMobile }) => {
    return (
        <div style={{
            textAlign: 'center',
            padding: isMobile ? '30px 15px' : '40px 20px',
            color: '#ef4444',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <FaExclamationTriangle
                size={isMobile ? 32 : 40}
                style={{ marginBottom: isMobile ? '15px' : '20px' }}
            />
            <p style={{
                marginBottom: isMobile ? '15px' : '20px',
                fontSize: isMobile ? '14px' : '16px',
                lineHeight: '1.4'
            }}>
                {error}
            </p>
            <button
                onClick={onRetry}
                style={{
                    padding: isMobile ? '8px 16px' : '10px 20px',
                    backgroundColor: 'rgba(105, 180, 185, 1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: '500'
                }}
            >
                Спробувати знову
            </button>
        </div>
    );
};

export default ErrorState;