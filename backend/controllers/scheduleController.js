const ClassSchedule = require('../models/classScheduleModel');
const Class = require('../models/classModel');
const Room = require('../models/room');
const Course = require('../models/courseModel');
const Session = require('../models/sessionModel');
const mongoose = require('mongoose');

/**
 * Helper function: Sắp xếp lại và gán session cho tất cả buổi học trong lớp theo thứ tự date/time
 * @param {ObjectId} classId - ID của lớp học
 */
async function reassignSessionsByOrder(classId) {
  try {
    console.log('🔄 Bắt đầu sắp xếp lại session cho lớp:', classId);
    
    // Lấy thông tin lớp và course
    const classData = await Class.findById(classId).populate('course', 'sessions').lean();
    if (!classData || !classData.course) {
      console.log('⚠️ Không tìm thấy lớp hoặc course');
      return;
    }
    
    // Lấy tất cả schedules của lớp, sắp xếp theo date và startTime
    const allSchedules = await ClassSchedule.find({ class: classId })
      .sort({ date: 1, startTime: 1 })
      .lean();
    
    if (allSchedules.length === 0) {
      console.log('⚠️ Không có buổi học nào trong lớp');
      return;
    }
    
    console.log(`📅 Tìm thấy ${allSchedules.length} buổi học trong lớp`);
    
    // Lấy course sessions và sắp xếp theo order
    const courseData = await Course.findById(classData.course._id || classData.course)
      .populate('sessions', 'order')
      .select('sessions')
      .lean();
    
    if (!courseData || !courseData.sessions || courseData.sessions.length === 0) {
      console.log('⚠️ Course không có sessions');
      return;
    }
    
    const courseSessions = [...courseData.sessions].sort((a, b) => (a.order || 0) - (b.order || 0));
    console.log(`📚 Course có ${courseSessions.length} sessions (theo order):`);
    courseSessions.forEach((s, index) => {
      console.log(`   ${index + 1}. Session ${s.order || index + 1} (ID: ${s._id})`);
    });
    
    // Gán session cho từng buổi học theo thứ tự date/time
    const updatePromises = allSchedules.map(async (schedule, index) => {
      // Lấy session theo index (nếu vượt quá thì lặp lại)
      const sessionIndex = index < courseSessions.length 
        ? index 
        : index % courseSessions.length;
      const sessionId = courseSessions[sessionIndex]?._id || null;
      const sessionOrder = courseSessions[sessionIndex]?.order || sessionIndex + 1;
      
      const scheduleDate = new Date(schedule.date);
      const dateStr = scheduleDate.toLocaleDateString('vi-VN');
      console.log(`   Buổi ${index + 1}: ${dateStr} - ${schedule.startTime} → Session ${sessionOrder} (ID: ${sessionId})`);
      
      return ClassSchedule.findByIdAndUpdate(
        schedule._id,
        { session: sessionId },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    console.log(`✅ Đã gán lại session cho ${allSchedules.length} buổi học theo thứ tự date/time`);
    
  } catch (error) {
    console.error('❌ Lỗi khi sắp xếp lại session:', error);
    throw error;
  }
}

/**
 * Helper function: Validate conflict cho một schedule
 * @param {Object} scheduleData - { classId, date, startTime, endTime, room, excludeScheduleId }
 * @param {Object} classData - Class data với teacher, students, room đã populate
 * @returns {Object} { hasConflict: boolean, conflicts: { teacher: [], room: [], students: [] } }
 */
async function validateScheduleConflict(scheduleData, classData) {
  const { classId, date, startTime, endTime, room, excludeScheduleId } = scheduleData;
  
  const conflicts = {
    teacher: [],
    room: [],
    students: [],
    hasConflict: false
  };

  const teacherId = classData.teacher || classData.teacherId;
  const students = classData.students || [];
  
  // Parse date string (YYYY-MM-DD) và tạo Date object ở local timezone
  const dateParts = date.split('-');
  if (dateParts.length !== 3) {
    throw new Error('Định dạng ngày không hợp lệ. Phải là YYYY-MM-DD.');
  }
  
  const scheduleDate = new Date(
    parseInt(dateParts[0]), // year
    parseInt(dateParts[1]) - 1, // month (0-indexed)
    parseInt(dateParts[2]) // day
  );
  scheduleDate.setHours(0, 0, 0, 0);

  // Helper function để check time overlap
  // Chuyển đổi thời gian từ string "HH:MM" sang phút để so sánh chính xác
  const hasTimeOverlap = (start1, end1, start2, end2) => {
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const parts = timeStr.split(':');
      if (parts.length !== 2) return 0;
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      return hours * 60 + minutes;
    };
    
    const start1Min = timeToMinutes(start1);
    const end1Min = timeToMinutes(end1);
    const start2Min = timeToMinutes(start2);
    const end2Min = timeToMinutes(end2);
    
    // Hai khoảng thời gian overlap nếu: start1 < end2 VÀ end1 > start2
    // Lưu ý: Nếu một lớp kết thúc đúng lúc lớp kia bắt đầu (ví dụ: 08:00-10:00 và 10:00-12:00)
    // thì KHÔNG có overlap vì sử dụng > và < (không có =)
    return start1Min < end2Min && end1Min > start2Min;
  };

  // Helper function để format date
  const formatDateLocal = (dateInput) => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 1. Kiểm tra conflict PHÒNG HỌC
  const roomScheduleQuery = {
    room: new mongoose.Types.ObjectId(room),
    date: scheduleDate,
    status: { $in: ['temporary', 'fixed'] }
  };
  if (excludeScheduleId) {
    roomScheduleQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
  }

  const roomSchedules = await ClassSchedule.find(roomScheduleQuery)
    .populate('class', 'name')
    .select('date startTime endTime class')
    .lean();

  roomSchedules.forEach(schedule => {
    if (hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime)) {
      const scheduleClassId = schedule.class?._id?.toString() || schedule.class?.toString() || null;
      const isCurrentClass = scheduleClassId === classId.toString();
      
      conflicts.room.push({
        roomId: room.toString(),
        className: schedule.class?.name || 'N/A',
        date: formatDateLocal(schedule.date),
        time: `${schedule.startTime} - ${schedule.endTime}`,
        conflictingTime: `${startTime} - ${endTime}`,
        isCurrentClass: isCurrentClass
      });
      conflicts.hasConflict = true;
    }
  });

  // 2. Kiểm tra conflict GIÁO VIÊN
  if (teacherId) {
    const teacherClasses = await Class.find({
      $or: [
        { teacher: teacherId },
        { teacherId: teacherId }
      ],
      _id: { $ne: classId }
    }).select('_id name').lean();

    if (teacherClasses.length > 0) {
      const teacherClassIds = teacherClasses.map(c => c._id);

      const teacherScheduleQuery = {
        class: { $in: teacherClassIds },
        date: scheduleDate,
        status: { $in: ['temporary', 'fixed'] }
      };
      if (excludeScheduleId) {
        teacherScheduleQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
      }

      const teacherSchedules = await ClassSchedule.find(teacherScheduleQuery)
        .populate('class', 'name')
        .select('date startTime endTime class')
        .lean();

      teacherSchedules.forEach(schedule => {
        if (hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime)) {
          conflicts.teacher.push({
            teacherId: teacherId.toString(),
            className: schedule.class?.name || 'N/A',
            date: formatDateLocal(schedule.date),
            time: `${schedule.startTime} - ${schedule.endTime}`,
            conflictingTime: `${startTime} - ${endTime}`
          });
          conflicts.hasConflict = true;
        }
      });
    }
  }

  // 3. Kiểm tra conflict SINH VIÊN
  if (students.length > 0) {
    const studentClasses = await Class.find({
      students: { $in: students },
      _id: { $ne: classId }
    }).select('_id name students').lean();

    if (studentClasses.length > 0) {
      const studentClassIds = studentClasses.map(c => c._id);

      const studentScheduleQuery = {
        class: { $in: studentClassIds },
        date: scheduleDate,
        status: { $in: ['temporary', 'fixed'] }
      };
      if (excludeScheduleId) {
        studentScheduleQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
      }

      const studentSchedules = await ClassSchedule.find(studentScheduleQuery)
        .populate('class', 'name')
        .select('date startTime endTime class')
        .lean();

      const studentConflictMap = new Map();

      studentSchedules.forEach(schedule => {
        if (hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime)) {
          const scheduleClassId = schedule.class?._id?.toString() || schedule.class?.toString() || null;
          if (!scheduleClassId) return;

          const conflictingClass = studentClasses.find(cls => cls._id.toString() === scheduleClassId);
          if (!conflictingClass) return;

          conflictingClass.students.forEach(studentIdInConflictClass => {
            const studentIdInConflictClassStr = studentIdInConflictClass.toString();
            
            const studentInCurrentClass = students.find(s => {
              const studentIdStr = s._id?.toString() || s.toString();
              return studentIdStr === studentIdInConflictClassStr;
            });

            if (studentInCurrentClass) {
              const studentName = studentInCurrentClass.username || studentInCurrentClass.fullName || `Sinh viên ${studentIdInConflictClassStr}`;
              
              if (!studentConflictMap.has(studentIdInConflictClassStr)) {
                studentConflictMap.set(studentIdInConflictClassStr, {
                  studentId: studentIdInConflictClassStr,
                  studentName: studentName,
                  conflicts: []
                });
              }
              studentConflictMap.get(studentIdInConflictClassStr).conflicts.push({
                className: schedule.class?.name || conflictingClass.name || 'N/A',
                date: formatDateLocal(schedule.date),
                time: `${schedule.startTime} - ${schedule.endTime}`,
                conflictingTime: `${startTime} - ${endTime}`
              });
              conflicts.hasConflict = true;
            }
          });
        }
      });

      studentConflictMap.forEach((studentConflict) => {
        conflicts.students.push(studentConflict);
      });
    }
  }

  return conflicts;
}

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
    const temporary = await ClassSchedule.countDocuments({ status: 'temporary' });
    const fixed = await ClassSchedule.countDocuments({ status: 'fixed' });
    
    // Today's schedules
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaySchedules = await ClassSchedule.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['temporary', 'fixed'] }
    });
    
    res.status(200).json({
      success: true,
      stats: {
        total,
        temporary,
        fixed,
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
      status = 'fixed',
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
      status: { $in: ['temporary', 'fixed'] },
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
    
    // Validation: Kiểm tra số buổi đã học và preview các buổi sẽ bị xóa
    const { getSchedulesToDeletePreview, cleanupSchedulesAfterAdding } = require('../helpers/scheduleCleanup');
    const classData = await Class.findById(classId).select('course').lean();
    
    if (!classData || !classData.course) {
      return res.status(400).json({
        success: false,
        message: 'Lớp học chưa có course được gán.'
      });
    }

    const preview = await getSchedulesToDeletePreview(classId, classData.course);
    
    if (!preview.canAdd) {
      return res.status(400).json({
        success: false,
        message: preview.errorMessage || 'Không thể thêm buổi học.',
        cleanupInfo: {
          totalSchedules: preview.totalSchedules,
          attendedCount: preview.attendedCount,
          numberOfSessions: preview.numberOfSessions
        }
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
    
    // Cleanup: Xóa các buổi thừa và gán lại session
    const cleanupResult = await cleanupSchedulesAfterAdding(classId, classData.course);
    
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
    
    // Chuẩn bị cleanupInfo với thông tin về các buổi đã bị xóa
    const cleanupInfo = cleanupResult.success && preview.schedulesToDelete && preview.schedulesToDelete.length > 0 ? {
      deletedCount: cleanupResult.deletedCount || 0,
      reassignedSessions: cleanupResult.reassignedSessions || 0,
      schedulesToDelete: preview.schedulesToDelete // Sử dụng preview vì đây là danh sách buổi đã bị xóa
    } : null;

    res.status(201).json({
      success: true,
      message: 'Tạo lịch học thành công',
      schedule: populatedSchedule,
      cleanupInfo
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
    
    const { class: classId, session, topic, date, startTime, endTime, room, reason, status, updateScope } = req.body;
    
    // Determine update scope: 'single' (default) or 'future'
    const scope = updateScope || 'single';
    
    if (scope === 'future') {
      // Update "Buổi học này và các buổi học sau" - tìm tất cả buổi có cùng pattern và cập nhật
      console.log('📝 Cập nhật "Buổi học này và các buổi học sau":');
      
      // 1. Lấy pattern cũ từ buổi học hiện tại
      const currentDate = new Date(schedule.date);
      currentDate.setHours(0, 0, 0, 0);
      const currentDayOfWeek = currentDate.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
      const currentStartTime = schedule.startTime;
      const currentEndTime = schedule.endTime;
      
      console.log('  - Pattern cũ: Thứ', currentDayOfWeek, currentStartTime, '-', currentEndTime);
      
      // Helper function để format date (phải định nghĩa trước khi sử dụng)
      const formatDateToYYYYMMDD = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      // Parse date mới
      const newDateParts = date.split('-');
      if (newDateParts.length !== 3) {
        return res.status(400).json({
          success: false,
          message: 'Định dạng ngày không hợp lệ. Phải là YYYY-MM-DD.'
        });
      }
      
      const newDate = new Date(
        parseInt(newDateParts[0]),
        parseInt(newDateParts[1]) - 1,
        parseInt(newDateParts[2])
      );
      newDate.setHours(0, 0, 0, 0);
      const newDayOfWeek = newDate.getDay();
      const newStartTime = startTime || currentStartTime;
      const newEndTime = endTime || currentEndTime;
      
      console.log('  - Pattern mới: Thứ', newDayOfWeek, newStartTime, '-', newEndTime);
      
      // 2. Tìm tất cả buổi học có cùng pattern
      const allSchedules = await ClassSchedule.find({
        class: schedule.class,
        date: { $gte: currentDate }
      }).sort({ date: 1, startTime: 1 }).lean();
      
      // Filter các buổi có cùng pattern (thứ, startTime, endTime)
      const matchingSchedules = allSchedules.filter(s => {
        const sDate = new Date(s.date);
        sDate.setHours(0, 0, 0, 0);
        return sDate.getDay() === currentDayOfWeek &&
               s.startTime === currentStartTime &&
               s.endTime === currentEndTime;
      });
      
      console.log(`  - Tìm thấy ${matchingSchedules.length} buổi học có cùng pattern`);
      
      if (matchingSchedules.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy buổi học nào có cùng pattern để cập nhật'
        });
      }
      
      // 3. Tính toán date mới cho từng buổi
      const firstScheduleDate = new Date(matchingSchedules[0].date);
      firstScheduleDate.setHours(0, 0, 0, 0);
      
      // Tính số tuần chênh lệch giữa buổi đầu tiên và date mới
      // Ví dụ: buổi đầu 10/11 (Thứ 3) -> date mới 18/11 (Thứ 4)
      // weeksDiff = (18-10)/7 = 1 tuần, dayDiff = 4-3 = 1 ngày
      const daysDiff = Math.floor((newDate.getTime() - firstScheduleDate.getTime()) / (24 * 60 * 60 * 1000));
      const weeksDiff = Math.floor(daysDiff / 7);
      const dayDiff = newDayOfWeek - currentDayOfWeek;
      
      console.log('  - Buổi đầu tiên:', formatDateToYYYYMMDD(firstScheduleDate), `(Thứ ${currentDayOfWeek})`);
      console.log('  - Date mới:', formatDateToYYYYMMDD(newDate), `(Thứ ${newDayOfWeek})`);
      console.log('  - Số ngày chênh lệch:', daysDiff);
      console.log('  - Số tuần chênh lệch:', weeksDiff);
      console.log('  - Chênh lệch thứ:', dayDiff);
      
      // 4. Validate conflict cho tất cả buổi sẽ bị thay đổi
      const classData = await Class.findById(schedule.class)
        .select('teacher teacherId students room')
        .populate('teacher', 'username email')
        .populate('students', 'username email')
        .lean();
      
      if (!classData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin lớp học'
        });
      }
      
      const roomId = room || schedule.room || classData.room;
      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy thông tin phòng học'
        });
      }
      
      const validationErrors = [];
      
      console.log('  - Bắt đầu validate conflict cho', matchingSchedules.length, 'buổi học...');
      
      for (const matchingSchedule of matchingSchedules) {
        // Tính date mới cho buổi này
        // Công thức: newDate = originalDate + (số tuần từ buổi đầu * 7) + dayDiff
        const originalDate = new Date(matchingSchedule.date);
        originalDate.setHours(0, 0, 0, 0);
        
        // Tính số tuần từ buổi đầu tiên đến buổi này
        const daysFromFirst = Math.floor((originalDate.getTime() - firstScheduleDate.getTime()) / (24 * 60 * 60 * 1000));
        const weeksFromFirst = Math.floor(daysFromFirst / 7);
        
        // Date mới = date mới của buổi đầu + số tuần từ buổi đầu + dayDiff
        const newScheduleDate = new Date(newDate);
        newScheduleDate.setDate(newDate.getDate() + (weeksFromFirst * 7));
        newScheduleDate.setHours(0, 0, 0, 0);
        
        const newScheduleDateStr = formatDateToYYYYMMDD(newScheduleDate);
        
        console.log(`    - Validate buổi ${matchingSchedule._id}: ${formatDateToYYYYMMDD(originalDate)} -> ${newScheduleDateStr}`);
        
        // Validate conflict
        try {
          const validationResult = await validateScheduleConflict({
            classId: schedule.class.toString(),
            date: newScheduleDateStr,
            startTime: newStartTime,
            endTime: newEndTime,
            room: roomId.toString(),
            excludeScheduleId: matchingSchedule._id.toString()
          }, classData);
          
          if (validationResult.hasConflict) {
            validationErrors.push({
              scheduleId: matchingSchedule._id.toString(),
              date: newScheduleDateStr,
              conflicts: validationResult.conflicts
            });
            console.log(`      ⚠️ Có conflict!`);
          } else {
            console.log(`      ✓ Không có conflict`);
          }
        } catch (error) {
          console.error(`      ❌ Lỗi khi validate:`, error);
          validationErrors.push({
            scheduleId: matchingSchedule._id.toString(),
            date: newScheduleDateStr,
            conflicts: { hasConflict: true, error: error.message }
          });
        }
      }
      
      // Nếu có conflict, trả về lỗi
      if (validationErrors.length > 0) {
        console.log(`  ❌ Có ${validationErrors.length} buổi học bị conflict`);
        return res.status(400).json({
          success: false,
          message: `Có ${validationErrors.length} buổi học bị xung đột lịch học`,
          conflicts: validationErrors
        });
      }
      
      console.log(`  ✓ Tất cả ${matchingSchedules.length} buổi học đều không có conflict`);
      
      // 5. Cập nhật tất cả buổi nếu không có conflict
      const updatePromises = matchingSchedules.map(async (matchingSchedule) => {
        const originalDate = new Date(matchingSchedule.date);
        originalDate.setHours(0, 0, 0, 0);
        
        // Tính số tuần từ buổi đầu tiên đến buổi này
        const daysFromFirst = Math.floor((originalDate.getTime() - firstScheduleDate.getTime()) / (24 * 60 * 60 * 1000));
        const weeksFromFirst = Math.floor(daysFromFirst / 7);
        
        // Date mới = date mới của buổi đầu + số tuần từ buổi đầu
        const newScheduleDate = new Date(newDate);
        newScheduleDate.setDate(newDate.getDate() + (weeksFromFirst * 7));
        newScheduleDate.setHours(0, 0, 0, 0);
        
        const updateData = {
          date: newScheduleDate,
          startTime: newStartTime,
          endTime: newEndTime
        };
        
        if (room) {
          updateData.room = room;
        }
        
        // Giữ nguyên status = 'fixed', không đổi thành temporary
        // Giữ nguyên reason, session, class
        
        return ClassSchedule.findByIdAndUpdate(
          matchingSchedule._id,
          updateData,
          { new: true }
        );
      });
      
      await Promise.all(updatePromises);
      console.log(`  ✅ Đã cập nhật ${matchingSchedules.length} buổi học`);
      
      // 6. Reassign sessions
      console.log('🔄 Bắt đầu sắp xếp lại session cho tất cả buổi học trong lớp...');
      await reassignSessionsByOrder(schedule.class);
      
      const updatedSchedule = await ClassSchedule.findById(schedule._id)
        .populate('class', 'name level')
        .populate('room', 'room_name location');
      
      res.status(200).json({
        success: true,
        message: `Cập nhật ${matchingSchedules.length} buổi học thành công (buổi này và các buổi sau)`,
        schedule: updatedSchedule,
        updatedCount: matchingSchedules.length
      });
    } else {
      // Update only this schedule (default behavior - "Chỉ buổi học này")
      // Chỉ cập nhật date, startTime, endTime và set status = 'temporary'
      console.log('📝 Cập nhật chỉ buổi học này (single):');
      console.log('  - ScheduleId:', schedule._id);
      console.log('  - Date cũ:', schedule.date, '-> Date mới:', date);
      console.log('  - StartTime cũ:', schedule.startTime, '-> StartTime mới:', startTime);
      console.log('  - EndTime cũ:', schedule.endTime, '-> EndTime mới:', endTime);
      console.log('  - Status cũ:', schedule.status, '-> Status mới: temporary');
      
      if (date) schedule.date = date;
      if (startTime) schedule.startTime = startTime;
      if (endTime) schedule.endTime = endTime;
      
      // Khi chọn "Chỉ buổi học này", set status = 'temporary' (buổi tạm)
      schedule.status = 'temporary';
      
      // Không cập nhật các field khác khi updateScope là 'single'
      // (classId, session, topic, room, reason giữ nguyên)
      
      await schedule.save();
      
      // Sau khi cập nhật, cần sắp xếp lại và gán session theo thứ tự
      console.log('🔄 Bắt đầu sắp xếp lại session cho tất cả buổi học trong lớp...');
      await reassignSessionsByOrder(schedule.class);
      
      const updatedSchedule = await ClassSchedule.findById(schedule._id)
        .populate('class', 'name level')
        .populate('room', 'room_name location');
      
      console.log('✅ Cập nhật thành công buổi học:', schedule._id);
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật buổi học thành công',
        schedule: updatedSchedule
      });
    }
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

//lấy danh sách lịch học chờ phê duyệt (tạm thời giữ nguyên, sẽ điều chỉnh sau)
exports.getPendingSchedules = async (req, res) => {
    try {
        // Tạm thời trả về empty array vì không còn status 'pending_approval'
        const pendingSchedules = [];

        res.status(200).json({
            success: true,
            count: pendingSchedules.length,
            data: pendingSchedules
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
};

//duyệt lịch học (tạm thời giữ nguyên, sẽ điều chỉnh sau)
exports.approveSchedule = async (req, res) => {
    try {
        const schedule = await ClassSchedule.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'fixed', // Chuyển sang 'fixed' thay vì 'approved'
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

//từ chối lịch học (tạm thời giữ nguyên, sẽ điều chỉnh sau)
exports.rejectSchedule = async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp lý do từ chối.' });
    }

    try {
        // Tạm thời không thay đổi status vì không còn 'rejected', chỉ lưu rejectionReason
        const schedule = await ClassSchedule.findByIdAndUpdate(
            req.params.id,
            { 
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

