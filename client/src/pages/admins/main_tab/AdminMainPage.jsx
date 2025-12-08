import React, { useState, useEffect } from 'react';
import axios from "axios";
import { FaUsers, FaUserGraduate, FaChalkboardTeacher, FaUserFriends, FaUsersCog, FaBook } from "react-icons/fa";
import StatCard from './StatCard';

const AdminMainPage = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        students: 0,
        teachers: 0,
        parents: 0,
        groups: 0,
        subjects: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [databaseName, setDatabaseName] = useState("");

    useEffect(() => {
        // ОТРИМУЄМО databaseName З localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        setDatabaseName(userInfo.databaseName || '');
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);

            if (!databaseName) {
                setError("Не вдалося отримати інформацію про базу даних");
                setLoading(false);
                return;
            }

            // ОТРИМУЄМО ВСІХ КОРИСТУВАЧІВ І ФІЛЬТРУЄМО НА ФРОНТЕНДІ
            const [usersRes, groupsRes] = await Promise.all([
                axios.get(`http://localhost:3001/api/users?databaseName=${encodeURIComponent(databaseName)}`),
                axios.get(`http://localhost:3001/api/groups?databaseName=${encodeURIComponent(databaseName)}`)
            ]);

            const users = usersRes.data;

            // ФІЛЬТРУЄМО КОРИСТУВАЧІВ ЗА РОЛЯМИ
            const students = users.filter(user => user.role === 'student');
            const teachers = users.filter(user => user.role === 'teacher');
            const parents = users.filter(user => user.role === 'parent');

            // ОТРИМУЄМО УНІКАЛЬНІ ПРЕДМЕТИ З ПОСАД ВИКЛАДАЧІВ
            const teacherPositions = teachers.flatMap(teacher => {
                if (teacher.positions && teacher.positions.length > 0) {
                    return teacher.positions;
                }
                return teacher.position ? [teacher.position] : [];
            });
            const uniqueSubjects = [...new Set(teacherPositions.filter(Boolean))];

            setStats({
                totalUsers: users.length,
                students: students.length,
                teachers: teachers.length,
                parents: parents.length,
                groups: groupsRes.data.length,
                subjects: uniqueSubjects.length
            });

            setError("");
            setLoading(false);
        } catch (err) {
            console.error("Деталі помилки:", err);
            setError("Помилка завантаження статистики: " + (err.response?.data?.error || err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    useEffect(() => {
        if (databaseName) {
            fetchStats();
        }
    }, [databaseName]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p>Завантаження статистики...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                margin: '20px 0'
            }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Помилка завантаження</h3>
                <p style={{ margin: '0 0 20px 0' }}>{error}</p>
                <div style={{ marginBottom: '10px', fontSize: '14px', color: '#6b7280' }}>
                    DatabaseName: {databaseName || 'Не встановлено'}
                </div>
                <button
                    onClick={fetchStats}
                    style={{
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}
                >
                    Спробувати знову
                </button>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '15px', marginLeft: '5px' }}>
                <h1 style={{
                    margin: '0 0 0 0',
                    color: '#1f2937',
                    fontSize: '26px',
                    fontWeight: '500'
                }}>
                    Панель управління
                </h1>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <StatCard
                    title="Загальна кількість користувачів"
                    value={stats.totalUsers}
                    icon={<FaUsers />}
                    color="rgba(59, 130, 246, 1)"
                    backgroundColor="rgba(59, 130, 246, 0.1)"
                />
                <StatCard
                    title="Кількість студентів"
                    value={stats.students}
                    icon={<FaUserGraduate />}
                    color="rgba(16, 185, 129, 1)"
                    backgroundColor="rgba(16, 185, 129, 0.1)"
                />
                <StatCard
                    title="Кількість викладачів"
                    value={stats.teachers}
                    icon={<FaChalkboardTeacher />}
                    color="rgba(245, 158, 11, 1)"
                    backgroundColor="rgba(245, 158, 11, 0.1)"
                />
                <StatCard
                    title="Кількість батьків"
                    value={stats.parents}
                    icon={<FaUserFriends />}
                    color="rgba(139, 92, 246, 1)"
                    backgroundColor="rgba(139, 92, 246, 0.1)"
                />
                <StatCard
                    title="Кількість груп"
                    value={stats.groups}
                    icon={<FaUsersCog />}
                    color="rgba(236, 72, 153, 1)"
                    backgroundColor="rgba(236, 72, 153, 0.1)"
                />
                <StatCard
                    title="Активні предмети"
                    value={stats.subjects}
                    icon={<FaBook />}
                    color="rgba(105, 180, 185, 1)"
                    backgroundColor="rgba(105, 180, 185, 0.1)"
                />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '20px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <h3 style={{
                        margin: '0 0 20px 0',
                        color: '#1f2937',
                        fontSize: '18px',
                        fontWeight: '600'
                    }}>
                        Системна інформація
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid #f3f4f6'
                        }}>
                            <span style={{ color: '#6b7280' }}>Статус системи</span>
                            <span style={{
                                fontWeight: '600',
                                color: '#16a34a',
                                backgroundColor: '#f0fdf4',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '12px'
                            }}>
                                Активна
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid #f3f4f6'
                        }}>
                            <span style={{ color: '#6b7280' }}>Останнє оновлення</span>
                            <span style={{ fontWeight: '600', color: '#1f2937' }}>
                                {new Date().toLocaleString('uk-UA')}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid #f3f4f6'
                        }}>
                            <span style={{ color: '#6b7280' }}>База даних</span>
                            <span style={{
                                fontWeight: '600',
                                color: '#1f2937',
                                fontSize: '12px',
                                backgroundColor: '#f3f4f6',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'inline-block'
                            }}
                                title={databaseName}
                            >
                                {databaseName}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 0'
                        }}>
                            <span style={{ color: '#6b7280' }}>Версія системи</span>
                            <span style={{ fontWeight: '600', color: '#1f2937' }}>
                                v1.0.0
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMainPage;