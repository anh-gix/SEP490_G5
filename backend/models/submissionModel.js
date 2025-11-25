const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionNumber: Number,
  answerText: String,
  selectedOption: String,
  recordingUrl: String,
  score: { type: Number, default: 0 },
});

const sectionSubmissionSchema = new mongoose.Schema({
  sectionType: {
    type: String,
    enum: ["reading", "listening", "writing", "speaking"],
  },
  submittedAt: Date,
  answers: [answerSchema],
  sectionScore: { type: Number, default: 0 },
  feedback: String,
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  gradedAt: Date,
});

const submissionSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["in-progress", "partially-submitted", "completed", "graded"],
      default: "in-progress",
    },
    sections: [sectionSubmissionSchema],
    totalScore: { type: Number, default: 0 },
    bandScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
