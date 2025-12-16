const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  // Thêm room (id)
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  maxStudents: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Class", classSchema);
