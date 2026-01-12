import React from "react";

const GlobalStyles = () => {
    return (
        <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes slideDown {
                from {
                    max-height: 0;
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    max-height: 2000px;
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideDownParent {
                from {
                    max-height: 0;
                    opacity: 0;
                    transform: translateY(-5px);
                }
                to {
                    max-height: 500px;
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                .student-row:hover {
                    background-color: white !important;
                }
                
                input, select {
                    font-size: 14px !important;
                }
                
                .info-row {
                    grid-template-columns: 1fr !important;
                    gap: 8px !important;
                }
            }
        `}</style>
    );
};

export default GlobalStyles;