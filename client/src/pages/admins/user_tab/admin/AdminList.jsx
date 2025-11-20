import React from 'react';
import AdminCard from './AdminCard';

const AdminList = ({ admins, searchQuery, onEdit, onDelete }) => {
    if (admins.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280'
            }}>
                <p>
                    {searchQuery
                        ? `Адміністратори за запитом "${searchQuery}" не знайдені`
                        : 'Адміністратори не знайдені'
                    }
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            {admins.map(admin => (
                <AdminCard
                    key={admin._id}
                    admin={admin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default AdminList;