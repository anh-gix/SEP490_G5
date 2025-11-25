const mongoose = require('mongoose');
const Schema = mongoose.Schema;


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

    // Nơi lưu tài liệu
    documentUrl: {
        type: String
    },
    documentPath: {
        type: String
    },

    // Ma trận ánh xạ (Mapping) sang PLO
    // Tương ứng với bảng Mapping_PLO-CLO
    // Một CLO có thể liên kết (ánh xạ) với một hoặc nhiều PLO
    mappedPLOs: [{
        type: Schema.Types.ObjectId,
        ref: 'PLO'
    }]
}, { timestamps: true });

// Để đảm bảo code là duy nhất trong phạm vi một khóa học
cloSchema.index({ code: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CLO', cloSchema);
