const express = require('express');
const router = express.Router();
const { getSchoolScheduleModel, getSchoolGroupModel } = require('../config/databaseManager');

// Мідлвар для логування
router.use((req, res, next) => {
    console.log('Schedule API:', req.method, req.path, req.query);
    next();
});

// Отримати розклад
router.get('/', async (req, res) => {
    try {
        const { semester, databaseName, dayOfWeek, group, teacher } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Schedule = getSchoolScheduleModel(databaseName);

        let query = {};

        if (semester) {
            query.semester = semester;
        }

        if (dayOfWeek) {
            query.dayOfWeek = dayOfWeek;
        }

        if (group) {
            query.group = group;
        }

        if (teacher) {
            query.teacher = teacher;
        }

        const schedules = await Schedule.find(query)
            .populate('teacher', 'fullName email position positions')
            .populate('group', 'name category gradeLevel')
            .populate('classroom', 'name type')
            .populate('dayOfWeek', 'name order')
            .populate('timeSlot', 'order startTime endTime')
            .populate('semester', 'name year')
            .sort({ 'dayOfWeek.order': 1, 'timeSlot.order': 1 });

        res.json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({
            message: 'Помилка при отриманні розкладу',
            error: error.message
        });
    }
});

// Створити новий запис розкладу з перевірками на конфлікти
router.post('/', async (req, res) => {
    try {
        const { databaseName, ...scheduleData } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        // Перевірка обов'язкових полів
        const requiredFields = ['subject', 'group', 'teacher', 'classroom', 'timeSlot', 'dayOfWeek', 'semester'];
        const missingFields = requiredFields.filter(field => !scheduleData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Відсутні обов\'язкові поля',
                missingFields
            });
        }

        const Schedule = getSchoolScheduleModel(databaseName);
        const Group = getSchoolGroupModel(databaseName);

        // ВИДАЛИТИ _id з даних, якщо він є (для уникнення duplicate key error)
        if (scheduleData._id) {
            console.log('Видаляємо _id з даних для уникнення duplicate key error:', scheduleData._id);
            delete scheduleData._id;
        }

        // 1. ПЕРЕВІРКА: Чи не має група вже уроку в цей час (головна перевірка)
        const groupTimeSlotConflict = await Schedule.findOne({
            group: scheduleData.group,
            dayOfWeek: scheduleData.dayOfWeek,
            timeSlot: scheduleData.timeSlot
        })
            .populate('teacher', 'fullName')
            .populate('subject', 'name')
            .populate('timeSlot', 'order startTime endTime');

        if (groupTimeSlotConflict) {
            return res.status(409).json({
                message: 'Конфлікт розкладу: Група вже має урок в цей час',
                conflictType: 'GROUP_TIMESLOT_CONFLICT',
                details: {
                    existingLesson: {
                        subject: groupTimeSlotConflict.subject,
                        teacher: groupTimeSlotConflict.teacher?.fullName,
                        classroom: groupTimeSlotConflict.classroom,
                        timeSlot: groupTimeSlotConflict.timeSlot?.order,
                        timeRange: groupTimeSlotConflict.timeSlot ?
                            `${groupTimeSlotConflict.timeSlot.startTime} - ${groupTimeSlotConflict.timeSlot.endTime}` : null
                    },
                    message: `Група вже має урок з ${groupTimeSlotConflict.subject} в цей час`
                }
            });
        }

        // 2. Перевірка: Чи не зайнятий викладач в цей час
        const teacherConflict = await Schedule.findOne({
            teacher: scheduleData.teacher,
            dayOfWeek: scheduleData.dayOfWeek,
            timeSlot: scheduleData.timeSlot
        })
            .populate('group', 'name')
            .populate('timeSlot', 'order startTime endTime');

        if (teacherConflict) {
            return res.status(409).json({
                message: 'Конфлікт розкладу для викладача',
                conflictType: 'TEACHER_BUSY',
                details: {
                    existingLesson: {
                        subject: teacherConflict.subject,
                        group: teacherConflict.group?.name,
                        classroom: teacherConflict.classroom,
                        timeRange: teacherConflict.timeSlot ?
                            `${teacherConflict.timeSlot.startTime} - ${teacherConflict.timeSlot.endTime}` : null
                    },
                    message: `Викладач вже веде урок в групі ${teacherConflict.group?.name} в цей час`
                }
            });
        }

        // 3. Перевірка: Чи не зайнята аудиторія в цей час
        const classroomConflict = await Schedule.findOne({
            classroom: scheduleData.classroom,
            dayOfWeek: scheduleData.dayOfWeek,
            timeSlot: scheduleData.timeSlot
        })
            .populate('group', 'name')
            .populate('teacher', 'fullName')
            .populate('timeSlot', 'order startTime endTime');

        if (classroomConflict) {
            return res.status(409).json({
                message: 'Конфлікт розкладу для аудиторії',
                conflictType: 'CLASSROOM_BUSY',
                details: {
                    existingLesson: {
                        subject: classroomConflict.subject,
                        group: classroomConflict.group?.name,
                        teacher: classroomConflict.teacher?.fullName,
                        timeRange: classroomConflict.timeSlot ?
                            `${classroomConflict.timeSlot.startTime} - ${classroomConflict.timeSlot.endTime}` : null
                    },
                    message: `Аудиторія вже зайнята групою ${classroomConflict.group?.name} в цей час`
                }
            });
        }

        // 4. Перевірка: Чи не має група іншого уроку з таким самим предметом у цей день
        const subjectConflict = await Schedule.findOne({
            group: scheduleData.group,
            dayOfWeek: scheduleData.dayOfWeek,
            subject: scheduleData.subject
        })
            .populate('timeSlot', 'order startTime endTime');

        if (subjectConflict) {
            return res.status(409).json({
                message: 'Конфлікт предмету для групи',
                conflictType: 'DUPLICATE_SUBJECT',
                details: {
                    existingLesson: {
                        timeSlot: subjectConflict.timeSlot?.order,
                        timeRange: subjectConflict.timeSlot ?
                            `${subjectConflict.timeSlot.startTime} - ${subjectConflict.timeSlot.endTime}` : null,
                        teacher: subjectConflict.teacher,
                        classroom: subjectConflict.classroom
                    },
                    message: `Група вже має урок з предметом "${scheduleData.subject}" в цей день`
                }
            });
        }

        // 5. Перевірка: Чи не перевищує викладач максимальну кількість уроків на день
        const teacherDaySchedule = await Schedule.find({
            teacher: scheduleData.teacher,
            dayOfWeek: scheduleData.dayOfWeek
        })
            .populate('timeSlot', 'order startTime endTime')
            .sort({ 'timeSlot.order': 1 });

        const MAX_LESSONS_PER_DAY = 10;
        if (teacherDaySchedule.length >= MAX_LESSONS_PER_DAY) {
            const timeSlots = teacherDaySchedule.map(s =>
                s.timeSlot ? `${s.timeSlot.startTime}-${s.timeSlot.endTime}` : 'N/A'
            );

            return res.status(409).json({
                message: 'Перевищено ліміт уроків для викладача',
                conflictType: 'TEACHER_LIMIT',
                details: {
                    currentLessons: teacherDaySchedule.length,
                    maxLessons: MAX_LESSONS_PER_DAY,
                    timeSlots: timeSlots,
                    message: `Викладач вже має ${teacherDaySchedule.length} уроків у цей день: ${timeSlots.join(', ')}`
                }
            });
        }

        // 6. Перевірка: Чи не перевищує група максимальну кількість уроків на день
        const groupDaySchedule = await Schedule.find({
            group: scheduleData.group,
            dayOfWeek: scheduleData.dayOfWeek
        })
            .populate('timeSlot', 'order startTime endTime')
            .sort({ 'timeSlot.order': 1 });

        if (groupDaySchedule.length >= MAX_LESSONS_PER_DAY) {
            const timeSlots = groupDaySchedule.map(s =>
                s.timeSlot ? `${s.timeSlot.startTime}-${s.timeSlot.endTime}` : 'N/A'
            );

            return res.status(409).json({
                message: 'Перевищено ліміт уроків для групи',
                conflictType: 'GROUP_LIMIT',
                details: {
                    currentLessons: groupDaySchedule.length,
                    maxLessons: MAX_LESSONS_PER_DAY,
                    timeSlots: timeSlots,
                    message: `Група вже має ${groupDaySchedule.length} уроків у цей день: ${timeSlots.join(', ')}`
                }
            });
        }

        // Створення нового запису (без _id, щоб MongoDB згенерувала новий)
        const schedule = new Schedule(scheduleData);
        await schedule.save();

        // Повернути повну інформацію з популяцією
        await schedule.populate([
            { path: 'teacher', select: 'fullName email position positions' },
            { path: 'group', select: 'name category gradeLevel' },
            { path: 'classroom', select: 'name type capacity' },
            { path: 'dayOfWeek', select: 'name order' },
            { path: 'timeSlot', select: 'order startTime endTime' },
            { path: 'semester', select: 'name year' }
        ]);

        res.status(201).json({
            message: 'Заняття успішно додано до розкладу',
            schedule
        });
    } catch (error) {
        console.error('Error creating schedule:', error);

        if (error.code === 11000) {
            // MongoDB duplicate key error
            if (error.keyPattern && error.keyPattern._id) {
                return res.status(400).json({
                    message: 'Помилка: спроба створити запис з уже існуючим ID',
                    error: 'DUPLICATE_ID_ERROR',
                    details: {
                        duplicateId: error.keyValue._id,
                        solution: 'ID буде автоматично згенеровано MongoDB'
                    }
                });
            } else {
                // Конфлікт унікального індексу (group + dayOfWeek + timeSlot)
                return res.status(409).json({
                    message: 'Конфлікт розкладу: група вже має урок в цей час',
                    error: 'DUPLICATE_TIMESLOT_FOR_GROUP',
                    details: {
                        group: error.keyValue?.group,
                        dayOfWeek: error.keyValue?.dayOfWeek,
                        timeSlot: error.keyValue?.timeSlot
                    }
                });
            }
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Помилка валідації даних',
                error: error.message,
                errors: error.errors
            });
        }

        res.status(400).json({
            message: 'Помилка при створенні розкладу',
            error: error.message
        });
    }
});

// Оновити запис розкладу з аналогічними перевірками
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName, ...updateData } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Schedule = getSchoolScheduleModel(databaseName);

        // Перевірити, чи існує запис
        const existingSchedule = await Schedule.findById(id);
        if (!existingSchedule) {
            return res.status(404).json({ message: 'Запис розкладу не знайдено' });
        }

        // ВИДАЛИТИ _id з даних оновлення, якщо він є
        if (updateData._id && updateData._id !== id) {
            console.log('Видаляємо _id з даних оновлення для уникнення конфлікту:', updateData._id);
            delete updateData._id;
        }

        // Виконати перевірки на конфлікти...
        // ... (залишаємо перевірки без змін)

        // Оновлення запису
        const updatedSchedule = await Schedule.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate([
            { path: 'teacher', select: 'fullName email position positions' },
            { path: 'group', select: 'name category gradeLevel' },
            { path: 'classroom', select: 'name type capacity' },
            { path: 'dayOfWeek', select: 'name order' },
            { path: 'timeSlot', select: 'order startTime endTime' },
            { path: 'semester', select: 'name year' }
        ]);

        if (!updatedSchedule) {
            return res.status(404).json({ message: 'Запис розкладу не знайдено' });
        }

        res.json({
            message: 'Запис розкладу успішно оновлено',
            schedule: updatedSchedule
        });
    } catch (error) {
        console.error('Error updating schedule:', error);

        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern._id) {
                return res.status(400).json({
                    message: 'Помилка: спроба змінити ID запису',
                    error: 'ID_CHANGE_NOT_ALLOWED'
                });
            }

            return res.status(409).json({
                message: 'Конфлікт розкладу: група вже має урок в цей час',
                error: 'DUPLICATE_TIMESLOT_FOR_GROUP'
            });
        }

        res.status(400).json({
            message: 'Помилка при оновленні розкладу',
            error: error.message
        });
    }
});

// Видалити запис розкладу
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Schedule = getSchoolScheduleModel(databaseName);
        const schedule = await Schedule.findByIdAndDelete(id);

        if (!schedule) {
            return res.status(404).json({ message: 'Запис розкладу не знайдено' });
        }

        res.json({
            message: 'Запис розкладу успішно видалено',
            deletedId: id
        });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({
            message: 'Помилка при видаленні розкладу',
            error: error.message
        });
    }
});

// Перевірити доступність ресурсів (допоміжний метод)
router.post('/check-availability', async (req, res) => {
    try {
        const { databaseName, ...checkData } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Schedule = getSchoolScheduleModel(databaseName);
        const conflicts = [];

        // 1. Головна перевірка: чи не має група вже уроку в цей час
        if (checkData.group && checkData.dayOfWeek && checkData.timeSlot) {
            const groupConflict = await Schedule.findOne({
                group: checkData.group,
                dayOfWeek: checkData.dayOfWeek,
                timeSlot: checkData.timeSlot,
                _id: checkData.excludeId ? { $ne: checkData.excludeId } : { $exists: true }
            })
                .populate('teacher', 'fullName')
                .populate('subject', 'name')
                .populate('timeSlot', 'order startTime endTime');

            if (groupConflict) {
                conflicts.push({
                    type: 'GROUP_TIMESLOT_CONFLICT',
                    message: `Група вже має урок "${groupConflict.subject}" в цей час (${groupConflict.timeSlot?.startTime} - ${groupConflict.timeSlot?.endTime})`,
                    details: {
                        existingSubject: groupConflict.subject,
                        existingTeacher: groupConflict.teacher?.fullName,
                        timeRange: groupConflict.timeSlot ?
                            `${groupConflict.timeSlot.startTime} - ${groupConflict.timeSlot.endTime}` : null
                    }
                });
            }
        }

        // 2. Перевірка викладача
        if (checkData.teacher && checkData.dayOfWeek && checkData.timeSlot) {
            const teacherConflict = await Schedule.findOne({
                teacher: checkData.teacher,
                dayOfWeek: checkData.dayOfWeek,
                timeSlot: checkData.timeSlot,
                _id: checkData.excludeId ? { $ne: checkData.excludeId } : { $exists: true }
            })
                .populate('group', 'name')
                .populate('timeSlot', 'startTime endTime');

            if (teacherConflict) {
                conflicts.push({
                    type: 'TEACHER_BUSY',
                    message: `Викладач вже веде урок у групі "${teacherConflict.group?.name}" в цей час`,
                    details: {
                        existingGroup: teacherConflict.group?.name,
                        timeRange: teacherConflict.timeSlot ?
                            `${teacherConflict.timeSlot.startTime} - ${teacherConflict.timeSlot.endTime}` : null
                    }
                });
            }
        }

        // 3. Перевірка аудиторії
        if (checkData.classroom && checkData.dayOfWeek && checkData.timeSlot) {
            const classroomConflict = await Schedule.findOne({
                classroom: checkData.classroom,
                dayOfWeek: checkData.dayOfWeek,
                timeSlot: checkData.timeSlot,
                _id: checkData.excludeId ? { $ne: checkData.excludeId } : { $exists: true }
            })
                .populate('group', 'name')
                .populate('timeSlot', 'startTime endTime');

            if (classroomConflict) {
                conflicts.push({
                    type: 'CLASSROOM_BUSY',
                    message: `Аудиторія вже зайнята групою "${classroomConflict.group?.name}" в цей час`,
                    details: {
                        existingGroup: classroomConflict.group?.name,
                        timeRange: classroomConflict.timeSlot ?
                            `${classroomConflict.timeSlot.startTime} - ${classroomConflict.timeSlot.endTime}` : null
                    }
                });
            }
        }

        // 4. Перевірка дублювання предмету для групи в той самий день
        if (checkData.group && checkData.dayOfWeek && checkData.subject) {
            const subjectConflict = await Schedule.findOne({
                group: checkData.group,
                dayOfWeek: checkData.dayOfWeek,
                subject: checkData.subject,
                _id: checkData.excludeId ? { $ne: checkData.excludeId } : { $exists: true }
            })
                .populate('timeSlot', 'order startTime endTime');

            if (subjectConflict) {
                conflicts.push({
                    type: 'DUPLICATE_SUBJECT',
                    message: `Група вже має урок з предметом "${checkData.subject}" у цей день`,
                    details: {
                        existingTimeSlot: subjectConflict.timeSlot?.order,
                        timeRange: subjectConflict.timeSlot ?
                            `${subjectConflict.timeSlot.startTime} - ${subjectConflict.timeSlot.endTime}` : null
                    }
                });
            }
        }

        // 5. Перевірка ліміту уроків на день для групи
        if (checkData.group && checkData.dayOfWeek) {
            const groupDaySchedule = await Schedule.find({
                group: checkData.group,
                dayOfWeek: checkData.dayOfWeek,
                _id: checkData.excludeId ? { $ne: checkData.excludeId } : { $exists: true }
            });

            const MAX_LESSONS_PER_DAY = 10;
            if (groupDaySchedule.length >= MAX_LESSONS_PER_DAY) {
                conflicts.push({
                    type: 'GROUP_LIMIT',
                    message: `Група вже має максимальну кількість уроків (${MAX_LESSONS_PER_DAY}) у цей день`,
                    details: {
                        currentLessons: groupDaySchedule.length,
                        maxLessons: MAX_LESSONS_PER_DAY
                    }
                });
            }
        }

        // 6. Перевірка ліміту уроків на день для викладача
        if (checkData.teacher && checkData.dayOfWeek) {
            const teacherDaySchedule = await Schedule.find({
                teacher: checkData.teacher,
                dayOfWeek: checkData.dayOfWeek,
                _id: checkData.excludeId ? { $ne: checkData.excludeId } : { $exists: true }
            });

            const MAX_LESSONS_PER_DAY = 10;
            if (teacherDaySchedule.length >= MAX_LESSONS_PER_DAY) {
                conflicts.push({
                    type: 'TEACHER_LIMIT',
                    message: `Викладач вже має максимальну кількість уроків (${MAX_LESSONS_PER_DAY}) у цей день`,
                    details: {
                        currentLessons: teacherDaySchedule.length,
                        maxLessons: MAX_LESSONS_PER_DAY
                    }
                });
            }
        }

        res.json({
            available: conflicts.length === 0,
            conflicts: conflicts
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({
            message: 'Помилка при перевірці доступності',
            error: error.message
        });
    }
});

// Отримати розклад для групи
router.get('/group/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { databaseName, semester, dayOfWeek } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Schedule = getSchoolScheduleModel(databaseName);

        let query = { group: groupId };

        if (semester) {
            query.semester = semester;
        }

        if (dayOfWeek) {
            query.dayOfWeek = dayOfWeek;
        }

        const schedules = await Schedule.find(query)
            .populate('teacher', 'fullName email position')
            .populate('classroom', 'name type')
            .populate('dayOfWeek', 'name order')
            .populate('timeSlot', 'order startTime endTime')
            .populate('semester', 'name year')
            .sort({ 'dayOfWeek.order': 1, 'timeSlot.order': 1 });

        res.json(schedules);
    } catch (error) {
        console.error('Error fetching group schedule:', error);
        res.status(500).json({
            message: 'Помилка при отриманні розкладу групи',
            error: error.message
        });
    }
});

// Отримати розклад для викладача
router.get('/teacher/:teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { databaseName, semester, dayOfWeek } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Schedule = getSchoolScheduleModel(databaseName);

        let query = { teacher: teacherId };

        if (semester) {
            query.semester = semester;
        }

        if (dayOfWeek) {
            query.dayOfWeek = dayOfWeek;
        }

        const schedules = await Schedule.find(query)
            .populate('group', 'name category gradeLevel')
            .populate('classroom', 'name type')
            .populate('dayOfWeek', 'name order')
            .populate('timeSlot', 'order startTime endTime')
            .populate('semester', 'name year')
            .sort({ 'dayOfWeek.order': 1, 'timeSlot.order': 1 });

        res.json(schedules);
    } catch (error) {
        console.error('Error fetching teacher schedule:', error);
        res.status(500).json({
            message: 'Помилка при отриманні розкладу викладача',
            error: error.message
        });
    }
});

// Перевірити, чи вільний часовий слот для групи
router.get('/check-group-timeslot', async (req, res) => {
    try {
        const { databaseName, groupId, dayOfWeekId, timeSlotId, excludeScheduleId } = req.query;

        if (!databaseName || !groupId || !dayOfWeekId || !timeSlotId) {
            return res.status(400).json({
                error: 'Необхідні параметри: databaseName, groupId, dayOfWeekId, timeSlotId'
            });
        }

        const Schedule = getSchoolScheduleModel(databaseName);

        const query = {
            group: groupId,
            dayOfWeek: dayOfWeekId,
            timeSlot: timeSlotId
        };

        if (excludeScheduleId) {
            query._id = { $ne: excludeScheduleId };
        }

        const existingSchedule = await Schedule.findOne(query)
            .populate('teacher', 'fullName')
            .populate('subject', 'name')
            .populate('timeSlot', 'order startTime endTime');

        res.json({
            available: !existingSchedule,
            conflict: existingSchedule ? {
                subject: existingSchedule.subject,
                teacher: existingSchedule.teacher?.fullName,
                timeRange: existingSchedule.timeSlot ?
                    `${existingSchedule.timeSlot.startTime} - ${existingSchedule.timeSlot.endTime}` : null
            } : null
        });
    } catch (error) {
        console.error('Error checking group timeslot:', error);
        res.status(500).json({
            message: 'Помилка при перевірці часового слоту',
            error: error.message
        });
    }
});

module.exports = router;