const ClassSchedule = require('../models/classScheduleModel');
const Class = require('../models/classModel');
const Room = require('../models/room');
const Course = require('../models/courseModel');
const Session = require('../models/sessionModel');

/**
 * GET /api/schedules
 * Lấy danh sách tất cả lịch học với filters
 */
exports.getAllSchedules = async (req, res) => {
  try {
    const { classId, teacherId, roomId, startDate, endDate, status } = req.query;
    
    let query = {};
    
    if (classId) query.class = classId;
    if (roomId) query.room = roomId;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    let schedules = await ClassSchedule.find(query)
      .populate({
        path: 'class',
        select: 'name level teacher startDate endDate', // Thêm startDate và endDate để check conflict
        populate: { path: 'teacher', select: 'username email' }
      })
      .populate('teacher', 'username email') // Populate teacher field directly from ClassSchedule
      .populate('room', 'room_name location capacity')
      .populate('session', 'title order')
      .populate('createdBy', 'username email')
      .sort({ date: 1, startTime: 1 });
    
    // Filter by teacher if specified
    if (teacherId) {
      schedules = schedules.filter(s => {
        const scheduleTeacherId = s.teacher?._id?.toString();
        const classTeacherId = s.class?.teacher?._id?.toString();
        return scheduleTeacherId === teacherId || classTeacherId === teacherId;
      });
    }
    
    res.status(200).json({
      success: true,
      count: schedules.length,
      schedules
    });
  } catch (error) {
    console.error('Error in getAllSchedules:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lịch học',
      error: error.message
    });
  }
};

/**
 * GET /api/schedules/stats
 * Thống kê lịch học
 */
exports.getScheduleStats = async (req, res) => {
  try {
    const total = await ClassSchedule.countDocuments();
    const pending = await ClassSchedule.countDocuments({ status: 'pending_approval' });
    const approved = await ClassSchedule.countDocuments({ status: 'approved' });
    const rejected = await ClassSchedule.countDocuments({ status: 'rejected' });
    
    // Today's schedules
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaySchedules = await ClassSchedule.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'approved'
    });
    
    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        todaySchedules
      }
    });
  } catch (error) {
    console.error('Error in getScheduleStats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê lịch học',
      error: error.message
    });
  }
};

/**
 * GET /api/schedules/:id
 * Lấy chi tiết lịch học
 */
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await ClassSchedule.findById(req.params.id)
      .populate({
        path: 'class',
        select: 'name level teacher students course',
        populate: [
          { path: 'teacher', select: 'username email phone' },
          { path: 'students', select: 'username email' },
          { 
            path: 'course', 
            select: 'name type level band materials',
            populate: { path: 'program', select: 'program_name name' }
          }
        ]
      })
      .populate('teacher', 'username email') // Populate teacher field directly from ClassSchedule
      .populate('room', 'room_name location capacity')
      .populate({
        path: 'session',
        select: 'title order description content clos',
        populate: {
          path: 'clos',
          select: 'code name detail documentUrl documentPath'
        }
      })
      .populate('createdBy', 'username email');
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch học'
      });
    }
    
    res.status(200).json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error('Error in getScheduleById:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin lịch học',
      error: error.message
    });
  }
};

/**
 * POST /api/schedules
 * Tạo lịch học mới
 */
exports.createSchedule = async (req, res) => {
  try {
    const {
      class: classId,
      session,
      topic,
      date,
      startTime,
      endTime,
      room,
      reason,
      status = 'draft',
      createdBy
    } = req.body;
    
    // Validate
    if (!classId || !topic || !date || !startTime || !endTime || !room || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }
    
    // Check conflict
    const conflict = await ClassSchedule.findOne({
      room,
      date: new Date(date),
      status: { $in: ['approved', 'pending_approval'] },
      $or: [
        { $and: [{ startTime: { $lte: startTime } }, { endTime: { $gt: startTime } }] },
        { $and: [{ startTime: { $lt: endTime } }, { endTime: { $gte: endTime } }] },
        { $and: [{ startTime: { $gte: startTime } }, { endTime: { $lte: endTime } }] }
      ]
    });
    
    if (conflict) {
      const roomData = await Room.findById(room);
      return res.status(400).json({
        success: false,
        message: `Phòng ${roomData?.room_name} đã được đặt từ ${conflict.startTime} - ${conflict.endTime}`
      });
    }
    
    const newSchedule = new ClassSchedule({
      class: classId,
      session,
      topic,
      date,
      startTime,
      endTime,
      room,
      createdBy: createdBy || req.user?._id,
      reason,
      status
    });
    
    await newSchedule.save();
    
    // Kiểm tra và cập nhật learningType nếu đến ngày test
    if (session) {
      try {
        const classData = await Class.findById(classId).populate('course', 'testDate');
        if (classData?.course?.testDate) {
          const scheduleDate = new Date(date);
          const testDate = new Date(classData.course.testDate);
          // Chỉ so sánh ngày, không so sánh giờ
          scheduleDate.setHours(0, 0, 0, 0);
          testDate.setHours(0, 0, 0, 0);
          
          if (scheduleDate >= testDate) {
            await Session.findByIdAndUpdate(session, { learningType: 'test' });
            console.log(`✅ Updated session ${session} learningType to 'test' (schedule date >= test date)`);
          }
        }
      } catch (err) {
        console.error('⚠️ Error checking/updating test date:', err);
        // Không throw error, chỉ log để không ảnh hưởng đến việc tạo schedule
      }
    }
    
    const populatedSchedule = await ClassSchedule.findById(newSchedule._id)
      .populate('class', 'name level')
      .populate('room', 'room_name location');
    
    res.status(201).json({
      success: true,
      message: 'Tạo lịch học thành công',
      schedule: populatedSchedule
    });
  } catch (error) {
    console.error('Error in createSchedule:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo lịch học',
      error: error.message
    });
  }
};

/**
 * PUT /api/schedules/:id
 * Cập nhật lịch học
 */
exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await ClassSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch học'
      });
    }
    
    const { class: classId, session, topic, date, startTime, endTime, room, reason, status } = req.body;
    
    // Update fields
    if (classId) schedule.class = classId;
    if (session) schedule.session = session;
    if (topic) schedule.topic = topic;
    if (date) schedule.date = date;
    if (startTime) schedule.startTime = startTime;
    if (endTime) schedule.endTime = endTime;
    if (room) schedule.room = room;
    if (reason) schedule.reason = reason;
    if (status) schedule.status = status;
    
    await schedule.save();
    
    const updatedSchedule = await ClassSchedule.findById(schedule._id)
      .populate('class', 'name level')
      .populate('room', 'room_name location');
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật lịch học thành công',
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('Error in updateSchedule:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật lịch học',
      error: error.message
    });
  }
};

/**
 * DELETE /api/schedules/:id
 * Xóa lịch học
 */
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await ClassSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch học'
      });
    }
    
    await ClassSchedule.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Xóa lịch học thành công'
    });
  } catch (error) {
    console.error('Error in deleteSchedule:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lịch học',
      error: error.message
    });
  }
};

//lấy danh sách lịch học chờ phê duyệt
exports.getPendingSchedules = async (req, res) => {
    try {
        const pendingSchedules = await ClassSchedule.find({ status: 'pending_approval' })
            .populate('class', 'name') 
            .populate('createdBy', 'name')
            .populate('room', 'name') 
            .sort({ createdAt: 1 }); 

        res.status(200).json({
            success: true,
            count: pendingSchedules.length,
            data: pendingSchedules
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
};

//duyệt lịch học
exports.approveSchedule = async (req, res) => {
    try {
        const schedule = await ClassSchedule.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'approved',
                rejectionReason: null
            },
            { new: true }
        );

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy lịch học' });
        }

        res.status(200).json({
            success: true,
            message: 'Đã phê duyệt lịch học.',
            data: schedule
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
};

exports.rejectSchedule = async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp lý do từ chối.' });
    }

    try {
        const schedule = await ClassSchedule.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'rejected',
                rejectionReason: reason
            },
            { new: true }
        );

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy lịch học' });
        }

        res.status(200).json({
            success: true,
            message: 'Đã từ chối lịch học.',
            data: schedule
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
};

