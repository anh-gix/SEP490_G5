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
    const { date, startDate, endDate } = req.query; // Optional: filter by specific date or date range
    
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng học" });
    }
    
    let query = { room: id, status: { $in: ['temporary', 'fixed'] } };
    
    // Filter by date range if provided (priority over single date)
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (date) {
      // Filter by single date if provided
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
        populate: [
          {
            path: 'teacherId',
            select: 'username email'
          },
          {
            path: 'course',
            select: 'name',
            populate: {
              path: 'program',
              select: 'type program_name'
            }
          }
        ]
      })
      .populate('session', 'title order') // Populate session để lấy title
      .sort({ date: 1, startTime: 1 })
      .lean();
    
    res.status(200).json({
      message: "Lấy lịch sử dụng phòng thành công",
      success: true,
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

// =========================
// 📅 LẤY LỊCH SỬ DỤNG PHÒNG HÔM NAY
// =========================
exports.getTodayRoomUsage = async (req, res) => {
  try {
    // Tạo date range cho ngày hôm nay sử dụng date string format
    const now = new Date();
    const todayString = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // Tạo start và end của ngày ở UTC midnight để khớp với MongoDB
    const todayStart = new Date(todayString);
    const todayEnd = new Date(todayString);
    todayEnd.setUTCHours(23, 59, 59, 999);

    // Get today's schedules with populated data
    const todaySchedules = await ClassSchedule.find({
      date: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['temporary', 'fixed'] }
    })
      .populate('class', 'name level course')
      .populate('room', 'room_name location')
      .sort({ startTime: 1 })
      .lean();

    // Get unique time slots from database (from schedules in the current month)
    // Lấy time slots từ database thay vì hardcode
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const allSchedulesForTimeSlots = await ClassSchedule.find({
      date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      status: { $in: ['temporary', 'fixed'] }
    })
      .select('startTime endTime')
      .lean();
    
    // Extract unique time slots and normalize them
    const normalizeTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : '';
    const timeSlotSet = new Set();
    
    allSchedulesForTimeSlots.forEach(schedule => {
      if (schedule.startTime && schedule.endTime) {
        const start = normalizeTime(schedule.startTime);
        const end = normalizeTime(schedule.endTime);
        if (start && end) {
          timeSlotSet.add(`${start}-${end}`);
        }
      }
    });
    
    // Convert to array and sort by start time
    let timeSlots = Array.from(timeSlotSet).sort((a, b) => {
      const [startA] = a.split('-');
      const [startB] = b.split('-');
      return startA.localeCompare(startB);
    });
    
    // Fallback to default time slots if no schedules found
    if (timeSlots.length === 0) {
      timeSlots = ['08:00-10:00', '10:30-12:30', '14:00-16:00', '18:00-20:00'];
    }

    // Get all rooms
    const rooms = await Room.find()
      .select('room_name location')
      .sort({ room_name: 1 })
      .lean();

    // Build room schedule data using dynamic time slots
    const roomScheduleData = rooms.map(room => {
      const schedules = timeSlots.map(timeSlot => {
        const [startTime, endTime] = timeSlot.split('-');
        // Normalize time strings (remove seconds if present) for comparison
        const normalizeTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : '';
        const matchingSchedule = todaySchedules.find(s => 
          s.room?._id?.toString() === room._id?.toString() &&
          normalizeTime(s.startTime) === startTime &&
          normalizeTime(s.endTime) === endTime
        );
        
        if (matchingSchedule) {
          return {
            time: timeSlot,
            class: matchingSchedule.class?.name || 'N/A',
            status: 'occupied'
          };
        }
        return {
          time: timeSlot,
          class: 'Free',
          status: 'available'
        };
      });

      return {
        room: room.room_name || 'N/A',
        location: room.location || 'N/A',
        schedules
      };
    });

    res.status(200).json({
      message: "Lấy lịch sử dụng phòng hôm nay thành công",
      success: true,
      roomSchedule: roomScheduleData,
      timeSlots: timeSlots // Include time slots in response
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch sử dụng phòng hôm nay:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy lịch sử dụng phòng hôm nay",
      error: error.message 
    });
  }
};
