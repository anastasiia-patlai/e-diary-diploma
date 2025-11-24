import React from "react";
import { FaPlus } from "react-icons/fa";

const ScheduleHeader = ({
    onShowModal,
    groups,
    selectedGroup,
    onGroupChange,
    semesters,
    selectedSemester,
    onSemesterChange
}) => {
    console.log("ScheduleHeader отримав semesters:", semesters);
    console.log("ScheduleHeader отримав selectedSemester:", selectedSemester);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        }}>
            <div>
                <h3 style={{ margin: 0, marginBottom: '4px' }}>Розклад занять</h3>
                <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: '14px'
                }}>
                    Управління розкладом для груп
                </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* Вибір семестру */}
                <div>
                    <select
                        value={selectedSemester || ""}
                        onChange={(e) => onSemesterChange(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none',
                            minWidth: '220px',
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
                    <select
                        value={selectedGroup}
                        onChange={(e) => onGroupChange(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none',
                            minWidth: '200px'
                        }}
                    >
                        <option value="">Всі групи</option>
                        {groups.map(group => (
                            <option key={group._id} value={group._id}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                )}

                {/* Кнопка додавання */}
                <button
                    onClick={onShowModal}
                    disabled={!selectedSemester}
                    style={{
                        backgroundColor: selectedSemester ? 'rgba(105, 180, 185, 1)' : '#d1d5db',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: selectedSemester ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'background-color 0.3s ease'
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
    );
};

export default ScheduleHeader;