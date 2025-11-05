const mongoose = require('mongoose');

const dayOfWeekSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, min: 1, max: 7 },
    name: { type: String, required: true, unique: true },
    nameShort: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('DayOfWeek', dayOfWeekSchema);