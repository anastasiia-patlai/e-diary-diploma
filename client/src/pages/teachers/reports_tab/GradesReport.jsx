import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BRAND = 'rgba(105,180,185,1)';
const BRAND_LIGHT = 'rgba(105,180,185,0.12)';

const MONTHS_UK = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

const GradesReport = ({ journals, databaseName, isMobile }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef();

    useEffect(() => {
        if (journals?.length > 0) load();
    }, [journals]);

    useEffect(() => {
        if (data) drawChart();
    }, [data]);

    const load = async () => {
        setLoading(true);
        try {
            const ids = journals.flatMap(j => j.scheduleIds).join(',');
            const res = await axios.get('/api/grades/by-schedules', {
                params: { databaseName, ids }
            });
            const grades = res.data || [];
            setData(processGrades(grades));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const processGrades = (grades) => {
        // Only regular grades (no column)
        const regular = grades.filter(g => !g.columnId || g.columnId === 'null');
        if (regular.length === 0) return null;

        // Group by month
        const byMonth = {};
        const byStudent = {};

        regular.forEach(g => {
            const dateStr = typeof g.date === 'string' ? g.date : new Date(g.date).toISOString();
            const month = dateStr.slice(0, 7); // YYYY-MM
            if (!byMonth[month]) byMonth[month] = [];
            byMonth[month].push(Number(g.value));

            const sid = (g.student?._id || g.student)?.toString();
            const sname = g.student?.fullName || 'Невідомий';
            if (!byStudent[sid]) byStudent[sid] = { name: sname, grades: [] };
            byStudent[sid].grades.push(Number(g.value));
        });

        const monthStats = Object.entries(byMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, vals]) => ({
                month,
                label: MONTHS_UK[parseInt(month.slice(5, 7)) - 1],
                avg: (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1),
                count: vals.length,
            }));

        const studentStats = Object.entries(byStudent).map(([id, s]) => ({
            id, name: s.name,
            avg: (s.grades.reduce((a, b) => a + b, 0) / s.grades.length).toFixed(1),
            count: s.grades.length,
        })).sort((a, b) => b.avg - a.avg);

        const total = regular.reduce((s, g) => s + Number(g.value), 0);
        const avgTotal = (total / regular.length).toFixed(1);

        return { monthStats, studentStats, avgTotal, totalGrades: regular.length };
    };

    const drawChart = () => {
        if (!canvasRef.current || !data?.monthStats?.length) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const W = canvas.offsetWidth || 500;
        const H = 160;
        canvas.width = W * window.devicePixelRatio;
        canvas.height = H * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        ctx.clearRect(0, 0, W, H);

        const pad = { top: 16, bottom: 32, left: 28, right: 10 };
        const chartW = W - pad.left - pad.right;
        const chartH = H - pad.top - pad.bottom;
        const months = data.monthStats;
        const barW = Math.min(36, (chartW / months.length) * 0.55);
        const gap = (chartW - barW * months.length) / (months.length + 1);

        // Grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        [2, 4, 6, 8, 10].forEach(v => {
            const y = pad.top + chartH - (v / 12) * chartH;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(W - pad.right, y);
            ctx.stroke();
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(v, pad.left - 4, y + 3);
        });

        months.forEach((m, i) => {
            const x = pad.left + gap + i * (barW + gap);
            const barH = (m.avg / 12) * chartH;
            const y = pad.top + chartH - barH;
            const alpha = 0.55 + (i / months.length) * 0.45;

            // Bar
            ctx.fillStyle = `rgba(105,180,185,${alpha})`;
            ctx.beginPath();
            ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
            ctx.fill();

            // Value on top
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(m.avg, x + barW / 2, y - 4);

            // Month label
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.font = '10px sans-serif';
            ctx.fillText(m.label.slice(0, 3), x + barW / 2, H - 6);
        });
    };

    const getGradeColor = (avg) => {
        const n = parseFloat(avg);
        if (n >= 9) return { bg: '#d1fae5', text: '#065f46' };
        if (n >= 7) return { bg: BRAND_LIGHT, text: '#0e6b72' };
        if (n >= 5) return { bg: '#fef3c7', text: '#92400e' };
        return { bg: '#fee2e2', text: '#991b1b' };
    };

    if (loading) return <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Завантаження...</div>;
    if (!data) return <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Немає даних про оцінки</div>;

    return (
        <div>
            {/* Summary stats */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {[
                    { label: 'Середній бал', value: data.avgTotal, highlight: true },
                    { label: 'Всього оцінок', value: data.totalGrades },
                    { label: 'Місяців', value: data.monthStats.length },
                ].map((s, i) => (
                    <div key={i} style={{
                        flex: '1', minWidth: '100px',
                        padding: '14px 16px', borderRadius: '10px',
                        backgroundColor: s.highlight ? BRAND_LIGHT : '#f9fafb',
                        border: `1px solid ${s.highlight ? 'rgba(105,180,185,0.3)' : '#e5e7eb'}`,
                    }}>
                        <div style={{ fontSize: '22px', fontWeight: '500', color: s.highlight ? BRAND : '#111827' }}>{s.value}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div style={{ marginBottom: '20px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>Середній бал по місяцях</div>
                <canvas ref={canvasRef} style={{ width: '100%', height: '160px', display: 'block' }} />
            </div>

            {/* Top / bottom students */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {/* Top 5 */}
                <div style={{ flex: '1 1 200px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>Кращі учні</div>
                    {data.studentStats.slice(0, 5).map((s, i) => {
                        const clr = getGradeColor(s.avg);
                        return (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                                <span style={{ width: '18px', fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>{i + 1}</span>
                                <span style={{ flex: 1, fontSize: '13px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                                <span style={{ backgroundColor: clr.bg, color: clr.text, fontSize: '12px', fontWeight: '500', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 }}>{s.avg}</span>
                            </div>
                        );
                    })}
                </div>
                {/* Bottom 5 */}
                <div style={{ flex: '1 1 200px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>Потребують уваги</div>
                    {[...data.studentStats].reverse().slice(0, 5).map((s, i) => {
                        const clr = getGradeColor(s.avg);
                        return (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                                <span style={{ width: '18px', fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>{i + 1}</span>
                                <span style={{ flex: 1, fontSize: '13px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                                <span style={{ backgroundColor: clr.bg, color: clr.text, fontSize: '12px', fontWeight: '500', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 }}>{s.avg}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GradesReport;