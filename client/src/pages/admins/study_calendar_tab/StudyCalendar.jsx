import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSchool, FaUmbrellaBeach, FaList, FaBars, FaTimes } from 'react-icons/fa';
import SemesterManager from './components/Semester/SemesterManager';
import QuarterManager from './components/Quarter/QuarterManager';
import HolidayManager from './components/Holiday/HolidayManager';

const StudyCalendar = () => {
    const [activeTab, setActiveTab] = useState('semesters');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const tabs = [
        { id: 'semesters', label: 'Семестри', icon: <FaSchool /> },
        { id: 'quarters', label: 'Чверті', icon: <FaList /> },
        { id: 'holidays', label: 'Канікули', icon: <FaUmbrellaBeach /> }
    ];

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setShowMobileMenu(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ padding: isMobile ? '12px' : '20px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isMobile ? '15px' : '20px',
                flexWrap: 'wrap',
                gap: isMobile ? '10px' : '0'
            }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{
                        color: '#1f2937',
                        fontSize: '28px',
                        margin: 0,
                        fontWeight: '600'
                    }}>
                        Навчальний календар
                    </h3>
                    <p style={{
                        color: '#6b7280',
                        fontSize: isMobile ? '13px' : '14px',
                        margin: '5px 0 0 0'
                    }}>
                        Управління семестрами, чвертями та канікулами
                    </p>
                </div>

                {/* {isMobile && (
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            color: '#374151',
                            cursor: 'pointer',
                            padding: '8px'
                        }}
                    >
                        {showMobileMenu ? <FaTimes /> : <FaBars />}
                    </button>
                )} */}
            </div>

            {/* ТАБИ ДЛЯ ДЕСКТОПУ */}
            {!isMobile ? (
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #e5e7eb',
                    marginBottom: '30px',
                    overflowX: 'auto'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 20px',
                                border: 'none',
                                backgroundColor: activeTab === tab.id ? 'rgba(105, 180, 185, 1)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#374151',
                                borderBottom: activeTab === tab.id ? '2px solid rgba(105, 180, 185, 1)' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease',
                                fontWeight: '500',
                                fontSize: '14px',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseOver={(e) => {
                                if (activeTab !== tab.id) {
                                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (activeTab !== tab.id) {
                                    e.target.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            ) : (
                /* МОБІЛЬНА НАВІГАЦІЯ */
                <>
                    {showMobileMenu && (
                        <div style={{
                            position: 'fixed',
                            top: '60px',
                            left: '12px',
                            right: '12px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            padding: '10px'
                        }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setShowMobileMenu(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        border: 'none',
                                        backgroundColor: activeTab === tab.id ? 'rgba(105, 180, 185, 0.1)' : 'transparent',
                                        color: activeTab === tab.id ? 'rgba(105, 180, 185, 1)' : '#374151',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        fontSize: '15px',
                                        fontWeight: '500',
                                        borderRadius: '8px',
                                        marginBottom: '5px'
                                    }}
                                >
                                    <span style={{ fontSize: '18px' }}>
                                        {tab.icon}
                                    </span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* МОБІЛЬНІ ТАБИ - ГОРИЗОНТАЛЬНІ */}
                    <div style={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: '10px',
                        marginBottom: '20px',
                        paddingBottom: '5px',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '12px 16px',
                                    border: 'none',
                                    backgroundColor: activeTab === tab.id ? 'rgba(105, 180, 185, 1)' : 'rgba(105, 180, 185, 0.1)',
                                    color: activeTab === tab.id ? 'white' : 'rgba(105, 180, 185, 1)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: '500',
                                    fontSize: '13px',
                                    whiteSpace: 'nowrap',
                                    borderRadius: '8px',
                                    flexShrink: 0
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </>
            )}

            <div style={{
                padding: isMobile ? '0' : '0',
                maxWidth: '100%',
                overflowX: 'auto'
            }}>
                {activeTab === 'semesters' && <SemesterManager isMobile={isMobile} />}
                {activeTab === 'quarters' && <QuarterManager isMobile={isMobile} />}
                {activeTab === 'holidays' && <HolidayManager isMobile={isMobile} />}
            </div>
        </div>
    );
};

export default StudyCalendar;