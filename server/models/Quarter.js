const mongoose = require('mongoose');

const quarterSchema = new mongoose.Schema({
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    number: { type: Number, required: true, min: 1, max: 4 },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Quarter', quarterSchema);