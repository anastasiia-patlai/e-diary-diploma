const express = require('express');
const router = express.Router();
const { getSchoolGroupModel, getSchoolUserModel } = require('../config/databaseManager');
const subgroupsRouter = require('./subgroups');

router.use('/subgroups', subgroupsRouter);

router.post('/', async (req, res) => {
    try {
        const { databaseName, name, curator } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Group = getSchoolGroupModel(databaseName);
        const User = getSchoolUserModel(databaseName);

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
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Group = getSchoolGroupModel(databaseName);
        const User = getSchoolUserModel(databaseName);

        const groups = await Group.find()
            .populate('curator', 'fullName email')
            .populate('students', 'fullName email')
            .populate('subgroups.students', 'fullName email'); // Додаємо популяцію студентів у підгрупах
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Group = getSchoolGroupModel(databaseName);
        const User = getSchoolUserModel(databaseName);

        const group = await Group.findById(req.params.id)
            .populate('curator', 'fullName email')
            .populate('students', 'fullName email')
            .populate('subgroups.students', 'fullName email'); // Додаємо популяцію студентів у підгрупах
        if (!group) return res.status(404).json({ error: 'Група не знайдена' });
        res.json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { databaseName, name, curator } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Group = getSchoolGroupModel(databaseName);
        const User = getSchoolUserModel(databaseName);

        const group = await Group.findByIdAndUpdate(req.params.id, { name, curator }, { new: true });
        if (!group) return res.status(404).json({ error: 'Група не знайдена' });
        res.json({ message: 'Група оновлена', group });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Group = getSchoolGroupModel(databaseName);
        const User = getSchoolUserModel(databaseName);

        const group = await Group.findByIdAndDelete(req.params.id);
        if (!group) return res.status(404).json({ error: 'Група не знайдена' });
        res.json({ message: 'Група видалена' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ДОДАТИ КУРАТОРА ДО ГРУПИ
router.put('/:id/curator', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName, curatorId } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Group = getSchoolGroupModel(databaseName);
        const User = getSchoolUserModel(databaseName);

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ error: 'Групу не знайдено' });
        }

        const teacher = await User.findById(curatorId);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(400).json({ error: 'Куратором може бути тільки викладач' });
        }

        const existingCuratorGroup = await Group.findOne({ curator: curatorId });
        if (existingCuratorGroup && existingCuratorGroup._id.toString() !== id) {
            return res.status(400).json({
                error: `Цей викладач вже є куратором групи "${existingCuratorGroup.name}". Видаліть його з тієї групи спочатку.`
            });
        }

        // ПЕРЕВІРКА: чи є у групи категорія
        const hasCategory = group.category && group.category.trim() !== '';

        // Додаємо куратора ТІЛЬКИ до групи, без автоматичного додавання до allowedCategories чи specificGroups
        // Це зменшить кількість помилок валідації
        group.curator = curatorId;
        await group.save();

        // Для зворотної сумісності: додаємо категорію тільки якщо вона існує
        if (hasCategory) {
            if (group.category === 'young') {
                // Для молодших класів: додаємо групу до specificGroups
                await User.findByIdAndUpdate(
                    curatorId,
                    {
                        $addToSet: {
                            specificGroups: {
                                group: group._id,
                                allowedSubjects: teacher.positions || []
                            }
                        }
                    }
                );
            } else {
                // Для середніх/старших: додаємо категорію до allowedCategories
                await User.findByIdAndUpdate(
                    curatorId,
                    { $addToSet: { allowedCategories: group.category } }
                );
            }
        }

        const updatedGroup = await Group.findById(id)
            .populate('curator', 'fullName email phone position allowedCategories specificGroups')
            .populate('students', 'fullName email phone dateOfBirth')
            .populate('subgroups.students', 'fullName email phone dateOfBirth'); // Додаємо популяцію

        res.json({
            message: 'Куратора успішно додано',
            group: updatedGroup,
            note: hasCategory ? `Куратор доданий з категорією: ${group.category}` : 'Куратор доданий без категорії'
        });
    } catch (err) {
        console.error('Помилка додавання куратора:', err);

        // Більш інформативні повідомлення про помилки валідації
        if (err.name === 'ValidationError') {
            const validationErrors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                error: 'Помилка валідації',
                details: validationErrors,
                message: 'Будь ласка, перевірте дані групи'
            });
        }

        if (err.code === 11000) {
            return res.status(400).json({
                error: 'Цей викладач вже є куратором іншої групи'
            });
        }

        res.status(400).json({
            error: err.message,
            type: err.name
        });
    }
});

// ВИДАЛИТИ КУРАТОРА З ГРУПИ
router.delete('/:id/curator', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Group = getSchoolGroupModel(databaseName);
        const User = getSchoolUserModel(databaseName);

        console.log("Видалення куратора з групи ID:", id);

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ error: 'Групу не знайдено' });
        }

        const curatorId = group.curator;

        // 1. Оновлюємо групу (видаляємо куратора)
        const updatedGroup = await Group.findByIdAndUpdate(
            id,
            { $set: { curator: null } },
            { new: true, runValidators: true }
        ).populate('students', 'fullName email phone dateOfBirth')
            .populate('subgroups.students', 'fullName email phone dateOfBirth'); // Додаємо популяцію

        // 2. Оновлюємо вчителя
        if (curatorId) {
            // Якщо група молодшої категорії, видаляємо її з specificGroups
            if (group.category === 'young') {
                await User.findByIdAndUpdate(
                    curatorId,
                    { $pull: { specificGroups: { group: group._id } } }
                );
                console.log(`Групу ${group.name} видалено з specificGroups викладача ${curatorId}`);
            }
            // Для середніх/старших категорій перевіряємо, чи потрібно видаляти категорію
            else {
                const otherGroupsWithSameCategory = await Group.find({
                    curator: curatorId,
                    category: group.category,
                    _id: { $ne: id }
                });

                if (otherGroupsWithSameCategory.length === 0) {
                    await User.findByIdAndUpdate(
                        curatorId,
                        { $pull: { allowedCategories: group.category } }
                    );
                    console.log(`Категорію ${group.category} видалено з дозволених для викладача ${curatorId}`);
                }
            }
        }

        console.log("Куратор успішно видалений, оновлена група:", updatedGroup);

        res.json({
            message: 'Куратора успішно видалено',
            group: updatedGroup
        });
    } catch (err) {
        console.error('Детальна помилка видалення куратора:', err);
        console.log('Код помилки:', err.code);
        console.log('Повідомлення помилки:', err.message);

        res.status(400).json({
            error: err.message,
            code: err.code
        });
    }
});

// ПЕРЕВІРИТИ, ЧИ МОЖЕ ВЧИТЕЛЬ ВИКЛАДАТИ В ГРУПІ
router.post('/:teacherId/can-teach-in-group', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { databaseName, groupId, subject } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Group = getSchoolGroupModel(databaseName);
        const User = getSchoolUserModel(databaseName);

        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(400).json({ error: 'Користувач не є викладачем' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Групу не знайдено' });
        }

        // Перевіряємо, чи вчитель взагалі викладає цей предмет
        const teachesSubject = teacher.positions && teacher.positions.includes(subject);
        if (!teachesSubject) {
            return res.json({
                canTeach: false,
                reason: `Викладач не викладає предмет "${subject}"`,
                teacher: {
                    _id: teacher._id,
                    fullName: teacher.fullName,
                    positions: teacher.positions || []
                }
            });
        }

        let canTeach = false;
        let reason = '';

        // 1. Перевіряємо, чи вчитель є куратором цієї групи
        if (group.curator && group.curator.toString() === teacherId) {
            // Куратор може викладати у своїй групі
            canTeach = true;
            reason = 'Вчитель є куратором цієї групи';
        }
        // 2. Перевіряємо, чи є група у specificGroups (для кураторів молодших класів)
        else if (teacher.specificGroups && teacher.specificGroups.length > 0) {
            const canTeachInSpecificGroup = teacher.specificGroups.some(sg =>
                sg.group.toString() === groupId &&
                (!sg.allowedSubjects || sg.allowedSubjects.length === 0 || sg.allowedSubjects.includes(subject))
            );

            if (canTeachInSpecificGroup) {
                canTeach = true;
                reason = 'Група є у списку дозволених для викладача';
            } else {
                canTeach = false;
                reason = 'Вчитель може викладати тільки у призначених йому групах';
            }
        }
        // 3. Перевіряємо allowedCategories (для звичайних вчителів)
        else if (teacher.allowedCategories && teacher.allowedCategories.includes(group.category)) {
            canTeach = true;
            reason = `Вчитель має дозвіл на викладання у категорії "${group.category}"`;
        } else {
            canTeach = false;
            reason = `Вчитель не має дозволу на викладання у категорії "${group.category}"`;
        }

        res.json({
            canTeach,
            reason,
            teacher: {
                _id: teacher._id,
                fullName: teacher.fullName,
                allowedCategories: teacher.allowedCategories || [],
                specificGroups: teacher.specificGroups || [],
                isCurator: group.curator && group.curator.toString() === teacherId
            },
            group: {
                _id: group._id,
                name: group.name,
                category: group.category,
                gradeLevel: group.gradeLevel
            }
        });
    } catch (err) {
        console.error('Помилка перевірки:', err);
        res.status(400).json({ error: err.message });
    }
});

// ОТРИМАТИ ГРУПИ, ДЕ МОЖЕ ВИКЛАДАТИ ВЧИТЕЛЬ
router.get('/teacher/:teacherId/available-groups', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { databaseName, subject } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Group = getSchoolGroupModel(databaseName);
        const User = getSchoolUserModel(databaseName);

        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(400).json({ error: 'Користувач не є викладачем' });
        }

        // Отримуємо всі групи
        const allGroups = await Group.find()
            .populate('curator', 'fullName')
            .sort({ name: 1 });

        // Фільтруємо групи, де вчитель може викладати
        const availableGroups = allGroups.filter(group => {
            // Перевіряємо, чи вчитель взагалі викладає цей предмет (якщо subject вказано)
            if (subject && (!teacher.positions || !teacher.positions.includes(subject))) {
                return false;
            }

            // 1. Якщо вчитель - куратор цієї групи
            if (group.curator && group.curator._id.toString() === teacherId) {
                return true;
            }

            // 2. Перевіряємо specificGroups
            if (teacher.specificGroups && teacher.specificGroups.length > 0) {
                const specificGroup = teacher.specificGroups.find(sg =>
                    sg.group.toString() === group._id.toString()
                );

                if (specificGroup) {
                    // Перевіряємо, чи дозволений предмет (якщо subject вказано)
                    if (subject) {
                        return !specificGroup.allowedSubjects ||
                            specificGroup.allowedSubjects.length === 0 ||
                            specificGroup.allowedSubjects.includes(subject);
                    }
                    return true;
                }
            }

            // 3. Перевіряємо allowedCategories
            if (teacher.allowedCategories && teacher.allowedCategories.includes(group.category)) {
                return true;
            }

            return false;
        });

        res.json({
            teacher: {
                _id: teacher._id,
                fullName: teacher.fullName,
                positions: teacher.positions || []
            },
            availableGroups: availableGroups.map(group => ({
                _id: group._id,
                name: group.name,
                category: group.category,
                gradeLevel: group.gradeLevel,
                curator: group.curator,
                studentCount: group.students ? group.students.length : 0
            }))
        });
    } catch (err) {
        console.error('Помилка отримання доступних груп:', err);
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;