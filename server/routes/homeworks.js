const express = require('express');
const router = express.Router();
const { getSchoolDBConnection } = require('../config/databaseManager');

// Отримати всі ДЗ для уроку
router.get('/schedule/:scheduleId', async (req, res) => {
    try {
        const { databaseName } = req.query;
        const { scheduleId } = req.params;

        console.log('=== GET /api/homeworks/schedule/:scheduleId ===');
        console.log('scheduleId:', scheduleId);
        console.log('databaseName:', databaseName);

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const connection = getSchoolDBConnection(databaseName);
        const Homework = require('../models/Homework')(connection);

        const homeworks = await Homework.find({ schedule: scheduleId });
        res.json(homeworks);
    } catch (error) {
        console.error('Error fetching homeworks:', error);
        res.status(500).json({ error: error.message });
    }
});

// Створити ДЗ
router.post('/', async (req, res) => {
    try {
        const { databaseName, schedule, date, text } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        console.log('Creating homework:', { databaseName, schedule, date, text });

        const connection = getSchoolDBConnection(databaseName);
        const Homework = require('../models/Homework')(connection);

        // Перевірка чи існує вже ДЗ
        const existingHomework = await Homework.findOne({ schedule, date });
        if (existingHomework) {
            return res.status(409).json({ error: 'ДЗ на цю дату вже існує' });
        }

        const homework = new Homework({ schedule, date, text });
        await homework.save();

        res.status(201).json(homework);
    } catch (error) {
        console.error('Error creating homework:', error);
        res.status(400).json({ error: error.message });
    }
});

// Оновити ДЗ
router.put('/:id', async (req, res) => {
    try {
        const { databaseName, text } = req.body;
        const { id } = req.params;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const connection = getSchoolDBConnection(databaseName);
        const Homework = require('../models/Homework')(connection);

        const homework = await Homework.findByIdAndUpdate(
            id,
            { text },
            { new: true, runValidators: true }
        );

        if (!homework) {
            return res.status(404).json({ error: 'ДЗ не знайдено' });
        }

        res.json(homework);
    } catch (error) {
        console.error('Error updating homework:', error);
        res.status(400).json({ error: error.message });
    }
});

// Видалити ДЗ
router.delete('/:id', async (req, res) => {
    try {
        const { databaseName } = req.body;
        const { id } = req.params;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const connection = getSchoolDBConnection(databaseName);
        const Homework = require('../models/Homework')(connection);

        const homework = await Homework.findByIdAndDelete(id);
        if (!homework) {
            return res.status(404).json({ error: 'ДЗ не знайдено' });
        }

        res.json({ message: 'ДЗ видалено' });
    } catch (error) {
        console.error('Error deleting homework:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;