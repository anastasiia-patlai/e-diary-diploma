import React from "react";
import {
    FaUserFriends,
    FaChevronUp,
    FaChevronDown,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaIdCard,
    FaHome,
    FaCalendarAlt
} from "react-icons/fa";
import InfoRow from "./InfoRow";

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
                        {isExpanded ? 'Згорнути' : 'Деталі'}
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
                    <InfoRow
                        label="Електронна пошта"
                        value={parent.email}
                        icon={FaEnvelope}
                        isMobile={isMobile}
                    />
                    <InfoRow
                        label="Телефон"
                        value={parent.phone}
                        icon={FaPhone}
                        isMobile={isMobile}
                    />
                </div>
            )}
        </div>
    );
};

export default ParentInfo;