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
  // Thứ tự part/task trong bài thi tương ứng với kĩ năng 
  // -> Chia luyện đề theo kĩ năng nhưng cần đúng format của đề
  // Ví dụ: Listening gồm Part 1,2,3,4; Part 5,6,7 là reading (TOEIC)
  // Đề Cambridge pre A1 starters, movers mỗi phần kĩ năng có các part lẻ, gồm các câu hỏi lẻ
  // Đề IELTS tương tự mỗi phần có các part/task lẻ 
  partOrder: Number,
  fileUrl: String, 
  audioUrls: [String],
  instructions: String,
  duration: Number,
  questionCount: Number,
  answerKey: [answerKeySchema],
  maxScore: Number,
  part: Number
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
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    unpublishedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
