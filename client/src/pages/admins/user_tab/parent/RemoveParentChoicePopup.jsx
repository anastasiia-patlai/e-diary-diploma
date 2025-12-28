import React from 'react';
import { FaUserMinus, FaTimes } from 'react-icons/fa';

const RemoveParentChoicePopup = ({ child, onClose, onRemoveParent, onRemoveBothParents, isMobile }) => {
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
            zIndex: 1000,
            padding: isMobile ? '10px' : '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: isMobile ? '16px' : '24px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                maxWidth: '500px',
                width: '100%',
                maxHeight: isMobile ? '80vh' : 'auto',
                overflowY: 'auto'
            }}>
                {/* Заголовок */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: isMobile ? '16px' : '20px'
                }}>
                    <div>
                        <h3 style={{
                            margin: 0,
                            color: '#1f2937',
                            fontSize: isMobile ? '20px' : '24px',
                            lineHeight: '1.3'
                        }}>
                            Відв'язати батька від дитини
                        </h3>
                        {child && (
                            <p style={{
                                margin: '4px 0 0 0',
                                color: '#6b7280',
                                paddingTop: '5px',
                                fontSize: isMobile ? '16px' : '18px',
                                lineHeight: '1.3'
                            }}>
                                Дитина: <strong style={{ color: '#374151' }}>{child.fullName}</strong>
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            fontSize: isMobile ? '18px' : '20px',
                            marginLeft: '10px',
                            flexShrink: 0
                        }}
                        aria-label="Закрити"
                    >
                        <FaTimes />
                    </button>
                </div>

                <p style={{
                    padding: '0 0 0 0 ',
                    margin: '10px 0 10px 0',
                    color: '#6b7280',
                    fontSize: isMobile ? '12px' : '14px',
                    lineHeight: '1.4'
                }}>
                    Оберіть, кого видалити з інформації дитини:
                </p>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '12px' : '15px',
                    marginBottom: isMobile ? '18px' : '24px'
                }}>
                    {child && child.parents && child.parents.map(parent => (
                        <button
                            key={parent._id}
                            onClick={() => onRemoveParent(child._id, parent._id)}
                            style={{
                                padding: isMobile ? '14px 16px' : '16px 20px',
                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: isMobile ? '14px' : '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: isMobile ? '12px' : '15px',
                                transition: 'all 0.2s',
                                textAlign: 'left',
                                width: '100%',
                                boxSizing: 'border-box',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(85, 160, 165, 1)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            <FaUserMinus size={isMobile ? 18 : 22} style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontWeight: '600',
                                    marginBottom: isMobile ? '4px' : '6px',
                                    fontSize: isMobile ? '14px' : '16px',
                                    lineHeight: '1.4',
                                    wordBreak: 'break-word',
                                    letterSpacing: '0.3px'
                                }}>
                                    {parent.fullName}
                                </div>
                                <div style={{
                                    fontSize: isMobile ? '14px' : '15px',
                                    opacity: 0.95,
                                    lineHeight: '1.4',
                                    wordBreak: 'break-word',
                                    marginBottom: parent.phone ? '2px' : '0'
                                }}>
                                    {parent.email}
                                </div>
                                {parent.phone && (
                                    <div style={{
                                        fontSize: isMobile ? '14px' : '15px',
                                        opacity: 0.95,
                                        lineHeight: '1.4',
                                        wordBreak: 'break-word'
                                    }}>
                                        {parent.phone}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Кнопки дій */}
                <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: isMobile ? '12px' : '16px',
                    display: 'flex',
                    gap: isMobile ? '8px' : '10px',
                    flexDirection: isMobile ? 'column' : 'row'
                }}>
                    <button
                        onClick={() => child && onRemoveBothParents(child._id)}
                        style={{
                            flex: isMobile ? 'none' : 1,
                            padding: isMobile ? '10px 12px' : '10px 16px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: isMobile ? '14px' : '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                            width: isMobile ? '100%' : 'auto'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Видалити обох батьків
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            flex: isMobile ? 'none' : 1,
                            padding: isMobile ? '10px 12px' : '10px 16px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: isMobile ? '14px' : '14px',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                            width: isMobile ? '100%' : 'auto'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#4b5563';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#6b7280';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Скасувати
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RemoveParentChoicePopup;