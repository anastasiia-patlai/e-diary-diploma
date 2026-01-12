import React from "react";
import { FaUserGraduate } from "react-icons/fa";

const EmptyState = ({ searchTerm, userGroups, setSearchTerm, isMobile }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: 'rgba(105, 180, 185, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
            }}>
                <FaUserGraduate size={48} color="rgba(105, 180, 185, 1)" />
            </div>

            <h3 style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
            }}>
                {searchTerm ? 'Учнів не знайдено' : 'Немає учнів'}
            </h3>

            <p style={{
                fontSize: isMobile ? '14px' : '16px',
                color: '#6b7280',
                maxWidth: '500px',
                marginBottom: '24px',
                lineHeight: '1.5'
            }}>
                {searchTerm
                    ? 'Спробуйте змінити умови пошуку'
                    : userGroups.length === 0
                        ? 'Ви не є класним керівником/куратором жодної групи.'
                        : 'У групах, де ви є куратором, ще немає учнів.'}
            </p>

            {searchTerm && (
                <button
                    onClick={() => setSearchTerm("")}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '14px' : '16px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.backgroundColor = 'rgba(85, 160, 165, 1)'}
                    onMouseOut={(e) => e.target.backgroundColor = 'rgba(105, 180, 185, 1)'}
                >
                    Очистити пошук
                </button>
            )}
        </div>
    );
};

export default EmptyState;