const express = require('express');
const router = express.Router();
const { getSchoolDBConnection } = require('../config/databaseManager');

router.post('/aggregate-daily', async (req, res) => {
    try {
        const { databaseName, groupId, date } = req.body;

        console.log('\n=== АГРЕГАЦІЯ ПОЧАТА ===');
        console.log('Параметри:', { databaseName, groupId, date });

        const connection = getSchoolDBConnection(databaseName);
        const LessonAttendance = require('../models/LessonAttendance')(connection);
        const ClassAttendance = require('../models/ClassAttendance')(connection);
        const Schedule = connection.models.Schedule;
        const DayOfWeek = connection.models.DayOfWeek;
        const Quarter = connection.models.Quarter;
        const Group = connection.models.Group;

        const activeQuarter = await Quarter.findOne({
            startDate: { $lte: new Date(date) },
            endDate: { $gte: new Date(date) }
        });

        if (!activeQuarter) {
            return res.status(404).json({ error: 'Не знайдено активної чверті' });
        }

        const dateObj = new Date(date);
        const jsDayOfWeek = dateObj.getDay();
        const dbDayOfWeekNumber = jsDayOfWeek === 0 ? 7 : jsDayOfWeek;

        const dayOfWeekDoc = await DayOfWeek.findOne({ id: dbDayOfWeekNumber });
        if (!dayOfWeekDoc) {
            return res.status(404).json({ error: 'День тижня не знайдено' });
        }

        // Отримуємо ВСІ розклади для групи на цей день
        const schedules = await Schedule.find({
            group: groupId,
            dayOfWeek: dayOfWeekDoc._id
        }).populate('timeSlot');

        console.log('Розклад на день:', schedules.map(s => ({
            id: s._id,
            subject: s.subject,
            teacher: s.teacher
        })));

        const totalLessons = schedules.length;

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        // Отримуємо ВСІ записи з LessonAttendance для цієї групи на цю дату
        const lessonAttendances = await LessonAttendance.find({
            schedule: { $in: schedules.map(s => s._id) },
            date: { $gte: startDate, $lte: endDate }
        }).populate('records.student');

        console.log(`Знайдено ${lessonAttendances.length} записів у LessonAttendance`);

        // Детально виводимо кожен запис
        lessonAttendances.forEach((record, index) => {
            console.log(`Запис ${index + 1}:`, {
                id: record._id,
                schedule: record.schedule,
                scheduleId: record.schedule.toString(),
                records: record.records.map(r => ({
                    studentId: r.student?._id,
                    studentName: r.student?.fullName,
                    status: r.status,
                    reason: r.reason,
                    recordId: r._id
                }))
            });
        });

        // Отримуємо всіх студентів групи
        const group = await Group.findById(groupId).populate('students');
        const allStudentIds = group?.students?.map(s => s._id.toString()) || [];
        console.log(`Всього студентів у групі: ${allStudentIds.length}`);

        // Створюємо мапу відсутностей
        const studentAttendance = {};

        lessonAttendances.forEach(record => {
            record.records.forEach(r => {
                if (!r.student) return;

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

        console.log('Студенти з відсутностями:',
            Object.entries(studentAttendance).map(([id, data]) => ({
                studentId: id,
                lessonsAbsent: data.lessonsAbsent,
                details: data.lessonDetails.map(d => d.subject)
            }))
        );

        // Видаляємо ВСІ існуючі записи для цієї дати
        const deleteResult = await ClassAttendance.deleteMany({
            group: groupId,
            date: { $gte: startDate, $lte: endDate }
        });
        console.log(`Видалено ${deleteResult.deletedCount} старих записів з ClassAttendance`);

        const createResults = [];

        for (const [studentId, data] of Object.entries(studentAttendance)) {
            if (data.lessonsAbsent > 0) {
                console.log(`Створюємо запис для студента ${studentId} з ${data.lessonsAbsent} пропусками`);
                console.log(`totalLessons = ${totalLessons}, lessonsAbsent = ${data.lessonsAbsent}`);

                const attendanceData = {
                    group: groupId,
                    student: studentId,
                    date: dateObj,
                    quarter: activeQuarter._id,
                    status: 'absent',
                    lessonsAbsent: data.lessonsAbsent,
                    totalLessons: totalLessons, // Використовуємо totalLessons з розкладу
                    lessonDetails: data.lessonDetails.map(detail => ({
                        ...detail,
                        totalLessons: totalLessons // Додаємо totalLessons в кожен деталь
                    })),
                    reasonType: data.lessonDetails[0]?.reason?.toLowerCase().includes('хвор') ? 'sick' : 'other',
                    certificate: false
                };

                const newRecord = new ClassAttendance(attendanceData);
                await newRecord.save();
                createResults.push({
                    studentId,
                    lessons: data.lessonsAbsent,
                    totalLessons: totalLessons,
                    details: data.lessonDetails.map(d => d.scheduleId.toString())
                });
            }
        }

        console.log('Створено записів:', createResults.length);
        console.log('=== АГРЕГАЦІЯ ЗАВЕРШЕНА ===\n');

        res.json({
            message: 'Агрегація виконана',
            deletedCount: deleteResult.deletedCount,
            createdCount: createResults.length,
            createdDetails: createResults,
            lessonAttendancesFound: lessonAttendances.length,
            schedulesCount: schedules.length
        });

    } catch (error) {
        console.error('ПОМИЛКА АГРЕГАЦІЇ:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;