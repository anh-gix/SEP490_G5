const StudentSchedule = require('../models/studentScheduleModel');
const changeRequestController = require('./changeRequestController');

// =========================
// ✅ CHẤP NHẬN ĐƠN (Re-export từ changeRequestController để tránh duplicate code)
// =========================
exports.approveChangeRequest = changeRequestController.approveChangeRequest;

// =========================
// ❌ TỪ CHỐI ĐƠN (Re-export từ changeRequestController để tránh duplicate code)
// =========================
exports.rejectChangeRequest = changeRequestController.rejectChangeRequest;

// =========================
// 📋 LẤY DANH SÁCH ĐIỂM DANH CỦA MỘT BUỔI HỌC
// =========================
exports.getAttendanceByClassSchedule = async (req, res) => {
  try {
    const { classScheduleId } = req.params;
    const list = await StudentSchedule.find({ classSchedule: classScheduleId })
      .populate("student", "username")
      .populate({
        path: "classSchedule",
        populate: { path: "room", select: "room_name location" }, // ✅ thêm populate room
      });

    res.status(200).json({
      message: "Danh sách điểm danh của buổi học",
      total: list.length,
      attendances: list,
      list, // Giữ lại để backward compatibility
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

