const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Embedded CLO schema - mỗi course có CLOs riêng
const cloSchema = new Schema({
    code: {
        type: String,
        required: [true, 'Mã CLO là bắt buộc']
    },
    name: {
        type: String,
        required: [true, 'Tên CLO là bắt buộc']
    },
    detail: {
        type: String,
        required: [true, 'Chi tiết CLO là bắt buộc']
    },
    // Ma trận ánh xạ sang PLO - lưu _id của PLO trong program
    // Vì PLO giờ là embedded trong Program, nên ta lưu PLO._id
    mappedPLOs: [{
        type: Schema.Types.ObjectId
    }]
}, { _id: true, timestamps: true });

const courseSchema = new Schema({
    // Mã môn học (VD: "ACC101", "IELTS-6.5", "SE301")
    courseCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    learningType: {
        type: String,
        enum: ['online', 'offline', 'hybrid'],
        required: true
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
    clos: [cloSchema],
    // Ma trận ánh xạ Course với PLO của Program
    // Lưu _id của PLO trong program (PLO là embedded trong Program)
    mappedPLOs: [{
        type: Schema.Types.ObjectId
    }],
    sessions: [{
        type: Schema.Types.ObjectId,
        ref: 'Session'
    }],
    camSessions: [{
        type: Schema.Types.ObjectId,
        ref: 'CamSession'
    }],
    // Danh sách học viên đã đăng ký khóa học
    studentEnrollments: [{
        type: Schema.Types.ObjectId,
        ref: 'Student'
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Learning Type - để phân biệt course online/offline hiển thị trên web
    learningType: {
        type: String,
        enum: ['online', 'offline', 'hybrid'],
        default: 'offline'
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

    // ===== STATUS VÀ TRACKING =====
    // Status chỉ để tracking trạng thái course, KHÔNG có approval workflow
    status: {
        type: String,
        enum: [
            'draft',              // Đang tạo, chưa hoàn thiện
            'completed',          // Đã tạo xong, sẵn sàng sử dụng
            'active',             // Course đang có students (check qua studentEnrollments.length > 0)
            'archived'            // Course đã lưu trữ
        ],
        default: 'draft',
        index: true
    },
    isActive: {
        type: Boolean,
        default: false,
    },

    // Track wizard progress - step cuối cùng đã hoàn thành (0-5)
    // 0 = chưa bắt đầu, 1 = step 1 done, ..., 5 = tất cả steps done
    lastCompletedStep: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);