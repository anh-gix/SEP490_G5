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
    camSessions: [{
        type: Schema.Types.ObjectId,
        ref: 'CamSession'
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
        // Tài liệu cho course (mảng các URL)
    materials: [{
        type: String
    }],
    // Session nào là mocktest (theo order)
    // VD: [5, 10] nghĩa là session order 5 và 10 là mocktest
    mocktestSessionOrders: [{
        type: Number
    }],
    
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
