const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Group = require('../models/Group');

router.post('/signup', async (req, res) => {
    const { fullName, role, phone, dateOfBirth, email, password, group, position } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Користувач з таким email вже існує' });

        const hashedPassword = await bcrypt.hash(password, 10);

        let groupId = null;

        if (role === 'student' && group) {
            let existingGroup = await Group.findOne({ name: group });

            if (!existingGroup) {
                existingGroup = new Group({ name: group, students: [] });
                await existingGroup.save();
                console.log(`Група "${group}" створена`);
            }

            groupId = existingGroup._id;
        }

        const newUser = new User({
            fullName,
            role,
            phone,
            email,
            password: hashedPassword,
            group: groupId,
            position: role === 'teacher' ? position : undefined
        });

        await newUser.save();

        if (role === 'student' && groupId) {
            await Group.findByIdAndUpdate(
                groupId,
                { $addToSet: { students: newUser._id } }
            );
        }

        res.status(201).json({
            message: 'Користувача успішно зареєстровано',
            user: { id: newUser._id, fullName: newUser.fullName, role: newUser.role, email: newUser.email }
        });

    } catch (err) {
        console.error('Помилка реєстрації:', err);
        res.status(500).json({ error: 'Помилка сервера при реєстрації' });
    }
});

module.exports = router;
