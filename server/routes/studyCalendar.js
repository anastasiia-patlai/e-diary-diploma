const express = require('express');
const router = express.Router();
const { getSchoolSemesterModel, getSchoolQuarterModel, getSchoolHolidayModel } = require('../config/databaseManager');

// ТЕСТОВИЙ РОУТ ДЛЯ ПЕРЕВІРКИ
router.get('/test-semesters', async (req, res) => {
    try {
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        console.log("Тестовий запит на семестри отримано, databaseName:", databaseName);

        const Semester = getSchoolSemesterModel(databaseName);
        const semesters = await Semester.find().sort({
            year: -1,
            name: 1
        });

        console.log("Знайдено семестрів:", semesters.length);
        res.json({
            success: true,
            count: semesters.length,
            semesters: semesters
        });
    } catch (err) {
        console.error("Помилка тестового запиту:", err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ДЛЯ СЕМЕСТРУ
router.get('/semesters', async (req, res) => {
    try {
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Semester = getSchoolSemesterModel(databaseName);
        const semesters = await Semester.find().sort({
            year: -1,
            name: 1
        });
        res.json(semesters);
    } catch (err) {
        console.error('Помилка отримання семестрів:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/semesters', async (req, res) => {
    try {
        const { name, year, startDate, endDate, isActive, databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        console.log('Отримані дані:', { name, year, startDate, endDate, isActive, databaseName });

        if (!name || !year || !startDate || !endDate) {
            return res.status(400).json({
                error: 'Всі обов\'язкові поля мають бути заповнені: назва, рік, дата початку, дата завершення'
            });
        }

        if (!/^\d{4}-\d{4}$/.test(year)) {
            return res.status(400).json({
                error: 'Некоректний формат року. Має бути: XXXX-XXXX (наприклад, 2024-2025)'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            return res.status(400).json({ error: 'Дата завершення має бути після дати початку' });
        }

        const Semester = getSchoolSemesterModel(databaseName);
        const semester = new Semester({
            name,
            year,
            startDate,
            endDate,
            isActive: isActive || false
        });

        await semester.save();
        res.status(201).json(semester);
    } catch (err) {
        console.error('Помилка створення семестру:', err);
        res.status(400).json({ error: err.message });
    }
});

router.put('/semesters/:id', async (req, res) => {
    try {
        const { name, year, startDate, endDate, isActive, databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        if (!name || !year || !startDate || !endDate) {
            return res.status(400).json({ error: 'Всі обов\'язкові поля мають бути заповнені' });
        }

        if (!/^\d{4}-\d{4}$/.test(year)) {
            return res.status(400).json({
                error: 'Некоректний формат року. Має бути: XXXX-XXXX (наприклад, 2024-2025)'
            });
        }

        const Semester = getSchoolSemesterModel(databaseName);
        const semester = await Semester.findByIdAndUpdate(
            req.params.id,
            {
                name,
                year,
                startDate,
                endDate,
                isActive: isActive || false
            },
            { new: true, runValidators: true }
        );

        if (!semester) {
            return res.status(404).json({ error: 'Семестр не знайдено' });
        }

        res.json(semester);
    } catch (err) {
        console.error('Помилка оновлення семестру:', err);
        res.status(400).json({ error: err.message });
    }
});

router.delete('/semesters/:id', async (req, res) => {
    try {
        const { databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Semester = getSchoolSemesterModel(databaseName);
        const semester = await Semester.findByIdAndDelete(req.params.id);

        if (!semester) {
            return res.status(404).json({ error: 'Семестр не знайдено' });
        }

        res.json({ message: 'Семестр видалено' });
    } catch (err) {
        console.error('Помилка видалення семестру:', err);
        res.status(500).json({ error: err.message });
    }
});

// АВТОМАТИЧНЕ ОНОВЛЕННЯ АКТИВНИХ СЕМЕСТРІВ
router.put('/semesters/auto-update', async (req, res) => {
    try {
        const { databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const now = new Date();
        const Semester = getSchoolSemesterModel(databaseName);
        const semesters = await Semester.find();

        const currentSemester = semesters.find(semester => {
            const startDate = new Date(semester.startDate);
            const endDate = new Date(semester.endDate);
            return now >= startDate && now <= endDate;
        });

        const updatePromises = [];

        semesters.forEach(semester => {
            const startDate = new Date(semester.startDate);
            const endDate = new Date(semester.endDate);
            const shouldBeActive = currentSemester && semester._id.equals(currentSemester._id);

            if (semester.isActive !== shouldBeActive) {
                updatePromises.push(
                    Semester.findByIdAndUpdate(
                        semester._id,
                        { isActive: shouldBeActive },
                        { new: true }
                    )
                );
            }
        });

        await Promise.all(updatePromises);

        const updatedSemesters = await Semester.find().sort({ startDate: -1 });
        res.json({
            message: 'Статуси семестрів оновлено',
            currentDate: now,
            activeSemester: currentSemester,
            semesters: updatedSemesters
        });
    } catch (err) {
        console.error('Помилка автоматичного оновлення семестрів:', err);
        res.status(500).json({ error: err.message });
    }
});

// ДЛЯ ЧВЕРТЕЙ
router.get('/quarters', async (req, res) => {
    try {
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Quarter = getSchoolQuarterModel(databaseName);
        const Semester = getSchoolSemesterModel(databaseName);

        const quarters = await Quarter.find()
            .populate('semester')
            .sort({ startDate: 1 });
        res.json(quarters);
    } catch (err) {
        console.error('Помилка отримання чвертей:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/quarters', async (req, res) => {
    try {
        const { databaseName, ...quarterData } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Quarter = getSchoolQuarterModel(databaseName);
        const Semester = getSchoolSemesterModel(databaseName);

        const quarter = new Quarter(quarterData);
        await quarter.save();
        await quarter.populate('semester');
        res.status(201).json(quarter);
    } catch (err) {
        console.error('Помилка створення чверті:', err);
        res.status(400).json({ error: err.message });
    }
});

router.put('/quarters/:id', async (req, res) => {
    try {
        const { databaseName, ...updateData } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Quarter = getSchoolQuarterModel(databaseName);
        const Semester = getSchoolSemesterModel(databaseName);

        const quarter = await Quarter.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('semester');

        res.json(quarter);
    } catch (err) {
        console.error('Помилка оновлення чверті:', err);
        res.status(400).json({ error: err.message });
    }
});

router.delete('/quarters/:id', async (req, res) => {
    try {
        const { databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Quarter = getSchoolQuarterModel(databaseName);
        await Quarter.findByIdAndDelete(req.params.id);
        res.json({ message: 'Чверть видалено' });
    } catch (err) {
        console.error('Помилка видалення чверті:', err);
        res.status(500).json({ error: err.message });
    }
});

// ДЛЯ КАНІКУЛ
router.get('/holidays', async (req, res) => {
    try {
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Holiday = getSchoolHolidayModel(databaseName);
        const Quarter = getSchoolQuarterModel(databaseName);
        const Semester = getSchoolSemesterModel(databaseName);

        const holidays = await Holiday.find()
            .populate({
                path: 'quarter',
                populate: {
                    path: 'semester',
                    model: 'Semester'
                }
            })
            .sort({ startDate: 1 });
        res.json(holidays);
    } catch (err) {
        console.error('Помилка отримання канікул:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/holidays', async (req, res) => {
    try {
        const { databaseName, ...holidayData } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Holiday = getSchoolHolidayModel(databaseName);
        const Quarter = getSchoolQuarterModel(databaseName);

        const holiday = new Holiday(holidayData);
        await holiday.save();
        await holiday.populate('quarter');
        res.status(201).json(holiday);
    } catch (err) {
        console.error('Помилка створення канікул:', err);
        res.status(400).json({ error: err.message });
    }
});

router.put('/holidays/:id', async (req, res) => {
    try {
        const { databaseName, ...updateData } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Holiday = getSchoolHolidayModel(databaseName);
        const Quarter = getSchoolQuarterModel(databaseName);

        const holiday = await Holiday.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('quarter');

        res.json(holiday);
    } catch (err) {
        console.error('Помилка оновлення канікул:', err);
        res.status(400).json({ error: err.message });
    }
});

router.delete('/holidays/:id', async (req, res) => {
    try {
        const { databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Holiday = getSchoolHolidayModel(databaseName);
        await Holiday.findByIdAndDelete(req.params.id);
        res.json({ message: 'Канікули видалено' });
    } catch (err) {
        console.error('Помилка видалення канікул:', err);
        res.status(500).json({ error: err.message });
    }
});

// СИНХРОНІЗАЦІЯ ЧВЕРТЕЙ ПРИ АКТИВАЦІЇ/ДЕАКТИВАЦІЇ СЕМЕСТРУ
router.put('/semesters/:id/sync-quarters', async (req, res) => {
    try {
        const { databaseName } = req.body;
        const semesterId = req.params.id;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Semester = getSchoolSemesterModel(databaseName);
        const Quarter = getSchoolQuarterModel(databaseName);

        const semester = await Semester.findById(semesterId);

        if (!semester) {
            return res.status(404).json({ error: 'Семестр не знайдено' });
        }

        // Оновлюємо всі чверті цього семестру
        await Quarter.updateMany(
            { semester: semesterId },
            { isActive: semester.isActive }
        );

        res.json({
            message: `Чверті семестру синхронізовано зі статусом: ${semester.isActive ? 'активний' : 'неактивний'}`,
            semester: semester
        });
    } catch (err) {
        console.error('Помилка синхронізації чвертей:', err);
        res.status(500).json({ error: err.message });
    }
});

// ДЕАКТИВАЦІЯ ВСІХ ЧВЕРТЕЙ
router.put('/quarters/deactivate-all', async (req, res) => {
    try {
        const { databaseName } = req.body;

        if (!databaseName) {
            return res.status(400).json({ error: 'Не вказано databaseName' });
        }

        const Quarter = getSchoolQuarterModel(databaseName);
        await Quarter.updateMany(
            { isActive: true },
            { isActive: false }
        );

        res.json({ message: 'Всі чверті деактивовано' });
    } catch (err) {
        console.error('Помилка деактивації всіх чвертей:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;