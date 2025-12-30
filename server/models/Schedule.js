const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    subgroup: {
        type: String,
        enum: ['all', '1', '2', '3'], // 'all' - для всієї групи
        default: 'all'
    },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    timeSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeTab', required: true },
    dayOfWeek: { type: mongoose.Schema.Types.ObjectId, ref: 'DayOfWeek', required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    isFullGroup: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// ТІЛЬКИ унікальний індекс для всієї групи (subgroup: 'all')
scheduleSchema.index({
    group: 1,
    dayOfWeek: 1,
    timeSlot: 1,
    subgroup: 'all'
}, {
    unique: true,
    partialFilterExpression: { subgroup: 'all' },
    name: 'unique_full_group_timeslot'
});

scheduleSchema.index({
    group: 1,
    dayOfWeek: 1,
    timeSlot: 1,
    subgroup: 1
}, {
    unique: true,
    name: 'unique_specific_subgroup_timeslot'
});

// Загальний індекс для пошуку
scheduleSchema.index({ group: 1, dayOfWeek: 1, timeSlot: 1 });
scheduleSchema.index({ subgroup: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);