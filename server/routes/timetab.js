const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const TimeTab = require('../models/TimeTab'); // Імпортуємо нову модель
const DayOfWeek = require('../models/DayOfWeek');

// ОТРИМАТИ ЧАСОВІ СЛОТИ ЗІ ФІЛЬТРАЦІЄЮ ЗА ДНЕМ ТИЖНЯ
router.get('/', async (req, res) => {
    try {
        const { dayOfWeekId } = req.query;
        let query = {};

        if (dayOfWeekId) {
            const dayOfWeek = await DayOfWeek.findOne({ id: parseInt(dayOfWeekId) });

            if (!dayOfWeek) {
                return res.status(404).json({
                    message: 'День тижня не знайдено'
                });
            }

            query.dayOfWeek = dayOfWeek._id;
        }

        const timeSlots = await TimeTab.find(query)
            .populate('dayOfWeek')
            .sort({ 'dayOfWeek.order': 1, order: 1 });

        res.json(timeSlots);
    } catch (error) {
        console.error('Error fetching time slots:', error);
        res.status(500).json({
            message: 'Помилка при отриманні часу уроків',
            error: error.message
        });
    }
});

// ЗБЕРЕГТИ ЧАСОВІ СЛОТИ ДЛЯ КОНКРЕТНОГО ДНЯ
router.post('/', async (req, res) => {
    try {
        const { dayOfWeekId, timeSlots } = req.body;

        if (!dayOfWeekId) {
            return res.status(400).json({
                message: 'ID дня тижня обов\'язковий'
            });
        }

        const dayExists = await DayOfWeek.findOne({ id: parseInt(dayOfWeekId) });
        if (!dayExists) {
            return res.status(400).json({
                message: 'День тижня не знайдено'
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

        await TimeTab.deleteMany({ dayOfWeek: dayExists._id });

        const slotsWithDay = timeSlots.map(slot => ({
            ...slot,
            dayOfWeek: dayExists._id
        }));

        const savedTimeSlots = await TimeTab.insertMany(slotsWithDay);

        const populatedSlots = await TimeTab.find({ _id: { $in: savedTimeSlots.map(s => s._id) } })
            .populate('dayOfWeek');

        res.status(201).json(populatedSlots);
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

        const deletedSlot = await TimeTab.findByIdAndDelete(id);

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

// ОТРИМАТИ РЕЗЮМЕ ПО ДНЯХ
router.get('/days/summary', async (req, res) => {
    try {
        const summary = await TimeTab.aggregate([
            {
                $group: {
                    _id: '$dayOfWeek',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'dayofweeks',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'dayInfo'
                }
            },
            {
                $unwind: '$dayInfo'
            },
            {
                $sort: { 'dayInfo.order': 1 }
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    dayName: '$dayInfo.name',
                    dayOrder: '$dayInfo.order'
                }
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