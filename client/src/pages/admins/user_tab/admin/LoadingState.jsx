import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingState = ({ message, isMobile }) => {
    const { t } = useTranslation();

    return (
        <div style={{
            textAlign: 'center',
            padding: isMobile ? '30px 15px' : '40px 20px',
            color: '#6b7280',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                width: isMobile ? '40px' : '50px',
                height: isMobile ? '40px' : '50px',
                border: '3px solid #f3f4f6',
                borderTop: '3px solid rgba(105, 180, 185, 1)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: isMobile ? '15px' : '20px'
            }} />
            <p style={{
                margin: 0,
                fontSize: isMobile ? '14px' : '16px'
            }}>{message || t('common.loading')}</p>

            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};

export default LoadingState;