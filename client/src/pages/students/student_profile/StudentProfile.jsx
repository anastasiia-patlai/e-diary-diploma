// student_profile/StudentProfile.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaGraduationCap, FaCalendarAlt } from "react-icons/fa";

const StudentProfile = ({ userData, isMobile }) => {
    const { t } = useTranslation();

    return (
        <div>
            <h3 style={{ fontSize: isMobile ? '18px' : '24px', marginBottom: '20px' }}>
                {t("student.profile.title")}
            </h3>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                padding: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    marginBottom: '30px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        backgroundColor: 'rgba(105, 180, 185, 0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px',
                        color: 'rgba(105, 180, 185, 1)'
                    }}>
                        {userData?.fullName?.charAt(0) || 'S'}
                    </div>
                    <div>
                        <h2 style={{ margin: '0 0 5px 0' }}>{userData?.fullName}</h2>
                        <p style={{ margin: 0, color: '#666' }}>{t("student.profile.student")}</p>
                        <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                            {t("student.profile.group")}: {userData?.group || '9-А'}
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gap: '15px',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaEnvelope style={{ color: '#666' }} />
                        <div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{t("student.profile.email")}</div>
                            <div>{userData?.email || 'student@school.edu.ua'}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaPhone style={{ color: '#666' }} />
                        <div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{t("student.profile.phone")}</div>
                            <div>{userData?.phone || '+380990000000'}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaPhone style={{ color: '#666' }} />
                        <div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{t("student.profile.parentPhone")}</div>
                            <div>{userData?.parentPhone || '+380990000001'}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaMapMarkerAlt style={{ color: '#666' }} />
                        <div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{t("student.profile.address")}</div>
                            <div>{userData?.address || 'м. Київ, вул. Шкільна, 1'}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaBirthdayCake style={{ color: '#666' }} />
                        <div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{t("student.profile.birthDate")}</div>
                            <div>{userData?.birthDate ? new Date(userData.birthDate).toLocaleDateString() : '01.01.2010'}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaCalendarAlt style={{ color: '#666' }} />
                        <div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{t("student.profile.enrollmentDate")}</div>
                            <div>{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '01.09.2023'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;