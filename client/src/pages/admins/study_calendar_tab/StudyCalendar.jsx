import React, { useState } from 'react';
import { FaCalendarAlt, FaSchool, FaUmbrellaBeach, FaList } from 'react-icons/fa';
import SemesterManager from './components/Semester/SemesterManager';
import QuarterManager from './components/Quarter/QuarterManager';
import HolidayManager from './components/Holiday/HolidayManager';

const StudyCalendar = () => {
    const [activeTab, setActiveTab] = useState('semesters');

    const tabs = [
        { id: 'semesters', label: 'Семестри', icon: <FaSchool /> },
        { id: 'quarters', label: 'Чверті', icon: <FaList /> },
        { id: 'holidays', label: 'Канікули', icon: <FaUmbrellaBeach /> }
    ];

    return (
        <div>
            <div>
                <h3 style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '7px',
                    color: '#1f2937'
                }}>
                    Календар навчання
                </h3>
                <p style={{ color: '#6b7280', margin: 0, marginBottom: '20px' }}>
                    Управління семестрами, чвертями та канікулами
                </p>
            </div>

            <div style={{
                display: 'flex',
                borderBottom: '1px solid #e5e7eb',
                marginBottom: '30px'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            backgroundColor: activeTab === tab.id ? 'rgba(105, 180, 185, 1)' : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#374151',
                            borderBottom: activeTab === tab.id ? '2px solid rgba(105, 180, 185, 1)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            fontWeight: '500'
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

            <div>
                {activeTab === 'semesters' && <SemesterManager />}
                {activeTab === 'quarters' && <QuarterManager />}
                {activeTab === 'holidays' && <HolidayManager />}
            </div>
        </div>
    );

};

export default StudyCalendar;