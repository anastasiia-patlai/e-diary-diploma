import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartBar, FaUserCheck, FaLayerGroup, FaBookOpen, FaUser, FaChalkboardTeacher } from 'react-icons/fa';
import GradesReport from './GradesReport';
import AttendanceReport from './AttendanceReport';
import ClassCompareReport from './ClassCompareReport';
import HomeworkReport from './HomeworkReport';
import StudentReport from './StudentReport';

const BRAND = 'rgba(105,180,185,1)';

const TABS = [
    { key: 'grades', label: 'Успішність', icon: FaChartBar },
    // { key: 'attendance', label: 'Відвідуваність', icon: FaUserCheck },
    // { key: 'compare', label: 'Класи', icon: FaLayerGroup },
    // { key: 'homework', label: 'ДЗ', icon: FaBookOpen },
    { key: 'student', label: 'По учню', icon: FaUser },
];

const ReportsTab = ({ databaseName, isMobile, teacherId, curatorGroupId, teacherName }) => {
    const [activeTab, setActiveTab] = useState('grades');
    const [loading, setLoading] = useState(true);
    const [allSchedules, setAllSchedules] = useState([]);
    const [journals, setJournals] = useState([]);
    const [curatorGroup, setCuratorGroup] = useState(null);
    const [selSubject, setSelSubject] = useState('all');
    const [selGroup, setSelGroup] = useState('all');

    useEffect(() => {
        if (databaseName && teacherId) init();
    }, [databaseName, teacherId, curatorGroupId]);

    const init = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadSchedules(),
                curatorGroupId ? loadCuratorGroup(curatorGroupId) : Promise.resolve(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadSchedules = async () => {
        try {
            const res = await axios.get('/api/schedule', {
                params: { databaseName, teacher: teacherId }
            });
            const raw = res.data || [];
            setAllSchedules(raw);

            const map = new Map();
            raw.forEach(s => {
                const gId = (s.group?._id || s.group)?.toString() || '';
                const sub = s.subgroup || 'all';
                const key = `${s.subject}__${gId}__${sub}`;
                if (!map.has(key)) {
                    map.set(key, {
                        key,
                        subject: s.subject,
                        groupName: s.group?.name || '—',
                        groupId: gId,
                        subgroup: sub,
                        scheduleIds: [],
                    });
                }
                map.get(key).scheduleIds.push(s._id);
            });
            setJournals([...map.values()]);
        } catch (e) {
            console.error('loadSchedules error:', e);
        }
    };

    const loadCuratorGroup = async (gid) => {
        try {
            const res = await axios.get(`/api/groups/${gid}`, { params: { databaseName } });
            setCuratorGroup(res.data);
        } catch (e) {
            console.error('loadCuratorGroup error:', e);
        }
    };

    const subjects = ['all', ...new Set(journals.map(j => j.subject))];
    const groups = ['all', ...new Set(journals.map(j => j.groupName))];

    const filteredJournals = journals.filter(j => {
        const okS = selSubject === 'all' || j.subject === selSubject;
        const okG = selGroup === 'all' || j.groupName === selGroup;
        return okS && okG;
    });

    const teacherGroupIds = [
        ...new Set(journals.map(j => j.groupId).filter(Boolean)),
        ...(curatorGroupId ? [curatorGroupId.toString()] : []),
    ];

    const selectStyle = {
        padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px',
        fontSize: '13px', color: '#374151', backgroundColor: 'white', cursor: 'pointer',
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Завантаження...</span>
                    </div>
                    <p style={{ marginTop: '10px', color: '#6b7280', fontSize: '14px' }}>Завантаження даних...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '500', color: '#111827', margin: 0 }}>
                    Звіти
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <FaChalkboardTeacher style={{ color: BRAND, fontSize: '13px' }} />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        {teacherName && <><strong style={{ color: '#374151' }}>{teacherName}</strong> · </>}
                        {journals.length} {journals.length === 1 ? 'журнал' : journals.length < 5 ? 'журнали' : 'журналів'}
                        {curatorGroup && (
                            <> · Класний керівник: <strong style={{ color: '#374151' }}>{curatorGroup.name}</strong></>
                        )}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '12px 16px', marginBottom: '14px',
                display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
            }}>
                <span style={{ fontSize: '13px', color: '#6b7280', flexShrink: 0 }}>Фільтр:</span>
                <select value={selSubject} onChange={e => setSelSubject(e.target.value)} style={selectStyle}>
                    <option value="all">Всі предмети</option>
                    {subjects.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={selGroup} onChange={e => setSelGroup(e.target.value)} style={selectStyle}>
                    <option value="all">Всі класи</option>
                    {groups.slice(1).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                {(selSubject !== 'all' || selGroup !== 'all') && (
                    <button
                        onClick={() => { setSelSubject('all'); setSelGroup('all'); }}
                        style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: '#6b7280' }}
                    >
                        Скинути
                    </button>
                )}
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9ca3af' }}>
                    {filteredJournals.length} {filteredJournals.length === 1 ? 'журнал' : 'журналів'}
                </span>
            </div>

            {/* Active journal chips */}
            {filteredJournals.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {filteredJournals.map(j => (
                        <span key={j.key} style={{
                            fontSize: '12px', padding: '3px 10px', borderRadius: '12px',
                            backgroundColor: 'rgba(105,180,185,0.1)', color: '#0e6b72',
                            border: '1px solid rgba(105,180,185,0.25)',
                        }}>
                            {j.subject} · {j.groupName}{j.subgroup !== 'all' ? ` п.${j.subgroup}` : ''}
                        </span>
                    ))}
                    {curatorGroup && selGroup === 'all' && (
                        <span style={{
                            fontSize: '12px', padding: '3px 10px', borderRadius: '12px',
                            backgroundColor: '#EEEDFE', color: '#3C3489',
                            border: '1px solid #AFA9EC',
                        }}>
                            ★ Кл. кер.: {curatorGroup.name}
                        </span>
                    )}
                </div>
            )}

            {/* Tabs */}
            <div style={{
                display: 'flex', gap: isMobile ? '2px' : '4px', marginBottom: '16px',
                backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '5px', overflowX: 'auto',
            }}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                padding: isMobile ? '7px 9px' : '8px 16px',
                                border: 'none', borderRadius: '7px',
                                backgroundColor: active ? BRAND : 'transparent',
                                color: active ? 'white' : '#6b7280',
                                cursor: 'pointer', fontSize: isMobile ? '12px' : '13px',
                                fontWeight: active ? '500' : '400',
                                whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0,
                            }}
                        >
                            <Icon size={12} />{tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Report content */}
            <div style={{
                backgroundColor: 'white', border: '1px solid #e5e7eb',
                borderRadius: '12px', padding: isMobile ? '14px' : '20px',
            }}>
                <div style={{ height: '3px', width: '36px', borderRadius: '2px', backgroundColor: BRAND, marginBottom: '18px' }} />

                {filteredJournals.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                        Немає журналів для обраних фільтрів
                    </div>
                ) : (
                    <>
                        {activeTab === 'grades' && (
                            <GradesReport
                                journals={filteredJournals}
                                databaseName={databaseName}
                                isMobile={isMobile}
                            />
                        )}
                        {activeTab === 'attendance' && (
                            <AttendanceReport
                                teacherId={teacherId}
                                teacherGroupIds={teacherGroupIds}
                                curatorGroup={curatorGroup}
                                databaseName={databaseName}
                                isMobile={isMobile}
                            />
                        )}
                        {activeTab === 'compare' && (
                            <ClassCompareReport
                                journals={filteredJournals}
                                databaseName={databaseName}
                                isMobile={isMobile}
                            />
                        )}
                        {activeTab === 'homework' && (
                            <HomeworkReport
                                journals={filteredJournals}
                                databaseName={databaseName}
                                isMobile={isMobile}
                            />
                        )}
                        {activeTab === 'student' && (
                            <StudentReport
                                journals={filteredJournals}
                                curatorGroup={curatorGroup}
                                databaseName={databaseName}
                                isMobile={isMobile}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportsTab;