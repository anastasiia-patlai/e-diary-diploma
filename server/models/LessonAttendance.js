const mongoose = require('mongoose');

const lessonAttendanceSchema = new mongoose.Schema({
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    records: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'late'],
            default: 'present'
        },
        reason: {
            type: String,
            default: ''
        },
        time: {
            type: String,  // час приходу для запізнень
            default: null
        }
    }],
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

// Унікальний індекс: один запис на урок на дату
lessonAttendanceSchema.index({ schedule: 1, date: 1 }, { unique: true });

module.exports = (connection) => {
    if (connection.models.LessonAttendance) {
        return connection.models.LessonAttendance;
    }
    return connection.model('LessonAttendance', lessonAttendanceSchema);
};