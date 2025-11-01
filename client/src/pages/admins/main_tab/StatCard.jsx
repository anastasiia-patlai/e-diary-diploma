import React from 'react';

const StatCard = ({ title, value, icon, color, backgroundColor }) => {
    return (
        <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
        }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <p style={{
                        margin: '0 0 8px 0',
                        color: '#6b7280',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        {title}
                    </p>
                    <h3 style={{
                        margin: 0,
                        color: '#1f2937',
                        fontSize: '32px',
                        fontWeight: '700'
                    }}>
                        {value.toLocaleString()}
                    </h3>
                </div>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: backgroundColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color,
                    fontSize: '20px'
                }}>
                    {icon}
                </div>
            </div>

            {/* Прогрес бар (декоративний) */}
            <div style={{
                marginTop: '16px',
                height: '4px',
                backgroundColor: '#f3f4f6',
                borderRadius: '2px',
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%',
                    backgroundColor: color,
                    width: '70%', // Фіксована ширина для візуального ефекту
                    borderRadius: '2px'
                }} />
            </div>
        </div>
    );
};

export default StatCard;