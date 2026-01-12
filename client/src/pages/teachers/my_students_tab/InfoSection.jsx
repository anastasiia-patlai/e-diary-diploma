import React from "react";
import {
    FaUser,
    FaBirthdayCake,
    FaEnvelope,
    FaPhone,
    FaBook,
    FaUserShield,
    FaUsersSlash,
    FaUserFriends
} from "react-icons/fa";
import InfoRow from "./InfoRow";

const InfoSection = ({ student, formatDate, icon = "user", title = "Основна інформація", children, isMobile }) => {
    const getIcon = () => {
        switch (icon) {
            case "parents": return FaUserFriends;
            default: return FaUser;
        }
    };

    const Icon = getIcon();

    if (student) {
        return (
            <div style={{
                marginBottom: '24px',
                backgroundColor: 'white',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Icon size={18} color="rgba(105, 180, 185, 1)" />
                    <h4 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937'
                    }}>
                        {title}
                    </h4>
                </div>
                <div style={{ padding: '20px' }}>
                    <InfoRow
                        label="Електронна пошта"
                        value={student.email}
                        icon={FaEnvelope}
                        isMobile={isMobile}
                    />
                    <InfoRow
                        label="Телефон"
                        value={student.phone}
                        icon={FaPhone}
                        isMobile={isMobile}
                    />
                    {student.groupCategory && (
                        <InfoRow
                            label="Категорія групи"
                            value={
                                student.groupCategory === 'young' ? 'Молодші класи (1-4)' :
                                    student.groupCategory === 'middle' ? 'Середні класи (5-9)' :
                                        student.groupCategory === 'senior' ? 'Старші класи (10-11)' :
                                            student.groupCategory
                            }
                            icon={FaBook}
                            isMobile={isMobile}
                        />
                    )}
                    <InfoRow
                        label="Підгрупа"
                        value={student.subgroupInfo ? student.subgroupInfo.name : 'Не розподілено на підгрупи'}
                        icon={student.subgroupInfo ? FaUserShield : FaUsersSlash}
                        isMobile={isMobile}
                    />
                    <InfoRow
                        label="Дата народження"
                        value={formatDate(student.dateOfBirth || student.birthDate)}
                        icon={FaBirthdayCake}
                        isMobile={isMobile}
                    />
                </div>
            </div>
        );
    }

    return (
        <div style={{
            marginBottom: '24px',
            backgroundColor: 'white',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '16px 20px',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <Icon size={18} color="rgba(105, 180, 185, 1)" />
                <h4 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937'
                }}>
                    {title}
                </h4>
            </div>
            <div style={{ padding: '20px' }}>
                {children}
            </div>
        </div>
    );
};

export default InfoSection;