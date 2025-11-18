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
  // Answer key for grading (correct answers)
  answerKey: [{
    questionNumber: { type: Number, required: true },
    correctAnswer: { type: String },
    maxScore: { type: Number, default: 1 },
    questionType: { type: String, enum: ["multiple_choice", "true_false", "input", "essay"] }
  }]
});

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    examType: { type: String, enum: ["practice", "real"], default: "practice" },
    level: { type: String, enum: ["Academic", "General"], required: true },
    totalDuration: Number,
    sections: [sectionSchema],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
