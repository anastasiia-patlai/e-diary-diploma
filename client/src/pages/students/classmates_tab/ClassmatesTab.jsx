import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaGraduationCap, FaUsers, FaCalendar, FaChalkboardTeacher } from "react-icons/fa";

const ClassmatesTab = ({ userData }) => {
    const { t } = useTranslation();
    const [classmates, setClassmates] = useState([]);
    const [classTeacher, setClassTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUserData, setCurrentUserData] = useState(userData);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width <= 768);
            setIsTablet(width <= 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Завантаження даних студента, однокласників та класного керівника
    useEffect(() => {
        const loadStudentData = async () => {
            if (!userData?.id) {
                setError(t('student.errors.noDataFound'));
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                const { databaseName } = userInfo;

                if (!databaseName) {
                    console.error("❌ Немає databaseName в localStorage");
                    setError(t('student.errors.noDatabase'));
                    setLoading(false);
                    return;
                }

                // Завантаження повних даних студента
                console.log("🔄 Завантаження повних даних студента...");
                const studentResponse = await fetch(`/api/users/${userData.id}?databaseName=${encodeURIComponent(databaseName)}`);
                const studentResult = await studentResponse.json();

                if (studentResponse.ok && studentResult) {
                    console.log("Повні дані студента завантажено:", studentResult);
                    setCurrentUserData(prev => ({
                        ...prev,
                        ...studentResult,
                        group: studentResult.group,
                        dateOfBirth: studentResult.dateOfBirth,
                        parents: studentResult.parents
                    }));

                    // Завантаження однокласників та класного керівника
                    await loadClassmatesAndTeacher(studentResult.group, databaseName);
                } else {
                    console.error("Помилка завантаження даних студента:", studentResult);
                    setError(t('student.errors.loadError'));
                }
            } catch (error) {
                console.error("Помилка завантаження даних студента:", error);
                setError(t('student.errors.loadError'));
            } finally {
                setLoading(false);
            }
        };

        loadStudentData();
    }, [userData?.id]);

    // Завантаження однокласників та класного керівника
    const loadClassmatesAndTeacher = async (group, databaseName) => {
        if (!group || !databaseName) {
            console.log("Немає групи або databaseName для завантаження");
            setClassmates([]);
            setClassTeacher(null);
            return;
        }

        try {
            // Отримуємо ID групи
            const groupId = typeof group === 'object' ? group._id : group;

            console.log("🔄 Завантаження даних для групи:", groupId);

            // Завантажуємо інформацію про групу
            const groupResponse = await fetch(`/api/groups/${groupId}?databaseName=${encodeURIComponent(databaseName)}`);
            const groupData = await groupResponse.json();

            if (groupResponse.ok && groupData) {
                // Завантажуємо дані класного керівника, якщо він є
                if (groupData.curator) {
                    const curatorId = typeof groupData.curator === 'object' ? groupData.curator._id : groupData.curator;
                    const teacherResponse = await fetch(`/api/users/${curatorId}?databaseName=${encodeURIComponent(databaseName)}`);
                    const teacherData = await teacherResponse.json();

                    if (teacherResponse.ok && teacherData) {
                        console.log("Класний керівник завантажений:", teacherData);
                        setClassTeacher(teacherData);
                    }
                }
            }

            // Завантажуємо всіх студентів для однокласників
            const studentsResponse = await fetch(`/api/users/students?databaseName=${encodeURIComponent(databaseName)}`);
            const allStudents = await studentsResponse.json();

            if (studentsResponse.ok && Array.isArray(allStudents)) {
                // Фільтруємо студентів з тією ж групою, виключаючи поточного студента
                const filteredClassmates = allStudents.filter(student => {
                    const studentGroupId = student.group?._id || student.group;
                    return studentGroupId === groupId && student._id !== userData.id;
                });

                console.log(`Знайдено ${filteredClassmates.length} однокласників`);
                setClassmates(filteredClassmates);
            } else {
                console.error("Помилка завантаження студентів:", allStudents);
                setClassmates([]);
            }
        } catch (error) {
            console.error("Помилка завантаження даних:", error);
            setClassmates([]);
            setClassTeacher(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return t('common.notSpecified');
        try {
            return new Date(dateString).toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return t('common.notSpecified');
        }
    };

    const getGroupDisplayName = (group) => {
        if (!group) return t('common.notSpecified');
        if (typeof group === 'object') {
            return group.name || t('common.notSpecified');
        }
        return group;
    };

    const getTeacherTypeDisplayName = (teacherType) => {
        const types = {
            'young': t('admin.users.teacher.types.young'),
            'middle': t('admin.users.teacher.types.middle'),
            'senior': t('admin.users.teacher.types.senior'),
            'middle-senior': t('admin.users.teacher.types.middleSenior'),
            'all': t('admin.users.teacher.types.all'),
            '': t('common.notSpecified')
        };
        return types[teacherType] || teacherType || t('common.notSpecified');
    };

    const getQualificationTranslation = (category) => {
        if (!category) return t('common.notSpecified');

        const qualificationMap = {
            'Вища категорія': t('admin.users.teacher.qualifications.highest'),
            'Перша категорія': t('admin.users.teacher.qualifications.first'),
            'Друга категорія': t('admin.users.teacher.qualifications.second'),
            'Спеціаліст': t('admin.users.teacher.qualifications.specialist'),
            'Молодший спеціаліст': t('admin.users.teacher.qualifications.juniorSpecialist'),
            'Без категорії': t('admin.users.teacher.qualifications.noCategory')
        };

        return qualificationMap[category] || category;
    };

    const useColumns = !isMobile && !isTablet;

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                fontSize: isMobile ? '16px' : '18px',
                color: '#666'
            }}>
                {t('common.loading')}
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                fontSize: isMobile ? '16px' : '18px',
                color: '#dc2626',
                textAlign: 'center',
                padding: '20px'
            }}>
                {error}
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: useColumns ? '1200px' : (isMobile ? '100%' : '900px'),
            margin: '0 auto',
            padding: isMobile ? '0 16px' : '0'
        }}>
            {/* Профіль класного керівника */}
            {classTeacher && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: isMobile ? '20px 16px' : '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e5e7eb',
                    marginBottom: '24px',
                    background: 'linear-gradient(135deg, rgba(105, 180, 185, 0.05) 0%, white 100%)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px'
                    }}>
                        <FaChalkboardTeacher size={isMobile ? 20 : 24} color="rgba(105, 180, 185, 1)" />
                        <h2 style={{
                            margin: 0,
                            fontSize: isMobile ? '18px' : '20px',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {t('student.classmates.classTeacher')}
                        </h2>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'center' : 'flex-start',
                        gap: isMobile ? '16px' : '20px'
                    }}>
                        <div style={{
                            width: isMobile ? '70px' : '80px',
                            height: isMobile ? '70px' : '80px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(105, 180, 185, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <FaChalkboardTeacher size={isMobile ? 28 : 36} color="rgba(105, 180, 185, 1)" />
                        </div>
                        <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: isMobile ? '18px' : '20px',
                                fontWeight: '600',
                                color: '#1f2937',
                                marginBottom: '8px'
                            }}>
                                {classTeacher.fullName}
                            </h3>
                            <div style={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: isMobile ? '8px' : '16px',
                                flexWrap: 'wrap',
                                justifyContent: isMobile ? 'center' : 'flex-start'
                            }}>
                                {classTeacher.phone && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <FaPhone size={12} color="rgba(105, 180, 185, 1)" />
                                        <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#6b7280' }}>
                                            {classTeacher.phone}
                                        </span>
                                    </div>
                                )}
                                {classTeacher.dateOfBirth && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <FaBirthdayCake size={12} color="rgba(105, 180, 185, 1)" />
                                        <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#6b7280' }}>
                                            {formatDate(classTeacher.dateOfBirth)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: isMobile ? '8px' : '16px',
                                flexWrap: 'wrap',
                                marginTop: '8px',
                                justifyContent: isMobile ? 'center' : 'flex-start'
                            }}>
                                {classTeacher.teacherType && (
                                    <div style={{
                                        display: 'inline-block',
                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: isMobile ? '12px' : '13px',
                                        color: 'rgba(105, 180, 185, 1)'
                                    }}>
                                        {getTeacherTypeDisplayName(classTeacher.teacherType)}
                                    </div>
                                )}
                                {classTeacher.category && (
                                    <div style={{
                                        display: 'inline-block',
                                        backgroundColor: '#fef2f2',
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: isMobile ? '12px' : '13px',
                                        color: '#dc2626'
                                    }}>
                                        {getQualificationTranslation(classTeacher.category)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Заголовок списку однокласників */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: isMobile ? '16px' : '20px',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <FaUsers size={isMobile ? 20 : 24} color="rgba(105, 180, 185, 1)" />
                    <h2 style={{
                        margin: 0,
                        fontSize: isMobile ? '20px' : '24px',
                        fontWeight: '600',
                        color: '#1f2937'
                    }}>
                        {t('student.classmates.title')}
                    </h2>
                </div>
                <div style={{
                    backgroundColor: 'rgba(105, 180, 185, 0.1)',
                    color: 'rgba(105, 180, 185, 1)',
                    padding: isMobile ? '6px 12px' : '8px 16px',
                    borderRadius: '20px',
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: '500'
                }}>
                    {classmates.length} {t('student.classmates.classmate')}
                    {classmates.length !== 1 ? 'ів' : ''}
                </div>
            </div>

            {/* Список однокласників */}
            {classmates.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: isMobile ? '40px 20px' : '60px 20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #e5e7eb'
                }}>
                    <FaUsers size={isMobile ? 48 : 64} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                    <h3 style={{ color: '#6b7280', marginBottom: '8px', fontSize: isMobile ? '18px' : '20px' }}>
                        {t('student.classmates.noResults')}
                    </h3>
                    <p style={{ color: '#9ca3af', fontSize: isMobile ? '14px' : '16px' }}>
                        {t('student.classmates.noClassmatesMessage')}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: isMobile ? '12px' : '16px'
                }}>
                    {classmates.map(classmate => (
                        <div
                            key={classmate._id}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{
                                padding: isMobile ? '16px' : '20px',
                                borderBottom: '1px solid #f3f4f6',
                                backgroundColor: '#f9fafb'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <div style={{
                                        width: isMobile ? '48px' : '56px',
                                        height: isMobile ? '48px' : '56px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <FaUser size={isMobile ? 20 : 24} color="rgba(105, 180, 185, 1)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{
                                            margin: 0,
                                            fontSize: isMobile ? '16px' : '18px',
                                            fontWeight: '600',
                                            color: '#1f2937'
                                        }}>
                                            {classmate.fullName}
                                        </h3>
                                        {classmate.group && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                marginTop: '4px'
                                            }}>
                                                <FaGraduationCap size={12} color="#9ca3af" />
                                                <span style={{
                                                    fontSize: isMobile ? '12px' : '13px',
                                                    color: '#6b7280'
                                                }}>
                                                    {typeof classmate.group === 'object' ? classmate.group.name : classmate.group}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                padding: isMobile ? '16px' : '20px'
                            }}>
                                {/* Телефон та дата народження в один рядок */}
                                {(classmate.phone || classmate.dateOfBirth) && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        flexWrap: 'wrap'
                                    }}>
                                        {classmate.phone && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <FaPhone size={14} color="rgba(105, 180, 185, 1)" />
                                                <span style={{
                                                    fontSize: isMobile ? '13px' : '14px',
                                                    color: '#6b7280'
                                                }}>
                                                    {classmate.phone}
                                                </span>
                                            </div>
                                        )}
                                        {classmate.dateOfBirth && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <FaBirthdayCake size={14} color="rgba(105, 180, 185, 1)" />
                                                <span style={{
                                                    fontSize: isMobile ? '13px' : '14px',
                                                    color: '#6b7280'
                                                }}>
                                                    {formatDate(classmate.dateOfBirth)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassmatesTab;