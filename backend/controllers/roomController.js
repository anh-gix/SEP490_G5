const Room = require('../models/room');
const ClassSchedule = require('../models/classScheduleModel');

// =========================
// ROOM CRUD OPERATIONS
// =========================

/**
 * Get all rooms with statistics
 * GET /api/rooms
 */
const getAllRooms = async (req, res) => {
  try {
    const { search = '', status = '' } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { room_name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const rooms = await Room.find(query)
      .sort({ createdAt: -1 });

    // Get usage statistics for each room today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const roomsWithStats = await Promise.all(
      rooms.map(async (room) => {
        const todaySchedules = await ClassSchedule.countDocuments({
          room: room._id,
          date: {
            $gte: today,
            $lt: tomorrow
          },
          status: 'approved'
        });

        return {
          ...room.toObject(),
          todayUsage: {
            used: todaySchedules,
            total: 8 // Assuming 8 time slots per day
          }
        };
      })
    );

    // Get status statistics
    const stats = {
      total: rooms.length,
      available: await Room.countDocuments({ status: 'available' }),
      inUse: await Room.countDocuments({ status: 'in_use' }),
      maintenance: await Room.countDocuments({ status: 'maintenance' })
    };

    res.status(200).json({
      success: true,
      data: roomsWithStats,
      stats,
      count: rooms.length
    });
  } catch (error) {
    console.error('Error getting rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phòng',
      error: error.message
    });
  }
};

/**
 * Get room by ID with details
 * GET /api/rooms/:id
 */
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    // Get upcoming schedules for this room
    const upcomingSchedules = await ClassSchedule.find({
      room: id,
      date: { $gte: new Date() },
      status: 'approved'
    })
      .populate({
        path: 'class',
        select: 'name subject',
        populate: {
          path: 'teacherId',
          select: 'username email'
        }
      })
      .sort({ date: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        ...room.toObject(),
        upcomingSchedules
      }
    });
  } catch (error) {
    console.error('Error getting room by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin phòng',
      error: error.message
    });
  }
};

/**
 * Create new room
 * POST /api/rooms
 */
const createRoom = async (req, res) => {
  try {
    const { room_name, location, capacity, description } = req.body;

    // Validation
    if (!room_name || !location || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Tên phòng, vị trí và sức chứa là bắt buộc'
      });
    }

    if (capacity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Sức chứa phải lớn hơn 0'
      });
    }

    // Check if room name already exists
    const existingRoom = await Room.findOne({ room_name });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Tên phòng đã tồn tại'
      });
    }

    const room = await Room.create({
      room_name,
      location,
      capacity,
      description,
      status: 'available'
    });

    res.status(201).json({
      success: true,
      message: 'Tạo phòng thành công',
      data: room
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo phòng',
      error: error.message
    });
  }
};

/**
 * Update room
 * PUT /api/rooms/:id
 */
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_name, location, capacity, description, status } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    // Check if new room name already exists (if name is being changed)
    if (room_name && room_name !== room.room_name) {
      const existingRoom = await Room.findOne({ room_name });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: 'Tên phòng đã tồn tại'
        });
      }
    }

    // Update fields
    if (room_name) room.room_name = room_name;
    if (location) room.location = location;
    if (capacity) {
      if (capacity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Sức chứa phải lớn hơn 0'
        });
      }
      room.capacity = capacity;
    }
    if (description !== undefined) room.description = description;
    if (status) room.status = status;

    await room.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật phòng thành công',
      data: room
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật phòng',
      error: error.message
    });
  }
};

/**
 * Delete room
 * DELETE /api/rooms/:id
 */
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    // Check if room has any upcoming schedules
    const upcomingSchedules = await ClassSchedule.countDocuments({
      room: id,
      date: { $gte: new Date() },
      status: { $in: ['pending_approval', 'approved'] }
    });

    if (upcomingSchedules > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa phòng đang có lịch học sắp tới'
      });
    }

    await Room.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa phòng thành công'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa phòng',
      error: error.message
    });
  }
};

/**
 * Update room status
 * PUT /api/rooms/:id/status
 */
const updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['available', 'in_use', 'maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    room.status = status;
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái phòng thành công',
      data: room
    });
  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái phòng',
      error: error.message
    });
  }
};

/**
 * Get room usage history
 * GET /api/rooms/:id/usage
 */
const getRoomUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    // Build date range query
    const dateQuery = {};
    if (startDate) {
      dateQuery.$gte = new Date(startDate);
    }
    if (endDate) {
      dateQuery.$lte = new Date(endDate);
    }

    const query = {
      room: id,
      status: 'approved'
    };
    if (Object.keys(dateQuery).length > 0) {
      query.date = dateQuery;
    }

    const schedules = await ClassSchedule.find(query)
      .populate({
        path: 'class',
        select: 'name subject',
        populate: {
          path: 'teacherId',
          select: 'username email'
        }
      })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Error getting room usage:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử sử dụng phòng',
      error: error.message
    });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getRoomUsage
};
