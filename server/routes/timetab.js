const express = require('express');
const router = express.Router();
const TimeSlot = require('../models/TimeTab');

// Отримати всі часові слоти
router.get('/', async (req, res) => {
    try {
        const timeSlots = await TimeSlot.find().sort({ order: 1 });
        res.json(timeSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Зберегти часові слоти
router.post('/', async (req, res) => {
    try {
        const { timeSlots } = req.body;

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

        await TimeSlot.deleteMany({});

        const savedTimeSlots = await TimeSlot.insertMany(timeSlots);

        res.status(201).json(savedTimeSlots);
    } catch (error) {
        console.error('Error saving time slots:', error);
        res.status(500).json({
            message: 'Помилка при збереженні часу уроків',
            error: error.message
        });
    }
});

// Видалити часовий слот
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



module.exports = router;