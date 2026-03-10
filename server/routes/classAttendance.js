const express = require('express');
const router = express.Router();
const { getSchoolDBConnection } = require('../config/databaseManager');

// Отримати відвідуваність для групи за чверть
// GET /api/attendance/class/group/:groupId
router.get('/group/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { databaseName, quarter } = req.query;

        console.log('GET /api/attendance/class/group/:groupId', { groupId, databaseName, quarter });

        const connection = getSchoolDBConnection(databaseName);
        const ClassAttendance = require('../models/ClassAttendance')(connection);

        const attendance = await ClassAttendance.find({
            group: groupId,
            quarter: quarter
        }).populate('student', 'fullName');

        console.log(`Found ${attendance.length} records`);
        res.json(attendance);
    } catch (error) {
        console.error('Error in GET /group/:groupId:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/attendance/class/
router.post('/', async (req, res) => {
    try {
        const {
            databaseName,
            groupId,
            studentId,
            date,
            quarter,
            reasonType,
            reason,
            lessonsAbsent,
            totalLessons,
            certificate,
            note
        } = req.body;

        console.log('POST /api/attendance/class/', req.body);

        const connection = getSchoolDBConnection(databaseName);
        const ClassAttendance = require('../models/ClassAttendance')(connection);

        // Перевіряємо чи існує запис
        let attendance = await ClassAttendance.findOne({
            student: studentId,
            date: new Date(date),
            quarter
        });

        if (attendance) {
            // Оновлюємо існуючий запис
            attendance.reasonType = reasonType;
            attendance.reason = reason;
            attendance.lessonsAbsent = lessonsAbsent || 0;
            attendance.totalLessons = totalLessons || 0;
            attendance.certificate = certificate;
            attendance.note = note;

            await attendance.save();
            console.log('Updated existing record:', attendance);
        } else {
            // Створюємо новий запис
            attendance = new ClassAttendance({
                group: groupId,
                student: studentId,
                date: new Date(date),
                quarter,
                status: 'absent',
                reasonType,
                reason,
                lessonsAbsent: lessonsAbsent || 0,
                totalLessons: totalLessons || 0,
                certificate,
                note
            });

            await attendance.save();
            console.log('Created new record:', attendance);
        }

        await attendance.populate('student', 'fullName');
        res.status(201).json(attendance);
    } catch (error) {
        console.error('Error in POST /class:', error);
        res.status(500).json({ error: error.message });
    }
});

// Оновити запис відвідуваності
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            databaseName,
            reasonType,
            reason,
            lessonsAbsent,
            totalLessons,
            certificate,
            note
        } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const connection = getSchoolDBConnection(databaseName);
        const ClassAttendance = require('../models/ClassAttendance')(connection);

        const userInfo = JSON.parse(req.headers['user-info'] || '{}');
        const userId = userInfo.userId;

        const attendance = await ClassAttendance.findByIdAndUpdate(
            id,
            {
                reasonType,
                reason,
                lessonsAbsent,
                totalLessons,
                certificate,
                note,
                updatedBy: userId
            },
            { new: true, runValidators: true }
        ).populate('student', 'fullName');

        if (!attendance) {
            return res.status(404).json({ error: 'Запис не знайдено' });
        }

        res.json(attendance);
    } catch (error) {
        console.error('Error updating class attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

// Видалити запис відвідуваності
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const connection = getSchoolDBConnection(databaseName);
        const ClassAttendance = require('../models/ClassAttendance')(connection);

        const attendance = await ClassAttendance.findByIdAndDelete(id);

        if (!attendance) {
            return res.status(404).json({ error: 'Запис не знайдено' });
        }

        res.json({ message: 'Запис успішно видалено' });
    } catch (error) {
        console.error('Error deleting class attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

// Отримати статистику відвідуваності для групи за чверть
router.get('/stats/group/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { databaseName, quarter } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const connection = getSchoolDBConnection(databaseName);
        const ClassAttendance = require('../models/ClassAttendance')(connection);
        const Group = require('../models/Group')(connection);

        // Отримуємо всіх студентів групи
        const group = await Group.findById(groupId)
            .populate('students', 'fullName');

        const students = group?.students || [];

        // Отримуємо всі записи відвідуваності за чверть
        const attendance = await ClassAttendance.find({
            group: groupId,
            quarter
        });

        // Розраховуємо статистику для кожного студента
        const stats = students.map(student => {
            const studentRecords = attendance.filter(a =>
                a.student._id.toString() === student._id.toString()
            );

            const totalAbsent = studentRecords.length;
            const sickDays = studentRecords.filter(a => a.reasonType === 'sick').length;
            const familyDays = studentRecords.filter(a => a.reasonType === 'family').length;
            const otherDays = studentRecords.filter(a => a.reasonType === 'other').length;

            return {
                studentId: student._id,
                studentName: student.fullName,
                totalAbsent,
                sickDays,
                familyDays,
                otherDays,
                details: studentRecords
            };
        });

        // Загальна статистика по групі
        const totalStats = {
            totalStudents: students.length,
            totalAbsent: stats.reduce((sum, s) => sum + s.totalAbsent, 0),
            totalSick: stats.reduce((sum, s) => sum + s.sickDays, 0),
            totalFamily: stats.reduce((sum, s) => sum + s.familyDays, 0),
            totalOther: stats.reduce((sum, s) => sum + s.otherDays, 0)
        };

        res.json({
            students: stats,
            totals: totalStats
        });
    } catch (error) {
        console.error('Error getting attendance stats:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;