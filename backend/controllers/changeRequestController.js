const ChangeRequest = require('../models/changeRequestModel');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const ClassSchedule = require('../models/classScheduleModel');
const StudentSchedule = require('../models/studentScheduleModel');
const Class = require('../models/classModel');
const Course = require('../models/courseModel');
const mongoose = require('mongoose');

exports.getAllChangeRequests = async (req, res) => {
  try {
    const { status, type, search, page = 1, limit = 10, sortBy = 'oldest' } = req.query;
    
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (search) {
      const User = require('../models/userModel');
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id').lean();
      
      const userIds = matchingUsers.map(u => u._id);
      
      query.$or = [
        { content: { $regex: search, $options: 'i' } }
      ];
      
      if (userIds.length > 0) {
        query.$or.push({ sender: { $in: userIds } });
      }
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const total = await ChangeRequest.countDocuments(query);
    
    // Build sort object based on sortBy parameter
    let sortObj = {};
    if (sortBy === 'newest') {
      sortObj = { createdAt: -1 };
    } else if (sortBy === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sortBy === 'sender' || sortBy === 'sender-asc') {
      sortObj = { 'sender.username': 1 };
    } else if (sortBy === 'sender-desc') {
      sortObj = { 'sender.username': -1 };
    } else {
      sortObj = { createdAt: 1 }; // default
    }
    
    const changeRequests = await ChangeRequest.find(query)
      .populate('sender', 'username email phone')
      .populate('approver', 'username email')
      .populate({
        path: 'studentScheduleId',
        populate: {
          path: 'classSchedule',
          select: 'date startTime endTime session class room',
          populate: [
            {
              path: 'session',
              select: 'title order'
            },
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
              select: 'room_name'
            }
          ]
        }
      })
      .populate({
        path: 'classScheduleId',
        select: 'date startTime endTime session class room teacher',
        populate: [
          {
            path: 'session',
            select: 'title order'
          },
          {
            path: 'class',
            select: 'name teacher',
            populate: [
              {
                path: 'course',
                select: 'name'
              },
              {
                path: 'teacher',
                select: 'username email'
              }
            ]
          },
          {
            path: 'room',
            select: 'room_name location'
          },
          {
            path: 'teacher',
            select: 'username email'
          }
        ]
      })
      .populate({
        path: 'classId',
        select: 'name course',
        populate: {
          path: 'course',
          select: 'name'
        }
      })
      .populate({
        path: 'makeupStudentScheduleId',
        select: 'scheduleStatus reason classSchedule',
        populate: {
          path: 'classSchedule',
          select: 'date startTime endTime session class room'
        }
      })
      .populate('substituteTeacherId', 'username email')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    for (let i = 0; i < changeRequests.length; i++) {
      const request = changeRequests[i];
      if (request.studentScheduleId && request.studentScheduleId._id) {
        const studentScheduleId = request.studentScheduleId._id;
        const fullStudentSchedule = await StudentSchedule.findById(studentScheduleId)
          .select('student classSchedule attendance scheduleStatus reason')
          .lean();
        
        if (fullStudentSchedule) {
          request.studentScheduleId.student = fullStudentSchedule.student;
          if (!request.studentScheduleId.attendance) {
            request.studentScheduleId.attendance = fullStudentSchedule.attendance;
          }
          if (!request.studentScheduleId.scheduleStatus) {
            request.studentScheduleId.scheduleStatus = fullStudentSchedule.scheduleStatus;
          }
          if (!request.studentScheduleId.reason) {
            request.studentScheduleId.reason = fullStudentSchedule.reason;
          }
        }
      }
    }
    
    const classIdsToEnrich = changeRequests
      .filter(req => req.type === 'change_class' && req.classId)
      .map(req => req.classId._id || req.classId);
    
    if (classIdsToEnrich.length > 0) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      const classSchedules = await ClassSchedule.find({
        class: { $in: classIdsToEnrich },
        status: 'fixed'
      })
        .populate('session', 'title order')
        .populate('room', 'room_name')
        .sort({ date: 1, startTime: 1 })
        .lean();
      
      const schedulesByClass = {};
      classSchedules.forEach(schedule => {
        const classId = schedule.class?.toString() || schedule.class;
        if (!schedulesByClass[classId]) {
          schedulesByClass[classId] = [];
        }
        schedulesByClass[classId].push(schedule);
      });
      
      changeRequests.forEach(request => {
        if (request.type === 'change_class' && request.classId) {
          const classId = request.classId._id?.toString() || request.classId.toString();
          const schedules = schedulesByClass[classId] || [];
          
          let currentSession = null;
          // Tìm các buổi SẮP TỚI (chưa học)
          const upcomingSessions = schedules.filter(s => {
            const scheduleDate = new Date(s.date);
            scheduleDate.setHours(0, 0, 0, 0);
            return scheduleDate >= now;  // Lọc buổi SẮP TỚI
          });
          
          if (upcomingSessions.length > 0) {
            // Nếu có buổi sắp tới → lấy buổi sắp tới ĐẦU TIÊN (session đang học)
            currentSession = upcomingSessions[0];
          } else if (schedules.length > 0) {
            // Nếu không có buổi sắp tới → lấy buổi CUỐI CÙNG (đã học hết)
            currentSession = schedules[schedules.length - 1];
          }
          
          if (request.classId) {
            request.classId.fixedSchedules = schedules.map(s => ({
              id: s._id,
              date: s.date,
              startTime: s.startTime,
              endTime: s.endTime,
              session: s.session,
              room: s.room,
              roomName: s.room?.room_name || 'N/A',
              status: s.status || 'fixed'
            }));
            
            if (currentSession && currentSession.session) {
              request.classId.currentSession = {
                title: currentSession.session.title,
                order: currentSession.session.order
              };
            }
          }
        }
      });
    }
    
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
    console.error(" Lỗi khi lấy danh sách đơn:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy danh sách đơn",
      error: error.message 
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build base query
    let matchQuery = {};
    if (status && status !== 'all') {
      matchQuery.status = status;
    }
    
    // Use aggregation to get counts efficiently
    const stats = await ChangeRequest.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          changeClass: {
            $sum: { $cond: [{ $eq: ['$type', 'change_class'] }, 1, 0] }
          },
          makeupClass: {
            $sum: { $cond: [{ $eq: ['$type', 'makeup_class'] }, 1, 0] }
          },
          requestReplaceTeacher: {
            $sum: { $cond: [{ $eq: ['$type', 'request_replace_teacher'] }, 1, 0] }
          }
        }
      }
    ]);
    
    // If no results, return zeros
    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      changeClass: 0,
      makeupClass: 0,
      requestReplaceTeacher: 0
    };
    
    // Remove _id from result
    delete result._id;
    
    res.status(200).json({
      success: true,
      message: "Lấy thống kê thành công",
      stats: result
    });
  } catch (error) {
    console.error(" Lỗi khi lấy thống kê:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy thống kê",
      error: error.message 
    });
  }
};

exports.createChangeRequest = async (req, res) => {
  try {
    const { type, studentScheduleId, classId, classScheduleId, content } = req.body;
    const senderId = req.user._id;
    
    if (!type || !content) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }
    
    const validTypes = ['create_class', 'change_class', 'makeup_class', 'request_replace_teacher'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Loại đơn không hợp lệ'
      });
    }
    
    if (type === 'makeup_class' && !studentScheduleId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin buổi học'
      });
    }
    
    if (type === 'makeup_class' && studentScheduleId) {
      const studentSchedule = await StudentSchedule.findById(studentScheduleId);
      if (!studentSchedule) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy buổi học' 
        });
      }
      if (studentSchedule.student.toString() !== senderId.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Bạn không có quyền truy cập buổi học này' 
        });
      }
      
      // Kiểm tra xem đã có request pending nào cho cùng buổi học chưa
      const existingRequest = await ChangeRequest.findOne({
        sender: senderId,
        type: 'makeup_class',
        studentScheduleId: studentScheduleId,
        status: 'pending'
      });
      
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã gửi đơn xin học bù cho buổi học này. Vui lòng chờ phản hồi hoặc hủy đơn cũ trước khi gửi đơn mới.'
        });
      }
    }
    
    const changeRequest = await ChangeRequest.create({
      sender: senderId,
      type,
      studentScheduleId: type === 'makeup_class' ? studentScheduleId : undefined,
      classId: type === 'change_class' ? classId : undefined,
      classScheduleId: type === 'request_replace_teacher' ? classScheduleId : undefined,
      content: content.trim()
    });
    
    const populatedRequest = await ChangeRequest.findById(changeRequest._id)
      .populate('sender', 'username email')
      .lean();
    
    res.status(201).json({
      success: true,
      message: 'Gửi đơn thành công',
      changeRequest: populatedRequest
    });
  } catch (error) {
    console.error(' Lỗi khi tạo change request:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đơn',
      error: error.message
    });
  }
};

exports.getSenderSchedule = async (req, res) => {
  try {
    const { requestId } = req.params;
    
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
    
    const role = await Role.findById(sender.roleId);
    const isStudent = role?.name === 'Student';
    const isTeacher = role?.name === 'Teacher';
    
    let schedules = [];
    
    if (isStudent) {
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
              select: 'name',
              populate: {
                path: 'program',
                select: 'type'
              }
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
      
      schedules = allStudentSchedules
        .filter(ss => ss.classSchedule)
        .map(ss => {
          const classSchedule = ss.classSchedule;
          return {
            _id: classSchedule._id,
            studentScheduleId: ss._id, // 🆕 Thêm StudentSchedule ID để frontend có thể so khớp
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
            attendance: ss.attendance || null,
            scheduleStatus: ss.scheduleStatus || 'scheduled',
            studentScheduleReason: ss.reason || null
          };
        })
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          return (a.startTime || '').localeCompare(b.startTime || '');
        });
    } else if (isTeacher) {
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
            select: 'name',
            populate: {
              path: 'program',
              select: 'type'
            }
          }
        })
        .populate('room', 'room_name location')
        .populate('session', 'title order')
        .sort({ date: 1, startTime: 1 })
        .lean();
      }
    }
    
    // Với các schedule không có class (temporary/makeup) nhưng có session,
    // tìm course chứa session đó để lấy program type
    for (let schedule of schedules) {
      if (!schedule.class && schedule.session) {
        // Lấy sessionId: có thể là object (đã populate) hoặc ObjectId
        let sessionId = schedule.session._id || schedule.session;
        
        // Convert sang ObjectId nếu cần
        let sessionObjectId;
        try {
          if (sessionId instanceof mongoose.Types.ObjectId) {
            sessionObjectId = sessionId;
          } else if (typeof sessionId === 'string') {
            sessionObjectId = new mongoose.Types.ObjectId(sessionId);
          } else {
            sessionObjectId = sessionId;
          }
        } catch (error) {
          continue;
        }
        
        // Tìm course chứa session này - thử với cả ObjectId và string
        let course = await Course.findOne({ sessions: sessionObjectId })
          .populate({
            path: 'program',
            select: 'type'
          })
          .select('name program sessions')
          .lean();
        
        // Nếu không tìm thấy với ObjectId, thử với string
        if (!course) {
          course = await Course.findOne({ sessions: sessionObjectId.toString() })
            .populate({
              path: 'program',
              select: 'type'
            })
            .select('name program sessions')
            .lean();
        }
        
        // Nếu vẫn không tìm thấy, thử với $in operator
        if (!course) {
          course = await Course.findOne({ 
            sessions: { $in: [sessionObjectId, sessionObjectId.toString()] }
          })
            .populate({
              path: 'program',
              select: 'type'
            })
            .select('name program sessions')
            .lean();
        }
        
        if (course && course.program) {
          schedule.programType = course.program.type;
          schedule.sessionCourse = {
            _id: course._id,
            name: course.name,
            program: {
              _id: course.program._id,
              type: course.program.type
            }
          };
        }
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
    console.error(" Lỗi khi lấy lịch:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch",
      error: error.message
    });
  }
};

exports.approveChangeRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { pendingMakeupClasses, pendingClassChange, responseContent } = req.body;
    const approverId = req.user?._id || req.body.approverId;
    
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
    
    // Track ClassSchedule IDs that students moved FROM (for cleanup later)
    const affectedClassScheduleIds = new Set();
    
    // Biến để lưu các ID cần cập nhật vào ChangeRequest
    let makeupStudentScheduleIdToSave = null;
    let substituteTeacherIdToSave = null;
    
    if (pendingMakeupClasses && Array.isArray(pendingMakeupClasses) && pendingMakeupClasses.length > 0) {
      try {
        for (const makeup of pendingMakeupClasses) {
          const { 
            absentScheduleId, 
            makeupScheduleId, 
            makeupClassId, 
            isSubstituteClass, 
            substituteTeacherId,
            isNewMakeup,
            newMakeupDate,
            newMakeupStartTime,
            newMakeupEndTime,
            newMakeupRoomId,
            newMakeupTeacherId,
            newMakeupSessionId
          } = makeup;
        
        if (!absentScheduleId) {
          continue;
        }
        
        let absentClassSchedule = null;
        let actualAbsentClassScheduleId = null;
        
        try {
          absentClassSchedule = await ClassSchedule.findById(absentScheduleId).session(session);
          if (absentClassSchedule) {
            actualAbsentClassScheduleId = absentScheduleId;
          }
        } catch (error) {
          // Ignore
        }
        
        if (!absentClassSchedule) {
          try {
            const absentStudentSchedule = await StudentSchedule.findById(absentScheduleId)
              .populate('classSchedule')
              .session(session);
            
            if (absentStudentSchedule && absentStudentSchedule.classSchedule) {
              actualAbsentClassScheduleId = absentStudentSchedule.classSchedule._id || absentStudentSchedule.classSchedule;
              absentClassSchedule = await ClassSchedule.findById(actualAbsentClassScheduleId).session(session);
            }
          } catch (error) {
            // Ignore
          }
        }
        
        if (!absentClassSchedule) {
          continue;
        }
        
        let finalMakeupScheduleId = makeupScheduleId;
        
        if (isSubstituteClass && substituteTeacherId) {
          // Validate that substitute teacher doesn't have conflicting schedule
          const substituteTeacherClasses = await Class.find({
            $or: [
              { teacher: substituteTeacherId },
              { teacherId: substituteTeacherId }
            ]
          }).select('_id').session(session).lean();
          
          if (substituteTeacherClasses.length > 0) {
            const substituteTeacherClassIds = substituteTeacherClasses.map(c => c._id);
            
            // Helper function to check time overlap
            const hasTimeOverlap = (start1, end1, start2, end2) => {
              const timeToMinutes = (timeStr) => {
                if (!timeStr) return 0;
                const parts = timeStr.split(':');
                if (parts.length !== 2) return 0;
                const hours = parseInt(parts[0], 10);
                const minutes = parseInt(parts[1], 10);
                if (isNaN(hours) || isNaN(minutes)) return 0;
                return hours * 60 + minutes;
              };
              
              const start1Min = timeToMinutes(start1);
              const end1Min = timeToMinutes(end1);
              const start2Min = timeToMinutes(start2);
              const end2Min = timeToMinutes(end2);
              
              return start1Min < end2Min && end1Min > start2Min;
            };
            
            // Get schedule date
            const scheduleDate = new Date(absentClassSchedule.date);
            scheduleDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(scheduleDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            // Check for conflicting schedules
            const substituteTeacherConflict = await ClassSchedule.findOne({
              class: { $in: substituteTeacherClassIds },
              date: {
                $gte: scheduleDate,
                $lt: nextDay
              },
              status: { $in: ['temporary', 'fixed'] },
              _id: { $ne: absentClassSchedule._id } // Exclude current schedule
            })
            .populate('class', 'name')
            .session(session)
            .lean();
            
            if (substituteTeacherConflict && 
                hasTimeOverlap(
                  absentClassSchedule.startTime, 
                  absentClassSchedule.endTime,
                  substituteTeacherConflict.startTime,
                  substituteTeacherConflict.endTime
                )) {
              await session.abortTransaction();
              session.endSession();
              return res.status(400).json({
                success: false,
                message: `Giáo viên dạy thay đã có lịch dạy trùng giờ: Lớp ${substituteTeacherConflict.class?.name || 'N/A'} (${substituteTeacherConflict.startTime} - ${substituteTeacherConflict.endTime})`
              });
            }
          }
          
          // Chỉ set substituteTeacher, không thay đổi teacher (giữ nguyên giáo viên gốc)
          const originalTeacher = absentClassSchedule.teacher;
          
          // Set substituteTeacher = giáo viên dạy thay
          absentClassSchedule.substituteTeacher = new mongoose.Types.ObjectId(substituteTeacherId);
          
          // 🆕 Lưu substituteTeacherId để cập nhật vào ChangeRequest
          substituteTeacherIdToSave = substituteTeacherId;
          
          const substituteNote = `Giáo viên dạy thay: ${substituteTeacherId} (Giáo viên gốc: ${originalTeacher._id || originalTeacher})`;
          if (absentClassSchedule.note) {
            absentClassSchedule.note += `\n${substituteNote}`;
          } else {
            absentClassSchedule.note = substituteNote;
          }
          
          await absentClassSchedule.save({ session });
          continue;
        }
        
        if (isNewMakeup && newMakeupDate && newMakeupStartTime && newMakeupEndTime && newMakeupRoomId && newMakeupTeacherId) {

          const dateParts = newMakeupDate.split('-');
          if (dateParts.length !== 3) {
            continue;
          }
          
          const scheduleDate = new Date(Date.UTC(
            parseInt(dateParts[0]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[2]),
            0,
            0,
            0,
            0
          ));
          
          const startOfDay = new Date(scheduleDate);
          const endOfDay = new Date(scheduleDate);
          endOfDay.setUTCHours(23, 59, 59, 999);
          
          const roomConflict = await ClassSchedule.findOne({
            room: new mongoose.Types.ObjectId(newMakeupRoomId),
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['temporary', 'fixed'] },
            $or: [
              { $and: [{ startTime: { $lte: newMakeupStartTime } }, { endTime: { $gt: newMakeupStartTime } }] },
              { $and: [{ startTime: { $lt: newMakeupEndTime } }, { endTime: { $gte: newMakeupEndTime } }] },
              { $and: [{ startTime: { $gte: newMakeupStartTime } }, { endTime: { $lte: newMakeupEndTime } }] }
            ]
          }).session(session).lean();
          
          if (roomConflict) {
            throw new Error('Phòng học đã được sử dụng vào thời gian này');
          }
          
          const teacherClasses = await Class.find({
            $or: [
              { teacher: newMakeupTeacherId },
              { teacherId: newMakeupTeacherId }
            ]
          }).select('_id').session(session).lean();
          
          if (teacherClasses.length > 0) {
            const teacherClassIds = teacherClasses.map(c => c._id);
            const teacherConflict = await ClassSchedule.findOne({
              class: { $in: teacherClassIds },
              date: { $gte: startOfDay, $lte: endOfDay },
              status: { $in: ['temporary', 'fixed'] },
              $or: [
                { $and: [{ startTime: { $lte: newMakeupStartTime } }, { endTime: { $gt: newMakeupStartTime } }] },
                { $and: [{ startTime: { $lt: newMakeupEndTime } }, { endTime: { $gte: newMakeupEndTime } }] },
                { $and: [{ startTime: { $gte: newMakeupStartTime } }, { endTime: { $lte: newMakeupEndTime } }] }
              ]
            }).session(session).lean();
            
            if (teacherConflict) {
              throw new Error('Giáo viên đã có lớp khác vào thời gian này');
            }
          }
          
          const hasTimeOverlap = (start1, end1, start2, end2) => {
            const timeToMinutes = (timeStr) => {
              if (!timeStr) return 0;
              const parts = timeStr.split(':');
              if (parts.length !== 2) return 0;
              const hours = parseInt(parts[0], 10);
              const minutes = parseInt(parts[1], 10);
              if (isNaN(hours) || isNaN(minutes)) return 0;
              return hours * 60 + minutes;
            };
            
            const start1Min = timeToMinutes(start1);
            const end1Min = timeToMinutes(end1);
            const start2Min = timeToMinutes(start2);
            const end2Min = timeToMinutes(end2);
            
            return start1Min < end2Min && end1Min > start2Min;
          };
          
          const formatDateLocal = (dateInput) => {
            if (!dateInput) return null;
            const d = new Date(dateInput);
            if (isNaN(d.getTime())) return null;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };
          
          const makeupDateStr = formatDateLocal(scheduleDate);
          
          // Loại trừ buổi học bù hiện tại khỏi danh sách kiểm tra conflict
          // Vì buổi học bù hiện tại sẽ bị cancel, nên không nên coi nó là conflict
          const excludeQuery = {};
          if (absentScheduleId) {
            // Nếu absentScheduleId là StudentSchedule ID, loại trừ nó
            try {
              const absentStudentSchedule = await StudentSchedule.findById(absentScheduleId).session(session).lean();
              if (absentStudentSchedule) {
                excludeQuery._id = { $ne: absentScheduleId };
              }
            } catch (error) {
              // Nếu không phải StudentSchedule ID, có thể là ClassSchedule ID
              // Sẽ loại trừ trong vòng lặp dưới
            }
          }
          
          const studentSchedules = await StudentSchedule.find({ 
            student: studentId,
            scheduleStatus: { $in: ['scheduled', 'rescheduled', 'pending'] },
            ...excludeQuery
          })
            .populate({
              path: 'classSchedule',
              select: 'date startTime endTime class status',
              populate: {
                path: 'class',
                select: 'name'
              }
            })
            .session(session)
            .lean();
          
          const studentConflicts = [];
          studentSchedules.forEach((studentSchedule) => {
            if (!studentSchedule.classSchedule) {
              return;
            }
            
            // Loại trừ buổi học bù hiện tại (nếu absentScheduleId là ClassSchedule ID)
            const classScheduleId = studentSchedule.classSchedule._id?.toString() || studentSchedule.classSchedule.toString();
            if (actualAbsentClassScheduleId && classScheduleId === actualAbsentClassScheduleId.toString()) {
              return; // Bỏ qua buổi học bù hiện tại
            }
            
            const existingScheduleDate = new Date(studentSchedule.classSchedule.date);
            existingScheduleDate.setHours(0, 0, 0, 0);
            const existingScheduleDateStr = formatDateLocal(existingScheduleDate);
            
            if (existingScheduleDateStr === makeupDateStr) {
              const hasOverlap = hasTimeOverlap(
                newMakeupStartTime, 
                newMakeupEndTime,
                studentSchedule.classSchedule.startTime,
                studentSchedule.classSchedule.endTime
              );
              
              if (hasOverlap) {
                studentConflicts.push({
                  className: studentSchedule.classSchedule.class?.name || 'N/A',
                  date: existingScheduleDateStr,
                  time: `${studentSchedule.classSchedule.startTime} - ${studentSchedule.classSchedule.endTime}`,
                  classScheduleId: studentSchedule.classSchedule._id
                });
              }
            }
          });
          
          if (studentConflicts.length > 0) {
            const conflictMessages = studentConflicts.map(c => `${c.className} (${c.date} ${c.time})`).join(', ');
            throw new Error(`Học sinh có lịch học trùng với buổi học bù: ${conflictMessages}`);
          }
          
          const newMakeupSchedule = new ClassSchedule({
            class: null,
            session: newMakeupSessionId ? new mongoose.Types.ObjectId(newMakeupSessionId) : null,
            date: scheduleDate,
            startTime: newMakeupStartTime,
            endTime: newMakeupEndTime,
            room: new mongoose.Types.ObjectId(newMakeupRoomId),
            teacher: new mongoose.Types.ObjectId(newMakeupTeacherId),
            createdBy: approverId || new mongoose.Types.ObjectId(newMakeupTeacherId),
            reason: 'Buổi học bù',
            status: 'temporary'
          });
          
          await newMakeupSchedule.save({ session });
          finalMakeupScheduleId = newMakeupSchedule._id;
        } else if (makeupScheduleId) {
          const makeupClassSchedule = await ClassSchedule.findById(makeupScheduleId).session(session);
          
          if (!makeupClassSchedule) {
            throw new Error(`Không tìm thấy ClassSchedule cho buổi học bù: ${makeupScheduleId}`);
          }
          
          finalMakeupScheduleId = makeupScheduleId;
        } else {
          throw new Error('Thiếu thông tin để tạo hoặc chọn buổi học bù. Cần có isNewMakeup=true hoặc makeupScheduleId.');
        }
        
        if (!finalMakeupScheduleId) {
          continue;
        }
        
        const existingMakeupSchedule = await StudentSchedule.findOne({
          student: studentId,
          classSchedule: finalMakeupScheduleId
        }).session(session);
        
        let makeupStudentScheduleId = null;
        
        if (existingMakeupSchedule) {
          // Nếu StudentSchedule đã tồn tại nhưng bị cancelled, khôi phục nó
          if (existingMakeupSchedule.scheduleStatus === 'cancelled') {
            existingMakeupSchedule.scheduleStatus = 'rescheduled';
            existingMakeupSchedule.reason = `Học bù cho buổi nghỉ ngày ${new Date(absentClassSchedule.date).toLocaleDateString('vi-VN')}`;
            await existingMakeupSchedule.save({ session });
          }
          // 🆕 Lưu ID của StudentSchedule đã tồn tại
          makeupStudentScheduleId = existingMakeupSchedule._id;
        } else {
          const newStudentSchedule = new StudentSchedule({
            student: studentId,
            classSchedule: finalMakeupScheduleId,
            scheduleStatus: 'rescheduled',
            reason: `Học bù cho buổi nghỉ ngày ${new Date(absentClassSchedule.date).toLocaleDateString('vi-VN')}`
          });
          
          await newStudentSchedule.save({ session });
          // 🆕 Lưu ID của StudentSchedule mới tạo
          makeupStudentScheduleId = newStudentSchedule._id;
        }
        
        // 🆕 Lưu makeupStudentScheduleId (chỉ lưu phần tử đầu tiên vì mỗi đơn chỉ có 1 buổi học bù)
        if (!makeupStudentScheduleIdToSave) {
          makeupStudentScheduleIdToSave = makeupStudentScheduleId;
        }
        
        let absentStudentSchedule = null;
        
        // Strategy 1: Ưu tiên tìm StudentSchedule bằng absentScheduleId trực tiếp
        // (Đặc biệt quan trọng khi absentScheduleId là StudentSchedule ID của một buổi học bù)
        if (absentScheduleId && absentScheduleId !== actualAbsentClassScheduleId) {
          try {
            const foundByAbsentId = await StudentSchedule.findById(absentScheduleId).session(session);
            
            if (foundByAbsentId) {
              const foundStudentId = foundByAbsentId.student?._id?.toString() || foundByAbsentId.student?.toString();
              if (foundStudentId === studentId.toString()) {
                absentStudentSchedule = foundByAbsentId;
              }
            }
          } catch (error) {
            // Ignore
          }
        }
        
        // Strategy 2: Fallback - Tìm bằng classSchedule và studentId
        if (!absentStudentSchedule) {
          absentStudentSchedule = await StudentSchedule.findOne({
            student: studentId,
            classSchedule: actualAbsentClassScheduleId
          }).session(session);
        }
        
        // Cancel StudentSchedule nếu tìm thấy
        if (absentStudentSchedule) {
          // Track the ClassSchedule ID for potential cleanup
          if (absentStudentSchedule.classSchedule) {
            affectedClassScheduleIds.add(absentStudentSchedule.classSchedule.toString());
          }
          
          absentStudentSchedule.scheduleStatus = 'cancelled';
          absentStudentSchedule.reason = `Học bù tại lớp khác${makeupClassId ? ` (${makeupClassId})` : ''}`;
          await absentStudentSchedule.save({ session });
        }
        }
      } catch (makeupError) {
        throw makeupError;
      }
    }
    
    if (pendingClassChange) {
      
      const { oldClassId, newClassId } = pendingClassChange;
      
      if (!oldClassId || !newClassId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin lớp cũ hoặc lớp mới'
        });
      }
      
      const oldClass = await Class.findById(oldClassId).session(session);
      const newClass = await Class.findById(newClassId).session(session);
      
      if (!oldClass) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lớp cũ'
        });
      }
      
      if (!newClass) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lớp mới'
        });
      }
      
      const studentInOldClass = oldClass.students.some(
        id => id.toString() === studentId.toString()
      );
      
      if (!studentInOldClass) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Học viên không có trong lớp cũ'
        });
      }
      
      if (newClass.maxStudents) {
        const currentStudentCount = newClass.students ? newClass.students.length : 0;
        if (currentStudentCount >= newClass.maxStudents) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: 'Lớp mới đã đầy'
          });
        }
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const oldClassSchedules = await ClassSchedule.find({
        class: oldClassId,
        date: { $gte: today }
      })
        .populate('session', 'order')
        .sort({ date: 1, startTime: 1 })
        .limit(1)
        .session(session)
        .lean();
      
      const newClassSchedules = await ClassSchedule.find({
        class: newClassId,
        date: { $gte: today }
      })
        .populate('session', 'order')
        .sort({ date: 1, startTime: 1 })
        .limit(1)
        .session(session)
        .lean();
      
      const oldClassSessionOrder = oldClassSchedules.length > 0 && oldClassSchedules[0].session
        ? oldClassSchedules[0].session.order
        : null;
      const newClassSessionOrder = newClassSchedules.length > 0 && newClassSchedules[0].session
        ? newClassSchedules[0].session.order
        : null;
      
      let caseType = 1;
      if (oldClassSessionOrder !== null && newClassSessionOrder !== null) {
        if (oldClassSessionOrder < newClassSessionOrder) {
          caseType = 2;
        } else if (oldClassSessionOrder > newClassSessionOrder) {
          caseType = 3;
        }
      }
      
      oldClass.students = oldClass.students.filter(
        id => id.toString() !== studentId.toString()
      );
      await oldClass.save({ session });
      
      const studentInNewClass = newClass.students.some(
        id => id.toString() === studentId.toString()
      );
      if (!studentInNewClass) {
        newClass.students.push(studentId);
        await newClass.save({ session });
      }
      
      const allOldClassSchedules = await ClassSchedule.find({
        class: oldClassId
      })
        .populate('session', 'order')
        .session(session)
        .lean();
      
      const oldClassScheduleIds = allOldClassSchedules.map(s => s._id);
      
      const studentSchedules = await StudentSchedule.find({
        student: studentId,
        classSchedule: { $in: oldClassScheduleIds }
      })
        .populate({
          path: 'classSchedule',
          populate: {
            path: 'session',
            select: 'order'
          }
        })
        .session(session)
        .lean();
      
      const allNewClassSchedules = await ClassSchedule.find({
        class: newClassId
      })
        .populate('session', 'order')
        .session(session)
        .lean();
      
      const newClassScheduleMap = new Map();
      allNewClassSchedules.forEach(schedule => {
        if (schedule.session && schedule.session.order !== null && schedule.session.order !== undefined) {
          const order = schedule.session.order;
          if (!newClassScheduleMap.has(order)) {
            newClassScheduleMap.set(order, []);
          }
          newClassScheduleMap.get(order).push(schedule);
        }
      });
      
      const processedAbsentScheduleIds = new Set();
      if (pendingMakeupClasses && Array.isArray(pendingMakeupClasses)) {
        pendingMakeupClasses.forEach(makeup => {
          if (makeup.absentScheduleId) {
            processedAbsentScheduleIds.add(makeup.absentScheduleId.toString());
          }
        });
      }
      
      let updatedCount = 0;
      let cancelledCount = 0;
      let unchangedCount = 0;
      
      for (const studentSchedule of studentSchedules) {
        const classSchedule = studentSchedule.classSchedule;
        if (!classSchedule) continue;
        
        const sessionOrder = classSchedule.session?.order;
        const hasAttendance = studentSchedule.attendance && studentSchedule.attendance.status !== null;
        const classScheduleId = classSchedule._id?.toString() || classSchedule.toString();
        
        const scheduleDate = new Date(classSchedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        const isPastSchedule = scheduleDate < today;
        
        if (hasAttendance || isPastSchedule) {
          unchangedCount++;
          continue;
        }
        
        if (processedAbsentScheduleIds.has(classScheduleId)) {
          unchangedCount++;
          continue;
        }
        
        if (caseType === 1) {
          if (sessionOrder !== null && sessionOrder !== undefined) {
            const matchingSchedules = newClassScheduleMap.get(sessionOrder);
            if (matchingSchedules && matchingSchedules.length > 0) {
              const newClassScheduleId = matchingSchedules[0]._id;
              await StudentSchedule.findByIdAndUpdate(
                studentSchedule._id,
                { classSchedule: newClassScheduleId },
                { session }
              );
              updatedCount++;
            }
          }
        } else if (caseType === 2) {
          if (sessionOrder !== null && sessionOrder !== undefined) {
            if (sessionOrder < newClassSessionOrder) {
              if (pendingMakeupClasses && pendingMakeupClasses.length > 0) {
                unchangedCount++;
              } else {
                await StudentSchedule.findByIdAndUpdate(
                  studentSchedule._id,
                  {
                    scheduleStatus: 'cancelled',
                    reason: 'Đã đổi lớp'
                  },
                  { session }
                );
                cancelledCount++;
              }
            } else if (sessionOrder >= newClassSessionOrder) {
              const matchingSchedules = newClassScheduleMap.get(sessionOrder);
              if (matchingSchedules && matchingSchedules.length > 0) {
                const newClassScheduleId = matchingSchedules[0]._id;
                await StudentSchedule.findByIdAndUpdate(
                  studentSchedule._id,
                  { classSchedule: newClassScheduleId },
                  { session }
                );
                updatedCount++;
              }
            }
          }
        } else if (caseType === 3) {
          if (sessionOrder !== null && sessionOrder !== undefined) {
            if (sessionOrder < oldClassSessionOrder) {
              unchangedCount++;
            } else if (sessionOrder >= oldClassSessionOrder) {
              const matchingSchedules = newClassScheduleMap.get(sessionOrder);
              if (matchingSchedules && matchingSchedules.length > 0) {
                const newClassScheduleId = matchingSchedules[0]._id;
                await StudentSchedule.findByIdAndUpdate(
                  studentSchedule._id,
                  { classSchedule: newClassScheduleId },
                  { session }
                );
                updatedCount++;
              }
            }
          }
        }
      }
    }
    
    // Cleanup orphaned makeup ClassSchedules
    // Check all affected ClassSchedule IDs to see if they should be deleted
    if (affectedClassScheduleIds.size > 0) {
      for (const scheduleId of affectedClassScheduleIds) {
        try {
          const classSchedule = await ClassSchedule.findById(scheduleId).session(session);
          
          // Only clean up makeup classes (class=null, status='temporary')
          if (classSchedule && classSchedule.class === null && classSchedule.status === 'temporary') {
            // Check if any students are still using this schedule
            const remainingStudents = await StudentSchedule.countDocuments({
              classSchedule: scheduleId,
              scheduleStatus: { $nin: ['cancelled'] }
            }).session(session);
            
            if (remainingStudents === 0) {
              // No students using this makeup class anymore, safe to delete
              await ClassSchedule.findByIdAndDelete(scheduleId).session(session);
              console.log(`✅ Deleted orphaned makeup ClassSchedule: ${scheduleId}`);
            }
          }
        } catch (cleanupError) {
          // Log but don't fail the transaction for cleanup errors
          console.error(`⚠️ Error cleaning up ClassSchedule ${scheduleId}:`, cleanupError.message);
        }
      }
    }
    
    // 🆕 Cập nhật ChangeRequest với makeupStudentScheduleId và substituteTeacherId
    const updateData = {
      status: 'approved',
      approver: approverId,
      approvedDate: new Date(),
      responseContent: responseContent || null
    };
    
    // Chỉ thêm makeupStudentScheduleId nếu có (cho đơn học bù)
    if (makeupStudentScheduleIdToSave) {
      updateData.makeupStudentScheduleId = makeupStudentScheduleIdToSave;
    }
    
    // Chỉ thêm substituteTeacherId nếu có (cho đơn thay giáo viên)
    if (substituteTeacherIdToSave) {
      updateData.substituteTeacherId = substituteTeacherIdToSave;
    }
    
    await ChangeRequest.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        session: session
      }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    const updatedChangeRequest = await ChangeRequest.findById(id)
      .populate('sender', 'username email phone')
      .populate('approver', 'username email')
      .populate('makeupStudentScheduleId', 'scheduleStatus reason')
      .populate('substituteTeacherId', 'username email');
    
    res.status(200).json({
      success: true,
      message: 'Đã chấp nhận đơn thành công',
      changeRequest: updatedChangeRequest
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(" Lỗi khi chấp nhận đơn:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi chấp nhận đơn",
      error: error.message
    });
  }
};


exports.rejectChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { responseContent } = req.body;
    const approverId = req.user?._id || req.body.approverId;
    
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
    console.error(" Lỗi khi từ chối đơn:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi từ chối đơn",
      error: error.message
    });
  }
};

exports.revertChangeRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const approverId = req.user?._id || req.body.approverId;
    
    const changeRequest = await ChangeRequest.findById(id)
      .populate('studentScheduleId')
      .populate('makeupStudentScheduleId')
      .populate('classScheduleId')
      .session(session);
    
    if (!changeRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }
    
    if (changeRequest.status !== 'approved') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hoàn tác đơn đã được duyệt'
      });
    }
    
    // 1. Khôi phục buổi nghỉ (nếu có)
    if (changeRequest.studentScheduleId) {
      const absentStudentScheduleId = changeRequest.studentScheduleId._id || changeRequest.studentScheduleId;
      const absentStudentSchedule = await StudentSchedule.findById(absentStudentScheduleId)
        .session(session);
      
      if (absentStudentSchedule && absentStudentSchedule.scheduleStatus === 'cancelled') {
        absentStudentSchedule.scheduleStatus = 'scheduled';
        absentStudentSchedule.reason = null; // Xóa lý do cancelled
        await absentStudentSchedule.save({ session });
      }
    }
    
    // 2. Xóa buổi học bù (nếu có)
    if (changeRequest.makeupStudentScheduleId) {
      const makeupStudentScheduleId = changeRequest.makeupStudentScheduleId._id || changeRequest.makeupStudentScheduleId;
      
      // Lấy StudentSchedule học bù trước khi xóa để lấy ClassSchedule
      const makeupStudentSchedule = await StudentSchedule.findById(makeupStudentScheduleId)
        .populate('classSchedule')
        .session(session);
      
      if (makeupStudentSchedule) {
        const makeupClassScheduleId = makeupStudentSchedule.classSchedule?._id || makeupStudentSchedule.classSchedule;
        
        // Xóa StudentSchedule của học sinh này
        await StudentSchedule.findByIdAndDelete(makeupStudentScheduleId).session(session);
        
        // Kiểm tra ClassSchedule để quyết định có xóa không
        if (makeupClassScheduleId) {
          const makeupClassSchedule = await ClassSchedule.findById(makeupClassScheduleId).session(session);
          
          if (makeupClassSchedule) {
            // Nếu là buổi học bù mới tạo (class=null, status='temporary)
            if (makeupClassSchedule.class === null && makeupClassSchedule.status === 'temporary') {
              // Đếm số học sinh còn lại trong ClassSchedule
              const remainingStudents = await StudentSchedule.countDocuments({
                classSchedule: makeupClassScheduleId,
                scheduleStatus: { $nin: ['cancelled'] }
              }).session(session);
              
              // Nếu không còn học sinh nào → Xóa ClassSchedule
              if (remainingStudents === 0) {
                await ClassSchedule.findByIdAndDelete(makeupClassScheduleId).session(session);
              }
              // Nếu còn học sinh khác → Giữ lại ClassSchedule (không làm gì)
            }
            // Nếu là buổi học ké (có class) → CHỈ xóa StudentSchedule, KHÔNG xóa ClassSchedule
            // (Đã xóa StudentSchedule ở trên, không cần làm gì thêm)
          }
        }
      }
    }
    
    // 3. Xóa substituteTeacher nếu có (cho đơn request_replace_teacher)
    if (changeRequest.type === 'request_replace_teacher' && changeRequest.classScheduleId) {
      const classScheduleId = changeRequest.classScheduleId._id || changeRequest.classScheduleId;
      const classSchedule = await ClassSchedule.findById(classScheduleId).session(session);
      
      if (classSchedule && classSchedule.substituteTeacher) {
        classSchedule.substituteTeacher = undefined;
        // Xóa note về giáo viên dạy thay
        if (classSchedule.note) {
          classSchedule.note = classSchedule.note.replace(/Giáo viên dạy thay:.*/g, '').trim();
        }
        await classSchedule.save({ session });
      }
    }
    
    // 4. Chuyển đơn sang trạng thái rejected
    changeRequest.status = 'rejected';
    changeRequest.approver = approverId;
    changeRequest.approvedDate = new Date();
    changeRequest.responseContent = 'Đơn đã được hoàn tác';
    // Xóa các ID liên quan
    changeRequest.makeupStudentScheduleId = undefined;
    changeRequest.substituteTeacherId = undefined;
    
    await changeRequest.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    const updatedChangeRequest = await ChangeRequest.findById(id)
      .populate('sender', 'username email phone')
      .populate('approver', 'username email');
    
    res.status(200).json({
      success: true,
      message: 'Đã hoàn tác đơn thành công',
      changeRequest: updatedChangeRequest
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(" Lỗi khi hoàn tác đơn:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi hoàn tác đơn",
      error: error.message
    });
  }
};

