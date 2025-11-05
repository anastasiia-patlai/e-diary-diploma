const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    capacity: { type: Number },
    type: { type: String, enum: ['lecture', 'practice', 'lab'], default: 'lecture' }
}, { timestamps: true });

module.exports = mongoose.model('Classroom', classroomSchema);