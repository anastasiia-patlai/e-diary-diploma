const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getSchoolDBConnection } = require('../config/databaseManager');

// ── File upload setup ──────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../../uploads/homework');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        const ext = path.extname(file.originalname);
        cb(null, `hw_${unique}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
    fileFilter: (req, file, cb) => {
        // Allow common document / image / archive types
        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'text/plain',
            'application/zip', 'application/x-rar-compressed',
        ];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        cb(new Error('Непідтримуваний тип файлу'));
    }
});

// ── GET /api/homework/schedule/:scheduleId ─────────────────────────────
// Returns all homework entries for a schedule (optionally filtered by month)
router.get('/schedule/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { databaseName, month } = req.query; // month = 'YYYY-MM'
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const HomeworkEntry = require('../models/HomeworkEntry')(connection);

        const query = { schedule: scheduleId };
        if (month) {
            query.lessonDate = { $regex: `^${month}` };
        }

        const entries = await HomeworkEntry.find(query).sort({ lessonDate: 1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/homework/by-schedules — multiple scheduleIds (comma-separated)
router.get('/by-schedules', async (req, res) => {
    try {
        const { databaseName, ids, month } = req.query;
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });
        if (!ids) return res.status(400).json({ error: 'Не вказано ids' });

        const connection = getSchoolDBConnection(databaseName);
        const HomeworkEntry = require('../models/HomeworkEntry')(connection);

        const idArray = ids.split(',').map(id => id.trim()).filter(Boolean);
        const query = { schedule: { $in: idArray } };
        if (month) query.lessonDate = { $regex: `^${month}` };

        const entries = await HomeworkEntry.find(query).sort({ lessonDate: 1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/homework — create entry (with optional files) ────────────
router.post('/', upload.array('files', 5), async (req, res) => {
    try {
        const { databaseName, scheduleId, lessonDate, lessonNumber, topic, text, dueDate } = req.body;
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });
        if (!scheduleId || !lessonDate || !lessonNumber || !topic || !text || !dueDate) {
            return res.status(400).json({ error: 'Усі обовʼязкові поля мають бути заповнені' });
        }

        const connection = getSchoolDBConnection(databaseName);
        const HomeworkEntry = require('../models/HomeworkEntry')(connection);

        // Check duplicate
        const existing = await HomeworkEntry.findOne({ schedule: scheduleId, lessonDate });
        if (existing) {
            return res.status(409).json({ error: 'ДЗ для цього уроку вже існує. Використайте редагування.' });
        }

        const files = (req.files || []).map(f => ({
            originalName: f.originalname,
            path: `/uploads/homework/${f.filename}`,
            mimeType: f.mimetype,
            size: f.size
        }));

        const userInfo = req.headers['user-info'] ? JSON.parse(req.headers['user-info']) : {};

        const entry = new HomeworkEntry({
            schedule: scheduleId,
            lessonDate,
            lessonNumber: parseInt(lessonNumber),
            topic: topic.trim(),
            text: text.trim(),
            dueDate,
            files,
            createdBy: userInfo.userId || undefined
        });
        await entry.save();
        res.status(201).json(entry);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'ДЗ для цього уроку вже існує' });
        }
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /api/homework/:id — update entry (with optional new files) ─────
router.put('/:id', upload.array('files', 5), async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName, lessonNumber, topic, text, dueDate, removeFiles } = req.body;
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const HomeworkEntry = require('../models/HomeworkEntry')(connection);

        const entry = await HomeworkEntry.findById(id);
        if (!entry) return res.status(404).json({ error: 'Запис не знайдено' });

        if (lessonNumber !== undefined) entry.lessonNumber = parseInt(lessonNumber);
        if (topic !== undefined) entry.topic = topic.trim();
        if (text !== undefined) entry.text = text.trim();
        if (dueDate !== undefined) entry.dueDate = dueDate;

        // Remove files by path if requested
        if (removeFiles) {
            const toRemove = JSON.parse(removeFiles);
            entry.files = entry.files.filter(f => !toRemove.includes(f.path));
            toRemove.forEach(filePath => {
                const abs = path.join(__dirname, '../../', filePath);
                if (fs.existsSync(abs)) fs.unlinkSync(abs);
            });
        }

        // Append new files
        const newFiles = (req.files || []).map(f => ({
            originalName: f.originalname,
            path: `/uploads/homework/${f.filename}`,
            mimeType: f.mimetype,
            size: f.size
        }));
        entry.files.push(...newFiles);

        await entry.save();
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /api/homework/:id ───────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName } = req.body;
        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const HomeworkEntry = require('../models/HomeworkEntry')(connection);

        const entry = await HomeworkEntry.findByIdAndDelete(id);
        if (!entry) return res.status(404).json({ error: 'Запис не знайдено' });

        // Delete physical files
        entry.files.forEach(f => {
            const abs = path.join(__dirname, '../../', f.path);
            if (fs.existsSync(abs)) fs.unlinkSync(abs);
        });

        res.json({ message: 'Запис видалено', deletedId: id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;