const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');

// ОТРИМАТИ ВСІХ БАТЬКІВ
router.get('/parents', async (req, res) => {
    try {
        const parents = await User.find({ role: 'parent' })
            .select('fullName email phone children')
            .populate({
                path: 'children',
                select: 'fullName email group parents',
                populate: [
                    {
                        path: 'group',
                        select: 'name'
                    },
                    {
                        path: 'parents',
                        select: 'fullName email phone'
                    }
                ]
            })
            .sort({ fullName: 1 });
        res.json(parents);
    } catch (err) {
        console.error('Помилка отримання батьків:', err);
        res.status(500).json({ error: err.message });
    }
});

// ОТРИМАТИ ВСІХ СТУДЕНТІВ
router.get('/students', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('fullName email phone dateOfBirth group parents')
            .populate('group', 'name')
            .populate('parents', 'fullName email phone')
            .sort({ fullName: 1 });
        res.json(students);
    } catch (err) {
        console.error('Помилка отримання студентів:', err);
        res.status(500).json({ error: err.message });
    }
});

// ОТРИМАТИ ВСІХ ВИКЛАДАЧІВ
router.get('/teachers', async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' })
            .select('fullName email phone positions position dateOfBirth')
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
        const { fullName, email, phone, dateOfBirth, group, positions, position, jobPosition } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        if (user.role === 'student' && group && user.group?.toString() !== group) {
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
            if (positions && Array.isArray(positions)) {
                updateData.positions = positions.filter(pos => pos.trim() !== "");
                updateData.position = positions.join(", ");
            } else if (position) {
                updateData.position = position;
                updateData.positions = position.split(',').map(pos => pos.trim()).filter(pos => pos !== "");
            }
        } else if (user.role === 'admin') {
            updateData.jobPosition = jobPosition;
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

        if (user.role === 'student') {
            if (user.group) {
                await Group.findByIdAndUpdate(
                    user.group,
                    { $pull: { students: user._id } }
                );
            }

            if (user.parents && user.parents.length > 0) {
                await User.updateMany(
                    { _id: { $in: user.parents } },
                    { $pull: { children: user._id } }
                );
            }
        } else if (user.role === 'parent') {
            if (user.children && user.children.length > 0) {
                await User.updateMany(
                    { _id: { $in: user.children } },
                    { $pull: { parents: user._id } }
                );
            }
        } else if (user.role === 'teacher' && user.group) {
            await Group.findByIdAndUpdate(
                user.group,
                { $pull: { teachers: user._id } }
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

// ОТРИМАННЯ ВСІХ КОРИСТУВАЧІВ
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .select('fullName role email phone position group children')
            .populate('group', 'name')
            .populate('children', 'fullName email group');
        res.json(users);
    } catch (err) {
        console.error("Помилка отримання користувачів:", err);
        res.status(500).json({ error: 'Помилка сервера при отриманні користувачів' });
    }
});

// ОНОВИТИ АДМІНІСТРАТОРА
router.put('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, phone, email, jobPosition, dateOfBirth } = req.body;

        const admin = await User.findById(id);
        if (!admin || admin.role !== 'admin') {
            return res.status(404).json({ error: 'Адміністратора не знайдено' });
        }

        if (email && email !== admin.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Користувач з таким email вже існує' });
            }
        }

        const updatedAdmin = await User.findByIdAndUpdate(
            id,
            {
                fullName,
                phone,
                email,
                jobPosition,
                dateOfBirth
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            message: 'Адміністратора успішно оновлено',
            admin: updatedAdmin
        });
    } catch (err) {
        console.error('Помилка оновлення адміністратора:', err);
        res.status(400).json({ error: err.message });
    }
});

// ДОДАТИ ДИТИНУ
router.put('/:id/add-child', async (req, res) => {
    try {
        const { id } = req.params;
        const { childId } = req.body;

        const parent = await User.findById(id);
        if (!parent || parent.role !== 'parent') {
            return res.status(404).json({ error: 'Батька не знайдено' });
        }

        const child = await User.findById(childId);
        if (!child || child.role !== 'student') {
            return res.status(400).json({ error: 'Дитина має бути студентом' });
        }

        if (parent.children && parent.children.includes(childId)) {
            return res.status(400).json({ error: 'Дитина вже додана до цього батька' });
        }

        await User.findByIdAndUpdate(
            id,
            { $addToSet: { children: childId } }
        );

        const updatedParent = await User.findById(id)
            .populate({
                path: 'children',
                select: 'fullName email group parents',
                populate: [
                    {
                        path: 'group',
                        select: 'name'
                    },
                    {
                        path: 'parents',
                        select: 'fullName email phone'
                    }
                ]
            });

        res.json({
            message: 'Дитину успішно додано',
            parent: updatedParent
        });
    } catch (err) {
        console.error('Помилка додавання дитини:', err);
        res.status(400).json({ error: err.message });
    }
});

// ВИДАЛИТИ ДИТИНУ
router.put('/:id/remove-child', async (req, res) => {
    try {
        const { id } = req.params;
        const { childId } = req.body;

        const parent = await User.findById(id);
        if (!parent || parent.role !== 'parent') {
            return res.status(404).json({ error: 'Батька не знайдено' });
        }

        await User.findByIdAndUpdate(
            id,
            { $pull: { children: childId } }
        );

        await User.findByIdAndUpdate(
            childId,
            { $pull: { parents: id } }
        );

        const updatedParent = await User.findById(id)
            .populate({
                path: 'children',
                select: 'fullName email group parents',
                populate: [
                    {
                        path: 'group',
                        select: 'name'
                    },
                    {
                        path: 'parents',
                        select: 'fullName email phone'
                    }
                ]
            });

        res.json({
            message: 'Дитину успішно видалено',
            parent: updatedParent
        });
    } catch (err) {
        console.error('Помилка видалення дитини:', err);
        res.status(400).json({ error: err.message });
    }
});

// ДОДАТИ БАТЬКА ДО ДИТИНИ
router.put('/:id/add-parent', async (req, res) => {
    try {
        const { id } = req.params;
        const { parentId } = req.body;

        const child = await User.findById(id);
        if (!child || child.role !== 'student') {
            return res.status(404).json({ error: 'Студента не знайдено' });
        }

        const parent = await User.findById(parentId);
        if (!parent || parent.role !== 'parent') {
            return res.status(400).json({ error: 'Батько має бути з роллю parent' });
        }

        if (child.parents && child.parents.includes(parentId)) {
            return res.status(400).json({ error: 'Цей батько вже доданий до дитини' });
        }

        if (child.parents && child.parents.length >= 2) {
            return res.status(400).json({ error: 'Дитина може мати не більше 2 батьків' });
        }

        await User.findByIdAndUpdate(
            id,
            { $addToSet: { parents: parentId } }
        );

        await User.findByIdAndUpdate(
            parentId,
            { $addToSet: { children: id } }
        );

        const updatedChild = await User.findById(id)
            .populate('parents', 'fullName email phone')
            .populate('group', 'name');

        const updatedParent = await User.findById(parentId)
            .populate({
                path: 'children',
                select: 'fullName email group parents',
                populate: [
                    {
                        path: 'group',
                        select: 'name'
                    },
                    {
                        path: 'parents',
                        select: 'fullName email phone'
                    }
                ]
            });

        res.json({
            message: 'Батька успішно додано',
            child: updatedChild,
            parent: updatedParent
        });
    } catch (err) {
        console.error('Помилка додавання батька:', err);
        res.status(400).json({ error: err.message });
    }
});

// ВИДАЛИТИ БАТЬКА З ДИТИНИ
router.put('/:id/remove-parent', async (req, res) => {
    try {
        const { id } = req.params;
        const { parentId } = req.body;

        const child = await User.findById(id);
        if (!child || child.role !== 'student') {
            return res.status(404).json({ error: 'Студента не знайдено' });
        }

        await User.findByIdAndUpdate(
            id,
            { $pull: { parents: parentId } }
        );

        await User.findByIdAndUpdate(
            parentId,
            { $pull: { children: id } }
        );

        const updatedChild = await User.findById(id)
            .populate('parents', 'fullName email phone')
            .populate('group', 'name');

        res.json({
            message: 'Батька успішно видалено',
            child: updatedChild
        });
    } catch (err) {
        console.error('Помилка видалення батька:', err);
        res.status(400).json({ error: err.message });
    }
});

// СТОТИСТИКА КОРИСТУВАЧІВ
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const students = await User.countDocuments({ role: 'student' });
        const teachers = await User.countDocuments({ role: 'teacher' });
        const parents = await User.countDocuments({ role: 'parent' });

        const teachersWithSubjects = await User.find(
            { role: 'teacher' },
            'positions position'
        );

        const allSubjects = teachersWithSubjects.flatMap(teacher => {
            if (teacher.positions && teacher.positions.length > 0) {
                return teacher.positions;
            }
            return teacher.position ? [teacher.position] : [];
        });

        const uniqueSubjects = [...new Set(allSubjects.filter(Boolean))];

        res.json({
            totalUsers,
            students,
            teachers,
            parents,
            subjects: uniqueSubjects.length
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            message: 'Помилка при отриманні статистики',
            error: error.message
        });
    }
});

// КОРИСТУВАЧІ ЗА РОЛЛЮ
router.get('/by-role/:role', async (req, res) => {
    try {
        const { role } = req.params;

        const validRoles = ['student', 'teacher', 'parent', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                message: 'Невірна роль'
            });
        }

        const users = await User.find({ role });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users by role:', error);
        res.status(500).json({
            message: 'Помилка при отриманні користувачів',
            error: error.message
        });
    }
});

module.exports = router;