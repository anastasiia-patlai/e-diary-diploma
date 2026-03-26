const express = require('express');
const router = express.Router();
const { getSchoolDBConnection } = require('../config/databaseManager');

router.get('/schedule/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { databaseName } = req.query;
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const JournalColumn = require('../models/Journalcolumn')(connection);

        const columns = await JournalColumn.find({ schedule: scheduleId }).sort({ order: 1 });
        res.json(columns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { databaseName, scheduleId, date, type, label } = req.body;
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const JournalColumn = require('../models/Journalcolumn')(connection);

        const maxOrderDoc = await JournalColumn.findOne({ schedule: scheduleId }).sort({ order: -1 });
        const nextOrder = maxOrderDoc ? maxOrderDoc.order + 1 : 1;

        const column = new JournalColumn({
            schedule: scheduleId,
            date,
            type,
            label: label || '',
            order: nextOrder
        });
        await column.save();
        res.status(201).json(column);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/reorder', async (req, res) => {
    try {
        const { databaseName, scheduleId, columns } = req.body;
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const JournalColumn = require('../models/Journalcolumn')(connection);

        await Promise.all(
            columns.map((col, idx) =>
                JournalColumn.findByIdAndUpdate(col._id, { order: idx + 1 })
            )
        );
        const updated = await JournalColumn.find({ schedule: scheduleId }).sort({ order: 1 });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName, type, date, label, order } = req.body;
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const JournalColumn = require('../models/Journalcolumn')(connection);

        const updated = await JournalColumn.findByIdAndUpdate(
            id,
            { type, date, label, order },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ error: 'Колонку не знайдено' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName } = req.body;
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const JournalColumn = require('../models/Journalcolumn')(connection);

        const col = await JournalColumn.findByIdAndDelete(id);
        if (!col) return res.status(404).json({ error: 'Колонку не знайдено' });
        res.json({ message: 'Колонку видалено', deletedId: id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;