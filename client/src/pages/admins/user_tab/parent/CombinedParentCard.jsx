import React, { useState } from 'react';
import {
    FaUserFriends, FaEnvelope, FaPhone, FaChild,
    FaSearch, FaEdit, FaTrash, FaUserPlus, FaUserMinus
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
    onRemoveParentFromChild
}) => {
    const [showDeleteChildPopup, setShowDeleteChildPopup] = useState(false);
    const [showAddParentPopup, setShowAddParentPopup] = useState(false);
    const [childToDelete, setChildToDelete] = useState(null);
    const [selectedChild, setSelectedChild] = useState(null);
    const [showRemoveParentChoicePopup, setShowRemoveParentChoicePopup] = useState(false);

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
                // Видаляємо обох батьків послідовно
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
            marginBottom: '20px',
            overflow: 'hidden'
        }}>
            {/* БАТЬКИ ГРУПОВАНІ */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <div style={{ marginBottom: '15px' }}>
                    <div style={{
                        fontWeight: '600',
                        fontSize: '16px',
                        color: '#374151',
                        marginBottom: '10px'
                    }}>
                        Батьки ({parents.length})
                    </div>
                    {parents.map(parent => (
                        <div key={parent._id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '15px',
                            padding: '15px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(105, 180, 185, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'rgba(105, 180, 185, 1)',
                                    flexShrink: 0
                                }}>
                                    <FaUserFriends />
                                </div>
                                <div>
                                    <div style={{
                                        fontWeight: '600',
                                        fontSize: '16px',
                                        marginBottom: '4px',
                                        color: '#1f2937'
                                    }}>
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
                                    <FaSearch />
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
                                    <FaEdit />
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
                                    <FaTrash />
                                    Видалити
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* СПІЛЬНІ ДІТИ */}
            <div style={{
                padding: '20px',
                backgroundColor: '#f8fafc'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                }}>
                    <div style={{
                        fontWeight: '600',
                        fontSize: '16px',
                        color: '#374151'
                    }}>
                        Діти ({allChildren.length})
                    </div>
                </div>

                {allChildren.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {allChildren.map(child => (
                            <div key={child._id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaChild style={{ color: 'rgba(105, 180, 185, 1)' }} />
                                    <div>
                                        <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                                            {child.fullName}
                                        </div>
                                        {child.group && (
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6b7280'
                                            }}>
                                                {child.group.name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* КНОПКА ДОДАТИ БАТЬКІВ, ЯКЩО ДИТИНА ВЖЕ МАЄ 1-ГО З БАТЬКІВ */}
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {child.parents && child.parents.length < 2 && (
                                        <button
                                            onClick={() => openAddParentPopup(child)}
                                            style={{
                                                padding: '6px 10px',
                                                backgroundColor: '#059669',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = '#047857';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = '#059669';
                                            }}
                                        >
                                            <FaUserPlus size={12} />
                                            Додати батька
                                        </button>
                                    )}

                                    {/* КНОПКА ВИДАЛИТИ БАТЬКІВ, ЯКЩО ПРИСУТНІ ОБОЄ БАТЬКІВ */}
                                    {child.parents && child.parents.length === 2 && (
                                        <button
                                            onClick={() => openRemoveParentChoicePopup(child)}
                                            style={{
                                                padding: '6px 10px',
                                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                                color: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                transition: 'border-color 0.2s',
                                                outline: 'none'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(105, 180, 185, 1)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                            }}
                                        >
                                            <FaUserMinus size={13} />
                                            Відв'язати батька
                                        </button>
                                    )}

                                    {/* КНОПКА ВИДАЛИТИ ДИТИНУ */}
                                    <button
                                        onClick={() => openDeleteChildConfirmation(child)}
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
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#dc2626';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = '#ef4444';
                                        }}
                                    >
                                        <FaTrash size={12} />
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
                        color: '#6b7280',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px dashed #e5e7eb'
                    }}>
                        <p>Спільних дітей не знайдено</p>
                    </div>
                )}
            </div>

            {showDeleteChildPopup && (
                <DeleteChildPopup
                    child={childToDelete}
                    parent={parents[0]}
                    onConfirm={handleDeleteConfirm}
                    onClose={closeDeleteChildConfirmation}
                />
            )}

            {showAddParentPopup && (
                <AddParentPopup
                    child={selectedChild}
                    currentParent={parents[0]}
                    databaseName={databaseName}
                    onClose={closeAddParentPopup}
                    onAddParent={handleAddParentConfirm}
                />
            )}

            {showRemoveParentChoicePopup && (
                <RemoveParentChoicePopup
                    child={selectedChild}
                    onClose={closeRemoveParentChoicePopup}
                    onRemoveParent={handleRemoveParent}
                    onRemoveBothParents={handleRemoveBothParents}
                />
            )}
        </div>
    );
};

export default CombinedParentCard;