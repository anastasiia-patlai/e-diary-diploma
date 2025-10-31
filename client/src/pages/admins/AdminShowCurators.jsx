import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaChalkboardTeacher, FaPlus, FaTimes, FaSort, FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";

const AdminShowCurators = () => {
    const [groups, setGroups] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCuratorPopup, setShowCuratorPopup] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const fetchGroups = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/groups");
            setGroups(response.data);
            setLoading(false);
        } catch (err) {
            setError("Помилка завантаження груп");
            setLoading(false);
            console.error("Помилка завантаження груп:", err);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/users/teachers");
            setTeachers(response.data);
        } catch (err) {
            console.error("Помилка завантаження викладачів:", err);
        }
    };

    useEffect(() => {
        fetchGroups();
        fetchTeachers();
    }, []);

    const handleAddCurator = (group) => {
        setSelectedGroup(group);
        setShowCuratorPopup(true);
    };

    const handleRemoveCurator = async (groupId) => {
        try {
            await axios.delete(`http://localhost:3001/api/groups/${groupId}/curator`);
            fetchGroups(); // Оновити список груп
        } catch (err) {
            console.error("Помилка видалення куратора:", err);
            alert("Помилка видалення куратора");
        }
    };

    const handleSelectCurator = async (teacherId) => {
        try {
            await axios.put(`http://localhost:3001/api/groups/${selectedGroup._id}/curator`, {
                curatorId: teacherId
            });
            setShowCuratorPopup(false);
            setSelectedGroup(null);
            fetchGroups(); // Оновити список груп
        } catch (err) {
            console.error("Помилка додавання куратора:", err);
            const errorMessage = err.response?.data?.error || "Помилка додавання куратора";
            alert(errorMessage);
        }
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    // Функція для сортування груп від молодшої до старшої (за номером групи)
    const sortGroups = (groups) => {
        return [...groups].sort((a, b) => {
            const getGroupNumber = (groupName) => {
                const match = groupName.match(/\d+/);
                return match ? parseInt(match[0]) : 0;
            };

            const numA = getGroupNumber(a.name);
            const numB = getGroupNumber(b.name);

            if (sortOrder === 'asc') {
                return numA - numB;
            } else {
                return numB - numA;
            }
        });
    };

    // Отримати список викладачів, які вже є кураторами
    const getBusyTeachers = () => {
        const busyTeacherIds = groups
            .filter(group => group.curator)
            .map(group => group.curator._id);

        return teachers.filter(teacher => busyTeacherIds.includes(teacher._id));
    };

    // Отримати список вільних викладачів
    const getAvailableTeachers = () => {
        const busyTeacherIds = groups
            .filter(group => group.curator)
            .map(group => group.curator._id);

        return teachers.filter(teacher => !busyTeacherIds.includes(teacher._id));
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Завантаження груп з кураторами...</p>
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

    const sortedGroups = sortGroups(groups);
    const groupsWithCurators = sortedGroups.filter(group => group.curator);
    const groupsWithoutCurators = sortedGroups.filter(group => !group.curator);

    const busyTeachers = getBusyTeachers();
    const availableTeachers = getAvailableTeachers();

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: 0 }}>Групи з кураторами</h3>
                <button
                    onClick={toggleSortOrder}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    <FaSort />
                    {sortOrder === 'asc' ? 'Від молодшої до старшої' : 'Від старшої до молодшої'}
                </button>
            </div>

            {/* Статистика */}
            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(105, 180, 185, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(105, 180, 185, 0.3)'
                }}>
                    <div style={{ fontWeight: '600', color: 'rgba(105, 180, 185, 1)' }}>Всього груп</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{groups.length}</div>
                </div>
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                    <div style={{ fontWeight: '600', color: 'rgba(34, 197, 94, 1)' }}>З кураторами</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{groupsWithCurators.length}</div>
                </div>
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(251, 146, 60, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(251, 146, 60, 0.3)'
                }}>
                    <div style={{ fontWeight: '600', color: 'rgba(251, 146, 60, 1)' }}>Без кураторів</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{groupsWithoutCurators.length}</div>
                </div>
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                    <div style={{ fontWeight: '600', color: 'rgba(59, 130, 246, 1)' }}>Вільних викладачів</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{availableTeachers.length}</div>
                </div>
            </div>

            {/* Групи з кураторами */}
            {groupsWithCurators.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ marginBottom: '15px', color: 'rgba(105, 180, 185, 1)' }}>
                        Групи з призначеними кураторами ({groupsWithCurators.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {groupsWithCurators.map(group => (
                            <div key={group._id} style={{
                                border: '2px solid rgba(105, 180, 185, 0.3)',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: '#f9fafb'
                            }}>
                                <div style={{
                                    backgroundColor: 'rgba(105, 180, 185, 0.1)',
                                    padding: '15px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: '18px', color: 'rgba(105, 180, 185, 1)' }}>
                                            {group.name}
                                        </h4>
                                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                                            Студентів: {group.students?.length || 0}
                                        </div>
                                    </div>

                                    {/* Інформація про куратора */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            backgroundColor: 'rgba(105, 180, 185, 0.2)',
                                            padding: '10px 15px',
                                            borderRadius: '6px'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(105, 180, 185, 0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'rgba(105, 180, 185, 1)'
                                            }}>
                                                <FaUser />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                                    {group.curator.fullName}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                    {group.curator.position}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                    {group.curator.email}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveCurator(group._id)}
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <FaTimes />
                                            Видалити
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Групи без кураторів */}
            {groupsWithoutCurators.length > 0 && (
                <div>
                    <h4 style={{ marginBottom: '15px', color: '#6b7280' }}>
                        Групи без кураторів ({groupsWithoutCurators.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {groupsWithoutCurators.map(group => (
                            <div key={group._id} style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: 'white'
                            }}>
                                <div style={{
                                    padding: '15px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '18px' }}>{group.name}</h4>
                                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                                            Студентів: {group.students?.length || 0}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleAddCurator(group)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            backgroundColor: 'rgba(105, 180, 185, 1)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <FaPlus />
                                        Призначити куратора
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {groups.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>Групи не знайдені</p>
                </div>
            )}

            {/* Попап вибору куратора - тепер показуємо тільки вільних викладачів */}
            {showCuratorPopup && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ margin: 0 }}>Оберіть куратора для {selectedGroup?.name}</h3>
                            <button
                                onClick={() => {
                                    setShowCuratorPopup(false);
                                    setSelectedGroup(null);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    color: '#6b7280'
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Вільні викладачі */}
                        {availableTeachers.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ marginBottom: '10px', color: 'rgba(34, 197, 94, 1)' }}>
                                    Вільні викладачі ({availableTeachers.length})
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {availableTeachers.map(teacher => (
                                        <div
                                            key={teacher._id}
                                            onClick={() => handleSelectCurator(teacher._id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px 15px',
                                                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.05)';
                                            }}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'rgba(34, 197, 94, 1)'
                                            }}>
                                                <FaUser />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                    {teacher.fullName}
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#6b7280',
                                                    marginBottom: '2px'
                                                }}>
                                                    {teacher.position}
                                                </div>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: '#6b7280'
                                                }}>
                                                    {teacher.email}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ЗАЙНЯТІ ВИКЛАДАЧІ */}
                        {busyTeachers.length > 0 && (
                            <div>
                                <h4 style={{ marginBottom: '10px', color: '#6b7280' }}>
                                    Викладачі вже з групами ({busyTeachers.length})
                                </h4>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    opacity: 0.6
                                }}>
                                    {busyTeachers.map(teacher => {
                                        const teacherGroup = groups.find(group =>
                                            group.curator && group.curator._id === teacher._id
                                        );
                                        return (
                                            <div
                                                key={teacher._id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '12px 15px',
                                                    backgroundColor: '#f9fafb',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e7eb'
                                                }}
                                            >
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#e5e7eb',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#6b7280'
                                                }}>
                                                    <FaUser />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                        {teacher.fullName}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        color: '#6b7280',
                                                        marginBottom: '2px'
                                                    }}>
                                                        {teacher.position}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '13px',
                                                        color: '#6b7280',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}>
                                                        <FaExclamationTriangle size={12} />
                                                        Куратор групи: {teacherGroup?.name || 'Невідомо'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {teachers.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                <p>Викладачі не знайдені</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShowCurators;