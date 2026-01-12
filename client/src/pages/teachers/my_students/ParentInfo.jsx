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
import InfoRow from "./InfoRow";

const ParentInfo = ({ parent, index, studentId, expandedParents, toggleParentExpansion, formatDate }) => {
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
                            Батько {index + 1}: {parent.fullName || 'Не вказано'}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <FaEnvelope size={12} />
                            <span>{parent.email || 'Email не вказано'}</span>
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
                        {isExpanded ? 'Згорнути' : 'Деталі'}
                    </span>
                    {isExpanded ? (
                        <FaChevronUp size={14} />
                    ) : (
                        <FaChevronDown size={14} />
                    )}
                </div>
            </div>

            {isExpanded && (
                <div style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    animation: 'slideDownParent 0.3s ease-out',
                    paddingBottom: '0px',
                    paddingTop: '10px'
                }}>
                    <div style={{
                        marginBottom: '20px'
                    }}>
                        <InfoRow
                            label="ПІБ"
                            value={parent.fullName}
                            icon={FaUser}
                            compact
                        />
                        <InfoRow
                            label="Електронна пошта"
                            value={parent.email}
                            icon={FaEnvelope}
                            compact
                        />
                        <InfoRow
                            label="Телефон"
                            value={parent.phone}
                            icon={FaPhone}
                            compact
                        />

                        {parent.position && (
                            <InfoRow
                                label="Посада"
                                value={parent.position}
                                icon={FaIdCard}
                                compact
                            />
                        )}

                        {parent.address && (
                            <InfoRow
                                label="Адреса"
                                value={parent.address}
                                icon={FaHome}
                                compact
                            />
                        )}

                        {parent.createdAt && (
                            <InfoRow
                                label="Дата реєстрації"
                                value={formatDate(parent.createdAt)}
                                icon={FaCalendarAlt}
                                compact
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentInfo;