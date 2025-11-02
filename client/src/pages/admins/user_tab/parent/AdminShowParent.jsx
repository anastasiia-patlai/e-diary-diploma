import React, { useState, useEffect } from 'react';
import { FaPlus } from "react-icons/fa";
import axios from "axios";

import ParentSearch from "./ParentSearch";
import ParentSort from "./ParentSort";
import ParentPagination from "./ParentPagination";
import ParentCard from "./ParentCard";
import AddChildPopup from "./AddChildPopup";
import AdminParentEdit from "./AdminParentEdit";
import AdminParentDelete from "./AdminParentDelete";

const AdminShowParent = () => {
    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // СТАНИ ДЛЯ МОДАЛЬНИХ ВІКОН
    const [showAddChildPopup, setShowAddChildPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);

    // СТАНИ ДЛЯ ПОШУКУ ДІТЕЙ
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // СТАНИ ДЛЯ СОРТУВАННЯ ТА ФІЛЬТРАЦІЇ
    const [sortOrder, setSortOrder] = useState('asc');
    const [parentSearchQuery, setParentSearchQuery] = useState("");
    const [filteredParents, setFilteredParents] = useState([]);

    // СТАНИ ДЛЯ ПАГІНАЦІЇ
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    const API_URL = "http://localhost:3001/api/users";

    // ФУНКЦІЇ ДЛЯ ОТРИМАННЯ ДАНИХ
    const fetchParents = async () => {
        try {
            const response = await axios.get(`${API_URL}/parents`);
            setParents(response.data);
            setFilteredParents(response.data);
            setLoading(false);
        } catch (err) {
            setError("Помилка завантаження батьків");
            setLoading(false);
            console.error("Помилка завантаження батьків:", err);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await axios.get(`${API_URL}/students`);
            setStudents(response.data);
        } catch (err) {
            console.error("Помилка завантаження студентів:", err);
        }
    };

    useEffect(() => {
        fetchParents();
        fetchStudents();
    }, []);

    // ДЛЯ ПОШУКУ БАТЬКІВ
    const handleParentSearch = (query) => {
        setParentSearchQuery(query);
        setCurrentPage(1);

        if (query.trim() === '') {
            setFilteredParents(parents);
            return;
        }

        const searchLower = query.toLowerCase();
        const filtered = parents.filter(parent => {
            return (
                parent.fullName?.toLowerCase().includes(searchLower) ||
                parent.email?.toLowerCase().includes(searchLower) ||
                parent.phone?.toLowerCase().includes(searchLower) ||
                (parent.children && parent.children.some(child =>
                    child.fullName?.toLowerCase().includes(searchLower)
                ))
            );
        });

        setFilteredParents(filtered);
    };

    // ДЯЛ СОРТУВАННЯ БАТЬКІВ
    const sortParents = (parentsArray, order) => {
        return [...parentsArray].sort((a, b) => {
            const nameA = a.fullName?.toLowerCase() || '';
            const nameB = b.fullName?.toLowerCase() || '';
            return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
    };

    const handleSortToggle = () => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
        setCurrentPage(1);
    };

    const sortedParents = sortParents(filteredParents, sortOrder);

    // РОЗРАХУНКИ ДЛЯ ПАГІНАЦІЇ
    const totalItems = sortedParents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentParents = sortedParents.slice(startIndex, endIndex);

    // ДДЯ ПАГІНАЦІЇ
    const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

    // УПРАВЛННЯ БАТЬКАМИ
    const handleEdit = (parent) => {
        setSelectedParent(parent);
        setShowEditPopup(true);
    };

    const handleUpdateParent = (updatedParent) => {
        setParents(prev => prev.map(p => p._id === updatedParent._id ? updatedParent : p));
        setFilteredParents(prev => prev.map(p => p._id === updatedParent._id ? updatedParent : p));
    };

    const handleDelete = (parent) => {
        setSelectedParent(parent);
        setShowDeletePopup(true);
    };

    const handleDeleteParent = (parentId) => {
        setParents(prev => prev.filter(p => p._id !== parentId));
        setFilteredParents(prev => prev.filter(p => p._id !== parentId));
        if (currentParents.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    // ПОШУК ТА ДОДАВАННЯ ДИТИНИ
    const handleSearch = (query) => {
        setSearchQuery(query);

        if (query.length < 3) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        const filteredStudents = students.filter(student => {
            const searchLower = query.toLowerCase();
            return (
                student.fullName?.toLowerCase().includes(searchLower) ||
                student.email?.toLowerCase().includes(searchLower) ||
                student.group?.name?.toLowerCase().includes(searchLower)
            );
        });

        const parentChildrenIds = selectedParent?.children ?
            selectedParent.children.map(child => child._id) : [];
        const availableStudents = filteredStudents.filter(student =>
            !parentChildrenIds.includes(student._id)
        );

        setSearchResults(availableStudents);
    };

    const handleAddChild = (parent) => {
        setSelectedParent(parent);
        setSearchQuery("");
        setSearchResults([]);
        setIsSearching(false);
        setShowAddChildPopup(true);
    };

    const handleAddChildToParent = async (studentId) => {
        try {
            await axios.put(`${API_URL}/${selectedParent._id}/add-child`, {
                childId: studentId
            });
            setShowAddChildPopup(false);
            setSelectedParent(null);
            setSearchQuery("");
            setSearchResults([]);
            fetchParents();
        } catch (err) {
            console.error("Помилка додавання дитини:", err);
            alert(err.response?.data?.error || "Помилка додавання дитини");
        }
    };

    const handleRemoveChild = async (parentId, childId) => {
        try {
            await axios.put(`${API_URL}/${parentId}/remove-child`, {
                childId: childId
            });
            fetchParents();
        } catch (err) {
            console.error("Помилка видалення дитини:", err);
            alert("Помилка видалення дитини");
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}><p>Завантаження батьків...</p></div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}><p>{error}</p></div>;
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h3 style={{ margin: 0 }}>Батьки</h3>
                    <ParentSort sortOrder={sortOrder} onSortToggle={handleSortToggle} />
                </div>
            </div>

            <ParentSearch
                searchQuery={parentSearchQuery}
                onSearchChange={handleParentSearch}
                filteredParentsCount={filteredParents.length}
            />

            {currentParents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>
                        {parentSearchQuery
                            ? `Батьки за запитом "${parentSearchQuery}" не знайдені`
                            : 'Батьки не знайдені'
                        }
                    </p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                        {currentParents.map(parent => (
                            <ParentCard
                                key={parent._id}
                                parent={parent}
                                onAddChild={handleAddChild}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onRemoveChild={handleRemoveChild}
                            />
                        ))}
                    </div>

                    <ParentPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        onPageChange={goToPage}
                        onFirstPage={goToFirstPage}
                        onLastPage={goToLastPage}
                        onPreviousPage={goToPreviousPage}
                        onNextPage={goToNextPage}
                    />
                </>
            )}

            <AddChildPopup
                selectedParent={selectedParent}
                searchQuery={searchQuery}
                searchResults={searchResults}
                isSearching={isSearching}
                onClose={() => {
                    setShowAddChildPopup(false);
                    setSelectedParent(null);
                    setSearchQuery("");
                    setSearchResults([]);
                }}
                onSearchChange={handleSearch}
                onAddChild={handleAddChildToParent}
            />

            {showEditPopup && (
                <AdminParentEdit
                    parent={selectedParent}
                    onClose={() => {
                        setShowEditPopup(false);
                        setSelectedParent(null);
                    }}
                    onUpdate={handleUpdateParent}
                />
            )}

            {showDeletePopup && (
                <AdminParentDelete
                    parent={selectedParent}
                    onClose={() => {
                        setShowDeletePopup(false);
                        setSelectedParent(null);
                    }}
                    onDelete={handleDeleteParent}
                />
            )}
        </div>
    );
};

export default AdminShowParent;