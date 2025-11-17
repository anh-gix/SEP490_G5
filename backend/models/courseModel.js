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
    // Thêm type (ielts, toeic, cam)
    type: {
        type: String,
        enum: ['ielts', 'toeic', 'cam'],
        required: true
    },
    // Thêm level
    level: {
        type: String,
        enum: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        required: true
    },
    // Thêm band (map với level)
    // IELTS: A1 (0-2.5), A2 (3.0-3.5), B1 (4.0-5.0), B2 (5.5-6.5), C1 (7.0-8.0), C2 (8.5-9.0)
    // TOEIC: A1 (0-250), A2 (251-500), B1 (501-700), B2 (701-900), C1 (901-990), C2 (990+)
    // CAM: Pre-A1 (Starter), A1 (Mover)
    band: {
        type: String
    },
    // Thêm học phí
    tuitionFee: {
        type: Number,
        default: 0
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
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
