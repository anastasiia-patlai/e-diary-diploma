import React from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';

const EditScheduleHeader = ({ onClose, apiAvailable }) => {
    return (
        <Modal.Header style={{
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            padding: '20px 24px'
        }}>
            <Modal.Title style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                Редагування заняття
                {!apiAvailable && (
                    <Badge bg="warning" text="dark">
                        Офлайн режим
                    </Badge>
                )}
            </Modal.Title>
            <Button
                variant="link"
                onClick={onClose}
                style={{
                    padding: '4px',
                    color: '#6b7280',
                    border: 'none',
                    background: 'none'
                }}
            >
                <FaTimes size={18} />
            </Button>
        </Modal.Header>
    );
};

export default EditScheduleHeader;