const express = require('express');
const router = express.Router();
const { getSchoolGroupModel, getSchoolUserModel } = require('../config/databaseManager');

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
            .populate('students', 'fullName email');
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
            .populate('students', 'fullName email');
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

        group.curator = curatorId;
        await group.save();

        const updatedGroup = await Group.findById(id)
            .populate('curator', 'fullName email phone position')
            .populate('students', 'fullName email phone dateOfBirth');

        res.json({
            message: 'Куратора успішно додано',
            group: updatedGroup
        });
    } catch (err) {
        console.error('Помилка додавання куратора:', err);

        if (err.code === 11000) {
            return res.status(400).json({
                error: 'Цей викладач вже є куратором іншої групи'
            });
        }

        res.status(400).json({ error: err.message });
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

        console.log("Видалення куратора з групи ID:", id);

        const updatedGroup = await Group.findByIdAndUpdate(
            id,
            { $set: { curator: null } },
            { new: true, runValidators: true }
        ).populate('students', 'fullName email phone dateOfBirth');

        if (!updatedGroup) {
            return res.status(404).json({ error: 'Групу не знайдено' });
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

module.exports = router;