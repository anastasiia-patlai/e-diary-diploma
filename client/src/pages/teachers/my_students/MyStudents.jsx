import React, { useState, useEffect } from "react";
import {
    FaUsers,
    FaUserGraduate,
    FaEnvelope,
    FaPhone,
    FaBirthdayCake,
    FaUserFriends,
    FaSearch,
    FaSort,
    FaSchool,
    FaCalendarAlt,
    FaChevronDown,
    FaChevronUp,
    FaUser,
    FaHome,
    FaComment,
    FaInfoCircle,
    FaBook,
    FaMapMarkerAlt,
    FaIdCard,
    FaUserShield,
    FaUsersSlash,
    FaSortAlphaDown,
    FaSortAlphaDownAlt
} from "react-icons/fa";

const MyStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("asc"); // "asc" або "desc"
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [userGroups, setUserGroups] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [expandedParents, setExpandedParents] = useState({});

    // Відслідковуємо зміну розміру вікна
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Завантаження даних поточного користувача
    useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                const { databaseName, userId } = userInfo;

                if (!databaseName || !userId) {
                    console.error("❌ Немає даних про користувача в localStorage");
                    setError("Не знайдено дані користувача");
                    setLoading(false);
                    return;
                }

                // Завантажуємо дані поточного вчителя
                const response = await fetch(`/api/users/${userId}?databaseName=${encodeURIComponent(databaseName)}`);
                if (!response.ok) throw new Error('Не вдалося завантажити дані користувача');

                const userData = await response.json();
                setCurrentUser(userData);

                // Завантажуємо групи, де вчитель є куратором
                await loadCuratorGroups(databaseName, userId);
            } catch (error) {
                console.error("❌ Помилка завантаження даних користувача:", error);
                setError("Не вдалося завантажити дані користувача");
                setLoading(false);
            }
        };

        loadCurrentUser();
    }, []);

    // Завантаження груп, де вчитель є куратором
    const loadCuratorGroups = async (databaseName, userId) => {
        try {
            const response = await fetch(`/api/groups?databaseName=${encodeURIComponent(databaseName)}`);
            if (!response.ok) throw new Error('Не вдалося завантажити групи');

            const allGroups = await response.json();
            const curatorGroups = allGroups.filter(group =>
                group.curator && group.curator._id === userId
            );

            setUserGroups(curatorGroups);

            // Завантажуємо студентів з цих груп
            if (curatorGroups.length > 0) {
                await loadStudents(databaseName, curatorGroups);
            } else {
                setStudents([]);
                setLoading(false);
            }
        } catch (error) {
            console.error("❌ Помилка завантаження груп:", error);
            setError("Не вдалося завантажити групи");
            setLoading(false);
        }
    };

    const loadStudents = async (databaseName, groups) => {
        try {
            const allStudents = [];

            for (const group of groups) {
                const response = await fetch(`/api/users/students?databaseName=${encodeURIComponent(databaseName)}`);
                if (!response.ok) continue;

                const students = await response.json();

                const groupStudents = students.filter(student =>
                    student.group && student.group._id === group._id
                ).map(student => {
                    let subgroupInfo = null;
                    if (group.hasSubgroups && group.subgroups && group.subgroups.length > 0) {
                        for (const subgroup of group.subgroups) {
                            if (subgroup.students && subgroup.students.length > 0) {
                                const isInSubgroup = subgroup.students.some(subStudent => {
                                    if (typeof subStudent === 'string') {
                                        return subStudent === student._id;
                                    } else if (subStudent && typeof subStudent === 'object') {
                                        return subStudent._id === student._id;
                                    }
                                    return false;
                                });

                                if (isInSubgroup) {
                                    subgroupInfo = {
                                        name: subgroup.name,
                                        order: subgroup.order,
                                        _id: subgroup._id
                                    };
                                    break;
                                }
                            }
                        }
                    }

                    return {
                        ...student,
                        groupName: group.name,
                        groupId: group._id,
                        groupCategory: group.category,
                        hasSubgroups: group.hasSubgroups || false,
                        subgroupInfo: subgroupInfo,
                        groupSubgroups: group.subgroups || []
                    };
                });

                allStudents.push(...groupStudents);
            }

            setStudents(allStudents);
            setError(null);
        } catch (error) {
            console.error("❌ Помилка завантаження студентів:", error);
            setError("Не вдалося завантажити студентів");
        } finally {
            setLoading(false);
        }
    };

    // Форматування дати
    const formatDate = (dateString) => {
        if (!dateString) return 'Не вказано';
        try {
            return new Date(dateString).toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Не вказано';
        }
    };

    // Фільтрація та сортування студентів
    const getFilteredAndSortedStudents = () => {
        let filtered = [...students];

        // Фільтрація за пошуком
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(student =>
                student.fullName?.toLowerCase().includes(term) ||
                student.email?.toLowerCase().includes(term) ||
                student.phone?.toLowerCase().includes(term) ||
                student.groupName?.toLowerCase().includes(term)
            );
        }

        // Сортування тільки за ПІБ
        filtered.sort((a, b) => {
            const nameA = a.fullName || '';
            const nameB = b.fullName || '';

            if (sortOrder === "asc") {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(nameA);
            }
        });

        return filtered;
    };

    const filteredStudents = getFilteredAndSortedStudents();

    // Обробка розгортання/згортання студента
    const toggleStudentExpansion = (studentId) => {
        setExpandedStudent(expandedStudent === studentId ? null : studentId);
    };

    // Обробка розгортання/згортання батька
    const toggleParentExpansion = (studentId, parentIndex) => {
        const key = `${studentId}_${parentIndex}`;
        setExpandedParents(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Перемикання порядку сортування
    const toggleSortOrder = () => {
        setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    };

    // Компонент інформаційного рядка в два стовпчики
    const InfoRow = ({ label, value, icon: Icon, compact = false }) => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: compact ? '1fr 1.5fr' : (isMobile ? '1fr' : '1fr 1.5fr'),
            gap: compact ? '12px' : '20px',
            padding: compact ? '8px 0' : '12px 0',
            borderBottom: compact ? 'none' : '1px solid #f3f4f6',
            alignItems: 'flex-start'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                {Icon && (
                    <div style={{
                        width: compact ? '28px' : '32px',
                        height: compact ? '28px' : '32px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Icon size={compact ? 14 : 16} color="rgba(105, 180, 185, 1)" />
                    </div>
                )}
                <span style={{
                    fontSize: compact ? '13px' : '14px',
                    color: '#6b7280',
                    fontWeight: '500',
                    flex: 1
                }}>
                    {label}
                </span>
            </div>
            <div style={{
                fontSize: compact ? '14px' : '15px',
                color: '#1f2937',
                fontWeight: '500',
                lineHeight: '1.4',
                wordBreak: 'break-word',
                paddingLeft: isMobile ? '0' : '10px'
            }}>
                {value || 'Не вказано'}
            </div>
        </div>
    );

    // Компонент секції інформації
    const InfoSection = ({ title, icon: Icon, children }) => (
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

    // Компонент для інформації про батьків з розгортанням
    const ParentInfo = ({ parent, index, studentId }) => {
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
                {/* КНОПКА ДЛЯ РОЗГОРНУТИ/ЗГОРНУТИ */}
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

                {/* ДЕТАЛЬНА ІНФОРМАЦІЯ ПРО БАТЬКА - В ОДИН СТОВПЧИК */}
                {isExpanded && (
                    <div style={{
                        padding: '20px',
                        backgroundColor: 'white',
                        animation: 'slideDownParent 0.3s ease-out',
                        paddingBottom: '0px',
                        paddingTop: '10px'
                    }}>
                        {/* ОСНОВНА ІНФОРМАЦІЯ ПРО БАТЬКА */}
                        <div style={{
                            marginBottom: '20px'
                        }}>
                            {/* ІНФОРМАЦІЯ В ОДИН СТОВПЧИК (як у учнів) */}
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
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid rgba(105, 180, 185, 0.1)',
                        borderTop: '4px solid rgba(105, 180, 185, 1)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }} />
                    <p>Завантаження даних про учнів...</p>
                </div>
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
                flexDirection: 'column',
                gap: '20px',
                textAlign: 'center',
                padding: '20px'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FaUserGraduate size={36} color="#ef4444" />
                </div>
                <h3 style={{ color: '#ef4444', margin: 0 }}>Помилка завантаження</h3>
                <p style={{ color: '#6b7280', maxWidth: '400px' }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}
                >
                    Спробувати знову
                </button>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '16px' : '24px'
        }}>
            {/* ЗАГОЛОВОК З НАЗВОЮ КЛАСУ В ОДНОМУ РЯДКУ */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '16px' : '0'
            }}>
                {/* ЛІВА ЧАСТИНА: "Мої учні" + назва класу */}
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

                {/* ПРАВА ЧАСТИНА: Кількість учнів */}
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
                        {students.length} учнів
                    </span>
                </div>
            </div>

            {/* ПАНЕЛЬ ПОШУКУ ТА СОРТУВАННЯ */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: '16px',
                    marginBottom: '20px'
                }}>
                    {/* ПОЛЕ ПОШУКУ */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <FaSearch style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#9ca3af'
                        }} />
                        <input
                            type="text"
                            placeholder="Пошук учня за ПІБ, телефоном"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                fontSize: isMobile ? '14px' : '16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(105, 180, 185, 1)'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>

                    {/* КНОПКА СОРТУВАННЯ */}
                    <div style={{ minWidth: isMobile ? '100%' : 'auto' }}>
                        <button
                            onClick={toggleSortOrder}
                            style={{
                                width: isMobile ? '100%' : 'auto',
                                padding: '12px 20px',
                                backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                color: 'rgba(105, 180, 185, 1)',
                                border: '1px solid rgba(105, 180, 185, 0.2)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: isMobile ? '14px' : '16px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                            }}
                        >
                            {sortOrder === "asc" ? (
                                <>
                                    <FaSortAlphaDown size={18} />
                                    За ПІБ (А-Я)
                                </>
                            ) : (
                                <>
                                    <FaSortAlphaDownAlt size={18} />
                                    За ПІБ (Я-А)
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ІНФОРМАЦІЯ ПРО РЕЗУЛЬТАТИ */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid #f3f4f6'
                }}>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        Знайдено: <strong style={{ color: '#1f2937' }}>{filteredStudents.length}</strong> учнів
                        {sortOrder === "asc" ? " (сортовано А-Я)" : " (сортовано Я-А)"}
                    </div>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: isMobile ? '14px' : '16px',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        >
                            Очистити пошук
                        </button>
                    )}
                </div>
            </div>

            {/* СПИСОК УЧНІВ */}
            {filteredStudents.length > 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                }}>
                    {/* ЗАГОЛОВОК ТАБЛИЦІ */}
                    <div style={{
                        display: isMobile ? 'none' : 'grid',
                        gridTemplateColumns: '3fr 2fr 1fr',
                        gap: '16px',
                        padding: '16px 24px',
                        backgroundColor: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '14px'
                    }}>
                        <div>Учень {sortOrder === "asc" ? "↑" : "↓"}</div>
                        <div>Група</div>
                        <div style={{ textAlign: 'right' }}>Деталі</div>
                    </div>

                    {/* СПИСОК УЧНІВ */}
                    <div>
                        {filteredStudents.map((student) => (
                            <div key={student._id} style={{
                                borderBottom: '1px solid #f3f4f6',
                                transition: 'background-color 0.2s'
                            }}>
                                {/* ОСНОВНИЙ РЯД */}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        justifyContent: isMobile ? 'flex-start' : 'space-between',
                                        alignItems: isMobile ? 'flex-start' : 'center',
                                        gap: isMobile ? '12px' : '16px',
                                        padding: isMobile ? '16px' : '16px 24px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => toggleStudentExpansion(student._id)}
                                    onMouseEnter={(e) => !isMobile && (e.currentTarget.style.backgroundColor = '#f9fafb')}
                                    onMouseLeave={(e) => !isMobile && (e.currentTarget.style.backgroundColor = 'white')}
                                >
                                    {/* ІНФОРМАЦІЯ ПРО УЧНЯ */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        flex: 1
                                    }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <FaUserGraduate color="rgba(105, 180, 185, 1)" size={20} />
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: '#1f2937',
                                                marginBottom: '4px'
                                            }}>
                                                {student.fullName}
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <FaEnvelope size={12} />
                                                {student.email || 'Email не вказано'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ГРУПА */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        minWidth: isMobile ? '100%' : '150px'
                                    }}>
                                        <FaSchool color="rgba(105, 180, 185, 1)" size={16} />
                                        <span style={{
                                            fontSize: '15px',
                                            color: '#1f2937',
                                            fontWeight: '500'
                                        }}>
                                            {student.groupName}
                                        </span>
                                    </div>

                                    {/* КНОПКА РОЗГОРНУТИ */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        gap: '8px',
                                        minWidth: isMobile ? '100%' : '120px'
                                    }}>
                                        <span style={{
                                            fontSize: '14px',
                                            color: 'rgba(105, 180, 185, 1)',
                                            fontWeight: '500'
                                        }}>
                                            {expandedStudent === student._id ? 'Згорнути' : 'Детальніше'}
                                        </span>
                                        {expandedStudent === student._id ? (
                                            <FaChevronUp color="rgba(105, 180, 185, 1)" />
                                        ) : (
                                            <FaChevronDown color="rgba(105, 180, 185, 1)" />
                                        )}
                                    </div>
                                </div>

                                {/* РОЗГОРНУТА ДЕТАЛЬНА ІНФОРМАЦІЯ В ДВА СТОВПЧИКИ */}
                                {expandedStudent === student._id && (
                                    <div style={{
                                        padding: '24px',
                                        backgroundColor: '#f9fafb',
                                        borderTop: '1px solid #e5e7eb',
                                        animation: 'slideDown 0.3s ease-out'
                                    }}>
                                        {/* ЗАГОЛОВОК ДЕТАЛЬНОЇ ІНФОРМАЦІЇ */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            marginBottom: '24px',
                                            paddingBottom: '16px',
                                            borderBottom: '2px solid rgba(105, 180, 185, 0.2)'
                                        }}>
                                            <FaInfoCircle size={20} color="rgba(105, 180, 185, 1)" />
                                            <h3 style={{
                                                margin: 0,
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                color: '#1f2937'
                                            }}>
                                                Детальна інформація про учня
                                            </h3>
                                        </div>

                                        {/* ОСНОВНА ІНФОРМАЦІЯ В ДВА СТОВПЧИКИ */}
                                        <InfoSection icon={FaUser} title="Основна інформація">
                                            <InfoRow
                                                label="ПІБ"
                                                value={student.fullName}
                                                icon={FaUser}
                                            />
                                            <InfoRow
                                                label="Дата народження"
                                                value={formatDate(student.dateOfBirth || student.birthDate)}
                                                icon={FaBirthdayCake}
                                            />
                                            <InfoRow
                                                label="Електронна пошта"
                                                value={student.email}
                                                icon={FaEnvelope}
                                            />
                                            <InfoRow
                                                label="Телефон"
                                                value={student.phone}
                                                icon={FaPhone}
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
                                                />
                                            )}
                                            <InfoRow
                                                label="Підгрупа"
                                                value={student.subgroupInfo ? student.subgroupInfo.name : 'Не вказано'}
                                                icon={student.subgroupInfo ? FaUserShield : FaUsersSlash}
                                            />
                                        </InfoSection>

                                        {/* ІНФОРМАЦІЯ ПРО БАТЬКІВ З РОЗГОРТАННЯМ */}
                                        {student.parents && student.parents.length > 0 ? (
                                            <InfoSection icon={FaUserFriends} title="Інформація про батьків">
                                                <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
                                                    Кількість батьків: <strong style={{ color: '#1f2937' }}>{student.parents.length}</strong>
                                                </div>

                                                {student.parents.map((parent, index) => (
                                                    <ParentInfo
                                                        key={parent._id || index}
                                                        parent={parent}
                                                        index={index}
                                                        studentId={student._id}
                                                    />
                                                ))}
                                            </InfoSection>
                                        ) : (
                                            <InfoSection icon={FaUserFriends} title="Інформація про батьків">
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '20px',
                                                    color: '#9ca3af',
                                                    fontSize: '14px'
                                                }}>
                                                    Інформація про батьків відсутня
                                                </div>
                                            </InfoSection>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 20px',
                    textAlign: 'center',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(105, 180, 185, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }}>
                        <FaUserGraduate size={48} color="rgba(105, 180, 185, 1)" />
                    </div>

                    <h3 style={{
                        fontSize: isMobile ? '20px' : '24px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '12px'
                    }}>
                        {searchTerm ? 'Учнів не знайдено' : 'Немає учнів'}
                    </h3>

                    <p style={{
                        fontSize: isMobile ? '14px' : '16px',
                        color: '#6b7280',
                        maxWidth: '500px',
                        marginBottom: '24px',
                        lineHeight: '1.5'
                    }}>
                        {searchTerm
                            ? 'Спробуйте змінити умови пошуку'
                            : userGroups.length === 0
                                ? 'Ви не є класним керівником/куратором жодної групи.'
                                : 'У групах, де ви є куратором, ще немає учнів.'}
                    </p>

                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: isMobile ? '14px' : '16px',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.backgroundColor = 'rgba(85, 160, 165, 1)'}
                            onMouseOut={(e) => e.target.backgroundColor = 'rgba(105, 180, 185, 1)'}
                        >
                            Очистити пошук
                        </button>
                    )}
                </div>
            )}

            {/* CSS ДЛЯ АНІМАЦІЇ */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes slideDown {
                    from {
                        max-height: 0;
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        max-height: 2000px;
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideDownParent {
                    from {
                        max-height: 0;
                        opacity: 0;
                        transform: translateY(-5px);
                    }
                    to {
                        max-height: 500px;
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @media (max-width: 768px) {
                    .student-row:hover {
                        background-color: white !important;
                    }
                    
                    input, select {
                        font-size: 14px !important;
                    }
                    
                    .info-row {
                        grid-template-columns: 1fr !important;
                        gap: 8px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MyStudents;