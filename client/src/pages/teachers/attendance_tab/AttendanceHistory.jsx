import React, { useState, useEffect } from 'react';
import {
    FaArrowLeft,
    FaCalendarAlt,
    FaUsers,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaSearch,
    FaDownload
} from 'react-icons/fa';

const AttendanceHistory = ({ databaseName, isMobile, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [groups, setGroups] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalLessons: 0,
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0
    });

    useEffect(() => {
        if (databaseName) {
            fetchHistory();
        }
    }, [databaseName]);

    useEffect(() => {
        filterHistory();
    }, [history, selectedDate, selectedGroup, selectedSubject, searchTerm]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const teacherId = userInfo.userId;

            const response = await fetch(
                `/api/attendance/teacher/${teacherId}?databaseName=${databaseName}`
            );

            if (response.ok) {
                const data = await response.json();
                setHistory(data);

                // Отримуємо унікальні групи та предмети для фільтрів
                const uniqueGroups = [...new Set(data.map(item => item.schedule?.group?.name).filter(Boolean))];
                const uniqueSubjects = [...new Set(data.map(item => item.schedule?.subject).filter(Boolean))];

                setGroups(uniqueGroups);
                setSubjects(uniqueSubjects);

                // Розраховуємо статистику
                calculateStats(data);
            }
        } catch (err) {
            console.error('Помилка отримання історії:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLate = 0;

        data.forEach(record => {
            record.records?.forEach(r => {
                switch (r.status) {
                    case 'present':
                        totalPresent++;
                        break;
                    case 'absent':
                        totalAbsent++;
                        break;
                    case 'late':
                        totalLate++;
                        break;
                }
            });
        });

        setStats({
            totalLessons: data.length,
            totalPresent,
            totalAbsent,
            totalLate
        });
    };

    const filterHistory = () => {
        let filtered = [...history];

        if (selectedDate) {
            filtered = filtered.filter(item =>
                new Date(item.date).toISOString().split('T')[0] === selectedDate
            );
        }

        if (selectedGroup) {
            filtered = filtered.filter(item =>
                item.schedule?.group?.name === selectedGroup
            );
        }

        if (selectedSubject) {
            filtered = filtered.filter(item =>
                item.schedule?.subject === selectedSubject
            );
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.schedule?.group?.name?.toLowerCase().includes(term) ||
                item.schedule?.subject?.toLowerCase().includes(term) ||
                item.records?.some(r => r.student?.fullName?.toLowerCase().includes(term))
            );
        }

        setFilteredHistory(filtered);
    };

    const exportToCSV = () => {
        const csvData = [];

        // Заголовки
        csvData.push(['Дата', 'Група', 'Предмет', 'Учень', 'Статус', 'Причина/Час'].join(','));

        // Дані
        filteredHistory.forEach(record => {
            const date = new Date(record.date).toLocaleDateString('uk-UA');
            const group = record.schedule?.group?.name || '-';
            const subject = record.schedule?.subject || '-';

            record.records?.forEach(r => {
                const studentName = r.student?.fullName || '-';
                const status = r.status === 'present' ? 'Присутній' :
                    r.status === 'absent' ? 'Відсутній' : 'Запізнився';
                const reason = r.status === 'absent' ? r.reason || '-' :
                    r.status === 'late' ? r.time || '-' : '-';

                csvData.push([
                    date,
                    group,
                    subject,
                    studentName,
                    status,
                    reason
                ].join(','));
            });
        });

        const csvString = csvData.join('\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `attendance_history_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <FaCheckCircle style={{ color: '#10b981' }} />;
            case 'absent':
                return <FaTimesCircle style={{ color: '#ef4444' }} />;
            case 'late':
                return <FaClock style={{ color: '#f59e0b' }} />;
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Заголовок */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(105, 180, 185, 1)',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <FaArrowLeft />
                        Назад
                    </button>
                    <h3 style={{ fontSize: isMobile ? '18px' : '24px', margin: 0 }}>
                        Історія відвідуваності
                    </h3>
                </div>

                <button
                    onClick={exportToCSV}
                    style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <FaDownload />
                    {!isMobile && 'Експорт CSV'}
                </button>
            </div>

            {/* Статистика */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: '15px',
                marginBottom: '20px'
            }}>
                <div style={{
                    padding: '15px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '14px', color: '#0369a1' }}>Всього уроків</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0284c7' }}>
                        {stats.totalLessons}
                    </div>
                </div>
                <div style={{
                    padding: '15px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '14px', color: '#166534' }}>Присутні</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
                        {stats.totalPresent}
                    </div>
                </div>
                <div style={{
                    padding: '15px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '14px', color: '#991b1b' }}>Відсутні</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                        {stats.totalAbsent}
                    </div>
                </div>
                <div style={{
                    padding: '15px',
                    backgroundColor: '#fffbeb',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '14px', color: '#92400e' }}>Запізнення</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>
                        {stats.totalLate}
                    </div>
                </div>
            </div>

            {/* Фільтри */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: '20px'
            }}>
                <div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                        }}
                        placeholder="Дата"
                    />
                </div>
                <div>
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                        }}
                    >
                        <option value="">Всі групи</option>
                        {groups.map(group => (
                            <option key={group} value={group}>{group}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                        }}
                    >
                        <option value="">Всі предмети</option>
                        {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#9ca3af'
                        }} />
                        <input
                            type="text"
                            placeholder="Пошук..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 8px 8px 35px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Таблиця історії */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    Завантаження...
                </div>
            ) : filteredHistory.length > 0 ? (
                <div style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead style={{
                            backgroundColor: '#f9fafb',
                            borderBottom: '2px solid #e5e7eb'
                        }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Дата</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Група</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Предмет</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Учень</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Статус</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Примітки</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map(record => (
                                record.records?.map((r, idx) => (
                                    <tr key={`${record._id}-${idx}`} style={{
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>
                                        <td style={{ padding: '12px' }}>
                                            {new Date(record.date).toLocaleDateString('uk-UA')}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {record.schedule?.group?.name || '-'}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {record.schedule?.subject || '-'}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {r.student?.fullName || '-'}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px'
                                            }}>
                                                {getStatusIcon(r.status)}
                                                <span>
                                                    {r.status === 'present' ? 'Присутній' :
                                                        r.status === 'absent' ? 'Відсутній' : 'Запізнився'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {r.status === 'absent' && r.reason && (
                                                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                                                    {r.reason}
                                                </span>
                                            )}
                                            {r.status === 'late' && r.time && (
                                                <span style={{ color: '#f59e0b', fontSize: '14px' }}>
                                                    Час приходу: {r.time}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    color: '#6b7280'
                }}>
                    Немає записів відвідуваності
                </div>
            )}
        </div>
    );
};

export default AttendanceHistory;