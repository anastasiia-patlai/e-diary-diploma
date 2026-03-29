import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    FaHome,
    FaBook,
    FaChalkboardTeacher,
    FaCalendarAlt,
    FaUserCheck,
    FaTasks,
    FaChartBar,
    FaComments,
    FaFileAlt,
    FaCog,
    FaUserCircle,
    FaDoorOpen,
    FaClock,
    FaBars,
    FaTimes,
    FaUsers,
    FaBookOpen,
    FaClipboardList,
    FaArrowLeft
} from "react-icons/fa";

// Імпорти
import TeacherInfo from "./teacher_info/TeacherInfo";
import MyStudents from "./my_students_tab/MyStudents";
import TeacherScheduleTab from "./schedule_tab/TeacherScheduleTab";
import JournalTab from './journal_tab/JournalTab';
import GradebookPage from './journal_tab/GradebookPage';
import AttendanceTab from "./attendance_tab/AttendanceTab";
import ClassAttendance from "./attendance_tab/ClassAttendance";
import LanguageSwitcher from "../../i18n/components/LanguageSwitcher";

const TeacherPage = ({ onLogout, userFullName }) => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState(t("teacher.sections.home"));
    const [showGradebook, setShowGradebook] = useState(false);
    const [activeGradebookSchedule, setActiveGradebookSchedule] = useState(null);
    const [curatorGroupId, setCuratorGroupId] = useState(null);
    const [userData, setUserData] = useState(null);
    const [databaseName, setDatabaseName] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        fetchUserData();

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

                        try {
                            const groupsResponse = await fetch(`/api/groups?databaseName=${dbName}`);
                            if (groupsResponse.ok) {
                                const groups = await groupsResponse.json();
                                console.log('Всі групи для перевірки куратора:', groups);

                                const curatorGroup = groups.find(g => {
                                    if (g.curator && typeof g.curator === 'object' && g.curator._id === userId) {
                                        return true;
                                    }
                                    if (g.curator && typeof g.curator === 'string' && g.curator === userId) {
                                        return true;
                                    }
                                    return false;
                                });

                                console.log('Знайдена група куратора:', curatorGroup);

                                if (curatorGroup) {
                                    data.user.curatorGroup = curatorGroup;
                                    setCuratorGroupId(curatorGroup._id);
                                }
                            }
                        } catch (groupError) {
                            console.error('Помилка отримання груп:', groupError);
                        }

                        console.log('Фінальні дані користувача:', data.user);
                        setUserData(data.user);
                        return;
                    }
                }
            }

            setUserData({
                _id: userId,
                fullName: userInfo.fullName || userFullName,
                role: userInfo.role || 'teacher',
                position: userInfo.position || t("teacher.defaults.position"),
                subject: userInfo.subject || t("teacher.defaults.subject"),
                email: userInfo.email || 'teacher@school.edu.ua',
                phone: userInfo.phone || '+380990000000',
                createdAt: new Date().toISOString()
            });

        } catch (error) {
            console.error('Помилка отримання даних:', error);

            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            setUserData({
                fullName: userInfo.fullName || userFullName,
                role: userInfo.role || 'teacher',
                position: userInfo.position || t("teacher.defaults.position"),
                subject: userInfo.subject || t("teacher.defaults.subject"),
                email: userInfo.email || 'teacher@school.edu.ua',
                phone: userInfo.phone || '+380990000000',
                createdAt: new Date().toISOString()
            });
        }
    };

    const handleOpenGradebook = (scheduleId) => {
        setActiveGradebookSchedule(scheduleId);
        setShowGradebook(true);
    };

    const handleCloseGradebook = () => {
        setShowGradebook(false);
        setActiveGradebookSchedule(null);
    };

    const teacherSections = [
        { name: t("teacher.sections.home"), icon: <FaHome /> },
        { name: t("teacher.sections.profile"), icon: <FaUserCircle /> },
        { name: t("teacher.sections.schedule"), icon: <FaCalendarAlt /> },
        { name: t("teacher.sections.journal"), icon: <FaBook /> },
        { name: t("teacher.sections.attendance"), icon: <FaUserCheck /> },
        // { name: t("teacher.sections.homework"), icon: <FaTasks /> },
        { name: t("teacher.sections.myStudents"), icon: <FaUsers /> },
        { name: t("teacher.sections.reports"), icon: <FaChartBar /> },
        { name: t("teacher.sections.tests"), icon: <FaClipboardList /> },
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSectionClick = (sectionName) => {
        setActiveSection(sectionName);
        setShowGradebook(false);
        setActiveGradebookSchedule(null);
        if (isMobile) {
            setIsMenuOpen(false);
        }
    };

    const renderTeacherContent = () => {
        if (showGradebook && activeGradebookSchedule) {
            return (
                <div>
                    <button
                        onClick={handleCloseGradebook}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'rgba(105, 180, 185, 1)',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '8px 0',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaArrowLeft />
                        {t("teacher.buttons.backToSchedule")}
                    </button>
                    <GradebookPage
                        scheduleId={activeGradebookSchedule}
                        databaseName={databaseName}
                        isMobile={isMobile}
                    />
                </div>
            );
        }

        switch (activeSection) {
            case t("teacher.sections.home"):
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>{t("teacher.dashboard.title")}</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            {t("teacher.dashboard.welcome")} {userData?.fullName || userFullName}!<br />
                            {t("teacher.dashboard.subject")}: {userData?.subject || t("teacher.defaults.subject")}
                        </p>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '10px',
                                flex: '1',
                                minWidth: '200px'
                            }}>
                                <h4 style={{ marginTop: 0 }}>{t("teacher.dashboard.upcomingLessons")}</h4>
                                <p>{t("teacher.dashboard.lessonExample")}</p>
                            </div>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f0fdf4',
                                borderRadius: '10px',
                                flex: '1',
                                minWidth: '200px'
                            }}>
                                <h4 style={{ marginTop: 0 }}>{t("teacher.dashboard.statistics")}</h4>
                                <p>{t("teacher.dashboard.studentsCount")}: 45</p>
                                <p>{t("teacher.dashboard.averageScore")}: 8.7</p>
                            </div>
                        </div>
                    </div>
                );

            case t("teacher.sections.profile"):
                return userData ? <TeacherInfo userData={userData} isMobile={isMobile} /> : <div>{t("common.loading")}</div>;

            case t("teacher.sections.schedule"):
                return (
                    <TeacherScheduleTab
                        onOpenGradebook={handleOpenGradebook}
                    />
                );

            case t("teacher.sections.journal"):
                return (
                    <JournalTab
                        databaseName={databaseName}
                        isMobile={isMobile}
                        onOpenGradebook={handleOpenGradebook}
                    />
                );

            case t("teacher.sections.attendance"):
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

                return (
                    <ClassAttendance
                        databaseName={databaseName}
                        isMobile={isMobile}
                        teacherId={userInfo.userId}
                        groupId={curatorGroupId || userData?.curatorGroup?._id}
                    />
                );

            // case t("teacher.sections.homework"):
            //     return (
            //         <div>
            //             <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>{t("teacher.homework.title")}</h3>
            //             <div style={{ marginTop: '20px' }}>
            //                 <button style={{
            //                     backgroundColor: 'rgba(105, 180, 185, 1)',
            //                     color: 'white',
            //                     padding: '10px 20px',
            //                     border: 'none',
            //                     borderRadius: '6px',
            //                     cursor: 'pointer',
            //                     marginBottom: '20px'
            //                 }}>
            //                     + {t("teacher.homework.createButton")}
            //                 </button>
            //                 <div style={{
            //                     display: 'grid',
            //                     gap: '15px',
            //                     gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
            //                 }}>
            //                     <div style={{
            //                         padding: '15px',
            //                         border: '1px solid #e5e7eb',
            //                         borderRadius: '8px'
            //                     }}>
            //                         <h4>{t("teacher.homework.mathExample")}</h4>
            //                         <p>{t("teacher.homework.classExample")}: 9А</p>
            //                         <p>{t("teacher.homework.deadline")}: 15.03.2024</p>
            //                     </div>
            //                 </div>
            //             </div>
            //         </div>
            //     );

            case t("teacher.sections.myStudents"):
                return <MyStudents databaseName={databaseName} />;

            case t("teacher.sections.reports"):
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>{t("teacher.reports.title")}</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                            gap: '20px',
                            marginTop: '20px'
                        }}>
                            <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                <h4>{t("teacher.reports.academicPerformance")}</h4>
                                <p>{t("teacher.reports.charts")}</p>
                            </div>
                            <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                <h4>{t("teacher.reports.attendance")}</h4>
                                <p>{t("teacher.reports.attendanceStats")}</p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div>
                        <h3 style={{ fontSize: isMobile ? '18px' : '24px' }}>{t("teacher.welcome")}</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            {t("teacher.selectSection")}
                        </p>
                    </div>
                );
        }
    };

    // Оновлюємо заголовок з локалізацією
    const getHeaderTitle = () => {
        if (showGradebook) return t("teacher.journal.title");
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
                    {getHeaderTitle()} {userData?.subject ? `(${userData.subject})` : ''}
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
                {!showGradebook && (
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
                                    {t("teacher.menuTitle")}
                                </h2>
                                <ul style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0
                                }}>
                                    {teacherSections.map((section) => (
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
                )}

                {isMobile && isMenuOpen && !showGradebook && (
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
                    {renderTeacherContent()}
                </main>
            </div>
        </div>
    );
};

export default TeacherPage;