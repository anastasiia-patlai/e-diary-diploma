const express = require('express');
const router = express.Router();
const TimeSlot = require('../models/TimeTab');

// ОТРИМАТИ ЧАСОВІ СЛОТИ ЗІ ФІЛЬТРАЦІЄЮ ЗА ДНЕМ ТИЖНЯ
router.get('/', async (req, res) => {
    try {
        const { dayOfWeek } = req.query;
        let query = {};

        if (dayOfWeek) {
            query.dayOfWeek = parseInt(dayOfWeek);
        }

        const timeSlots = await TimeSlot.find(query).sort({ dayOfWeek: 1, order: 1 });
        res.json(timeSlots);
    } catch (error) {
        console.error('Error fetching time slots:', error);
        res.status(500).json({
            message: 'Помилка при отриманні часу уроків',
            error: error.message
        });
    }
});

// ЗБЕРЕГТИ ЧАСОВІ СЛОТИ ДЛЯ ДНЯ
router.post('/', async (req, res) => {
    try {
        const { dayOfWeek, timeSlots } = req.body;

        if (!dayOfWeek || dayOfWeek < 1 || dayOfWeek > 5) {
            return res.status(400).json({
                message: 'Невірний день тижня'
            });
        }

        if (!timeSlots || !Array.isArray(timeSlots)) {
            return res.status(400).json({
                message: 'Невірний формат даних'
            });
        }

        for (let i = 0; i < timeSlots.length; i++) {
            const slot = timeSlots[i];
            if (!slot.order || !slot.startTime || !slot.endTime) {
                return res.status(400).json({
                    message: `Урок ${i + 1} має неповні дані`
                });
            }
        }

        await TimeSlot.deleteMany({ dayOfWeek });

        const slotsWithDay = timeSlots.map(slot => ({
            ...slot,
            dayOfWeek
        }));

        const savedTimeSlots = await TimeSlot.insertMany(slotsWithDay);

        res.status(201).json(savedTimeSlots);
    } catch (error) {
        console.error('Error saving time slots:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Дублювання порядку уроків для цього дня'
            });
        }
        res.status(500).json({
            message: 'Помилка при збереженні часу уроків',
            error: error.message
        });
    }
});

// ВИДАЛИТИ ЧАСОВИЙ СЛОТ
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSlot = await TimeSlot.findByIdAndDelete(id);

        if (!deletedSlot) {
            return res.status(404).json({
                message: 'Часовий слот не знайдено'
            });
        }

        res.json({
            message: 'Часовий слот успішно видалено',
            deletedSlot
        });
    } catch (error) {
        console.error('Error deleting time slot:', error);
        res.status(500).json({
            message: 'Помилка при видаленні часового слоту',
            error: error.message
        });
    }
});

// ПЕРЕМИКАННЯ СТАТУСУ АКТИВНОСТІ ЧАСОВОГО СЛОТУ
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;

        const timeSlot = await TimeSlot.findById(id);
        if (!timeSlot) {
            return res.status(404).json({
                message: 'Часовий слот не знайдено'
            });
        }

        timeSlot.isActive = !timeSlot.isActive;
        const updatedTimeSlot = await timeSlot.save();

        res.json(updatedTimeSlot);
    } catch (error) {
        console.error('Error toggling time slot:', error);
        res.status(500).json({
            message: 'Помилка при зміні статусу часового слоту',
            error: error.message
        });
    }
});

// ОТРИМАТИ РЕЗЮМЕ ПО ДНЯХ
router.get('/days/summary', async (req, res) => {
    try {
        const summary = await TimeSlot.aggregate([
            {
                $group: {
                    _id: '$dayOfWeek',
                    count: { $sum: 1 },
                    activeCount: {
                        $sum: { $cond: ['$isActive', 1, 0] }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json(summary);
    } catch (error) {
        console.error('Error fetching days summary:', error);
        res.status(500).json({
            message: 'Помилка при отриманні резюме днів',
            error: error.message
        });
    }
});

module.exports = router;