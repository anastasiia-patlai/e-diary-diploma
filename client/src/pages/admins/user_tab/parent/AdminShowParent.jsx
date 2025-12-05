import React, { useState, useEffect } from 'react';
import { FaArrowUp } from "react-icons/fa";
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
    const [databaseName, setDatabaseName] = useState("");

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
    const [itemsPerPage] = useState(10); // Змінено на 10 блоків на сторінку

    const [showScrollTop, setShowScrollTop] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const API_URL = "http://localhost:3001/api/users";

    useEffect(() => {
        const getDatabaseName = () => {
            let dbName = localStorage.getItem('databaseName');
            if (!dbName) {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        dbName = user.databaseName;
                    } catch (e) {
                        console.error("Помилка парсингу user:", e);
                    }
                }
            }
            if (!dbName) {
                const userInfoStr = localStorage.getItem('userInfo');
                if (userInfoStr) {
                    try {
                        const userInfo = JSON.parse(userInfoStr);
                        dbName = userInfo.databaseName;
                    } catch (e) {
                        console.error("Помилка парсингу userInfo:", e);
                    }
                }
            }
            return dbName;
        };

        const dbName = getDatabaseName();
        if (dbName) {
            setDatabaseName(dbName);
            console.log("Database name для запитів:", dbName);
        } else {
            console.error("Database name не знайдено!");
            setError("Не вдалося визначити базу даних школи");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const fetchParents = async () => {
        if (!databaseName) {
            console.error("Database name відсутній для запиту батьків");
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/parents`, {
                params: { databaseName }
            });
            setParents(response.data);
            applyFilters(response.data, parentSearchQuery);
            setLoading(false);
        } catch (err) {
            setError("Помилка завантаження батьків");
            setLoading(false);
            console.error("Помилка завантаження батьків:", err);

            if (err.response) {
                console.error("Статус помилки:", err.response.status);
                console.error("Дані помилки:", err.response.data);
            }
        }
    };

    const fetchStudents = async () => {
        if (!databaseName) return;

        try {
            const response = await axios.get(`${API_URL}/students`, {
                params: { databaseName }
            });
            setStudents(response.data);
        } catch (err) {
            console.error("Помилка завантаження студентів:", err);
        }
    };

    useEffect(() => {
        if (databaseName) {
            fetchParents();
            fetchStudents();
        }
    }, [databaseName]);

    const findGroupedParent = (parentId) => {
        const parent = parents.find(p => p._id === parentId);
        if (!parent || !parent.children || parent.children.length === 0) {
            return null;
        }

        for (const otherParent of parents) {
            if (otherParent._id === parentId || !otherParent.children || otherParent.children.length === 0) {
                continue;
            }

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

        parentsList.forEach(parent => {
            if (processedParents.has(parent._id)) {
                return;
            }

            if (!parent.children || parent.children.length === 0) {
                parentGroups.push([parent]);
                processedParents.add(parent._id);
                return;
            }

            const sharedParents = [parent];
            processedParents.add(parent._id);

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
                    sharedParents.push(otherParent);
                    processedParents.add(otherParent._id);
                }
            });

            parentGroups.push(sharedParents);
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
        if (!databaseName) {
            alert("Помилка: не вказано базу даних");
            return;
        }

        try {
            console.log("=== ДОДАВАННЯ ДИТИНИ ===");
            console.log("Database name:", databaseName);
            console.log("Parent ID:", selectedParent._id);
            console.log("Student ID:", studentId);

            await axios.put(`${API_URL}/${selectedParent._id}/add-child?databaseName=${encodeURIComponent(databaseName)}`, {
                childId: studentId
            });

            await axios.put(`${API_URL}/${studentId}/add-parent?databaseName=${encodeURIComponent(databaseName)}`, {
                parentId: selectedParent._id
            });

            const groupedParent = findGroupedParent(selectedParent._id);

            if (groupedParent) {
                console.log(`Знайдено згрупованого батька: ${groupedParent.fullName}`);

                const studentResponse = await axios.get(`${API_URL}/${studentId}?databaseName=${encodeURIComponent(databaseName)}`);
                const currentStudent = studentResponse.data;

                if (currentStudent.parents && currentStudent.parents.length < 2) {
                    console.log('Додаємо другого батька автоматично...');

                    await axios.put(`${API_URL}/${groupedParent._id}/add-child?databaseName=${encodeURIComponent(databaseName)}`, {
                        childId: studentId
                    });

                    await axios.put(`${API_URL}/${studentId}/add-parent?databaseName=${encodeURIComponent(databaseName)}`, {
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

            console.log("Дитю успішно додано!");
        } catch (err) {
            console.error("Помилка додавання дитини:", err);
            if (err.response) {
                console.error("Статус помилки:", err.response.status);
                console.error("Дані помилки:", err.response.data);
                console.error("URL запиту:", err.config.url);
                console.error("Метод запиту:", err.config.method);
            }
            alert(err.response?.data?.error || "Помилка додавання дитини");
        }
    };

    const handleRemoveChild = async (parentId, childId) => {
        if (!databaseName) return;

        try {
            await axios.put(`${API_URL}/${parentId}/remove-child?databaseName=${encodeURIComponent(databaseName)}`, {
                childId: childId
            });

            await axios.put(`${API_URL}/${childId}/remove-parent?databaseName=${encodeURIComponent(databaseName)}`, {
                parentId: parentId
            });

            await fetchParents();
        } catch (err) {
            console.error("Помилка видалення дитини:", err);
            alert("Помилка видалення дитини");
        }
    };

    const handleAddParentToChild = async (childId, parentId) => {
        if (!databaseName) return;

        try {
            const response = await axios.put(`${API_URL}/${childId}/add-parent?databaseName=${encodeURIComponent(databaseName)}`, {
                parentId: parentId
            });

            await fetchParents();
        } catch (err) {
            console.error("Помилка додавання батька:", err);
            alert(err.response?.data?.error || "Помилка додавання батька");
        }
    };

    const handleRemoveParentFromChild = async (childId, parentId) => {
        if (!databaseName) return;

        try {
            await axios.put(`${API_URL}/${childId}/remove-parent?databaseName=${encodeURIComponent(databaseName)}`, {
                parentId: parentId
            });

            await fetchParents();
        } catch (err) {
            console.error("Помилка видалення батька з дитини:", err);
            alert("Помилка видалення батька з дитини");
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isMobile = windowWidth < 768;

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                padding: isMobile ? '15px' : '20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <p>Завантаження батьків...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                textAlign: 'center',
                padding: isMobile ? '15px' : '20px',
                color: 'red',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div style={{
            padding: isMobile ? '10px' : '20px',
            maxWidth: '100%',
            overflowX: 'hidden',
            boxSizing: 'border-box'
        }}>
            {/* Заголовок з адаптивним стилем */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: isMobile ? '15px' : '20px',
                gap: isMobile ? '10px' : '0'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: isMobile ? '10px' : '0',
                    flexWrap: 'wrap'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: isMobile ? '18px' : '20px',
                        whiteSpace: 'nowrap'
                    }}>
                        Батьки ({filteredParents.length})
                    </h3>
                    <ParentSort sortOrder={sortOrder} onSortToggle={handleSortToggle} />
                </div>
            </div>

            <ParentSearch
                searchQuery={parentSearchQuery}
                onSearchChange={handleParentSearch}
                filteredParentsCount={filteredParents.length}
                isMobile={isMobile}
            />

            {currentParentGroups.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: isMobile ? '20px 15px' : '40px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #e5e7eb',
                    marginTop: isMobile ? '10px' : '20px'
                }}>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: isMobile ? '14px' : '16px' }}>
                        {parentSearchQuery
                            ? `Батьки за запитом "${parentSearchQuery}" не знайдені`
                            : 'Батьки не знайдені'
                        }
                    </p>
                </div>
            ) : (
                <>
                    {/* Контейнер для карток батьків - 10 блоків на сторінку */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: isMobile ? '12px' : '15px',
                        marginBottom: isMobile ? '15px' : '20px',
                        width: '100%'
                    }}>
                        {currentParentGroups.map((parentGroup, index) => (
                            parentGroup.length === 1 ? (
                                <ParentCard
                                    key={parentGroup[0]._id}
                                    parent={parentGroup[0]}
                                    databaseName={databaseName}
                                    onAddChild={handleAddChild}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onRemoveChild={handleRemoveChild}
                                    onAddParentToChild={handleAddParentToChild}
                                    onRemoveParentFromChild={handleRemoveParentFromChild}
                                    isMobile={isMobile}
                                />
                            ) : (
                                <CombinedParentCard
                                    key={`group-${index}`}
                                    parents={parentGroup}
                                    databaseName={databaseName}
                                    onAddChild={handleAddChild}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onRemoveChild={handleRemoveChild}
                                    onAddParentToChild={handleAddParentToChild}
                                    onRemoveParentFromChild={handleRemoveParentFromChild}
                                    isMobile={isMobile}
                                />
                            )
                        ))}
                    </div>

                    {/* Пагінація */}
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
                        isMobile={isMobile}
                    />
                </>
            )}

            {/* Попапи */}
            <AddChildPopup
                selectedParent={selectedParent}
                searchQuery={searchQuery}
                searchResults={searchResults}
                isSearching={isSearching}
                databaseName={databaseName}
                onClose={() => {
                    setShowAddChildPopup(false);
                    setSelectedParent(null);
                    setSearchQuery("");
                    setSearchResults([]);
                }}
                onSearchChange={handleSearch}
                onAddChild={handleAddChildToParent}
                isMobile={isMobile}
            />

            {showEditPopup && (
                <AdminParentEdit
                    parent={selectedParent}
                    databaseName={databaseName}
                    onClose={() => {
                        setShowEditPopup(false);
                        setSelectedParent(null);
                    }}
                    onUpdate={handleUpdateParent}
                    isMobile={isMobile}
                />
            )}

            {showDeletePopup && (
                <AdminParentDelete
                    parent={selectedParent}
                    databaseName={databaseName}
                    onClose={() => {
                        setShowDeletePopup(false);
                        setSelectedParent(null);
                    }}
                    onDelete={handleDeleteParent}
                    isMobile={isMobile}
                />
            )}

            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    style={{
                        position: 'fixed',
                        bottom: isMobile ? '20px' : '30px',
                        right: isMobile ? '20px' : '30px',
                        width: isMobile ? '45px' : '50px',
                        height: isMobile ? '45px' : '50px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: 999,
                        fontSize: isMobile ? '16px' : '18px',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <FaArrowUp />
                </button>
            )}
        </div>
    );
};

export default AdminShowParent;