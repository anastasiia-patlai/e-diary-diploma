const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    institutionType: {
        type: String,
        required: true,
        enum: ['school', 'gymnasium', 'lyceum', 'college', 'university']
    },
    number: {
        type: String,
        required: function () {
            return ['school', 'gymnasium', 'lyceum'].includes(this.institutionType);
        }
    },
    name: {
        type: String,
        required: function () {
            return ['gymnasium', 'lyceum', 'college', 'university'].includes(this.institutionType);
        }
    },
    honoraryName: {
        type: String,
        required: function () {
            return ['college', 'university'].includes(this.institutionType);
        }
    },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    databaseName: { type: String, required: true, unique: true, trim: true },

    adminFullName: { type: String, required: true, trim: true },
    adminPosition: { type: String, required: true, trim: true },
    adminEmail: { type: String, required: true, trim: true },
    adminPhone: { type: String, required: true, trim: true },
    adminPassword: { type: String, required: true },
    adminUserId: { type: mongoose.Schema.Types.ObjectId },

    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);