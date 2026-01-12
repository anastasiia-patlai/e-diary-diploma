// Notification.jsx
import React, { useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";

const Notification = ({ message, type = "success", onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getBackgroundColor = () => {
        switch (type) {
            case "success":
                return "rgba(34, 197, 94, 0.95)";
            case "error":
                return "rgba(239, 68, 68, 0.95)";
            case "warning":
                return "rgba(245, 158, 11, 0.95)";
            default:
                return "rgba(105, 180, 185, 0.95)";
        }
    };

    const getIcon = () => {
        switch (type) {
            case "success":
                return <FaCheckCircle size={20} />;
            case "error":
                return <FaExclamationCircle size={20} />;
            default:
                return <FaCheckCircle size={20} />;
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                backgroundColor: getBackgroundColor(),
                color: "white",
                padding: "16px 20px",
                borderRadius: "8px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 10000,
                minWidth: "300px",
                maxWidth: "400px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                animation: "slideIn 0.3s ease-out"
            }}
        >
            <style>
                {`
                    @keyframes slideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                `}
            </style>

            <div style={{ flexShrink: 0 }}>
                {getIcon()}
            </div>

            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    lineHeight: "1.4"
                }}>
                    {message}
                </div>
            </div>

            <button
                onClick={onClose}
                style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = "transparent";
                }}
            >
                <FaTimes size={14} />
            </button>
        </div>
    );
};

export default Notification;