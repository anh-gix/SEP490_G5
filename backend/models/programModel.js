const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema cho Program (Chương trình đào tạo)

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
    plos: [{
        type: Schema.Types.ObjectId,
        ref: 'PLO'
    }],
    status: {
        type: String,
        enum: ['draft', 'active', 'archived', 'disabled'], // draft: đang soạn, active: đang dùng, archived: đã lưu trữ, disabled: không dùng nữa
        default: 'draft'
    }
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
