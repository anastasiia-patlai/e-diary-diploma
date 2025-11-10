import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { FaSave, FaTimes } from 'react-icons/fa';

const EditScheduleFooter = ({
    onClose,
    onSave,
    loading,
    loadingData,
    isFormValid,
    hasConflicts,
    apiAvailable
}) => {
    return (
        <Modal.Footer style={{
            borderTop: '1px solid #e5e7eb',
            padding: '20px 24px',
            gap: '12px'
        }}>
            <Button
                variant="outline-secondary"
                onClick={onClose}
                disabled={loading || loadingData}
                style={{
                    padding: '10px 20px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}
            >
                <FaTimes size={14} />
                Скасувати
            </Button>

            <Button
                onClick={onSave}
                disabled={!isFormValid || loading || loadingData || (hasConflicts && apiAvailable)}
                style={{
                    padding: '10px 20px',
                    backgroundColor: (isFormValid && !loading && !loadingData && (!hasConflicts || !apiAvailable)) ? 'rgba(105, 180, 185, 1)' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease-in-out'
                }}
                onMouseOver={(e) => {
                    if (isFormValid && !loading && !loadingData && (!hasConflicts || !apiAvailable)) {
                        e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.8)';
                    }
                }}
                onMouseOut={(e) => {
                    if (isFormValid && !loading && !loadingData && (!hasConflicts || !apiAvailable)) {
                        e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                    }
                }}
            >
                {loading ? (
                    <>
                        <Spinner animation="border" size="sm" />
                        Збереження...
                    </>
                ) : (
                    <>
                        <FaSave size={14} />
                        Зберегти зміни
                    </>
                )}
            </Button>
        </Modal.Footer>
    );
};

export default EditScheduleFooter;