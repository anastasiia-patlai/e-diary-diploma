import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    FaHome,
    FaUserCircle,
    FaCalendarAlt,
    FaBook,
    FaUsers,
    FaChartLine,
    FaTasks,
    FaComments,
    FaBars,
    FaTimes,
    FaGraduationCap,
    FaClock,
    FaExclamationTriangle,
    FaCheckCircle,
    FaSpinner
} from "react-icons/fa";

// Імпорти компонентів
import StudentProfile from "./student_profile/StudentProfile";
import ClassmatesTab from "./classmates_tab/ClassmatesTab";
import StudentScheduleTab from "./schedule_tab/StudentScheduleTab";
import GradesTab from "./grades_tab/GradesTab";
import HomeworkTab from "./homework_tab/HomeworkTab";
import LanguageSwitcher from "../../i18n/components/LanguageSwitcher";

const StudentPage = ({ onLogout, userFullName }) => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState(t("student.sections.home"));
    const [userData, setUserData] = useState(null);
    const [databaseName, setDatabaseName] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [studentStats, setStudentStats] = useState({
        averageGrade: 0,
        totalAbsences: 0,
        completedHomework: 0,
        totalHomework: 0
    });

    useEffect(() => {
        fetchUserData();
        fetchStudentStats();

        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchUserData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const { databaseName: dbName, userId } = userInfo;

            console.log('userInfo з localStorage:', userInfo);
            setDatabaseName(dbName);

            if (dbName && userId) {
                const response = await fetch(`/api/user/me?databaseName=${encodeURIComponent(dbName)}&userId=${encodeURIComponent(userId)}`);

                if (response.ok) {
                    const data = await response.json();

                    if (data.success) {
                        if (!data.user._id && userId) {
                            data.user._id = userId;
                        }

                        // Отримуємо інформацію про групу студента
                        if (data.user.groupId) {
                            try {
                                const groupResponse = await fetch(`/api/groups/${data.user.groupId}?databaseName=${dbName}`);
                                if (groupResponse.ok) {
                                    const group = await groupResponse.json();
                                    data.user.group = group;
                                }
                            } catch (groupError) {
                                console.error('Помилка отримання групи:', groupError);
                            }
                        }

                        console.log('Фінальні дані студента:', data.user);
                        setUserData(data.user);
                        return;
                    }
                }
            }

            // Якщо не вдалося отримати дані, використовуємо локальні
            setUserData({
                _id: userId,
                fullName: userInfo.fullName || userFullName,
                role: userInfo.role || 'student',
                group: userInfo.group || '9-А',
                email: userInfo.email || 'student@school.edu.ua',
                phone: userInfo.phone || '+380990000000',
                parentPhone: userInfo.parentPhone || '+380990000001',
                address: userInfo.address || 'м. Київ, вул. Шкільна, 1',
                birthDate: userInfo.birthDate || '2010-01-01',
                createdAt: new Date().toISOString()
            });

        } catch (error) {
            console.error('Помилка отримання даних:', error);
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            setUserData({
                fullName: userInfo.fullName || userFullName,
                role: userInfo.role || 'student',
                group: userInfo.group || '9-А',
                email: userInfo.email || 'student@school.edu.ua',
                phone: userInfo.phone || '+380990000000',
                parentPhone: userInfo.parentPhone || '+380990000001',
                address: userInfo.address || 'м. Київ, вул. Шкільна, 1',
                birthDate: userInfo.birthDate || '2010-01-01',
                createdAt: new Date().toISOString()
            });
        }
    };

    const fetchStudentStats = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const { databaseName: dbName, userId } = userInfo;

            if (dbName && userId) {
                // Отримуємо статистику успішності
                const statsResponse = await fetch(`/api/students/${userId}/stats?databaseName=${dbName}`);
                if (statsResponse.ok) {
                    const stats = await statsResponse.json();
                    setStudentStats(stats);
                }
            }
        } catch (error) {
            console.error('Помилка отримання статистики:', error);
            // Встановлюємо тестові дані для демонстрації
            setStudentStats({
                averageGrade: 8.5,
                totalAbsences: 3,
                completedHomework: 12,
                totalHomework: 15
            });
        }
    };

    const studentSections = [
        { name: t("student.sections.home"), icon: <FaHome /> },
        { name: t("student.sections.profile"), icon: <FaUserCircle /> },
        { name: t("student.sections.classmates"), icon: <FaUsers /> },
        { name: t("student.sections.schedule"), icon: <FaCalendarAlt /> },
        { name: t("student.sections.grades"), icon: <FaBook /> },
        { name: t("student.sections.homework"), icon: <FaTasks /> },
        { name: t("student.sections.progress"), icon: <FaChartLine /> }
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSectionClick = (sectionName) => {
        setActiveSection(sectionName);
        if (isMobile) {
            setIsMenuOpen(false);
        }
    };

    const renderStudentContent = () => {
        switch (activeSection) {
            case t("student.sections.home"):
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px', marginBottom: '20px' }}>
                            {t("student.dashboard.title")}
                        </h3>

                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '15px',
                            padding: '20px',
                            color: 'white',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>📊 {t("student.dashboard.myProgress")}</h4>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                                        {studentStats.averageGrade || '—'}
                                    </div>
                                    <div>{t("student.dashboard.averageGrade")}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                                        {studentStats.completedHomework}/{studentStats.totalHomework}
                                    </div>
                                    <div>{t("student.dashboard.homeworkCompleted")}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                                        {studentStats.totalAbsences}
                                    </div>
                                    <div>{t("student.dashboard.absences")}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gap: '20px',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '10px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <h4 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaClock /> {t("student.dashboard.nextLesson")}
                                </h4>
                                <p style={{ margin: '10px 0', fontSize: '16px', fontWeight: 'bold' }}>
                                    {t("student.dashboard.math")}
                                </p>
                                <p style={{ margin: '5px 0', color: '#666' }}>
                                    {t("student.dashboard.time")}: 10:30 - 11:15
                                </p>
                                <p style={{ margin: '5px 0', color: '#666' }}>
                                    {t("student.dashboard.room")}: 205
                                </p>
                            </div>

                            <div style={{
                                padding: '20px',
                                backgroundColor: '#fef3c7',
                                borderRadius: '10px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <h4 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaExclamationTriangle /> {t("student.dashboard.upcomingDeadlines")}
                                </h4>
                                <div>
                                    <p style={{ margin: '10px 0' }}>
                                        <strong>{t("student.dashboard.mathHomework")}</strong>
                                        <br />
                                        {t("student.dashboard.dueDate")}: 15.03.2024
                                    </p>
                                    <p style={{ margin: '10px 0' }}>
                                        <strong>{t("student.dashboard.essay")}</strong>
                                        <br />
                                        {t("student.dashboard.dueDate")}: 17.03.2024
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '20px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <h4 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaComments /> {t("student.dashboard.announcements")}
                            </h4>
                            <div>
                                <p style={{ margin: '10px 0' }}>
                                    <strong>{t("student.dashboard.schoolEvent")}</strong>
                                    <br />
                                    {t("student.dashboard.eventDescription")}
                                </p>
                                <p style={{ margin: '10px 0' }}>
                                    <strong>{t("student.dashboard.parentMeeting")}</strong>
                                    <br />
                                    {t("student.dashboard.meetingDate")}: 20.03.2024
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case t("student.sections.profile"):
                return userData ? <StudentProfile userData={userData} isMobile={isMobile} /> : <div>{t("common.loading")}</div>;

            case t("student.sections.classmates"):
                return <ClassmatesTab databaseName={databaseName} userData={userData} isMobile={isMobile} />;

            case t("student.sections.schedule"):
                return <StudentScheduleTab databaseName={databaseName} userData={userData} isMobile={isMobile} />;

            case t("student.sections.grades"):
                return <GradesTab databaseName={databaseName} userData={userData} isMobile={isMobile} />;

            case t("student.sections.homework"):
                return <HomeworkTab databaseName={databaseName} userData={userData} isMobile={isMobile} />;

            case t("student.sections.progress"):
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px', marginBottom: '20px' }}>
                            {t("student.progress.title")}
                        </h3>

                        <div style={{
                            padding: '20px',
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                            marginBottom: '20px'
                        }}>
                            <h4>{t("student.progress.performanceBySubjects")}</h4>
                            <div style={{ marginTop: '15px' }}>
                                {[
                                    { subject: t("student.subjects.math"), grade: 9.2, color: '#4caf50' },
                                    { subject: t("student.subjects.ukrainian"), grade: 8.7, color: '#2196f3' },
                                    { subject: t("student.subjects.english"), grade: 9.5, color: '#ff9800' },
                                    { subject: t("student.subjects.history"), grade: 8.9, color: '#9c27b0' },
                                    { subject: t("student.subjects.physics"), grade: 7.8, color: '#f44336' }
                                ].map((item, index) => (
                                    <div key={index} style={{ marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <span>{item.subject}</span>
                                            <span style={{ fontWeight: 'bold' }}>{item.grade}</span>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '8px',
                                            backgroundColor: '#e0e0e0',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${(item.grade / 12) * 100}%`,
                                                height: '100%',
                                                backgroundColor: item.color,
                                                borderRadius: '4px'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            padding: '20px',
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <h4>{t("student.progress.attendance")}</h4>
                            <div style={{ marginTop: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span>{t("student.progress.present")}</span>
                                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>87%</span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    backgroundColor: '#e0e0e0',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: '87%',
                                        height: '100%',
                                        backgroundColor: '#4caf50',
                                        borderRadius: '4px'
                                    }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', marginBottom: '10px' }}>
                                    <span>{t("student.progress.absent")}</span>
                                    <span style={{ color: '#f44336', fontWeight: 'bold' }}>13%</span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    backgroundColor: '#e0e0e0',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: '13%',
                                        height: '100%',
                                        backgroundColor: '#f44336',
                                        borderRadius: '4px'
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>{t("student.welcome")}</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            {t("student.selectSection")}
                        </p>
                    </div>
                );
        }
    };

    const getHeaderTitle = () => {
        return activeSection;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <header style={{
                backgroundColor: 'rgba(105, 180, 185, 1)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: isMobile ? '12px 16px' : '16px 24px',
                position: 'relative',
                zIndex: 100
            }}>
                {isMobile && (
                    <button
                        onClick={toggleMenu}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '8px'
                        }}
                    >
                        {isMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                )}

                {!isMobile && (
                    <div>
                        <span style={{
                            fontSize: '18px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            padding: '4px 12px',
                            borderRadius: '9px'
                        }}>
                            {userFullName}
                        </span>
                    </div>
                )}

                <h1 style={{
                    margin: 0,
                    fontSize: isMobile ? '18px' : '24px',
                    fontWeight: '600',
                    textAlign: 'center',
                    flex: 1
                }}>
                    {getHeaderTitle()}
                </h1>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <LanguageSwitcher onLogout={onLogout} isLoginPage={false} />
                    <button
                        onClick={onLogout}
                        style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: isMobile ? '6px 12px' : '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: isMobile ? '14px' : '16px',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#db1a1aff';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#ef4444';
                        }}
                    >
                        {t("common.exit")}
                    </button>
                </div>
            </header>

            <div style={{
                display: 'flex',
                flex: 1,
                position: 'relative'
            }}>
                <aside style={{
                    width: isMobile ? (isMenuOpen ? '260px' : '0') : '270px',
                    backgroundColor: '#f9fafb',
                    borderRight: '1px solid #e5e7eb',
                    padding: isMobile ? (isMenuOpen ? '18px' : '0') : '18px',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    position: isMobile ? 'absolute' : 'relative',
                    left: isMobile ? '0' : 'auto',
                    top: isMobile ? '0' : 'auto',
                    height: isMobile ? '100%' : 'auto',
                    zIndex: 90,
                    boxShadow: isMobile && isMenuOpen ? '2px 0 8px rgba(0,0,0,0.1)' : 'none'
                }}>
                    {(!isMobile || isMenuOpen) && (
                        <>
                            <h2 style={{
                                fontSize: isMobile ? '17px' : '20px',
                                fontWeight: 'bold',
                                marginBottom: '18px',
                                color: '#374151'
                            }}>
                                {t("student.menuTitle")}
                            </h2>
                            <ul style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                listStyle: 'none',
                                padding: 0,
                                margin: 0
                            }}>
                                {studentSections.map((section) => (
                                    <li key={section.name}>
                                        <button
                                            onClick={() => handleSectionClick(section.name)}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: isMobile ? '12px 14px' : '10px 14px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                backgroundColor: activeSection === section.name ? 'rgba(105, 180, 185, 1)' : 'transparent',
                                                color: activeSection === section.name ? 'white' : '#374151',
                                                fontWeight: activeSection === section.name ? '600' : 'normal',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                fontSize: isMobile ? '15px' : '18px'
                                            }}
                                            onMouseOver={(e) => {
                                                if (activeSection !== section.name) {
                                                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                if (activeSection !== section.name) {
                                                    e.target.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            <span style={{ fontSize: isMobile ? '15px' : '18px' }}>
                                                {section.icon}
                                            </span>
                                            {section.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </aside>

                {isMobile && isMenuOpen && (
                    <div
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 80
                        }}
                    />
                )}

                <main style={{
                    flex: 1,
                    padding: isMobile ? '16px' : '24px',
                    backgroundColor: 'white',
                    overflowY: 'auto'
                }}>
                    {renderStudentContent()}
                </main>
            </div>
        </div>
    );
};

export default StudentPage;