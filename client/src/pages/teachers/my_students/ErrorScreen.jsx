import React from "react";
import { FaUserGraduate } from "react-icons/fa";

const ErrorScreen = ({ error }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            flexDirection: 'column',
            gap: '20px',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <FaUserGraduate size={36} color="#ef4444" />
            </div>
            <h3 style={{ color: '#ef4444', margin: 0 }}>Помилка завантаження</h3>
            <p style={{ color: '#6b7280', maxWidth: '400px' }}>{error}</p>
            <button
                onClick={() => window.location.reload()}
                style={{
                    padding: '12px 24px',
                    backgroundColor: 'rgba(105, 180, 185, 1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                }}
            >
                Спробувати знову
            </button>
        </div>
    );
};

export default ErrorScreen;