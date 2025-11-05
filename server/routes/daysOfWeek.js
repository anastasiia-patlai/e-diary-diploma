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

// Функція для ініціалізації днів
const initializeDays = async () => {
    try {
        const existingDays = await DayOfWeek.find();
        if (existingDays.length > 0) {
            return { message: 'Дні тижня вже існують', days: existingDays };
        }

        const createdDays = await DayOfWeek.insertMany(defaultDays);
        console.log('✅ Дні тижня успішно створені:', createdDays.length);
        return { message: 'Дні тижня успішно створені', days: createdDays };
    } catch (error) {
        console.error('❌ Помилка при створенні днів тижня:', error);
        throw error;
    }
};

// ПРИМУСОВА ІНІЦІАЛІЗАЦІЯ ДНІВ ТИЖНЯ ДЛЯ АДМІНА
router.post('/initialize', async (req, res) => {
    try {
        const result = await initializeDays();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({
            message: 'Помилка при створенні днів тижня',
            error: error.message
        });
    }
});

// ОТРИМАТИ ВСІ ДНІ ТИЖНЯ
router.get('/', async (req, res) => {
    try {
        const days = await DayOfWeek.find().sort({ order: 1 });
        res.json(days);
    } catch (error) {
        console.error('Error fetching days of week:', error);
        res.status(500).json({
            message: 'Помилка при отриманні днів тижня',
            error: error.message
        });
    }
});

// ОТРИМАТИ АКТИВНІ ДНІ ТИЖНЯ
router.get('/active', async (req, res) => {
    try {
        const days = await DayOfWeek.find({ isActive: true }).sort({ order: 1 });
        res.json(days);
    } catch (error) {
        console.error('Error fetching active days:', error);
        res.status(500).json({
            message: 'Помилка при отриманні активних днів тижня',
            error: error.message
        });
    }
});

// ОТРИМАТИ ДЕНЬ ТИЖНЯ ЗА ID
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
        console.error('Error fetching day:', error);
        res.status(500).json({
            message: 'Помилка при отриманні дня тижня',
            error: error.message
        });
    }
});

module.exports = router;