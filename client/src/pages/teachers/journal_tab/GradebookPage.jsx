import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JournalHeader from './JournalHeader';
import JournalTable from './JournalTable';
import GradeModal from './GradeModal';
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

    // Стан модального вікна
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState(null);

    // Стан для семестрів та канікул
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [holidays, setHolidays] = useState([]);
    const [loadingSemesters, setLoadingSemesters] = useState(true);

    // Таймер для повідомлень
    useEffect(() => {
        let timer;
        if (success) {
            timer = setTimeout(() => setSuccess(null), 3000);
        }
        return () => clearTimeout(timer);
    }, [success]);

    useEffect(() => {
        if (scheduleId && databaseName) {
            loadJournalData();
        }
    }, [scheduleId, databaseName]);

    useEffect(() => {
        if (currentLesson && selectedSemester) {
            generateDatesForMonth(currentMonth);
        }
    }, [currentMonth, currentLesson, selectedSemester, holidays]);

    useEffect(() => {
        if (databaseName) {
            loadSemesters();
        }
    }, [databaseName]);

    // Завантажуємо відвідуваність після отримання дат та студентів
    useEffect(() => {
        if (students.length > 0 && dates.length > 0) {
            loadAllAttendanceForMonth();
        }
    }, [students, dates]);

    const loadJournalData = async () => {
        setLoading(true);
        try {
            // Завантаження інформації про урок
            const lessonResponse = await axios.get(`/api/schedule/${scheduleId}`, {
                params: { databaseName }
            });
            setCurrentLesson(lessonResponse.data);

            // Завантаження студентів
            if (lessonResponse.data.group?._id) {
                try {
                    const studentsResponse = await axios.get(`/api/groups/${lessonResponse.data.group._id}`, {
                        params: { databaseName }
                    });

                    let studentsList = [];
                    if (lessonResponse.data.subgroup && lessonResponse.data.subgroup !== 'all') {
                        const subgroupNumber = parseInt(lessonResponse.data.subgroup);
                        const subgroup = studentsResponse.data.subgroups?.find(
                            sg => sg.order === subgroupNumber
                        );

                        if (subgroup && subgroup.students) {
                            studentsList = subgroup.students;
                        }
                    } else {
                        studentsList = studentsResponse.data.students || [];
                    }

                    setStudents(studentsList);
                } catch (error) {
                    console.error('Помилка при завантаженні студентів:', error.message);
                }
            }

            // Завантаження оцінок
            try {
                const gradesResponse = await axios.get(`/api/grades/schedule/${scheduleId}`, {
                    params: { databaseName }
                });
                setGrades(gradesResponse.data || []);
            } catch (error) {
                console.error('Помилка при завантаженні оцінок:', error.message);
            }

        } catch (error) {
            console.error('Помилка завантаження журналу:', error);
            setError(error.response?.data?.error || 'Не вдалося завантажити дані журналу');
        } finally {
            setLoading(false);
        }
    };

    const loadSemesters = async () => {
        setLoadingSemesters(true);
        try {
            const response = await axios.get('/api/study-calendar/semesters', {
                params: { databaseName }
            });

            setSemesters(response.data);

            const activeSemester = response.data.find(s => s.isActive) || response.data[0];
            if (activeSemester) {
                setSelectedSemester(activeSemester);
                await loadHolidays(activeSemester._id);
                generateAvailableMonthsForSemester(activeSemester);
            }
        } catch (error) {
            console.error('Помилка завантаження семестрів:', error);
        } finally {
            setLoadingSemesters(false);
        }
    };

    const loadHolidays = async (semesterId) => {
        try {
            const response = await axios.get('/api/study-calendar/holidays', {
                params: { databaseName }
            });

            const semesterHolidays = response.data.filter(holiday =>
                holiday.quarter?.semester?._id === semesterId
            );

            setHolidays(semesterHolidays);
        } catch (error) {
            console.error('Помилка завантаження канікул:', error);
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
        if (months.length > 0) {
            setCurrentMonth(months[0].date);
        }
    };

    const generateDatesForMonth = (monthDate) => {
        if (!currentLesson?.dayOfWeek?.order || !selectedSemester) return;

        const dates = [];
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const dayOfWeekOrder = currentLesson.dayOfWeek.order;
        const targetDayOfWeek = dayOfWeekOrder === 7 ? 0 : dayOfWeekOrder;

        const semesterStart = new Date(selectedSemester.startDate);
        const semesterEnd = new Date(selectedSemester.endDate);

        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);
            currentDate.setHours(12, 0, 0, 0);

            if (currentDate < semesterStart || currentDate > semesterEnd) continue;

            if (currentDate.getDay() === targetDayOfWeek) {
                const isHoliday = holidays.some(holiday => {
                    const holidayStart = new Date(holiday.startDate);
                    const holidayEnd = new Date(holiday.endDate);
                    holidayStart.setHours(12, 0, 0, 0);
                    holidayEnd.setHours(12, 0, 0, 0);
                    return currentDate >= holidayStart && currentDate <= holidayEnd;
                });

                const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                dates.push({
                    date: currentDate,
                    formatted: d.toLocaleDateString('uk-UA', {
                        day: '2-digit',
                        month: '2-digit'
                    }),
                    fullDate: formattedDate,
                    dayOfWeek: d.toLocaleDateString('uk-UA', { weekday: 'short' }),
                    isHoliday: isHoliday
                });
            }
        }

        setDates(dates);
    };

    const loadLessonAttendanceForDate = async (date) => {
        if (!scheduleId) return;

        try {
            // Отримуємо всі записи відвідуваності для цієї дати
            const response = await axios.get(
                `/api/attendance/lesson/date/${date}?databaseName=${databaseName}`
            );

            if (response.data) {
                setLessonAttendance(prev => {
                    const newAttendance = { ...prev };
                    response.data.forEach(record => {
                        const studentId = record.student?._id || record.student;
                        const key = `${studentId}_${date}`;

                        // Групуємо записи по студентах
                        if (!newAttendance[key]) {
                            newAttendance[key] = {
                                records: [],
                                lessonsAbsent: 0,
                                totalLessons: 0
                            };
                        }

                        newAttendance[key].records.push(record);

                        // Підраховуємо кількість відсутностей
                        if (record.status === 'absent') {
                            newAttendance[key].lessonsAbsent++;
                        }
                        newAttendance[key].totalLessons++;
                    });

                    return newAttendance;
                });
            }
        } catch (error) {
            console.error('Помилка завантаження відвідуваності:', error);
        }
    };

    const loadAllAttendanceForMonth = async () => {
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
        const currentIndex = availableMonths.findIndex(m =>
            m.date.getMonth() === currentMonth.getMonth() &&
            m.date.getFullYear() === currentMonth.getFullYear()
        );

        if (currentIndex > 0) {
            setCurrentMonth(availableMonths[currentIndex - 1].date);
        }
    };

    const handleNextMonth = () => {
        const currentIndex = availableMonths.findIndex(m =>
            m.date.getMonth() === currentMonth.getMonth() &&
            m.date.getFullYear() === currentMonth.getFullYear()
        );

        if (currentIndex < availableMonths.length - 1) {
            setCurrentMonth(availableMonths[currentIndex + 1].date);
        }
    };

    const handleMonthSelect = (index) => {
        if (index >= 0 && index < availableMonths.length) {
            setCurrentMonth(availableMonths[index].date);
        }
    };

    const handleCellClick = (studentId, date) => {
        if (date.isHoliday) return;

        const existingGrade = grades.find(g => {
            const studentMatch = g.student === studentId || g.student?._id === studentId;
            let gradeDate;
            if (g.date instanceof Date) {
                gradeDate = g.date.toISOString().split('T')[0];
            } else if (typeof g.date === 'string') {
                gradeDate = g.date.split('T')[0];
            } else {
                gradeDate = String(g.date);
            }
            return studentMatch && gradeDate === date.fullDate;
        });

        setSelectedCell({ studentId, date });
        setSelectedGrade(existingGrade || null);
        setShowGradeModal(true);
    };

    const handleSaveGrade = async (data) => {
        try {
            if (data.type === 'grade') {
                // Збереження оцінки
                if (!selectedCell || !selectedCell.studentId || !selectedCell.date) {
                    alert('Відсутні дані для збереження оцінки');
                    return;
                }

                if (!data.value) {
                    alert('Виберіть оцінку');
                    return;
                }

                const gradePayload = {
                    value: data.value,
                    databaseName,
                    schedule: scheduleId,
                    student: selectedCell.studentId,
                    date: selectedCell.date.fullDate
                };

                let response;
                if (selectedGrade) {
                    response = await axios.put(`/api/grades/${selectedGrade._id}`, gradePayload);
                    setGrades(prevGrades =>
                        prevGrades.map(g => g._id === selectedGrade._id ? response.data : g)
                    );
                } else {
                    response = await axios.post('/api/grades', gradePayload);
                    setGrades(prevGrades => [...prevGrades, response.data]);
                }

                setSuccess('Оцінку збережено');
            } else {
                // Збереження відвідуваності для одного уроку
                const attendancePayload = {
                    databaseName,
                    scheduleId: scheduleId,
                    date: selectedCell.date.fullDate,
                    records: [{
                        student: selectedCell.studentId,
                        status: data.status,
                        reason: data.reason || ''
                    }]
                };

                console.log('Saving attendance:', attendancePayload);
                await axios.post('/api/attendance/lesson', attendancePayload);

                // Оновлюємо локальний стан
                const key = `${selectedCell.studentId}_${selectedCell.date.fullDate}`;
                setLessonAttendance(prev => ({
                    ...prev,
                    [key]: {
                        status: data.status,
                        reason: data.reason,
                        lessonsAbsent: data.status === 'absent' ? 1 : 0,
                        totalLessons: 1
                    }
                }));

                // Тригеримо агрегацію для класного керівника
                if (currentLesson?.group?._id) {
                    try {
                        const aggResponse = await axios.post('/api/attendance/aggregate-daily', {
                            databaseName,
                            groupId: currentLesson.group._id,
                            date: selectedCell.date.fullDate
                        });
                        console.log('Агрегацію запущено:', aggResponse.data);
                    } catch (aggError) {
                        console.error('Помилка агрегації:', aggError.response?.data || aggError.message);
                    }
                }

                setSuccess('Відвідуваність збережено');
            }

            setShowGradeModal(false);
            setSelectedCell(null);
            setSelectedGrade(null);

        } catch (error) {
            console.error('Помилка збереження:', error);
            if (error.response) {
                alert(`Помилка: ${error.response.data?.error || 'Помилка при збереженні'}`);
            } else if (error.request) {
                alert('Сервер не відповідає. Перевірте з\'єднання.');
            } else {
                alert('Помилка при відправці запиту');
            }
        }
    };

    const handleDeleteGrade = async () => {
        if (!selectedGrade) return;

        try {
            await axios.delete(`/api/grades/${selectedGrade._id}`, {
                data: { databaseName }
            });

            setGrades(prevGrades => prevGrades.filter(g => g._id !== selectedGrade._id));
            setShowGradeModal(false);
            setSelectedCell(null);
            setSelectedGrade(null);
            setSuccess('Оцінку видалено');
        } catch (error) {
            console.error('Помилка видалення оцінки:', error);
            alert('Помилка при видаленні оцінки');
        }
    };

    const getGradeForStudentAndDate = (studentId, date) => {
        if (!grades || !Array.isArray(grades) || grades.length === 0) return null;

        const targetDate = date.fullDate || date;

        const grade = grades.find(g => {
            const studentMatch = g.student === studentId || g.student?._id === studentId;

            let gradeDate;
            if (g.date instanceof Date) {
                gradeDate = g.date.toISOString().split('T')[0];
            } else if (typeof g.date === 'string') {
                gradeDate = g.date.split('T')[0];
            } else {
                gradeDate = String(g.date);
            }

            return studentMatch && gradeDate === targetDate;
        });

        return grade?.value || null;
    };

    if (loading || loadingSemesters) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Завантаження...</span>
                    </div>
                    <p style={{ marginTop: '10px', color: '#6b7280' }}>
                        Завантаження журналу...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                color: '#b91c1c'
            }}>
                {error}
            </div>
        );
    }

    return (
        <div>
            {/* Повідомлення про успіх */}
            {success && (
                <div style={{
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                }}>
                    <span>{success}</span>
                    <button
                        onClick={() => setSuccess(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#065f46',
                            cursor: 'pointer',
                            fontSize: '18px',
                            padding: '0 4px'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>
            )}

            <JournalHeader lesson={currentLesson} isMobile={isMobile} />

            {/* Вибір семестру */}
            {!loadingSemesters && semesters.length > 0 && (
                <div style={{
                    marginBottom: '20px',
                    backgroundColor: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap'
                    }}>
                        <label style={{ fontWeight: '500', color: '#374151' }}>
                            Навчальний семестр:
                        </label>
                        <select
                            value={selectedSemester?._id || ''}
                            onChange={(e) => handleSemesterChange(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                fontSize: '14px',
                                minWidth: '200px'
                            }}
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

            {/* Навігація по місяцях */}
            {availableMonths.length > 0 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    backgroundColor: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <button
                        onClick={handlePrevMonth}
                        disabled={availableMonths.findIndex(m =>
                            m.date.getMonth() === currentMonth.getMonth() &&
                            m.date.getFullYear() === currentMonth.getFullYear()
                        ) === 0}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: availableMonths.findIndex(m =>
                                m.date.getMonth() === currentMonth.getMonth() &&
                                m.date.getFullYear() === currentMonth.getFullYear()
                            ) === 0 ? 'not-allowed' : 'pointer',
                            padding: '8px',
                            color: availableMonths.findIndex(m =>
                                m.date.getMonth() === currentMonth.getMonth() &&
                                m.date.getFullYear() === currentMonth.getFullYear()
                            ) === 0 ? '#d1d5db' : '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <FaChevronLeft />
                        {!isMobile && 'Попередній'}
                    </button>

                    {isMobile ? (
                        <select
                            value={availableMonths.findIndex(m =>
                                m.date.getMonth() === currentMonth.getMonth() &&
                                m.date.getFullYear() === currentMonth.getFullYear()
                            )}
                            onChange={(e) => handleMonthSelect(parseInt(e.target.value))}
                            style={{
                                padding: '8px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                fontSize: '16px'
                            }}
                        >
                            {availableMonths.map((month, index) => (
                                <option key={index} value={index}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {availableMonths.map((month, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleMonthSelect(index)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: currentMonth.getMonth() === month.date.getMonth() &&
                                            currentMonth.getFullYear() === month.date.getFullYear()
                                            ? 'rgba(105, 180, 185, 1)'
                                            : '#f3f4f6',
                                        color: currentMonth.getMonth() === month.date.getMonth() &&
                                            currentMonth.getFullYear() === month.date.getFullYear()
                                            ? 'white'
                                            : '#374151',
                                        cursor: 'pointer',
                                        fontWeight: currentMonth.getMonth() === month.date.getMonth() &&
                                            currentMonth.getFullYear() === month.date.getFullYear()
                                            ? '600'
                                            : 'normal'
                                    }}
                                >
                                    {month.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleNextMonth}
                        disabled={availableMonths.findIndex(m =>
                            m.date.getMonth() === currentMonth.getMonth() &&
                            m.date.getFullYear() === currentMonth.getFullYear()
                        ) === availableMonths.length - 1}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: availableMonths.findIndex(m =>
                                m.date.getMonth() === currentMonth.getMonth() &&
                                m.date.getFullYear() === currentMonth.getFullYear()
                            ) === availableMonths.length - 1 ? 'not-allowed' : 'pointer',
                            padding: '8px',
                            color: availableMonths.findIndex(m =>
                                m.date.getMonth() === currentMonth.getMonth() &&
                                m.date.getFullYear() === currentMonth.getFullYear()
                            ) === availableMonths.length - 1 ? '#d1d5db' : '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        {!isMobile && 'Наступний'}
                        <FaChevronRight />
                    </button>
                </div>
            )}

            {/* Таблиця журналу */}
            {students.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '40px',
                    textAlign: 'center',
                    color: '#6b7280'
                }}>
                    <h3>Немає учнів для відображення</h3>
                    <button
                        onClick={() => loadJournalData()}
                        style={{
                            marginTop: '20px',
                            backgroundColor: 'rgba(105, 180, 185, 1)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Спробувати знову
                    </button>
                </div>
            ) : (
                <JournalTable
                    students={students}
                    dates={dates}
                    getGradeForStudentAndDate={getGradeForStudentAndDate}
                    getAttendanceForStudentAndDate={getAttendanceForStudentAndDate}
                    onCellClick={handleCellClick}
                    isMobile={isMobile}
                />
            )}

            <GradeModal
                show={showGradeModal}
                onHide={() => setShowGradeModal(false)}
                onSave={handleSaveGrade}
                onDelete={handleDeleteGrade}
                existingGrade={selectedGrade}
                isMobile={isMobile}
                scheduleId={scheduleId}
                databaseName={databaseName}
                date={selectedCell?.date}
                studentId={selectedCell?.studentId}
                studentName={students.find(s => s._id === selectedCell?.studentId)?.fullName}
            />
        </div>
    );
};

export default GradebookPage;