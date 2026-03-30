import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BRAND = 'rgba(105,180,185,1)';

const AttendanceReport = ({ teacherId, teacherGroupIds, curatorGroup, databaseName, isMobile }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (teacherId && databaseName) load();
    }, [teacherId, databaseName, teacherGroupIds]);

    const load = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/attendance/teacher/${teacherId}`, {
                params: { databaseName }
            });
            const records = res.data || [];
            setData(process(records));
        } catch (e) {
            console.error('Attendance report error:', e);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const process = (records) => {
        // Count absences per student
        const byStudent = {};
        records.forEach(rec => {
            (rec.records || []).forEach(r => {
                if (r.status === 'absent' || r.status === 'partial') {
                    const sid = (r.student?._id || r.student)?.toString();
                    const sname = r.student?.fullName || 'Невідомий';
                    if (!byStudent[sid]) byStudent[sid] = { name: sname, absent: 0, partial: 0, total: 0 };
                    if (r.status === 'absent') byStudent[sid].absent++;
                    if (r.status === 'partial') byStudent[sid].partial++;
                    byStudent[sid].total++;
                }
            });
        });

        const totalLessons = records.length;
        const totalAbsences = Object.values(byStudent).reduce((s, v) => s + v.absent, 0);
        const presenceRate = totalLessons > 0
            ? Math.round(((totalLessons - totalAbsences) / totalLessons) * 100)
            : 100;

        const sorted = Object.values(byStudent).sort((a, b) => b.total - a.total);

        // By month
        const byMonth = {};
        records.forEach(rec => {
            const month = rec.date?.slice(0, 7) || '';
            if (!byMonth[month]) byMonth[month] = { absent: 0, total: 0 };
            (rec.records || []).forEach(r => {
                byMonth[month].total++;
                if (r.status === 'absent') byMonth[month].absent++;
            });
        });

        return { sorted, totalLessons, totalAbsences, presenceRate, byMonth };
    };

    if (loading) return <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Завантаження...</div>;
    if (!data) return <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Немає даних про відвідуваність</div>;

    const { sorted, totalLessons, totalAbsences, presenceRate } = data;

    const absentColor = (n) => {
        if (n === 0) return { bg: '#d1fae5', text: '#065f46' };
        if (n <= 3) return { bg: '#fef3c7', text: '#92400e' };
        return { bg: '#fee2e2', text: '#991b1b' };
    };

    return (
        <div>
            {/* Summary */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {[
                    { label: 'Присутність', value: `${presenceRate}%`, highlight: true },
                    { label: 'Уроків проведено', value: totalLessons },
                    { label: 'Пропусків разом', value: totalAbsences },
                ].map((s, i) => (
                    <div key={i} style={{
                        flex: '1', minWidth: '100px', padding: '14px 16px', borderRadius: '10px',
                        backgroundColor: s.highlight ? 'rgba(105,180,185,0.12)' : '#f9fafb',
                        border: `1px solid ${s.highlight ? 'rgba(105,180,185,0.3)' : '#e5e7eb'}`,
                    }}>
                        <div style={{ fontSize: '22px', fontWeight: '500', color: s.highlight ? BRAND : '#111827' }}>{s.value}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Presence ring */}
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <svg width="90" height="90" viewBox="0 0 90 90" style={{ flexShrink: 0 }}>
                    <circle cx="45" cy="45" r="34" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                    <circle cx="45" cy="45" r="34" fill="none" stroke={BRAND} strokeWidth="12"
                        strokeDasharray={`${2 * Math.PI * 34 * presenceRate / 100} ${2 * Math.PI * 34}`}
                        strokeDashoffset={2 * Math.PI * 34 * 0.25}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.8s ease' }}
                    />
                    <text x="45" y="41" textAnchor="middle" fontSize="14" fontWeight="500" fill={BRAND}>{presenceRate}%</text>
                    <text x="45" y="56" textAnchor="middle" fontSize="10" fill="#9ca3af">присутні</text>
                </svg>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>Рівень відвідуваності</div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: BRAND }} />
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>Присутні ({presenceRate}%)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e5e7eb' }} />
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>Відсутні ({100 - presenceRate}%)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Students with absences */}
            {sorted.length > 0 && (
                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                        Пропуски по учнях
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>Учень</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '500', color: '#6b7280', width: '80px' }}>Н (повна)</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '500', color: '#6b7280', width: '80px' }}>Часткова</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '500', color: '#6b7280', width: '80px' }}>Всього</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.slice(0, 15).map((s, i) => {
                                    const clr = absentColor(s.absent);
                                    return (
                                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                            <td style={{ padding: '9px 16px', fontSize: '13px', color: '#374151' }}>{s.name}</td>
                                            <td style={{ padding: '9px 16px', textAlign: 'center' }}>
                                                <span style={{ backgroundColor: clr.bg, color: clr.text, fontSize: '12px', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' }}>{s.absent}</span>
                                            </td>
                                            <td style={{ padding: '9px 16px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>{s.partial}</td>
                                            <td style={{ padding: '9px 16px', textAlign: 'center', fontSize: '13px', color: '#374151', fontWeight: '500' }}>{s.total}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceReport;