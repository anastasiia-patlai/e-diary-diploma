const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

router.post('/create', async (req, res) => {
    const { name, curatorId } = req.body;

    try {
        const group = new Group({ name, curator: curatorId });
        await group.save();
        res.status(201).json({ message: `Група "${name}" створена`, group });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;