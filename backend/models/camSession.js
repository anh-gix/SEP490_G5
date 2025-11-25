const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  Img: { type: String },
  Question: { type: String },
  Answer: [{ type: String }],
  AnswerKey: [{ type: String }],
});

const camSessionSchema = new mongoose.Schema(
  {
    Title: { type: String },
    Des: { type: String },
    Order: { type: Number },
    videoURL: { type: String },
    Quiz: [quizSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CamSession", camSessionSchema);