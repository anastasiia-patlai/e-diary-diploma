import React, { useState, useEffect } from "react";
import axios from "axios";
import StudentHeader from "./StudentHeader";
import GroupsList from "./GroupsList";
import EditStudentPopup from "./EditStudentPopup";
import DeleteStudentPopup from "./DeleteStudentPopup";

const AdminShowStudent = () => {
    const [groups, setGroups] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);

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

    useEffect(() => {
        fetchGroups();
    }, []);

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
            <StudentHeader
                onToggleAll={toggleAllGroups}
                allExpanded={Object.values(expandedGroups).every(Boolean)}
            />

            <GroupsList
                groups={groups}
                expandedGroups={expandedGroups}
                onToggleGroup={toggleGroup}
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
            />

            {/* ПОПАП РЕДАГУВАННЯ */}
            {showEditPopup && selectedStudent && (
                <EditStudentPopup
                    student={selectedStudent}
                    onClose={() => {
                        setShowEditPopup(false);
                        setSelectedStudent(null);
                    }}
                    onUpdate={handleUpdateStudent}
                />
            )}

            {/* ПОПАП ВИДАЛЕННЯ */}
            {showDeletePopup && selectedStudent && (
                <DeleteStudentPopup
                    student={selectedStudent}
                    onClose={() => {
                        setShowDeletePopup(false);
                        setSelectedStudent(null);
                    }}
                    onDelete={handleDeleteConfirm}
                />
            )}
        </div>
    );
};

export default AdminShowStudent;