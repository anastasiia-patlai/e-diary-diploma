import React from "react";
import { FaUserGraduate, FaSchool, FaUsers } from "react-icons/fa";

const Header = ({ userGroups, studentsCount, isMobile }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '0'
        }}>
            <div>
                <h1 style={{
                    margin: 0,
                    color: '#1f2937',
                    fontSize: isMobile ? '22px' : '26px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap'
                }}>
                    <FaUserGraduate color="rgba(105, 180, 185, 1)" size={28} />
                    <span>Мої учні</span>

                    {userGroups.length > 0 && (
                        <>
                            <span style={{
                                color: '#d1d5db',
                                fontSize: isMobile ? '22px' : '26px',
                                fontWeight: '300'
                            }}>
                                |
                            </span>
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '22px',
                                fontWeight: '600',
                                color: 'rgba(105, 180, 185, 1)'
                            }}>
                                <FaSchool size={20} />
                                {userGroups.length === 1
                                    ? userGroups[0].name
                                    : `${userGroups.length} класи`
                                }
                            </span>
                        </>
                    )}
                </h1>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: 'rgba(105, 180, 185, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(105, 180, 185, 0.2)'
            }}>
                <FaUsers color="rgba(105, 180, 185, 1)" size={20} />
                <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937'
                }}>
                    {studentsCount} учнів
                </span>
            </div>
        </div>
    );
};

export default Header;