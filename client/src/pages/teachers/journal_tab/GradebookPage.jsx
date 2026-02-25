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

    // Логування змін grades для діагностики
    useEffect(() => {
        console.log('Стан grades оновлено:', grades);
    }, [grades]);

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

                // Детальне логування завантажених оцінок
                if (gradesResponse.data && gradesResponse.data.length > 0) {
                    console.log('Деталі оцінок:', gradesResponse.data.map(g => ({
                        id: g._id,
                        student: g.student?._id || g.student,
                        value: g.value,
                        date: g.date
                    })));
                }

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

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const dayOfWeekOrder = currentLesson.dayOfWeek.order;

        // Конвертуємо order в день тижня JS
        let targetDayOfWeek;
        if (dayOfWeekOrder === 7) {
            targetDayOfWeek = 0; // неділя
        } else {
            targetDayOfWeek = dayOfWeekOrder; // понеділок-субота
        }

        // Межі семестру
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

        console.log('Генерація дат для місяця:', monthDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' }));
        console.log('Межі семестру:', {
            start: semesterStart.toLocaleDateString('uk-UA'),
            end: semesterEnd.toLocaleDateString('uk-UA')
        });

        // Проходимо по всіх днях місяця
        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            // Створюємо дату з фіксованим часом (полудень)
            const currentDate = new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate(),
                12, 0, 0, 0
            );

            // Перевіряємо, чи дата в межах семестру
            if (currentDate < semesterStart || currentDate > semesterEnd) {
                continue;
            }

            // Перевіряємо, чи це день уроку
            if (currentDate.getDay() === targetDayOfWeek) {
                // Перевіряємо, чи це не канікули
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

                // Форматуємо дату для відображення
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

        console.log(`Згенеровано ${dates.length} дат для місяця`);
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

        // Пошук існуючої оцінки з правильною обробкою форматів
        const existingGrade = grades.find(g => {
            // Перевіряємо studentId (може бути об'єктом або рядком)
            const studentMatch = g.student === studentId || g.student?._id === studentId;

            // Нормалізуємо дату
            let gradeDate;
            if (g.date instanceof Date) {
                gradeDate = g.date.toISOString().split('T')[0];
            } else if (typeof g.date === 'string') {
                gradeDate = g.date.split('T')[0];
            } else {
                gradeDate = String(g.date);
            }

            const dateMatch = gradeDate === date.fullDate;

            return studentMatch && dateMatch;
        });

        console.log('Існуюча оцінка:', existingGrade);

        setSelectedCell({ studentId, date });
        setSelectedGrade(existingGrade || null);
        setShowGradeModal(true);
    };

    const handleSaveGrade = async (gradeData) => {
        try {
            // Перевіряємо наявність всіх необхідних даних
            if (!selectedCell || !selectedCell.studentId || !selectedCell.date) {
                alert('Відсутні дані для збереження оцінки');
                return;
            }

            if (!gradeData.value) {
                alert('Виберіть оцінку');
                return;
            }

            // ВИПРАВЛЕНО: Створюємо дату БЕЗ часового поясу, використовуючи компоненти
            const dateParts = selectedCell.date.fullDate.split('-');
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // місяць 0-11
            const day = parseInt(dateParts[2]);

            // Створюємо дату в локальному часовому поясі
            const targetDate = new Date(year, month, day, 12, 0, 0, 0);

            console.log('=== ДІАГНОСТИКА ДАТИ ===');
            console.log('fullDate з selectedCell:', selectedCell.date.fullDate);
            console.log('Розібрана дата - рік:', year, 'місяць:', month + 1, 'день:', day);
            console.log('targetDate (об\'єкт Date):', targetDate);
            console.log('targetDate (локальна):', targetDate.toLocaleDateString('uk-UA'));
            console.log('targetDate (ISO):', targetDate.toISOString());
            console.log('targetDate (UTC день):', targetDate.getUTCDate());
            console.log('targetDate (локальний день):', targetDate.getDate());

            // Межі семестру - також створюємо з компонентів
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

            console.log('Початок семестру:', semesterStart.toLocaleDateString('uk-UA'));
            console.log('Кінець семестру:', semesterEnd.toLocaleDateString('uk-UA'));
            console.log('Цільова дата:', targetDate.toLocaleDateString('uk-UA'));
            console.log('В межах семестру:', targetDate >= semesterStart && targetDate <= semesterEnd);

            // Перевіряємо, чи дата в межах семестру
            if (targetDate < semesterStart || targetDate > semesterEnd) {
                alert(`Дата ${targetDate.toLocaleDateString('uk-UA')} знаходиться поза межами вибраного семестру (${semesterStart.toLocaleDateString('uk-UA')} - ${semesterEnd.toLocaleDateString('uk-UA')})`);
                return;
            }

            // Перевіряємо, чи не припадає дата на канікули
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

            // Форматуємо дату для відправки на сервер (YYYY-MM-DD)
            const formattedDate = selectedCell.date.fullDate; // Вже в правильному форматі

            const gradePayload = {
                value: gradeData.value,
                databaseName,
                schedule: scheduleId,
                student: selectedCell.studentId,
                date: formattedDate
            };

            console.log('Відправка даних для збереження оцінки:', gradePayload);

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
                console.error('Статус помилки:', error.response.status);
                console.error('Дані помилки:', error.response.data);
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

            // Видаляємо оцінку зі стану
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
        if (!grades || !Array.isArray(grades) || grades.length === 0) {
            return null;
        }

        // Нормалізуємо цільову дату
        const targetDate = date.fullDate || date;

        // Шукаємо оцінку
        const grade = grades.find(g => {
            // Перевіряємо studentId (може бути об'єктом або рядком)
            const studentMatch = g.student === studentId || g.student?._id === studentId;

            // Нормалізуємо дату оцінки
            let gradeDate;
            if (g.date instanceof Date) {
                gradeDate = g.date.toISOString().split('T')[0];
            } else if (typeof g.date === 'string') {
                gradeDate = g.date.split('T')[0];
            } else {
                gradeDate = String(g.date);
            }

            const dateMatch = gradeDate === targetDate;

            return studentMatch && dateMatch;
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