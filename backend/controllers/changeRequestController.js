const ChangeRequest = require('../models/changeRequestModel');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const ClassSchedule = require('../models/classScheduleModel');
const StudentSchedule = require('../models/studentScheduleModel');
const Class = require('../models/classModel');
const mongoose = require('mongoose');

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
      // Lấy TẤT CẢ StudentSchedule của học sinh (bao gồm cả buổi học bù ở lớp khác)
      const allStudentSchedules = await StudentSchedule.find({
        student: sender._id
      })
      .populate({
        path: 'classSchedule',
        select: 'date startTime endTime class room session status topic teacher createdBy reason',
        populate: [
          {
            path: 'class',
            select: 'name',
            populate: {
              path: 'course',
              select: 'name'
            }
          },
          {
            path: 'room',
            select: 'room_name location'
          },
          {
            path: 'session',
            select: 'title order'
          },
          {
            path: 'teacher',
            select: 'username email'
          }
        ]
      })
      .lean();
      
      // Chuyển đổi StudentSchedule thành format giống ClassSchedule để tương thích với frontend
      schedules = allStudentSchedules
        .filter(ss => ss.classSchedule) // Chỉ lấy những cái có classSchedule hợp lệ
        .map(ss => {
          const classSchedule = ss.classSchedule;
          return {
            _id: classSchedule._id,
            date: classSchedule.date,
            startTime: classSchedule.startTime,
            endTime: classSchedule.endTime,
            status: classSchedule.status,
            topic: classSchedule.topic,
            class: classSchedule.class,
            room: classSchedule.room,
            session: classSchedule.session,
            teacher: classSchedule.teacher,
            createdBy: classSchedule.createdBy,
            reason: classSchedule.reason,
            // Thông tin từ StudentSchedule
            attendance: ss.attendance || null,
            scheduleStatus: ss.scheduleStatus || 'scheduled',
            studentScheduleReason: ss.reason || null
          };
        })
        .sort((a, b) => {
          // Sắp xếp theo date và startTime
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          return (a.startTime || '').localeCompare(b.startTime || '');
        });
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

// =========================
// ✅ CHẤP NHẬN ĐƠN
// =========================
exports.approveChangeRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { pendingMakeupClasses, pendingClassChange } = req.body;
    const approverId = req.user?._id || req.body.approverId; // Lấy từ token hoặc body
    
    // Lấy thông tin đơn trước khi cập nhật
    const changeRequest = await ChangeRequest.findById(id)
      .populate('sender', 'username email phone')
      .session(session);
    
    if (!changeRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }
    
    const studentId = changeRequest.sender._id || changeRequest.sender;
    
    // Xử lý buổi học bù nếu có
    if (pendingMakeupClasses && Array.isArray(pendingMakeupClasses) && pendingMakeupClasses.length > 0) {
      console.log(`📚 Xử lý ${pendingMakeupClasses.length} buổi học bù cho học sinh ${studentId}`);
      
      for (const makeup of pendingMakeupClasses) {
        const { absentScheduleId, makeupScheduleId, makeupClassId } = makeup;
        
        if (!absentScheduleId || !makeupScheduleId) {
          console.warn('⚠️ Thiếu thông tin buổi học bù:', makeup);
          continue;
        }
        
        // Kiểm tra ClassSchedule có tồn tại không
        const makeupClassSchedule = await ClassSchedule.findById(makeupScheduleId).session(session);
        const absentClassSchedule = await ClassSchedule.findById(absentScheduleId).session(session);
        
        if (!makeupClassSchedule) {
          console.warn(`⚠️ Không tìm thấy ClassSchedule cho buổi học bù: ${makeupScheduleId}`);
          continue;
        }
        
        if (!absentClassSchedule) {
          console.warn(`⚠️ Không tìm thấy ClassSchedule cho buổi nghỉ: ${absentScheduleId}`);
          continue;
        }
        
        // Kiểm tra xem đã có StudentSchedule cho buổi học bù chưa (tránh duplicate)
        const existingMakeupSchedule = await StudentSchedule.findOne({
          student: studentId,
          classSchedule: makeupScheduleId
        }).session(session);
        
        if (!existingMakeupSchedule) {
          // Tạo StudentSchedule mới cho buổi học bù
          const newStudentSchedule = new StudentSchedule({
            student: studentId,
            classSchedule: makeupScheduleId,
            scheduleStatus: 'rescheduled',
            reason: `Học bù cho buổi nghỉ ngày ${new Date(absentClassSchedule.date).toLocaleDateString('vi-VN')}`
          });
          
          await newStudentSchedule.save({ session });
          console.log(`✅ Đã tạo StudentSchedule cho buổi học bù: ${makeupScheduleId}`);
        } else {
          console.log(`ℹ️ StudentSchedule cho buổi học bù đã tồn tại: ${makeupScheduleId}`);
        }
        
        // Cập nhật StudentSchedule của buổi nghỉ thành cancelled
        const absentStudentSchedule = await StudentSchedule.findOne({
          student: studentId,
          classSchedule: absentScheduleId
        }).session(session);
        
        if (absentStudentSchedule) {
          absentStudentSchedule.scheduleStatus = 'cancelled';
          absentStudentSchedule.reason = `Học bù tại lớp khác (${makeupClassId})`;
          await absentStudentSchedule.save({ session });
          console.log(`✅ Đã cập nhật StudentSchedule buổi nghỉ thành cancelled: ${absentScheduleId}`);
        } else {
          console.warn(`⚠️ Không tìm thấy StudentSchedule cho buổi nghỉ: ${absentScheduleId}`);
        }
      }
    }
    
    // Xử lý đổi lớp nếu có (có thể triển khai sau)
    if (pendingClassChange) {
      console.log('ℹ️ Yêu cầu đổi lớp được ghi nhận nhưng chưa được xử lý tự động');
      // TODO: Implement class change logic if needed
    }
    
    // Cập nhật trạng thái đơn sử dụng findByIdAndUpdate để tránh lỗi validation
    const updatedChangeRequest = await ChangeRequest.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approver: approverId,
        approvedDate: new Date()
      },
      { 
        new: true,
        session: session
      }
    )
    .populate('sender', 'username email phone')
    .populate('approver', 'username email');
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      message: 'Đã chấp nhận đơn thành công',
      changeRequest: updatedChangeRequest
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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

