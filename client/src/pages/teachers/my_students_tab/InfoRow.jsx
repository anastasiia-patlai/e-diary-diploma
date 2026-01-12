import React from "react";

const InfoRow = ({ label, value, icon: Icon, compact = false, isMobile }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: compact ? '1fr 1.5fr' : (isMobile ? '1fr' : '1fr 1.5fr'),
            gap: compact ? '12px' : '20px',
            padding: compact ? '8px 0' : '12px 0',
            borderBottom: compact ? 'none' : '1px solid #f3f4f6',
            alignItems: 'flex-start'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                {Icon && (
                    <div style={{
                        width: compact ? '28px' : '32px',
                        height: compact ? '28px' : '32px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Icon size={compact ? 14 : 16} color="rgba(105, 180, 185, 1)" />
                    </div>
                )}
                <span style={{
                    fontSize: compact ? '13px' : '14px',
                    color: '#6b7280',
                    fontWeight: '500',
                    flex: 1
                }}>
                    {label}
                </span>
            </div>
            <div style={{
                fontSize: compact ? '14px' : '15px',
                color: '#1f2937',
                fontWeight: '500',
                lineHeight: '1.4',
                wordBreak: 'break-word',
                paddingLeft: isMobile ? '0' : '10px'
            }}>
                {value || 'Не вказано'}
            </div>
        </div>
    );
};

export default InfoRow;