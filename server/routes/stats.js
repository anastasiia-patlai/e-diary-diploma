const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');
const Schedule = require('../models/Schedule');
const Classroom = require('../models/Classroom');

// ОТРИМАТИ СТАТИСТИКУ
router.get('/', async (req, res) => {
    try {
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalUsers = await User.countDocuments();

        const totalGroups = await Group.countDocuments();

        const totalClassrooms = await Classroom.countDocuments();

        const activeClassrooms = await Classroom.countDocuments({ isActive: true });

        const totalSchedules = await Schedule.countDocuments();

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('fullName role createdAt');

        const scheduleByDay = await Schedule.aggregate([
            {
                $group: {
                    _id: '$dayOfWeek',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const roleCounts = {};
        usersByRole.forEach(item => {
            roleCounts[item._id] = item.count;
        });

        res.json({
            users: {
                total: totalUsers,
                byRole: roleCounts,
                recent: recentUsers
            },
            groups: {
                total: totalGroups
            },
            classrooms: {
                total: totalClassrooms,
                active: activeClassrooms
            },
            schedule: {
                total: totalSchedules,
                byDay: scheduleByDay
            },
            lastUpdated: new Date()
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            message: 'Помилка при отриманні статистики',
            error: error.message
        });
    }
});

module.exports = router;