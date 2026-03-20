import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronDown } from 'react-icons/fa';

const LanguageSwitcher = ({ onLogout }) => {
    const { i18n, t } = useTranslation();
    const currentLanguage = i18n.language;
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setIsDropdownOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsDropdownOpen(false);
    };

    const getLanguageLabel = () => {
        switch (currentLanguage) {
            case 'uk':
                return 'UA';
            case 'en':
                return 'EN';
            default:
                return 'UA';
        }
    };

    // Мобільна версія - випадаючий список
    if (isMobile) {
        return (
            <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {getLanguageLabel()}
                        <FaChevronDown style={{ fontSize: '12px' }} />
                    </button>
                </div>

                {isDropdownOpen && (
                    <>
                        <div
                            onClick={() => setIsDropdownOpen(false)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 999
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            top: '45px',
                            right: '70px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            minWidth: '120px',
                            overflow: 'hidden'
                        }}>
                            <button
                                onClick={() => changeLanguage('uk')}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px',
                                    border: 'none',
                                    backgroundColor: currentLanguage === 'uk' ? '#f0f0f0' : 'white',
                                    color: '#333',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '14px',
                                    fontWeight: currentLanguage === 'uk' ? 'bold' : 'normal'
                                }}
                                onMouseOver={(e) => {
                                    if (currentLanguage !== 'uk') {
                                        e.target.style.backgroundColor = '#f5f5f5';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (currentLanguage !== 'uk') {
                                        e.target.style.backgroundColor = 'white';
                                    }
                                }}
                            >
                                🇺🇦 Українська
                            </button>
                            <button
                                onClick={() => changeLanguage('en')}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px',
                                    border: 'none',
                                    backgroundColor: currentLanguage === 'en' ? '#f0f0f0' : 'white',
                                    color: '#333',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '14px',
                                    fontWeight: currentLanguage === 'en' ? 'bold' : 'normal'
                                }}
                                onMouseOver={(e) => {
                                    if (currentLanguage !== 'en') {
                                        e.target.style.backgroundColor = '#f5f5f5';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (currentLanguage !== 'en') {
                                        e.target.style.backgroundColor = 'white';
                                    }
                                }}
                            >
                                🇬🇧 English
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Десктопна версія - кнопки
    return (
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={() => changeLanguage('uk')}
                    style={{
                        fontWeight: currentLanguage === 'uk' ? 'bold' : 'normal',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '5px 10px',
                        color: 'white'
                    }}
                >
                    UA
                </button>
                <button
                    onClick={() => changeLanguage('en')}
                    style={{
                        fontWeight: currentLanguage === 'en' ? 'bold' : 'normal',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '5px 10px',
                        color: 'white'
                    }}
                >
                    EN
                </button>
            </div>
        </div>
    );
};

export default LanguageSwitcher;