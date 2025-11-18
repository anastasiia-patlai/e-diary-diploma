import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaUserFriends } from "react-icons/fa";
import axios from "axios";

const AddParentPopup = ({
    child,
    currentParent,
    onClose,
    onAddParent
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [allParents, setAllParents] = useState([]);

    const API_URL = "http://localhost:3001/api/users";

    useEffect(() => {
        fetchAllParents();
    }, []);

    const fetchAllParents = async () => {
        try {
            const response = await axios.get(`${API_URL}/parents`);
            setAllParents(response.data);
        } catch (err) {
            console.error("Помилка завантаження батьків:", err);
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

        const filteredParents = allParents.filter(parent => {
            const searchLower = query.toLowerCase();
            return (
                parent.fullName?.toLowerCase().includes(searchLower) ||
                parent.email?.toLowerCase().includes(searchLower) ||
                parent.phone?.toLowerCase().includes(searchLower)
            );
        });

        const currentParentIds = child.parents ? child.parents.map(p => p._id) : [];
        const availableParents = filteredParents.filter(parent =>
            parent._id !== currentParent._id && !currentParentIds.includes(parent._id)
        );

        setSearchResults(availableParents);
    };

    const handleAddParent = (parentId) => {
        onAddParent(child._id, parentId);
    };

    if (!child) return null;

    return (
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
                    <div>
                        <h3 style={{ margin: 0, marginBottom: '5px' }}>Додати батька для {child.fullName}</h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                            Поточний батько: {currentParent.fullName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
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

                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Введіть ім'я, email або телефон батька (мінімум 3 символи)..."
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

                <div>
                    {searchQuery.length >= 3 ? (
                        searchResults.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {searchResults.map(parent => (
                                    <div
                                        key={parent._id}
                                        onClick={() => handleAddParent(parent._id)}
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
                                            <FaUserFriends />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                {parent.fullName}
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                marginBottom: '2px'
                                            }}>
                                                {parent.email}
                                            </div>
                                            {parent.phone && (
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: '#6b7280'
                                                }}>
                                                    Телефон: {parent.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                <p>Батьків за запитом "{searchQuery}" не знайдено</p>
                            </div>
                        )
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                            <p>Введіть запит для пошуку батьків</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddParentPopup;