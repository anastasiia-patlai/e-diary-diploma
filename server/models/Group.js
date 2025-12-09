const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: {
        type: String,
        enum: ['young', 'middle', 'senior'],
        required: true
    },
    curator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    gradeLevel: { type: Number }
}, { timestamps: true });

groupSchema.pre('save', function (next) {
    if (this.name) {
        const gradeMatch = this.name.match(/\d+/);
        if (gradeMatch) {
            this.gradeLevel = parseInt(gradeMatch[0]);

            if (this.gradeLevel >= 1 && this.gradeLevel <= 4) {
                this.category = 'young';
            } else if (this.gradeLevel >= 5 && this.gradeLevel <= 9) {
                this.category = 'middle';
            } else if (this.gradeLevel >= 10 && this.gradeLevel <= 11) {
                this.category = 'senior';
            }
        }
    }
    next();
});

module.exports = mongoose.model('Group', groupSchema);