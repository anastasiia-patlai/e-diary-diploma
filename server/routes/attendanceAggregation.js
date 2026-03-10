const express = require('express');
const router = express.Router();
const { getSchoolDBConnection } = require('../config/databaseManager');

// Агрегація денної відвідуваності
router.post('/aggregate-daily', async (req, res) => {
    try {
        const { databaseName, groupId, date } = req.body;

        console.log('Агрегація для:', { databaseName, groupId, date });

        const connection = getSchoolDBConnection(databaseName);
        const LessonAttendance = require('../models/LessonAttendance')(connection);
        const ClassAttendance = require('../models/ClassAttendance')(connection);
        const Schedule = connection.models.Schedule;
        const DayOfWeek = connection.models.DayOfWeek;
        const Quarter = connection.models.Quarter;

        // Отримуємо активну чверть для цієї дати
        const activeQuarter = await Quarter.findOne({
            startDate: { $lte: new Date(date) },
            endDate: { $gte: new Date(date) }
        });

        if (!activeQuarter) {
            console.log('Не знайдено активної чверті для дати:', date);
            return res.status(404).json({ error: 'Не знайдено активної чверті для вказаної дати' });
        }

        console.log('Знайдено чверть:', activeQuarter._id);

        // Отримуємо день тижня з дати (1-7, де 1 = понеділок)
        const dateObj = new Date(date);
        const jsDayOfWeek = dateObj.getDay(); // 0 = неділя, 1 = понеділок, ..., 6 = субота
        const dbDayOfWeekNumber = jsDayOfWeek === 0 ? 7 : jsDayOfWeek;

        console.log('День тижня:', { jsDayOfWeek, dbDayOfWeekNumber });

        // Отримуємо ObjectId дня тижня за його номером
        const dayOfWeekDoc = await DayOfWeek.findOne({ id: dbDayOfWeekNumber });

        if (!dayOfWeekDoc) {
            console.log('День тижня не знайдено в БД');
            return res.status(404).json({ error: 'День тижня не знайдено' });
        }

        console.log('Знайдено день тижня:', dayOfWeekDoc._id);

        // Отримуємо всі розклади для групи на цей день тижня
        const schedules = await Schedule.find({
            group: groupId,
            dayOfWeek: dayOfWeekDoc._id
        }).populate('timeSlot');

        const totalLessons = schedules.length;
        console.log(`Знайдено ${totalLessons} уроків для групи`);

        if (totalLessons === 0) {
            return res.json({
                message: 'Немає уроків у розкладі на цей день',
                totalLessons: 0
            });
        }

        // Отримуємо всі записи відвідуваності з уроків
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const lessonAttendances = await LessonAttendance.find({
            schedule: { $in: schedules.map(s => s._id) },
            date: { $gte: startDate, $lte: endDate }
        }).populate('records.student');

        console.log(`Знайдено ${lessonAttendances.length} записів відвідуваності`);

        // Групуємо по студентах
        const studentAttendance = {};

        lessonAttendances.forEach(record => {
            record.records.forEach(r => {
                const studentId = r.student._id.toString();

                if (!studentAttendance[studentId]) {
                    studentAttendance[studentId] = {
                        lessonsAbsent: 0,
                        lessonDetails: []
                    };
                }

                if (r.status === 'absent') {
                    studentAttendance[studentId].lessonsAbsent++;

                    const schedule = schedules.find(s => s._id.toString() === record.schedule.toString());

                    studentAttendance[studentId].lessonDetails.push({
                        scheduleId: record.schedule,
                        subject: schedule?.subject || 'Невідомо',
                        timeSlot: schedule?.timeSlot ? {
                            startTime: schedule.timeSlot.startTime,
                            endTime: schedule.timeSlot.endTime
                        } : null,
                        status: 'absent',
                        reason: r.reason || ''
                    });
                }
            });
        });

        console.log(`Знайдено дані для ${Object.keys(studentAttendance).length} студентів`);

        // Оновлюємо або створюємо записи в ClassAttendance
        const updatePromises = Object.entries(studentAttendance).map(async ([studentId, data]) => {
            const existingRecord = await ClassAttendance.findOne({
                group: groupId,
                student: studentId,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            });

            const attendanceData = {
                group: groupId,
                student: studentId,
                date: dateObj,
                quarter: activeQuarter._id,  // Додаємо quarter
                status: data.lessonsAbsent > 0 ? 'absent' : 'present',
                lessonsAbsent: data.lessonsAbsent,
                totalLessons: totalLessons,
                lessonDetails: data.lessonDetails,
                reasonType: data.lessonDetails.length > 0 ?
                    (data.lessonDetails[0].reason?.toLowerCase().includes('хвор') ? 'sick' : 'other')
                    : 'other'
            };

            if (existingRecord) {
                return ClassAttendance.findByIdAndUpdate(
                    existingRecord._id,
                    attendanceData,
                    { new: true }
                );
            } else {
                const newRecord = new ClassAttendance(attendanceData);
                return newRecord.save();
            }
        });

        await Promise.all(updatePromises);
        console.log('Агрегація завершена успішно');

        res.json({
            message: 'Агрегація виконана успішно',
            stats: {
                totalLessons,
                studentsWithAttendance: Object.keys(studentAttendance).length
            }
        });

    } catch (error) {
        console.error('Помилка агрегації:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;