const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    // Mã môn học (VD: "ACC101", "IELTS-6.5", "SE301")
    subjectCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
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
    //Số lượng buổi dạy trong 1 course
    numberOfSessions: {
        type: Number,
    },
    // Phân bổ thời gian (VD: "Study hour (150h) = 45h (60 sessions) contact hours + 1h final exam + 104h self-study")
    timeAllocation: {
        type: String,
        trim: true
    },
    // Yêu cầu tiên quyết (VD: "Hoàn thành IELTS 5.5", "None")
    preRequisite: {
        type: String,
        trim: true,
        default: 'None'
    },
    // Nhiệm vụ của sinh viên
    studentTasks: {
        type: String
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
    // Tài liệu cho course
    materials: [{
        description: {
            type: String,
            required: true,
            trim: true
        },
        author: {
            type: String,
            trim: true
        },
        publisher: {
            type: String,
            trim: true
        },
        publishedDate: {
            type: String,
            trim: true
            //ngày phát hành
        },
        onlineUrl: {
            type: String,
            trim: true
        },
        documentUpload:{
            type: String,
            trim: true
        },
        note: {
            type: String,
            trim: true
        }
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