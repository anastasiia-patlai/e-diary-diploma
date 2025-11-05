const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true, min: 1, max: 500 },
    type: { type: String, enum: ['lecture', 'practice', 'lab', 'general'], default: 'general' },
    equipment: [{ type: String }],
    isActive: { type: Boolean, default: true },
    description: { type: String, maxlength: 500 }
}, { timestamps: true });

module.exports = mongoose.model('Classroom', classroomSchema);