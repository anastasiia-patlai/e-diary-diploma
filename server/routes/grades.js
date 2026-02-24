const express = require('express');
const router = express.Router();
const { getSchoolConnection } = require('../config/databaseManager');

// Отримати всі оцінки для уроку
router.get('/schedule/:scheduleId', async (req, res) => {
    try {
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        console.log(`Fetching grades for schedule ${req.params.scheduleId} in database ${databaseName}`);

        const connection = getSchoolConnection(databaseName);
        const Grade = require('../models/Grade')(connection);

        const grades = await Grade.find({ schedule: req.params.scheduleId })
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

        const connection = getSchoolConnection(databaseName);
        const Grade = require('../models/Grade')(connection);

        // Перевірка чи існує вже оцінка
        const existingGrade = await Grade.findOne({ student, schedule, date });
        if (existingGrade) {
            return res.status(409).json({ error: 'Оцінка для цього учня на цю дату вже існує' });
        }

        const grade = new Grade({ student, schedule, date, value });
        await grade.save();
        await grade.populate('student', 'fullName');

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

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const connection = getSchoolConnection(databaseName);
        const Grade = require('../models/Grade')(connection);

        const grade = await Grade.findByIdAndUpdate(
            req.params.id,
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

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const connection = getSchoolConnection(databaseName);
        const Grade = require('../models/Grade')(connection);

        const grade = await Grade.findByIdAndDelete(req.params.id);
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