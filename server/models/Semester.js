const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    name: { type: String, required: true, enum: ['I. Осінньо-зимовий', 'II. Зимово-весняний'] },
    year: {
        type: String, required: true, validate: {
            validator: function (v) {
                return /^\d{4}-\d{4}$/.test(v);
            },
            message: 'Формат року має бути: XXXX-XXXX (наприклад, 2024-2025)'
        }
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Semester', semesterSchema);