const express = require('express');
const router = express.Router();
const { getSchoolUserModel, getSchoolGroupModel } = require('../config/databaseManager');

// ОТРИМАТИ ВСІХ БАТЬКІВ
router.get('/parents', async (req, res) => {
    try {
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);
        const Group = getSchoolGroupModel(databaseName);

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
        const { databaseName, search } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);
        const Group = getSchoolGroupModel(databaseName);

        let searchCondition = { role: 'student' };

        if (search && search.length >= 3) {
            const searchRegex = new RegExp(search, 'i');
            searchCondition.$or = [
                { fullName: searchRegex },
                { email: searchRegex },
                { 'group.name': searchRegex }
            ];
        }

        const students = await User.find(searchCondition)
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
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);
        const teachers = await User.find({ role: 'teacher' })
            .select('fullName email phone positions position category teacherType allowedCategories dateOfBirth') // ✅ Додано teacherType та allowedCategories
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
        const { databaseName, fullName, email, phone, dateOfBirth, group, positions, position, category, teacherType, allowedCategories, jobPosition } = req.body; // ✅ Додано teacherType та allowedCategories

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);
        const Group = getSchoolGroupModel(databaseName);

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

            // ✅ Додано обробку teacherType та allowedCategories
            if (category !== undefined) {
                updateData.category = category;
            }

            if (teacherType !== undefined) {
                updateData.teacherType = teacherType;

                // Автоматично генеруємо allowedCategories на основі teacherType, якщо не вказано явно
                if (!allowedCategories || allowedCategories.length === 0) {
                    if (teacherType === "young") {
                        updateData.allowedCategories = ["young"];
                    } else if (teacherType === "middle") {
                        updateData.allowedCategories = ["middle"];
                    } else if (teacherType === "senior") {
                        updateData.allowedCategories = ["senior"];
                    } else if (teacherType === "middle-senior") {
                        updateData.allowedCategories = ["middle", "senior"];
                    } else if (teacherType === "all") {
                        updateData.allowedCategories = ["young", "middle", "senior"];
                    }
                }
            }

            if (allowedCategories !== undefined) {
                updateData.allowedCategories = allowedCategories;
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
        const { databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);
        const Group = getSchoolGroupModel(databaseName);

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
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);
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
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);
        const Group = getSchoolGroupModel(databaseName);

        const users = await User.find()
            .select('fullName role email phone position category teacherType group children')
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
        const { databaseName } = req.query;
        const { fullName, phone, email, jobPosition, dateOfBirth } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);

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
        const { databaseName } = req.query;
        const { childId } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);
        const Group = getSchoolGroupModel(databaseName);

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
        const { databaseName } = req.query;
        const { childId } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);

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
        const { databaseName } = req.query;
        const { parentId } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);
        const Group = getSchoolGroupModel(databaseName);

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
        const { databaseName } = req.query;
        const { parentId } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);
        const Group = getSchoolGroupModel(databaseName);

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

// СТАТИСТИКА КОРИСТУВАЧІВ
router.get('/stats', async (req, res) => {
    try {
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);

        const totalUsers = await User.countDocuments();
        const students = await User.countDocuments({ role: 'student' });
        const teachers = await User.countDocuments({ role: 'teacher' });
        const parents = await User.countDocuments({ role: 'parent' });

        const teachersWithSubjects = await User.find(
            { role: 'teacher' },
            'positions position teacherType'
        );

        const allSubjects = teachersWithSubjects.flatMap(teacher => {
            if (teacher.positions && teacher.positions.length > 0) {
                return teacher.positions;
            }
            return teacher.position ? [teacher.position] : [];
        });

        const uniqueSubjects = [...new Set(allSubjects.filter(Boolean))];

        const teacherTypes = {
            young: await User.countDocuments({ role: 'teacher', teacherType: 'young' }),
            middle: await User.countDocuments({ role: 'teacher', teacherType: 'middle' }),
            senior: await User.countDocuments({ role: 'teacher', teacherType: 'senior' }),
            'middle-senior': await User.countDocuments({ role: 'teacher', teacherType: 'middle-senior' }),
            all: await User.countDocuments({ role: 'teacher', teacherType: 'all' }),
            undefined: await User.countDocuments({ role: 'teacher', teacherType: { $exists: false } })
        };

        res.json({
            totalUsers,
            students,
            teachers,
            parents,
            subjects: uniqueSubjects.length,
            teacherTypes
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
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);

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

// ОНОВИТИ ТІЛЬКО ТИП ВИКЛАДАЧА
router.put('/teacher/:id/type', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName, teacherType } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);

        const teacher = await User.findById(id);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(404).json({ error: 'Викладача не знайдено' });
        }

        // Валідація teacherType
        const validTeacherTypes = ['young', 'middle', 'senior', 'middle-senior', 'all'];
        if (teacherType && !validTeacherTypes.includes(teacherType)) {
            return res.status(400).json({
                error: 'Невірний тип викладача',
                validTypes: validTeacherTypes
            });
        }

        let allowedCategories = teacher.allowedCategories || [];

        // Автоматично генеруємо allowedCategories на основі teacherType
        if (teacherType === "young") {
            allowedCategories = ["young"];
        } else if (teacherType === "middle") {
            allowedCategories = ["middle"];
        } else if (teacherType === "senior") {
            allowedCategories = ["senior"];
        } else if (teacherType === "middle-senior") {
            allowedCategories = ["middle", "senior"];
        } else if (teacherType === "all") {
            allowedCategories = ["young", "middle", "senior"];
        }

        const updatedTeacher = await User.findByIdAndUpdate(
            id,
            {
                teacherType: teacherType || null,
                allowedCategories
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            message: 'Тип викладача успішно оновлено',
            teacher: updatedTeacher
        });
    } catch (err) {
        console.error('Помилка оновлення типу викладача:', err);
        res.status(400).json({ error: err.message });
    }
});

// ОНОВИТИ ДОЗВОЛЕНІ КАТЕГОРІЇ ВИКЛАДАЧА
router.put('/teacher/:id/allowed-categories', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName, allowedCategories } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const User = getSchoolUserModel(databaseName);

        const teacher = await User.findById(id);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(404).json({ error: 'Викладача не знайдено' });
        }

        const validCategories = ['young', 'middle', 'senior'];
        if (allowedCategories && Array.isArray(allowedCategories)) {
            for (const category of allowedCategories) {
                if (!validCategories.includes(category)) {
                    return res.status(400).json({
                        error: `Невірна категорія: ${category}`,
                        validCategories: validCategories
                    });
                }
            }
        }

        const updatedTeacher = await User.findByIdAndUpdate(
            id,
            { allowedCategories: allowedCategories || [] },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            message: 'Дозволені категорії успішно оновлено',
            teacher: updatedTeacher
        });
    } catch (err) {
        console.error('Помилка оновлення дозволених категорій:', err);
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;