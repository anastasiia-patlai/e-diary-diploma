const express = require('express');
const router = express.Router();
const { getSchoolGroupModel, getSchoolUserModel } = require('../config/databaseManager');

// Створити підгрупи
router.post('/create-subgroups', async (req, res) => {
    try {
        const { databaseName, groupId, numberOfSubgroups } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        if (!groupId) {
            return res.status(400).json({ error: 'Не вказано ID групи' });
        }

        if (!numberOfSubgroups || numberOfSubgroups < 1 || numberOfSubgroups > 3) {
            return res.status(400).json({ error: 'Кількість підгруп має бути від 1 до 3' });
        }

        const Group = getSchoolGroupModel(databaseName);
        const User = getSchoolUserModel(databaseName);

        // Знаходимо групу з студентами
        const group = await Group.findById(groupId).populate('students');
        if (!group) {
            return res.status(404).json({ error: 'Групу не знайдено' });
        }

        const students = group.students || [];
        const totalStudents = students.length;

        if (totalStudents === 0) {
            return res.status(400).json({ error: 'У групі немає студентів' });
        }

        // Розраховуємо розподіл студентів
        const baseSize = Math.floor(totalStudents / numberOfSubgroups);
        const remainder = totalStudents % numberOfSubgroups;

        // Створюємо підгрупи
        const subgroups = [];
        let studentIndex = 0;

        for (let i = 0; i < numberOfSubgroups; i++) {
            const subgroupSize = i < remainder ? baseSize + 1 : baseSize;
            const subgroupStudents = students.slice(studentIndex, studentIndex + subgroupSize);

            const subgroup = {
                name: `${group.name}/${i + 1}`,
                students: subgroupStudents.map(s => s._id),
                order: i + 1
            };

            subgroups.push(subgroup);
            studentIndex += subgroupSize;
        }

        // Оновлюємо групу з підгрупами
        group.hasSubgroups = true;
        group.subgroups = subgroups;
        group.subgroupSettings = {
            numberOfSubgroups,
            autoDistributed: true
        };

        await group.save();

        // Отримуємо оновлену групу з популяцією
        const updatedGroup = await Group.findById(groupId)
            .populate('curator', 'fullName email')
            .populate({
                path: 'subgroups.students',
                select: 'fullName email phone dateOfBirth'
            });

        res.json({
            message: `Успішно створено ${numberOfSubgroups} підгруп`,
            group: updatedGroup,
            distribution: subgroups.map((sg, idx) => ({
                name: sg.name,
                studentCount: sg.students.length
            }))
        });
    } catch (err) {
        console.error('Помилка створення підгруп:', err);
        res.status(500).json({ error: err.message });
    }
});

// Видалити підгрупи
router.post('/remove-subgroups', async (req, res) => {
    try {
        const { databaseName, groupId } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        if (!groupId) {
            return res.status(400).json({ error: 'Не вказано ID групи' });
        }

        const Group = getSchoolGroupModel(databaseName);

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Групу не знайдено' });
        }

        // Повертаємо всіх студентів назад в основну групу
        if (group.hasSubgroups && group.subgroups && group.subgroups.length > 0) {
            const allStudentIds = group.subgroups.flatMap(subgroup => subgroup.students);
            group.students = allStudentIds;
        }

        // Очищаємо підгрупи
        group.hasSubgroups = false;
        group.subgroups = [];
        group.subgroupSettings = {
            numberOfSubgroups: 1,
            autoDistributed: false
        };

        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate('curator', 'fullName email')
            .populate('students', 'fullName email phone dateOfBirth');

        res.json({
            message: 'Підгрупи видалено',
            group: updatedGroup
        });
    } catch (err) {
        console.error('Помилка видалення підгруп:', err);
        res.status(500).json({ error: err.message });
    }
});

// Отримати інформацію про розподіл студентів
router.get('/distribution-info/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { databaseName, numberOfSubgroups } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        if (!groupId) {
            return res.status(400).json({ error: 'Не вказано ID групи' });
        }

        const numSubgroups = parseInt(numberOfSubgroups) || 2;
        if (numSubgroups < 1 || numSubgroups > 3) {
            return res.status(400).json({ error: 'Кількість підгруп має бути від 1 до 3' });
        }

        const Group = getSchoolGroupModel(databaseName);
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Групу не знайдено' });
        }

        const totalStudents = group.students ? group.students.length : 0;
        const baseSize = Math.floor(totalStudents / numSubgroups);
        const remainder = totalStudents % numSubgroups;

        const distribution = [];
        for (let i = 0; i < numSubgroups; i++) {
            const size = i < remainder ? baseSize + 1 : baseSize;
            distribution.push({
                subgroupNumber: i + 1,
                subgroupName: `${group.name}/${i + 1}`,
                studentCount: size
            });
        }

        res.json({
            group: {
                _id: group._id,
                name: group.name,
                totalStudents
            },
            numberOfSubgroups: numSubgroups,
            distribution,
            hasSubgroups: group.hasSubgroups || false
        });
    } catch (err) {
        console.error('Помилка отримання інформації про розподіл:', err);
        res.status(500).json({ error: err.message });
    }
});

// Перемістити студента між підгрупами
router.post('/move-student', async (req, res) => {
    try {
        const { databaseName, groupId, studentId, fromSubgroupId, toSubgroupId } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Group = getSchoolGroupModel(databaseName);

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Групу не знайдено' });
        }

        if (!group.hasSubgroups || !group.subgroups) {
            return res.status(400).json({ error: 'Група не має підгруп' });
        }

        // Знаходимо підгрупи
        const fromSubgroup = group.subgroups.id(fromSubgroupId);
        const toSubgroup = group.subgroups.id(toSubgroupId);

        if (!fromSubgroup || !toSubgroup) {
            return res.status(404).json({ error: 'Підгрупу не знайдено' });
        }

        // Перевіряємо, чи студент є в початковій підгрупі
        const studentIndex = fromSubgroup.students.indexOf(studentId);
        if (studentIndex === -1) {
            return res.status(400).json({ error: 'Студента не знайдено в початковій підгрупі' });
        }

        // Видаляємо студента з початкової підгрупи
        fromSubgroup.students.splice(studentIndex, 1);

        // Додаємо студента до нової підгрупи
        toSubgroup.students.push(studentId);

        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate({
                path: 'subgroups.students',
                select: 'fullName email phone dateOfBirth'
            });

        res.json({
            message: 'Студента успішно переміщено',
            group: updatedGroup
        });
    } catch (err) {
        console.error('Помилка переміщення студента:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;