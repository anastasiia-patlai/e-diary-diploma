const mongoose = require('mongoose');

const homeworkEntrySchema = new mongoose.Schema({
    // Прив'язка до уроку (scheduleId + конкретна дата уроку)
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule',
        required: true
    },
    lessonDate: {
        // Дата самого уроку (коли урок відбувся / відбудеться)
        type: String,   // 'YYYY-MM-DD'
        required: true
    },
    lessonNumber: {
        // Порядковий номер уроку в розкладі цього дня (1, 2, 3…)
        type: Number,
        required: true
    },
    topic: {
        // Тема уроку
        type: String,
        required: true,
        trim: true
    },
    text: {
        // Текст домашнього завдання
        type: String,
        required: true,
        trim: true
    },
    dueDate: {
        // На яку дату задається ДЗ (коли здавати)
        type: String,   // 'YYYY-MM-DD'
        required: true
    },
    // Прикріплені файли (зберігаємо шлях / URL)
    files: [{
        originalName: { type: String },
        path: { type: String },
        mimeType: { type: String },
        size: { type: Number }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Один запис ДЗ на (schedule + lessonDate)
homeworkEntrySchema.index({ schedule: 1, lessonDate: 1 }, { unique: true });

module.exports = (connection) => {
    if (connection.models.HomeworkEntry) {
        return connection.models.HomeworkEntry;
    }
    return connection.model('HomeworkEntry', homeworkEntrySchema);
};