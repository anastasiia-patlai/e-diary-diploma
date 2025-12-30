import React from "react";
import { FaTimes, FaExclamationTriangle, FaTrash, FaUsers, FaUserFriends } from "react-icons/fa";

const DeleteCertainScheduleLesson = ({
    show,
    onClose,
    onDelete,
    schedule,
    loading = false,
    isMobile = false
}) => {
    const handleDelete = () => {
        if (schedule?._id) {
            onDelete(schedule._id);
        }
    };

    const handleClose = () => {
        onClose();
    };

    // Функції для обробки різних форматів даних
    const getSubject = () => {
        if (!schedule) return 'Не вказано';
        if (schedule.subject?.name) return schedule.subject.name;
        if (schedule.subject) return schedule.subject;
        if (schedule.teacher?.position) return schedule.teacher.position;
        return 'Не вказано';
    };

    const getGroupName = () => {
        if (!schedule) return 'Не вказано';
        if (schedule.group?.name) return schedule.group.name;
        if (schedule.groupName) return schedule.groupName;
        return 'Не вказано';
    };

    const getDayName = () => {
        if (!schedule) return 'Не вказано';
        if (schedule.dayOfWeek?.name) return schedule.dayOfWeek.name;
        if (schedule.dayOfWeekName) return schedule.dayOfWeekName;
        if (schedule.day) return schedule.day;
        return 'Не вказано';
    };

    const getTimeSlot = () => {
        if (!schedule) return 'Не вказано';
        if (schedule.timeSlot) {
            if (schedule.timeSlot.order && schedule.timeSlot.startTime && schedule.timeSlot.endTime) {
                return `${schedule.timeSlot.order}. ${schedule.timeSlot.startTime} - ${schedule.timeSlot.endTime}`;
            }
            if (schedule.timeSlot.startTime && schedule.timeSlot.endTime) {
                return `${schedule.timeSlot.startTime} - ${schedule.timeSlot.endTime}`;
            }
        }
        return 'Не вказано';
    };

    const getTeacherName = () => {
        if (!schedule) return 'Не вказано';
        if (schedule.teacher?.fullName) return schedule.teacher.fullName;
        if (schedule.teacherName) return schedule.teacherName;
        return 'Не вказано';
    };

    const getClassroomName = () => {
        if (!schedule) return 'Не вказано';
        if (schedule.classroom?.name) return schedule.classroom.name;
        if (schedule.classroomName) return schedule.classroomName;
        return 'Не вказано';
    };

    // Отримати інформацію про підгрупу
    const getSubgroupInfo = () => {
        if (!schedule) return { type: 'unknown', value: 'Не вказано' };

        // Перевіряємо різні способи, які може бути задано підгрупу
        const subgroup = schedule.subgroup || schedule.subGroup || schedule.subgroupNumber;
        const isFullGroup = schedule.isFullGroup === true || subgroup === 'all' || subgroup === undefined;

        if (isFullGroup) {
            return {
                type: 'full_group',
                value: 'Вся група',
                icon: <FaUsers style={{ marginRight: '6px', color: 'rgba(105, 180, 185, 1)' }} />
            };
        } else {
            const subgroupNumber = subgroup || '?';
            return {
                type: 'subgroup',
                value: `Підгрупа ${subgroupNumber}`,
                icon: <FaUserFriends style={{ marginRight: '6px', color: 'rgba(105, 180, 185, 1)' }} />
            };
        }
    };

    // Отримати додаткову інформацію про групу (якщо є)
    const getGroupAdditionalInfo = () => {
        if (!schedule) return null;

        const groupInfo = schedule.group;
        if (!groupInfo) return null;

        const info = [];

        // Категорія групи
        if (groupInfo.category) {
            info.push(groupInfo.category);
        }

        // Рівень навчання
        if (groupInfo.gradeLevel) {
            info.push(`${groupInfo.gradeLevel} курс`);
        }

        // Кількість підгруп
        if (groupInfo.hasSubgroups && groupInfo.subgroups?.length > 0) {
            info.push(`${groupInfo.subgroups.length} підгр.`);
        }

        return info.length > 0 ? info.join(' • ') : null;
    };

    // Отримати стиль для відображення підгрупи
    const getSubgroupStyle = (subgroupType) => {
        if (subgroupType === 'full_group') {
            return {
                backgroundColor: 'rgba(105, 180, 185, 0.1)',
                color: 'rgba(105, 180, 185, 1)',
                border: '1px solid rgba(105, 180, 185, 0.3)'
            };
        } else {
            return {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'rgb(59, 130, 246)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
            };
        }
    };

    if (!show || !schedule) return null;

    const subgroupInfo = getSubgroupInfo();
    const groupAdditionalInfo = getGroupAdditionalInfo();
    const subgroupStyle = getSubgroupStyle(subgroupInfo.type);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '24px',
                width: '90%',
                maxWidth: isMobile ? '95%' : '600px', // Збільшимо для додаткової інформації
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: isMobile ? '18px' : '20px',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <FaExclamationTriangle style={{ color: '#dc2626' }} />
                        Видалення заняття
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '20px',
                            color: '#6b7280',
                            transition: 'color 0.2s',
                            opacity: loading ? 0.5 : 1
                        }}
                        onMouseOver={(e) => {
                            if (!loading) e.target.style.color = '#374151';
                        }}
                        onMouseOut={(e) => {
                            if (!loading) e.target.style.color = '#6b7280';
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                    }}>
                        <FaExclamationTriangle style={{ color: '#dc2626', fontSize: '16px' }} />
                        <span style={{ fontWeight: '600', color: '#dc2626', fontSize: isMobile ? '14px' : '15px' }}>
                            Ця дія незворотня
                        </span>
                    </div>
                    <p style={{
                        margin: 0,
                        color: '#7f1d1d',
                        fontSize: isMobile ? '13px' : '14px',
                        lineHeight: '1.4'
                    }}>
                        Ви збираєтеся видалити заняття з розкладу. Ця дія не може бути скасована.
                    </p>
                </div>

                {/* Інформація про заняття у два стовпчики */}
                <div style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: isMobile ? '12px' : '16px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{
                        margin: '0 0 15px 0',
                        fontSize: isMobile ? '15px' : '16px',
                        color: '#374151'
                    }}>
                        Деталі заняття:
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                        gap: isMobile ? '12px' : '16px'
                    }}>
                        {/* Лівий стовпчик */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: isMobile ? '10px' : '12px'
                        }}>
                            <div>
                                <div style={{
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: '#6b7280',
                                    marginBottom: '4px'
                                }}>
                                    Предмет:
                                </div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#374151',
                                    fontSize: isMobile ? '14px' : '15px'
                                }}>
                                    {getSubject()}
                                </div>
                            </div>

                            <div>
                                <div style={{
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: '#6b7280',
                                    marginBottom: '4px'
                                }}>
                                    Група:
                                </div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#374151',
                                    fontSize: isMobile ? '14px' : '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    {getGroupName()}
                                </div>
                            </div>

                            <div>
                                <div style={{
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: '#6b7280',
                                    marginBottom: '4px'
                                }}>
                                    Тип заняття:
                                </div>
                                <div style={{
                                    fontWeight: '600',
                                    color: subgroupStyle.color,
                                    fontSize: isMobile ? '14px' : '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    {subgroupInfo.icon}
                                    {subgroupInfo.value}
                                </div>
                            </div>
                        </div>

                        {/* Правий стовпчик */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: isMobile ? '10px' : '12px'
                        }}>
                            <div>
                                <div style={{
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: '#6b7280',
                                    marginBottom: '4px'
                                }}>
                                    День та час:
                                </div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#374151',
                                    fontSize: isMobile ? '14px' : '15px'
                                }}>
                                    {getDayName()}, {getTimeSlot()}
                                </div>
                            </div>

                            <div>
                                <div style={{
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: '#6b7280',
                                    marginBottom: '4px'
                                }}>
                                    Викладач:
                                </div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#374151',
                                    fontSize: isMobile ? '14px' : '15px'
                                }}>
                                    {getTeacherName()}
                                </div>
                            </div>

                            <div>
                                <div style={{
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: '#6b7280',
                                    marginBottom: '4px'
                                }}>
                                    Аудиторія:
                                </div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#374151',
                                    fontSize: isMobile ? '14px' : '15px'
                                }}>
                                    {getClassroomName()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Додаткова інформація (якщо є) */}
                    {schedule.semester && (
                        <div style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid #e5e7eb'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: '#6b7280'
                                }}>
                                    Семестр:
                                </div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#374151',
                                    fontSize: isMobile ? '13px' : '14px'
                                }}>
                                    {schedule.semester?.name || 'Не вказано'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Кнопки дій */}
                <div style={{
                    display: 'flex',
                    gap: isMobile ? '8px' : '12px',
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: isMobile ? '10px' : '12px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: isMobile ? '13px' : '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'background-color 0.2s',
                            opacity: loading ? 0.5 : 1
                        }}
                        onMouseOver={(e) => {
                            if (!loading) e.target.style.backgroundColor = '#4b5563';
                        }}
                        onMouseOut={(e) => {
                            if (!loading) e.target.style.backgroundColor = '#6b7280';
                        }}
                    >
                        <FaTimes />
                        Скасувати
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: isMobile ? '10px' : '12px',
                            backgroundColor: loading ? '#d1d5db' : '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: isMobile ? '13px' : '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'background-color 0.2s',
                            opacity: loading ? 0.5 : 1
                        }}
                        onMouseOver={(e) => {
                            if (!loading) e.target.style.backgroundColor = '#b91c1c';
                        }}
                        onMouseOut={(e) => {
                            if (!loading) e.target.style.backgroundColor = '#dc2626';
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                Видалення...
                            </>
                        ) : (
                            <>
                                <FaTrash />
                                Видалити заняття
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCertainScheduleLesson;