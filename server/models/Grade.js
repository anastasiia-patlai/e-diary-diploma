const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    value: {
        type: Number,
        min: 1,
        max: 12,
        required: true
    }
}, {
    timestamps: true
});

// Складений індекс для унікальності
gradeSchema.index({ student: 1, schedule: 1, date: 1 }, { unique: true });

// Віртуальне поле для форматування дати
gradeSchema.virtual('formattedDate').get(function () {
    return this.date.toISOString().split('T')[0];
});

module.exports = (connection) => {
    // Перевіряємо, чи модель вже зареєстрована
    if (connection.models.Grade) {
        return connection.models.Grade;
    }
    return connection.model('Grade', gradeSchema);
};