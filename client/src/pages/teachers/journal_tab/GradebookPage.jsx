import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JournalHeader from './JournalHeader';
import JournalTable from './JournalTable';
import GradeModal from './GradeModal';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const GradebookPage = ({ scheduleId, databaseName, isMobile }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [dates, setDates] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [availableMonths, setAvailableMonths] = useState([]);

    // Стан модального вікна
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState(null);

    // Стан для семестрів та канікул
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [holidays, setHolidays] = useState([]);
    const [loadingSemesters, setLoadingSemesters] = useState(true);

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

    const loadJournalData = async () => {
        setLoading(true);
        try {
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

    const handleSemesterChange = async (semesterId) => {
        const semester = semesters.find(s => s._id === semesterId);
        setSelectedSemester(semester);
        await loadHolidays(semesterId);
        generateAvailableMonthsForSemester(semester);

        const semesterStart = new Date(semester.startDate);
        setCurrentMonth(semesterStart);
    };

    const generateAvailableMonthsForSemester = (semester) => {
        const months = [];
        const startDate = new Date(semester.startDate);
        const endDate = new Date(semester.endDate);

        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();

        let currentDate = new Date(startYear, startMonth, 1);
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
        let targetDayOfWeek = dayOfWeekOrder === 7 ? 0 : dayOfWeekOrder;

        const semesterStartParts = selectedSemester.startDate.split('T')[0].split('-');
        const semesterEndParts = selectedSemester.endDate.split('T')[0].split('-');

        const semesterStart = new Date(
            parseInt(semesterStartParts[0]),
            parseInt(semesterStartParts[1]) - 1,
            parseInt(semesterStartParts[2]),
            12, 0, 0, 0
        );

        const semesterEnd = new Date(
            parseInt(semesterEndParts[0]),
            parseInt(semesterEndParts[1]) - 1,
            parseInt(semesterEndParts[2]),
            12, 0, 0, 0
        );

        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate(),
                12, 0, 0, 0
            );

            if (currentDate < semesterStart || currentDate > semesterEnd) continue;

            if (currentDate.getDay() === targetDayOfWeek) {
                const isHoliday = holidays.some(holiday => {
                    const holidayStartParts = holiday.startDate.split('T')[0].split('-');
                    const holidayEndParts = holiday.endDate.split('T')[0].split('-');

                    const holidayStart = new Date(
                        parseInt(holidayStartParts[0]),
                        parseInt(holidayStartParts[1]) - 1,
                        parseInt(holidayStartParts[2]),
                        12, 0, 0, 0
                    );

                    const holidayEnd = new Date(
                        parseInt(holidayEndParts[0]),
                        parseInt(holidayEndParts[1]) - 1,
                        parseInt(holidayEndParts[2]),
                        12, 0, 0, 0
                    );

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

    const handleSaveGrade = async (gradeData) => {
        try {
            if (!selectedCell || !selectedCell.studentId || !selectedCell.date) {
                alert('Відсутні дані для збереження оцінки');
                return;
            }

            if (!gradeData.value) {
                alert('Виберіть оцінку');
                return;
            }

            const dateParts = selectedCell.date.fullDate.split('-');
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[2]);

            const targetDate = new Date(year, month, day, 12, 0, 0, 0);

            const semesterStartParts = selectedSemester.startDate.split('T')[0].split('-');
            const semesterEndParts = selectedSemester.endDate.split('T')[0].split('-');

            const semesterStart = new Date(
                parseInt(semesterStartParts[0]),
                parseInt(semesterStartParts[1]) - 1,
                parseInt(semesterStartParts[2]),
                12, 0, 0, 0
            );

            const semesterEnd = new Date(
                parseInt(semesterEndParts[0]),
                parseInt(semesterEndParts[1]) - 1,
                parseInt(semesterEndParts[2]),
                12, 0, 0, 0
            );

            if (targetDate < semesterStart || targetDate > semesterEnd) {
                alert(`Дата ${targetDate.toLocaleDateString('uk-UA')} знаходиться поза межами вибраного семестру`);
                return;
            }

            const isHoliday = holidays.some(holiday => {
                const holidayStartParts = holiday.startDate.split('T')[0].split('-');
                const holidayEndParts = holiday.endDate.split('T')[0].split('-');

                const holidayStart = new Date(
                    parseInt(holidayStartParts[0]),
                    parseInt(holidayStartParts[1]) - 1,
                    parseInt(holidayStartParts[2]),
                    12, 0, 0, 0
                );

                const holidayEnd = new Date(
                    parseInt(holidayEndParts[0]),
                    parseInt(holidayEndParts[1]) - 1,
                    parseInt(holidayEndParts[2]),
                    12, 0, 0, 0
                );

                return targetDate >= holidayStart && targetDate <= holidayEnd;
            });

            if (isHoliday) {
                alert('Не можна виставляти оцінки на період канікул');
                return;
            }

            const gradePayload = {
                value: gradeData.value,
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

            setShowGradeModal(false);
            setSelectedCell(null);
            setSelectedGrade(null);

        } catch (error) {
            console.error('Помилка збереження оцінки:', error);
            if (error.response) {
                alert(`Помилка: ${error.response.data?.error || 'Помилка при збереженні оцінки'}`);
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
            <JournalHeader
                lesson={currentLesson}
                isMobile={isMobile}
            />

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
                        <label style={{
                            fontWeight: '500',
                            color: '#374151'
                        }}>
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
                        {selectedSemester && (
                            <div style={{
                                fontSize: '13px',
                                color: '#6b7280'
                            }}>
                                {new Date(selectedSemester.startDate).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })} - {new Date(selectedSemester.endDate).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        )}
                    </div>
                </div>
            )}

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
            />
        </div>
    );
};

export default GradebookPage;