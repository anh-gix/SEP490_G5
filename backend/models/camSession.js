const e = require("express");
const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  Type: { type: String , enum: ['multiple-choice', 'yes-no', 'spell', 'word-from-box'] },
  Img: { type: String },
  Question: { type: String },
  Answer: [{ type: String }],
  AnswerKey: [{ type: String }],
});

const camSessionSchema = new mongoose.Schema(
  {
    title: { type: String },
    // Phân loại kiến thức của các bài học trong khóa online cambridge
    sessionType: { type: String, enum: ['reading', 'listening', 'speaking', 'writing'] },
    description: { type: String },
    // Thứ tự bài học trong khóa học
    order: { type: Number },
    // Video bài giảng
    videoURL: { 
      type: String, 
      isCompleted: { type: Boolean, default: false }
    },
    // Quiz kiến thức trong lesson
    quizzes: {
      quiz:[quizSchema],
      isCompleted: { type: Boolean, default: false }
    },
    // Flashcard từ vựng trong lesson
    vocabulary: {
      img: { type: String },
      words: [{ type: String }],
      isCompleted: { type: Boolean, default: false }
    },
    isSessionCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CamSession", camSessionSchema);