const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    order: { type: Number, required: true },
    startTime: { type: String, required: true }, // Формат "HH:MM"
    endTime: { type: String, required: true }    // Формат "HH:MM"
}, { timestamps: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);