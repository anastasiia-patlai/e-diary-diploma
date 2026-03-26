import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import JournalHeader from './JournalHeader';
import JournalTable from './JournalTable';
import GradeModal from './GradeModal';
import AddColumnPopup from './AddColumnPopup';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

const GradebookPage = ({ scheduleId, databaseName, isMobile }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [lessonAttendance, setLessonAttendance] = useState({});
    const [dates, setDates] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [availableMonths, setAvailableMonths] = useState([]);
    const [success, setSuccess] = useState(null);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [holidays, setHolidays] = useState([]);
    const [loadingSemesters, setLoadingSemesters] = useState(true);
    // All scheduleIds for this journal (same subject+group+subgroup, different days)
    const [allScheduleIds, setAllScheduleIds] = useState([scheduleId]);
    // All dayOfWeek orders covered by this journal
    const [allDayOrders, setAllDayOrders] = useState([]);

    // --- journal columns state ---
    const [journalColumns, setJournalColumns] = useState([]);
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [addColumnAfterIdx, setAddColumnAfterIdx] = useState(null);

    useEffect(() => {
        let timer;
        if (success) timer = setTimeout(() => setSuccess(null), 3000);
        return () => clearTimeout(timer);
    }, [success]);

    useEffect(() => {
        if (scheduleId && databaseName) {
            loadJournalData();
            loadJournalColumns();
        }
    }, [scheduleId, databaseName]);

    useEffect(() => {
        if ((allDayOrders.length > 0 || currentLesson) && selectedSemester) generateDatesForMonth(currentMonth);
    }, [currentMonth, currentLesson, selectedSemester, holidays, allDayOrders]);

    useEffect(() => {
        if (databaseName) loadSemesters();
    }, [databaseName]);

    useEffect(() => {
        if (students.length > 0 && dates.length > 0) loadAllAttendanceForMonth();
    }, [students, dates]);

    useEffect(() => {
        if (dates.length > 0 && students.length > 0) loadAllAttendanceForMonth();
    }, [dates]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (dates.length > 0) refreshAttendance();
        }, 30000);
        return () => clearInterval(interval);
    }, [dates]);

    const loadJournalColumns = async () => {
        try {
            const res = await axios.get(`/api/journal-columns/schedule/${scheduleId}`, {
                params: { databaseName }
            });
            setJournalColumns(res.data);
        } catch (err) {
            console.error('Помилка завантаження колонок журналу:', err);
        }
    };

    const handleAddColumn = async ({ date, type }) => {
        try {
            const res = await axios.post('/api/journal-columns', {
                databaseName,
                scheduleId,
                date,
                type
            });
            const newCol = res.data;

            setJournalColumns(prev => {
                const next = [...prev];
                if (addColumnAfterIdx === null || addColumnAfterIdx >= prev.length - 1) {
                    next.push(newCol);
                } else {
                    next.splice(addColumnAfterIdx + 1, 0, newCol);
                }
                return next;
            });
            setShowAddColumn(false);
            setSuccess('Стовпець додано');
        } catch (err) {
            console.error('Помилка додавання колонки:', err);
        }
    };

    const handleDeleteColumn = async (columnId) => {
        if (!window.confirm('Видалити цей стовпець? Оцінки у ньому також будуть видалені.')) return;
        try {
            await axios.delete(`/api/journal-columns/${columnId}`, {
                data: { databaseName }
            });
            setJournalColumns(prev => prev.filter(c => c._id !== columnId));
            setGrades(prev => prev.filter(g => g.columnId !== columnId));
            setSuccess('Стовпець видалено');
        } catch (err) {
            console.error('Помилка видалення колонки:', err);
        }
    };

    const openAddColumn = (afterIdx) => {
        setAddColumnAfterIdx(afterIdx);
        setShowAddColumn(true);
    };

    const refreshAttendance = async () => {
        setLessonAttendance({});
        for (const date of dates) {
            await loadLessonAttendanceForDate(date.fullDate);
        }
    };

    const loadJournalData = async () => {
        setLoading(true);
        try {
            // Load the primary schedule entry
            const lessonResponse = await axios.get(`/api/schedule/${scheduleId}`, { params: { databaseName } });
            const primaryLesson = lessonResponse.data;
            setCurrentLesson(primaryLesson);

            // Find ALL schedule entries for the same subject+group+subgroup (different days/times)
            // This ensures dates from all weekdays are shown in the journal
            try {
                const allSchedulesResponse = await axios.get('/api/schedule', {
                    params: {
                        databaseName,
                        teacher: primaryLesson.teacher?._id,
                        group: primaryLesson.group?._id,
                        semester: primaryLesson.semester?._id,
                    }
                });
                const siblings = allSchedulesResponse.data.filter(s =>
                    s.subject === primaryLesson.subject &&
                    (s.group?._id || s.group)?.toString() === (primaryLesson.group?._id || primaryLesson.group)?.toString() &&
                    (s.subgroup || 'all') === (primaryLesson.subgroup || 'all')
                );
                const ids = siblings.length > 0 ? siblings.map(s => s._id) : [scheduleId];
                const dayOrders = [...new Set(siblings.map(s => s.dayOfWeek?.order).filter(Boolean))];
                setAllScheduleIds(ids);
                setAllDayOrders(dayOrders.length > 0 ? dayOrders : [primaryLesson.dayOfWeek?.order].filter(Boolean));
            } catch (err) {
                console.error('Помилка завантаження суміжних розкладів:', err.message);
                setAllScheduleIds([scheduleId]);
                setAllDayOrders([primaryLesson.dayOfWeek?.order].filter(Boolean));
            }

            if (primaryLesson.group?._id) {
                try {
                    const studentsResponse = await axios.get(`/api/groups/${primaryLesson.group._id}`, { params: { databaseName } });
                    let studentsList = [];
                    if (primaryLesson.subgroup && primaryLesson.subgroup !== 'all') {
                        const subgroupNumber = parseInt(primaryLesson.subgroup);
                        const subgroup = studentsResponse.data.subgroups?.find(sg => sg.order === subgroupNumber);
                        if (subgroup?.students) studentsList = subgroup.students;
                    } else {
                        studentsList = studentsResponse.data.students || [];
                    }
                    setStudents(studentsList);
                } catch (err) {
                    console.error('Помилка завантаження студентів:', err.message);
                }
            }

            // Load grades from ALL sibling schedules via /by-schedules
            try {
                // Re-use the sibling ids we just fetched above
                const siblingIds = (await axios.get('/api/schedule', {
                    params: { databaseName, teacher: primaryLesson.teacher?._id, group: primaryLesson.group?._id, semester: primaryLesson.semester?._id }
                })).data
                    .filter(s => s.subject === primaryLesson.subject && (s.subgroup || 'all') === (primaryLesson.subgroup || 'all'))
                    .map(s => s._id);

                const idsParam = (siblingIds.length > 0 ? siblingIds : [scheduleId]).join(',');
                const gradesResponse = await axios.get('/api/grades/by-schedules', {
                    params: { databaseName, ids: idsParam }
                });
                setGrades(gradesResponse.data || []);
            } catch (err) {
                console.error('Помилка завантаження оцінок:', err.message);
            }
        } catch (err) {
            console.error('Помилка завантаження журналу:', err);
            setError(err.response?.data?.error || 'Не вдалося завантажити дані журналу');
        } finally {
            setLoading(false);
        }
    };

    const loadSemesters = async () => {
        setLoadingSemesters(true);
        try {
            const response = await axios.get('/api/study-calendar/semesters', { params: { databaseName } });
            setSemesters(response.data);
            const activeSemester = response.data.find(s => s.isActive) || response.data[0];
            if (activeSemester) {
                setSelectedSemester(activeSemester);
                await loadHolidays(activeSemester._id);
                generateAvailableMonthsForSemester(activeSemester);
            }
        } catch (err) {
            console.error('Помилка завантаження семестрів:', err);
        } finally {
            setLoadingSemesters(false);
        }
    };

    const loadHolidays = async (semesterId) => {
        try {
            const response = await axios.get('/api/study-calendar/holidays', { params: { databaseName } });
            const semesterHolidays = response.data.filter(h => h.quarter?.semester?._id === semesterId);
            setHolidays(semesterHolidays);
        } catch (err) {
            console.error('Помилка завантаження канікул:', err);
        }
    };

    const generateAvailableMonthsForSemester = (semester) => {
        const months = [];
        const startDate = new Date(semester.startDate);
        const endDate = new Date(semester.endDate);
        let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        while (currentDate <= endDate) {
            months.push({
                value: months.length,
                label: currentDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' }),
                date: new Date(currentDate)
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        setAvailableMonths(months);
        if (months.length > 0) setCurrentMonth(months[0].date);
    };

    const generateDatesForMonth = (monthDate) => {
        // Use all day orders from sibling schedules (same subject+group+subgroup, different days)
        const dayOrders = allDayOrders.length > 0 ? allDayOrders : (currentLesson?.dayOfWeek?.order ? [currentLesson.dayOfWeek.order] : []);
        if (dayOrders.length === 0 || !selectedSemester) return;

        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const semesterStart = new Date(selectedSemester.startDate);
        const semesterEnd = new Date(selectedSemester.endDate);
        // Convert DB day orders (1=Mon..7=Sun) to JS getDay() (0=Sun..6=Sat)
        const targetDays = new Set(dayOrders.map(order => order === 7 ? 0 : order));

        const dates = [];
        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);
            currentDate.setHours(12, 0, 0, 0);
            if (currentDate < semesterStart || currentDate > semesterEnd) continue;
            if (targetDays.has(currentDate.getDay())) {
                const isHoliday = holidays.some(holiday => {
                    const hs = new Date(holiday.startDate); hs.setHours(12, 0, 0, 0);
                    const he = new Date(holiday.endDate); he.setHours(12, 0, 0, 0);
                    return currentDate >= hs && currentDate <= he;
                });
                const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                dates.push({
                    date: currentDate,
                    formatted: d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }),
                    fullDate: formattedDate,
                    dayOfWeek: d.toLocaleDateString('uk-UA', { weekday: 'short' }),
                    isHoliday
                });
            }
        }
        // Sort chronologically
        dates.sort((a, b) => a.date - b.date);
        setDates(dates);
    };

    const handleDeleteAttendance = async (studentId, date) => {
        try {
            const key = `${studentId}_${date.fullDate}`;
            setLessonAttendance(prev => {
                const next = { ...prev };
                const existing = next[key];
                if (existing) {
                    existing.records = existing.records?.filter(r => r.scheduleId?.toString() !== scheduleId) || [];
                    if (existing.records.length === 0) delete next[key];
                    else next[key] = { ...existing };
                }
                return next;
            });

            try {
                await axios.delete('/api/attendance/lesson/student', {
                    data: { databaseName, scheduleId, studentId, date: date.fullDate }
                });
            } catch (dbErr) {
                console.error('Помилка видалення з LessonAttendance:', dbErr.response?.data || dbErr.message);
            }

            if (currentLesson?.group?._id) {
                try {
                    await axios.post('/api/attendance/aggregate-daily', {
                        databaseName, groupId: currentLesson.group._id, date: date.fullDate
                    });
                } catch (aggErr) {
                    console.error('Помилка агрегації:', aggErr.response?.data || aggErr.message);
                }
            }

            setSuccess('Мітку відвідуваності видалено');
            setShowGradeModal(false);
        } catch (err) {
            console.error('Помилка видалення:', err);
            setSuccess('Мітку видалено з таблиці');
            setShowGradeModal(false);
        }
    };

    const loadLessonAttendanceForDate = async (date) => {
        if (!scheduleId) return;
        try {
            const response = await axios.get(`/api/attendance/lesson/date/${date}?databaseName=${databaseName}`);
            setLessonAttendance(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(key => { if (key.endsWith(`_${date}`)) delete next[key]; });
                if (response.data && response.data.length > 0) {
                    response.data.forEach(record => {
                        record.records.forEach(r => {
                            const studentId = r.student?._id || r.student;
                            const key = `${studentId}_${date}`;
                            if (!next[key]) next[key] = { records: [], lessonsAbsent: 0, totalLessons: 0 };
                            next[key].records.push({ ...r, scheduleId: record.schedule });
                            if (r.status === 'absent') next[key].lessonsAbsent++;
                            next[key].totalLessons++;
                        });
                    });
                }
                return next;
            });
        } catch (err) {
            console.error(`Помилка відвідуваності для ${date}:`, err);
        }
    };

    const loadAllAttendanceForMonth = async () => {
        setLessonAttendance({});
        for (const date of dates) {
            await loadLessonAttendanceForDate(date.fullDate);
        }
    };

    const getAttendanceForStudentAndDate = (studentId, date) => {
        const key = `${studentId}_${date.fullDate}`;
        return lessonAttendance[key] || null;
    };

    const handleSemesterChange = async (semesterId) => {
        const semester = semesters.find(s => s._id === semesterId);
        setSelectedSemester(semester);
        await loadHolidays(semesterId);
        generateAvailableMonthsForSemester(semester);
        setCurrentMonth(new Date(semester.startDate));
    };

    const handlePrevMonth = () => {
        const idx = availableMonths.findIndex(m =>
            m.date.getMonth() === currentMonth.getMonth() &&
            m.date.getFullYear() === currentMonth.getFullYear()
        );
        if (idx > 0) setCurrentMonth(availableMonths[idx - 1].date);
    };

    const handleNextMonth = () => {
        const idx = availableMonths.findIndex(m =>
            m.date.getMonth() === currentMonth.getMonth() &&
            m.date.getFullYear() === currentMonth.getFullYear()
        );
        if (idx < availableMonths.length - 1) setCurrentMonth(availableMonths[idx + 1].date);
    };

    const handleMonthSelect = (index) => {
        if (index >= 0 && index < availableMonths.length) setCurrentMonth(availableMonths[index].date);
    };

    // Normalize any id value to string for reliable comparison
    const toStr = (v) => (v?._id ?? v)?.toString() ?? '';

    const handleCellClick = (studentId, date) => {
        if (date.isHoliday) return;
        const sid = toStr(studentId);
        const existingGrade = grades.find(g => {
            const studentMatch = toStr(g.student) === sid;
            const gradeDate = typeof g.date === 'string' ? g.date.split('T')[0]
                : g.date instanceof Date ? g.date.toISOString().split('T')[0]
                    : String(g.date);
            // regular grade: columnId must be null/undefined
            const noCol = !g.columnId || g.columnId === 'null';
            return studentMatch && gradeDate === date.fullDate && noCol;
        });
        setSelectedCell({ studentId, date, columnId: null });
        setSelectedGrade(existingGrade || null);
        setShowGradeModal(true);
    };

    const handleColumnCellClick = (studentId, column) => {
        const sid = toStr(studentId);
        const cid = toStr(column._id);
        const existingGrade = grades.find(g => {
            const studentMatch = toStr(g.student) === sid;
            const colMatch = toStr(g.columnId) === cid;
            return studentMatch && colMatch;
        });
        setSelectedCell({ studentId, date: null, columnId: column._id, columnType: column.type });
        setSelectedGrade(existingGrade || null);
        setShowGradeModal(true);
    };

    const handleSaveGrade = async (data) => {
        try {
            if (data.type === 'grade') {
                if (!selectedCell || !data.value) { alert('Виберіть оцінку'); return; }

                const gradeDate = selectedCell.date?.fullDate || (
                    journalColumns.find(c => c._id === selectedCell.columnId)?.date
                );
                if (!gradeDate) { alert('Дату не визначено'); return; }

                // Find the correct scheduleId for the day this grade falls on
                // (there may be multiple schedules for the same journal on different days)
                const gradeDateObj = new Date(gradeDate);
                const gradeDayJs = gradeDateObj.getDay(); // 0=Sun..6=Sat
                const scheduleForDate = scheduleId; // fallback to primary

                const gradePayload = {
                    value: data.value,
                    databaseName,
                    schedule: scheduleForDate,
                    student: selectedCell.studentId,
                    date: gradeDate,
                    columnId: selectedCell.columnId || null,
                    gradeType: selectedCell.columnType || 'regular'
                };

                let response;
                if (selectedGrade) {
                    response = await axios.put(`/api/grades/${selectedGrade._id}`, gradePayload);
                    setGrades(prev => prev.map(g => g._id === selectedGrade._id ? response.data : g));
                } else {
                    response = await axios.post('/api/grades', gradePayload);
                    // Server may return 200 (upserted existing) or 201 (new)
                    // Either way, replace or add to local state
                    setGrades(prev => {
                        const saved = response.data;
                        const exists = prev.find(g => g._id === saved._id);
                        if (exists) {
                            return prev.map(g => g._id === saved._id ? saved : g);
                        }
                        return [...prev, saved];
                    });
                }
                setSuccess('Оцінку збережено');
            } else {
                const attendancePayload = {
                    databaseName,
                    scheduleId: scheduleId, // primary scheduleId; attendance API finds by date
                    date: selectedCell.date.fullDate,
                    records: [{ student: selectedCell.studentId, status: data.status, reason: data.reason || '' }]
                };
                await axios.post('/api/attendance/lesson', attendancePayload);

                const date = selectedCell.date.fullDate;
                const key = `${selectedCell.studentId}_${date}`;
                setLessonAttendance(prev => {
                    const next = { ...prev };
                    if (!next[key]) next[key] = { records: [], lessonsAbsent: 0, totalLessons: 0 };
                    next[key].records.push({ student: selectedCell.studentId, status: data.status, reason: data.reason || '', scheduleId });
                    if (data.status === 'absent') next[key].lessonsAbsent++;
                    next[key].totalLessons++;
                    return next;
                });

                if (currentLesson?.group?._id) {
                    try {
                        await axios.post('/api/attendance/aggregate-daily', {
                            databaseName, groupId: currentLesson.group._id, date: selectedCell.date.fullDate
                        });
                    } catch (aggErr) {
                        console.error('Помилка агрегації:', aggErr);
                    }
                }
                setSuccess('Відвідуваність збережено');
            }
            setShowGradeModal(false);
            setSelectedCell(null);
            setSelectedGrade(null);
        } catch (err) {
            console.error('Помилка збереження:', err);
            alert(`Помилка: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleDeleteGrade = async () => {
        if (!selectedGrade) return;
        try {
            await axios.delete(`/api/grades/${selectedGrade._id}`, { data: { databaseName } });
            setGrades(prev => prev.filter(g => g._id !== selectedGrade._id));
            setShowGradeModal(false);
            setSelectedCell(null);
            setSelectedGrade(null);
            setSuccess('Оцінку видалено');
        } catch (err) {
            console.error('Помилка видалення оцінки:', err);
            alert('Помилка при видаленні оцінки');
        }
    };

    const getGradeForStudentAndDate = (studentId, date) => {
        if (!grades || !Array.isArray(grades) || grades.length === 0) return null;
        const targetDate = date.fullDate || date;
        const sid = toStr(studentId);
        const grade = grades.find(g => {
            // must be a regular grade (no column)
            if (g.columnId && g.columnId !== 'null') return false;
            const studentMatch = toStr(g.student) === sid;
            const gradeDate = g.date instanceof Date
                ? g.date.toISOString().split('T')[0]
                : typeof g.date === 'string' ? g.date.split('T')[0] : String(g.date);
            return studentMatch && gradeDate === targetDate;
        });
        return grade?.value || null;
    };

    const getGradeForStudentAndColumn = (studentId, columnId) => {
        if (!grades || !Array.isArray(grades)) return null;
        const sid = toStr(studentId);
        const cid = toStr(columnId);
        const grade = grades.find(g => toStr(g.student) === sid && toStr(g.columnId) === cid);
        return grade?.value || null;
    };

    const currentMonthIdx = availableMonths.findIndex(m =>
        m.date.getMonth() === currentMonth.getMonth() &&
        m.date.getFullYear() === currentMonth.getFullYear()
    );

    if (loading || loadingSemesters) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Завантаження...</span>
                    </div>
                    <p style={{ marginTop: '10px', color: '#6b7280' }}>Завантаження журналу...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#b91c1c' }}>
                {error}
            </div>
        );
    }

    return (
        <div>
            {success && (
                <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}>
                        <FaTimes />
                    </button>
                </div>
            )}

            <JournalHeader lesson={currentLesson} isMobile={isMobile} />

            {!loadingSemesters && semesters.length > 0 && (
                <div style={{ marginBottom: '20px', backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <label style={{ fontWeight: '500', color: '#374151' }}>Навчальний семестр:</label>
                        <select
                            value={selectedSemester?._id || ''}
                            onChange={(e) => handleSemesterChange(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px', minWidth: '200px' }}
                        >
                            {semesters.map(semester => (
                                <option key={semester._id} value={semester._id}>
                                    {semester.name} {semester.year} {semester.isActive ? '(активний)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {availableMonths.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <button
                        onClick={handlePrevMonth}
                        disabled={currentMonthIdx === 0}
                        style={{ background: 'none', border: 'none', cursor: currentMonthIdx === 0 ? 'not-allowed' : 'pointer', padding: '8px', color: currentMonthIdx === 0 ? '#d1d5db' : '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <FaChevronLeft /> {!isMobile && 'Попередній'}
                    </button>

                    {isMobile ? (
                        <select value={currentMonthIdx} onChange={(e) => handleMonthSelect(parseInt(e.target.value))} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '16px' }}>
                            {availableMonths.map((month, index) => (
                                <option key={index} value={index}>{month.label}</option>
                            ))}
                        </select>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {availableMonths.map((month, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleMonthSelect(index)}
                                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: currentMonthIdx === index ? 'rgba(105, 180, 185, 1)' : '#f3f4f6', color: currentMonthIdx === index ? 'white' : '#374151', cursor: 'pointer', fontWeight: currentMonthIdx === index ? '600' : 'normal' }}
                                >
                                    {month.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleNextMonth}
                        disabled={currentMonthIdx === availableMonths.length - 1}
                        style={{ background: 'none', border: 'none', cursor: currentMonthIdx === availableMonths.length - 1 ? 'not-allowed' : 'pointer', padding: '8px', color: currentMonthIdx === availableMonths.length - 1 ? '#d1d5db' : '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        {!isMobile && 'Наступний'} <FaChevronRight />
                    </button>
                </div>
            )}

            {students.length === 0 ? (
                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    <h3>Немає учнів для відображення</h3>
                    <button onClick={() => loadJournalData()} style={{ marginTop: '20px', backgroundColor: 'rgba(105, 180, 185, 1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                        Спробувати знову
                    </button>
                </div>
            ) : (
                <JournalTable
                    students={students}
                    dates={dates}
                    journalColumns={journalColumns}
                    getGradeForStudentAndDate={getGradeForStudentAndDate}
                    getGradeForStudentAndColumn={getGradeForStudentAndColumn}
                    getAttendanceForStudentAndDate={getAttendanceForStudentAndDate}
                    onCellClick={handleCellClick}
                    onColumnCellClick={handleColumnCellClick}
                    onAddColumn={openAddColumn}
                    onDeleteColumn={handleDeleteColumn}
                    isMobile={isMobile}
                />
            )}

            <GradeModal
                show={showGradeModal}
                onHide={() => setShowGradeModal(false)}
                onSave={handleSaveGrade}
                onDelete={handleDeleteGrade}
                onDeleteAttendance={handleDeleteAttendance}
                existingGrade={selectedGrade}
                isMobile={isMobile}
                scheduleId={scheduleId}
                databaseName={databaseName}
                date={selectedCell?.date}
                studentId={selectedCell?.studentId}
                studentName={students.find(s => s._id === selectedCell?.studentId)?.fullName}
                hasAttendance={selectedCell?.date ? getAttendanceForStudentAndDate(selectedCell.studentId, selectedCell.date) !== null : false}
                isColumnMode={!!selectedCell?.columnId}
                columnType={selectedCell?.columnType}
            />

            {showAddColumn && (
                <AddColumnPopup
                    dates={dates}
                    onAdd={handleAddColumn}
                    onClose={() => setShowAddColumn(false)}
                />
            )}
        </div>
    );
};

export default GradebookPage;