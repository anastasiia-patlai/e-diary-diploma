const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');

router.get('/', async (req, res) => {
    try {
        const { semester } = req.query;
        let query = {};

        if (semester) {
            query.semester = semester;
        }

        const schedules = await Schedule.find(query)
            .populate('teacher', 'fullName email position positions')
            .populate('group', 'name')
            .populate('classroom', 'name')
            .populate('dayOfWeek', 'name')
            .populate('timeSlot', 'order startTime endTime')
            .populate('semester', 'name year');

        res.json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({
            message: 'Помилка при отриманні розкладу',
            error: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const schedule = new Schedule(req.body);
        await schedule.save();

        await schedule.populate([
            { path: 'teacher', select: 'fullName email position positions' },
            { path: 'group', select: 'name' },
            { path: 'classroom', select: 'name' },
            { path: 'dayOfWeek', select: 'name' },
            { path: 'timeSlot', select: 'order startTime endTime' },
            { path: 'semester', select: 'name year' }
        ]);

        res.status(201).json(schedule);
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(400).json({
            message: 'Помилка при створенні розкладу',
            error: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndDelete(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Запис розкладу не знайдено' });
        }
        res.json({ message: 'Запис розкладу успішно видалено' });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({
            message: 'Помилка при видаленні розкладу',
            error: error.message
        });
    }
});

module.exports = router;