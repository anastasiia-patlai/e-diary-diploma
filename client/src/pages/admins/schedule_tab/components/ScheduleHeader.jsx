import React from "react";
import { FaPlus } from "react-icons/fa";

const ScheduleHeader = ({
    onShowModal,
    groups,
    selectedGroup,
    onGroupChange,
    semesters,
    selectedSemester,
    onSemesterChange,
    isMobile = false
}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            marginBottom: isMobile ? '16px' : '20px',
            gap: isMobile ? '12px' : '0'
        }}>
            <div style={{
                marginBottom: isMobile ? '8px' : '0',
                textAlign: 'left'
            }}>
                <h3 style={{
                    margin: 0,
                    marginBottom: '4px',
                    fontSize: '26px',
                    fontWeight: '500'
                }}>
                    Розклад занять
                </h3>
                <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: isMobile ? '12px' : '14px'
                }}>
                    Управління розкладом для груп
                </p>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '8px' : '12px',
                alignItems: isMobile ? 'stretch' : 'center',
                width: isMobile ? '100%' : 'auto'
            }}>
                {/* Вибір семестру */}
                <div style={{ width: isMobile ? '100%' : 'auto' }}>
                    <select
                        value={selectedSemester || ""}
                        onChange={(e) => onSemesterChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: isMobile ? '10px 12px' : '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: isMobile ? '14px' : '14px',
                            outline: 'none',
                            minWidth: isMobile ? 'auto' : '220px',
                            backgroundColor: semesters.length === 0 ? '#f9fafb' : 'white'
                        }}
                        disabled={semesters.length === 0}
                    >
                        <option value="">
                            {semesters.length === 0 ? 'Немає семестрів' : 'Оберіть семестр'}
                        </option>
                        {semesters.map(semester => (
                            <option key={semester._id} value={semester._id}>
                                {semester.name} {semester.year} {semester.isActive && '(Активний)'}
                            </option>
                        ))}
                    </select>
                    {semesters.length === 0 && (
                        <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '4px'
                        }}>
                            Спочатку створіть семестр
                        </div>
                    )}
                </div>

                {/* Фільтр по групах */}
                {groups.length > 0 && selectedSemester && (
                    <div style={{ width: isMobile ? '100%' : 'auto' }}>
                        <select
                            value={selectedGroup}
                            onChange={(e) => onGroupChange(e.target.value)}
                            style={{
                                width: '100%',
                                padding: isMobile ? '10px 12px' : '8px 12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: isMobile ? '14px' : '14px',
                                outline: 'none',
                                minWidth: isMobile ? 'auto' : '200px'
                            }}
                        >
                            <option value="">Всі групи</option>
                            {groups.map(group => (
                                <option key={group._id} value={group._id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Кнопка додавання */}
                <div style={{ width: isMobile ? '100%' : 'auto' }}>
                    <button
                        onClick={onShowModal}
                        disabled={!selectedSemester}
                        style={{
                            width: isMobile ? '100%' : 'auto',
                            backgroundColor: selectedSemester ? 'rgba(105, 180, 185, 1)' : '#d1d5db',
                            color: 'white',
                            padding: isMobile ? '12px 16px' : '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: selectedSemester ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: isMobile ? '14px' : '14px',
                            fontWeight: '600',
                            transition: 'background-color 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => {
                            if (selectedSemester) {
                                e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.8)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (selectedSemester) {
                                e.target.style.backgroundColor = 'rgba(105, 180, 185, 1)';
                            }
                        }}
                    >
                        <FaPlus />
                        Додати заняття
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleHeader;