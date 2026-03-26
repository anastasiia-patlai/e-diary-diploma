const mongoose = require('mongoose');

const journalColumnSchema = new mongoose.Schema({
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['self', 'control', 'theme', 'quarter', 'semester'],
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    label: {
        type: String,
        default: ''
    }
}, { timestamps: true });

journalColumnSchema.index({ schedule: 1, order: 1 });
journalColumnSchema.index({ schedule: 1, date: 1, type: 1 });

module.exports = (connection) => {
    if (connection.models.JournalColumn) {
        return connection.models.JournalColumn;
    }
    return connection.model('JournalColumn', journalColumnSchema);
};