const Room = require("../models/room");
const ClassSchedule = require("../models/classScheduleModel");

// =========================
// 📋 LẤY DANH SÁCH PHÒNG HỌC
// =========================
exports.getAllRooms = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search by room name or location
    if (search) {
      query.$or = [
        { room_name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    const rooms = await Room.find(query).sort({ room_name: 1 });
    
    res.status(200).json({
      message: "Lấy danh sách phòng học thành công",
      total: rooms.length,
      rooms
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách phòng:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy danh sách phòng",
      error: error.message 
    });
  }
};

// =========================
// 🔍 LẤY THÔNG TIN 1 PHÒNG
// =========================
exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng học" });
    }
    
    res.status(200).json({
      message: "Lấy thông tin phòng thành công",
      room
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin phòng:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy thông tin phòng",
      error: error.message 
    });
  }
};

// =========================
// ➕ TẠO PHÒNG MỚI
// =========================
exports.createRoom = async (req, res) => {
  try {
    const { room_name, capacity, location, description, status } = req.body;
    
    // Validate required fields
    if (!room_name || !capacity || !location) {
      return res.status(400).json({ 
        message: "Thiếu thông tin bắt buộc (room_name, capacity, location)" 
      });
    }
    
    // Check if room name already exists
    const existingRoom = await Room.findOne({ room_name });
    if (existingRoom) {
      return res.status(400).json({ 
        message: "Tên phòng đã tồn tại" 
      });
    }
    
    const newRoom = await Room.create({
      room_name,
      capacity,
      location,
      description,
      status: status || 'available'
    });
    
    res.status(201).json({
      message: "Tạo phòng học thành công",
      room: newRoom
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo phòng:", error);
    res.status(500).json({ 
      message: "Lỗi server khi tạo phòng",
      error: error.message 
    });
  }
};

// =========================
// ✏️ CẬP NHẬT PHÒNG
// =========================
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_name, capacity, location, description, status } = req.body;
    
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng học" });
    }
    
    // Check if new room name already exists (excluding current room)
    if (room_name && room_name !== room.room_name) {
      const existingRoom = await Room.findOne({ 
        room_name, 
        _id: { $ne: id } 
      });
      if (existingRoom) {
        return res.status(400).json({ 
          message: "Tên phòng đã tồn tại" 
        });
      }
    }
    
    // Update fields
    if (room_name) room.room_name = room_name;
    if (capacity) room.capacity = capacity;
    if (location) room.location = location;
    if (description !== undefined) room.description = description;
    if (status) room.status = status;
    
    await room.save();
    
    res.status(200).json({
      message: "Cập nhật phòng học thành công",
      room
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật phòng:", error);
    res.status(500).json({ 
      message: "Lỗi server khi cập nhật phòng",
      error: error.message 
    });
  }
};

// =========================
// 🗑️ XÓA PHÒNG
// =========================
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if room is being used in any schedules
    const schedulesUsingRoom = await ClassSchedule.countDocuments({ room: id });
    
    if (schedulesUsingRoom > 0) {
      return res.status(400).json({ 
        message: `Không thể xóa phòng. Có ${schedulesUsingRoom} lịch học đang sử dụng phòng này.`,
        schedulesCount: schedulesUsingRoom
      });
    }
    
    const room = await Room.findByIdAndDelete(id);
    
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng học" });
    }
    
    res.status(200).json({
      message: "Xóa phòng học thành công",
      room
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa phòng:", error);
    res.status(500).json({ 
      message: "Lỗi server khi xóa phòng",
      error: error.message 
    });
  }
};

// =========================
// 📅 LẤY LỊCH SỬ DỤNG PHÒNG
// =========================
exports.getRoomSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // Optional: filter by specific date
    
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng học" });
    }
    
    let query = { room: id };
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const schedules = await ClassSchedule.find(query)
      .populate({
        path: 'class',
        select: 'name subject teacherId',
        populate: {
          path: 'teacherId',
          select: 'username email'
        }
      })
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      message: "Lấy lịch sử dụng phòng thành công",
      room: {
        _id: room._id,
        room_name: room.room_name,
        location: room.location,
        capacity: room.capacity
      },
      total: schedules.length,
      schedules
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch phòng:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy lịch phòng",
      error: error.message 
    });
  }
};

// =========================
// 📊 THỐNG KÊ PHÒNG HỌC
// =========================
exports.getRoomStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'available' });
    const inUseRooms = await Room.countDocuments({ status: 'in_use' });
    const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });
    
    // Get today's schedules
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaySchedules = await ClassSchedule.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });
    
    res.status(200).json({
      message: "Lấy thống kê phòng học thành công",
      stats: {
        total: totalRooms,
        available: availableRooms,
        inUse: inUseRooms,
        maintenance: maintenanceRooms,
        todaySchedules
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê phòng:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy thống kê phòng",
      error: error.message 
    });
  }
};
