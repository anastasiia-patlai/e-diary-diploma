const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');

// ОТРИМАТИ ВСІХ ВИКЛАДАЧІВ
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

// ОНОВИТИ КОРИСТУВАЧА
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, dateOfBirth, group, position } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        if (user.role === 'student' && group && user.group?.toString() !== group) {
            // Видалити студента зі старої групи
            if (user.group) {
                await Group.findByIdAndUpdate(
                    user.group,
                    { $pull: { students: user._id } }
                );
            }

            await Group.findByIdAndUpdate(
                group,
                { $addToSet: { students: user._id } }
            );
        }

        const updateData = {
            fullName,
            email,
            phone,
            dateOfBirth
        };

        if (user.role === 'student') {
            updateData.group = group;
        } else if (user.role === 'teacher') {
            updateData.position = position;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('group', 'name');

        res.json({
            message: 'Користувача успішно оновлено',
            user: updatedUser
        });
    } catch (err) {
        console.error('Помилка оновлення користувача:', err);
        res.status(400).json({ error: err.message });
    }
});

// ВИДАЛИТИ КОРИСТУВАЧА
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        if (user.role === 'student' && user.group) {
            await Group.findByIdAndUpdate(
                user.group,
                { $pull: { students: user._id } }
            );
        }

        await User.findByIdAndDelete(id);

        res.json({
            message: 'Користувача успішно видалено',
            userId: id
        });
    } catch (err) {
        console.error('Помилка видалення користувача:', err);
        res.status(500).json({ error: err.message });
    }
});

// ОТРИМАТИ КОРИСТУВАЧА ЗА ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('group', 'name')
            .select('-password');

        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        res.json(user);
    } catch (err) {
        console.error('Помилка отримання користувача:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;