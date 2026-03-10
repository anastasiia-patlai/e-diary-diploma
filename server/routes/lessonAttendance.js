const express = require('express');
const router = express.Router();
const { getSchoolDBConnection } = require('../config/databaseManager');

// Отримати відвідуваність для уроку за датою
router.get('/schedule/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { databaseName, date } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const connection = getSchoolDBConnection(databaseName);
        const LessonAttendance = require('../models/LessonAttendance')(connection);

        let query = { schedule: scheduleId };

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            query.date = { $gte: startDate, $lte: endDate };
        }

        const attendance = await LessonAttendance.findOne(query)
            .populate('records.student', 'fullName')
            .populate('createdBy', 'fullName')
            .populate('updatedBy', 'fullName');

        res.json(attendance || { records: [] });
    } catch (error) {
        console.error('Error fetching lesson attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

// Створити/оновити відвідуваність для уроку
router.post('/', async (req, res) => {
    try {
        const { databaseName, scheduleId, date, records } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const connection = getSchoolDBConnection(databaseName);
        const LessonAttendance = require('../models/LessonAttendance')(connection);

        const userInfo = JSON.parse(req.headers['user-info'] || '{}');
        const userId = userInfo.userId;

        // Шукаємо існуючий запис
        let attendance = await LessonAttendance.findOne({
            schedule: scheduleId,
            date: new Date(date)
        });

        if (attendance) {
            // Оновлюємо існуючий запис
            attendance.records = records;
            attendance.updatedBy = userId;
            await attendance.save();
        } else {
            // Створюємо новий запис
            attendance = new LessonAttendance({
                schedule: scheduleId,
                date: new Date(date),
                records,
                createdBy: userId,
                updatedBy: userId
            });
            await attendance.save();
        }

        await attendance.populate('records.student', 'fullName');

        res.status(201).json(attendance);
    } catch (error) {
        console.error('Error saving lesson attendance:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                error: 'Запис для цього уроку на цю дату вже існує'
            });
        }

        res.status(500).json({ error: error.message });
    }
});

// Отримати історію відвідуваності для вчителя
router.get('/teacher/:teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { databaseName, startDate, endDate, limit = 50 } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const connection = getSchoolDBConnection(databaseName);
        const LessonAttendance = require('../models/LessonAttendance')(connection);
        const Schedule = connection.models.Schedule;

        // Знаходимо всі розклади вчителя
        const schedules = await Schedule.find({ teacher: teacherId }).select('_id');
        const scheduleIds = schedules.map(s => s._id);

        let query = { schedule: { $in: scheduleIds } };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const history = await LessonAttendance.find(query)
            .populate({
                path: 'schedule',
                populate: [
                    { path: 'group', select: 'name' },
                    { path: 'subject' }
                ]
            })
            .populate('records.student', 'fullName')
            .sort({ date: -1 })
            .limit(parseInt(limit));

        res.json(history);
    } catch (error) {
        console.error('Error fetching attendance history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Видалити запис відвідуваності для уроку
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const connection = getSchoolDBConnection(databaseName);
        const LessonAttendance = require('../models/LessonAttendance')(connection);

        const attendance = await LessonAttendance.findByIdAndDelete(id);

        if (!attendance) {
            return res.status(404).json({ error: 'Запис не знайдено' });
        }

        res.json({ message: 'Запис успішно видалено' });
    } catch (error) {
        console.error('Error deleting lesson attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;