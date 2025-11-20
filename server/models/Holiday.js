const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    quarter: { type: mongoose.Schema.Types.ObjectId, ref: 'Quarter', required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { type: String, required: true, enum: ['Осінні', 'Зимові', 'Весняні', 'Літні'] }
}, { timestamps: true });

module.exports = mongoose.model('Holiday', holidaySchema);