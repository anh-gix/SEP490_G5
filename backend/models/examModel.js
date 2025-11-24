const mongoose = require("mongoose");

const answerKeySchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  questionTitle: { type: String, required: true },
  questionAnswer: [{
    key: { type: String, required: true },
    text: { type: String, required: true } 
  }],
  correctAnswer: [{ type: String, required: true }],
  maxScore: { type: Number, default: 1 },
  questionType: { type: String, enum: ["multiple_choice", "true_false", "input",] },
  tags: [{
    type: String,
    enum: ["grammar", "vocabulary", "listening", "reading_comprehension", "writing", "speaking"]
  }],
});

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
});

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    examType: { type: String, enum: ["ielts", "toeic","cambridge"], default: "ielts" },
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
