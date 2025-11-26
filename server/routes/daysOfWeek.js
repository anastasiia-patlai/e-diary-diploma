const express = require('express');
const router = express.Router();
const { getSchoolDayOfWeekModel } = require('../config/databaseManager');

const defaultDays = [
    { id: 1, name: 'Понеділок', nameShort: 'Пн', order: 1, isActive: true },
    { id: 2, name: 'Вівторок', nameShort: 'Вт', order: 2, isActive: true },
    { id: 3, name: 'Середа', nameShort: 'Ср', order: 3, isActive: true },
    { id: 4, name: 'Четвер', nameShort: 'Чт', order: 4, isActive: true },
    { id: 5, name: 'П\'ятниця', nameShort: 'Пт', order: 5, isActive: true },
    { id: 6, name: 'Субота', nameShort: 'Сб', order: 6, isActive: false },
    { id: 7, name: 'Неділя', nameShort: 'Нд', order: 7, isActive: false }
];

// ІНІЦІАЛІЗАЦІЯ ДНІВ ТИЖНЯ
router.post('/initialize', async (req, res) => {
    try {
        const { databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const DayOfWeek = getSchoolDayOfWeekModel(databaseName);

        const existingDays = await DayOfWeek.find({});
        if (existingDays.length > 0) {
            return res.status(400).json({
                message: 'Дні тижня вже ініціалізовані для цієї школи'
            });
        }

        const createdDays = await DayOfWeek.insertMany(defaultDays);

        res.status(201).json({
            message: 'Дні тижня успішно створені',
            days: createdDays,
            count: createdDays.length
        });
    } catch (error) {
        console.error('Error initializing days:', error);
        res.status(500).json({
            message: 'Помилка при створенні днів тижня',
            error: error.message
        });
    }
});

// ОТРИМАТИ ВСІ ДНІ ТИЖНЯ
router.get('/', async (req, res) => {
    try {
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const DayOfWeek = getSchoolDayOfWeekModel(databaseName);
        const days = await DayOfWeek.find().sort({ order: 1 });

        res.json(days);
    } catch (error) {
        console.error('Error fetching days:', error);
        res.status(500).json({
            message: 'Помилка при отриманні днів тижня',
            error: error.message
        });
    }
});

// ОТРИМАТИ ДЕНЬ ТИЖНЯ ПО ЧИСЛОВОМУ ID
router.get('/by-id/:id', async (req, res) => {
    try {
        const { databaseName } = req.query;
        const { id } = req.params;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const DayOfWeek = getSchoolDayOfWeekModel(databaseName);
        const day = await DayOfWeek.findOne({ id: parseInt(id) });

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

// ОТРИМАТИ АКТИВНІ ДНІ ТИЖНЯ
router.get('/active', async (req, res) => {
    try {
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const DayOfWeek = getSchoolDayOfWeekModel(databaseName);
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

// ОТРИМАТИ ДЕНЬ ТИЖНЯ ПО ID
router.get('/:id', async (req, res) => {
    try {
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const DayOfWeek = getSchoolDayOfWeekModel(databaseName);
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

// СТВОРИТИ НОВИЙ ДЕНЬ ТИЖНЯ
router.post('/', async (req, res) => {
    try {
        const { name, nameShort, order, isActive, databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        if (!name || !order) {
            return res.status(400).json({
                message: 'Назва та порядок обов\'язкові'
            });
        }

        const DayOfWeek = getSchoolDayOfWeekModel(databaseName);

        // Перевірити, чи день з таким порядком вже існує
        const existingDay = await DayOfWeek.findOne({ order: parseInt(order) });
        if (existingDay) {
            return res.status(400).json({
                message: 'День з таким порядком вже існує'
            });
        }

        const newDay = new DayOfWeek({
            name,
            nameShort: nameShort || name.substring(0, 2),
            order: parseInt(order),
            isActive: isActive !== undefined ? isActive : true
        });

        await newDay.save();
        res.status(201).json(newDay);
    } catch (error) {
        console.error('Error creating day:', error);
        res.status(500).json({
            message: 'Помилка при створенні дня тижня',
            error: error.message
        });
    }
});

// ОНОВИТИ ДЕНЬ ТИЖНЯ
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, nameShort, order, isActive, databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const DayOfWeek = getSchoolDayOfWeekModel(databaseName);
        const updatedDay = await DayOfWeek.findByIdAndUpdate(
            id,
            {
                name,
                nameShort,
                order: parseInt(order),
                isActive
            },
            { new: true, runValidators: true }
        );

        if (!updatedDay) {
            return res.status(404).json({
                message: 'День тижня не знайдено'
            });
        }

        res.json(updatedDay);
    } catch (error) {
        console.error('Error updating day:', error);
        res.status(500).json({
            message: 'Помилка при оновленні дня тижня',
            error: error.message
        });
    }
});

// ВИДАЛИТИ ДЕНЬ ТИЖНЯ
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const DayOfWeek = getSchoolDayOfWeekModel(databaseName);
        const deletedDay = await DayOfWeek.findByIdAndDelete(id);

        if (!deletedDay) {
            return res.status(404).json({
                message: 'День тижня не знайдено'
            });
        }

        res.json({
            message: 'День тижня успішно видалено',
            deletedDay
        });
    } catch (error) {
        console.error('Error deleting day:', error);
        res.status(500).json({
            message: 'Помилка при видаленні дня тижня',
            error: error.message
        });
    }
});

module.exports = router;