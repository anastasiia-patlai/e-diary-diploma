const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    date: { type: Date, required: true },
    text: { type: String, required: true }
}, {
    timestamps: true
});

// Унікальний індекс
homeworkSchema.index({ schedule: 1, date: 1 }, { unique: true });

module.exports = (connection) => {
    return connection.model('Homework', homeworkSchema);
};