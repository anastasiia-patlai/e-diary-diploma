const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');

// ОТРИМАТИ ВСІ АУДИТОРІЇ
router.get('/', async (req, res) => {
    try {
        const classrooms = await Classroom.find().sort({ name: 1 });
        res.json(classrooms);
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        res.status(500).json({
            message: 'Помилка при отриманні аудиторій',
            error: error.message
        });
    }
});

// СТВОРИТИ НОВУ АУДИТОРІЮЙ
router.post('/', async (req, res) => {
    try {
        const classroomData = req.body;

        const existingClassroom = await Classroom.findOne({
            name: classroomData.name
        });
        if (existingClassroom) {
            return res.status(400).json({
                message: 'Аудиторія з такою назвою вже існує'
            });
        }

        const classroom = new Classroom(classroomData);
        const savedClassroom = await classroom.save();

        res.status(201).json(savedClassroom);
    } catch (error) {
        console.error('Error creating classroom:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Невірні дані аудиторії',
                error: error.message
            });
        }
        res.status(500).json({
            message: 'Помилка при створенні аудиторії',
            error: error.message
        });
    }
});

// ОНОВИТИ АУДИТОРІЮ
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.name) {
            const existingClassroom = await Classroom.findOne({
                name: updateData.name,
                _id: { $ne: id }
            });
            if (existingClassroom) {
                return res.status(400).json({
                    message: 'Аудиторія з такою назвою вже існує'
                });
            }
        }

        const updatedClassroom = await Classroom.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedClassroom) {
            return res.status(404).json({
                message: 'Аудиторія не знайдена'
            });
        }

        res.json(updatedClassroom);
    } catch (error) {
        console.error('Error updating classroom:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Невірні дані аудиторії',
                error: error.message
            });
        }
        res.status(500).json({
            message: 'Помилка при оновленні аудиторії',
            error: error.message
        });
    }
});

// ВИДАЛИТИ АУДИТОРІЮ
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedClassroom = await Classroom.findByIdAndDelete(id);

        if (!deletedClassroom) {
            return res.status(404).json({
                message: 'Аудиторія не знайдена'
            });
        }

        res.json({
            message: 'Аудиторія успішно видалена',
            deletedClassroom
        });
    } catch (error) {
        console.error('Error deleting classroom:', error);
        res.status(500).json({
            message: 'Помилка при видаленні аудиторії',
            error: error.message
        });
    }
});

// ПЕРЕКЛЮЧИТИ АКТИВНІСТЬ АУДИТОРІЇ
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;

        const classroom = await Classroom.findById(id);
        if (!classroom) {
            return res.status(404).json({
                message: 'Аудиторія не знайдена'
            });
        }

        classroom.isActive = !classroom.isActive;
        const updatedClassroom = await classroom.save();

        res.json(updatedClassroom);
    } catch (error) {
        console.error('Error toggling classroom:', error);
        res.status(500).json({
            message: 'Помилка при зміні статусу аудиторії',
            error: error.message
        });
    }
});

module.exports = router;