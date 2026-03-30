import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BRAND = 'rgba(105,180,185,1)';

const ClassCompareReport = ({ journals, databaseName, isMobile }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (journals?.length > 0) load();
    }, [journals]);

    const load = async () => {
        setLoading(true);
        try {
            const results = await Promise.all(
                journals.map(async (j) => {
                    try {
                        const ids = j.scheduleIds.join(',');
                        const res = await axios.get('/api/grades/by-schedules', {
                            params: { databaseName, ids }
                        });
                        const regular = (res.data || []).filter(g => !g.columnId || g.columnId === 'null');
                        const avg = regular.length
                            ? (regular.reduce((s, g) => s + Number(g.value), 0) / regular.length).toFixed(1)
                            : null;
                        return { ...j, avg, count: regular.length };
                    } catch {
                        return { ...j, avg: null, count: 0 };
                    }
                })
            );

            setData(results.filter(r => r.avg !== null).sort((a, b) => b.avg - a.avg));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getBarWidth = (avg) => `${(parseFloat(avg) / 12) * 100}%`;

    const getColor = (avg) => {
        const n = parseFloat(avg);
        if (n >= 9) return { bar: '#10b981', badge: '#d1fae5', text: '#065f46' };
        if (n >= 7) return { bar: BRAND, badge: 'rgba(105,180,185,0.15)', text: '#0e6b72' };
        if (n >= 5) return { bar: '#f59e0b', badge: '#fef3c7', text: '#92400e' };
        return { bar: '#ef4444', badge: '#fee2e2', text: '#991b1b' };
    };

    if (loading) return <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Завантаження...</div>;
    if (data.length === 0) return <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Недостатньо даних для порівняння</div>;
    if (data.length === 1) return <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Тільки один клас — немає що порівнювати</div>;

    // Group by subject
    const bySubject = {};
    data.forEach(d => {
        if (!bySubject[d.subject]) bySubject[d.subject] = [];
        bySubject[d.subject].push(d);
    });

    return (
        <div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                Порівняння середнього балу між класами по кожному предмету
            </div>
            {Object.entries(bySubject).map(([subject, items]) => (
                <div key={subject} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {subject}
                        <span style={{ fontSize: '12px', backgroundColor: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: '10px', fontWeight: '400' }}>
                            {items.length} {items.length === 1 ? 'клас' : 'класи/класів'}
                        </span>
                    </div>
                    {items.map((item, i) => {
                        const clr = getColor(item.avg);
                        const label = item.subgroup && item.subgroup !== 'all'
                            ? `${item.groupName} (п.${item.subgroup})`
                            : item.groupName;
                        return (
                            <div key={i} style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '13px', color: '#374151', minWidth: isMobile ? '80px' : '120px', flexShrink: 0 }}>
                                        {label}
                                    </span>
                                    <div style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: '6px', height: '16px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: getBarWidth(item.avg),
                                            backgroundColor: clr.bar,
                                            borderRadius: '6px',
                                            transition: 'width 0.6s ease',
                                            opacity: 0.85,
                                        }} />
                                    </div>
                                    <span style={{
                                        backgroundColor: clr.badge, color: clr.text,
                                        fontSize: '12px', fontWeight: '500',
                                        padding: '2px 8px', borderRadius: '10px',
                                        minWidth: '36px', textAlign: 'center', flexShrink: 0,
                                    }}>
                                        {item.avg}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>({item.count})</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default ClassCompareReport;