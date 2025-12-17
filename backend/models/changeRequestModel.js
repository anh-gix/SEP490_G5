const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const changeRequestSchema = new Schema({
  // Người gửi đơn (Student)
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Loại đơn
  type: {
    type: String,
    enum: ['change_class', 'makeup_class', 'request_replace_teacher'],
    required: true
  },
  
  // ID lớp học (dùng cho đổi lớp học)
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class'
  },
  
  // ID lịch học của học sinh (dùng cho học bù)
  studentScheduleId: {
    type: Schema.Types.ObjectId,
    ref: 'StudentSchedule'
  },
  
  // ID lịch dạy của lớp (dùng cho request_replace_teacher)
  classScheduleId: {
    type: Schema.Types.ObjectId,
    ref: 'ClassSchedule'
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

