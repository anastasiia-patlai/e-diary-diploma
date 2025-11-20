import React from 'react';

const LoadingState = ({ message = "Завантаження..." }) => {
    return (
        <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
        }}>
            <p>{message}</p>
        </div>
    );
};

export default LoadingState;