import React from "react";
import { FaUserGraduate, FaSchool, FaUsers } from "react-icons/fa";

const Header = ({ userGroups, studentsCount, isMobile }) => {
    return (
        <div style={{
            marginBottom: '24px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isMobile ? 'center' : 'flex-start',
                gap: isMobile ? '12px' : '20px',
                flexWrap: 'wrap',
                marginBottom: isMobile ? '12px' : '0'
            }}>
                {/* МОЇ УЧНІ */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 0'
                }}>
                    <FaUserGraduate color="rgba(105, 180, 185, 1)" size={isMobile ? 20 : 24} />
                    <span style={{
                        fontSize: isMobile ? '18px' : '24px',
                        fontWeight: '500',
                        color: '#1f2937'
                    }}>
                        Мої учні
                    </span>
                </div>

                <div style={{
                    color: '#d1d5db',
                    fontSize: isMobile ? '20px' : '26px',
                    fontWeight: '300'
                }}>
                    |
                </div>

                {/* НАЗВА КЛАСУ */}
                {userGroups.length > 0 && (
                    <>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 0'
                        }}>
                            <FaSchool color="rgba(105, 180, 185, 1)" size={isMobile ? 18 : 20} />
                            <span style={{
                                fontSize: isMobile ? '18px' : '24px',
                                fontWeight: '600',
                                color: 'rgba(105, 180, 185, 1)'
                            }}>
                                {userGroups.length === 1
                                    ? userGroups[0].name
                                    : `${userGroups.length} класи`
                                }
                            </span>
                        </div>

                        <div style={{
                            color: '#d1d5db',
                            fontSize: isMobile ? '20px' : '26px',
                            fontWeight: '300'
                        }}>
                            |
                        </div>
                    </>
                )}

                {/* КІЛЬКІСТЬ УЧНІВ */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 0'
                }}>
                    <FaUsers color="rgba(105, 180, 185, 1)" size={isMobile ? 18 : 20} />
                    <span style={{
                        fontSize: isMobile ? '18px' : '24px',
                        fontWeight: '500',
                        color: '#1f2937'
                    }}>
                        {studentsCount} учні
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Header;