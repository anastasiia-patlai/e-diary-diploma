const express = require('express');
const router = express.Router();
const { getSchoolDBConnection } = require('../config/databaseManager');

const deleteFromLessonAttendance = async (connection, scheduleId, studentId, date) => {
    const LessonAttendance = require('../models/LessonAttendance')(connection);

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const lessonAttendance = await LessonAttendance.findOne({
        schedule: scheduleId,
        date: { $gte: startDate, $lte: endDate }
    });

    if (!lessonAttendance) return;

    // Видаляємо тільки конкретного студента
    lessonAttendance.records = lessonAttendance.records.filter(
        r => r.student.toString() !== studentId.toString()
    );

    if (lessonAttendance.records.length === 0) {
        await LessonAttendance.findByIdAndDelete(lessonAttendance._id);
        console.log(`[LA] Видалено весь документ LessonAttendance для уроку ${scheduleId}`);
    } else {
        await lessonAttendance.save();
        console.log(`[LA] Видалено студента ${studentId} з LessonAttendance для уроку ${scheduleId}`);
    }
};

const syncWithLessonAttendance = async (connection, groupId, studentId, date, lessonDetails) => {
    const LessonAttendance = require('../models/LessonAttendance')(connection);
    const Schedule = connection.models.Schedule;
    const DayOfWeek = connection.models.DayOfWeek;

    const dateObj = new Date(date);
    const startDate = new Date(dateObj);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateObj);
    endDate.setHours(23, 59, 59, 999);

    const dayOfWeekNum = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
    const dayOfWeekDoc = await DayOfWeek.findOne({ id: dayOfWeekNum });
    if (!dayOfWeekDoc) {
        console.log('[Sync] DayOfWeek not found for:', dayOfWeekNum);
        return;
    }

    const schedules = await Schedule.find({ group: groupId, dayOfWeek: dayOfWeekDoc._id });

    for (const lesson of lessonDetails) {
        // Якщо урок відмічений вчителем — не втручаємося
        if (lesson.markedBy === 'teacher') {
            console.log(`[Sync] Пропускаємо урок ${lesson.scheduleId} (відмічено вчителем)`);
            continue;
        }

        // Знаходимо відповідний розклад
        const schedule = schedules.find(s => s._id.toString() === lesson.scheduleId?.toString());
        if (!schedule) {
            console.log(`[Sync] Schedule not found for: ${lesson.scheduleId}`);
            continue;
        }

        if (lesson.status === 'absent') {
            // Додаємо або оновлюємо запис у LessonAttendance
            let attendance = await LessonAttendance.findOne({
                schedule: schedule._id,
                date: { $gte: startDate, $lte: endDate }
            });

            if (attendance) {
                const existingRecord = attendance.records.find(
                    r => r.student.toString() === studentId.toString()
                );
                if (!existingRecord) {
                    attendance.records.push({
                        student: studentId,
                        status: 'absent',
                        reason: lesson.reason || ''
                    });
                    await attendance.save();
                    console.log(`[Sync] Додано студента ${studentId} до LessonAttendance для уроку ${schedule._id}`);
                } else {
                    // Оновлюємо причину якщо змінилась
                    existingRecord.reason = lesson.reason || existingRecord.reason;
                    await attendance.save();
                }
            } else {
                attendance = new LessonAttendance({
                    schedule: schedule._id,
                    date: dateObj,
                    records: [{
                        student: studentId,
                        status: 'absent',
                        reason: lesson.reason || ''
                    }]
                });
                await attendance.save();
                console.log(`[Sync] Створено новий LessonAttendance для уроку ${schedule._id}`);
            }
        } else if (lesson.status === 'present') {
            // Видаляємо запис про відсутність (класний керівник відмінив своє позначення)
            await deleteFromLessonAttendance(connection, schedule._id, studentId, date);
        }
    }
};

router.get('/group/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { quarter, databaseName } = req.query;

        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const ClassAttendance = require('../models/ClassAttendance')(connection);

        const query = { group: groupId };
        if (quarter) query.quarter = quarter;

        const records = await ClassAttendance.find(query)
            .populate('student', 'fullName')
            .sort({ date: 1 });

        res.json(records);
    } catch (error) {
        console.error('Error fetching group attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { databaseName } = req.body;

        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const ClassAttendance = require('../models/ClassAttendance')(connection);

        const attendance = await ClassAttendance.findById(id);
        if (!attendance) return res.status(404).json({ error: 'Запис не знайдено' });

        // Видаляємо з LessonAttendance ТІЛЬКИ уроки, позначені класним керівником
        if (attendance.lessonDetails?.length > 0) {
            const classTeacherLessons = attendance.lessonDetails.filter(
                l => l.status === 'absent' && l.markedBy !== 'teacher'
            );

            console.log(`[Delete] Видалення ${classTeacherLessons.length} уроків класного керівника з LessonAttendance`);

            for (const lesson of classTeacherLessons) {
                await deleteFromLessonAttendance(
                    connection,
                    lesson.scheduleId,
                    attendance.student.toString(),
                    attendance.date
                );
            }
        }

        await ClassAttendance.findByIdAndDelete(id);
        console.log(`[Delete] ClassAttendance ${id} видалено`);

        res.json({ message: 'Запис успішно видалено', deletedId: id });
    } catch (error) {
        console.error('Error deleting class attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            databaseName, groupId, studentId, date, quarter,
            reasonType, lessonsAbsent, totalLessons, certificate, lessonDetails
        } = req.body;

        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const ClassAttendance = require('../models/ClassAttendance')(connection);

        const dateObj = new Date(date);
        const startDate = new Date(dateObj); startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(dateObj); endDate.setHours(23, 59, 59, 999);

        // Синхронізація з LessonAttendance (тільки уроки класного керівника)
        if (lessonDetails?.length > 0 && groupId && studentId && date) {
            await syncWithLessonAttendance(connection, groupId, studentId, date, lessonDetails);
        }

        let attendance = await ClassAttendance.findOne({
            student: studentId,
            date: { $gte: startDate, $lte: endDate },
            quarter
        });

        if (attendance) {
            attendance.reasonType = reasonType;
            attendance.lessonsAbsent = lessonsAbsent || 0;
            attendance.totalLessons = totalLessons || 0;
            attendance.certificate = certificate;
            attendance.lessonDetails = lessonDetails || attendance.lessonDetails;
            attendance.status = lessonsAbsent > 0 ? 'absent' : 'present';
            await attendance.save();
        } else {
            attendance = new ClassAttendance({
                group: groupId,
                student: studentId,
                date: dateObj,
                quarter,
                status: lessonsAbsent > 0 ? 'absent' : 'present',
                reasonType,
                lessonsAbsent: lessonsAbsent || 0,
                totalLessons: totalLessons || 0,
                certificate,
                lessonDetails: lessonDetails || []
            });
            await attendance.save();
        }

        await attendance.populate('student', 'fullName');
        res.status(201).json(attendance);
    } catch (error) {
        console.error('Error in POST /class:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            databaseName, reasonType, lessonsAbsent, totalLessons,
            certificate, lessonDetails, groupId, studentId, date, quarter
        } = req.body;

        if (!databaseName) return res.status(400).json({ error: 'Не вказано databaseName' });

        const connection = getSchoolDBConnection(databaseName);
        const ClassAttendance = require('../models/ClassAttendance')(connection);

        const existingAttendance = await ClassAttendance.findById(id);
        if (!existingAttendance) return res.status(404).json({ error: 'Запис не знайдено' });

        // Синхронізація з LessonAttendance
        if (lessonDetails?.length > 0 && groupId && studentId && date) {
            await syncWithLessonAttendance(connection, groupId, studentId, date, lessonDetails);
        }

        const attendance = await ClassAttendance.findByIdAndUpdate(
            id,
            {
                reasonType,
                lessonsAbsent,
                totalLessons,
                certificate,
                lessonDetails,
                status: lessonsAbsent > 0 ? 'absent' : 'present'
            },
            { new: true, runValidators: true }
        ).populate('student', 'fullName');

        res.json(attendance);
    } catch (error) {
        console.error('Error updating class attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;