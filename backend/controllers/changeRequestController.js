const ChangeRequest = require('../models/changeRequestModel');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const ClassSchedule = require('../models/classScheduleModel');
const StudentSchedule = require('../models/studentScheduleModel');
const Class = require('../models/classModel');

// =========================
// 📋 LẤY DANH SÁCH TẤT CẢ ĐƠN
// =========================
exports.getAllChangeRequests = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search by content or sender name/email
    if (search) {
      // First, find users matching the search term
      const User = require('../models/userModel');
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id').lean();
      
      const userIds = matchingUsers.map(u => u._id);
      
      // Search in content or sender
      query.$or = [
        { content: { $regex: search, $options: 'i' } }
      ];
      
      if (userIds.length > 0) {
        query.$or.push({ sender: { $in: userIds } });
      }
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count
    const total = await ChangeRequest.countDocuments(query);
    
    // Get paginated results
    // Sắp xếp theo ngày gửi cũ nhất trước (để xử lý những đơn lâu nhất trước)
    const changeRequests = await ChangeRequest.find(query)
      .populate('sender', 'username email phone')
      .populate('approver', 'username email')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn thành công",
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      changeRequests
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách đơn:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy danh sách đơn",
      error: error.message 
    });
  }
};

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
// 📅 LẤY LỊCH HỌC/DẠY CỦA NGƯỜI GỬI ĐƠN
// =========================
exports.getSenderSchedule = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Lấy thông tin đơn
    const changeRequest = await ChangeRequest.findById(requestId)
      .populate('sender', 'username email roleId');
    
    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }
    
    const sender = changeRequest.sender;
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người gửi đơn'
      });
    }
    
    // Lấy role để xác định là học sinh hay giáo viên
    const role = await Role.findById(sender.roleId);
    const isStudent = role?.name === 'Student';
    const isTeacher = role?.name === 'Teacher';
    
    let schedules = [];
    
    if (isStudent) {
      // Lấy lịch học của học sinh - lấy tất cả lịch học (không giới hạn thời gian)
      const studentClasses = await Class.find({ students: sender._id })
        .select('_id name')
        .lean();
      
      if (studentClasses.length > 0) {
        const classIds = studentClasses.map(cls => cls._id);
        
        schedules = await ClassSchedule.find({
          class: { $in: classIds },
          status: { $in: ['temporary', 'fixed'] }
        })
        .populate({
          path: 'class',
          select: 'name',
          populate: {
            path: 'course',
            select: 'name'
          }
        })
        .populate('room', 'room_name location')
        .populate('session', 'title order')
        .sort({ date: 1, startTime: 1 })
        .lean();
        
        // Lấy thông tin điểm danh từ StudentSchedule
        const scheduleIds = schedules.map(s => s._id);
        const studentSchedules = await StudentSchedule.find({
          student: sender._id,
          classSchedule: { $in: scheduleIds }
        }).lean();
        
        // Tạo map classScheduleId -> attendance
        const attendanceMap = {};
        studentSchedules.forEach(ss => {
          if (ss.classSchedule) {
            attendanceMap[ss.classSchedule.toString()] = ss.attendance;
          }
        });
        
        // Thêm attendance vào mỗi schedule
        schedules = schedules.map(schedule => ({
          ...schedule,
          attendance: attendanceMap[schedule._id.toString()] || null
        }));
      }
    } else if (isTeacher) {
      // Lấy lịch dạy của giáo viên - lấy tất cả lịch dạy (không giới hạn thời gian)
      const teacherClasses = await Class.find({ teacher: sender._id })
        .select('_id name')
        .lean();
      
      if (teacherClasses.length > 0) {
        const classIds = teacherClasses.map(cls => cls._id);
        
        schedules = await ClassSchedule.find({
          class: { $in: classIds },
          status: { $in: ['temporary', 'fixed'] }
        })
        .populate({
          path: 'class',
          select: 'name',
          populate: {
            path: 'course',
            select: 'name'
          }
        })
        .populate('room', 'room_name location')
        .populate('session', 'title order')
        .sort({ date: 1, startTime: 1 })
        .lean();
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Lấy lịch thành công',
      sender: {
        _id: sender._id,
        username: sender.username,
        email: sender.email,
        role: role?.name || 'Unknown'
      },
      schedules
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch",
      error: error.message
    });
  }
};

