import React from 'react';
import { FaTimes } from 'react-icons/fa';
import AvailableCuratorsList from "./AvailableCuratorsList.jsx";
import BusyCuratorsList from "./BusyCuratorsList.jsx";

const CuratorPopup = ({
    selectedGroup,
    availableTeachers,
    busyTeachers,
    teachers,
    groups,
    onSelectCurator,
    onClose,
    isMobile
}) => {
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
                borderRadius: '12px',
                padding: isMobile ? '16px' : '24px',
                width: isMobile ? '100%' : '90%',
                maxWidth: '500px',
                maxHeight: isMobile ? '85vh' : '80vh',
                overflowY: 'auto',
                marginTop: isMobile ? '10px' : '0'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: isMobile ? '16px' : '20px'
                }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: isMobile ? '18px' : '20px',
                            lineHeight: '1.3'
                        }}>
                            Оберіть куратора для {selectedGroup?.name}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: isMobile ? '18px' : '20px',
                            color: '#6b7280',
                            padding: '4px',
                            marginLeft: '10px',
                            flexShrink: 0
                        }}
                        aria-label="Закрити"
                    >
                        <FaTimes />
                    </button>
                </div>

                <AvailableCuratorsList
                    availableTeachers={availableTeachers}
                    onSelectCurator={onSelectCurator}
                    isMobile={isMobile}
                />

                <BusyCuratorsList
                    busyTeachers={busyTeachers}
                    groups={groups}
                    isMobile={isMobile}
                />

                {teachers.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: isMobile ? '20px' : '30px',
                        color: '#6b7280'
                    }}>
                        <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            Викладачі не знайдені
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CuratorPopup;