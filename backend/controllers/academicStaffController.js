const StudentSchedule = require('../models/studentScheduleModel');
const changeRequestController = require('./changeRequestController');


exports.approveChangeRequest = changeRequestController.approveChangeRequest;


exports.rejectChangeRequest = changeRequestController.rejectChangeRequest;


exports.getAttendanceByClassSchedule = async (req, res) => {
  try {
    const { classScheduleId } = req.params;
    const list = await StudentSchedule.find({ classSchedule: classScheduleId })
      .populate("student", "username")
      .populate({
        path: "classSchedule",
        populate: { path: "room", select: "room_name location" },
      });

    res.status(200).json({
      message: "Danh sách điểm danh của buổi học",
      total: list.length,
      attendances: list,
      list,
    });
  } catch (err) {
    console.error(" Lỗi khi lấy danh sách:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

