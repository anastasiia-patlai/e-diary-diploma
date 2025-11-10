import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import EditScheduleHeader from './EditScheduleHeader';
import EditScheduleBody from './EditScheduleBody';
import EditScheduleFooter from './EditScheduleFooter';

const EditScheduleModal = ({
    show,
    onHide,
    schedule,
    classrooms,
    timeSlots,
    teachers,
    onSave,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        classroom: '',
        timeSlot: '',
        teacher: ''
    });
    const [availableClassrooms, setAvailableClassrooms] = useState([]);
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [availability, setAvailability] = useState({ available: true, conflicts: {} });
    const [apiAvailable, setApiAvailable] = useState(true);

    // ФІЛЬТРАЦІЯ ЧАСОВИХ СЛОТІВ ЗА ОБРАНИМ ДНЕМ ТИЖНЯ
    useEffect(() => {
        if (schedule && timeSlots.length > 0) {
            const dayId = schedule.dayOfWeek?._id || schedule.dayOfWeek?.id;
            const filtered = timeSlots.filter(slot =>
                slot.dayOfWeek?._id === dayId ||
                slot.dayOfWeek?.id === dayId
            );
            setFilteredTimeSlots(filtered.sort((a, b) => a.order - b.order));
        } else {
            setFilteredTimeSlots(timeSlots.sort((a, b) => a.order - b.order));
        }
    }, [timeSlots, schedule]);

    useEffect(() => {
        if (schedule && show) {
            setFormData({
                classroom: schedule.classroom?._id || '',
                timeSlot: schedule.timeSlot?._id || '',
                teacher: schedule.teacher?._id || ''
            });

            setApiAvailable(true);
            setError('');
        }
    }, [schedule, show]);

    useEffect(() => {
        if (formData.timeSlot && schedule) {
            loadAvailableResources();
        }
    }, [formData.timeSlot]);

    useEffect(() => {
        if (formData.timeSlot && (formData.classroom || formData.teacher)) {
            checkAvailability();
        }
    }, [formData.classroom, formData.teacher]);

    const loadAvailableResources = async () => {
        if (!schedule || !formData.timeSlot) return;

        setLoadingData(true);
        setError('');

        try {
            const dayOfWeekId = schedule.dayOfWeek?._id || schedule.dayOfWeek?.id;

            console.log('🔄 Завантаження доступних ресурсів:', {
                dayOfWeekId,
                timeSlotId: formData.timeSlot,
                scheduleId: schedule._id,
                subject: schedule.subject
            });

            // ЗАВАНТАЖИТИ ВІЛЬНІ АУДИТОРІЇ
            try {
                const url = `/api/available/classrooms?dayOfWeekId=${dayOfWeekId}&timeSlotId=${formData.timeSlot}&excludeScheduleId=${schedule._id}`;
                console.log('Запит до API аудиторій:', url);

                const classroomsResponse = await fetch(url);
                console.log('Відповідь від API аудиторій:', {
                    status: classroomsResponse.status,
                    statusText: classroomsResponse.statusText,
                    ok: classroomsResponse.ok
                });

                if (classroomsResponse.ok) {
                    const contentType = classroomsResponse.headers.get('content-type');
                    console.log('Content-Type:', contentType);

                    if (contentType && contentType.includes('application/json')) {
                        const responseText = await classroomsResponse.text();
                        console.log('Відповідь текст:', responseText);

                        try {
                            const classroomsData = JSON.parse(responseText);
                            console.log('Аудиторії успішно отримано:', classroomsData.length);
                            setAvailableClassrooms(classroomsData);
                        } catch (parseError) {
                            console.error('Помилка парсингу JSON:', parseError);
                            throw new Error('Не вдалося розпізнати відповідь сервера');
                        }
                    } else {
                        const responseText = await classroomsResponse.text();
                        console.error('Сервер повернув не JSON:', responseText.substring(0, 200));
                        throw new Error('Сервер повернув не JSON відповідь: ' + responseText.substring(0, 100));
                    }
                } else {
                    const errorText = await classroomsResponse.text();
                    console.error('HTTP помилка:', classroomsResponse.status, errorText);
                    throw new Error(`HTTP error! status: ${classroomsResponse.status}`);
                }
            } catch (classroomError) {
                console.warn('API для аудиторій недоступне, використовую fallback:', classroomError.message);
                setApiAvailable(false);
                const activeClassrooms = classrooms.filter(classroom => classroom.isActive !== false);
                setAvailableClassrooms(activeClassrooms);
            }

            // ЗАВАНТАЖИТИ ВІЛЬНИХ ВИКЛАДАЧІВ
            try {
                const url = `/api/available/teachers?dayOfWeekId=${dayOfWeekId}&timeSlotId=${formData.timeSlot}&subject=${encodeURIComponent(schedule.subject)}&excludeScheduleId=${schedule._id}`;
                console.log('Запит до API викладачів:', url);

                const teachersResponse = await fetch(url);
                console.log('Відповідь від API викладачів:', {
                    status: teachersResponse.status,
                    statusText: teachersResponse.statusText,
                    ok: teachersResponse.ok
                });

                if (teachersResponse.ok) {
                    const contentType = teachersResponse.headers.get('content-type');
                    console.log('Content-Type:', contentType);

                    if (contentType && contentType.includes('application/json')) {
                        const responseText = await teachersResponse.text();
                        console.log('Відповідь текст:', responseText);

                        try {
                            const teachersData = JSON.parse(responseText);
                            console.log('Викладачі успішно отримано:', teachersData.length);
                            setAvailableTeachers(teachersData);
                        } catch (parseError) {
                            console.error('Помилка парсингу JSON:', parseError);
                            throw new Error('Не вдалося розпізнати відповідь сервера');
                        }
                    } else {
                        const responseText = await teachersResponse.text();
                        console.error('Сервер повернув не JSON:', responseText.substring(0, 200));
                        throw new Error('Сервер повернув не JSON відповідь: ' + responseText.substring(0, 100));
                    }
                } else {
                    const errorText = await teachersResponse.text();
                    console.error('HTTP помилка:', teachersResponse.status, errorText);
                    throw new Error(`HTTP error! status: ${teachersResponse.status}`);
                }
            } catch (teacherError) {
                console.warn('API для викладачів недоступне, використовую fallback:', teacherError.message);
                setApiAvailable(false);
                const teachersForSubject = teachers.filter(teacher =>
                    teacher.positions?.includes(schedule.subject) ||
                    teacher.position?.includes(schedule.subject) ||
                    (teacher.positions && teacher.positions.some(pos => pos.includes(schedule.subject))) ||
                    (teacher.position && teacher.position.includes(schedule.subject))
                );
                setAvailableTeachers(teachersForSubject);
            }

        } catch (err) {
            console.error('Загальна помилка завантаження доступних ресурсів:', err);
            setError('Не вдалося завантажити доступні ресурси. Використовуються всі доступні варіанти.');
            setApiAvailable(false);

            setAvailableClassrooms(classrooms.filter(classroom => classroom.isActive !== false));
            const teachersForSubject = teachers.filter(teacher =>
                teacher.positions?.includes(schedule.subject) ||
                teacher.position?.includes(schedule.subject)
            );
            setAvailableTeachers(teachersForSubject.length > 0 ? teachersForSubject : teachers);
        } finally {
            setLoadingData(false);
        }
    };

    const checkAvailability = async () => {
        if (!schedule || !formData.timeSlot || !apiAvailable) return;

        try {
            const dayOfWeekId = schedule.dayOfWeek?._id || schedule.dayOfWeek?.id;
            const params = new URLSearchParams({
                dayOfWeekId,
                timeSlotId: formData.timeSlot,
                excludeScheduleId: schedule._id
            });

            if (formData.classroom) params.append('classroomId', formData.classroom);
            if (formData.teacher) params.append('teacherId', formData.teacher);

            const response = await fetch(`/api/available/check-availability?${params}`);

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const availabilityData = await response.json();
                    setAvailability(availabilityData);
                } else {
                    setAvailability({ available: true, conflicts: {} });
                }
            } else {
                setAvailability({ available: true, conflicts: {} });
            }
        } catch (err) {
            console.warn('API перевірки доступності недоступне:', err);
            setAvailability({ available: true, conflicts: {} });
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        if (formData.classroom && formData.timeSlot && formData.teacher) {
            const selectedTimeSlot = timeSlots.find(t => t._id === formData.timeSlot);
            const selectedClassroom = availableClassrooms.find(c => c._id === formData.classroom) || classrooms.find(c => c._id === formData.classroom);
            const selectedTeacher = availableTeachers.find(t => t._id === formData.teacher) || teachers.find(t => t._id === formData.teacher);

            onSave({
                ...schedule,
                classroom: selectedClassroom,
                timeSlot: selectedTimeSlot,
                teacher: selectedTeacher
            });
        }
    };

    const handleClose = () => {
        setFormData({
            classroom: '',
            timeSlot: '',
            teacher: ''
        });
        setAvailableClassrooms([]);
        setAvailableTeachers([]);
        setError('');
        setAvailability({ available: true, conflicts: {} });
        setApiAvailable(true);
        onHide();
    };

    const isFormValid = formData.classroom && formData.timeSlot && formData.teacher;
    const hasConflicts = !availability.available && apiAvailable;

    const formatTimeSlot = (slot) => {
        return `${slot.order}. ${slot.startTime} - ${slot.endTime}`;
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            centered
            backdrop="static"
        >
            <EditScheduleHeader
                onClose={handleClose}
                apiAvailable={apiAvailable}
            />

            <EditScheduleBody
                schedule={schedule}
                formData={formData}
                filteredTimeSlots={filteredTimeSlots}
                availableClassrooms={availableClassrooms}
                availableTeachers={availableTeachers}
                loadingData={loadingData}
                error={error}
                availability={availability}
                apiAvailable={apiAvailable}
                hasConflicts={hasConflicts}
                onInputChange={handleInputChange}
                formatTimeSlot={formatTimeSlot}
            />

            <EditScheduleFooter
                onClose={handleClose}
                onSave={handleSave}
                loading={loading}
                loadingData={loadingData}
                isFormValid={isFormValid}
                hasConflicts={hasConflicts}
                apiAvailable={apiAvailable}
            />
        </Modal>
    );
};

export default EditScheduleModal;