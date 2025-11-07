const express = require('express');
const router = express.Router();
const DayOfWeek = require('../models/DayOfWeek');

const defaultDays = [
    { id: 1, name: 'Понеділок', nameShort: 'Пн', order: 1, isActive: true },
    { id: 2, name: 'Вівторок', nameShort: 'Вт', order: 2, isActive: true },
    { id: 3, name: 'Середа', nameShort: 'Ср', order: 3, isActive: true },
    { id: 4, name: 'Четвер', nameShort: 'Чт', order: 4, isActive: true },
    { id: 5, name: 'П\'ятниця', nameShort: 'Пт', order: 5, isActive: true },
    { id: 6, name: 'Субота', nameShort: 'Сб', order: 6, isActive: false },
    { id: 7, name: 'Неділя', nameShort: 'Нд', order: 7, isActive: false }
];

router.post('/initialize', async (req, res) => {
    try {
        await DayOfWeek.deleteMany({});
        const createdDays = await DayOfWeek.insertMany(defaultDays);

        res.status(201).json({
            message: 'Дні тижня успішно створені',
            days: createdDays,
            count: createdDays.length
        });
    } catch (error) {
        res.status(500).json({
            message: 'Помилка при створенні днів тижня',
            error: error.message
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const days = await DayOfWeek.find().sort({ order: 1 });
        res.json(days);
    } catch (error) {
        res.status(500).json({
            message: 'Помилка при отриманні днів тижня',
            error: error.message
        });
    }
});

router.get('/active', async (req, res) => {
    try {
        const days = await DayOfWeek.find({ isActive: true }).sort({ order: 1 });
        res.json(days);
    } catch (error) {
        res.status(500).json({
            message: 'Помилка при отриманні активних днів тижня',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const day = await DayOfWeek.findById(req.params.id);
        if (!day) {
            return res.status(404).json({
                message: 'День тижня не знайдено'
            });
        }
        res.json(day);
    } catch (error) {
        res.status(500).json({
            message: 'Помилка при отриманні дня тижня',
            error: error.message
        });
    }
});

module.exports = router;