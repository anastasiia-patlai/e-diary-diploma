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
            console.log('=== ПОЧАТОК ЗАВАНТАЖЕННЯ ЖУРНАЛУ ===');
            console.log('scheduleId:', scheduleId);
            console.log('databaseName:', databaseName);

            // Завантаження інформації про урок
            console.log('1. Завантаження інформації про урок...');
            const lessonResponse = await axios.get(`/api/schedule/${scheduleId}`, {
                params: { databaseName }
            });

            console.log('Відповідь від /api/schedule/:', lessonResponse.data);
            console.log('Group ID:', lessonResponse.data.group?._id);
            console.log('Group name:', lessonResponse.data.group?.name);
            console.log('Subgroup:', lessonResponse.data.subgroup);
            console.log('Day of week order:', lessonResponse.data.dayOfWeek?.order);

            setCurrentLesson(lessonResponse.data);

            // Завантаження студентів
            if (lessonResponse.data.group?._id) {
                console.log('2. Завантаження студентів для групи:', lessonResponse.data.group._id);

                try {
                    const studentsResponse = await axios.get(`/api/groups/${lessonResponse.data.group._id}`, {
                        params: { databaseName }
                    });

                    console.log('Відповідь від /api/groups/:', studentsResponse.data);

                    let studentsList = [];
                    if (lessonResponse.data.subgroup && lessonResponse.data.subgroup !== 'all') {
                        // Якщо це підгрупа - знаходимо студентів в підгрупі
                        const subgroupNumber = parseInt(lessonResponse.data.subgroup);
                        console.log(`Шукаємо підгрупу з номером ${subgroupNumber}`);

                        const subgroup = studentsResponse.data.subgroups?.find(
                            sg => sg.order === subgroupNumber
                        );

                        console.log('Знайдена підгрупа:', subgroup);

                        if (subgroup && subgroup.students) {
                            studentsList = subgroup.students;
                            console.log(`Знайдено ${studentsList.length} студентів у підгрупі ${lessonResponse.data.subgroup}`);
                        } else {
                            console.log('Підгрупу не знайдено або вона не має студентів');
                        }
                    } else {
                        // Якщо вся група - беремо всіх студентів
                        studentsList = studentsResponse.data.students || [];
                        console.log(`Знайдено ${studentsList.length} студентів у всій групі`);
                    }

                    console.log('Кінцевий список студентів:', studentsList);
                    setStudents(studentsList);

                } catch (error) {
                    console.error('Помилка при завантаженні студентів:', error.message);
                }
            } else {
                console.log('Немає group._id в даних уроку');
            }

            // Завантаження оцінок
            console.log('3. Завантаження оцінок...');
            try {
                const gradesResponse = await axios.get(`/api/grades/schedule/${scheduleId}`, {
                    params: { databaseName }
                });
                console.log('Відповідь від /api/grades/schedule/:', gradesResponse.data);
                console.log('Знайдено оцінок:', gradesResponse.data?.length || 0);
                setGrades(gradesResponse.data || []);
            } catch (error) {
                console.error('Помилка при завантаженні оцінок:', error.message);
            }

        } catch (error) {
            console.error('!!! КРИТИЧНА ПОМИЛКА !!!');
            console.error('Статус:', error.response?.status);
            console.error('Дані:', error.response?.data);
            console.error('Повідомлення:', error.message);
            setError(error.response?.data?.error || 'Не вдалося завантажити дані журналу');
        } finally {
            setLoading(false);
            console.log('=== ЗАВЕРШЕННЯ ЗАВАНТАЖЕННЯ ===');
        }
    };

    const loadSemesters = async () => {
        setLoadingSemesters(true);
        try {
            const response = await axios.get('/api/study-calendar/semesters', {
                params: { databaseName }
            });

            console.log('Завантажені семестри:', response.data);
            setSemesters(response.data);

            // Знаходимо активний семестр або вибираємо перший
            const activeSemester = response.data.find(s => s.isActive) || response.data[0];
            if (activeSemester) {
                setSelectedSemester(activeSemester);
                // Завантажуємо канікули для вибраного семестру
                await loadHolidays(activeSemester._id);
                // Генеруємо доступні місяці на основі семестру
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

            console.log('Всі канікули з API:', response.data);

            // Фільтруємо канікули, що належать до чвертей вибраного семестру
            const semesterHolidays = response.data.filter(holiday => {
                const belongsToSemester = holiday.quarter?.semester?._id === semesterId;
                if (belongsToSemester) {
                    console.log('Канікули в семестрі:', {
                        name: holiday.name,
                        start: holiday.startDate,
                        end: holiday.endDate,
                        type: holiday.type
                    });
                }
                return belongsToSemester;
            });

            console.log('Канікули для семестру після фільтрації:', semesterHolidays);
            setHolidays(semesterHolidays);
        } catch (error) {
            console.error('Помилка завантаження канікул:', error);
        }
    };

    const handleSemesterChange = async (semesterId) => {
        const semester = semesters.find(s => s._id === semesterId);
        setSelectedSemester(semester);
        await loadHolidays(semesterId);

        // Генеруємо доступні місяці для нового семестру
        generateAvailableMonthsForSemester(semester);

        // Встановлюємо поточний місяць на перший місяць семестру
        const semesterStart = new Date(semester.startDate);
        setCurrentMonth(semesterStart);
    };

    const generateAvailableMonthsForSemester = (semester) => {
        const months = [];
        const startDate = new Date(semester.startDate);
        const endDate = new Date(semester.endDate);

        // Визначаємо перший і останній місяць семестру
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth();

        // Генеруємо всі місяці від початку до кінця семестру
        let currentDate = new Date(startYear, startMonth, 1);
        while (currentDate <= endDate) {
            months.push({
                value: months.length,
                label: currentDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' }),
                date: new Date(currentDate)
            });

            // Переходимо до наступного місяця
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        console.log('Згенеровано місяці для семестру:', months);
        setAvailableMonths(months);

        // Встановлюємо поточний місяць на перший місяць семестру, якщо він ще не встановлений
        if (months.length > 0) {
            setCurrentMonth(months[0].date);
        }
    };

    const generateDatesForMonth = (monthDate) => {
        if (!currentLesson?.dayOfWeek?.order || !selectedSemester) {
            console.log('Немає інформації про день тижня або семестр');
            return;
        }

        const dates = [];
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();

        // Перший день місяця
        const firstDay = new Date(year, month, 1);
        // Останній день місяця
        const lastDay = new Date(year, month + 1, 0);

        const dayOfWeekOrder = currentLesson.dayOfWeek.order; // 1-7 (понеділок-неділя)

        console.log('Генерація дат для місяця:', monthDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' }));
        console.log('День тижня уроку (order):', dayOfWeekOrder);
        console.log('Межі семестру:', {
            start: selectedSemester.startDate,
            end: selectedSemester.endDate
        });

        // Конвертуємо order в день тижня JS (0-6, де 0 - неділя)
        let targetDayOfWeek;
        if (dayOfWeekOrder === 7) {
            targetDayOfWeek = 0; // неділя
        } else {
            targetDayOfWeek = dayOfWeekOrder; // понеділок-субота (1-6)
        }

        console.log('Цільовий день тижня JS:', targetDayOfWeek);

        // Межі семестру
        const semesterStart = new Date(selectedSemester.startDate);
        const semesterEnd = new Date(selectedSemester.endDate);

        // Встановлюємо час на початок дня для коректного порівняння
        semesterStart.setHours(0, 0, 0, 0);
        semesterEnd.setHours(23, 59, 59, 999);

        // Проходимо по всіх днях місяця
        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);
            currentDate.setHours(0, 0, 0, 0);

            // Перевіряємо, чи дата в межах семестру
            if (currentDate < semesterStart || currentDate > semesterEnd) {
                continue; // Пропускаємо дати поза семестром
            }

            // Перевіряємо, чи це день уроку
            if (currentDate.getDay() === targetDayOfWeek) {
                // Перевіряємо, чи це не канікули
                const isHoliday = holidays.some(holiday => {
                    const holidayStart = new Date(holiday.startDate);
                    const holidayEnd = new Date(holiday.endDate);

                    // Встановлюємо час на початок/кінець дня для коректного порівняння
                    holidayStart.setHours(0, 0, 0, 0);
                    holidayEnd.setHours(23, 59, 59, 999);

                    // Дата в межах канікул (включно)
                    return currentDate >= holidayStart && currentDate <= holidayEnd;
                });

                dates.push({
                    date: new Date(d),
                    formatted: d.toLocaleDateString('uk-UA', {
                        day: '2-digit',
                        month: '2-digit'
                    }),
                    fullDate: d.toISOString().split('T')[0],
                    dayOfWeek: d.toLocaleDateString('uk-UA', { weekday: 'short' }),
                    isHoliday: isHoliday
                });
            }
        }

        console.log(`Згенеровано ${dates.length} дат для місяця (з урахуванням семестру та канікул)`);
        console.log('Дата першого дня після канікул:', dates.find(d => !d.isHoliday)?.fullDate);
        setDates(dates);
    };

    const handlePrevMonth = () => {
        // Знаходимо індекс поточного місяця в списку доступних
        const currentIndex = availableMonths.findIndex(m =>
            m.date.getMonth() === currentMonth.getMonth() &&
            m.date.getFullYear() === currentMonth.getFullYear()
        );

        // Якщо це не перший місяць, переходимо до попереднього
        if (currentIndex > 0) {
            setCurrentMonth(availableMonths[currentIndex - 1].date);
        }
    };

    const handleNextMonth = () => {
        // Знаходимо індекс поточного місяця в списку доступних
        const currentIndex = availableMonths.findIndex(m =>
            m.date.getMonth() === currentMonth.getMonth() &&
            m.date.getFullYear() === currentMonth.getFullYear()
        );

        // Якщо це не останній місяць, переходимо до наступного
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
        // Логування для діагностики
        console.log('Клік на клітинку:', {
            studentId,
            date: date.fullDate,
            isHoliday: date.isHoliday,
            dayOfWeek: date.dayOfWeek
        });

        // Не дозволяємо клікати на клітинки під час канікул
        if (date.isHoliday) {
            console.log('Клік на канікули - блокуємо');
            return;
        }

        const existingGrade = grades.find(
            g => g.student === studentId && g.date.split('T')[0] === date.fullDate
        );

        console.log('Існуюча оцінка:', existingGrade);

        setSelectedCell({ studentId, date });
        setSelectedGrade(existingGrade || null);
        setShowGradeModal(true);
    };

    const handleSaveGrade = async (gradeData) => {
        try {
            // Перевіряємо, чи не припадає дата на канікули
            const isHoliday = holidays.some(holiday => {
                const holidayStart = new Date(holiday.startDate);
                const holidayEnd = new Date(holiday.endDate);
                const targetDate = new Date(selectedCell.date.fullDate);
                return targetDate >= holidayStart && targetDate <= holidayEnd;
            });

            if (isHoliday) {
                alert('Не можна виставляти оцінки на період канікул');
                return;
            }

            // Перевіряємо, чи дата в межах семестру
            const semesterStart = new Date(selectedSemester.startDate);
            const semesterEnd = new Date(selectedSemester.endDate);
            const targetDate = new Date(selectedCell.date.fullDate);

            if (targetDate < semesterStart || targetDate > semesterEnd) {
                alert('Дата знаходиться поза межами вибраного семестру');
                return;
            }

            if (selectedGrade) {
                // Оновлення
                const response = await axios.put(`/api/grades/${selectedGrade._id}`, {
                    value: gradeData.value,
                    databaseName
                });
                setGrades(grades.map(g => g._id === selectedGrade._id ? response.data : g));
            } else {
                // Створення
                const response = await axios.post('/api/grades', {
                    value: gradeData.value,
                    databaseName,
                    schedule: scheduleId,
                    student: selectedCell.studentId,
                    date: selectedCell.date.fullDate
                });
                setGrades([...grades, response.data]);
            }
            setShowGradeModal(false);
            setSelectedCell(null);
        } catch (error) {
            console.error('Помилка збереження оцінки:', error);
            alert('Помилка при збереженні оцінки');
        }
    };

    const handleDeleteGrade = async () => {
        if (!selectedGrade) return;

        try {
            await axios.delete(`/api/grades/${selectedGrade._id}`, {
                data: { databaseName }
            });
            setGrades(grades.filter(g => g._id !== selectedGrade._id));
            setShowGradeModal(false);
            setSelectedCell(null);
        } catch (error) {
            console.error('Помилка видалення оцінки:', error);
        }
    };

    const getGradeForStudentAndDate = (studentId, date) => {
        const grade = grades.find(
            g => g.student === studentId && g.date.split('T')[0] === date.fullDate
        );
        return grade?.value;
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

            {/* Навігація по місяцях (тільки в межах семестру) */}
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
                            gap: '4px',
                            opacity: availableMonths.findIndex(m =>
                                m.date.getMonth() === currentMonth.getMonth() &&
                                m.date.getFullYear() === currentMonth.getFullYear()
                            ) === 0 ? 0.5 : 1
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
                            gap: '4px',
                            opacity: availableMonths.findIndex(m =>
                                m.date.getMonth() === currentMonth.getMonth() &&
                                m.date.getFullYear() === currentMonth.getFullYear()
                            ) === availableMonths.length - 1 ? 0.5 : 1
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
                    <p style={{ marginTop: '10px' }}>
                        Перевірте консоль розробника (F12) для детальної інформації
                    </p>
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