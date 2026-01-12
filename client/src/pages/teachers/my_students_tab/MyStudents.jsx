import React, { useState, useEffect } from "react";
import {
    FaUsers,
    FaUserGraduate,
    FaSearch,
    FaSortAlphaDown,
    FaSortAlphaDownAlt,
    FaSchool
} from "react-icons/fa";
import LoadingScreen from "./LoadingScreen";
import ErrorScreen from "./ErrorScreen";
import Header from "./Header";
import SearchPanel from "./SearchPanel";
import StudentsList from "./StudentsList";
import EmptyState from "./EmptyState";
import GlobalStyles from "./GlobalStyles";

const MyStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
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

                const response = await fetch(`/api/users/${userId}?databaseName=${encodeURIComponent(databaseName)}`);
                if (!response.ok) throw new Error('Не вдалося завантажити дані користувача');

                const userData = await response.json();
                setCurrentUser(userData);

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

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(student =>
                student.fullName?.toLowerCase().includes(term) ||
                student.email?.toLowerCase().includes(term) ||
                student.phone?.toLowerCase().includes(term) ||
                student.groupName?.toLowerCase().includes(term)
            );
        }

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

    if (loading) {
        return <LoadingScreen isMobile={isMobile} />;
    }

    if (error) {
        return <ErrorScreen error={error} />;
    }

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '16px' : '24px'
        }}>
            <Header
                userGroups={userGroups}
                studentsCount={students.length}
                isMobile={isMobile}
            />

            <SearchPanel
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortOrder={sortOrder}
                toggleSortOrder={toggleSortOrder}
                filteredStudentsCount={filteredStudents.length}
                isMobile={isMobile}
            />

            {filteredStudents.length > 0 ? (
                <StudentsList
                    filteredStudents={filteredStudents}
                    expandedStudent={expandedStudent}
                    toggleStudentExpansion={toggleStudentExpansion}
                    expandedParents={expandedParents}
                    toggleParentExpansion={toggleParentExpansion}
                    formatDate={formatDate}
                    sortOrder={sortOrder}
                    isMobile={isMobile}
                />
            ) : (
                <EmptyState
                    searchTerm={searchTerm}
                    userGroups={userGroups}
                    setSearchTerm={setSearchTerm}
                    isMobile={isMobile}
                />
            )}

            <GlobalStyles />
        </div>
    );
};

export default MyStudents;