import React from 'react';
import { FaUserShield, FaEnvelope, FaPhone, FaCalendarAlt, FaEdit, FaTrash, FaBriefcase, FaEllipsisV } from "react-icons/fa";

const AdminCard = ({ admin, onEdit, onDelete, isMobile }) => {
    const [showMobileMenu, setShowMobileMenu] = React.useState(false);

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
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: isMobile ? '15px' : '20px',
            backgroundColor: '#ffffff',
            transition: 'box-shadow 0.2s',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: isMobile ? '12px' : '15px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: isMobile ? '12px' : '15px',
                    flex: 1,
                    minWidth: 0
                }}>
                    <div style={{
                        width: isMobile ? '50px' : '60px',
                        height: isMobile ? '50px' : '60px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(105, 180, 185, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(105, 180, 185, 1)',
                        flexShrink: 0
                    }}>
                        <FaUserShield size={isMobile ? 20 : 24} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontWeight: '600',
                            fontSize: isMobile ? '16px' : '18px',
                            marginBottom: isMobile ? '6px' : '8px',
                            color: '#1f2937',
                            lineHeight: '1.3'
                        }}>
                            {admin.fullName}
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: isMobile ? '3px' : '4px'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: isMobile ? '13px' : '14px',
                                color: '#6b7280'
                            }}>
                                <FaEnvelope size={isMobile ? 12 : 14} />
                                <span style={{ wordBreak: 'break-word' }}>
                                    {admin.email}
                                </span>
                            </div>
                            {admin.phone && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: isMobile ? '13px' : '14px',
                                    color: '#6b7280'
                                }}>
                                    <FaPhone size={isMobile ? 12 : 14} />
                                    {admin.phone}
                                </div>
                            )}
                            {admin.jobPosition && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: isMobile ? '13px' : '14px',
                                    color: '#6b7280'
                                }}>
                                    <FaBriefcase size={isMobile ? 12 : 14} />
                                    {admin.jobPosition}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isMobile ? (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            style={{
                                padding: '6px',
                                backgroundColor: 'transparent',
                                color: '#6b7280',
                                border: '1px solid #e5e7eb',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            <FaEllipsisV size={16} />
                        </button>

                        {showMobileMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                zIndex: 10,
                                minWidth: '140px'
                            }}>
                                <button
                                    onClick={() => {
                                        onEdit(admin);
                                        setShowMobileMenu(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        border: 'none',
                                        borderBottom: '1px solid #f3f4f6',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <FaEdit size={10} />
                                    Редагувати
                                </button>
                                <button
                                    onClick={() => {
                                        onDelete(admin);
                                        setShowMobileMenu(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        backgroundColor: 'white',
                                        color: '#ef4444',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <FaTrash size={10} />
                                    Видалити
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
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
                            <FaEdit size={12} />
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
                            <FaTrash size={12} />
                            Видалити
                        </button>
                    </div>
                )}
            </div>

            {admin.dateOfBirth && (
                <div style={{
                    paddingTop: isMobile ? '10px' : '15px',
                    borderTop: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: isMobile ? '12px' : '13px',
                    color: '#6b7280'
                }}>
                    <FaCalendarAlt size={isMobile ? 12 : 14} />
                    <span>
                        Дата народження: {new Date(admin.dateOfBirth).toLocaleDateString('uk-UA')}
                        {age && (
                            <span style={{ fontWeight: '500', marginLeft: '6px' }}>
                                ({age} {getAgeSuffix(age)})
                            </span>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
};

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