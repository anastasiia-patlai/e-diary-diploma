import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronDown } from 'react-icons/fa';

const LanguageSwitcher = ({ onLogout, isLoginPage = false }) => {
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

    // Стилі для сторінки входу
    const loginPageStyle = {
        position: 'fixed',
        height: isMobile ? 'auto' : '40px',
        width: isMobile ? 'auto' : '100px',
        top: '18px',
        right: isMobile ? '16px' : '100px',
        zIndex: 999,
        ...(isMobile ? {} : {
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(99, 93, 93, 0.2)',
            borderRadius: '12px',
            padding: '5px 10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        })
    };

    // Якщо це сторінка входу - показуємо кнопки зі спеціальними стилями
    if (isLoginPage) {
        return (
            <div style={loginPageStyle}>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                    <button
                        onClick={() => changeLanguage('uk')}
                        style={{
                            fontWeight: currentLanguage === 'uk' ? 'bold' : 'normal',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: isMobile ? '14px' : '16px',
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
                            fontSize: isMobile ? '14px' : '16px',
                            padding: '5px 10px',
                            color: 'white'
                        }}
                    >
                        EN
                    </button>
                </div>
            </div>
        );
    }

    // Для інших сторінок
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
                            >
                                🇬🇧 English
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Десктопна версія для інших сторінок
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