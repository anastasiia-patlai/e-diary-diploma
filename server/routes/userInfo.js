const express = require('express');
const router = express.Router();
const { getSchoolUserModel } = require('../config/databaseManager');

// ОТРИМАННЯ ІНФОРМАЦІЇ ПРО ПОТОЧНОГО КОРИСТУВАЧА
router.get('/me', async (req, res) => {
    try {
        const { databaseName, userId } = req.query;

        console.log('Запит на отримання даних користувача:', { databaseName, userId });

        if (!databaseName || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Необхідно вказати databaseName та userId'
            });
        }

        const User = getSchoolUserModel(databaseName);

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Користувача не знайдено'
            });
        }

        console.log('Користувач знайдений:', user.fullName);

        const userResponse = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            position: user.position,
            positions: user.positions || [],
            birthDate: user.birthDate,
            children: user.children || [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.json({
            success: true,
            user: userResponse
        });

    } catch (error) {
        console.error('Помилка при отриманні інформації користувача:', error);
        res.status(500).json({
            success: false,
            message: 'Помилка сервера при отриманні інформації користувача',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Внутрішня помилка сервера'
        });
    }
});

// ОНОВЛЕННЯ ІНФОРМАЦІЇ ПРО ПОТОЧНОГО КОРИСТУВАЧА
router.put('/me', async (req, res) => {
    try {
        const { databaseName, userId } = req.query;
        const updateData = req.body;

        console.log('Запит на оновлення даних користувача:', { databaseName, userId, updateData });

        if (!databaseName || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Необхідно вказати databaseName та userId'
            });
        }

        delete updateData.password;
        delete updateData._id;
        delete updateData.role;

        const User = getSchoolUserModel(databaseName);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Користувача не знайдено'
            });
        }

        res.json({
            success: true,
            message: 'Дані успішно оновлено',
            user: updatedUser
        });

    } catch (error) {
        console.error('Помилка при оновленні інформації користувача:', error);
        res.status(500).json({
            success: false,
            message: 'Помилка сервера при оновленні інформації користувача',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Внутрішня помилка сервера'
        });
    }
});

// ОТРИМАННЯ СПИСКУ ВСІХ КОРИСТУВАЧІВ НАВЧАЛЬНОГО ЗАКЛАДУ
router.get('/all', async (req, res) => {
    try {
        const { databaseName } = req.query;

        if (!databaseName) {
            return res.status(400).json({
                success: false,
                message: 'Необхідно вказати databaseName'
            });
        }

        const User = getSchoolUserModel(databaseName);
        const users = await User.find({}).select('-password');

        res.json({
            success: true,
            users: users
        });

    } catch (error) {
        console.error('Помилка при отриманні списку користувачів:', error);
        res.status(500).json({
            success: false,
            message: 'Помилка сервера при отриманні списку користувачів',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Внутрішня помилка сервера'
        });
    }
});

module.exports = router;