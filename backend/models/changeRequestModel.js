const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const changeRequestSchema = new Schema({
  // Người gửi đơn
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Nội dung yêu cầu (có thể là đổi lớp hoặc đổi buổi học)
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  // Người duyệt đơn (chỉ có khi đã được duyệt)
  approver: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Ngày duyệt
  approvedDate: {
    type: Date
  },
  
  // Trạng thái đơn
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Nội dung phản hồi từ người duyệt
  responseContent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // createdAt (ngày gửi), updatedAt
});

module.exports = mongoose.model('ChangeRequest', changeRequestSchema);

