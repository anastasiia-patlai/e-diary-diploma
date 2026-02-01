import React, { useState, useEffect, useCallback } from 'react';
import { Container, Spinner, Alert, Tab } from 'react-bootstrap';
import axios from 'axios';
import TeacherScheduleHeader from './components/TeacherScheduleHeader';
import DaysOfWeekTabs from './components/DaysOfWeekTabs';
import DayScheduleTable from './components/DayScheduleTable';
import ScheduleInfoCards from './components/ScheduleInfoCards';

const TeacherScheduleTab = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teacherId, setTeacherId] = useState(null);
    const [databaseName, setDatabaseName] = useState('');
    const [teacherName, setTeacherName] = useState('');

    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedSemesterData, setSelectedSemesterData] = useState(null);
    const [daysOfWeek, setDaysOfWeek] = useState([]);
    const [activeDayId, setActiveDayId] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [scheduleData, setScheduleData] = useState([]);
    const [currentWeekDates, setCurrentWeekDates] = useState({});
    const [showDates, setShowDates] = useState(true);
    const [semesterStatus, setSemesterStatus] = useState('');

    // Мок-дані
    const mockTimeSlots = [
        { _id: '1', order: 1, startTime: '08:30', endTime: '09:15' },
        { _id: '2', order: 2, startTime: '09:25', endTime: '10:10' },
        { _id: '3', order: 3, startTime: '10:30', endTime: '11:15' },
        { _id: '4', order: 4, startTime: '11:25', endTime: '12:10' },
        { _id: '5', order: 5, startTime: '12:20', endTime: '13:05' },
        { _id: '6', order: 6, startTime: '13:15', endTime: '14:00' },
        { _id: '7', order: 7, startTime: '14:10', endTime: '14:55' }
    ];

    const mockDaysOfWeek = [
        { _id: '1', name: 'Понеділок', nameShort: 'Пн', order: 1, isActive: true },
        { _id: '2', name: 'Вівторок', nameShort: 'Вт', order: 2, isActive: true },
        { _id: '3', name: 'Середа', nameShort: 'Ср', order: 3, isActive: true },
        { _id: '4', name: 'Четвер', nameShort: 'Чт', order: 4, isActive: true },
        { _id: '5', name: 'П\'ятниця', nameShort: 'Пт', order: 5, isActive: true }
    ];

    const mockScheduleData = [
        {
            _id: '1',
            subject: 'Математика',
            group: { _id: '1', name: '5-А' },
            subgroup: 'all',
            teacher: { _id: '1', fullName: 'Іваненко І.І.' },
            classroom: { _id: '1', name: '205', type: 'кабінет' },
            dayOfWeek: { _id: '1', order: 1 },
            timeSlot: { _id: '1', order: 1 }
        },
        {
            _id: '2',
            subject: 'Фізика',
            group: { _id: '2', name: '8-Б' },
            subgroup: '1',
            teacher: { _id: '1', fullName: 'Іваненко І.І.' },
            classroom: { _id: '2', name: 'Фіз. зал', type: 'спеціальний' },
            dayOfWeek: { _id: '2', order: 2 },
            timeSlot: { _id: '2', order: 2 }
        },
        {
            _id: '3',
            subject: 'Хімія',
            group: { _id: '3', name: '10-А' },
            subgroup: 'all',
            teacher: { _id: '1', fullName: 'Іваненко І.І.' },
            classroom: { _id: '3', name: 'Хім. кабінет', type: 'лабораторія' },
            dayOfWeek: { _id: '3', order: 3 },
            timeSlot: { _id: '3', order: 3 }
        }
    ];

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.role === 'teacher') {
            setTeacherId(userInfo.userId);
            setDatabaseName(userInfo.databaseName);
            setTeacherName(userInfo.fullName || 'Викладач');
        } else {
            setError('Доступ заборонено. Будь ласка, увійдіть як вчитель.');
            setLoading(false);
        }
    }, []);

    const checkSemesterStatus = useCallback((semester) => {
        if (!semester || !semester.startDate || !semester.endDate) {
            return 'unknown';
        }

        const today = new Date();
        const startDate = new Date(semester.startDate);
        const endDate = new Date(semester.endDate);

        if (today < startDate) {
            return 'future';
        } else if (today > endDate) {
            return 'past';
        } else {
            return 'active';
        }
    }, []);

    const getWeekDates = useCallback(() => {
        if (semesterStatus !== 'active') {
            return {};
        }

        const today = new Date();
        const currentDay = today.getDay();
        const diff = currentDay === 0 ? 6 : currentDay - 1;
        const monday = new Date(today);
        monday.setDate(today.getDate() - diff);

        const weekDates = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);

            const dayIndex = date.getDay();
            const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;

            weekDates[adjustedDayIndex] = {
                date: date,
                formatted: date.toLocaleDateString('uk-UA', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }),
                short: date.toLocaleDateString('uk-UA', {
                    day: '2-digit',
                    month: '2-digit'
                })
            };
        }

        return weekDates;
    }, [semesterStatus]);

    const loadSemesters = useCallback(async () => {
        try {
            const response = await axios.get(`/api/study-calendar/semesters`, {
                params: { databaseName }
            });

            if (response.data && Array.isArray(response.data)) {
                const sortedSemesters = response.data.sort((a, b) => {
                    const yearA = a.year.split('-')[0];
                    const yearB = b.year.split('-')[0];
                    if (yearB !== yearA) return yearB - yearA;

                    const order = { 'I. Осінньо-зимовий': 1, 'II. Зимово-весняний': 2 };
                    return order[a.name] - order[b.name];
                });

                setSemesters(sortedSemesters);

                let selectedSem = null;
                for (const semester of sortedSemesters) {
                    const status = checkSemesterStatus(semester);
                    if (status === 'active') {
                        selectedSem = semester;
                        break;
                    }
                }

                if (!selectedSem) {
                    for (const semester of sortedSemesters) {
                        const status = checkSemesterStatus(semester);
                        if (status === 'past') {
                            selectedSem = semester;
                            break;
                        }
                    }
                }

                if (!selectedSem && sortedSemesters.length > 0) {
                    selectedSem = sortedSemesters[0];
                }

                if (selectedSem) {
                    setSelectedSemester(selectedSem._id);
                    setSelectedSemesterData(selectedSem);
                    const status = checkSemesterStatus(selectedSem);
                    setSemesterStatus(status);
                    setShowDates(status === 'active');
                }
            } else {
                const mockSemesters = [
                    { _id: '1', name: 'I. Осінньо-зимовий', year: '2024-2025', isActive: true, startDate: '2024-09-01', endDate: '2024-12-31' },
                    { _id: '2', name: 'II. Зимово-весняний', year: '2024-2025', isActive: false, startDate: '2025-01-10', endDate: '2025-05-31' }
                ];
                setSemesters(mockSemesters);

                const today = new Date();
                const endDate = new Date(mockSemesters[0].endDate);

                if (today > endDate) {
                    setSemesterStatus('past');
                    setShowDates(false);
                } else {
                    setSemesterStatus('active');
                    setShowDates(true);
                }

                setSelectedSemester('1');
                setSelectedSemesterData(mockSemesters[0]);
            }
        } catch (error) {
            console.warn('Не вдалося завантажити семестри з API, використовуються мок-дані:', error.message);
            const mockSemesters = [
                { _id: '1', name: 'I. Осінньо-зимовий', year: '2024-2025', isActive: true, startDate: '2024-09-01', endDate: '2024-12-31' }
            ];
            setSemesters(mockSemesters);

            const today = new Date();
            const endDate = new Date('2024-12-31');

            if (today > endDate) {
                setSemesterStatus('past');
                setShowDates(false);
            } else {
                setSemesterStatus('active');
                setShowDates(true);
            }

            setSelectedSemester('1');
            setSelectedSemesterData(mockSemesters[0]);
        }
    }, [databaseName, checkSemesterStatus]);

    const loadDaysOfWeek = useCallback(async () => {
        try {
            const response = await axios.get(`/api/days/active`, {
                params: { databaseName }
            });

            if (response.data && Array.isArray(response.data)) {
                const activeDays = response.data.filter(day => day.isActive);
                const sortedDays = activeDays.sort((a, b) => a.order - b.order);
                setDaysOfWeek(sortedDays);

                if (sortedDays.length > 0) {
                    setActiveDayId(sortedDays[0]._id);
                }
            } else {
                setDaysOfWeek(mockDaysOfWeek);
                setActiveDayId('1');
            }
        } catch (error) {
            console.warn('Не вдалося завантажити дні тижня, використовуються мок-дані:', error.message);
            setDaysOfWeek(mockDaysOfWeek);
            setActiveDayId('1');
        }
    }, [databaseName]);

    const loadTimeSlots = useCallback(async (dayId) => {
        try {
            const day = daysOfWeek.find(d => d._id === dayId);
            if (day) {
                const response = await axios.get(`/api/time-slots`, {
                    params: {
                        databaseName,
                        dayOfWeekId: day.order
                    }
                });

                if (response.data && Array.isArray(response.data)) {
                    const sortedSlots = response.data.sort((a, b) => a.order - b.order);
                    setTimeSlots(sortedSlots);
                    return;
                }
            }
        } catch (error) {
            console.warn('Не вдалося завантажити часові слоти, використовуються мок-дані:', error.message);
        }

        setTimeSlots(mockTimeSlots);
    }, [databaseName, daysOfWeek]);

    const loadTeacherSchedule = useCallback(async () => {
        if (!selectedSemester || !teacherId) return;

        try {
            const response = await axios.get(`/api/schedule/teacher/${teacherId}`, {
                params: {
                    databaseName,
                    semester: selectedSemester
                }
            });

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setScheduleData(response.data);
            } else {
                console.log('API повернув порожній розклад, використовуються мок-дані');
                setScheduleData(mockScheduleData);
            }
        } catch (error) {
            console.warn('Не вдалося завантажити розклад, використовуються мок-дані:', error.message);
            setScheduleData(mockScheduleData);
        }
    }, [databaseName, selectedSemester, teacherId]);

    const handleSemesterChange = (semesterId) => {
        const selectedSem = semesters.find(s => s._id === semesterId);
        if (selectedSem) {
            setSelectedSemester(semesterId);
            setSelectedSemesterData(selectedSem);

            const status = checkSemesterStatus(selectedSem);
            setSemesterStatus(status);
            setShowDates(status === 'active');

            if (status === 'active') {
                setCurrentWeekDates(getWeekDates());
            } else {
                setCurrentWeekDates({});
            }
        }
    };

    const handleDayChange = (dayId) => {
        setActiveDayId(dayId);
    };

    useEffect(() => {
        const loadAllData = async () => {
            if (!databaseName || !teacherId) return;

            setLoading(true);
            setError(null);

            try {
                await loadSemesters();
                await loadDaysOfWeek();
                setLoading(false);
            } catch (err) {
                setError('Сталася помилка при завантаженні даних');
                setLoading(false);
            }
        };

        loadAllData();
    }, [databaseName, teacherId, loadSemesters, loadDaysOfWeek]);

    useEffect(() => {
        if (selectedSemester && teacherId) {
            loadTeacherSchedule();
        }
    }, [selectedSemester, teacherId, loadTeacherSchedule]);

    useEffect(() => {
        if (activeDayId && daysOfWeek.length > 0) {
            loadTimeSlots(activeDayId);
        }
    }, [activeDayId, daysOfWeek, loadTimeSlots]);

    useEffect(() => {
        if (semesterStatus === 'active') {
            setCurrentWeekDates(getWeekDates());
        } else {
            setCurrentWeekDates({});
        }
    }, [semesterStatus, getWeekDates]);

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.slice(0, 5);
    };

    const getLessonForTimeSlot = (dayId, timeSlotId) => {
        return scheduleData.find(lesson =>
            lesson.dayOfWeek?._id === dayId &&
            lesson.timeSlot?._id === timeSlotId
        );
    };

    const getSubgroupLabel = (subgroup) => {
        switch (subgroup) {
            case 'all': return 'Вся група';
            case '1': return 'Підгр. 1';
            case '2': return 'Підгр. 2';
            case '3': return 'Підгр. 3';
            default: return subgroup;
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-3">Завантаження розкладу...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="m-3">
                <Alert.Heading>Помилка</Alert.Heading>
                <p>{error}</p>
            </Alert>
        );
    }

    return (
        <Container fluid className="py-4">
            <TeacherScheduleHeader
                teacherName={teacherName}
                semesters={semesters}
                selectedSemester={selectedSemester}
                scheduleData={scheduleData}
                onSemesterChange={(e) => handleSemesterChange(e.target.value)}
                checkSemesterStatus={checkSemesterStatus}
            />

            <DaysOfWeekTabs
                daysOfWeek={daysOfWeek}
                currentWeekDates={currentWeekDates}
                showDates={showDates}
                activeDayId={activeDayId}
                onDayChange={handleDayChange}
            >
                <Tab.Content>
                    {daysOfWeek.map(day => (
                        <Tab.Pane key={day._id} eventKey={day._id}>
                            <div className="p-3">
                                <DayScheduleTable
                                    day={day}
                                    timeSlots={timeSlots}
                                    scheduleData={scheduleData}
                                    getLessonForTimeSlot={getLessonForTimeSlot}
                                    formatTime={formatTime}
                                    getSubgroupLabel={getSubgroupLabel}
                                    weekDate={currentWeekDates[day.order - 1]}
                                    showDates={showDates}
                                    semesterStatus={semesterStatus}
                                />
                            </div>
                        </Tab.Pane>
                    ))}
                </Tab.Content>
            </DaysOfWeekTabs>

            <ScheduleInfoCards
                scheduleData={scheduleData}
                selectedSemesterData={selectedSemesterData}
                semesterStatus={semesterStatus}
                teacherName={teacherName}
            />

            <style jsx="true">{`
                .table-row-hover:hover {
                    background-color: rgba(0, 123, 255, 0.05) !important;
                }
            `}</style>
        </Container>
    );
};

export default TeacherScheduleTab;