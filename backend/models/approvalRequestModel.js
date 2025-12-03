const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Model để quản lý tất cả các request cần duyệt từ Subject Leader/Teacher gửi đến Center Head
const approvalRequestSchema = new Schema({
  // Loại entity cần duyệt
  requestType: {
    type: String,
    enum: ['program', 'exam', 'class'],
    required: true,
    index: true
  },

  // Reference đến entity cần duyệt (polymorphic reference)
  entityType: {
    type: String,
    enum: ['Program', 'Exam', 'Class'],
    required: true
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType',
    index: true
  },

  // File Excel khách hàng đính kèm (chỉ dùng cho đơn tạo lớp - type: 'create_class')
  excelFile: {
    title: String,
    type: String, 
    trim: true
  },

  // ===== THÔNG TIN SUBMIT =====
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  submissionNote: {
    type: String,
    trim: true
  },

  // ===== THÔNG TIN REVIEW (Center Head) =====
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNote: {
    type: String,
    trim: true
  },

  // ===== TRẠNG THÁI =====
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },

  // ===== LÝ DO REJECT (nếu có) =====
  rejectionReason: {
    type: String,
    trim: true
  },

  // ===== LỊCH SỬ THAY ĐỔI =====
  history: [{
    action: {
      type: String,
      enum: ['submitted', 'approved', 'rejected', 'resubmitted'],
      required: true
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    note: String,
    previousStatus: String
  }]

}, {
  timestamps: true
});

// ===== INDEXES =====
// Index cho query pending requests
approvalRequestSchema.index({ status: 1, submittedAt: -1 });

// Index cho tìm request theo entity
approvalRequestSchema.index({ entityType: 1, entityId: 1 });

// Index cho tìm requests của người submit
approvalRequestSchema.index({ submittedBy: 1, status: 1 });

// Index cho tìm requests đã review bởi Center Head
approvalRequestSchema.index({ reviewedBy: 1, reviewedAt: -1 });

// Unique constraint: 1 entity chỉ có 1 pending request tại 1 thời điểm
approvalRequestSchema.index(
  { entityType: 1, entityId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' }
  }
);

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);
