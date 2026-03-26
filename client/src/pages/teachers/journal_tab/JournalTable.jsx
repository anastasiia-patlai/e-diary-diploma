import React, { useState } from 'react';

const COLUMN_TYPES = {
    self: { label: 'С/р', short: 'С/р', fullName: 'Самостійна робота', color: '#69b4b9', bg: '#e0f4f5', textCol: '#0e6b72' },
    control: { label: 'К/р', short: 'К/р', fullName: 'Контрольна робота', color: '#69b4b9', bg: '#e0f4f5', textCol: '#0e6b72' },
    theme: { label: 'Т/о', short: 'Тем', fullName: 'Тематична оцінка', color: '#69b4b9', bg: '#e0f4f5', textCol: '#0e6b72' },
    quarter: { label: 'За чверть', short: 'Ч', fullName: 'Оцінка за чверть', color: '#7F77DD', bg: '#EEEDFE', textCol: '#3C3489' },
    semester: { label: 'Семестрова', short: 'Сем', fullName: 'Семестрова оцінка', color: '#BA7517', bg: '#FAEEDA', textCol: '#633806' },
};

// type border colors (left accent line on assessment columns)
const TYPE_ACCENT = {
    self: '#69b4b9',
    control: '#69b4b9',
    theme: '#69b4b9',
    quarter: '#7F77DD',
    semester: '#BA7517',
};

const BRAND = 'rgba(105, 180, 185, 1)';

const GradeCircle = ({ value }) => (
    <span style={{
        backgroundColor: BRAND,
        color: 'white',
        width: '30px', height: '30px',
        borderRadius: '50%',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '500', fontSize: '13px',
        flexShrink: 0,
    }}>
        {value}
    </span>
);

const AbsentBadge = ({ label = 'Н' }) => (
    <span style={{
        backgroundColor: '#ef4444', color: 'white',
        width: '30px', height: '30px', borderRadius: '4px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '500', fontSize: label.length > 1 ? '11px' : '13px',
        flexShrink: 0,
    }}>{label}</span>
);

const renderAttendanceStatus = (attendance) => {
    if (!attendance) return null;
    if (attendance.records) {
        const absentCount = attendance.records.filter(r => r.status === 'absent').length;
        if (absentCount === attendance.totalLessons && attendance.totalLessons > 0)
            return <AbsentBadge />;
        if (absentCount > 0)
            return <AbsentBadge label={`${absentCount}/${attendance.totalLessons}`} />;
    }
    if (attendance.status === 'absent') return <AbsentBadge />;
    return null;
};

const DASH = <span style={{ color: '#d1d5db' }}>—</span>;

const JournalTable = ({
    students,
    dates,
    journalColumns = [],
    getGradeForStudentAndDate,
    getGradeForStudentAndColumn,
    getAttendanceForStudentAndDate,
    onCellClick,
    onColumnCellClick,
    onAddColumn,
    onDeleteColumn,
    isMobile,
}) => {
    const [hoveredDateKey, setHoveredDateKey] = useState(null);
    const [hoveredColId, setHoveredColId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    // Mobile: track which date header was tapped to show + button
    const [tappedDateKey, setTappedDateKey] = useState(null);

    // Returns true when the + button should be visible for a given date
    const showPlus = (dateKey, isHoliday) => {
        if (isHoliday) return false;
        if (isMobile) return tappedDateKey === dateKey;
        return hoveredDateKey === dateKey;
    };

    const handleDateHeaderTap = (dateKey, e) => {
        e.stopPropagation();
        setTappedDateKey(prev => (prev === dateKey ? null : dateKey));
    };

    // per-date sequence per type (for "С/р №2")
    const typeSeqPerDate = {};
    journalColumns.forEach(col => {
        const k = `${col.date}_${col.type}`;
        typeSeqPerDate[col._id] = (typeSeqPerDate[k] = (typeSeqPerDate[k] || 0) + 1);
    });
    const colsPerDate = {};
    journalColumns.forEach(col => {
        colsPerDate[col.date] = (colsPerDate[col.date] || 0) + 1;
    });

    const handleDeleteClick = (col) => {
        const t = COLUMN_TYPES[col.type];
        setDeleteConfirm({ id: col._id, label: `${t.label} (${col.date.slice(5).replace('-', '.')})` });
    };

    const confirmDelete = () => {
        if (deleteConfirm) onDeleteColumn(deleteConfirm.id);
        setDeleteConfirm(null);
    };

    return (
        <>
            {/* Custom delete confirm modal */}
            {deleteConfirm && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    backgroundColor: 'rgba(0,0,0,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        background: 'white', borderRadius: '12px', padding: '28px 24px',
                        width: '340px', maxWidth: '95vw',
                        border: '0.5px solid #e5e7eb',
                    }}>
                        <div style={{ fontWeight: '500', fontSize: '16px', marginBottom: '10px', color: '#111827' }}>
                            Видалити стовпець?
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                            Стовпець <strong style={{ color: '#374151' }}>{deleteConfirm.label}</strong> та всі оцінки в ньому будуть видалені. Це незворотно.
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                style={{ padding: '9px 18px', borderRadius: '7px', border: '1px solid #e5e7eb', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#6b7280' }}
                            >
                                Скасувати
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{ padding: '9px 18px', borderRadius: '7px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                            >
                                Видалити
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px 8px 0 0', overflow: 'auto', maxHeight: '70vh', backgroundColor: 'white' }}>
                <table style={{
                    width: '100%', borderCollapse: 'collapse',
                    minWidth: `${dates.length * 90 + journalColumns.length * 66 + 200}px`,
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb' }}>
                            {/* Sticky name header */}
                            <th style={{
                                padding: '12px', textAlign: 'left',
                                borderBottom: '2px solid #e5e7eb',
                                position: 'sticky', top: 0, left: 0,
                                backgroundColor: '#f9fafb', zIndex: 3,
                                minWidth: '200px', boxShadow: '2px 0 0 #e5e7eb',
                            }}>
                                Учень
                            </th>

                            {dates.map((date) => {
                                const dateCols = journalColumns.filter(c => c.date === date.fullDate);
                                const isHov = hoveredDateKey === date.fullDate;
                                const plusVisible = showPlus(date.fullDate, date.isHoliday);

                                return (
                                    <React.Fragment key={date.fullDate}>
                                        {/* Date header */}
                                        <th
                                            onMouseEnter={() => !date.isHoliday && setHoveredDateKey(date.fullDate)}
                                            onMouseLeave={() => setHoveredDateKey(null)}
                                            onClick={isMobile && !date.isHoliday
                                                ? (e) => handleDateHeaderTap(date.fullDate, e)
                                                : undefined}
                                            style={{
                                                padding: 0,
                                                textAlign: 'center',
                                                borderBottom: '2px solid #e5e7eb',
                                                borderLeft: '1px solid #e5e7eb',
                                                position: 'sticky', top: 0,
                                                backgroundColor: date.isHoliday ? '#fff3f0'
                                                    : (isHov || tappedDateKey === date.fullDate) ? '#f0fafb'
                                                        : '#f9fafb',
                                                zIndex: 1,
                                                minWidth: isMobile ? '64px' : '84px',
                                                color: date.isHoliday ? '#ef4444' : 'inherit',
                                                transition: 'background-color 0.15s',
                                                overflow: 'visible',
                                                cursor: isMobile && !date.isHoliday ? 'pointer' : 'default',
                                            }}
                                        >
                                            <div style={{
                                                position: 'relative',
                                                padding: isMobile ? '6px 10px 22px' : '10px 14px',
                                                overflow: 'visible',
                                            }}>
                                                <div style={{ fontWeight: '500', fontSize: '13px' }}>{date.formatted}</div>
                                                <div style={{ fontSize: '11px', color: date.isHoliday ? '#ef4444' : '#6b7280' }}>
                                                    {date.dayOfWeek}
                                                </div>
                                                {date.isHoliday && (
                                                    <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: '600', marginTop: '2px' }}>
                                                        Канікули
                                                    </div>
                                                )}

                                                {/* Desktop: + floats on right edge on hover */}
                                                {!isMobile && plusVisible && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onAddColumn(date.fullDate); }}
                                                        title="Додати стовпець оцінювання"
                                                        style={{
                                                            position: 'absolute',
                                                            right: '-11px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            width: '22px', height: '22px',
                                                            borderRadius: '50%',
                                                            backgroundColor: BRAND,
                                                            color: 'white',
                                                            border: '2px solid white',
                                                            cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '14px', fontWeight: '500', lineHeight: '1',
                                                            zIndex: 20,
                                                            boxShadow: '0 1px 6px rgba(0,0,0,0.22)',
                                                            padding: 0,
                                                        }}
                                                    >+</button>
                                                )}

                                                {/* Mobile: + always shown at bottom of date cell */}
                                                {isMobile && !date.isHoliday && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onAddColumn(date.fullDate); }}
                                                        title="Додати стовпець оцінювання"
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: '2px',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            width: '18px', height: '18px',
                                                            borderRadius: '50%',
                                                            backgroundColor: BRAND,
                                                            color: 'white',
                                                            border: '1.5px solid white',
                                                            cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '13px', fontWeight: '500', lineHeight: '1',
                                                            zIndex: 5,
                                                            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                                                            padding: 0,
                                                            opacity: 0.85,
                                                        }}
                                                    >+</button>
                                                )}
                                            </div>
                                        </th>

                                        {/* Assessment columns pinned to this date */}
                                        {dateCols.map((col) => {
                                            const t = COLUMN_TYPES[col.type];
                                            const seq = typeSeqPerDate[col._id];
                                            const showSeq = colsPerDate[col.date] > 1;
                                            const isColHov = hoveredColId === col._id;
                                            const accent = TYPE_ACCENT[col.type];

                                            return (
                                                <th
                                                    key={col._id}
                                                    onMouseEnter={() => setHoveredColId(col._id)}
                                                    onMouseLeave={() => setHoveredColId(null)}
                                                    style={{
                                                        width: '66px', minWidth: '66px',
                                                        padding: 0,
                                                        borderBottom: '2px solid #e5e7eb',
                                                        borderLeft: `2px solid ${accent}`,
                                                        position: 'sticky', top: 0,
                                                        backgroundColor: isColHov ? t.bg : '#f9fafb',
                                                        zIndex: 1,
                                                        transition: 'background-color 0.15s',
                                                    }}
                                                >
                                                    <div style={{
                                                        display: 'flex', flexDirection: 'column',
                                                        alignItems: 'center', justifyContent: 'center',
                                                        padding: '5px 4px', minHeight: '58px',
                                                        position: 'relative', gap: '3px',
                                                    }}>
                                                        <span style={{
                                                            backgroundColor: t.bg, color: t.textCol,
                                                            fontSize: '11px', padding: '2px 6px',
                                                            borderRadius: '4px', fontWeight: '500',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {t.label}{showSeq ? ` №${seq}` : ''}
                                                        </span>
                                                        <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                                                            {col.date.slice(5).replace('-', '.')}
                                                        </span>

                                                        {isColHov && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(col); }}
                                                                title="Видалити стовпець"
                                                                style={{
                                                                    position: 'absolute', top: '3px', right: '3px',
                                                                    width: '15px', height: '15px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: '#ef4444',
                                                                    color: 'white', border: 'none',
                                                                    cursor: 'pointer',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: '11px', fontWeight: '500',
                                                                    padding: 0, lineHeight: 1,
                                                                }}
                                                            >×</button>
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {students.map((student, rowIndex) => (
                            <tr
                                key={student._id}
                                style={{
                                    borderBottom: '1px solid #e5e7eb',
                                    backgroundColor: rowIndex % 2 === 0 ? 'white' : '#fafafa',
                                }}
                            >
                                {/* Name */}
                                <td style={{
                                    padding: '10px 12px',
                                    borderBottom: '1px solid #e5e7eb',
                                    position: 'sticky', left: 0,
                                    backgroundColor: 'inherit', fontWeight: '500',
                                    boxShadow: '2px 0 0 #e5e7eb', zIndex: 1,
                                    whiteSpace: 'nowrap',
                                }}>
                                    {student.fullName}
                                </td>

                                {dates.map((date) => {
                                    const dateCols = journalColumns.filter(c => c.date === date.fullDate);
                                    // #1 — regular grade AND attendance are shown; assessment column grade is independent
                                    const grade = getGradeForStudentAndDate(student._id, date);
                                    const attendance = getAttendanceForStudentAndDate(student._id, date);
                                    const isDateHov = hoveredDateKey === date.fullDate;

                                    return (
                                        <React.Fragment key={date.fullDate}>
                                            {/* Date body cell */}
                                            {date.isHoliday ? (
                                                <td style={{
                                                    padding: '8px', textAlign: 'center',
                                                    borderBottom: '1px solid #e5e7eb',
                                                    borderLeft: '1px solid #e5e7eb',
                                                    backgroundColor: '#fff3f0', cursor: 'not-allowed',
                                                }}>
                                                    <span style={{ color: '#ef4444', fontSize: '12px' }}>✕</span>
                                                </td>
                                            ) : (
                                                <td
                                                    onClick={() => onCellClick(student._id, date)}
                                                    onMouseEnter={() => !isMobile && setHoveredDateKey(date.fullDate)}
                                                    onMouseLeave={() => !isMobile && setHoveredDateKey(null)}
                                                    style={{
                                                        padding: '8px', textAlign: 'center',
                                                        borderBottom: '1px solid #e5e7eb',
                                                        borderLeft: '1px solid #e5e7eb',
                                                        cursor: 'pointer',
                                                        backgroundColor: isDateHov ? '#f3f4f6' : 'inherit',
                                                        transition: 'background-color 0.15s',
                                                        height: '46px',
                                                    }}
                                                >
                                                    {/* #1: show grade OR attendance — grade wins */}
                                                    {grade
                                                        ? <GradeCircle value={grade} />
                                                        : renderAttendanceStatus(attendance) || DASH
                                                    }
                                                </td>
                                            )}

                                            {/* Assessment column cells for this date */}
                                            {dateCols.map((col) => {
                                                const colGrade = getGradeForStudentAndColumn(student._id, col._id);
                                                const isColHov = hoveredColId === col._id;
                                                const accent = TYPE_ACCENT[col.type];
                                                const t = COLUMN_TYPES[col.type];

                                                return (
                                                    <td
                                                        key={col._id}
                                                        onClick={() => onColumnCellClick(student._id, col)}
                                                        onMouseEnter={() => setHoveredColId(col._id)}
                                                        onMouseLeave={() => setHoveredColId(null)}
                                                        style={{
                                                            width: '66px', minWidth: '66px',
                                                            padding: '8px 4px',
                                                            textAlign: 'center',
                                                            borderBottom: '1px solid #e5e7eb',
                                                            borderLeft: `2px solid ${accent}`,
                                                            cursor: 'pointer',
                                                            backgroundColor: isColHov ? t.bg : 'inherit',
                                                            transition: 'background-color 0.15s',
                                                            height: '46px',
                                                        }}
                                                    >
                                                        {/* #1: assessment column grade is fully independent */}
                                                        {colGrade ? <GradeCircle value={colGrade} /> : DASH}
                                                    </td>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {/* Instruction - left block */}
                <div style={{
                    flex: '1 1 300px',
                    backgroundColor: '#fafafa',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ fontSize: '14px', color: '#374151', fontWeight: '600', marginBottom: '12px' }}>
                        Як користуватись:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(isMobile ? [
                            'Натисніть на клітинку — поставте оцінку або відмітку про відсутність',
                            'Натисніть «+» під датою — додайте стовпець оцінювання',
                            'Натисніть на заголовок стовпця оцінювання — з\'явиться «×» для видалення',
                            'Оцінка за урок та оцінка в стовпці оцінювання — незалежні',
                        ] : [
                            'Натисніть на клітинку — поставте оцінку або відмітку про відсутність',
                            'Наведіть на дату — з\'явиться кнопка «+» для додавання стовпця оцінювання',
                            'Наведіть на заголовок стовпця оцінювання — з\'явиться «×» для видалення',
                            'Оцінка за урок та оцінка в стовпці оцінювання — незалежні',
                        ]).map((tip, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#4b5563', lineHeight: '1.45' }}>
                                <span style={{
                                    backgroundColor: '#e5e7eb', color: '#374151',
                                    borderRadius: '50%', width: '20px', height: '20px',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', fontWeight: '600', flexShrink: 0, marginTop: '2px',
                                }}>{i + 1}</span>
                                {tip}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Legend - right block */}
                <div style={{
                    flex: '1 1 300px',
                    backgroundColor: '#fafafa',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ fontSize: '14px', color: '#374151', fontWeight: '600', marginBottom: '12px' }}>
                        Позначення:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#4b5563' }}>
                            <GradeCircle value={10} />
                            <span>— оцінка за урок</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#4b5563' }}>
                            <AbsentBadge />
                            <span>— повна відсутність</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#4b5563' }}>
                            <AbsentBadge label="2/6" />
                            <span>— часткова відсутність</span>
                        </span>
                        {Object.entries(COLUMN_TYPES).map(([key, t]) => (
                            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#4b5563' }}>
                                <span style={{
                                    backgroundColor: t.bg, color: t.textCol,
                                    fontSize: '12px', padding: '4px 10px', borderRadius: '6px',
                                    fontWeight: '500', border: `1.5px solid ${TYPE_ACCENT[key]}`,
                                    whiteSpace: 'nowrap', flexShrink: 0,
                                }}>
                                    {t.label}
                                </span>
                                <span>— {t.fullName}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default JournalTable;