import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BRAND = 'rgba(105,180,185,1)';
const MONTHS_UK = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

const HomeworkReport = ({ journals, databaseName, isMobile }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (journals?.length > 0) load();
    }, [journals]);

    const load = async () => {
        setLoading(true);
        try {
            const ids = journals.flatMap(j => j.scheduleIds).join(',');
            const res = await axios.get('/api/homework/by-schedules', {
                params: { databaseName, ids }
            });
            setData(process(res.data || []));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const process = (entries) => {
        if (!entries.length) return null;

        const byMonth = {};
        const withFiles = entries.filter(e => e.files?.length > 0).length;

        entries.forEach(e => {
            const month = e.lessonDate?.slice(0, 7) || '';
            if (!byMonth[month]) byMonth[month] = 0;
            byMonth[month]++;
        });

        const monthStats = Object.entries(byMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({
                label: MONTHS_UK[parseInt(month.slice(5, 7)) - 1]?.slice(0, 3) || month,
                count,
            }));

        const maxCount = Math.max(...monthStats.map(m => m.count), 1);

        // Recent 5 entries
        const recent = [...entries].sort((a, b) => b.lessonDate?.localeCompare(a.lessonDate)).slice(0, 5);

        return { total: entries.length, withFiles, monthStats, maxCount, recent };
    };

    if (loading) return <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Завантаження...</div>;
    if (!data) return <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Домашніх завдань ще немає</div>;

    return (
        <div>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {[
                    { label: 'Завдань всього', value: data.total, highlight: true },
                    { label: 'З файлами', value: data.withFiles },
                    { label: 'Місяців', value: data.monthStats.length },
                ].map((s, i) => (
                    <div key={i} style={{
                        flex: '1', minWidth: '90px', padding: '14px 16px', borderRadius: '10px',
                        backgroundColor: s.highlight ? 'rgba(105,180,185,0.12)' : '#f9fafb',
                        border: `1px solid ${s.highlight ? 'rgba(105,180,185,0.3)' : '#e5e7eb'}`,
                    }}>
                        <div style={{ fontSize: '22px', fontWeight: '500', color: s.highlight ? BRAND : '#111827' }}>{s.value}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Sparkline-style chart */}
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '14px' }}>ДЗ по місяцях</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
                    {data.monthStats.map((m, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{m.count}</span>
                            <div style={{
                                width: '100%',
                                height: `${(m.count / data.maxCount) * 54}px`,
                                minHeight: '4px',
                                backgroundColor: BRAND,
                                borderRadius: '4px 4px 0 0',
                                opacity: 0.6 + 0.4 * (i / data.monthStats.length),
                                transition: 'height 0.5s ease',
                            }} />
                            <span style={{ fontSize: '10px', color: '#9ca3af' }}>{m.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent homework */}
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                    Останні завдання
                </div>
                {data.recent.map((e, i) => (
                    <div key={e._id} style={{
                        padding: '12px 16px',
                        borderBottom: i < data.recent.length - 1 ? '1px solid #f3f4f6' : 'none',
                        display: 'flex', alignItems: 'flex-start', gap: '12px',
                        backgroundColor: i % 2 === 0 ? 'white' : '#fafafa',
                    }}>
                        <div style={{
                            backgroundColor: 'rgba(105,180,185,0.1)', color: BRAND,
                            fontSize: '11px', fontWeight: '500', padding: '3px 7px',
                            borderRadius: '6px', flexShrink: 0, whiteSpace: 'nowrap',
                        }}>
                            {e.lessonDate?.slice(8)}.{e.lessonDate?.slice(5, 7)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {e.topic}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {e.text}
                            </div>
                        </div>
                        {e.files?.length > 0 && (
                            <span style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>📎{e.files.length}</span>
                        )}
                        <div style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            до {e.dueDate?.slice(8)}.{e.dueDate?.slice(5, 7)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeworkReport;