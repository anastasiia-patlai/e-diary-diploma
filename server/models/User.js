const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },      // тільки для студентів
    positions: [{ type: String }],
    position: { type: String },                                         // тільки для викладачів
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]   // тільки для батьків
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
