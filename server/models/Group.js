const mongoose = require('mongoose');

// ПІДГРУПА
const subgroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    order: { type: Number, default: 1 }
}, { _id: true });

// ГРУПА
const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: {
        type: String,
        enum: ['young', 'middle', 'senior'],
        required: true
    },
    curator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    gradeLevel: { type: Number },
    hasSubgroups: { type: Boolean, default: false },
    subgroups: [subgroupSchema],
    subgroupSettings: {
        numberOfSubgroups: { type: Number, min: 1, max: 3, default: 1 },
        autoDistributed: { type: Boolean, default: false }
    }
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