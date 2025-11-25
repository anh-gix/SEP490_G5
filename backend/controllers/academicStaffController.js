const ChangeRequest = require('../models/changeRequestModel');
const StudentSchedule = require('../models/studentScheduleModel');

// =========================
// ✅ CHẤP NHẬN ĐƠN
// =========================
exports.approveChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const approverId = req.user?._id || req.body.approverId; // Lấy từ token hoặc body
    
    const changeRequest = await ChangeRequest.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approver: approverId,
        approvedDate: new Date()
      },
      { new: true }
    )
    .populate('sender', 'username email phone')
    .populate('approver', 'username email');
    
    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Đã chấp nhận đơn thành công',
      changeRequest
    });
  } catch (error) {
    console.error("❌ Lỗi khi chấp nhận đơn:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi chấp nhận đơn",
      error: error.message
    });
  }
};

// =========================
// ❌ TỪ CHỐI ĐƠN
// =========================
exports.rejectChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { responseContent } = req.body; // Lý do từ chối (không bắt buộc)
    const approverId = req.user?._id || req.body.approverId; // Lấy từ token hoặc body
    
    const changeRequest = await ChangeRequest.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        approver: approverId,
        approvedDate: new Date(),
        responseContent: responseContent || null
      },
      { new: true }
    )
    .populate('sender', 'username email phone')
    .populate('approver', 'username email');
    
    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Đã từ chối đơn thành công',
      changeRequest
    });
  } catch (error) {
    console.error("❌ Lỗi khi từ chối đơn:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi từ chối đơn",
      error: error.message
    });
  }
};

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

