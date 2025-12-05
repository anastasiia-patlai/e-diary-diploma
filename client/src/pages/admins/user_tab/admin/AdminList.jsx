import React from 'react';
import AdminCard from './AdminCard';

const AdminList = ({ admins, searchQuery, onEdit, onDelete, isMobile }) => {
    if (admins.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: isMobile ? '30px 15px' : '40px 20px',
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
            }}>
                <p style={{
                    margin: 0,
                    fontSize: isMobile ? '14px' : '16px'
                }}>
                    {searchQuery
                        ? `Адміністратори за запитом "${searchQuery}" не знайдені`
                        : 'Адміністратори не знайдені'
                    }
                </p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '12px' : '15px',
            marginBottom: isMobile ? '15px' : '20px',
            width: '100%'
        }}>
            {admins.map(admin => (
                <AdminCard
                    key={admin._id}
                    admin={admin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isMobile={isMobile}
                />
            ))}
        </div>
    );
};

export default AdminList;