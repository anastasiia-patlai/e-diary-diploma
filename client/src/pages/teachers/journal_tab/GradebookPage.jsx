import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JournalHeader from './JournalHeader';
import JournalTable from './JournalTable';
import GradeModal from './GradeModal';
import HomeworkModal from './HomeworkModal';
import { FaBook, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const GradebookPage = ({ scheduleId, databaseName, isMobile }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [homeworks, setHomeworks] = useState([]);
    const [dates, setDates] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [availableMonths, setAvailableMonths] = useState([]);

    // Стан модальних вікон
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [showHomeworkModal, setShowHomeworkModal] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [selectedHomework, setSelectedHomework] = useState(null);

    useEffect(() => {
        if (scheduleId && databaseName) {
            loadJournalData();
        }
    }, [scheduleId, databaseName]);

    useEffect(() => {
        if (currentLesson) {
            generateDatesForMonth(currentMonth);
        }
    }, [currentMonth, currentLesson]);

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
                    console.log('Чи є studentsResponse.data.students?', studentsResponse.data.students ? 'Так' : 'Ні');
                    console.log('Кількість студентів в групі:', studentsResponse.data.students?.length || 0);

                    if (studentsResponse.data.subgroups) {
                        console.log('Підгрупи:', studentsResponse.data.subgroups.map(sg => ({
                            order: sg.order,
                            studentsCount: sg.students?.length || 0
                        })));
                    }

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
                    if (studentsList.length > 0) {
                        console.log('Перший студент:', studentsList[0]);
                    }

                    setStudents(studentsList);

                } catch (error) {
                    console.error('Помилка при завантаженні студентів:');
                    console.error('Статус:', error.response?.status);
                    console.error('Дані:', error.response?.data);
                    console.error('Повідомлення:', error.message);
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

            // Завантаження домашніх завдань
            console.log('4. Завантаження домашніх завдань...');
            try {
                const homeworksResponse = await axios.get(`/api/homeworks/schedule/${scheduleId}`, {
                    params: { databaseName }
                });
                console.log('Відповідь від /api/homeworks/schedule/:', homeworksResponse.data);
                console.log('Знайдено ДЗ:', homeworksResponse.data?.length || 0);
                setHomeworks(homeworksResponse.data || []);
            } catch (error) {
                console.error('Помилка при завантаженні ДЗ:', error.message);
            }

            // Генерація доступних місяців (наприклад, 6 місяців)
            generateAvailableMonths();

        } catch (error) {
            console.error('!!! КРИТИЧНА ПОМИЛКА !!!');
            console.error('Статус:', error.response?.status);
            console.error('Дані:', error.response?.data);
            console.error('Повідомлення:', error.message);
            console.error('Повний об\'єкт помилки:', error);
            setError(error.response?.data?.error || 'Не вдалося завантажити дані журналу');
        } finally {
            setLoading(false);
            console.log('=== ЗАВЕРШЕННЯ ЗАВАНТАЖЕННЯ ===');
            console.log('Фінальний стан:');
            console.log('- students:', students.length);
            console.log('- grades:', grades.length);
            console.log('- homeworks:', homeworks.length);
            console.log('- dates:', dates.length);
        }
    };

    const generateAvailableMonths = () => {
        const months = [];
        const today = new Date();

        // Генеруємо 6 місяців (поточний + 5 вперед)
        for (let i = 0; i < 6; i++) {
            const date = new Date(today);
            date.setMonth(today.getMonth() + i);
            months.push({
                value: i,
                label: date.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' }),
                date: date
            });
        }
        setAvailableMonths(months);
    };

    const generateDatesForMonth = (monthDate) => {
        if (!currentLesson?.dayOfWeek?.order) {
            console.log('Немає інформації про день тижня');
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

        // Конвертуємо order в день тижня JS (0-6, де 0 - неділя)
        let targetDayOfWeek;
        if (dayOfWeekOrder === 7) {
            targetDayOfWeek = 0; // неділя
        } else {
            targetDayOfWeek = dayOfWeekOrder; // понеділок-субота (1-6)
        }

        console.log('Цільовий день тижня JS:', targetDayOfWeek);

        // Проходимо по всіх днях місяця
        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            const currentDayOfWeek = d.getDay();

            if (currentDayOfWeek === targetDayOfWeek) {
                dates.push({
                    date: new Date(d),
                    formatted: d.toLocaleDateString('uk-UA', {
                        day: '2-digit',
                        month: '2-digit'
                    }),
                    fullDate: d.toISOString().split('T')[0],
                    dayOfWeek: d.toLocaleDateString('uk-UA', { weekday: 'short' })
                });
            }
        }

        console.log(`Згенеровано ${dates.length} дат для місяця`);
        setDates(dates);
    };

    const handlePrevMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() - 1);
        setCurrentMonth(newMonth);
    };

    const handleNextMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + 1);
        setCurrentMonth(newMonth);
    };

    const handleMonthSelect = (index) => {
        const newMonth = new Date(availableMonths[index].date);
        setCurrentMonth(newMonth);
    };

    const handleCellClick = (studentId, date) => {
        console.log('Клік на клітинку:', { studentId, date });

        const existingGrade = grades.find(
            g => g.student === studentId && g.date.split('T')[0] === date.fullDate
        );

        const existingHomework = homeworks.find(
            h => h.date.split('T')[0] === date.fullDate
        );

        console.log('Існуюча оцінка:', existingGrade);
        console.log('Існуюче ДЗ:', existingHomework);

        setSelectedCell({ studentId, date });
        setSelectedGrade(existingGrade || null);
        setSelectedHomework(existingHomework || null);
        setShowGradeModal(true);
    };

    const handleAddHomework = () => {
        setShowHomeworkModal(true);
    };

    const handleSaveGrade = async (gradeData) => {
        try {
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

    const handleSaveHomework = async (homeworkText) => {
        try {
            if (selectedHomework) {
                // Оновлення
                const response = await axios.put(`/api/homeworks/${selectedHomework._id}`, {
                    text: homeworkText,
                    databaseName
                });
                setHomeworks(homeworks.map(h => h._id === selectedHomework._id ? response.data : h));
            } else {
                // Створення
                const response = await axios.post('/api/homeworks', {
                    text: homeworkText,
                    databaseName,
                    schedule: scheduleId,
                    date: selectedCell.date.fullDate
                });
                setHomeworks([...homeworks, response.data]);
            }
            setShowHomeworkModal(false);
            setSelectedCell(null);
        } catch (error) {
            console.error('Помилка збереження ДЗ:', error);
            alert('Помилка при збереженні домашнього завдання');
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

    const handleDeleteHomework = async () => {
        if (!selectedHomework) return;

        try {
            await axios.delete(`/api/homeworks/${selectedHomework._id}`, {
                data: { databaseName }
            });
            setHomeworks(homeworks.filter(h => h._id !== selectedHomework._id));
            setShowHomeworkModal(false);
            setSelectedCell(null);
        } catch (error) {
            console.error('Помилка видалення ДЗ:', error);
        }
    };

    const getGradeForStudentAndDate = (studentId, date) => {
        const grade = grades.find(
            g => g.student === studentId && g.date.split('T')[0] === date.fullDate
        );
        return grade?.value;
    };

    const getHomeworkForDate = (date) => {
        const homework = homeworks.find(h => h.date.split('T')[0] === date.fullDate);
        return homework?.text;
    };

    const formatMonthYear = (date) => {
        return date.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
    };

    if (loading) {
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

            {/* Навігація по місяцях */}
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
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: '#6b7280',
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
                        onChange={(e) => handleMonthSelect(e.target.value)}
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
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    {!isMobile && 'Наступний'}
                    <FaChevronRight />
                </button>
            </div>

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
                <>
                    <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleAddHomework}
                            style={{
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(105, 180, 185, 1)',
                                color: 'rgba(105, 180, 185, 1)',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FaBook />
                            Додати ДЗ
                        </button>
                    </div>

                    <JournalTable
                        students={students}
                        dates={dates}
                        getGradeForStudentAndDate={getGradeForStudentAndDate}
                        getHomeworkForDate={getHomeworkForDate}
                        onCellClick={handleCellClick}
                        isMobile={isMobile}
                    />
                </>
            )}

            <GradeModal
                show={showGradeModal}
                onHide={() => setShowGradeModal(false)}
                onSave={handleSaveGrade}
                onDelete={handleDeleteGrade}
                existingGrade={selectedGrade}
                isMobile={isMobile}
            />

            <HomeworkModal
                show={showHomeworkModal}
                onHide={() => setShowHomeworkModal(false)}
                onSave={handleSaveHomework}
                onDelete={handleDeleteHomework}
                existingHomework={selectedHomework}
                isMobile={isMobile}
            />
        </div>
    );
};

export default GradebookPage;