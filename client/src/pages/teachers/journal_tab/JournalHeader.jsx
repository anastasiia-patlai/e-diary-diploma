import React from 'react';
import { FaBook, FaUsers } from 'react-icons/fa';

const JournalHeader = ({ lesson, isMobile }) => {
    if (!lesson) return null;

    const getSubgroupLabel = (subgroup) => {
        switch (subgroup) {
            case 'all': return 'Вся група';
            case '1': return 'Підгрупа 1';
            case '2': return 'Підгрупа 2';
            case '3': return 'Підгрупа 3';
            default: return subgroup;
        }
    };

    return (
        <div style={{
            backgroundColor: 'rgba(105, 180, 185, 1)',
            color: 'white',
            padding: isMobile ? '16px' : '20px',
            borderRadius: '10px',
            marginBottom: '20px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBook size={20} />
                    <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600' }}>
                        {lesson.subject}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaUsers size={20} />
                    <span style={{ fontSize: isMobile ? '14px' : '18px' }}>
                        {lesson.group?.name}
                        {lesson.subgroup && lesson.subgroup !== 'all' && (
                            <span style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                marginLeft: '8px',
                                fontSize: '12px'
                            }}>
                                {getSubgroupLabel(lesson.subgroup)}
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default JournalHeader;