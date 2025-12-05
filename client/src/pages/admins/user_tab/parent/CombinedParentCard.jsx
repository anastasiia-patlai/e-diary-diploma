import React, { useState } from 'react';
import {
    FaUserFriends, FaEnvelope, FaPhone, FaChild,
    FaSearch, FaEdit, FaTrash, FaUserPlus, FaUserMinus, FaTimes,
    FaEllipsisV
} from "react-icons/fa";
import DeleteChildPopup from './DeleteChildPopup';
import AddParentPopup from './AddParentPopup';
import RemoveParentChoicePopup from './RemoveParentChoicePopup';

const CombinedParentCard = ({
    parents,
    databaseName,
    onAddChild,
    onEdit,
    onDelete,
    onRemoveChild,
    onAddParentToChild,
    onRemoveParentFromChild,
    isMobile
}) => {
    const [showDeleteChildPopup, setShowDeleteChildPopup] = useState(false);
    const [showAddParentPopup, setShowAddParentPopup] = useState(false);
    const [childToDelete, setChildToDelete] = useState(null);
    const [selectedChild, setSelectedChild] = useState(null);
    const [showRemoveParentChoicePopup, setShowRemoveParentChoicePopup] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(null); // Зберігаємо ID батька, для якого відкрито меню

    const openDeleteChildConfirmation = (child) => {
        setChildToDelete(child);
        setShowDeleteChildPopup(true);
    };

    const closeDeleteChildConfirmation = () => {
        setShowDeleteChildPopup(false);
        setChildToDelete(null);
    };

    const openAddParentPopup = (child) => {
        setSelectedChild(child);
        setShowAddParentPopup(true);
    };

    const closeAddParentPopup = () => {
        setShowAddParentPopup(false);
        setSelectedChild(null);
    };

    const handleDeleteConfirm = (childId) => {
        onRemoveChild(parents[0]._id, childId);
        closeDeleteChildConfirmation();
    };

    const handleAddParentConfirm = (childId, parentId) => {
        onAddParentToChild(childId, parentId);
        closeAddParentPopup();
    };

    const openRemoveParentChoicePopup = (child) => {
        setSelectedChild(child);
        setShowRemoveParentChoicePopup(true);
    };

    const closeRemoveParentChoicePopup = () => {
        setShowRemoveParentChoicePopup(false);
        setSelectedChild(null);
    };

    const handleRemoveParent = (childId, parentId) => {
        onRemoveParentFromChild(childId, parentId);
        closeRemoveParentChoicePopup();
    };

    const handleRemoveBothParents = async (childId) => {
        try {
            const allChildren = getAllChildren();
            const child = allChildren.find(c => c._id === childId);
            if (child && child.parents) {
                for (const p of child.parents) {
                    await onRemoveParentFromChild(childId, p._id);
                }
            }
            closeRemoveParentChoicePopup();
        } catch (error) {
            console.error('Помилка видалення батьків:', error);
            alert('Помилка при видаленні батьків');
        }
    };

    const getAllChildren = () => {
        const allChildren = [];
        const childIds = new Set();

        parents.forEach(parent => {
            if (parent.children) {
                parent.children.forEach(child => {
                    if (!childIds.has(child._id)) {
                        childIds.add(child._id);
                        allChildren.push(child);
                    }
                });
            }
        });

        return allChildren;
    };

    const allChildren = getAllChildren();

    return (
        <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            marginBottom: isMobile ? '15px' : '20px',
            overflow: 'hidden',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* БАТЬКИ ГРУПОВАНІ */}
            <div style={{
                padding: isMobile ? '15px' : '20px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f8fafc'
            }}>
                <div style={{ marginBottom: isMobile ? '12px' : '15px' }}>
                    <div style={{
                        fontWeight: '600',
                        fontSize: isMobile ? '15px' : '16px',
                        color: '#374151',
                        marginBottom: isMobile ? '8px' : '10px'
                    }}>
                        Батьки ({parents.length})
                    </div>
                    {parents.map(parent => (
                        <div key={parent._id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: isMobile ? '12px' : '15px',
                            padding: isMobile ? '12px' : '15px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            position: 'relative'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: isMobile ? '10px' : '15px',
                                flex: 1,
                                minWidth: 0
                            }}>
                                <div style={{
                                    width: isMobile ? '40px' : '50px',
                                    height: isMobile ? '40px' : '50px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(105, 180, 185, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'rgba(105, 180, 185, 1)',
                                    flexShrink: 0
                                }}>
                                    <FaUserFriends size={isMobile ? 16 : 20} />
                                </div>
                                <div style={{
                                    flex: 1,
                                    minWidth: 0,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        fontWeight: '600',
                                        fontSize: isMobile ? '14px' : '16px',
                                        marginBottom: isMobile ? '3px' : '4px',
                                        color: '#1f2937',
                                        lineHeight: '1.3',
                                        wordBreak: 'break-word'
                                    }}>
                                        {parent.fullName}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: isMobile ? '1px' : '2px',
                                        fontSize: isMobile ? '12px' : '14px',
                                        color: '#6b7280'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '6px'
                                        }}>
                                            <FaEnvelope size={isMobile ? 10 : 12} style={{ flexShrink: 0, marginTop: '2px' }} />
                                            <span style={{
                                                wordBreak: 'break-word',
                                                lineHeight: '1.3'
                                            }}>
                                                {parent.email}
                                            </span>
                                        </div>
                                        {parent.phone && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '6px'
                                            }}>
                                                <FaPhone size={isMobile ? 10 : 12} style={{ flexShrink: 0, marginTop: '2px' }} />
                                                <span style={{
                                                    wordBreak: 'break-word',
                                                    lineHeight: '1.3'
                                                }}>
                                                    {parent.phone}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Кнопки дій */}
                            {isMobile ? (
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <button
                                        onClick={() => setShowMobileMenu(showMobileMenu === parent._id ? null : parent._id)}
                                        style={{
                                            padding: '6px',
                                            backgroundColor: 'transparent',
                                            color: '#6b7280',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <FaEllipsisV size={14} />
                                    </button>

                                    {showMobileMenu === parent._id && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '6px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                            zIndex: 10,
                                            minWidth: '160px'
                                        }}>
                                            <button
                                                onClick={() => {
                                                    onAddChild(parent);
                                                    setShowMobileMenu(null);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    backgroundColor: 'white',
                                                    color: '#374151',
                                                    border: 'none',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <FaSearch size={10} />
                                                Знайти дитину
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onEdit(parent);
                                                    setShowMobileMenu(null);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    backgroundColor: 'white',
                                                    color: '#374151',
                                                    border: 'none',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <FaEdit size={10} />
                                                Редагувати
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onDelete(parent);
                                                    setShowMobileMenu(null);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    backgroundColor: 'white',
                                                    color: '#ef4444',
                                                    border: 'none',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <FaTrash size={10} />
                                                Видалити
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    flexShrink: 0,
                                    flexWrap: 'wrap',
                                    justifyContent: 'flex-end'
                                }}>
                                    <button
                                        onClick={() => onAddChild(parent)}
                                        style={{
                                            padding: '6px 10px',
                                            backgroundColor: 'rgba(105, 180, 185, 1)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'background-color 0.2s',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        <FaSearch size={12} />
                                        Знайти дитину
                                    </button>
                                    <button
                                        onClick={() => onEdit(parent)}
                                        style={{
                                            padding: '6px 10px',
                                            backgroundColor: 'rgba(105, 180, 185, 1)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'background-color 0.2s',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        <FaEdit size={12} />
                                        Редагувати
                                    </button>
                                    <button
                                        onClick={() => onDelete(parent)}
                                        style={{
                                            padding: '6px 10px',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'background-color 0.2s',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        <FaTrash size={12} />
                                        Видалити
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* СПІЛЬНІ ДІТИ */}
            <div style={{
                padding: isMobile ? '15px' : '20px',
                backgroundColor: '#f8fafc'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: isMobile ? '12px' : '15px'
                }}>
                    <div style={{
                        fontWeight: '600',
                        fontSize: isMobile ? '15px' : '16px',
                        color: '#374151'
                    }}>
                        Діти ({allChildren.length})
                    </div>
                </div>

                {allChildren.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '10px' }}>
                        {allChildren.map(child => (
                            <div key={child._id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: isMobile ? '8px' : '10px',
                                padding: isMobile ? '10px' : '12px',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                flexWrap: isMobile ? 'wrap' : 'nowrap'
                            }}>
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: isMobile ? '8px' : '10px',
                                    minWidth: 0
                                }}>
                                    <FaChild style={{
                                        color: 'rgba(105, 180, 185, 1)',
                                        flexShrink: 0,
                                        fontSize: isMobile ? '14px' : '16px'
                                    }} />
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: '500',
                                            marginBottom: '2px',
                                            fontSize: isMobile ? '13px' : '14px',
                                            lineHeight: '1.3',
                                            wordBreak: 'break-word'
                                        }}>
                                            {child.fullName}
                                        </div>
                                        {child.group && (
                                            <div style={{
                                                fontSize: isMobile ? '11px' : '12px',
                                                color: '#6b7280',
                                                lineHeight: '1.3'
                                            }}>
                                                {child.group.name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Кнопки дій для дітей */}
                                <div style={{
                                    display: 'flex',
                                    gap: isMobile ? '4px' : '6px',
                                    flexShrink: 0,
                                    flexWrap: 'wrap'
                                }}>
                                    {child.parents && child.parents.length < 2 && (
                                        <button
                                            onClick={() => openAddParentPopup(child)}
                                            style={{
                                                padding: isMobile ? '5px 8px' : '6px 10px',
                                                backgroundColor: '#059669',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: isMobile ? '10px' : '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <FaUserPlus size={isMobile ? 9 : 12} />
                                            {!isMobile && 'Додати батька'}
                                        </button>
                                    )}

                                    {child.parents && child.parents.length === 2 && (
                                        <button
                                            onClick={() => openRemoveParentChoicePopup(child)}
                                            style={{
                                                padding: isMobile ? '5px 8px' : '6px 10px',
                                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                                color: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: isMobile ? '10px' : '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <FaUserMinus size={isMobile ? 9 : 13} />
                                            {!isMobile ? 'Відв\'язати батька' : 'Відв\'язати'}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => openDeleteChildConfirmation(child)}
                                        style={{
                                            padding: isMobile ? '5px 8px' : '6px 10px',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: isMobile ? '10px' : '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        <FaTimes size={isMobile ? 9 : 12} />
                                        {!isMobile && 'Видалити'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: isMobile ? '15px' : '20px',
                        color: '#6b7280',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px dashed #e5e7eb',
                        fontSize: isMobile ? '13px' : '14px'
                    }}>
                        <p>Спільних дітей не знайдено</p>
                    </div>
                )}
            </div>

            {/* ПОПАПИ */}
            {showDeleteChildPopup && (
                <DeleteChildPopup
                    child={childToDelete}
                    parent={parents[0]}
                    onConfirm={handleDeleteConfirm}
                    onClose={closeDeleteChildConfirmation}
                    isMobile={isMobile}
                />
            )}

            {showAddParentPopup && (
                <AddParentPopup
                    child={selectedChild}
                    currentParent={parents[0]}
                    databaseName={databaseName}
                    onClose={closeAddParentPopup}
                    onAddParent={handleAddParentConfirm}
                    isMobile={isMobile}
                />
            )}

            {showRemoveParentChoicePopup && (
                <RemoveParentChoicePopup
                    child={selectedChild}
                    onClose={closeRemoveParentChoicePopup}
                    onRemoveParent={handleRemoveParent}
                    onRemoveBothParents={handleRemoveBothParents}
                    isMobile={isMobile}
                />
            )}
        </div>
    );
};

export default CombinedParentCard;