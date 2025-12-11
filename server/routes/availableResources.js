const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { getSchoolScheduleModel, getSchoolClassroomModel, getSchoolUserModel } = require('../config/databaseManager');

router.use((req, res, next) => {
    console.log('Available Resources:', req.method, req.path, req.query);
    next();
});

router.get('/test', (req, res) => {
    console.log('/api/available/test called successfully!');
    res.json({
        message: 'Available resources API працює!',
        timestamp: new Date().toISOString(),
        data: ['test1', 'test2', 'test3']
    });
});

router.get('/classrooms', async (req, res) => {
    try {
        const { dayOfWeekId, timeSlotId, excludeScheduleId, databaseName } = req.query;

        console.log('Запит на вільні аудиторії:', { dayOfWeekId, timeSlotId, excludeScheduleId, databaseName });

        if (!dayOfWeekId || !timeSlotId) {
            return res.status(400).json({
                message: 'Потрібні dayOfWeekId та timeSlotId'
            });
        }

        if (!databaseName) {
            return res.status(400).json({
                message: 'Потрібен databaseName'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(dayOfWeekId) || !mongoose.Types.ObjectId.isValid(timeSlotId)) {
            return res.status(400).json({
                message: 'Невірний формат ID',
                dayOfWeekIdValid: mongoose.Types.ObjectId.isValid(dayOfWeekId),
                timeSlotIdValid: mongoose.Types.ObjectId.isValid(timeSlotId)
            });
        }

        // Отримуємо моделі для конкретної бази даних
        const Schedule = getSchoolScheduleModel(databaseName);
        const Classroom = getSchoolClassroomModel(databaseName);

        const occupiedQuery = {
            dayOfWeek: new mongoose.Types.ObjectId(dayOfWeekId),
            timeSlot: new mongoose.Types.ObjectId(timeSlotId)
        };

        if (excludeScheduleId && mongoose.Types.ObjectId.isValid(excludeScheduleId)) {
            occupiedQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
        }

        const occupiedSchedules = await Schedule.find(occupiedQuery)
            .select('classroom')
            .populate('classroom');

        const occupiedClassroomIds = occupiedSchedules
            .map(schedule => schedule.classroom?._id)
            .filter(id => id);

        console.log('Зайняті аудиторії:', occupiedClassroomIds.length);

        const availableClassrooms = await Classroom.find({
            isActive: true,
            isAvailable: true,
            _id: { $nin: occupiedClassroomIds }
        }).sort({ name: 1 });

        console.log('Вільні аудиторії знайдено:', availableClassrooms.length);

        res.json(availableClassrooms);

    } catch (error) {
        console.error('Помилка отримання аудиторій:', error);
        res.status(500).json({
            message: 'Помилка при отриманні вільних аудиторій',
            error: error.message
        });
    }
});

router.get('/teachers', async (req, res) => {
    try {
        const { dayOfWeekId, timeSlotId, subject, excludeScheduleId, databaseName } = req.query;

        console.log('Запит на вільних викладачів:', { dayOfWeekId, timeSlotId, subject, excludeScheduleId, databaseName });

        if (!dayOfWeekId || !timeSlotId || !subject) {
            return res.status(400).json({
                message: 'Потрібні dayOfWeekId, timeSlotId та subject'
            });
        }

        if (!databaseName) {
            return res.status(400).json({
                message: 'Потрібен databaseName'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(dayOfWeekId) || !mongoose.Types.ObjectId.isValid(timeSlotId)) {
            return res.status(400).json({
                message: 'Невірний формат ID'
            });
        }

        // Отримуємо моделі для конкретної бази даних
        const Schedule = getSchoolScheduleModel(databaseName);
        const User = getSchoolUserModel(databaseName);

        const occupiedQuery = {
            dayOfWeek: new mongoose.Types.ObjectId(dayOfWeekId),
            timeSlot: new mongoose.Types.ObjectId(timeSlotId)
        };

        if (excludeScheduleId && mongoose.Types.ObjectId.isValid(excludeScheduleId)) {
            occupiedQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
        }

        const occupiedSchedules = await Schedule.find(occupiedQuery)
            .select('teacher')
            .populate('teacher');

        const occupiedTeacherIds = occupiedSchedules
            .map(schedule => schedule.teacher?._id)
            .filter(id => id);

        console.log('Зайняті викладачі:', occupiedTeacherIds.length);

        const teachersForSubject = await User.find({
            role: 'teacher',
            isAvailable: true,
            $or: [
                { positions: subject },
                { position: { $regex: subject, $options: 'i' } },
                { positions: { $in: [subject] } }
            ]
        }).select('fullName email phone positions position');

        console.log('Викладачі для предмету знайдено:', teachersForSubject.length);

        const availableTeachers = teachersForSubject.filter(teacher =>
            !occupiedTeacherIds.some(id => id.toString() === teacher._id.toString())
        );

        console.log('Вільні викладачі знайдено:', availableTeachers.length);

        res.json(availableTeachers);

    } catch (error) {
        console.error('Помилка отримання викладачів:', error);
        res.status(500).json({
            message: 'Помилка при отриманні вільних викладачів',
            error: error.message
        });
    }
});

router.get('/check-availability', async (req, res) => {
    try {
        const { dayOfWeekId, timeSlotId, classroomId, teacherId, excludeScheduleId, databaseName } = req.query;

        console.log('Перевірка доступності:', { dayOfWeekId, timeSlotId, classroomId, teacherId, excludeScheduleId, databaseName });

        if (!databaseName) {
            return res.status(400).json({
                message: 'Потрібен databaseName'
            });
        }

        const conflicts = {};

        // Отримуємо модель Schedule для конкретної бази даних
        const Schedule = getSchoolScheduleModel(databaseName);

        if (classroomId && mongoose.Types.ObjectId.isValid(classroomId)) {
            const classroomConflict = await Schedule.findOne({
                dayOfWeek: new mongoose.Types.ObjectId(dayOfWeekId),
                timeSlot: new mongoose.Types.ObjectId(timeSlotId),
                classroom: new mongoose.Types.ObjectId(classroomId),
                _id: excludeScheduleId && mongoose.Types.ObjectId.isValid(excludeScheduleId) ?
                    { $ne: new mongoose.Types.ObjectId(excludeScheduleId) } : { $exists: true }
            }).populate('group', 'name').populate('teacher', 'fullName');

            if (classroomConflict) {
                conflicts.classroom = {
                    message: 'Аудиторія вже зайнята',
                    conflict: {
                        group: classroomConflict.group?.name,
                        teacher: classroomConflict.teacher?.fullName,
                        subject: classroomConflict.subject
                    }
                };
            }
        }

        if (teacherId && mongoose.Types.ObjectId.isValid(teacherId)) {
            const teacherConflict = await Schedule.findOne({
                dayOfWeek: new mongoose.Types.ObjectId(dayOfWeekId),
                timeSlot: new mongoose.Types.ObjectId(timeSlotId),
                teacher: new mongoose.Types.ObjectId(teacherId),
                _id: excludeScheduleId && mongoose.Types.ObjectId.isValid(excludeScheduleId) ?
                    { $ne: new mongoose.Types.ObjectId(excludeScheduleId) } : { $exists: true }
            }).populate('group', 'name').populate('classroom', 'name');

            if (teacherConflict) {
                conflicts.teacher = {
                    message: 'Викладач вже зайнятий',
                    conflict: {
                        group: teacherConflict.group?.name,
                        classroom: teacherConflict.classroom?.name,
                        subject: teacherConflict.subject
                    }
                };
            }
        }

        console.log('Результат перевірки:', { available: Object.keys(conflicts).length === 0, conflicts });

        res.json({
            available: Object.keys(conflicts).length === 0,
            conflicts
        });

    } catch (error) {
        console.error('Помилка перевірки доступності:', error);
        res.status(500).json({
            message: 'Помилка при перевірці доступності',
            error: error.message
        });
    }
});

module.exports = router;