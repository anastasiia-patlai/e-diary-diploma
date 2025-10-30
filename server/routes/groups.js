const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

router.post('/', async (req, res) => {
    try {
        const { name, curator } = req.body;
        const existingGroup = await Group.findOne({ name });
        if (existingGroup) return res.status(400).json({ error: 'Група з такою назвою вже існує' });

        const group = new Group({ name, curator: curator || null });
        await group.save();
        res.status(201).json({ message: `Група ${name} створена`, group });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('curator', 'fullName email')
            .populate('students', 'fullName email');
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('curator', 'fullName email')
            .populate('students', 'fullName email');
        if (!group) return res.status(404).json({ error: 'Група не знайдена' });
        res.json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, curator } = req.body;
        const group = await Group.findByIdAndUpdate(req.params.id, { name, curator }, { new: true });
        if (!group) return res.status(404).json({ error: 'Група не знайдена' });
        res.json({ message: 'Група оновлена', group });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const group = await Group.findByIdAndDelete(req.params.id);
        if (!group) return res.status(404).json({ error: 'Група не знайдена' });
        res.json({ message: 'Група видалена' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
