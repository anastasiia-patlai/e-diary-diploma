const mongoose = require('mongoose');

const classAttendanceSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quarter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quarter',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        default: 'present'
    },
    // Тип причини відсутності
    reasonType: {
        type: String,
        enum: ['sick', 'family', 'other'],
        default: 'other'
    },
    // Кількість пропущених уроків (для часткової відсутності)
    lessonsAbsent: {
        type: Number,
        default: 0,
        min: 0
    },
    // Загальна кількість уроків у цей день
    totalLessons: {
        type: Number,
        default: 0,
        min: 0
    },
    // Деталі по уроках (НОВЕ)
    lessonDetails: [{
        scheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Schedule'
        },
        subject: String,
        timeSlot: {
            startTime: String,
            endTime: String
        },
        status: {
            type: String,
            enum: ['present', 'absent'],
            default: 'present'
        }
    }],
    // Інформація про довідку/записку (СПРОЩЕНО)
    certificate: {
        type: Boolean,
        default: false
    },
    // Хто створив/оновив запис
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Унікальний індекс: один запис на студента на дату в чверті
classAttendanceSchema.index(
    { student: 1, date: 1, quarter: 1 },
    { unique: true }
);

// Індекс для пошуку по групі та чверті
classAttendanceSchema.index({ group: 1, quarter: 1 });

module.exports = (connection) => {
    if (connection.models.ClassAttendance) {
        return connection.models.ClassAttendance;
    }
    return connection.model('ClassAttendance', classAttendanceSchema);
};