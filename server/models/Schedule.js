// models/Schedule.js
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    },
    dayOfWeek: {
        type: Number,
        required: true,
        min: 1,
        max: 7 // 1-Понеділок, 7-Неділя
    },
    startTime: { type: String, required: true }, // Формат "HH:MM"
    endTime: { type: String, required: true },   // Формат "HH:MM"
    lessonType: {
        type: String,
        enum: ['lecture', 'practice', 'lab'],
        default: 'lecture'
    },
    frequency: {
        type: String,
        enum: ['weekly', 'numerator', 'denominator'],
        default: 'weekly'
    }
}, { timestamps: true });

// Віртуальне поле для назви предмета (отримуємо з position викладача)
scheduleSchema.virtual('subjectName').get(function () {
    return this.teacher?.position || this.teacher?.positions?.[0] || 'Невідомий предмет';
});

module.exports = mongoose.model('Schedule', scheduleSchema);