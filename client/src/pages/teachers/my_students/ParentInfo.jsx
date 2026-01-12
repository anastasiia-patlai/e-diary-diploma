import React from "react";
import {
    FaUserFriends,
    FaEnvelope,
    FaChevronUp,
    FaChevronDown,
    FaUser,
    FaPhone,
    FaIdCard,
    FaHome,
    FaCalendarAlt
} from "react-icons/fa";

const ParentInfo = ({ parent, index, studentId, expandedParents, toggleParentExpansion, formatDate, isMobile }) => {
    const key = `${studentId}_${index}`;
    const isExpanded = expandedParents[key] || false;

    return (
        <div style={{
            marginBottom: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            transition: 'all 0.2s'
        }}>
            {/* ЗАГОЛОВОК БАТЬКА */}
            <div
                style={{
                    padding: '14px 16px',
                    backgroundColor: isExpanded ? '#f0f9ff' : '#f9fafb',
                    borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                }}
                onClick={() => toggleParentExpansion(studentId, index)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isExpanded ? '#e0f2fe' : '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isExpanded ? '#f0f9ff' : '#f9fafb'}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: isExpanded ? 'rgba(105, 180, 185, 0.2)' : 'rgba(105, 180, 185, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s'
                    }}>
                        <FaUserFriends size={16} color="rgba(105, 180, 185, 1)" />
                    </div>
                    <div>
                        <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '2px'
                        }}>
                            {parent.fullName || 'Не вказано'}
                        </div>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'rgba(105, 180, 185, 1)'
                }}>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: '500'
                    }}>
                        {isExpanded ? 'Деталі' : 'Деталі'}
                    </span>
                    {isExpanded ? (
                        <FaChevronUp size={14} />
                    ) : (
                        <FaChevronDown size={14} />
                    )}
                </div>
            </div>

            {/* РОЗГОРНУТА ІНФОРМАЦІЯ */}
            {isExpanded && (
                <div style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    animation: 'slideDownParent 0.3s ease-out'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        {/* EMAIL */}
                        <div>
                            <div style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                fontWeight: '500',
                                marginBottom: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FaEnvelope size={14} color="rgba(105, 180, 185, 1)" />
                                Електронна пошта
                            </div>
                            <div style={{
                                fontSize: '16px',
                                color: '#1f2937',
                                fontWeight: '500'
                            }}>
                                {parent.email || 'Не вказано'}
                            </div>
                        </div>

                        {/* ТЕЛЕФОН */}
                        <div>
                            <div style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                fontWeight: '500',
                                marginBottom: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FaPhone size={14} color="rgba(105, 180, 185, 1)" />
                                Телефон
                            </div>
                            <div style={{
                                fontSize: '16px',
                                color: '#1f2937',
                                fontWeight: '500'
                            }}>
                                {parent.phone || 'Не вказано'}
                            </div>
                        </div>

                        {/* ПОСАДА (якщо є) */}
                        {parent.position && (
                            <div>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    fontWeight: '500',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FaIdCard size={14} color="rgba(105, 180, 185, 1)" />
                                    Посада
                                </div>
                                <div style={{
                                    fontSize: '16px',
                                    color: '#1f2937',
                                    fontWeight: '500'
                                }}>
                                    {parent.position}
                                </div>
                            </div>
                        )}

                        {/* АДРЕСА (якщо є) */}
                        {parent.address && (
                            <div>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    fontWeight: '500',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FaHome size={14} color="rgba(105, 180, 185, 1)" />
                                    Адреса
                                </div>
                                <div style={{
                                    fontSize: '16px',
                                    color: '#1f2937',
                                    fontWeight: '500'
                                }}>
                                    {parent.address}
                                </div>
                            </div>
                        )}

                        {/* ДАТА РЕЄСТРАЦІЇ (якщо є) */}
                        {parent.createdAt && (
                            <div>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    fontWeight: '500',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FaCalendarAlt size={14} color="rgba(105, 180, 185, 1)" />
                                    Дата реєстрації
                                </div>
                                <div style={{
                                    fontSize: '16px',
                                    color: '#1f2937',
                                    fontWeight: '500'
                                }}>
                                    {formatDate(parent.createdAt)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentInfo;