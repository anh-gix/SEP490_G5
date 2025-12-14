const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema cho Program (Chương trình đào tạo)

// Embedded PLO schema - mỗi program có PLOs riêng
const ploSchema = new Schema({
    code: {
        type: String,
        required: [true, 'Mã PLO là bắt buộc']
    },
    name: {
        type: String,
        required: [true, 'Tên PLO là bắt buộc']
    },
    detail: {
        type: String,
        required: [true, 'Chi tiết PLO là bắt buộc']
    }
}, { _id: true, timestamps: true });

const programSchema = new Schema({
    code: {
        type: String, required: true,
        unique: true
    },
    program_name: {
        type: String,
        required: true
    },
    description: {
        type: String
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
    plos: [ploSchema],

    // Creator tracking
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // ===== STATUS ĐỂ XEM PROGRAM ĐÃ ĐƯỢC DUYỆT CHƯA =====
    // Tất cả thông tin chi tiết về submission, approval, rejection được lưu trong WorkRequest model
    status: {
        type: String,
        enum: [
            'draft',              // Subject Leader đang soạn
            'pending_approval',   // Đã submit, chờ Center Head duyệt
            'approved',           // Center Head đã duyệt
            'needs_revision',     // Center Head yêu cầu chỉnh sửa
            'active',             // Đang sử dụng (sau khi approved)
            'archived'            // Đã lưu trữ
        ],
        default: 'draft',
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
