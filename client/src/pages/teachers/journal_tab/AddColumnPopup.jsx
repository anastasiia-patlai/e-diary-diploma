import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const COLUMN_TYPES = [
    { key: 'self', label: 'Самостійна', color: '#378ADD', bg: '#E6F1FB', textCol: '#0C447C' },
    { key: 'control', label: 'Контрольна', color: '#D85A30', bg: '#FAECE7', textCol: '#712B13' },
    { key: 'theme', label: 'Тематична', color: '#639922', bg: '#EAF3DE', textCol: '#27500A' },
    { key: 'quarter', label: 'За чверть', color: '#7F77DD', bg: '#EEEDFE', textCol: '#3C3489' },
    { key: 'semester', label: 'Семестрова', color: '#BA7517', bg: '#FAEEDA', textCol: '#633806' },
];

// preselectedDate: 'YYYY-MM-DD' string passed from JournalTable when clicking + on a date
const AddColumnPopup = ({ dates, preselectedDate, onAdd, onClose }) => {
    const [selectedType, setSelectedType] = useState(null);

    const handleAdd = () => {
        if (!selectedType) return;
        onAdd({ type: selectedType, date: preselectedDate });
    };

    const isValid = !!selectedType;

    // Format the preselected date nicely for display
    const dateObj = dates.find(d => d.fullDate === preselectedDate);
    const dateLabel = dateObj
        ? `${dateObj.formatted} (${dateObj.dayOfWeek})`
        : preselectedDate;

    return (
        <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '300px',
                maxWidth: '95vw',
                border: '0.5px solid #e5e7eb'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                        Стовпець оцінювання
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af' }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Fixed date badge */}
                <div style={{
                    backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
                    borderRadius: '8px', padding: '8px 12px',
                    marginBottom: '16px',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <span style={{ fontSize: '12px', color: '#0369a1' }}>Дата уроку:</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#0c4a6e' }}>{dateLabel}</span>
                </div>

                {/* Type selection */}
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 10px' }}>
                    Виберіть тип оцінювання
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                    {COLUMN_TYPES.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setSelectedType(t.key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '9px 12px',
                                border: `1.5px solid ${selectedType === t.key ? t.color : '#e5e7eb'}`,
                                borderRadius: '8px',
                                backgroundColor: selectedType === t.key ? t.bg : 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: selectedType === t.key ? t.textCol : '#374151',
                                fontWeight: selectedType === t.key ? '500' : '400',
                                transition: 'all 0.12s',
                                textAlign: 'left',
                            }}
                        >
                            <span style={{
                                width: '10px', height: '10px', borderRadius: '50%',
                                backgroundColor: t.color, flexShrink: 0
                            }} />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '9px 16px',
                            border: '1px solid #e5e7eb', borderRadius: '7px',
                            cursor: 'pointer', backgroundColor: 'transparent',
                            color: '#6b7280', fontSize: '14px'
                        }}
                    >
                        Скасувати
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!isValid}
                        style={{
                            padding: '9px 20px',
                            border: 'none', borderRadius: '7px',
                            cursor: isValid ? 'pointer' : 'not-allowed',
                            backgroundColor: isValid ? 'rgba(105, 180, 185, 1)' : '#d1d5db',
                            color: 'white', fontSize: '14px', fontWeight: '500'
                        }}
                    >
                        Додати
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddColumnPopup;