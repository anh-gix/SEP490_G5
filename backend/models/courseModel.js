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
    approvedAt: {
        type: Date
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalNote: {
        type: String
    },
    rejectedAt: {
        type: Date
    },
    rejectedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'approved', 'needs_revision', 'archived'],
        default: 'draft'
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
