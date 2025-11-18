import React, { useState, useEffect } from 'react';
import { FaPlus } from "react-icons/fa";
import axios from "axios";

import ParentSearch from "./ParentSearch";
import ParentSort from "./ParentSort";
import ParentPagination from "./ParentPagination";
import ParentCard from "./ParentCard";
import CombinedParentCard from "./CombinedParentCard";
import AddChildPopup from "./AddChildPopup";
import AdminParentEdit from "./AdminParentEdit";
import AdminParentDelete from "./AdminParentDelete";

const AdminShowParent = () => {
    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showAddChildPopup, setShowAddChildPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [sortOrder, setSortOrder] = useState('asc');
    const [parentSearchQuery, setParentSearchQuery] = useState("");
    const [filteredParents, setFilteredParents] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    const API_URL = "http://localhost:3001/api/users";

    const fetchParents = async () => {
        try {
            const response = await axios.get(`${API_URL}/parents`);
            setParents(response.data);
            applyFilters(response.data, parentSearchQuery);
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

    // Функція для знаходження згрупованого батька
    const findGroupedParent = (parentId) => {
        const parent = parents.find(p => p._id === parentId);
        if (!parent || !parent.children || parent.children.length === 0) {
            return null;
        }

        // Шукаємо іншого батька, який має спільну дитину з поточним батьком
        for (const otherParent of parents) {
            if (otherParent._id === parentId || !otherParent.children || otherParent.children.length === 0) {
                continue;
            }

            // Перевіряємо, чи є спільна дитина
            const hasSharedChild = otherParent.children.some(child =>
                parent.children.some(c => c._id === child._id)
            );

            if (hasSharedChild) {
                return otherParent;
            }
        }

        return null;
    };

    const groupParentsBySharedChildren = (parentsList) => {
        const parentGroups = [];
        const processedParents = new Set();

        console.log('Всього батьків для обробки:', parentsList.length);

        parentsList.forEach(parent => {
            if (processedParents.has(parent._id)) {
                console.log(`Батька ${parent.fullName} вже оброблено, пропускаємо`);
                return;
            }

            if (!parent.children || parent.children.length === 0) {
                parentGroups.push([parent]);
                processedParents.add(parent._id);
                console.log(`Батько без дітей: ${parent.fullName} - додано окремо`);
                return;
            }

            const sharedParents = [parent];
            processedParents.add(parent._id);

            console.log(`Обробляємо батька: ${parent.fullName}`);
            console.log(`Кількість дітей: ${parent.children ? parent.children.length : 0}`);

            const currentParentChildrenIds = new Set(
                parent.children.map(child => child._id)
            );

            parentsList.forEach(otherParent => {
                if (otherParent._id === parent._id || processedParents.has(otherParent._id)) {
                    return;
                }

                if (!otherParent.children || otherParent.children.length === 0) {
                    return;
                }

                const hasSharedChild = otherParent.children.some(child =>
                    currentParentChildrenIds.has(child._id)
                );

                if (hasSharedChild) {
                    console.log(`Знайдено спільного батька: ${otherParent.fullName}`);
                    sharedParents.push(otherParent);
                    processedParents.add(otherParent._id);
                }
            });

            console.log(`Створено групу з ${sharedParents.length} батьків:`,
                sharedParents.map(p => p.fullName));
            parentGroups.push(sharedParents);
        });

        console.log(`Створено ${parentGroups.length} груп:`);
        parentGroups.forEach((group, index) => {
            console.log(`Група ${index + 1}: ${group.length} батьків -`,
                group.map(p => p.fullName));
        });

        return parentGroups;
    };

    const applyFilters = (parentsList, searchQuery = '') => {
        let filtered = parentsList;

        if (searchQuery.trim() !== '') {
            const searchLower = searchQuery.toLowerCase();
            filtered = filtered.filter(parent => {
                return (
                    parent.fullName?.toLowerCase().includes(searchLower) ||
                    parent.email?.toLowerCase().includes(searchLower) ||
                    parent.phone?.toLowerCase().includes(searchLower) ||
                    (parent.children && parent.children.some(child =>
                        child.fullName?.toLowerCase().includes(searchLower)
                    ))
                );
            });
        }

        console.log('Filtered parents:', filtered.length);
        setFilteredParents(filtered);
    };

    const handleParentSearch = (query) => {
        setParentSearchQuery(query);
        setCurrentPage(1);
        applyFilters(parents, query);
    };

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
    const parentGroups = groupParentsBySharedChildren(sortedParents);

    const totalItems = sortedParents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentParentGroups = parentGroups.slice(startIndex, endIndex);

    const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

    const handleEdit = (parent) => {
        setSelectedParent(parent);
        setShowEditPopup(true);
    };

    const handleUpdateParent = (updatedParent) => {
        const updatedParents = parents.map(p => p._id === updatedParent._id ? updatedParent : p);
        setParents(updatedParents);
        applyFilters(updatedParents, parentSearchQuery);
    };

    const handleDelete = (parent) => {
        setSelectedParent(parent);
        setShowDeletePopup(true);
    };

    const handleDeleteParent = (parentId) => {
        const updatedParents = parents.filter(p => p._id !== parentId);
        setParents(updatedParents);
        applyFilters(updatedParents, parentSearchQuery);
        if (currentParentGroups.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

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
            // Додаємо дитину до поточного батька
            await axios.put(`${API_URL}/${selectedParent._id}/add-child`, {
                childId: studentId
            });

            await axios.put(`${API_URL}/${studentId}/add-parent`, {
                parentId: selectedParent._id
            });

            // Шукаємо згрупованого батька
            const groupedParent = findGroupedParent(selectedParent._id);

            if (groupedParent) {
                console.log(`Знайдено згрупованого батька: ${groupedParent.fullName}`);

                // Перевіряємо, скільки батьків вже має дитина
                const studentResponse = await axios.get(`${API_URL}/${studentId}`);
                const currentStudent = studentResponse.data;

                if (currentStudent.parents && currentStudent.parents.length < 2) {
                    console.log('Додаємо другого батька автоматично...');

                    // Додаємо дитину до другого батька
                    await axios.put(`${API_URL}/${groupedParent._id}/add-child`, {
                        childId: studentId
                    });

                    // Додаємо другого батька до дитини
                    await axios.put(`${API_URL}/${studentId}/add-parent`, {
                        parentId: groupedParent._id
                    });

                    console.log('Другого батька успішно додано');
                } else {
                    console.log('Дитина вже має 2 батьків, пропускаємо автоматичне додавання');
                }
            }

            setShowAddChildPopup(false);
            setSelectedParent(null);
            setSearchQuery("");
            setSearchResults([]);

            await fetchParents();
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

            await axios.put(`${API_URL}/${childId}/remove-parent`, {
                parentId: parentId
            });

            await fetchParents();
        } catch (err) {
            console.error("Помилка видалення дитини:", err);
            alert("Помилка видалення дитини");
        }
    };

    const handleAddParentToChild = async (childId, parentId) => {
        try {
            console.log('Додаємо батька:', parentId, 'до дитини:', childId);

            const response = await axios.put(`${API_URL}/${childId}/add-parent`, {
                parentId: parentId
            });

            console.log('Відповідь від сервера:', response.data);

            if (response.data.parent) {
                console.log('Оновлений батько:', response.data.parent);
            }

            await fetchParents();

        } catch (err) {
            console.error("Помилка додавання батька:", err);
            console.error("Деталі помилки:", err.response?.data);
            alert(err.response?.data?.error || "Помилка додавання батька");
        }
    };

    const handleRemoveParentFromChild = async (childId, parentId) => {
        try {
            await axios.put(`${API_URL}/${childId}/remove-parent`, {
                parentId: parentId
            });

            await fetchParents();
        } catch (err) {
            console.error("Помилка видалення батька з дитини:", err);
            alert("Помилка видалення батька з дитини");
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
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'
                }}>
                    <h3 style={{ margin: 0 }}>Батьки ({filteredParents.length})</h3>
                    <ParentSort sortOrder={sortOrder} onSortToggle={handleSortToggle} />
                </div>
            </div>

            <ParentSearch
                searchQuery={parentSearchQuery}
                onSearchChange={handleParentSearch}
                filteredParentsCount={filteredParents.length}
            />

            {currentParentGroups.length === 0 ? (
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
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        marginBottom: '20px'
                    }}>
                        {currentParentGroups.map((parentGroup, index) => (
                            parentGroup.length === 1 ? (
                                <ParentCard
                                    key={parentGroup[0]._id}
                                    parent={parentGroup[0]}
                                    onAddChild={handleAddChild}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onRemoveChild={handleRemoveChild}
                                    onAddParentToChild={handleAddParentToChild}
                                    onRemoveParentFromChild={handleRemoveParentFromChild}
                                />
                            ) : (
                                <CombinedParentCard
                                    key={`group-${index}`}
                                    parents={parentGroup}
                                    onAddChild={handleAddChild}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onRemoveChild={handleRemoveChild}
                                    onAddParentToChild={handleAddParentToChild}
                                    onRemoveParentFromChild={handleRemoveParentFromChild}

                                />
                            )
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