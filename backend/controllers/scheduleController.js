const ClassSchedule = require('../models/classScheduleModel');
const Class = require('../models/classModel');
const Room = require('../models/room');
const Course = require('../models/courseModel');
const Session = require('../models/sessionModel');
const StudentSchedule = require('../models/studentScheduleModel');
const mongoose = require('mongoose');

/**
 * Helper function: Sắp xếp lại và gán session cho tất cả buổi học trong lớp theo thứ tự date/time
 * @param {ObjectId} classId - ID của lớp học
 */
async function reassignSessionsByOrder(classId) {
  try {
    console.log(' Bắt đầu sắp xếp lại session cho lớp:', classId);
    
    const classData = await Class.findById(classId).populate('course', 'sessions').lean();
    if (!classData || !classData.course) {
      console.log(' Không tìm thấy lớp hoặc course');
      return;
    }
    
    const allSchedules = await ClassSchedule.find({ class: classId })
      .sort({ date: 1, startTime: 1 })
      .lean();
    
    if (allSchedules.length === 0) {
      console.log(' Không có buổi học nào trong lớp');
      return;
    }
    
    console.log(` Tìm thấy ${allSchedules.length} buổi học trong lớp`);
    
    const courseData = await Course.findById(classData.course._id || classData.course)
      .populate('sessions', 'order')
      .select('sessions')
      .lean();
    
    if (!courseData || !courseData.sessions || courseData.sessions.length === 0) {
      console.log(' Course không có sessions');
      return;
    }
    
    const courseSessions = [...courseData.sessions].sort((a, b) => (a.order || 0) - (b.order || 0));
    console.log(` Course có ${courseSessions.length} sessions (theo order):`);
    courseSessions.forEach((s, index) => {
      console.log(`   ${index + 1}. Session ${s.order || index + 1} (ID: ${s._id})`);
    });
    
    const updatePromises = allSchedules.map(async (schedule, index) => {
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
    console.log(` Đã gán lại session cho ${allSchedules.length} buổi học theo thứ tự date/time`);
    
  } catch (error) {
    console.error(' Lỗi khi sắp xếp lại session:', error);
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
        status: { $in: ['temporary', 'fixed'] },
        // FIX: Chỉ lấy các buổi mà giáo viên này thực sự dạy
        $or: [
          { teacher: teacherId },
          { substituteTeacher: teacherId }
        ]
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

  if (students.length > 0) {
    // Bước 1: Tìm các lớp có học sinh trong Class.students (học sinh chính thức)
    const studentClasses = await Class.find({
      students: { $in: students },
      _id: { $ne: classId }
    }).select('_id name students').lean();

    // Bước 2: Tìm tất cả StudentSchedule của học sinh (bao gồm cả học tạm thời)
    const studentIds = students.map(s => {
      const studentId = s._id || s;
      return new mongoose.Types.ObjectId(studentId);
    });

    const allStudentSchedules = await StudentSchedule.find({
      student: { $in: studentIds },
      scheduleStatus: { $nin: ['cancelled'] } // Bỏ qua buổi đã bị hủy
    })
      .populate({
        path: 'classSchedule',
        match: {
          date: scheduleDate,
          status: { $in: ['temporary', 'fixed'] }
        },
        populate: {
          path: 'class',
          select: 'name _id'
        },
        select: 'date startTime endTime class'
      })
      .lean();

    // Lọc bỏ các StudentSchedule không có classSchedule hoặc classSchedule không match
    const validStudentSchedules = allStudentSchedules.filter(
      ss => ss.classSchedule && 
            ss.classSchedule.class && 
            ss.classSchedule.class._id.toString() !== classId.toString()
    );

    // Bước 3: Lấy danh sách ClassSchedule IDs từ StudentSchedule (học tạm thời)
    const classScheduleIdsFromStudentSchedule = validStudentSchedules
      .map(ss => ss.classSchedule._id)
      .filter(id => {
        // Loại trừ chính buổi học đang chỉnh sửa
        if (excludeScheduleId) {
          return id.toString() !== excludeScheduleId.toString();
        }
        return true;
      });

    // Bước 4: Tìm các ClassSchedule từ lớp chính thức (logic cũ)
    const studentClassIds = studentClasses.map(c => c._id);
    const studentScheduleQuery = {
      class: { $in: studentClassIds },
      date: scheduleDate,
      status: { $in: ['temporary', 'fixed'] }
    };
    if (excludeScheduleId) {
      studentScheduleQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
    }

    const classSchedulesFromClasses = await ClassSchedule.find(studentScheduleQuery)
      .populate('class', 'name')
      .select('date startTime endTime class')
      .lean();

    // Bước 5: Tìm các ClassSchedule từ StudentSchedule (học tạm thời)
    let classSchedulesFromStudentSchedule = [];
    if (classScheduleIdsFromStudentSchedule.length > 0) {
      classSchedulesFromStudentSchedule = await ClassSchedule.find({
        _id: { $in: classScheduleIdsFromStudentSchedule },
        date: scheduleDate,
        status: { $in: ['temporary', 'fixed'] }
      })
        .populate('class', 'name')
        .select('date startTime endTime class')
        .lean();
    }

    // Bước 6: Gộp 2 danh sách và loại bỏ trùng lặp
    const allConflictingSchedules = [
      ...classSchedulesFromClasses,
      ...classSchedulesFromStudentSchedule
    ];

    // Loại bỏ trùng lặp theo _id
    const uniqueSchedules = new Map();
    allConflictingSchedules.forEach(schedule => {
      const scheduleId = schedule._id.toString();
      if (!uniqueSchedules.has(scheduleId)) {
        uniqueSchedules.set(scheduleId, schedule);
      }
    });

    // Bước 7: Kiểm tra xung đột
    const studentConflictMap = new Map();

    uniqueSchedules.forEach(schedule => {
      if (hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime)) {
        const scheduleClassId = schedule.class?._id?.toString() || schedule.class?.toString() || null;
        if (!scheduleClassId) return;

        // Tìm học sinh nào bị xung đột
        const conflictingStudentSchedules = validStudentSchedules.filter(
          ss => ss.classSchedule && 
                ss.classSchedule._id.toString() === schedule._id.toString()
        );

        conflictingStudentSchedules.forEach(ss => {
          const studentId = ss.student._id?.toString() || ss.student.toString();
          
          // Kiểm tra xem học sinh này có trong danh sách học sinh của lớp hiện tại không
          const studentInCurrentClass = students.find(s => {
            const studentIdStr = s._id?.toString() || s.toString();
            return studentIdStr === studentId;
          });

          if (studentInCurrentClass) {
            const studentName = studentInCurrentClass.username || 
                              studentInCurrentClass.fullName || 
                              `Học viên ${studentId}`;
            
            // Kiểm tra xem học sinh này có trong lớp chính thức không
            const isEnrolledInClass = studentClasses.some(c => 
              c.students.some(s => s.toString() === studentId)
            );
            const isAuditing = !isEnrolledInClass; // Học tạm thời nếu không có trong lớp chính thức
            
            if (!studentConflictMap.has(studentId)) {
              studentConflictMap.set(studentId, {
                studentId: studentId,
                studentName: studentName,
                conflicts: []
              });
            }
            
            studentConflictMap.get(studentId).conflicts.push({
              className: schedule.class?.name || 'N/A',
              date: formatDateLocal(schedule.date),
              time: `${schedule.startTime} - ${schedule.endTime}`,
              conflictingTime: `${startTime} - ${endTime}`,
              isAuditing: isAuditing // Đánh dấu là học tạm thời
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

  return conflicts;
}

/**
 * GET /api/schedules
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
        select: 'name level teacher startDate endDate course',
        populate: [
          { path: 'teacher', select: 'username email' },
          {
            path: 'course',
            select: 'name type',
            populate: {
              path: 'program',
              select: 'type'
            }
          }
        ]
      })
      .populate('teacher', 'username email')
      .populate('room', 'room_name location capacity')
      .populate('session', 'title order')
      .populate('createdBy', 'username email')
      .sort({ date: 1, startTime: 1 })
      .lean(); // Sử dụng lean() để trả về plain objects, dễ dàng gán thêm properties
    
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
          .select('name program sessions');
        
        // Nếu không tìm thấy với ObjectId, thử với string
        if (!course) {
          course = await Course.findOne({ sessions: sessionObjectId.toString() })
            .populate({
              path: 'program',
              select: 'type'
            })
            .select('name program sessions');
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
            .select('name program sessions');
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
 */
exports.getScheduleStats = async (req, res) => {
  try {
    const total = await ClassSchedule.countDocuments();
    const temporary = await ClassSchedule.countDocuments({ status: 'temporary' });
    const fixed = await ClassSchedule.countDocuments({ status: 'fixed' });
    
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
      .populate('teacher', 'username email')
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
    
    if (!classId || !topic || !date || !startTime || !endTime || !room || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }
    
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
    
    const cleanupResult = await cleanupSchedulesAfterAdding(classId, classData.course);
    
    if (session) {
      try {
        const classData = await Class.findById(classId).populate('course', 'testDate');
        if (classData?.course?.testDate) {
          const scheduleDate = new Date(date);
          const testDate = new Date(classData.course.testDate);
          scheduleDate.setHours(0, 0, 0, 0);
          testDate.setHours(0, 0, 0, 0);
          
          if (scheduleDate >= testDate) {
            await Session.findByIdAndUpdate(session, { learningType: 'test' });
            console.log(` Updated session ${session} learningType to 'test' (schedule date >= test date)`);
          }
        }
      } catch (err) {
        console.error(' Error checking/updating test date:', err);
      }
    }
    
    const populatedSchedule = await ClassSchedule.findById(newSchedule._id)
      .populate('class', 'name level')
      .populate('room', 'room_name location');
    
    const cleanupInfo = cleanupResult.success && preview.schedulesToDelete && preview.schedulesToDelete.length > 0 ? {
      deletedCount: cleanupResult.deletedCount || 0,
      reassignedSessions: cleanupResult.reassignedSessions || 0,
      schedulesToDelete: preview.schedulesToDelete
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
    
    const scope = updateScope || 'single';
    
    if (scope === 'future') {
      console.log(' Cập nhật "Buổi học này và các buổi học sau":');

      // Convert current date to UTC midnight
      const scheduleDate = new Date(schedule.date);
      const currentDate = new Date(Date.UTC(
        scheduleDate.getUTCFullYear(),
        scheduleDate.getUTCMonth(),
        scheduleDate.getUTCDate(),
        0, 0, 0, 0
      ));
      const currentDayOfWeek = currentDate.getUTCDay();
      const currentStartTime = schedule.startTime;
      const currentEndTime = schedule.endTime;

      console.log('  - Pattern cũ: Thứ', currentDayOfWeek, currentStartTime, '-', currentEndTime);

      // Format date to YYYY-MM-DD using UTC methods
      const formatDateToYYYYMMDD = (dateObj) => {
        const year = dateObj.getUTCFullYear();
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const newDateParts = date.split('-');
      if (newDateParts.length !== 3) {
        return res.status(400).json({
          success: false,
          message: 'Định dạng ngày không hợp lệ. Phải là YYYY-MM-DD.'
        });
      }

      // Create date at UTC midnight to avoid timezone issues
      const newDate = new Date(Date.UTC(
        parseInt(newDateParts[0]),
        parseInt(newDateParts[1]) - 1,
        parseInt(newDateParts[2]),
        0, 0, 0, 0
      ));
      const newDayOfWeek = newDate.getDay();
      const newStartTime = startTime || currentStartTime;
      const newEndTime = endTime || currentEndTime;
      
      console.log('  - Pattern mới: Thứ', newDayOfWeek, newStartTime, '-', newEndTime);
      
      const allSchedules = await ClassSchedule.find({
        class: schedule.class,
        date: { $gte: currentDate }
      }).sort({ date: 1, startTime: 1 }).lean();
      
      const matchingSchedules = allSchedules.filter(s => {
        const sDate = new Date(s.date);
        // Use UTC day to match pattern
        return sDate.getUTCDay() === currentDayOfWeek &&
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
      
      // Convert first schedule date to UTC midnight
      const firstSchDate = new Date(matchingSchedules[0].date);
      const firstScheduleDate = new Date(Date.UTC(
        firstSchDate.getUTCFullYear(),
        firstSchDate.getUTCMonth(),
        firstSchDate.getUTCDate(),
        0, 0, 0, 0
      ));
      
      const daysDiff = Math.floor((newDate.getTime() - firstScheduleDate.getTime()) / (24 * 60 * 60 * 1000));
      const weeksDiff = Math.floor(daysDiff / 7);
      const dayDiff = newDayOfWeek - currentDayOfWeek;
      
      console.log('  - Buổi đầu tiên:', formatDateToYYYYMMDD(firstScheduleDate), `(Thứ ${currentDayOfWeek})`);
      console.log('  - Date mới:', formatDateToYYYYMMDD(newDate), `(Thứ ${newDayOfWeek})`);
      console.log('  - Số ngày chênh lệch:', daysDiff);
      console.log('  - Số tuần chênh lệch:', weeksDiff);
      console.log('  - Chênh lệch thứ:', dayDiff);
      
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
        // Convert to UTC midnight for comparison
        const originalDate = new Date(matchingSchedule.date);
        const originalDateUTC = new Date(Date.UTC(
          originalDate.getUTCFullYear(),
          originalDate.getUTCMonth(),
          originalDate.getUTCDate(),
          0, 0, 0, 0
        ));

        const daysFromFirst = Math.floor((originalDateUTC.getTime() - firstScheduleDate.getTime()) / (24 * 60 * 60 * 1000));
        const weeksFromFirst = Math.floor(daysFromFirst / 7);

        // Calculate new date in UTC
        const newScheduleDate = new Date(Date.UTC(
          newDate.getUTCFullYear(),
          newDate.getUTCMonth(),
          newDate.getUTCDate() + (weeksFromFirst * 7),
          0, 0, 0, 0
        ));
        
        const newScheduleDateStr = formatDateToYYYYMMDD(newScheduleDate);
        
        console.log(`    - Validate buổi ${matchingSchedule._id}: ${formatDateToYYYYMMDD(originalDate)} -> ${newScheduleDateStr}`);
        
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
            console.log(`       Có conflict!`);
          } else {
            console.log(`      ✓ Không có conflict`);
          }
        } catch (error) {
          console.error(`       Lỗi khi validate:`, error);
          validationErrors.push({
            scheduleId: matchingSchedule._id.toString(),
            date: newScheduleDateStr,
            conflicts: { hasConflict: true, error: error.message }
          });
        }
      }
      
      if (validationErrors.length > 0) {
        console.log(`   Có ${validationErrors.length} buổi học bị conflict`);
        return res.status(400).json({
          success: false,
          message: `Có ${validationErrors.length} buổi học bị xung đột lịch học`,
          conflicts: validationErrors
        });
      }
      
      console.log(`  ✓ Tất cả ${matchingSchedules.length} buổi học đều không có conflict`);
      
      const updatePromises = matchingSchedules.map(async (matchingSchedule) => {
        // Convert to UTC midnight for comparison
        const originalDate = new Date(matchingSchedule.date);
        const originalDateUTC = new Date(Date.UTC(
          originalDate.getUTCFullYear(),
          originalDate.getUTCMonth(),
          originalDate.getUTCDate(),
          0, 0, 0, 0
        ));

        const daysFromFirst = Math.floor((originalDateUTC.getTime() - firstScheduleDate.getTime()) / (24 * 60 * 60 * 1000));
        const weeksFromFirst = Math.floor(daysFromFirst / 7);

        // Calculate new date in UTC
        const newScheduleDate = new Date(Date.UTC(
          newDate.getUTCFullYear(),
          newDate.getUTCMonth(),
          newDate.getUTCDate() + (weeksFromFirst * 7),
          0, 0, 0, 0
        ));

        const updateData = {
          date: newScheduleDate,
          startTime: newStartTime,
          endTime: newEndTime
        };
        
        if (room) {
          updateData.room = room;
        }
        
        return ClassSchedule.findByIdAndUpdate(
          matchingSchedule._id,
          updateData,
          { new: true }
        );
      });
      
      await Promise.all(updatePromises);
      console.log(`   Đã cập nhật ${matchingSchedules.length} buổi học`);
      
      console.log(' Bắt đầu sắp xếp lại session cho tất cả buổi học trong lớp...');
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
      console.log(' Cập nhật chỉ buổi học này (single):');
      console.log('  - ScheduleId:', schedule._id);
      console.log('  - Date cũ:', schedule.date, '-> Date mới:', date);
      console.log('  - StartTime cũ:', schedule.startTime, '-> StartTime mới:', startTime);
      console.log('  - EndTime cũ:', schedule.endTime, '-> EndTime mới:', endTime);
      console.log('  - Status cũ:', schedule.status);

      // Save original values ONLY on first change from 'fixed' to 'temporary'
      if (schedule.status === 'fixed' && !schedule.originalDate) {
        schedule.originalDate = schedule.date;
        schedule.originalStartTime = schedule.startTime;
        schedule.originalEndTime = schedule.endTime;
        console.log('  - Lưu original values:', {
          date: schedule.originalDate,
          startTime: schedule.originalStartTime,
          endTime: schedule.originalEndTime
        });
      }

      // Update schedule values
      if (date) schedule.date = date;
      if (startTime) schedule.startTime = startTime;
      if (endTime) schedule.endTime = endTime;
      if (room) schedule.room = room;

      // Check if schedule has original values (was changed before)
      if (schedule.originalDate) {
        // Compare with original to determine status
        const returnedToOriginal =
          schedule.date.toISOString() === schedule.originalDate.toISOString() &&
          schedule.startTime === schedule.originalStartTime &&
          schedule.endTime === schedule.originalEndTime;

        if (returnedToOriginal) {
          // Returned to original → set back to 'fixed' and clear original values
          schedule.status = 'fixed';
          schedule.originalDate = null;
          schedule.originalStartTime = null;
          schedule.originalEndTime = null;
          console.log('  - Status: temporary -> fixed (đã về đúng lịch gốc, xóa original values)');
        } else {
          // Still different from original → keep as 'temporary'
          schedule.status = 'temporary';
          console.log('  - Status: -> temporary (vẫn khác lịch gốc)');
        }
      } else {
        // No original values → this is first change, set to 'temporary'
        schedule.status = 'temporary';
        console.log('  - Status: fixed -> temporary');
      }

      await schedule.save();
      
      console.log(' Bắt đầu sắp xếp lại session cho tất cả buổi học trong lớp...');
      await reassignSessionsByOrder(schedule.class);
      
      const updatedSchedule = await ClassSchedule.findById(schedule._id)
        .populate('class', 'name level')
        .populate('room', 'room_name location');
      
      console.log(' Cập nhật thành công buổi học:', schedule._id);
      
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

exports.getPendingSchedules = async (req, res) => {
    try {
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

exports.approveSchedule = async (req, res) => {
    try {
        const schedule = await ClassSchedule.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'fixed',
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

