// controllers/ministryController.js
const Room = require("../models/room");

// 🏫 Xem tất cả các phòng
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 }); // sắp xếp mới nhất lên đầu
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách phòng",
    });
  }
};
