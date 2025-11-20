import React from 'react';
import { FaUserShield, FaEnvelope, FaPhone, FaCalendarAlt, FaEdit, FaTrash, FaBriefcase } from "react-icons/fa";

const AdminCard = ({ admin, onEdit, onDelete }) => {
    return (
        <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#ffffff',
            transition: 'box-shadow 0.2s'
        }}
            onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(105, 180, 185, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(105, 180, 185, 1)',
                        flexShrink: 0
                    }}>
                        <FaUserShield size={24} />
                    </div>
                    <AdminInfo admin={admin} />
                </div>

                <AdminActions
                    admin={admin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </div>

            <AdminAdditionalInfo admin={admin} />
        </div>
    );
};

const AdminInfo = ({ admin }) => (
    <div>
        <div style={{
            fontWeight: '600',
            fontSize: '18px',
            marginBottom: '8px',
            color: '#1f2937'
        }}>
            {admin.fullName}
        </div>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '4px'
        }}>
            <FaEnvelope size={12} />
            {admin.email}
        </div>
        {admin.phone && (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '4px'
            }}>
                <FaPhone size={12} />
                {admin.phone}
            </div>
        )}
        {admin.jobPosition && (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '4px'
            }}>
                <FaBriefcase size={12} />
                {admin.jobPosition}
            </div>
        )}
    </div>
);

const AdminActions = ({ admin, onEdit, onDelete }) => (
    <div style={{ display: 'flex', gap: '8px' }}>
        <button
            onClick={() => onEdit(admin)}
            style={{
                padding: '6px 12px',
                backgroundColor: 'rgba(105, 180, 185, 1)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}
        >
            <FaEdit />
            Редагувати
        </button>
        <button
            onClick={() => onDelete(admin)}
            style={{
                padding: '6px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}
        >
            <FaTrash />
            Видалити
        </button>
    </div>
);

// ФУНКЦІЯ ДЛЯ РОЗРАХУНКУ ВІКУ
const AdminAdditionalInfo = ({ admin }) => {
    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    const age = admin.dateOfBirth ? calculateAge(admin.dateOfBirth) : null;

    return (
        <div style={{
            display: 'flex',
            gap: '20px',
            paddingTop: '15px',
            borderTop: '1px solid #f3f4f6',
            flexWrap: 'wrap'
        }}>
            {admin.dateOfBirth && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    color: '#6b7280'
                }}>
                    <FaCalendarAlt size={12} />
                    Дата народження: {new Date(admin.dateOfBirth).toLocaleDateString('uk-UA')}
                    {age && (
                        <span style={{ marginLeft: '8px', fontWeight: '500' }}>
                            ({age} {getAgeSuffix(age)})
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

// ДЛЯ ВІДМІНЮВАННЯ СЛОВА "РІК"
const getAgeSuffix = (age) => {
    const lastDigit = age % 10;
    const lastTwoDigits = age % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 'років';
    }

    if (lastDigit === 1) {
        return 'рік';
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'роки';
    }

    return 'років';
};

export default AdminCard;