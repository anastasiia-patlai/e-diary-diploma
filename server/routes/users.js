const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/teachers', async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' })
            .select('fullName email phone position dateOfBirth')
            .sort({ fullName: 1 });
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;