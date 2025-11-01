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

    const fetchStats = async () => {
        try {
            setLoading(true);

            const [usersRes, studentsRes, teachersRes, parentsRes, groupsRes] = await Promise.all([
                axios.get("http://localhost:3001/api/users"),
                axios.get("http://localhost:3001/api/users/students"),
                axios.get("http://localhost:3001/api/users/teachers"),
                axios.get("http://localhost:3001/api/users/parents"),
                axios.get("http://localhost:3001/api/groups")
            ]);

            const uniqueSubjects = [...new Set(teachersRes.data.map(teacher => teacher.position).filter(Boolean))];

            setStats({
                totalUsers: usersRes.data.length,
                students: studentsRes.data.length,
                teachers: teachersRes.data.length,
                parents: parentsRes.data.length,
                groups: groupsRes.data.length,
                subjects: uniqueSubjects.length
            });

            setLoading(false);
        } catch (err) {
            setError("Помилка завантаження статистики");
            setLoading(false);
            console.error("Помилка завантаження статистики:", err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

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
            <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{
                    margin: '0 0 10px 0',
                    color: '#1f2937',
                    fontSize: '28px',
                    fontWeight: '700'
                }}>
                    Панель управління
                </h1>
                <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: '16px'
                }}>
                    Загальна статистика системи електронного щоденника
                </p>
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
                        Швидкі цифри
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid #f3f4f6'
                        }}>
                            <span style={{ color: '#6b7280' }}>Студентів на групу</span>
                            <span style={{ fontWeight: '600', color: '#1f2937' }}>
                                {stats.groups > 0 ? (stats.students / stats.groups).toFixed(1) : 0}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid #f3f4f6'
                        }}>
                            <span style={{ color: '#6b7280' }}>Відношення студент/викладач</span>
                            <span style={{ fontWeight: '600', color: '#1f2937' }}>
                                {stats.teachers > 0 ? (stats.students / stats.teachers).toFixed(1) : 0}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 0'
                        }}>
                            <span style={{ color: '#6b7280' }}>Студентів з батьками</span>
                            <span style={{ fontWeight: '600', color: '#1f2937' }}>
                                {stats.students > 0 ? Math.min(stats.parents, stats.students) : 0} / {stats.students}
                            </span>
                        </div>
                    </div>
                </div>

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