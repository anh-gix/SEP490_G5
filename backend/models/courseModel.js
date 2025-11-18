const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    numberOfSessions: {
        type: Number,
        required: true,
        min: 1
    },
    program: {
        type: Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    clos: [{
        type: Schema.Types.ObjectId,
        ref: 'CLO'
    }],
    sessions: [{
        type: Schema.Types.ObjectId,
        ref: 'Session'
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submittedAt: {
        type: Date
    },
    revisionReason: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'approved', 'needs_revision', 'archived'],
        default: 'draft'
    },
    // Ngày sẽ làm test
    testDate: {
        type: Date
    },
    // Tài liệu cho course (mảng các URL)
    materials: [{
        type: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
