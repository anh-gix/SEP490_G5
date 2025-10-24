const mongoose = require("mongoose");

const classScheduleSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  sessionNumber: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("ClassSchedule", classScheduleSchema);
