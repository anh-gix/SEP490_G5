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
    const { status, type, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
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
      .populate({
        path: 'studentScheduleId',
        // Không dùng select để đảm bảo tất cả field (bao gồm student) được include
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
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    // Đảm bảo field student được include trong studentScheduleId
    // Lấy đầy đủ thông tin StudentSchedule từ database cho tất cả request có studentScheduleId
    for (let i = 0; i < changeRequests.length; i++) {
      const request = changeRequests[i];
      if (request.studentScheduleId && request.studentScheduleId._id) {
        // Lấy đầy đủ thông tin StudentSchedule từ database
        const studentScheduleId = request.studentScheduleId._id;
        const fullStudentSchedule = await StudentSchedule.findById(studentScheduleId)
          .select('student classSchedule attendance scheduleStatus reason')
          .lean();
        
        if (fullStudentSchedule) {
          // Merge thông tin từ database vào studentScheduleId (đảm bảo có field student)
          request.studentScheduleId.student = fullStudentSchedule.student;
          // Giữ nguyên classSchedule đã populate, nhưng đảm bảo các field khác cũng có
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
    
    // Thêm thông tin lịch học và session hiện tại cho các request có classId (change_class)
    const classIdsToEnrich = changeRequests
      .filter(req => req.type === 'change_class' && req.classId)
      .map(req => req.classId._id || req.classId);
    
    if (classIdsToEnrich.length > 0) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      // Lấy tất cả fixed schedules của các lớp này
      const classSchedules = await ClassSchedule.find({
        class: { $in: classIdsToEnrich },
        status: 'fixed'
      })
        .populate('session', 'title order')
        .populate('room', 'room_name')
        .sort({ date: 1, startTime: 1 })
        .lean();
      
      // Nhóm schedules theo classId
      const schedulesByClass = {};
      classSchedules.forEach(schedule => {
        const classId = schedule.class?.toString() || schedule.class;
        if (!schedulesByClass[classId]) {
          schedulesByClass[classId] = [];
        }
        schedulesByClass[classId].push(schedule);
      });
      
      // Tìm session hiện tại và attach vào từng request
      changeRequests.forEach(request => {
        if (request.type === 'change_class' && request.classId) {
          const classId = request.classId._id?.toString() || request.classId.toString();
          const schedules = schedulesByClass[classId] || [];
          
          // Tìm session hiện tại (session gần nhất đã học hoặc sắp học)
          let currentSession = null;
          const pastSessions = schedules.filter(s => {
            const scheduleDate = new Date(s.date);
            scheduleDate.setHours(0, 0, 0, 0);
            return scheduleDate < now;
          });
          
          if (pastSessions.length > 0) {
            // Lấy session đã học gần nhất
            currentSession = pastSessions[pastSessions.length - 1];
          } else if (schedules.length > 0) {
            // Nếu chưa có session nào đã học, lấy session đầu tiên (sắp học)
            currentSession = schedules[0];
          }
          
          // Attach thông tin vào classId
          if (request.classId) {
            request.classId.fixedSchedules = schedules.map(s => ({
              id: s._id,
              date: s.date,
              startTime: s.startTime,
              endTime: s.endTime,
              session: s.session,
              room: s.room,
              roomName: s.room?.room_name || 'N/A',
              status: s.status || 'fixed' // Đảm bảo có field status
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
    console.error("❌ Lỗi khi lấy danh sách đơn:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy danh sách đơn",
      error: error.message 
    });
  }
};

// =========================
// ➕ TẠO CHANGE REQUEST MỚI
// =========================
exports.createChangeRequest = async (req, res) => {
  try {
    const { type, studentScheduleId, classId, classScheduleId, content } = req.body;
    const senderId = req.user._id; // Lấy từ token
    
    // Validate required fields
    if (!type || !content) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }
    
    // Validate type
    const validTypes = ['create_class', 'change_class', 'makeup_class', 'replace_teacher'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Loại đơn không hợp lệ'
      });
    }
    
    // Validate studentScheduleId for makeup_class
    if (type === 'makeup_class' && !studentScheduleId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin buổi học'
      });
    }
    
    // Verify studentScheduleId exists and belongs to sender
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
    }
    
    // Create change request
    const changeRequest = await ChangeRequest.create({
      sender: senderId,
      type,
      studentScheduleId: type === 'makeup_class' ? studentScheduleId : undefined,
      classId: type === 'change_class' ? classId : undefined,
      classScheduleId: type === 'replace_teacher' ? classScheduleId : undefined,
      content: content.trim()
    });
    
    // Populate sender info
    const populatedRequest = await ChangeRequest.findById(changeRequest._id)
      .populate('sender', 'username email')
      .lean();
    
    res.status(201).json({
      success: true,
      message: 'Gửi đơn thành công',
      changeRequest: populatedRequest
    });
  } catch (error) {
    console.error('❌ Lỗi khi tạo change request:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đơn',
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
          console.warn('⚠️ Thiếu thông tin buổi nghỉ:', makeup);
          continue;
        }
        
        console.log(`🔍 Bắt đầu tìm ClassSchedule cho buổi nghỉ: ${absentScheduleId}`);
        console.log(`   - Type: ${typeof absentScheduleId}`);
        console.log(`   - isNewMakeup: ${isNewMakeup}`);
        
        // Kiểm tra ClassSchedule của buổi nghỉ
        // absentScheduleId có thể là StudentSchedule ID hoặc ClassSchedule ID
        let absentClassSchedule = null;
        let actualAbsentClassScheduleId = null;
        
        // Thử tìm ClassSchedule trực tiếp trước
        try {
          absentClassSchedule = await ClassSchedule.findById(absentScheduleId).session(session);
          if (absentClassSchedule) {
            actualAbsentClassScheduleId = absentScheduleId;
            console.log(`✅ Tìm thấy ClassSchedule trực tiếp: ${absentScheduleId}`);
          }
        } catch (error) {
          console.log(`ℹ️ Không tìm thấy ClassSchedule trực tiếp với ID: ${absentScheduleId}`);
        }
        
        // Nếu không tìm thấy ClassSchedule, thử tìm StudentSchedule và lấy classSchedule từ đó
        if (!absentClassSchedule) {
          console.log(`🔍 Thử tìm StudentSchedule với ID: ${absentScheduleId}`);
          try {
            const absentStudentSchedule = await StudentSchedule.findById(absentScheduleId)
              .populate('classSchedule')
              .session(session);
            
            if (absentStudentSchedule) {
              console.log(`✅ Tìm thấy StudentSchedule: ${absentScheduleId}`);
              
              if (absentStudentSchedule.classSchedule) {
                actualAbsentClassScheduleId = absentStudentSchedule.classSchedule._id || absentStudentSchedule.classSchedule;
                console.log(`   - ClassSchedule ID từ StudentSchedule: ${actualAbsentClassScheduleId}`);
                
                // Tìm lại ClassSchedule với ID đúng
                absentClassSchedule = await ClassSchedule.findById(actualAbsentClassScheduleId).session(session);
                
                if (absentClassSchedule) {
                  console.log(`✅ Đã tìm thấy ClassSchedule từ StudentSchedule: ${actualAbsentClassScheduleId}`);
                } else {
                  console.warn(`⚠️ Không tìm thấy ClassSchedule với ID từ StudentSchedule: ${actualAbsentClassScheduleId}`);
                }
              } else {
                console.warn(`⚠️ StudentSchedule không có classSchedule: ${absentScheduleId}`);
              }
            } else {
              console.warn(`⚠️ Không tìm thấy StudentSchedule với ID: ${absentScheduleId}`);
            }
          } catch (error) {
            console.error(`❌ Lỗi khi tìm StudentSchedule:`, error);
          }
        }
        
        if (!absentClassSchedule) {
          console.error(`❌ Không tìm thấy ClassSchedule cho buổi nghỉ: ${absentScheduleId}`);
          console.error(`   - Đã thử tìm ClassSchedule trực tiếp`);
          console.error(`   - Đã thử tìm qua StudentSchedule`);
          console.error(`   - Makeup data:`, JSON.stringify(makeup, null, 2));
          continue;
        }
        
        console.log(`✅ Đã xác định ClassSchedule cho buổi nghỉ: ${actualAbsentClassScheduleId}`);
        
        let finalMakeupScheduleId = makeupScheduleId;
        
        // Xử lý trường hợp giáo viên dạy thay
        if (isSubstituteClass && substituteTeacherId) {
          console.log(`👨‍🏫 Xử lý giáo viên dạy thay cho buổi nghỉ: ${absentScheduleId}`);
          console.log(`   - Giáo viên dạy thay: ${substituteTeacherId}`);
          
          // Lưu giáo viên gốc vào substituteTeacher (nếu chưa có)
          const originalTeacher = absentClassSchedule.teacher;
          if (!absentClassSchedule.substituteTeacher) {
            absentClassSchedule.substituteTeacher = originalTeacher;
          }
          
          // Cập nhật teacher của ClassSchedule buổi nghỉ thành giáo viên dạy thay
          absentClassSchedule.teacher = new mongoose.Types.ObjectId(substituteTeacherId);
          
          // Thêm note để ghi nhận việc có giáo viên dạy thay
          const substituteNote = `Giáo viên dạy thay: ${substituteTeacherId} (Giáo viên gốc: ${originalTeacher})`;
          if (absentClassSchedule.note) {
            absentClassSchedule.note += `\n${substituteNote}`;
          } else {
            absentClassSchedule.note = substituteNote;
          }
          
          await absentClassSchedule.save({ session });
          
          console.log(`✅ Đã cập nhật ClassSchedule với giáo viên dạy thay: ${absentScheduleId}`);
          console.log(`   - Giáo viên gốc (đã lưu vào substituteTeacher): ${originalTeacher}`);
          console.log(`   - Giáo viên dạy thay (đã cập nhật vào teacher): ${substituteTeacherId}`);
          
          // Với đơn replace_teacher, buổi học vẫn diễn ra bình thường
          // Học sinh vẫn đi học, không cần xử lý StudentSchedule
          // StudentSchedule giữ nguyên trạng thái (scheduled) vì buổi học không bị hủy
          
          // Bỏ qua các bước xử lý buổi học bù thông thường
          continue;
        }
        
        // Xử lý trường hợp tạo buổi học bù mới
        if (isNewMakeup && newMakeupDate && newMakeupStartTime && newMakeupEndTime && newMakeupRoomId && newMakeupTeacherId) {
          console.log(`🆕 Tạo buổi học bù mới cho buổi nghỉ: ${absentScheduleId}`);
          
          // Parse date string (YYYY-MM-DD) và tạo Date object ở UTC để tránh timezone issues
          const dateParts = newMakeupDate.split('-');
          if (dateParts.length !== 3) {
            console.warn(`⚠️ Định dạng ngày không hợp lệ: ${newMakeupDate}`);
            continue;
          }
          
          // Tạo date ở UTC để đảm bảo consistency với MongoDB (MongoDB lưu dates dưới dạng UTC)
          const scheduleDate = new Date(Date.UTC(
            parseInt(dateParts[0]), // year
            parseInt(dateParts[1]) - 1, // month (0-indexed)
            parseInt(dateParts[2]), // day
            0, // hours
            0, // minutes
            0, // seconds
            0  // milliseconds
          ));
          
          // Tạo date range để query (start và end của ngày trong UTC)
          const startOfDay = new Date(scheduleDate);
          const endOfDay = new Date(scheduleDate);
          endOfDay.setUTCHours(23, 59, 59, 999);
          
          // Kiểm tra conflict với room và teacher (trong transaction)
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
            console.warn(`⚠️ Phòng học đã được sử dụng vào thời gian này: ${newMakeupRoomId}`);
            throw new Error('Phòng học đã được sử dụng vào thời gian này');
          }
          
          // Kiểm tra conflict với teacher
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
              console.warn(`⚠️ Giáo viên đã có lớp khác vào thời gian này: ${newMakeupTeacherId}`);
              throw new Error('Giáo viên đã có lớp khác vào thời gian này');
            }
          }
          
          // Kiểm tra conflict với lịch học của học sinh
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
            
            // Hai khoảng thời gian overlap nếu: start1 < end2 VÀ end1 > start2
            // Ví dụ: 09:00-11:00 và 10:00-12:00 overlap từ 10:00-11:00
            const hasOverlap = start1Min < end2Min && end1Min > start2Min;
            
            console.log(`🔍 Kiểm tra overlap: [${start1}-${end1}] vs [${start2}-${end2}]`);
            console.log(`   - start1Min: ${start1Min}, end1Min: ${end1Min}`);
            console.log(`   - start2Min: ${start2Min}, end2Min: ${end2Min}`);
            console.log(`   - Has overlap: ${hasOverlap}`);
            
            return hasOverlap;
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
          console.log(`📅 Kiểm tra conflict cho buổi học bù: ${makeupDateStr} ${newMakeupStartTime}-${newMakeupEndTime}`);
          console.log(`   - Học sinh ID: ${studentId}`);
          
          // Lấy tất cả buổi học của học sinh (bao gồm cả các buổi có status là scheduled, rescheduled, pending)
          const studentSchedules = await StudentSchedule.find({ 
            student: studentId,
            scheduleStatus: { $in: ['scheduled', 'rescheduled', 'pending'] } // Chỉ kiểm tra các buổi học đang active
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
          
          console.log(`   - Tìm thấy ${studentSchedules.length} buổi học của học sinh`);
          
          // Kiểm tra conflict với lịch học của học sinh
          const studentConflicts = [];
          studentSchedules.forEach((studentSchedule, index) => {
            if (!studentSchedule.classSchedule) {
              console.log(`   - Buổi học ${index + 1}: Không có classSchedule, bỏ qua`);
              return;
            }
            
            const existingScheduleDate = new Date(studentSchedule.classSchedule.date);
            existingScheduleDate.setHours(0, 0, 0, 0);
            const existingScheduleDateStr = formatDateLocal(existingScheduleDate);
            
            console.log(`   - Buổi học ${index + 1}: ${existingScheduleDateStr} ${studentSchedule.classSchedule.startTime}-${studentSchedule.classSchedule.endTime}`);
            
            // Kiểm tra cùng ngày và trùng giờ
            if (existingScheduleDateStr === makeupDateStr) {
              console.log(`     ✓ Cùng ngày, kiểm tra overlap...`);
              const hasOverlap = hasTimeOverlap(
                newMakeupStartTime, 
                newMakeupEndTime,
                studentSchedule.classSchedule.startTime,
                studentSchedule.classSchedule.endTime
              );
              
              if (hasOverlap) {
                console.log(`     ⚠️ PHÁT HIỆN CONFLICT!`);
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
            console.error(`❌ Học sinh có ${studentConflicts.length} conflict với lịch học hiện tại:`, studentConflicts);
            const conflictMessages = studentConflicts.map(c => `${c.className} (${c.date} ${c.time})`).join(', ');
            throw new Error(`Học sinh có lịch học trùng với buổi học bù: ${conflictMessages}`);
          }
          
          console.log(`✅ Không có conflict với lịch học của học sinh`);
          
          // Tạo ClassSchedule mới trong transaction
          const newMakeupSchedule = new ClassSchedule({
            class: null, // Không có classId cho buổi học bù
            session: newMakeupSessionId ? new mongoose.Types.ObjectId(newMakeupSessionId) : null,
            date: scheduleDate,
            startTime: newMakeupStartTime,
            endTime: newMakeupEndTime,
            room: new mongoose.Types.ObjectId(newMakeupRoomId),
            teacher: new mongoose.Types.ObjectId(newMakeupTeacherId),
            createdBy: approverId || new mongoose.Types.ObjectId(newMakeupTeacherId),
            reason: 'Buổi học bù',
            status: 'temporary' // Buổi học bù là temporary
          });
          
          await newMakeupSchedule.save({ session });
          finalMakeupScheduleId = newMakeupSchedule._id;
          
          console.log(`✅ Đã tạo ClassSchedule mới cho buổi học bù: ${finalMakeupScheduleId}`);
        } else if (makeupScheduleId) {
          // Trường hợp chọn từ lớp có sẵn
          // Kiểm tra ClassSchedule có tồn tại không
          const makeupClassSchedule = await ClassSchedule.findById(makeupScheduleId).session(session);
          
          if (!makeupClassSchedule) {
            console.warn(`⚠️ Không tìm thấy ClassSchedule cho buổi học bù: ${makeupScheduleId}`);
            continue;
          }
          
          finalMakeupScheduleId = makeupScheduleId;
        } else {
          console.warn('⚠️ Thiếu thông tin để tạo hoặc chọn buổi học bù:', makeup);
          continue;
        }
        
        // Đảm bảo finalMakeupScheduleId đã được set
        if (!finalMakeupScheduleId) {
          console.error(`❌ finalMakeupScheduleId chưa được set. Makeup data:`, JSON.stringify(makeup, null, 2));
          continue;
        }
        
        console.log(`📝 Bắt đầu xử lý StudentSchedule cho buổi học bù`);
        console.log(`   - finalMakeupScheduleId: ${finalMakeupScheduleId}`);
        console.log(`   - actualAbsentClassScheduleId: ${actualAbsentClassScheduleId}`);
        console.log(`   - studentId: ${studentId}`);
        
        // Kiểm tra xem đã có StudentSchedule cho buổi học bù chưa (tránh duplicate)
        const existingMakeupSchedule = await StudentSchedule.findOne({
          student: studentId,
          classSchedule: finalMakeupScheduleId
        }).session(session);
        
        if (!existingMakeupSchedule) {
          // Tạo StudentSchedule mới cho buổi học bù
          console.log(`🆕 Tạo StudentSchedule mới cho buổi học bù...`);
          const newStudentSchedule = new StudentSchedule({
            student: studentId,
            classSchedule: finalMakeupScheduleId,
            scheduleStatus: 'rescheduled',
            reason: `Học bù cho buổi nghỉ ngày ${new Date(absentClassSchedule.date).toLocaleDateString('vi-VN')}`
          });
          
          await newStudentSchedule.save({ session });
          console.log(`✅ Đã tạo StudentSchedule mới cho buổi học bù:`);
          console.log(`   - StudentSchedule ID: ${newStudentSchedule._id}`);
          console.log(`   - ClassSchedule ID: ${finalMakeupScheduleId}`);
          console.log(`   - Student ID: ${studentId}`);
          console.log(`   - Status: rescheduled`);
        } else {
          console.log(`ℹ️ StudentSchedule cho buổi học bù đã tồn tại: ${finalMakeupScheduleId}`);
          console.log(`   - StudentSchedule ID: ${existingMakeupSchedule._id}`);
        }
        
        // Cập nhật StudentSchedule của buổi nghỉ thành cancelled
        console.log(`🚫 Bắt đầu cancel StudentSchedule của buổi nghỉ...`);
        console.log(`   - Tìm StudentSchedule với studentId: ${studentId}`);
        console.log(`   - Tìm StudentSchedule với classSchedule: ${actualAbsentClassScheduleId}`);
        
        const absentStudentSchedule = await StudentSchedule.findOne({
          student: studentId,
          classSchedule: actualAbsentClassScheduleId
        }).session(session);
        
        if (absentStudentSchedule) {
          console.log(`✅ Tìm thấy StudentSchedule của buổi nghỉ:`);
          console.log(`   - StudentSchedule ID: ${absentStudentSchedule._id}`);
          console.log(`   - ClassSchedule ID: ${actualAbsentClassScheduleId}`);
          console.log(`   - Status hiện tại: ${absentStudentSchedule.scheduleStatus}`);
          
          absentStudentSchedule.scheduleStatus = 'cancelled';
          absentStudentSchedule.reason = `Học bù tại lớp khác${makeupClassId ? ` (${makeupClassId})` : ''}`;
          await absentStudentSchedule.save({ session });
          
          console.log(`✅ Đã cập nhật StudentSchedule buổi nghỉ thành cancelled:`);
          console.log(`   - StudentSchedule ID: ${absentStudentSchedule._id}`);
          console.log(`   - Status mới: cancelled`);
          console.log(`   - Reason: ${absentStudentSchedule.reason}`);
        } else {
          console.warn(`⚠️ Không tìm thấy StudentSchedule cho buổi nghỉ:`);
          console.warn(`   - studentId: ${studentId}`);
          console.warn(`   - classSchedule: ${actualAbsentClassScheduleId}`);
          console.warn(`   - absentScheduleId (original): ${absentScheduleId}`);
          
          // Thử tìm với absentScheduleId gốc (có thể là StudentSchedule ID)
          if (absentScheduleId !== actualAbsentClassScheduleId) {
            console.log(`🔍 Thử tìm StudentSchedule với absentScheduleId gốc: ${absentScheduleId}`);
            const absentStudentScheduleByOriginalId = await StudentSchedule.findById(absentScheduleId).session(session);
            
            if (absentStudentScheduleByOriginalId) {
              console.log(`✅ Tìm thấy StudentSchedule với absentScheduleId gốc`);
              absentStudentScheduleByOriginalId.scheduleStatus = 'cancelled';
              absentStudentScheduleByOriginalId.reason = `Học bù tại lớp khác${makeupClassId ? ` (${makeupClassId})` : ''}`;
              await absentStudentScheduleByOriginalId.save({ session });
              console.log(`✅ Đã cập nhật StudentSchedule buổi nghỉ thành cancelled (tìm bằng absentScheduleId gốc)`);
            }
          }
        }
        } // Đóng vòng lặp for
      } catch (makeupError) {
        console.error(`❌ Lỗi khi xử lý buổi học bù:`, makeupError);
        console.error(`   - Error message: ${makeupError.message}`);
        console.error(`   - Error stack: ${makeupError.stack}`);
        throw makeupError; // Re-throw để transaction rollback
      }
    }
    
    // Xử lý đổi lớp nếu có
    if (pendingClassChange) {
      console.log('🔄 Bắt đầu xử lý đổi lớp...');
      
      const { oldClassId, newClassId } = pendingClassChange;
      
      // 1. Validate dữ liệu
      if (!oldClassId || !newClassId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin lớp cũ hoặc lớp mới'
        });
      }
      
      // Kiểm tra lớp cũ và lớp mới có tồn tại
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
      
      // Kiểm tra học viên có trong lớp cũ không
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
      
      // Kiểm tra lớp mới còn chỗ không (nếu có maxStudents)
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
      
      // 2. Lấy session order hiện tại của lớp cũ và lớp mới
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Tìm ClassSchedule gần nhất (date >= today) của lớp cũ
      const oldClassSchedules = await ClassSchedule.find({
        class: oldClassId,
        date: { $gte: today }
      })
        .populate('session', 'order')
        .sort({ date: 1, startTime: 1 })
        .limit(1)
        .session(session)
        .lean();
      
      // Tìm ClassSchedule gần nhất (date >= today) của lớp mới
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
      
      console.log(`📊 Session order - Lớp cũ: ${oldClassSessionOrder}, Lớp mới: ${newClassSessionOrder}`);
      
      // Xác định trường hợp
      let caseType = 1; // Mặc định là trường hợp 1
      if (oldClassSessionOrder !== null && newClassSessionOrder !== null) {
        if (oldClassSessionOrder < newClassSessionOrder) {
          caseType = 2; // Lớp cũ < lớp mới
        } else if (oldClassSessionOrder > newClassSessionOrder) {
          caseType = 3; // Lớp cũ > lớp mới
        }
      }
      
      console.log(`🔍 Trường hợp xử lý: ${caseType}`);
      
      // 3. Xử lý Class model
      // Xóa học viên khỏi lớp cũ
      oldClass.students = oldClass.students.filter(
        id => id.toString() !== studentId.toString()
      );
      await oldClass.save({ session });
      console.log(`✅ Đã xóa học viên khỏi lớp cũ: ${oldClassId}`);
      
      // Thêm học viên vào lớp mới (nếu chưa có)
      const studentInNewClass = newClass.students.some(
        id => id.toString() === studentId.toString()
      );
      if (!studentInNewClass) {
        newClass.students.push(studentId);
        await newClass.save({ session });
        console.log(`✅ Đã thêm học viên vào lớp mới: ${newClassId}`);
      }
      
      // 4. Xử lý StudentSchedule
      // a) Lấy tất cả ClassSchedule của lớp cũ
      const allOldClassSchedules = await ClassSchedule.find({
        class: oldClassId
      })
        .populate('session', 'order')
        .session(session)
        .lean();
      
      const oldClassScheduleIds = allOldClassSchedules.map(s => s._id);
      
      // b) Lấy tất cả StudentSchedule của học viên ở lớp cũ
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
      
      console.log(`📋 Tìm thấy ${studentSchedules.length} StudentSchedule của học viên ở lớp cũ`);
      
      // c) Lấy tất cả ClassSchedule của lớp mới để match
      const allNewClassSchedules = await ClassSchedule.find({
        class: newClassId
      })
        .populate('session', 'order')
        .session(session)
        .lean();
      
      // Tạo map để tìm ClassSchedule theo session order
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
      
      // Tạo set các absentScheduleId đã được xử lý trong pendingMakeupClasses (đã cancel riêng)
      const processedAbsentScheduleIds = new Set();
      if (pendingMakeupClasses && Array.isArray(pendingMakeupClasses)) {
        pendingMakeupClasses.forEach(makeup => {
          if (makeup.absentScheduleId) {
            processedAbsentScheduleIds.add(makeup.absentScheduleId.toString());
          }
        });
      }
      console.log(`📋 Đã xử lý ${processedAbsentScheduleIds.size} buổi học bù, các buổi này sẽ không bị cancel lại`);
      
      // d) Xử lý từng StudentSchedule
      let updatedCount = 0;
      let cancelledCount = 0;
      let unchangedCount = 0;
      
      for (const studentSchedule of studentSchedules) {
        const classSchedule = studentSchedule.classSchedule;
        if (!classSchedule) continue;
        
        const sessionOrder = classSchedule.session?.order;
        const hasAttendance = studentSchedule.attendance && studentSchedule.attendance.status !== null;
        const classScheduleId = classSchedule._id?.toString() || classSchedule.toString();
        
        // Kiểm tra buổi học đã diễn ra chưa (date < today)
        const scheduleDate = new Date(classSchedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        const isPastSchedule = scheduleDate < today;
        
        // Nếu đã có điểm danh hoặc đã diễn ra, giữ nguyên
        if (hasAttendance || isPastSchedule) {
          unchangedCount++;
          console.log(`⏭️ Giữ nguyên StudentSchedule ${studentSchedule._id} (${hasAttendance ? 'đã có điểm danh' : 'đã diễn ra'})`);
          continue;
        }
        
        // Nếu buổi học này đã được xử lý trong pendingMakeupClasses (đã cancel riêng), bỏ qua
        if (processedAbsentScheduleIds.has(classScheduleId)) {
          unchangedCount++;
          console.log(`⏭️ Giữ nguyên StudentSchedule ${studentSchedule._id} (đã được xử lý trong buổi học bù)`);
          continue;
        }
        
        // Xử lý theo từng trường hợp
        if (caseType === 1) {
          // Trường hợp 1: session order bằng nhau
          if (sessionOrder !== null && sessionOrder !== undefined) {
            const matchingSchedules = newClassScheduleMap.get(sessionOrder);
            if (matchingSchedules && matchingSchedules.length > 0) {
              // Lấy ClassSchedule đầu tiên có cùng session order
              const newClassScheduleId = matchingSchedules[0]._id;
              await StudentSchedule.findByIdAndUpdate(
                studentSchedule._id,
                { classSchedule: newClassScheduleId },
                { session }
              );
              updatedCount++;
              console.log(`✅ Updated StudentSchedule ${studentSchedule._id} -> ClassSchedule ${newClassScheduleId} (session ${sessionOrder})`);
            }
          }
        } else if (caseType === 2) {
          // Trường hợp 2: lớp cũ < lớp mới
          // Khi có học bù, chỉ cancel những buổi được chọn để học bù
          // Các buổi khác có sessionOrder < newClassSessionOrder sẽ được giữ nguyên
          // vì học viên đã học ở lớp cũ rồi, không cần cancel
          if (sessionOrder !== null && sessionOrder !== undefined) {
            if (sessionOrder < newClassSessionOrder) {
              // Nếu có pendingMakeupClasses, chỉ cancel những buổi trong danh sách học bù
              // Các buổi khác giữ nguyên (học viên đã học rồi)
              if (pendingMakeupClasses && pendingMakeupClasses.length > 0) {
                // Đã được xử lý ở trên (processedAbsentScheduleIds), nên đến đây là các buổi không cần cancel
                unchangedCount++;
                console.log(`⏭️ Giữ nguyên StudentSchedule ${studentSchedule._id} (session ${sessionOrder} < ${newClassSessionOrder}, không nằm trong danh sách học bù)`);
              } else {
                // Không có học bù, cancel tất cả buổi có sessionOrder < newClassSessionOrder
                await StudentSchedule.findByIdAndUpdate(
                  studentSchedule._id,
                  {
                    scheduleStatus: 'cancelled',
                    reason: 'Đã đổi lớp'
                  },
                  { session }
                );
                cancelledCount++;
                console.log(`🚫 Cancelled StudentSchedule ${studentSchedule._id} (session ${sessionOrder} < ${newClassSessionOrder}, date: ${scheduleDate.toISOString().split('T')[0]})`);
              }
            } else if (sessionOrder >= newClassSessionOrder) {
              // Session order >= lớp mới: update classSchedule
              const matchingSchedules = newClassScheduleMap.get(sessionOrder);
              if (matchingSchedules && matchingSchedules.length > 0) {
                const newClassScheduleId = matchingSchedules[0]._id;
                await StudentSchedule.findByIdAndUpdate(
                  studentSchedule._id,
                  { classSchedule: newClassScheduleId },
                  { session }
                );
                updatedCount++;
                console.log(`✅ Updated StudentSchedule ${studentSchedule._id} -> ClassSchedule ${newClassScheduleId} (session ${sessionOrder})`);
              }
            }
          }
        } else if (caseType === 3) {
          // Trường hợp 3: lớp cũ > lớp mới
          if (sessionOrder !== null && sessionOrder !== undefined) {
            if (sessionOrder < oldClassSessionOrder) {
              // Session order < lớp cũ: không thay đổi gì
              unchangedCount++;
              console.log(`⏭️ Giữ nguyên StudentSchedule ${studentSchedule._id} (session ${sessionOrder} < ${oldClassSessionOrder})`);
            } else if (sessionOrder >= oldClassSessionOrder) {
              // Session order >= lớp cũ: update classSchedule
              const matchingSchedules = newClassScheduleMap.get(sessionOrder);
              if (matchingSchedules && matchingSchedules.length > 0) {
                const newClassScheduleId = matchingSchedules[0]._id;
                await StudentSchedule.findByIdAndUpdate(
                  studentSchedule._id,
                  { classSchedule: newClassScheduleId },
                  { session }
                );
                updatedCount++;
                console.log(`✅ Updated StudentSchedule ${studentSchedule._id} -> ClassSchedule ${newClassScheduleId} (session ${sessionOrder})`);
              }
            }
          }
        }
      }
      
      console.log(`📊 Kết quả xử lý StudentSchedule:`);
      console.log(`   - Updated: ${updatedCount}`);
      console.log(`   - Cancelled: ${cancelledCount}`);
      console.log(`   - Unchanged: ${unchangedCount}`);
      console.log(`✅ Hoàn thành xử lý đổi lớp`);
    }
    
    // Cập nhật trạng thái đơn sử dụng findByIdAndUpdate để tránh lỗi validation
    await ChangeRequest.findByIdAndUpdate(
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
    );
    
    // Commit transaction before populating (populate doesn't need to be in transaction)
    await session.commitTransaction();
    session.endSession();
    
    // Fetch the updated document with populated fields after transaction commits
    const updatedChangeRequest = await ChangeRequest.findById(id)
      .populate('sender', 'username email phone')
      .populate('approver', 'username email');
    
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

