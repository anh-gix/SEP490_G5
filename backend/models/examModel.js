const mongoose = require("mongoose");

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
  maxScore: Number,
  // Điểm của section
  score: {
    type: Number,
    default: 0
  },
  // Đề bài trong section (có thể là file hoặc text)
  questionPaper: {
    type: String // URL hoặc path đến file đề bài
  },
  questionPaperText: {
    type: String // Nội dung đề bài dạng text
  },
  // Đáp án trong section
  answers: [{
    questionNumber: { type: Number, required: true },
    answer: { type: String },
    isCorrect: { type: Boolean, default: false }
  }]
});

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Người làm bài (user id)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    examType: { type: String, enum: ["practice", "real"], default: "practice" },
    level: { type: String, enum: ["Academic", "General"], required: true },
    totalDuration: Number,
    sections: [sectionSchema],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
