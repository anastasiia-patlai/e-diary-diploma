const express = require('express');
const router = express.Router();
const { getSchoolDBConnection } = require('../config/databaseManager');

const toDateStr = (d) => {
    if (!d) return null;
    if (typeof d === 'string') return d.split('T')[0];
    if (d instanceof Date) return d.toISOString().split('T')[0];
    return String(d);
};

// GET all grades for a schedule
router.get('/schedule/:scheduleId', async (req, res) => {
    try {
        const { databaseName } = req.query;
        const { scheduleId } = req.params;
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const Grade = require('../models/Grade')(connection);

        const grades = await Grade.find({ schedule: scheduleId })
            .populate('student', 'fullName');
        res.json(grades);
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST — create grade (with explicit duplicate check)
router.post('/', async (req, res) => {
    try {
        const { databaseName, student, schedule, date, value, columnId, gradeType } = req.body;
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const Grade = require('../models/Grade')(connection);

        // Build duplicate check query depending on whether this is a column grade or regular grade
        const dupQuery = {
            student,
            schedule,
            date: new Date(date)
        };
        if (columnId) {
            dupQuery.columnId = columnId;
        } else {
            dupQuery.columnId = null;
        }

        const existingGrade = await Grade.findOne(dupQuery);
        if (existingGrade) {
            // Update in place instead of returning 409 — prevents double grades
            existingGrade.value = value;
            if (gradeType) existingGrade.gradeType = gradeType;
            await existingGrade.save();
            await existingGrade.populate('student', 'fullName');
            return res.status(200).json(existingGrade);
        }

        const grade = new Grade({
            student,
            schedule,
            date: new Date(date),
            value,
            columnId: columnId || null,
            gradeType: gradeType || 'regular'
        });
        await grade.save();
        await grade.populate('student', 'fullName');
        res.status(201).json(grade);
    } catch (error) {
        console.error('Error creating grade:', error);
        if (error.code === 11000) {
            // Fallback: find and update
            try {
                const { databaseName, student, schedule, date, value, columnId, gradeType } = req.body;
                const connection = getSchoolDBConnection(databaseName);
                const Grade = require('../models/Grade')(connection);
                const dupQuery = { student, schedule, date: new Date(date), columnId: columnId || null };
                const existing = await Grade.findOneAndUpdate(
                    dupQuery,
                    { value, gradeType: gradeType || 'regular' },
                    { new: true }
                ).populate('student', 'fullName');
                if (existing) return res.status(200).json(existing);
            } catch (e) {
                console.error('Fallback update failed:', e);
            }
        }
        res.status(400).json({ error: error.message });
    }
});

// PUT — update grade by id
router.put('/:id', async (req, res) => {
    try {
        const { databaseName, value, columnId, gradeType } = req.body;
        const { id } = req.params;
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });
        if (!value) return res.status(400).json({ error: 'Не вказано значення оцінки' });

        const connection = getSchoolDBConnection(databaseName);
        const Grade = require('../models/Grade')(connection);

        const updateFields = { value };
        if (gradeType !== undefined) updateFields.gradeType = gradeType;
        if (columnId !== undefined) updateFields.columnId = columnId || null;

        const grade = await Grade.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, runValidators: true }
        ).populate('student', 'fullName');

        if (!grade) return res.status(404).json({ error: 'Оцінку не знайдено' });
        res.json(grade);
    } catch (error) {
        console.error('Error updating grade:', error);
        res.status(400).json({ error: error.message });
    }
});

// DELETE — remove grade by id
router.delete('/:id', async (req, res) => {
    try {
        const { databaseName } = req.body;
        const { id } = req.params;
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const Grade = require('../models/Grade')(connection);

        const grade = await Grade.findByIdAndDelete(id);
        if (!grade) return res.status(404).json({ error: 'Оцінку не знайдено' });
        res.json({ message: 'Оцінку видалено' });
    } catch (error) {
        console.error('Error deleting grade:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;