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
    onClose
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
                    <h3 style={{ margin: 0 }}>Оберіть куратора для {selectedGroup?.name}</h3>
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

                <AvailableCuratorsList
                    availableTeachers={availableTeachers}
                    onSelectCurator={onSelectCurator}
                />

                <BusyCuratorsList
                    busyTeachers={busyTeachers}
                    groups={groups}
                />

                {teachers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                        <p>Викладачі не знайдені</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CuratorPopup;