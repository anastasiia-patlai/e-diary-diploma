import React from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import StudentsList from './StudentsList';

const GroupItem = ({ group, isExpanded, onToggle, onEditStudent, onDeleteStudent, isMobile }) => {
    // ФУНКЦІЯ ДЛЯ ВИЗНАЧЕННЯ ТИПУ ЗАКЛАДУ
    const getInstitutionType = () => {
        // ОТРИМУЄМО ІНФОРМАЦІЮ ПРО ШКОЛУ З ЛОКАЛЬНОГО СХОВИЩА
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

        // АВТОМАТИЧНЕ ВИЗНАЧЕННЯ ЗА НАЗВОЮ НАВЧАЛЬНОГО ЗАКЛАДУ
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

        // ЗА ЗАМОВЧУВАННЯМ - ШКОЛУ
        return 'school';
    };

    // ФУНКЦІЯ ДЛЯ ОТРИМАННЯ ІНФОРМАЦІЇ ПРО ЗАКЛАД
    const getInstitutionInfo = (type) => {
        const institutions = {
            'school': {
                label: 'Школа',
                groupLabel: 'Клас',  // Для школи - "клас"
                color: '#fef2f2',
                borderColor: '#fecaca',
                textColor: '#dc2626',
                icon: '🏫'
            },
            'gymnasium': {
                label: 'Гімназія',
                groupLabel: 'Клас',  // Для гімназії - "клас"
                color: '#fef2f2',
                borderColor: '#fecaca',
                textColor: '#dc2626',
                icon: '🎓'
            },
            'lyceum': {
                label: 'Ліцей',
                groupLabel: 'Клас',  // Для ліцею - "клас"
                color: '#fef2f2',
                borderColor: '#fecaca',
                textColor: '#dc2626',
                icon: '📚'
            },
            'college': {
                label: 'Коледж',
                groupLabel: 'Група',  // Для коледжу - "група"
                color: '#f0fdf4',
                borderColor: '#bbf7d0',
                textColor: '#16a34a',
                icon: '🎓'
            },
            'university': {
                label: 'Університет',
                groupLabel: 'Група',  // Для університету - "група"
                color: '#f0fdf4',
                borderColor: '#bbf7d0',
                textColor: '#16a34a',
                icon: '🏛️'
            }
        };

        return institutions[type] || institutions['school'];
    };

    // ФУНКЦІЯ ДЛЯ ВИЗНАЧЕННЯ, ЧИ Є ЗАКЛАД ШКОЛОЮ/ГІМНАЗІЄЮ/ЛІЦЕЄМ
    const isClass = (institutionType) => {
        return institutionType === 'school' || institutionType === 'gymnasium' || institutionType === 'lyceum';
    };

    const institutionType = getInstitutionType();
    const institutionInfo = getInstitutionInfo(institutionType);
    const isClassType = isClass(institutionType);

    // ВИЗНАЧАЄМО ТЕКСТ ДЛЯ КІЛЬКОСТІ СТУДЕНТІВ/УЧНІВ
    const studentsCountText = isClassType ?
        `Учнів: ${group.students?.length || 0}` :
        `Студентів: ${group.students?.length || 0}`;

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
                        <span style={{
                            fontSize: isMobile ? '16px' : '18px'
                        }}>
                            {institutionInfo.icon}
                        </span>
                        <span style={{
                            fontWeight: '600',
                            fontSize: isMobile ? '15px' : '16px',
                            wordBreak: 'break-word'
                        }}>
                            {group.name}
                        </span>
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
                                {isClassType ? 'Класний керівник' : 'Куратор'}: {group.curator.fullName}
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

                        <span style={{
                            fontSize: isMobile ? '12px' : '13px',
                            color: institutionInfo.textColor,
                            backgroundColor: institutionInfo.color,
                            padding: isMobile ? '2px 4px' : '2px 6px',
                            borderRadius: '8px',
                            border: `1px solid ${institutionInfo.borderColor}`,
                            whiteSpace: 'nowrap',
                            fontWeight: '500'
                        }}>
                            {institutionInfo.label} - {institutionInfo.groupLabel}
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
                    {isExpanded ?
                        <FaChevronUp size={isMobile ? 16 : 18} /> :
                        <FaChevronDown size={isMobile ? 16 : 18} />
                    }
                </div>
            </div>

            {isExpanded && (
                <StudentsList
                    group={group}
                    onEditStudent={onEditStudent}
                    onDeleteStudent={onDeleteStudent}
                    isMobile={isMobile}
                    isClass={isClassType}
                />
            )}
        </div>
    );
};

export default GroupItem;