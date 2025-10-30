import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaUser, FaEnvelope } from "react-icons/fa";
import axios from "axios";

const AdminShowStudent = () => {
    const [groups, setGroups] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const sortGroups = (groups) => {
        return groups.sort((a, b) => {
            const extractNumbers = (str) => {
                const matches = str.match(/\d+/g);
                return matches ? parseInt(matches.join('')) : 0;
            };

            const numA = extractNumbers(a.name);
            const numB = extractNumbers(b.name);

            if (numA !== numB) {
                return numA - numB;
            }

            return a.name.localeCompare(b.name);
        });
    };

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get("http://localhost:3001/api/groups");
                const sortedGroups = sortGroups(response.data);
                setGroups(sortedGroups);
                setLoading(false);
            } catch (err) {
                setError("Помилка завантаження груп");
                setLoading(false);
                console.error("Помилка завантаження груп:", err);
            }
        };

        fetchGroups();
    }, []);

    // РОЗГОРТАННЯ/ЗГОРТАННЯ ОДНІЄЇ ГРУПИ
    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    // РОЗГОРТАННЯ/ЗГОРТАННЯ ВСІХ ГРУПИ
    const toggleAllGroups = () => {
        const allExpanded = Object.values(expandedGroups).every(Boolean);
        const newExpandedState = {};
        groups.forEach(group => {
            newExpandedState[group._id] = !allExpanded;
        });
        setExpandedGroups(newExpandedState);
    };

    // ШКОЛА ЧИ УНІВЕР
    const getGroupType = (groupName) => {
        const lowerName = groupName.toLowerCase();
        if (lowerName.includes('а') || lowerName.includes('б') || lowerName.includes('в') ||
            lowerName.includes('г') || lowerName.match(/\d+-[абвг]/i)) {
            return 'school';
        }
        return 'university';
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Завантаження груп...</p>
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
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h3>Список студентів за групами</h3>
                <button
                    onClick={toggleAllGroups}
                    style={{
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    {Object.values(expandedGroups).every(Boolean) ? 'Згорнути всі' : 'Розгорнути всі'}
                </button>
            </div>

            {groups.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Групи не знайдені</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {groups.map(group => {
                        const groupType = getGroupType(group.name);
                        return (
                            <div key={group._id} style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                {/* НАЗВА ГРУПИ */}
                                <div
                                    style={{
                                        backgroundColor: expandedGroups[group._id] ? 'rgba(105, 180, 185, 0.1)' : '#f9fafb',
                                        padding: '15px 20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'background-color 0.3s ease'
                                    }}
                                    onClick={() => toggleGroup(group._id)}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.2)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = expandedGroups[group._id] ? 'rgba(105, 180, 185, 0.1)' : '#f9fafb';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{
                                            fontWeight: '600',
                                            fontSize: '16px',
                                        }}>
                                            {group.name}
                                        </span>
                                        {group.curator && (
                                            <span style={{
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                backgroundColor: 'rgba(105, 180, 185, 0.2)',
                                                padding: '2px 8px',
                                                borderRadius: '12px'
                                            }}>
                                                Куратор: {group.curator.fullName}
                                            </span>
                                        )}
                                        <span style={{
                                            fontSize: '14px',
                                            color: '#6b7280',
                                            backgroundColor: '#f3f4f6',
                                            padding: '2px 8px',
                                            borderRadius: '12px'
                                        }}>
                                            Студентів: {group.students?.length || 0}
                                        </span>
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#6b7280',
                                            backgroundColor: groupType === 'school' ? '#fef2f2' : '#f0fdf4',
                                            padding: '2px 6px',
                                            borderRadius: '8px',
                                            border: `1px solid ${groupType === 'school' ? '#fecaca' : '#bbf7d0'}`
                                        }}>
                                            {groupType === 'school' ? 'Шкільний клас' : 'Університетська група'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {expandedGroups[group._id] ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>
                                </div>

                                {/* ВМІСТ ГРУПИ */}
                                {expandedGroups[group._id] && (
                                    <div style={{
                                        backgroundColor: 'white',
                                        padding: '20px',
                                        borderTop: '1px solid #e5e7eb'
                                    }}>
                                        {group.students && group.students.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {group.students.map(student => (
                                                    <div key={student._id} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '15px',
                                                        padding: '12px 15px',
                                                        backgroundColor: '#f9fafb',
                                                        borderRadius: '6px',
                                                        border: '1px solid #e5e7eb'
                                                    }}>
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'rgba(105, 180, 185, 0.2)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'rgba(105, 180, 185, 1)'
                                                        }}>
                                                            <FaUser />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                                {student.fullName}
                                                            </div>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                fontSize: '14px',
                                                                color: '#6b7280'
                                                            }}>
                                                                <FaEnvelope size={12} />
                                                                {student.email}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <button
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: 'rgba(105, 180, 185, 1)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px'
                                                                }}
                                                            >
                                                                Редагувати
                                                            </button>
                                                            <button
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: '#ef4444',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px'
                                                                }}
                                                            >
                                                                Видалити
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '20px',
                                                color: '#6b7280'
                                            }}>
                                                <p>У цій групі ще немає студентів</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminShowStudent;