import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Form, Card, Table, Badge,
    Spinner, Alert, Tab, Nav
} from 'react-bootstrap';
import {
    FaCalendarAlt,
    FaClock,
    FaBook,
    FaUserFriends,
    FaDoorOpen,
    FaFilter,
    FaCalendarCheck,
    FaHistory,
    FaCalendarTimes
} from 'react-icons/fa';
import axios from 'axios';

const TeacherScheduleTab = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teacherId, setTeacherId] = useState(null);
    const [databaseName, setDatabaseName] = useState('');
    const [teacherName, setTeacherName] = useState('');

    // Дані для завантаження
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedSemesterData, setSelectedSemesterData] = useState(null);
    const [daysOfWeek, setDaysOfWeek] = useState([]);
    const [activeDayId, setActiveDayId] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [scheduleData, setScheduleData] = useState([]);
    const [currentWeekDates, setCurrentWeekDates] = useState({});
    const [showDates, setShowDates] = useState(true);
    const [semesterStatus, setSemesterStatus] = useState(''); // 'active', 'past', 'future'

    // Мок-дані для тестування
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

    // Мок-розклад для демонстрації
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

    // Отримання даних вчителя з localStorage
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.role === 'teacher') {
            setTeacherId(userInfo.userId);
            setDatabaseName(userInfo.databaseName);
            setTeacherName(userInfo.fullName || 'Викладач');
            console.log('Дані вчителя:', userInfo);
        } else {
            setError('Доступ заборонено. Будь ласка, увійдіть як вчитель.');
            setLoading(false);
        }
    }, []);

    // Функція для перевірки статусу семестру
    const checkSemesterStatus = (semester) => {
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
    };

    // Функція для отримання поточних дат тижня (тільки для активних семестрів)
    const getWeekDates = () => {
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
    };

    // Завантаження семестрів
    const loadSemesters = async () => {
        try {
            console.log('Завантаження семестрів з API...');
            const response = await axios.get(`/api/study-calendar/semesters`, {
                params: { databaseName }
            });

            console.log('Семестри отримано:', response.data);

            if (response.data && Array.isArray(response.data)) {
                const sortedSemesters = response.data.sort((a, b) => {
                    const yearA = a.year.split('-')[0];
                    const yearB = b.year.split('-')[0];
                    if (yearB !== yearA) return yearB - yearA;

                    const order = { 'I. Осінньо-зимовий': 1, 'II. Зимово-весняний': 2 };
                    return order[a.name] - order[b.name];
                });

                setSemesters(sortedSemesters);

                // Автоматично вибираємо семестр
                let selectedSem = null;

                // Спочатку шукаємо активний за датами
                for (const semester of sortedSemesters) {
                    const status = checkSemesterStatus(semester);
                    if (status === 'active') {
                        selectedSem = semester;
                        break;
                    }
                }

                // Якщо немає активного, беремо останній завершений
                if (!selectedSem) {
                    for (const semester of sortedSemesters) {
                        const status = checkSemesterStatus(semester);
                        if (status === 'past') {
                            selectedSem = semester;
                            break;
                        }
                    }
                }

                // Якщо все ще немає, беремо перший
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
                // Мок-семестри для тестування
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
    };

    // Завантаження днів тижня
    const loadDaysOfWeek = async () => {
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
    };

    // Завантаження часових слотів
    const loadTimeSlots = async (dayId) => {
        try {
            console.log('Завантаження часових слотів для дня:', dayId);

            // Спроба завантажити з API
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

        // Використання мок-даних
        setTimeSlots(mockTimeSlots);
    };

    // Завантаження розкладу викладача
    const loadTeacherSchedule = async () => {
        if (!selectedSemester || !teacherId) {
            console.log('Очікування семестру та ID вчителя');
            return;
        }

        try {
            console.log('Завантаження розкладу для вчителя:', teacherId, 'семестр:', selectedSemester);

            const response = await axios.get(`/api/schedule/teacher/${teacherId}`, {
                params: {
                    databaseName,
                    semester: selectedSemester
                }
            });

            console.log('Розклад отримано з API:', response.data);

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
    };

    // Обробник зміни семестру
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

    // Основний ефект для завантаження даних
    useEffect(() => {
        const loadAllData = async () => {
            if (!databaseName || !teacherId) {
                console.log('Очікування databaseName та teacherId');
                return;
            }

            setLoading(true);
            setError(null);

            try {
                console.log('Початок завантаження всіх даних');

                // Завантажуємо семестри
                await loadSemesters();

                // Завантажуємо дні тижня
                await loadDaysOfWeek();

                setLoading(false);
                console.log('Дані успішно завантажено');
            } catch (err) {
                console.error('Критична помилка завантаження даних:', err);
                setError('Сталася помилка при завантаженні даних');
                setLoading(false);
            }
        };

        loadAllData();
    }, [databaseName, teacherId]);

    // Ефект для завантаження розкладу при зміні семестру
    useEffect(() => {
        if (selectedSemester && teacherId) {
            console.log('Зміна семестру, завантаження розкладу...');
            loadTeacherSchedule();
        }
    }, [selectedSemester]);

    // Ефект для завантаження часових слотів при зміні активного дня
    useEffect(() => {
        if (activeDayId && daysOfWeek.length > 0) {
            console.log('Зміна активного дня, завантаження часових слотів...');
            loadTimeSlots(activeDayId);
        }
    }, [activeDayId, daysOfWeek]);

    // Ефект для оновлення дат при зміні статусу семестру
    useEffect(() => {
        if (semesterStatus === 'active') {
            setCurrentWeekDates(getWeekDates());
        } else {
            setCurrentWeekDates({});
        }
    }, [semesterStatus]);

    // Форматування часу
    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.slice(0, 5);
    };

    // Отримання заняття для конкретного часового слоту та дня
    const getLessonForTimeSlot = (dayId, timeSlotId) => {
        return scheduleData.find(lesson =>
            lesson.dayOfWeek?._id === dayId &&
            lesson.timeSlot?._id === timeSlotId
        );
    };

    // Отримання назви підгрупи
    const getSubgroupLabel = (subgroup) => {
        switch (subgroup) {
            case 'all': return 'Вся група';
            case '1': return 'Підгр. 1';
            case '2': return 'Підгр. 2';
            case '3': return 'Підгр. 3';
            default: return subgroup;
        }
    };

    // Рендер заголовку таблиці з датою
    const renderTableHeader = (day) => {
        const weekDate = currentWeekDates[day.order - 1];

        return (
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">
                    <FaCalendarAlt className="me-2" />
                    {day.name}
                </h5>
                {weekDate && showDates ? (
                    <Badge bg="light" text="dark" className="fs-6">
                        {weekDate.formatted}
                    </Badge>
                ) : semesterStatus === 'past' ? (
                    <Badge bg="secondary" className="fs-6">
                        <FaHistory className="me-1" /> Завершений семестр
                    </Badge>
                ) : semesterStatus === 'future' ? (
                    <Badge bg="info" className="fs-6">
                        <FaCalendarTimes className="me-1" /> Майбутній семестр
                    </Badge>
                ) : null}
            </div>
        );
    };

    // Рендер таблиці розкладу для конкретного дня
    const renderScheduleTable = (day) => {
        if (timeSlots.length === 0) {
            return (
                <Alert variant="info">
                    <FaClock className="me-2" />
                    Час уроків для цього дня не налаштовано
                </Alert>
            );
        }

        const hasLessons = scheduleData.some(lesson =>
            lesson.dayOfWeek?._id === day._id ||
            lesson.dayOfWeek?._id?.toString() === day._id
        );

        return (
            <div className="table-responsive">
                <Table striped bordered hover className="align-middle">
                    <thead className="table-light">
                        <tr>
                            <th width="80">№</th>
                            <th width="120">Час</th>
                            <th>Предмет</th>
                            <th>Група</th>
                            <th width="150">Аудиторія</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((slot) => {
                            const lesson = getLessonForTimeSlot(day._id, slot._id);

                            return (
                                <tr key={slot._id} className={lesson ? 'table-row-hover' : ''}>
                                    <td className="text-center fw-bold">
                                        {slot.order}
                                    </td>
                                    <td className="text-nowrap">
                                        <div className="d-flex align-items-center">
                                            <FaClock className="me-2 text-primary" />
                                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                        </div>
                                    </td>
                                    <td>
                                        {lesson ? (
                                            <div className="d-flex align-items-center">
                                                <FaBook className="me-2 text-success" />
                                                <span className="fw-semibold">{lesson.subject}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td>
                                        {lesson ? (
                                            <div>
                                                <div className="d-flex align-items-center">
                                                    <FaUserFriends className="me-2 text-secondary" />
                                                    <span className="fw-medium">{lesson.group?.name}</span>
                                                </div>
                                                {lesson.subgroup && lesson.subgroup !== 'all' && (
                                                    <Badge bg="info" className="ms-2 mt-1">
                                                        {getSubgroupLabel(lesson.subgroup)}
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td>
                                        {lesson?.classroom ? (
                                            <div className="d-flex align-items-center">
                                                <FaDoorOpen className="me-2 text-warning" />
                                                <div>
                                                    <div className="fw-medium">{lesson.classroom.name}</div>
                                                    {lesson.classroom.type && (
                                                        <small className="text-muted">({lesson.classroom.type})</small>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>

                {!hasLessons && (
                    <Alert variant="secondary" className="mt-3">
                        <FaCalendarAlt className="me-2" />
                        Немає занять на цей день
                    </Alert>
                )}
            </div>
        );
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
            {/* Заголовок та інформація про викладача */}
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body className="pb-2">
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h4 className="mb-1">
                                <FaCalendarCheck className="me-2 text-primary" />
                                Розклад занять
                            </h4>
                            <p className="text-muted mb-0">{teacherName}</p>
                        </Col>
                        <Col md={6}>
                            <div className="d-flex justify-content-md-end align-items-center mt-2 mt-md-0">
                                <div className="me-3">
                                    <small className="text-muted d-block">Семестр</small>
                                    <Form.Select
                                        value={selectedSemester || ''}
                                        onChange={(e) => handleSemesterChange(e.target.value)}
                                        style={{ width: '280px' }}
                                    >
                                        <option value="">Оберіть семестр</option>
                                        {semesters.map(semester => {
                                            const status = checkSemesterStatus(semester);
                                            return (
                                                <option key={semester._id} value={semester._id}>
                                                    {semester.name} {semester.year}
                                                    {status === 'active' && ' (активний)'}
                                                    {status === 'past' && ' (завершений)'}
                                                    {status === 'future' && ' (майбутній)'}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </div>
                                <Badge bg="light" text="dark" className="fs-6 p-2">
                                    <FaFilter className="me-1" />
                                    {scheduleData.length} заняття
                                </Badge>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Вкладки з днями тижня */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Tab.Container
                        activeKey={activeDayId || daysOfWeek[0]?._id}
                        onSelect={(key) => setActiveDayId(key)}
                    >
                        {/* Навігація по днях тижня */}
                        <Card.Header className="bg-light border-bottom">
                            <Nav variant="tabs" className="border-0">
                                {daysOfWeek.map(day => {
                                    const weekDate = currentWeekDates[day.order - 1];
                                    return (
                                        <Nav.Item key={day._id}>
                                            <Nav.Link eventKey={day._id} className="text-center">
                                                <div className="d-flex flex-column">
                                                    <span className="fw-medium">{day.nameShort}</span>
                                                    {weekDate && showDates ? (
                                                        <small className="text-muted">{weekDate.short}</small>
                                                    ) : (
                                                        <small className="text-muted" style={{ visibility: 'hidden' }}>00.00</small>
                                                    )}
                                                </div>
                                            </Nav.Link>
                                        </Nav.Item>
                                    );
                                })}
                            </Nav>
                        </Card.Header>

                        {/* Контент вкладок */}
                        <Tab.Content>
                            {daysOfWeek.map(day => (
                                <Tab.Pane key={day._id} eventKey={day._id}>
                                    <Card.Body>
                                        {renderTableHeader(day)}
                                        {renderScheduleTable(day)}
                                    </Card.Body>
                                </Tab.Pane>
                            ))}
                        </Tab.Content>
                    </Tab.Container>
                </Card.Body>
            </Card>

            {/* Інформаційний блок */}
            <Row className="mt-4">
                <Col md={6}>
                    <Card className="border-0 bg-light">
                        <Card.Body>
                            <h6 className="mb-3">
                                <FaCalendarAlt className="me-2" />
                                Інформація про розклад
                            </h6>
                            <div className="small">
                                <div className="mb-1">
                                    <span className="text-muted">Загальна кількість занять: </span>
                                    <strong>{scheduleData.length}</strong>
                                </div>
                                <div className="mb-1">
                                    <span className="text-muted">Обраний семестр: </span>
                                    <strong>
                                        {selectedSemesterData?.name || 'Не обрано'}
                                    </strong>
                                </div>
                                <div className="mb-1">
                                    <span className="text-muted">Навчальний рік: </span>
                                    <strong>
                                        {selectedSemesterData?.year || 'Не обрано'}
                                    </strong>
                                </div>
                                <div className="mb-1">
                                    <span className="text-muted">Статус семестру: </span>
                                    {semesterStatus === 'active' ? (
                                        <Badge bg="success">Активний</Badge>
                                    ) : semesterStatus === 'past' ? (
                                        <Badge bg="secondary">Завершений</Badge>
                                    ) : semesterStatus === 'future' ? (
                                        <Badge bg="info">Майбутній</Badge>
                                    ) : null}
                                </div>
                                <div>
                                    <span className="text-muted">Викладач: </span>
                                    <strong>{teacherName}</strong>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="border-0 bg-light">
                        <Card.Body>
                            <h6 className="mb-3">
                                <FaClock className="me-2" />
                                Легенда
                            </h6>
                            <div className="small">
                                <div className="d-flex align-items-center mb-2">
                                    <FaBook className="me-2 text-success" />
                                    <span> - Предмет</span>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                    <FaUserFriends className="me-2 text-secondary" />
                                    <span> - Група/Клас</span>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                    <FaDoorOpen className="me-2 text-warning" />
                                    <span> - Аудиторія</span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <Badge bg="info" className="me-2">Підгр. 1</Badge>
                                    <span> - Позначення підгрупи</span>
                                </div>
                                {semesterStatus === 'past' && (
                                    <div className="d-flex align-items-center mt-2">
                                        <Badge bg="secondary" className="me-2">
                                            <FaHistory />
                                        </Badge>
                                        <span> - Завершений семестр (дати не актуальні)</span>
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Стилі */}
            <style jsx="true">{`
                .table-row-hover:hover {
                    background-color: rgba(0, 123, 255, 0.05) !important;
                }
                .nav-tabs .nav-link {
                    border: 1px solid #dee2e6;
                    border-bottom: none;
                    border-radius: 0.375rem 0.375rem 0 0;
                    margin-right: 0.25rem;
                    color: #495057;
                }
                .nav-tabs .nav-link.active {
                    background-color: #fff;
                    border-color: #dee2e6 #dee2e6 #fff;
                    color: #0d6efd;
                    font-weight: 600;
                }
                .nav-tabs .nav-link:hover {
                    border-color: #e9ecef #e9ecef #dee2e6;
                }
                .card {
                    border-radius: 0.75rem;
                }
                .table {
                    border-radius: 0.5rem;
                    overflow: hidden;
                }
                .table th {
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.85rem;
                    letter-spacing: 0.5px;
                }
            `}</style>
        </Container>
    );
};

export default TeacherScheduleTab;