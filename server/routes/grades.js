const express = require('express');
const router = express.Router();
const { getSchoolDBConnection } = require('../config/databaseManager');

// Отримати всі оцінки для уроку
router.get('/schedule/:scheduleId', async (req, res) => {
    try {
        const { databaseName } = req.query;
        const { scheduleId } = req.params;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        console.log(`Fetching grades for schedule ${scheduleId} in database ${databaseName}`);

        // Перевіряємо, чи функція існує
        if (typeof getSchoolDBConnection !== 'function') {
            console.error('getSchoolDBConnection is not a function');
            return res.status(500).json({ error: 'Внутрішня помилка сервера: databaseManager не налаштовано правильно' });
        }

        const connection = getSchoolDBConnection(databaseName);

        if (!connection) {
            return res.status(500).json({ error: `Не вдалося отримати з'єднання з базою даних: ${databaseName}` });
        }

        const Grade = require('../models/Grade')(connection);

        const grades = await Grade.find({ schedule: scheduleId })
            .populate('student', 'fullName');

        res.json(grades);
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ error: error.message });
    }
});

// Створити оцінку
router.post('/', async (req, res) => {
    try {
        const { databaseName, student, schedule, date, value } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        console.log('Creating grade:', { databaseName, student, schedule, date, value });

        const connection = getSchoolDBConnection(databaseName);
        const Grade = require('../models/Grade')(connection);

        // Перевірка чи існує вже оцінка
        const existingGrade = await Grade.findOne({ student, schedule, date });
        if (existingGrade) {
            return res.status(409).json({ error: 'Оцінка для цього учня на цю дату вже існує' });
        }

        const grade = new Grade({ student, schedule, date, value });
        await grade.save();

        // Важливо: population після збереження
        await grade.populate('student', 'fullName');

        console.log('Grade created successfully:', grade);

        res.status(201).json(grade);
    } catch (error) {
        console.error('Error creating grade:', error);
        res.status(400).json({ error: error.message });
    }
});

// Оновити оцінку
router.put('/:id', async (req, res) => {
    try {
        const { databaseName, value } = req.body;
        const { id } = req.params;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        if (!value) {
            return res.status(400).json({ error: 'Не вказано значення оцінки' });
        }

        // Перевіряємо, чи функція існує
        if (typeof getSchoolDBConnection !== 'function') {
            console.error('getSchoolDBConnection is not a function');
            return res.status(500).json({ error: 'Внутрішня помилка сервера: databaseManager не налаштовано правильно' });
        }

        const connection = getSchoolDBConnection(databaseName);

        if (!connection) {
            return res.status(500).json({ error: `Не вдалося отримати з'єднання з базою даних: ${databaseName}` });
        }

        const Grade = require('../models/Grade')(connection);

        const grade = await Grade.findByIdAndUpdate(
            id,
            { value },
            { new: true, runValidators: true }
        ).populate('student', 'fullName');

        if (!grade) {
            return res.status(404).json({ error: 'Оцінку не знайдено' });
        }

        res.json(grade);
    } catch (error) {
        console.error('Error updating grade:', error);
        res.status(400).json({ error: error.message });
    }
});

// Видалити оцінку
router.delete('/:id', async (req, res) => {
    try {
        const { databaseName } = req.body;
        const { id } = req.params;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        // Перевіряємо, чи функція існує
        if (typeof getSchoolDBConnection !== 'function') {
            console.error('getSchoolDBConnection is not a function');
            return res.status(500).json({ error: 'Внутрішня помилка сервера: databaseManager не налаштовано правильно' });
        }

        const connection = getSchoolDBConnection(databaseName);

        if (!connection) {
            return res.status(500).json({ error: `Не вдалося отримати з'єднання з базою даних: ${databaseName}` });
        }

        const Grade = require('../models/Grade')(connection);

        const grade = await Grade.findByIdAndDelete(id);
        if (!grade) {
            return res.status(404).json({ error: 'Оцінку не знайдено' });
        }

        res.json({ message: 'Оцінку видалено' });
    } catch (error) {
        console.error('Error deleting grade:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;