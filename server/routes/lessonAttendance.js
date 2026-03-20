const express = require('express');
const router = express.Router();
const { getSchoolDBConnection } = require('../config/databaseManager');
// GET /api/attendance/lesson/schedule/:scheduleId?date=&databaseName=
router.get('/schedule/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { databaseName, date } = req.query;

        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const LessonAttendance = require('../models/LessonAttendance')(connection);

        let query = { schedule: scheduleId };
        if (date) {
            const startDate = new Date(date); startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date); endDate.setHours(23, 59, 59, 999);
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

router.post('/', async (req, res) => {
    try {
        const { databaseName, scheduleId, date, records } = req.body;

        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const LessonAttendance = require('../models/LessonAttendance')(connection);

        const userInfo = JSON.parse(req.headers['user-info'] || '{}');
        const userId = userInfo.userId;

        let attendance = await LessonAttendance.findOne({
            schedule: scheduleId,
            date: new Date(date)
        });

        if (attendance) {
            attendance.records = records;
            attendance.updatedBy = userId;
            await attendance.save();
        } else {
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
            return res.status(409).json({ error: 'Запис для цього уроку на цю дату вже існує' });
        }
        res.status(500).json({ error: error.message });
    }
});

router.delete('/student', async (req, res) => {
    try {
        const { databaseName, scheduleId, studentId, date } = req.body;

        if (!databaseName || !scheduleId || !studentId || !date) {
            return res.status(400).json({ error: 'Не вказано обовʼязкові поля' });
        }

        const connection = getSchoolDBConnection(databaseName);
        const LessonAttendance = require('../models/LessonAttendance')(connection);

        const startDate = new Date(date); startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date); endDate.setHours(23, 59, 59, 999);

        const lessonAttendance = await LessonAttendance.findOne({
            schedule: scheduleId,
            date: { $gte: startDate, $lte: endDate }
        });

        if (!lessonAttendance) {
            return res.status(404).json({ error: 'Запис не знайдено' });
        }

        const prevCount = lessonAttendance.records.length;
        lessonAttendance.records = lessonAttendance.records.filter(
            r => r.student.toString() !== studentId.toString()
        );

        if (lessonAttendance.records.length === 0) {
            await LessonAttendance.findByIdAndDelete(lessonAttendance._id);
            console.log(`[LA] Видалено весь документ після видалення студента ${studentId}`);
        } else {
            await lessonAttendance.save();
            console.log(`[LA] Видалено студента ${studentId} (${prevCount} → ${lessonAttendance.records.length})`);
        }

        res.json({ message: 'Студента видалено з відвідуваності уроку' });
    } catch (error) {
        console.error('Error deleting student from lesson attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName } = req.body;

        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const LessonAttendance = require('../models/LessonAttendance')(connection);

        const attendance = await LessonAttendance.findByIdAndDelete(id);
        if (!attendance) return res.status(404).json({ error: 'Запис не знайдено' });

        res.json({ message: 'Запис успішно видалено' });
    } catch (error) {
        console.error('Error deleting lesson attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/date/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const { databaseName } = req.query;

        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const LessonAttendance = require('../models/LessonAttendance')(connection);

        const startDate = new Date(date); startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date); endDate.setHours(23, 59, 59, 999);

        const attendances = await LessonAttendance.find({
            date: { $gte: startDate, $lte: endDate }
        }).populate('records.student', 'fullName');

        res.json(attendances);
    } catch (error) {
        console.error('Error fetching attendances by date:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/teacher/:teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { databaseName, startDate, endDate, limit = 50 } = req.query;

        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const LessonAttendance = require('../models/LessonAttendance')(connection);
        const Schedule = connection.models.Schedule;

        const schedules = await Schedule.find({ teacher: teacherId }).select('_id');
        const scheduleIds = schedules.map(s => s._id);

        let query = { schedule: { $in: scheduleIds } };
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const history = await LessonAttendance.find(query)
            .populate({ path: 'schedule', populate: [{ path: 'group', select: 'name' }] })
            .populate('records.student', 'fullName')
            .sort({ date: -1 })
            .limit(parseInt(limit));

        res.json(history);
    } catch (error) {
        console.error('Error fetching attendance history:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;