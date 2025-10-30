const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Користувач не знайдений' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Невірний пароль' });
        }

        res.json({
            message: 'Успішний вхід',
            user: {
                id: user._id,
                fullName: user.fullName,
                role: user.role,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                email: user.email,
                group: user.group || null,
                position: user.position || null
            }
        });

    } catch (err) {
        console.error('Помилка при логіні:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});


module.exports = router;
