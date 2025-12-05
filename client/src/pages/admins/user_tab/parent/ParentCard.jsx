import React, { useState } from 'react';
import {
    FaUserFriends, FaEnvelope, FaPhone, FaChild,
    FaSearch, FaEdit, FaTrash, FaTimes, FaUserPlus, FaUserMinus,
    FaEllipsisV
} from "react-icons/fa";
import DeleteChildPopup from './DeleteChildPopup';
import AddParentPopup from './AddParentPopup';
import RemoveParentChoicePopup from './RemoveParentChoicePopup';

const ParentCard = ({
    parent,
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
    const [showRemoveParentChoicePopup, setShowRemoveParentChoicePopup] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [childToDelete, setChildToDelete] = useState(null);
    const [selectedChild, setSelectedChild] = useState(null);

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

    const openRemoveParentChoicePopup = (child) => {
        setSelectedChild(child);
        setShowRemoveParentChoicePopup(true);
    };

    const closeRemoveParentChoicePopup = () => {
        setShowRemoveParentChoicePopup(false);
        setSelectedChild(null);
    };

    const handleDeleteConfirm = (childId) => {
        onRemoveChild(parent._id, childId);
        closeDeleteChildConfirmation();
    };

    const handleAddParentConfirm = (childId, parentId) => {
        onAddParentToChild(childId, parentId);
        closeAddParentPopup();
    };

    const handleRemoveParent = (childId, parentId) => {
        onRemoveParentFromChild(childId, parentId);
        closeRemoveParentChoicePopup();
    };

    const handleRemoveBothParents = async (childId) => {
        try {
            const child = parent.children.find(c => c._id === childId);
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

    return (
        <div key={parent._id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: isMobile ? '12px' : '20px',
            backgroundColor: '#f9fafb',
            transition: 'box-shadow 0.2s',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* Заголовок з інформацією про батька */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: isMobile ? '12px' : '15px',
                position: 'relative'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '8px' : '15px',
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
                            marginBottom: isMobile ? '2px' : '4px',
                            color: '#1f2937',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {parent.fullName}
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: isMobile ? '1px' : '2px',
                            fontSize: isMobile ? '11px' : '14px',
                            color: '#6b7280'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <FaEnvelope size={isMobile ? 10 : 12} />
                                <span style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {parent.email}
                                </span>
                            </div>
                            {parent.phone && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <FaPhone size={isMobile ? 10 : 12} />
                                    <span style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
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
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
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

                        {showMobileMenu && (
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
                                        setShowMobileMenu(false);
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
                                        setShowMobileMenu(false);
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
                                        setShowMobileMenu(false);
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
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button
                            onClick={() => onAddChild(parent)}
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
                                gap: '5px',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <FaSearch size={12} />
                            Знайти дитину
                        </button>
                        <button
                            onClick={() => onEdit(parent)}
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
                                gap: '5px',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <FaEdit size={12} />
                            Редагувати
                        </button>
                        <button
                            onClick={() => onDelete(parent)}
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
                                gap: '5px',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <FaTrash size={12} />
                            Видалити
                        </button>
                    </div>
                )}
            </div>

            {/* ДІТИ БАТЬКІВ */}
            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: isMobile ? '8px' : '10px'
                }}>
                    <div style={{
                        fontWeight: '600',
                        color: 'rgba(105, 180, 185, 1)',
                        fontSize: isMobile ? '13px' : '14px'
                    }}>
                        Діти ({parent.children ? parent.children.length : 0})
                    </div>
                </div>

                {parent.children && parent.children.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
                        {parent.children.map(child => (
                            <div key={child._id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: isMobile ? '6px' : '10px',
                                padding: isMobile ? '10px' : '12px',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
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
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {child.fullName}
                                        </div>
                                        {child.group && (
                                            <div style={{
                                                fontSize: isMobile ? '11px' : '12px',
                                                color: '#6b7280',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {child.group.name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: isMobile ? '4px' : '5px',
                                    flexShrink: 0
                                }}>
                                    {child.parents && child.parents.length < 2 && (
                                        <button
                                            onClick={() => openAddParentPopup(child)}
                                            style={{
                                                padding: isMobile ? '5px 8px' : '6px 10px',
                                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: isMobile ? '10px' : '11px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <FaUserPlus size={isMobile ? 9 : 10} />
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
                                                fontSize: isMobile ? '10px' : '11px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <FaUserMinus size={isMobile ? 9 : 10} />
                                            {!isMobile && 'Відв\'язати'}
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
                                            fontSize: isMobile ? '10px' : '11px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        <FaTimes size={isMobile ? 9 : 10} />
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
                        <p>Дітей не додано</p>
                    </div>
                )}
            </div>

            {/* ПОПАПИ */}
            {showDeleteChildPopup && (
                <DeleteChildPopup
                    child={childToDelete}
                    parent={parent}
                    onConfirm={handleDeleteConfirm}
                    onClose={closeDeleteChildConfirmation}
                    isMobile={isMobile}
                />
            )}

            {showAddParentPopup && (
                <AddParentPopup
                    child={selectedChild}
                    currentParent={parent}
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

export default ParentCard;