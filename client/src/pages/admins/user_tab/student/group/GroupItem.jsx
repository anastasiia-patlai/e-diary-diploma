import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronDown, FaChevronUp, FaCog } from 'react-icons/fa';
import StudentsList from '../StudentsList';
import SubgroupItem from './subgroup/SubgroupItem';
import ConfigureSubgroupsButton from './subgroup/ConfigureSubgroupsButton';

const GroupItem = ({
    group,
    isExpanded,
    onToggle,
    onEditStudent,
    onDeleteStudent,
    isMobile,
    databaseName,
    onUpdateGroups
}) => {
    const { t } = useTranslation();
    const [expandedSubgroups, setExpandedSubgroups] = useState({});

    const toggleSubgroup = (subgroupId) => {
        setExpandedSubgroups(prev => ({
            ...prev,
            [subgroupId]: !prev[subgroupId]
        }));
    };

    const getInstitutionType = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const schoolName = userInfo.schoolName || '';
        const databaseName = userInfo.databaseName || '';
        const institutionType = group.institutionType || userInfo.institutionType;

        if (institutionType) {
            const lowerType = institutionType.toLowerCase();
            if (lowerType.includes('гімназія') || lowerType.includes('гимназия')) {
                return 'gymnasium';
            } else if (lowerType.includes('ліцей') || lowerType.includes('лицей')) {
                return 'lyceum';
            } else if (lowerType.includes('коледж') || lowerType.includes('колледж')) {
                return 'college';
            } else if (lowerType.includes('університет') || lowerType.includes('университет') ||
                lowerType.includes('інститут') || lowerType.includes('институт') ||
                lowerType.includes('академія') || lowerType.includes('академия')) {
                return 'university';
            } else if (lowerType.includes('школа') || lowerType.includes('школа')) {
                return 'school';
            }
        }

        const lowerSchoolName = schoolName.toLowerCase();
        if (lowerSchoolName.includes('гімназія') || lowerSchoolName.includes('гимназия') ||
            lowerSchoolName.includes('gymnasium')) {
            return 'gymnasium';
        } else if (lowerSchoolName.includes('ліцей') || lowerSchoolName.includes('лицей') ||
            lowerSchoolName.includes('lyceum')) {
            return 'lyceum';
        } else if (lowerSchoolName.includes('коледж') || lowerSchoolName.includes('колледж') ||
            lowerSchoolName.includes('college')) {
            return 'college';
        } else if (lowerSchoolName.includes('університет') || lowerSchoolName.includes('университет') ||
            lowerSchoolName.includes('інститут') || lowerSchoolName.includes('институт') ||
            lowerSchoolName.includes('академія') || lowerSchoolName.includes('академия') ||
            lowerSchoolName.includes('university') || lowerSchoolName.includes('institute') ||
            lowerSchoolName.includes('academy')) {
            return 'university';
        }

        return 'school';
    };

    const getInstitutionInfo = (type) => {
        const institutions = {
            'school': {
                label: t('admin.institutionTypes.school'),
                groupLabel: t('admin.group.class'),
                color: '#fef2f2',
                borderColor: '#fecaca',
                textColor: '#dc2626',
                icon: '🏫'
            },
            'gymnasium': {
                label: t('admin.institutionTypes.gymnasium'),
                groupLabel: t('admin.group.class'),
                color: '#fef2f2',
                borderColor: '#fecaca',
                textColor: '#dc2626',
                icon: '🎓'
            },
            'lyceum': {
                label: t('admin.institutionTypes.lyceum'),
                groupLabel: t('admin.group.class'),
                color: '#fef2f2',
                borderColor: '#fecaca',
                textColor: '#dc2626',
                icon: '📚'
            },
            'college': {
                label: t('admin.institutionTypes.college'),
                groupLabel: t('admin.group.group'),
                color: '#f0fdf4',
                borderColor: '#bbf7d0',
                textColor: '#16a34a',
                icon: '🎓'
            },
            'university': {
                label: t('admin.institutionTypes.university'),
                groupLabel: t('admin.group.group'),
                color: '#f0fdf4',
                borderColor: '#bbf7d0',
                textColor: '#16a34a',
                icon: '🏛️'
            }
        };

        return institutions[type] || institutions['school'];
    };

    const isClass = (institutionType) => {
        return institutionType === 'school' || institutionType === 'gymnasium' || institutionType === 'lyceum';
    };

    const institutionType = getInstitutionType();
    const institutionInfo = getInstitutionInfo(institutionType);
    const isClassType = isClass(institutionType);

    const studentsCountText = isClassType ?
        `${t('admin.group.studentsCount')}: ${group.students?.length || 0}` :
        `${t('admin.group.studentsCount')}: ${group.students?.length || 0}`;

    const handleSubgroupsConfigured = () => {
        if (onUpdateGroups) {
            onUpdateGroups();
        }
    };

    return (
        <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: isMobile ? '8px' : '10px'
        }}>
            <div
                style={{
                    backgroundColor: isExpanded ? 'rgba(105, 180, 185, 0.1)' : '#f9fafb',
                    padding: isMobile ? '12px 16px' : '15px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: isMobile ? 'none' : 'background-color 0.3s ease',
                    minHeight: isMobile ? '60px' : 'auto'
                }}
                onClick={() => onToggle(group._id)}
                onMouseOver={(e) => {
                    if (!isMobile) {
                        e.currentTarget.style.backgroundColor = 'rgba(105, 180, 185, 0.2)';
                    }
                }}
                onMouseOut={(e) => {
                    if (!isMobile) {
                        e.currentTarget.style.backgroundColor = isExpanded ? 'rgba(105, 180, 185, 0.1)' : '#f9fafb';
                    }
                }}
            >
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? '6px' : '10px',
                    flex: 1,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '8px' : '10px'
                    }}>
                        <span style={{ fontSize: isMobile ? '16px' : '18px' }}>
                            {institutionInfo.icon}
                        </span>
                        <span style={{
                            fontWeight: '600',
                            fontSize: isMobile ? '15px' : '16px',
                            wordBreak: 'break-word'
                        }}>
                            {group.name}
                        </span>
                        {group.hasSubgroups && (
                            <span style={{
                                backgroundColor: 'rgba(105, 180, 185, 1)',
                                color: 'white',
                                fontSize: isMobile ? '11px' : '10px',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontWeight: '600'
                            }}>
                                {t('admin.subgroup.subgroupCount', { count: group.subgroupSettings?.numberOfSubgroups || 1 })}
                            </span>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: isMobile ? '4px' : '6px',
                        alignItems: 'center'
                    }}>
                        {group.curator && (
                            <span style={{
                                fontSize: isMobile ? '11px' : '12px',
                                color: '#6b7280',
                                backgroundColor: 'rgba(105, 180, 185, 0.2)',
                                padding: isMobile ? '2px 6px' : '2px 8px',
                                borderRadius: '12px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: isMobile ? '120px' : '200px'
                            }}>
                                {isClassType ? t('admin.group.classTeacher') : t('admin.group.curator')}: {group.curator.fullName}
                            </span>
                        )}

                        <span style={{
                            fontSize: isMobile ? '11px' : '12px',
                            color: '#6b7280',
                            backgroundColor: '#f3f4f6',
                            padding: isMobile ? '2px 6px' : '2px 8px',
                            borderRadius: '12px',
                            whiteSpace: 'nowrap'
                        }}>
                            {studentsCountText}
                        </span>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '6px' : '10px',
                    marginLeft: isMobile ? '8px' : '0',
                    flexShrink: 0
                }}>
                    <ConfigureSubgroupsButton
                        group={group}
                        databaseName={databaseName}
                        isMobile={isMobile}
                        onSubgroupsConfigured={handleSubgroupsConfigured}
                    />
                    {isExpanded ?
                        <FaChevronUp size={isMobile ? 16 : 18} /> :
                        <FaChevronDown size={isMobile ? 16 : 18} />
                    }
                </div>
            </div>

            {isExpanded && (
                <div style={{
                    backgroundColor: 'white',
                    borderTop: '1px solid #e5e7eb'
                }}>
                    {group.hasSubgroups && group.subgroups && group.subgroups.length > 0 ? (
                        <div style={{ padding: isMobile ? '12px' : '20px' }}>
                            <div style={{
                                marginBottom: '16px',
                                paddingBottom: '12px',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <h4 style={{
                                    margin: 0,
                                    fontSize: isMobile ? '16px' : '18px',
                                    color: '#374151',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FaCog />
                                    {t('admin.subgroup.subgroupsTitle', { count: group.subgroups.length })}
                                </h4>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: isMobile ? '12px' : '15px'
                            }}>
                                {group.subgroups.map((subgroup, index) => (
                                    <SubgroupItem
                                        key={subgroup._id}
                                        subgroup={subgroup}
                                        group={group}
                                        index={index}
                                        isExpanded={expandedSubgroups[subgroup._id]}
                                        onToggle={() => toggleSubgroup(subgroup._id)}
                                        onEditStudent={onEditStudent}
                                        onDeleteStudent={onDeleteStudent}
                                        isMobile={isMobile}
                                        isClass={isClassType}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <StudentsList
                            group={group}
                            onEditStudent={onEditStudent}
                            onDeleteStudent={onDeleteStudent}
                            isMobile={isMobile}
                            isClass={isClassType}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default GroupItem;