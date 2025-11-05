const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    dayOfWeek: { type: mongoose.Schema.Types.ObjectId, ref: 'DayOfWeek', required: true },
    order: { type: Number, required: true },
    startTime: { type: String, required: true }, // Формат "HH:MM"
    endTime: { type: String, required: true }    // Формат "HH:MM"
}, { timestamps: true });

timeSlotSchema.index({ dayOfWeek: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);