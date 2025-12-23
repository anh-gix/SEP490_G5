const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    content: {
        type: String

    },
    learningType: {
        type: String,
        enum: ['theory', 'mocktest'],
        default: 'theory'
    },

    // Lưu _id của CLO trong course (CLO là embedded trong Course)
    // LƯU Ý: CLOs trong Course là embedded documents, KHÔNG thể dùng ref + populate thông thường
    // Để lấy CLO details, cần:
    // 1. Populate course.clos (lấy toàn bộ CLOs từ Course)
    // 2. Filter thủ công dựa trên session.clos ObjectIds
    // VD: course.clos.filter(clo => session.clos.map(id => id.toString()).includes(clo._id.toString()))
    clos: [{
        type: Schema.Types.ObjectId
        // Không thể ref: 'Course.clos' vì CLO là embedded, không phải collection
    }],
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
