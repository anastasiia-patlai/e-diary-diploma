const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const Classroom = require('../models/Classroom');
const Group = require('../models/Group');
const User = require('../models/User');

// Отримати весь розклад
router.get('/', async (req, res) => {
    try {
        const schedules = await Schedule.find()
            .populate('teacher', 'fullName email position positions')
            .populate('group', 'name')
            .populate('classroom', 'name');
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Створити новий запис розкладу
router.post('/', async (req, res) => {
    try {
        const schedule = new Schedule(req.body);
        await schedule.save();
        await schedule.populate('teacher group classroom');
        res.status(201).json(schedule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Отримати дані для форм
router.get('/form-data', async (req, res) => {
    try {
        const [teachers, groups, classrooms] = await Promise.all([
            // Отримуємо тільки викладачів з їхніми предметами
            User.find({ role: 'teacher' }, 'fullName email position positions'),
            Group.find(),
            Classroom.find()
        ]);

        res.json({ teachers, groups, classrooms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;