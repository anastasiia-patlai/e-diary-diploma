const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    timeSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeTab', required: true },
    dayOfWeek: { type: mongoose.Schema.Types.ObjectId, ref: 'DayOfWeek', required: true }
}, {
    timestamps: true
});

scheduleSchema.index({ group: 1, dayOfWeek: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);