const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Group = require('../models/Group');

router.post('/signup', async (req, res) => {
    const { fullName, role, phone, dateOfBirth, email, password, group, positions, jobPosition } = req.body;

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

        // ФІЛЬТРУЄМО ПОРОЖНІ ПРЕДМЕТИ
        const filteredPositions = positions ? positions.filter(pos => pos.trim() !== "") : [];

        // СТВОРЮЄМО ОБ'ЄКТ КОРИСТУВАЧА ЗАЛЕЖНО ВІД РОЛІ
        const userData = {
            fullName,
            role,
            phone,
            dateOfBirth,
            email,
            password: hashedPassword
        };

        // ДОДАЄМО ПОЛЯ ЗАЛЕЖНО ВІД РОЛІ
        if (role === 'student') {
            userData.group = groupId;
        } else if (role === 'teacher') {
            userData.positions = filteredPositions;
            userData.position = filteredPositions.join(", ");
        } else if (role === 'admin') {
            userData.jobPosition = jobPosition;
        }

        const newUser = new User(userData);
        await newUser.save();

        if (role === 'student' && groupId) {
            await Group.findByIdAndUpdate(
                groupId,
                { $addToSet: { students: newUser._id } }
            );
        }

        res.status(201).json({
            message: 'Користувача успішно зареєстровано',
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                role: newUser.role,
                email: newUser.email,
                positions: newUser.positions,
                jobPosition: newUser.jobPosition
            }
        });

    } catch (err) {
        console.error('Помилка реєстрації:', err);
        res.status(500).json({ error: 'Помилка сервера при реєстрації' });
    }
});

module.exports = router;