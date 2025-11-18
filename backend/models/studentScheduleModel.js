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
  // Trạng thái lịch học
  scheduleStatus: {
    type: String,
    enum: ["scheduled", "cancelled", "rescheduled", "completed", "pending"],
    default: "scheduled",
  },
  // Lý do (cho cancelled, rescheduled, etc.)
  reason: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("StudentSchedule", studentScheduleSchema);
