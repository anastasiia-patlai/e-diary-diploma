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
    },
    columnId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JournalColumn',
        default: null
    },
    gradeType: {
        type: String,
        enum: ['regular', 'self', 'control', 'theme', 'quarter', 'semester'],
        default: 'regular'
    }
}, {
    timestamps: true
});

// Два окремих унікальних індекси:
// 1) regular grades (columnId = null) — один запис на (student, schedule, date)
gradeSchema.index(
    { student: 1, schedule: 1, date: 1 },
    {
        unique: true,
        partialFilterExpression: { columnId: null },
        name: 'unique_regular_grade'
    }
);
// 2) column grades — один запис на (student, schedule, date, columnId)
gradeSchema.index(
    { student: 1, schedule: 1, date: 1, columnId: 1 },
    {
        unique: true,
        partialFilterExpression: { columnId: { $ne: null } },
        name: 'unique_column_grade'
    }
);

gradeSchema.virtual('formattedDate').get(function () {
    return this.date.toISOString().split('T')[0];
});

module.exports = (connection) => {
    if (connection.models.Grade) {
        return connection.models.Grade;
    }
    return connection.model('Grade', gradeSchema);
};