const mongoose = require("mongoose");

const answerKeySchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  questionTitle: { type: String, required: true },
  questionAnswer: [{
      key: { type: String, required: true },
      text: { type: String, required: true } 
    }],
  questionType: {
    type: String,
    enum: ["multiple_choice", "true_false", "input"],
    required: true
  },
  correctAnswer: [{ type: String, required: true }],
  maxScore: { type: Number, default: 1 },
  tags: [{
    type: String,
    enum: ["grammar", "vocabulary", "listening", "reading_comprehension", "writing", "speaking"]
  }]
});

// Phân loại kĩ năng cho các part trong đề thi
const sectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["listening", "reading", "writing", "speaking"],
    required: true,
  },
  fileUrl: String, 
  audioUrls: [String],
  instructions: String,
  duration: Number,
  questionCount: Number,
  answerKey: [answerKeySchema],
  maxScore: Number,
  part: Number,
});

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    examType: { type: String, enum: ["cambridge","ielts","toeic"], default: "cambridge" },
    level: { type: String, enum: ["Academic", "General"], required: true },
    totalDuration: Number,
    sections: [sectionSchema],

    // ===== WIZARD PROGRESS =====
    lastCompletedStep: { type: Number, default: 0 }, // 0: chưa hoàn thành step nào, 1-4: step đã hoàn thành

    // ===== STATUS ĐỂ XEM EXAM ĐÃ ĐƯỢC DUYỆT CHƯA =====
    // Tất cả thông tin chi tiết về submission, approval, rejection được lưu trong WorkRequest model
    status: {
      type: String,
      enum: [
        'draft',              // Đang soạn
        'pending_approval',   // Đã submit, chờ Center Head duyệt
        'approved',           // Center Head đã duyệt
        'needs_revision',     // Center Head yêu cầu chỉnh sửa
        'active'            // Đã lưu trữ
      ],
      default: 'draft'
    },

    // Giữ lại isPublished để quản lý việc publish exam cho học viên
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    unpublishedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
