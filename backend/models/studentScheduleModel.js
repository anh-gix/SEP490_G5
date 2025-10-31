const mongoose = require("mongoose");

const studentScheduleSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  classSchedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassSchedule",
    required: true,
  },

  // Cho phép điều chỉnh lịch riêng nếu có (ví dụ dời ngày, đổi phòng)
  newDate: Date,
  newStartTime: String,
  newEndTime: String,
  newRoom: String,

  // 🆕 Trường điểm danh
  attendance: {
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      default: "absent",
    },
    checkInTime: Date,
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
}, { timestamps: true });

module.exports = mongoose.model("StudentSchedule", studentScheduleSchema);
