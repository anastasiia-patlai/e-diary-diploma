const express = require('express');
const mongoose = require('mongoose');
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
            .populate('group', 'name category gradeLevel hasSubgroups subgroups')
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

// Створити новий запис розкладу з перевірками на конфлікти для підгруп
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

        // ВИДАЛИТИ _id з даних, якщо він є
        if (scheduleData._id) {
            console.log('Видаляємо _id з даних для уникнення duplicate key error:', scheduleData._id);
            delete scheduleData._id;
        }

        // Отримати інформацію про групу
        const groupInfo = await Group.findById(scheduleData.group);
        const subgroup = scheduleData.subgroup || 'all';
        const isFullGroup = subgroup === 'all';

        console.log('Створення розкладу:', {
            group: scheduleData.group,
            subgroup: subgroup,
            day: scheduleData.dayOfWeek,
            timeSlot: scheduleData.timeSlot,
            semester: scheduleData.semester, // Додано логування семестру
            isFullGroup: isFullGroup,
            subject: scheduleData.subject
        });

        // 1. ПЕРЕВІРКА КОНФЛІКТІВ З УРАХУВАННЯМ ПІДГРУП І СЕМЕСТРУ
        // Якщо це заняття для всієї групи
        if (isFullGroup) {
            console.log('Перевірка конфліктів для всієї групи...');

            // Перевірити, чи є будь-яке заняття в цей час для цієї групи В ТОМУ Ж СЕМЕСТРІ
            const anyGroupConflict = await Schedule.findOne({
                group: scheduleData.group,
                dayOfWeek: scheduleData.dayOfWeek,
                timeSlot: scheduleData.timeSlot,
                semester: scheduleData.semester // Додано фільтр за семестром
                // Шукаємо будь-яке заняття (і для всієї групи, і для підгруп)
            })
                .populate('teacher', 'fullName')
                .populate('timeSlot', 'order startTime endTime');

            console.log('Знайдено конфлікт для всієї групи:', anyGroupConflict);

            if (anyGroupConflict) {
                const conflictType = anyGroupConflict.subgroup === 'all' ? 'FULL_GROUP_CONFLICT' : 'SUBGROUP_CONFLICT';
                const conflictMessage = anyGroupConflict.subgroup === 'all'
                    ? 'Вся група вже має урок в цей час'
                    : `Підгрупа ${anyGroupConflict.subgroup} вже має урок в цей час`;

                return res.status(409).json({
                    message: 'Конфлікт розкладу',
                    conflictType: conflictType,
                    details: {
                        existingLesson: {
                            subject: anyGroupConflict.subject,
                            teacher: anyGroupConflict.teacher?.fullName,
                            subgroup: anyGroupConflict.subgroup,
                            timeRange: anyGroupConflict.timeSlot ?
                                `${anyGroupConflict.timeSlot.startTime} - ${anyGroupConflict.timeSlot.endTime}` : null
                        },
                        message: conflictMessage
                    }
                });
            }
        }
        // Якщо це заняття для підгрупи
        else {
            console.log(`Перевірка конфліктів для підгрупи ${subgroup}...`);

            // 1. Перевірити конфлікт з тією ж підгрупою В ТОМУ Ж СЕМЕСТРІ
            const sameSubgroupConflict = await Schedule.findOne({
                group: scheduleData.group,
                subgroup: subgroup, // Саме ця підгрупа
                dayOfWeek: scheduleData.dayOfWeek,
                timeSlot: scheduleData.timeSlot,
                semester: scheduleData.semester // Додано фільтр за семестром
            })
                .populate('teacher', 'fullName')
                .populate('timeSlot', 'order startTime endTime');

            console.log('Знайдено конфлікт з тією ж підгрупою:', sameSubgroupConflict);

            if (sameSubgroupConflict) {
                return res.status(409).json({
                    message: 'Конфлікт розкладу для підгрупи',
                    conflictType: 'SUBGROUP_CONFLICT',
                    details: {
                        existingLesson: {
                            subject: sameSubgroupConflict.subject,
                            teacher: sameSubgroupConflict.teacher?.fullName,
                            subgroup: sameSubgroupConflict.subgroup,
                            timeRange: sameSubgroupConflict.timeSlot ?
                                `${sameSubgroupConflict.timeSlot.startTime} - ${sameSubgroupConflict.timeSlot.endTime}` : null
                        },
                        message: `Підгрупа ${subgroup} вже має урок в цей час`
                    }
                });
            }

            // 2. Перевірити конфлікт з заняттям для всієї групи В ТОМУ Ж СЕМЕСТРІ
            const fullGroupConflict = await Schedule.findOne({
                group: scheduleData.group,
                subgroup: 'all', // Тільки заняття для всієї групи
                dayOfWeek: scheduleData.dayOfWeek,
                timeSlot: scheduleData.timeSlot,
                semester: scheduleData.semester // Додано фільтр за семестром
            })
                .populate('teacher', 'fullName')
                .populate('timeSlot', 'order startTime endTime');

            console.log('Знайдено конфлікт з всією групою:', fullGroupConflict);

            if (fullGroupConflict) {
                return res.status(409).json({
                    message: 'Конфлікт розкладу',
                    conflictType: 'FULL_GROUP_CONFLICT',
                    details: {
                        existingLesson: {
                            subject: fullGroupConflict.subject,
                            teacher: fullGroupConflict.teacher?.fullName,
                            timeRange: fullGroupConflict.timeSlot ?
                                `${fullGroupConflict.timeSlot.startTime} - ${fullGroupConflict.timeSlot.endTime}` : null
                        },
                        message: `Вся група вже має урок в цей час`
                    }
                });
            }

            // 3. РІЗНІ ПІДГРУПИ МОЖУТЬ МАТИ УРОКИ ОДНОЧАСНО - це дозволено
            console.log('Різні підгрупи можуть мати уроки одночасно - це дозволено');
        }

        // 2. Перевірка: Чи не зайнятий викладач в цей час В ТОМУ Ж СЕМЕСТРІ
        const teacherConflict = await Schedule.findOne({
            teacher: scheduleData.teacher,
            dayOfWeek: scheduleData.dayOfWeek,
            timeSlot: scheduleData.timeSlot,
            semester: scheduleData.semester // Додано фільтр за семестром
        })
            .populate('group', 'name')
            .populate('timeSlot', 'order startTime endTime');

        if (teacherConflict) {
            const subgroupInfo = teacherConflict.subgroup === 'all'
                ? 'всю групу'
                : `підгрупу ${teacherConflict.subgroup}`;

            return res.status(409).json({
                conflictType: 'TEACHER_BUSY',
                details: {
                    existingLesson: {
                        subject: teacherConflict.subject,
                        group: teacherConflict.group?.name,
                        subgroup: teacherConflict.subgroup,
                        timeRange: teacherConflict.timeSlot ?
                            `${teacherConflict.timeSlot.startTime} - ${teacherConflict.timeSlot.endTime}` : null
                    },
                    message: `Викладач вже веде урок у ${subgroupInfo} "${teacherConflict.group?.name}" в цей час`
                }
            });
        }

        // 3. Перевірка: Чи не зайнята аудиторія в цей час В ТОМУ Ж СЕМЕСТРІ
        const classroomConflict = await Schedule.findOne({
            classroom: scheduleData.classroom,
            dayOfWeek: scheduleData.dayOfWeek,
            timeSlot: scheduleData.timeSlot,
            semester: scheduleData.semester // Додано фільтр за семестром
        })
            .populate('group', 'name')
            .populate('teacher', 'fullName')
            .populate('timeSlot', 'order startTime endTime');

        if (classroomConflict) {
            const subgroupInfo = classroomConflict.subgroup === 'all'
                ? 'всю групу'
                : `підгрупу ${classroomConflict.subgroup}`;

            return res.status(409).json({
                message: 'Конфлікт розкладу для аудиторії',
                conflictType: 'CLASSROOM_BUSY',
                details: {
                    existingLesson: {
                        subject: classroomConflict.subject,
                        group: classroomConflict.group?.name,
                        teacher: classroomConflict.teacher?.fullName,
                        subgroup: classroomConflict.subgroup,
                        timeRange: classroomConflict.timeSlot ?
                            `${classroomConflict.timeSlot.startTime} - ${classroomConflict.timeSlot.endTime}` : null
                    },
                    message: `Аудиторія вже зайнята ${subgroupInfo} "${classroomConflict.group?.name}" в цей час`
                }
            });
        }

        // 4. Перевірка: Чи не перевищує викладач максимальну кількість уроків на день В ТОМУ Ж СЕМЕСТРІ
        const teacherDaySchedule = await Schedule.find({
            teacher: scheduleData.teacher,
            dayOfWeek: scheduleData.dayOfWeek,
            semester: scheduleData.semester // Додано фільтр за семестром
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

        // 5. Перевірка: Чи не перевищує група максимальну кількість уроків на день В ТОМУ Ж СЕМЕСТРІ
        const groupDaySchedule = await Schedule.find({
            group: scheduleData.group,
            dayOfWeek: scheduleData.dayOfWeek,
            semester: scheduleData.semester // Додано фільтр за семестром
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

        // Додати isFullGroup до даних
        scheduleData.isFullGroup = isFullGroup;

        console.log('Створення нового запису розкладу:', scheduleData);

        // Створення нового запису
        const schedule = new Schedule(scheduleData);
        await schedule.save();

        // Повернути повну інформацію з популяцією
        await schedule.populate([
            { path: 'teacher', select: 'fullName email position positions' },
            { path: 'group', select: 'name category gradeLevel hasSubgroups subgroups' },
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
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            keyPattern: error.keyPattern,
            keyValue: error.keyValue
        });

        if (error.code === 11000) {
            // Duplicate key error - конфлікт унікального індексу
            if (error.keyPattern && error.keyPattern._id) {
                return res.status(400).json({
                    message: 'Помилка: спроба створити запис з уже існуючим ID',
                    error: 'DUPLICATE_ID_ERROR',
                    details: {
                        duplicateId: error.keyValue._id,
                        solution: 'ID буде автоматично згенеровано MongoDB'
                    }
                });
            }
            // Якщо спрацьовує унікальний індекс для підгруп
            else if (error.keyPattern && error.keyPattern.group && error.keyPattern.dayOfWeek && error.keyPattern.timeSlot && error.keyPattern.subgroup) {
                const subgroup = error.keyValue?.subgroup || 'all';

                return res.status(409).json({
                    message: 'Конфлікт розкладу',
                    error: 'DUPLICATE_SUBGROUP_TIMESLOT',
                    details: {
                        group: error.keyValue?.group,
                        subgroup: subgroup,
                        dayOfWeek: error.keyValue?.dayOfWeek,
                        timeSlot: error.keyValue?.timeSlot,
                        message: subgroup === 'all'
                            ? 'Вся група вже має урок в цей час'
                            : `Підгрупа ${subgroup} вже має урок в цей час`
                    }
                });
            }
            else {
                return res.status(409).json({
                    message: 'Конфлікт розкладу',
                    error: 'DUPLICATE_TIMESLOT',
                    details: {
                        message: 'Група або підгрупа вже має урок в цей час'
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

        res.status(500).json({
            message: 'Помилка при створенні розкладу',
            error: error.message
        });
    }
});

// Оновити запис розкладу з аналогічними перевірками для підгруп
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

        // Перевірки на конфлікти при оновленні з урахуванням підгруп І СЕМЕСТРУ
        const group = updateData.group || existingSchedule.group;
        const dayOfWeek = updateData.dayOfWeek || existingSchedule.dayOfWeek;
        const timeSlot = updateData.timeSlot || existingSchedule.timeSlot;
        const teacher = updateData.teacher || existingSchedule.teacher;
        const classroom = updateData.classroom || existingSchedule.classroom;
        const semester = updateData.semester || existingSchedule.semester; // Додано семестр
        const subgroup = updateData.subgroup || existingSchedule.subgroup || 'all';
        const isFullGroup = subgroup === 'all';

        // 1. Перевірка конфлікту для групи/підгрупи
        if (isFullGroup) {
            // Перевірити, чи є будь-яке інше заняття в цей час для цієї групи В ТОМУ Ж СЕМЕСТРІ
            const anyGroupConflict = await Schedule.findOne({
                group: group,
                dayOfWeek: dayOfWeek,
                timeSlot: timeSlot,
                semester: semester, // Додано фільтр за семестром
                _id: { $ne: id }
            });

            if (anyGroupConflict) {
                const conflictType = anyGroupConflict.subgroup === 'all' ? 'FULL_GROUP_CONFLICT' : 'SUBGROUP_CONFLICT';
                const conflictMessage = anyGroupConflict.subgroup === 'all'
                    ? 'Вся група вже має урок в цей час'
                    : `Підгрупа ${anyGroupConflict.subgroup} вже має урок в цей час`;

                return res.status(409).json({
                    message: 'Конфлікт розкладу',
                    conflictType: conflictType,
                    details: {
                        existingLesson: {
                            subject: anyGroupConflict.subject,
                            subgroup: anyGroupConflict.subgroup
                        },
                        message: conflictMessage
                    }
                });
            }
        } else {
            // Перевірити конфлікт з тією ж підгрупою В ТОМУ Ж СЕМЕСТРІ
            const sameSubgroupConflict = await Schedule.findOne({
                group: group,
                subgroup: subgroup,
                dayOfWeek: dayOfWeek,
                timeSlot: timeSlot,
                semester: semester, // Додано фільтр за семестром
                _id: { $ne: id }
            });

            if (sameSubgroupConflict) {
                return res.status(409).json({
                    message: 'Конфлікт розкладу для підгрупи',
                    conflictType: 'SUBGROUP_CONFLICT',
                    details: {
                        existingLesson: {
                            subject: sameSubgroupConflict.subject,
                            subgroup: sameSubgroupConflict.subgroup
                        },
                        message: `Підгрупа ${subgroup} вже має урок в цей час`
                    }
                });
            }

            // Перевірити конфлікт з заняттям для всієї групи В ТОМУ Ж СЕМЕСТРІ
            const fullGroupConflict = await Schedule.findOne({
                group: group,
                subgroup: 'all',
                dayOfWeek: dayOfWeek,
                timeSlot: timeSlot,
                semester: semester, // Додано фільтр за семестром
                _id: { $ne: id }
            });

            if (fullGroupConflict) {
                return res.status(409).json({
                    message: 'Конфлікт розкладу',
                    conflictType: 'FULL_GROUP_CONFLICT',
                    details: {
                        existingLesson: {
                            subject: fullGroupConflict.subject
                        },
                        message: `Вся група вже має урок в цей час`
                    }
                });
            }
        }

        // 2. Перевірка викладача В ТОМУ Ж СЕМЕСТРІ
        const teacherConflict = await Schedule.findOne({
            teacher: teacher,
            dayOfWeek: dayOfWeek,
            timeSlot: timeSlot,
            semester: semester, // Додано фільтр за семестром
            _id: { $ne: id }
        }).populate('group', 'name').populate('timeSlot', 'order startTime endTime');

        if (teacherConflict) {
            const subgroupInfo = teacherConflict.subgroup === 'all'
                ? 'всю групу'
                : `підгрупу ${teacherConflict.subgroup}`;

            return res.status(409).json({
                message: 'Конфлікт розкладу для викладача',
                conflictType: 'TEACHER_BUSY',
                details: {
                    existingLesson: {
                        subject: teacherConflict.subject,
                        group: teacherConflict.group?.name,
                        subgroup: teacherConflict.subgroup,
                        timeRange: teacherConflict.timeSlot ?
                            `${teacherConflict.timeSlot.startTime} - ${teacherConflict.timeSlot.endTime}` : null
                    },
                    message: `Викладач вже веде урок у ${subgroupInfo} "${teacherConflict.group?.name}" в цей час`
                }
            });
        }

        // 3. Перевірка аудиторії В ТОМУ Ж СЕМЕСТРІ
        const classroomConflict = await Schedule.findOne({
            classroom: classroom,
            dayOfWeek: dayOfWeek,
            timeSlot: timeSlot,
            semester: semester, // Додано фільтр за семестром
            _id: { $ne: id }
        }).populate('group', 'name').populate('teacher', 'fullName').populate('timeSlot', 'order startTime endTime');

        if (classroomConflict) {
            const subgroupInfo = classroomConflict.subgroup === 'all'
                ? 'всю групу'
                : `підгрупу ${classroomConflict.subgroup}`;

            return res.status(409).json({
                message: 'Конфлікт розкладу для аудиторії',
                conflictType: 'CLASSROOM_BUSY',
                details: {
                    existingLesson: {
                        subject: classroomConflict.subject,
                        group: classroomConflict.group?.name,
                        teacher: classroomConflict.teacher?.fullName,
                        subgroup: classroomConflict.subgroup,
                        timeRange: classroomConflict.timeSlot ?
                            `${classroomConflict.timeSlot.startTime} - ${classroomConflict.timeSlot.endTime}` : null
                    },
                    message: `Аудиторія вже зайнята ${subgroupInfo} "${classroomConflict.group?.name}" в цей час`
                }
            });
        }

        // 4. Перевірка ліміту уроків для викладача В ТОМУ Ж СЕМЕСТРІ
        const teacherDaySchedule = await Schedule.find({
            teacher: teacher,
            dayOfWeek: dayOfWeek,
            semester: semester, // Додано фільтр за семестром
            _id: { $ne: id }
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

        // 5. Перевірка ліміту уроків для групи В ТОМУ Ж СЕМЕСТРІ
        const groupDaySchedule = await Schedule.find({
            group: group,
            dayOfWeek: dayOfWeek,
            semester: semester, // Додано фільтр за семестром
            _id: { $ne: id }
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

        // Додати isFullGroup до даних оновлення
        updateData.isFullGroup = isFullGroup;

        // Оновлення запису
        const updatedSchedule = await Schedule.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate([
            { path: 'teacher', select: 'fullName email position positions' },
            { path: 'group', select: 'name category gradeLevel hasSubgroups subgroups' },
            { path: 'classroom', select: 'name type capacity building' },
            { path: 'dayOfWeek', select: 'name order nameShort' },
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
                message: 'Конфлікт розкладу: група/підгрупа вже має урок в цей час',
                error: 'DUPLICATE_TIMESLOT_FOR_GROUP'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Помилка валідації даних',
                error: error.message,
                errors: error.errors
            });
        }

        res.status(500).json({
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

// Перевірити доступність ресурсів з урахуванням підгруп І СЕМЕСТРУ
router.post('/check-availability', async (req, res) => {
    try {
        const { databaseName, ...checkData } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        // Перевіряємо, чи вказано семестр
        if (!checkData.semester) {
            return res.status(400).json({
                error: 'Не вказано семестр. Семестр обов\'язковий для перевірки доступності.'
            });
        }

        const Schedule = getSchoolScheduleModel(databaseName);
        const conflicts = [];

        const subgroup = checkData.subgroup || 'all';
        const isFullGroup = subgroup === 'all';

        // 1. Головна перевірка: конфлікти для групи/підгрупи
        if (checkData.group && checkData.dayOfWeek && checkData.timeSlot) {
            if (isFullGroup) {
                // Для всієї групи: перевірити будь-яке заняття в цей час В ТОМУ Ж СЕМЕСТРІ
                const query = {
                    group: checkData.group,
                    dayOfWeek: checkData.dayOfWeek,
                    timeSlot: checkData.timeSlot,
                    semester: checkData.semester // Додано фільтр за семестром
                };

                if (checkData.excludeId) {
                    query._id = { $ne: checkData.excludeId };
                }

                const anyGroupConflict = await Schedule.findOne(query)
                    .populate('teacher', 'fullName')
                    .populate('timeSlot', 'order startTime endTime');

                if (anyGroupConflict) {
                    const conflictType = anyGroupConflict.subgroup === 'all' ? 'FULL_GROUP_CONFLICT' : 'SUBGROUP_CONFLICT';
                    const conflictMessage = anyGroupConflict.subgroup === 'all'
                        ? 'Вся група вже має урок в цей час'
                        : `Підгрупа ${anyGroupConflict.subgroup} вже має урок в цей час`;

                    conflicts.push({
                        type: conflictType,
                        message: conflictMessage,
                        details: {
                            existingSubject: anyGroupConflict.subject,
                            existingTeacher: anyGroupConflict.teacher?.fullName,
                            subgroup: anyGroupConflict.subgroup,
                            timeRange: anyGroupConflict.timeSlot ?
                                `${anyGroupConflict.timeSlot.startTime} - ${anyGroupConflict.timeSlot.endTime}` : null
                        }
                    });
                }
            } else {
                // Для підгрупи

                // 1. Перевірити конфлікт з тією ж підгрупою В ТОМУ Ж СЕМЕСТРІ
                const sameSubgroupQuery = {
                    group: checkData.group,
                    subgroup: subgroup,
                    dayOfWeek: checkData.dayOfWeek,
                    timeSlot: checkData.timeSlot,
                    semester: checkData.semester // Додано фільтр за семестром
                };

                if (checkData.excludeId) {
                    sameSubgroupQuery._id = { $ne: checkData.excludeId };
                }

                const sameSubgroupConflict = await Schedule.findOne(sameSubgroupQuery)
                    .populate('teacher', 'fullName')
                    .populate('timeSlot', 'order startTime endTime');

                if (sameSubgroupConflict) {
                    conflicts.push({
                        type: 'SUBGROUP_CONFLICT',
                        message: `Підгрупа ${subgroup} вже має урок "${sameSubgroupConflict.subject}" в цей час`,
                        details: {
                            existingSubject: sameSubgroupConflict.subject,
                            existingTeacher: sameSubgroupConflict.teacher?.fullName,
                            timeRange: sameSubgroupConflict.timeSlot ?
                                `${sameSubgroupConflict.timeSlot.startTime} - ${sameSubgroupConflict.timeSlot.endTime}` : null
                        }
                    });
                }

                // 2. Перевірити конфлікт з заняттям для всієї групи В ТОМУ Ж СЕМЕСТРІ
                const fullGroupQuery = {
                    group: checkData.group,
                    subgroup: 'all',
                    dayOfWeek: checkData.dayOfWeek,
                    timeSlot: checkData.timeSlot,
                    semester: checkData.semester // Додано фільтр за семестром
                };

                if (checkData.excludeId) {
                    fullGroupQuery._id = { $ne: checkData.excludeId };
                }

                const fullGroupConflict = await Schedule.findOne(fullGroupQuery)
                    .populate('teacher', 'fullName')
                    .populate('timeSlot', 'order startTime endTime');

                if (fullGroupConflict) {
                    conflicts.push({
                        type: 'FULL_GROUP_CONFLICT',
                        message: `Вся група вже має урок "${fullGroupConflict.subject}" в цей час`,
                        details: {
                            existingSubject: fullGroupConflict.subject,
                            existingTeacher: fullGroupConflict.teacher?.fullName,
                            timeRange: fullGroupConflict.timeSlot ?
                                `${fullGroupConflict.timeSlot.startTime} - ${fullGroupConflict.timeSlot.endTime}` : null
                        }
                    });
                }
            }
        }

        // 2. Перевірка викладача В ТОМУ Ж СЕМЕСТРІ
        if (checkData.teacher && checkData.dayOfWeek && checkData.timeSlot) {
            const query = {
                teacher: checkData.teacher,
                dayOfWeek: checkData.dayOfWeek,
                timeSlot: checkData.timeSlot,
                semester: checkData.semester // Додано фільтр за семестром
            };

            if (checkData.excludeId) {
                query._id = { $ne: checkData.excludeId };
            }

            const teacherConflict = await Schedule.findOne(query)
                .populate('group', 'name')
                .populate('timeSlot', 'startTime endTime');

            if (teacherConflict) {
                const subgroupInfo = teacherConflict.subgroup === 'all'
                    ? 'всю групу'
                    : `підгрупу ${teacherConflict.subgroup}`;

                conflicts.push({
                    type: 'TEACHER_BUSY',
                    message: `Викладач вже веде урок у ${subgroupInfo} "${teacherConflict.group?.name}" в цей час`,
                    details: {
                        existingGroup: teacherConflict.group?.name,
                        subgroup: teacherConflict.subgroup,
                        timeRange: teacherConflict.timeSlot ?
                            `${teacherConflict.timeSlot.startTime} - ${teacherConflict.timeSlot.endTime}` : null
                    }
                });
            }
        }

        // 3. Перевірка аудиторії В ТОМУ Ж СЕМЕСТРІ
        if (checkData.classroom && checkData.dayOfWeek && checkData.timeSlot) {
            const query = {
                classroom: checkData.classroom,
                dayOfWeek: checkData.dayOfWeek,
                timeSlot: checkData.timeSlot,
                semester: checkData.semester // Додано фільтр за семестром
            };

            if (checkData.excludeId) {
                query._id = { $ne: checkData.excludeId };
            }

            const classroomConflict = await Schedule.findOne(query)
                .populate('group', 'name')
                .populate('timeSlot', 'startTime endTime');

            if (classroomConflict) {
                const subgroupInfo = classroomConflict.subgroup === 'all'
                    ? 'всю групу'
                    : `підгрупу ${classroomConflict.subgroup}`;

                conflicts.push({
                    type: 'CLASSROOM_BUSY',
                    message: `Аудиторія вже зайнята ${subgroupInfo} "${classroomConflict.group?.name}" в цей час`,
                    details: {
                        existingGroup: classroomConflict.group?.name,
                        subgroup: classroomConflict.subgroup,
                        timeRange: classroomConflict.timeSlot ?
                            `${classroomConflict.timeSlot.startTime} - ${classroomConflict.timeSlot.endTime}` : null
                    }
                });
            }
        }

        // 4. Перевірка ліміту уроків на день для групи В ТОМУ Ж СЕМЕСТРІ
        if (checkData.group && checkData.dayOfWeek) {
            const query = {
                group: checkData.group,
                dayOfWeek: checkData.dayOfWeek,
                semester: checkData.semester // Додано фільтр за семестром
            };

            if (checkData.excludeId) {
                query._id = { $ne: checkData.excludeId };
            }

            const groupDaySchedule = await Schedule.find(query);

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

        // 5. Перевірка ліміту уроків на день для викладача В ТОМУ Ж СЕМЕСТРІ
        if (checkData.teacher && checkData.dayOfWeek) {
            const query = {
                teacher: checkData.teacher,
                dayOfWeek: checkData.dayOfWeek,
                semester: checkData.semester // Додано фільтр за семестром
            };

            if (checkData.excludeId) {
                query._id = { $ne: checkData.excludeId };
            }

            const teacherDaySchedule = await Schedule.find(query);

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

// Перевірити, чи вільний часовий слот для групи/підгрупи
router.get('/check-group-timeslot', async (req, res) => {
    try {
        const { databaseName, groupId, subgroup, dayOfWeekId, timeSlotId, semesterId, excludeScheduleId } = req.query;

        if (!databaseName || !groupId || !dayOfWeekId || !timeSlotId || !semesterId) {
            return res.status(400).json({
                error: 'Необхідні параметри: databaseName, groupId, dayOfWeekId, timeSlotId, semesterId'
            });
        }

        const Schedule = getSchoolScheduleModel(databaseName);
        const subgroupValue = subgroup || 'all';

        let query;

        if (subgroupValue === 'all') {
            // Перевірити будь-яке заняття для групи В ТОМУ Ж СЕМЕСТРІ
            query = {
                group: groupId,
                dayOfWeek: dayOfWeekId,
                timeSlot: timeSlotId,
                semester: semesterId // Додано фільтр за семестром
            };
        } else {
            // Перевірити конкретну підгрупу та всю групу В ТОМУ Ж СЕМЕСТРІ
            query = {
                group: groupId,
                dayOfWeek: dayOfWeekId,
                timeSlot: timeSlotId,
                semester: semesterId, // Додано фільтр за семестром
                $or: [
                    { subgroup: subgroupValue },
                    { subgroup: 'all' }
                ]
            };
        }

        if (excludeScheduleId) {
            query._id = { $ne: excludeScheduleId };
        }

        const existingSchedules = await Schedule.find(query)
            .populate('teacher', 'fullName')
            .populate('timeSlot', 'order startTime endTime');

        const conflicts = existingSchedules.map(schedule => ({
            subject: schedule.subject,
            teacher: schedule.teacher?.fullName,
            subgroup: schedule.subgroup,
            timeRange: schedule.timeSlot ?
                `${schedule.timeSlot.startTime} - ${schedule.timeSlot.endTime}` : null
        }));

        res.json({
            available: conflicts.length === 0,
            conflicts: conflicts
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