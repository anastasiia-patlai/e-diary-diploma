import React from "react";

const LoadingScreen = ({ isMobile }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            fontSize: isMobile ? '16px' : '18px',
            color: '#666'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid rgba(105, 180, 185, 0.1)',
                    borderTop: '4px solid rgba(105, 180, 185, 1)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                }} />
                <p>Завантаження даних про учнів...</p>
            </div>
        </div>
    );
};

export default LoadingScreen;