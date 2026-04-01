import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaUser, FaEnvelope, FaEdit, FaTrash } from "react-icons/fa";

const TeacherItem = ({ teacher, onEdit, onDelete, isMobile }) => {
    const { t } = useTranslation();

    // Функція для перекладу назви предмета
    const getTranslatedSubject = (subjectName) => {
        if (!subjectName) return subjectName;
        const translated = t(`subjects.${subjectName}`, { defaultValue: subjectName });
        return translated;
    };

    // Отримуємо унікальні предмети викладача (без дублювання)
    const getUniqueTeacherSubjects = () => {
        let subjectsSet = new Set(); // Використовуємо Set для унікальності

        // Додаємо предмети з поля position
        if (teacher.position) {
            teacher.position.split(',').forEach(subj => {
                const trimmed = subj.trim();
                if (trimmed) subjectsSet.add(trimmed);
            });
        }

        // Додаємо предмети з поля positions (масив)
        if (teacher.positions && teacher.positions.length > 0) {
            teacher.positions.forEach(subj => {
                const trimmed = subj.trim();
                if (trimmed) subjectsSet.add(trimmed);
            });
        }

        // Перетворюємо Set назад у масив і перекладаємо
        const uniqueSubjects = Array.from(subjectsSet);
        return uniqueSubjects.map(s => getTranslatedSubject(s)).join(', ');
    };

    const teacherSubjects = getUniqueTeacherSubjects();

    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '12px' : '15px',
            padding: isMobile ? '16px' : '12px 15px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            marginBottom: isMobile ? '12px' : '0'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '12px' : '15px',
                flex: 1
            }}>
                <div style={{
                    width: isMobile ? '48px' : '40px',
                    height: isMobile ? '48px' : '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(105, 180, 185, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(105, 180, 185, 1)',
                    flexShrink: 0
                }}>
                    <FaUser size={isMobile ? 18 : 16} />
                </div>
                <div style={{
                    flex: 1,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        fontWeight: '600',
                        marginBottom: isMobile ? '6px' : '4px',
                        fontSize: isMobile ? '16px' : '14px',
                        wordBreak: 'break-word'
                    }}>
                        {teacher.fullName}
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: isMobile ? '13px' : '12px',
                        color: '#6b7280',
                        marginBottom: isMobile ? '8px' : '4px'
                    }}>
                        <FaEnvelope size={isMobile ? 12 : 10} />
                        <span style={{
                            wordBreak: 'break-word'
                        }}>
                            {teacher.email}
                        </span>
                    </div>

                    {/* Предмети викладача - ТЕПЕР БЕЗ ДУБЛЮВАННЯ */}
                    {teacherSubjects && (
                        <div style={{
                            fontSize: isMobile ? '12px' : '11px',
                            color: '#374151',
                            marginBottom: isMobile ? '6px' : '4px',
                            display: 'inline-block',
                            backgroundColor: 'rgba(105, 180, 185, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '4px'
                        }}>
                            {t('admin.users.teacher.subjects')}: {teacherSubjects}
                        </div>
                    )}

                    {/* Категорія */}
                    {teacher.category && (
                        <div style={{
                            fontSize: isMobile ? '12px' : '11px',
                            color: '#059669',
                            fontWeight: '500',
                            backgroundColor: 'rgba(5, 150, 105, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            marginBottom: isMobile ? '6px' : '4px',
                            display: 'inline-block'
                        }}>
                            {teacher.category === 'Вища категорія' ? t('admin.users.teacher.qualifications.highest') :
                                teacher.category === 'Перша категорія' ? t('admin.users.teacher.qualifications.first') :
                                    teacher.category === 'Друга категорія' ? t('admin.users.teacher.qualifications.second') :
                                        teacher.category === 'Спеціаліст' ? t('admin.users.teacher.qualifications.specialist') :
                                            teacher.category === 'Молодший спеціаліст' ? t('admin.users.teacher.qualifications.juniorSpecialist') :
                                                teacher.category}
                        </div>
                    )}

                    {teacher.phone && (
                        <div style={{
                            fontSize: isMobile ? '13px' : '12px',
                            color: '#6b7280'
                        }}>
                            📞 {teacher.phone}
                        </div>
                    )}
                </div>
            </div>
            <div style={{
                display: 'flex',
                gap: '10px',
                width: isMobile ? '100%' : 'auto'
            }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(teacher);
                    }}
                    style={{
                        padding: isMobile ? '8px' : '4px 8px',
                        backgroundColor: 'rgba(105, 180, 185, 1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: isMobile ? '6px' : '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        flex: 1,
                        minHeight: '32px',
                        height: '32px',
                        transition: isMobile ? 'none' : 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <FaEdit size={isMobile ? 14 : 12} />
                    {t('admin.users.common.edit')}
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(teacher);
                    }}
                    style={{
                        padding: isMobile ? '8px' : '4px 8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: isMobile ? '6px' : '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        flex: 1,
                        minHeight: '32px',
                        height: '32px',
                        transition: isMobile ? 'none' : 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <FaTrash size={isMobile ? 14 : 12} />
                    {t('admin.users.common.delete')}
                </button>
            </div>
        </div>
    );
};

export default TeacherItem;