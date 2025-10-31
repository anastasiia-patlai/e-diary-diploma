import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaUserFriends, FaChild, FaEdit, FaTrash, FaPlus, FaTimes, FaSearch } from "react-icons/fa";
import axios from "axios";
import AdminParentEdit from './AdminParentEdit';
import AdminParentDelete from './AdminParentDelete';

const AdminShowParents = () => {
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

    const API_URL = "http://localhost:3001/api/users";

    const fetchParents = async () => {
        try {
            const response = await axios.get(`${API_URL}/parents`);
            setParents(response.data);
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
            console.error("Деталі помилки:", err.response?.data);
        }
    };

    useEffect(() => {
        fetchParents();
        fetchStudents();
    }, []);

    // Функції для редагування
    const handleEdit = (parent) => {
        setSelectedParent(parent);
        setShowEditPopup(true);
    };

    const handleUpdateParent = (updatedParent) => {
        setParents(prev => prev.map(p =>
            p._id === updatedParent._id ? updatedParent : p
        ));
    };

    // Функції для видалення
    const handleDelete = (parent) => {
        setSelectedParent(parent);
        setShowDeletePopup(true);
    };

    const handleDeleteParent = (parentId) => {
        setParents(prev => prev.filter(p => p._id !== parentId));
    };

    // Функції для пошуку та додавання дітей
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
        if (window.confirm("Ви впевнені, що хочете видалити дитину з цього батька?")) {
            try {
                await axios.put(`${API_URL}/${parentId}/remove-child`, {
                    childId: childId
                });
                fetchParents();
            } catch (err) {
                console.error("Помилка видалення дитини:", err);
                alert("Помилка видалення дитини");
            }
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Завантаження батьків...</p>
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
                <h3 style={{ margin: 0 }}>Батьки</h3>
                <button
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
                    Додати батька
                </button>
            </div>

            {parents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Батьки не знайдені</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {parents.map(parent => (
                        <div key={parent._id} style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '20px',
                            backgroundColor: '#f9fafb'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '15px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(105, 180, 185, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'rgba(105, 180, 185, 1)'
                                    }}>
                                        <FaUserFriends />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                                            {parent.fullName}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '14px',
                                            color: '#6b7280'
                                        }}>
                                            <FaEnvelope size={12} />
                                            {parent.email}
                                        </div>
                                        {parent.phone && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                marginTop: '2px'
                                            }}>
                                                <FaPhone size={12} />
                                                {parent.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleAddChild(parent)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: 'rgba(105, 180, 185, 1)',
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
                                        <FaSearch />
                                        Знайти дитину
                                    </button>
                                    <button
                                        onClick={() => handleEdit(parent)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: 'rgba(105, 180, 185, 1)',
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
                                        <FaEdit />
                                        Редагувати
                                    </button>
                                    <button
                                        onClick={() => handleDelete(parent)}
                                        style={{
                                            padding: '6px 12px',
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
                                        <FaTrash />
                                        Видалити
                                    </button>
                                </div>
                            </div>

                            {/* Діти батька */}
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '10px'
                                }}>
                                    <div style={{
                                        fontWeight: '600',
                                        color: 'rgba(105, 180, 185, 1)'
                                    }}>
                                        Діти ({parent.children ? parent.children.length : 0})
                                    </div>
                                </div>

                                {parent.children && parent.children.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {parent.children.map(child => (
                                            <div key={child._id} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '8px 12px',
                                                backgroundColor: 'white',
                                                borderRadius: '6px',
                                                border: '1px solid #e5e7eb'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <FaChild style={{ color: 'rgba(105, 180, 185, 1)' }} />
                                                    <span style={{ fontWeight: '500' }}>{child.fullName}</span>
                                                    {child.group && (
                                                        <span style={{
                                                            fontSize: '12px',
                                                            color: '#6b7280',
                                                            backgroundColor: '#f3f4f6',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px'
                                                        }}>
                                                            {child.group.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveChild(parent._id, child._id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '11px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <FaTimes size={10} />
                                                    Видалити
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '20px',
                                        color: '#6b7280',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px dashed #e5e7eb'
                                    }}>
                                        <p>Дітей не додано</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Попап пошуку дитини */}
            {showAddChildPopup && selectedParent && (
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
                            <h3 style={{ margin: 0 }}>Знайти дитину для {selectedParent.fullName}</h3>
                            <button
                                onClick={() => {
                                    setShowAddChildPopup(false);
                                    setSelectedParent(null);
                                    setSearchQuery("");
                                    setSearchResults([]);
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

                        {/* Поле пошуку */}
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Введіть ім'я, email або назву групи (мінімум 3 символи)..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 45px 12px 15px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'rgba(105, 180, 185, 1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                    }}
                                />
                                <FaSearch
                                    style={{
                                        position: 'absolute',
                                        right: '15px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#6b7280'
                                    }}
                                />
                            </div>

                            {searchQuery.length > 0 && searchQuery.length < 3 && (
                                <div style={{
                                    fontSize: '12px',
                                    color: '#ef4444',
                                    marginTop: '5px'
                                }}>
                                    Введіть щонайменше 3 символи для пошуку
                                </div>
                            )}
                        </div>

                        {/* Результати пошуку */}
                        <div>
                            {isSearching && searchQuery.length >= 3 && (
                                <div style={{ marginBottom: '10px', fontSize: '14px', color: '#6b7280' }}>
                                    Знайдено: {searchResults.length} студентів
                                </div>
                            )}

                            {searchQuery.length >= 3 ? (
                                searchResults.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {searchResults.map(student => (
                                            <div
                                                key={student._id}
                                                onClick={() => handleAddChildToParent(student._id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '12px 15px',
                                                    backgroundColor: '#f9fafb',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e7eb',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                                }}
                                            >
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
                                                    <FaChild />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                        {student.fullName}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        color: '#6b7280',
                                                        marginBottom: '2px'
                                                    }}>
                                                        {student.email}
                                                    </div>
                                                    {student.group && (
                                                        <div style={{
                                                            fontSize: '13px',
                                                            color: '#6b7280'
                                                        }}>
                                                            Група: {student.group.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                        <p>Студентів за запитом "{searchQuery}" не знайдено</p>
                                        <p style={{ fontSize: '14px', marginTop: '8px' }}>
                                            Спробуйте змінити запит пошуку
                                        </p>
                                    </div>
                                )
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                    <p>Введіть запит для пошуку студентів</p>
                                    <p style={{ fontSize: '14px', marginTop: '8px' }}>
                                        Пошук працює за іменем, email або назвою групи
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Попап редагування батька */}
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

            {/* Попап видалення батька */}
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

export default AdminShowParents;