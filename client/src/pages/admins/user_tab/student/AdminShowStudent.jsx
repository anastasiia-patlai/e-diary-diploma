import React, { useState, useEffect } from "react";
import axios from "axios";
import StudentHeader from "./StudentHeader";
import GroupsList from "./GroupsList";
import EditStudentPopup from "./EditStudentPopup";
import DeleteStudentPopup from "./DeleteStudentPopup";

const AdminShowStudent = ({ isMobile }) => {
    const [groups, setGroups] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [databaseName, setDatabaseName] = useState("");

    useEffect(() => {
        // ОТРИМУЄМО databaseName З localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        setDatabaseName(userInfo.databaseName || '');
    }, []);

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

    const fetchGroups = async () => {
        try {
            if (!databaseName) {
                setError("Не вдалося отримати інформацію про базу даних");
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:3001/api/groups?databaseName=${encodeURIComponent(databaseName)}`);
            const sortedGroups = sortGroups(response.data);
            setGroups(sortedGroups);
            setLoading(false);
            setError("");
        } catch (err) {
            console.error("Деталі помилки завантаження груп:", err);
            setError(`Помилка завантаження груп: ${err.response?.data?.error || err.message}`);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (databaseName) {
            fetchGroups();
        }
    }, [databaseName]);

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const toggleAllGroups = () => {
        const allExpanded = Object.values(expandedGroups).every(Boolean);
        const newExpandedState = {};
        groups.forEach(group => {
            newExpandedState[group._id] = !allExpanded;
        });
        setExpandedGroups(newExpandedState);
    };

    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setShowEditPopup(true);
    };

    const handleDeleteStudent = (student) => {
        setSelectedStudent(student);
        setShowDeletePopup(true);
    };

    const handleUpdateStudent = () => {
        fetchGroups();
        setShowEditPopup(false);
        setSelectedStudent(null);
    };

    const handleDeleteConfirm = () => {
        fetchGroups();
        setShowDeletePopup(false);
        setSelectedStudent(null);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: isMobile ? '40px 20px' : '20px' }}>
                <p style={{ fontSize: isMobile ? '16px' : '14px' }}>Завантаження груп...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                textAlign: 'center',
                padding: isMobile ? '30px 16px' : '20px',
                color: 'red',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                margin: isMobile ? '10px 0' : '20px'
            }}>
                <p style={{
                    margin: '0 0 10px 0',
                    fontSize: isMobile ? '15px' : '14px'
                }}>{error}</p>
                <div style={{
                    marginBottom: '10px',
                    fontSize: isMobile ? '12px' : '14px',
                    color: '#6b7280',
                    wordBreak: 'break-all',
                    padding: '8px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px'
                }}>
                    DatabaseName: {databaseName || 'Не встановлено'}
                </div>
                <button
                    onClick={fetchGroups}
                    style={{
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        padding: isMobile ? '12px 20px' : '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: isMobile ? '14px' : '12px',
                        minWidth: isMobile ? '140px' : 'auto',
                        minHeight: isMobile ? '44px' : 'auto'
                    }}
                >
                    Спробувати знову
                </button>
            </div>
        );
    }

    return (
        <div>
            <StudentHeader
                onToggleAll={toggleAllGroups}
                allExpanded={Object.values(expandedGroups).every(Boolean)}
                isMobile={isMobile}
            />

            <GroupsList
                groups={groups}
                expandedGroups={expandedGroups}
                onToggleGroup={toggleGroup}
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
                isMobile={isMobile}
            />

            {/* ПОПАП РЕДАГУВАННЯ */}
            {showEditPopup && selectedStudent && (
                <EditStudentPopup
                    student={selectedStudent}
                    databaseName={databaseName}
                    onClose={() => {
                        setShowEditPopup(false);
                        setSelectedStudent(null);
                    }}
                    onUpdate={handleUpdateStudent}
                    isMobile={isMobile}
                />
            )}

            {/* ПОПАП ВИДАЛЕННЯ */}
            {showDeletePopup && selectedStudent && (
                <DeleteStudentPopup
                    student={selectedStudent}
                    databaseName={databaseName}
                    onClose={() => {
                        setShowDeletePopup(false);
                        setSelectedStudent(null);
                    }}
                    onDelete={handleDeleteConfirm}
                    isMobile={isMobile}
                />
            )}
        </div>
    );
};

export default AdminShowStudent;