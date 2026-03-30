import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaUser } from 'react-icons/fa';

const BRAND = 'rgba(105,180,185,1)';

const StudentReport = ({ journals, curatorGroup, databaseName, isMobile }) => {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        if (journals?.length > 0) loadStudents();
    }, [journals, curatorGroup]);

    useEffect(() => {
        if (selected) buildReport(selected._id);
    }, [selected]);

    const loadStudents = async () => {
        setLoadingStudents(true);
        try {
            // Collect unique group IDs from journals + curator group
            const journalGroupIds = [...new Set(journals.map(j => j.groupId).filter(Boolean))];
            const curatorGroupId = curatorGroup?._id?.toString();
            const groupIds = curatorGroupId && !journalGroupIds.includes(curatorGroupId)
                ? [...journalGroupIds, curatorGroupId]
                : journalGroupIds;
            const allStudents = new Map();
            await Promise.all(groupIds.map(async (gid) => {
                try {
                    const res = await axios.get(`/api/groups/${gid}`, { params: { databaseName } });
                    (res.data.students || []).forEach(st => {
                        allStudents.set(st._id?.toString(), { ...st, groupName: res.data.name });
                    });
                    // Also add subgroup students
                    (res.data.subgroups || []).forEach(sg =>
                        (sg.students || []).forEach(st =>
                            allStudents.set(st._id?.toString(), { ...st, groupName: res.data.name })
                        )
                    );
                } catch { /* skip */ }
            }));
            setStudents([...allStudents.values()].sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'uk')));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingStudents(false);
        }
    };

    const buildReport = async (studentId) => {
        setLoading(true);
        setReport(null);
        try {
            const ids = journals.flatMap(j => j.scheduleIds).join(',');

            const [gradesRes, hwRes] = await Promise.all([
                axios.get('/api/grades/by-schedules', { params: { databaseName, ids } }),
                axios.get('/api/homework/by-schedules', { params: { databaseName, ids } }).catch(() => ({ data: [] })),
            ]);

            const sid = studentId?.toString();
            const studentGrades = (gradesRes.data || []).filter(g => {
                const gSid = (g.student?._id || g.student)?.toString();
                const noCol = !g.columnId || g.columnId === 'null';
                return gSid === sid && noCol;
            });

            // Group by month
            const byMonth = {};
            studentGrades.forEach(g => {
                const month = (typeof g.date === 'string' ? g.date : new Date(g.date).toISOString()).slice(0, 7);
                if (!byMonth[month]) byMonth[month] = [];
                byMonth[month].push(Number(g.value));
            });

            const monthStats = Object.entries(byMonth).sort().map(([m, vals]) => ({
                month: m,
                avg: (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1),
                grades: vals,
            }));

            const avg = studentGrades.length
                ? (studentGrades.reduce((s, g) => s + Number(g.value), 0) / studentGrades.length).toFixed(1)
                : null;

            // Distribution
            const dist = [0, 0, 0, 0]; // 1-4, 5-6, 7-8, 9-10
            studentGrades.forEach(g => {
                const v = Number(g.value);
                if (v <= 4) dist[0]++;
                else if (v <= 6) dist[1]++;
                else if (v <= 8) dist[2]++;
                else dist[3]++;
            });

            // Recent grades
            const recent = [...studentGrades]
                .sort((a, b) => {
                    const da = typeof a.date === 'string' ? a.date : new Date(a.date).toISOString();
                    const db = typeof b.date === 'string' ? b.date : new Date(b.date).toISOString();
                    return db.localeCompare(da);
                })
                .slice(0, 10);

            setReport({ avg, total: studentGrades.length, monthStats, dist, recent });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = students.filter(s =>
        (s.fullName || '').toLowerCase().includes(search.toLowerCase())
    );

    const getGradeStyle = (v) => {
        const n = Number(v);
        if (n >= 9) return { bg: '#d1fae5', color: '#065f46' };
        if (n >= 7) return { bg: 'rgba(105,180,185,0.15)', color: '#0e6b72' };
        if (n >= 5) return { bg: '#fef3c7', color: '#92400e' };
        return { bg: '#fee2e2', color: '#991b1b' };
    };

    const formatDate = (d) => {
        const s = typeof d === 'string' ? d : new Date(d).toISOString();
        return `${s.slice(8, 10)}.${s.slice(5, 7)}`;
    };

    const DIST_LABELS = ['1–4', '5–6', '7–8', '9–10'];
    const DIST_COLORS = ['#fee2e2', '#fef3c7', 'rgba(105,180,185,0.2)', '#d1fae5'];
    const DIST_TEXT = ['#991b1b', '#92400e', '#0e6b72', '#065f46'];

    return (
        <div>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
                <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '13px' }} />
                <input
                    type="text"
                    placeholder="Пошук учня..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 34px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', color: '#111827' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                {/* Student list */}
                <div style={{
                    width: isMobile ? '100%' : '220px', flexShrink: 0,
                    backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px',
                    overflow: 'hidden', maxHeight: '420px', overflowY: 'auto',
                }}>
                    {loadingStudents ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Завантаження...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Учнів не знайдено</div>
                    ) : filtered.map(s => (
                        <div
                            key={s._id}
                            onClick={() => setSelected(s)}
                            style={{
                                padding: '10px 14px',
                                borderBottom: '1px solid #f3f4f6',
                                cursor: 'pointer',
                                backgroundColor: selected?._id === s._id ? 'rgba(105,180,185,0.1)' : 'transparent',
                                borderLeft: selected?._id === s._id ? `3px solid ${BRAND}` : '3px solid transparent',
                                display: 'flex', alignItems: 'center', gap: '8px',
                            }}
                        >
                            <FaUser style={{ color: selected?._id === s._id ? BRAND : '#d1d5db', fontSize: '12px', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: '13px', color: '#374151', fontWeight: selected?._id === s._id ? '500' : '400' }}>{s.fullName}</div>
                                {s.groupName && <div style={{ fontSize: '11px', color: '#9ca3af' }}>{s.groupName}</div>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Report panel */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {!selected ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                            Оберіть учня зі списку
                        </div>
                    ) : loading ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                            Завантаження звіту...
                        </div>
                    ) : !report ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                            Немає даних для цього учня
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {/* Student header */}
                            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(105,180,185,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FaUser style={{ color: BRAND, fontSize: '18px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: '500', color: '#111827' }}>{selected.fullName}</div>
                                    {selected.groupName && <div style={{ fontSize: '12px', color: '#6b7280' }}>{selected.groupName}</div>}
                                </div>
                                {report.avg && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '22px', fontWeight: '500', color: BRAND }}>{report.avg}</div>
                                        <div style={{ fontSize: '11px', color: '#6b7280' }}>середній бал</div>
                                    </div>
                                )}
                            </div>

                            {/* Grade distribution */}
                            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px' }}>
                                <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>Розподіл оцінок</div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {DIST_LABELS.map((label, i) => (
                                        <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                                            <div style={{
                                                backgroundColor: DIST_COLORS[i],
                                                color: DIST_TEXT[i],
                                                padding: '8px 4px',
                                                borderRadius: '8px',
                                                fontSize: '18px', fontWeight: '500',
                                                marginBottom: '4px',
                                            }}>{report.dist[i]}</div>
                                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent grades */}
                            {report.recent.length > 0 && (
                                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>Останні оцінки</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                                        {report.recent.map((g, i) => {
                                            const st = getGradeStyle(g.value);
                                            const d = formatDate(g.date);
                                            return (
                                                <div key={i} style={{ backgroundColor: st.bg, borderRadius: '8px', padding: '6px 10px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '16px', fontWeight: '500', color: st.color }}>{g.value}</div>
                                                    <div style={{ fontSize: '10px', color: st.color, opacity: 0.7 }}>{d}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Monthly dynamics */}
                            {report.monthStats.length > 1 && (
                                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>Динаміка по місяцях</div>
                                    {report.monthStats.map((m, i) => {
                                        const st = getGradeStyle(m.avg);
                                        const [y, mo] = m.month.split('-');
                                        const label = new Date(y, mo - 1).toLocaleDateString('uk-UA', { month: 'long' });
                                        return (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                                                <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '80px' }}>{label}</span>
                                                <div style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${(parseFloat(m.avg) / 12) * 100}%`, backgroundColor: BRAND, borderRadius: '4px', opacity: 0.8 }} />
                                                </div>
                                                <span style={{ backgroundColor: st.bg, color: st.color, fontSize: '12px', fontWeight: '500', padding: '2px 7px', borderRadius: '8px', minWidth: '32px', textAlign: 'center' }}>{m.avg}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentReport;