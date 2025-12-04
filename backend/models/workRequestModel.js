const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workRequestSchema = new Schema({

  // ===== PHÂN LOẠI REQUEST =====

  // Hướng của workflow
  direction: {
    type: String,
    enum: ['bottom_up', 'top_down'],
    required: true,
    index: true
  },

  // Loại request
  requestType: {
    type: String,
    enum: [
      // Bottom-up (approval)
      'program',           // Submit program để duyệt
      'exam',              // Submit exam để duyệt

      // Top-down (task assignment)
      'create_program',    // Yêu cầu tạo program mới
      'edit_course',       // Yêu cầu chỉnh sửa course
      'create_exam',       // Yêu cầu tạo exam mới
      'create_class',      // Yêu cầu tạo tài khoản & xếp lớp từ file khách hàng
    ],
    required: true,
    index: true
  },

  // ===== ENTITY REFERENCE (cho program, exam, course) =====

  // Polymorphic reference đến entity liên quan
  entityType: {
    type: String,
    enum: ['Program', 'Exam', 'Course', null],
  },
  entityId: {
    type: Schema.Types.ObjectId,
    refPath: 'entityType',
    index: true
  },

  // ===== THÔNG TIN NGƯỜI THAM GIA =====

  // Người tạo request (có thể là submitter hoặc assigner)
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Người được giao việc (chỉ dùng cho top_down)
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  // Người xử lý request (reviewer hoặc assignee)
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // ===== TIMESTAMPS =====

  requestedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  processedAt: {
    type: Date
  },

  // ===== NỘI DUNG REQUEST =====

  // Ghi chú từ người tạo request
  requestNote: {
    type: String,
    trim: true
  },

  // Phản hồi từ người xử lý
  responseNote: {
    type: String,
    trim: true
  },

  // ===== TRẠNG THÁI =====

  status: {
    type: String,
    enum: [
      'pending',            // Chờ xử lý (dùng cho cả bottom_up và top_down)
      'in_progress',        // Đang xử lý (assignee đã nhận việc)
      'pending_approval',   // Chờ duyệt (dùng cho create_program: Subject Leader đã tạo xong, chờ Center Head duyệt)
      'need_revision',      // Yêu cầu chỉnh sửa
      'approved',           // Đã duyệt
      'rejected',           // Từ chối
      'completed'           // Hoàn thành
    ],
    default: 'pending',
    index: true
  },

  // ===== LÝ DO REJECT/NEED REVISION =====

  rejectionReason: {
    type: String,
    trim: true
  },

  // ===== FILES XỬ LÝ (cho create_class) =====

  // File từ Center Head gửi cho Academic Staff (thông tin khách hàng)
  inputFile: {
    fileName: String,
    fileUrl: String,
    uploadedAt: Date,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // File từ Academic Staff gửi lại Center Head (đã tạo tài khoản & xếp lớp)
  outputFile: {
    fileName: String,
    fileUrl: String,
    uploadedAt: Date,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // ===== ATTACHMENTS (cho create_program, edit_course, create_exam) =====

  // Tài liệu đính kèm (có thể là file zip chứa nhiều files)
  attachmentFile: {
    fileName: String,
    fileUrl: String,
    fileSize: Number,  // Size in bytes
    uploadedAt: Date,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // ===== LỊCH SỬ THAY ĐỔI =====

  history: [{
    action: {
      type: String,
      enum: [
        'created',           // Request được tạo
        'assigned',          // Được giao cho staff (top_down)
        'submitted',         // Submit để duyệt (bottom_up)
        'in_progress',       // Đang xử lý
        'pending_approval',  // Chờ duyệt (create_program: Subject Leader đã tạo xong)
        'completed',         // Hoàn thành
        'approved',          // Duyệt
        'rejected',          // Từ chối
        'need_revision',     // Yêu cầu chỉnh sửa
      ],
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
workRequestSchema.index({ status: 1, requestedAt: -1 });

// Index cho tìm request theo entity
workRequestSchema.index({ entityType: 1, entityId: 1 });

// Index cho tìm requests của người tạo
workRequestSchema.index({ requestedBy: 1, status: 1 });

// Index cho tìm requests được assign cho staff
workRequestSchema.index({ assignedTo: 1, status: 1 });

// Index cho tìm requests đã xử lý
workRequestSchema.index({ processedBy: 1, processedAt: -1 });

// Index theo direction và type
workRequestSchema.index({ direction: 1, requestType: 1, status: 1 });

// Unique constraint: 1 entity chỉ có 1 pending request tại 1 thời điểm (chỉ áp dụng cho bottom_up)
workRequestSchema.index(
  { entityType: 1, entityId: 1, status: 1, direction: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: 'pending',
      direction: 'bottom_up'
    }
  }
);

// ===== METHODS =====

// Thêm history entry
workRequestSchema.methods.addHistory = function(action, performedBy, note = null) {
  this.history.push({
    action,
    performedBy,
    performedAt: new Date(),
    note,
    previousStatus: this.status
  });
};

module.exports = mongoose.model('WorkRequest', workRequestSchema);