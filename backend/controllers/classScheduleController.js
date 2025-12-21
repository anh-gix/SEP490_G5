const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");
const Class = require("../models/classModel");
const Room = require("../models/room");
const Course = require("../models/courseModel");
const mongoose = require("mongoose");
const { getSchedulesToDeletePreview, cleanupSchedulesAfterAdding } = require("../helpers/scheduleCleanup");

exports.getClassesByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const classes = await Class.find({ teacherId }).select("name subject createdAt");
    if (!classes.length) {
      return res.status(404).json({ message: "Giáo viên này chưa có lớp nào." });
    }

    res.status(200).json(classes);
  } catch (error) {
    console.error(" Lỗi khi lấy danh sách lớp:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách lớp." });
  }
};

exports.getSchedulesByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const schedules = await ClassSchedule.find({ class: classId })
      .select("session date startTime endTime room")
      .populate("room", "room_name")
      .sort({ date: 1 });

    if (!schedules.length) {
      return res.status(404).json({ message: "Lớp này chưa có lịch học." });
    }

    console.log(schedules);
    
    res.status(200).json(schedules);
  } catch (error) {
    console.error(" Lỗi khi lấy lịch học:", error);
    res.status(500).json({ message: "Lỗi server khi lấy lịch học." });
  }
};

exports.validateAddClassSchedule = async (req, res) => {
  try {
    const { classId, date, startTime, endTime, room, excludeScheduleId } = req.body;

    if (!classId || !date || !startTime || !endTime || !room) {
      return res.status(400).json({ 
        success: false,
        message: "Thiếu thông tin bắt buộc." 
      });
    }

    const conflicts = {
      teacher: [],
      room: [],
      students: [],
      auditingStudents: [],
      hasConflict: false
    };

    const classData = await Class.findById(classId)
      .select('name teacher teacherId students room')
      .populate('teacher', 'username email')
      .populate('students', 'username email')
      .lean();

    if (!classData) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy lớp học." 
      });
    }
    
    const currentClassName = classData.name || 'N/A';

    const teacherId = classData.teacher || classData.teacherId;
    const students = classData.students || [];
    

    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      return res.status(400).json({ 
        success: false,
        message: "Định dạng ngày không hợp lệ. Phải là YYYY-MM-DD." 
      });
    }
    
    // Tạo UTC date object để match với MongoDB (date được lưu dưới dạng UTC)
    const scheduleDate = new Date(Date.UTC(
      parseInt(dateParts[0]), // year
      parseInt(dateParts[1]) - 1, // month (0-indexed)
      parseInt(dateParts[2]), // day
      0, // hour
      0, // minute
      0, // second
      0  // millisecond
    ));
    

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

    const newDateStr = formatDateLocal(scheduleDate);

    const currentClassAllSchedules = await ClassSchedule.find({
      class: new mongoose.Types.ObjectId(classId),
      status: { $in: ['temporary', 'fixed'] }
    })
      .select('date startTime endTime status')
      .sort({ date: 1, startTime: 1 })
      .lean();


    // Tạo range query để tìm tất cả schedules trong ngày (dùng UTC để match với MongoDB)
    const startOfDay = new Date(Date.UTC(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2]),
      0, 0, 0, 0
    ));

    const endOfDay = new Date(Date.UTC(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2]),
      23, 59, 59, 999
    ));

    const currentClassSchedulesOnSameDate = await ClassSchedule.find({
      class: new mongoose.Types.ObjectId(classId),
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['temporary', 'fixed'] }
    })
      .select('_id date startTime endTime')
      .lean();
    
    // Nếu có excludeScheduleId (đang update), loại trừ schedule đó
    const schedulesToCheck = excludeScheduleId
      ? currentClassSchedulesOnSameDate.filter(s => s._id.toString() !== excludeScheduleId)
      : currentClassSchedulesOnSameDate;
    
    schedulesToCheck.forEach((schedule, idx) => {
      const hasOverlap = hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime);
      
      if (hasOverlap) {
        conflicts.room.push({
          roomId: room.toString(),
          className: currentClassName,
          date: formatDateLocal(schedule.date),
          time: `${schedule.startTime} - ${schedule.endTime}`,
          conflictingTime: `${startTime} - ${endTime}`,
          isCurrentClass: true // Đánh dấu đây là conflict với chính lớp hiện tại
        });
        conflicts.hasConflict = true;
      }
    });

    // Build query for room schedules, excluding current schedule if updating
    // Loại trừ tất cả schedules của lớp hiện tại để tránh báo conflict trùng lặp
    const roomScheduleQuery = {
      room: new mongoose.Types.ObjectId(room),
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['temporary', 'fixed'] }
    };
    
    // Loại trừ tất cả schedules của lớp hiện tại (đã kiểm tra ở trên)
    const currentClassScheduleIds = schedulesToCheck.map(s => s._id);
    if (currentClassScheduleIds.length > 0) {
      roomScheduleQuery._id = { $nin: currentClassScheduleIds };
    } else if (excludeScheduleId) {
      // Nếu không có schedules của lớp hiện tại, chỉ loại trừ schedule cụ thể nếu có
      roomScheduleQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
    }

    // 1. Kiểm tra conflict PHÒNG HỌC (bao gồm cả lớp hiện tại - một lớp không thể có 2 buổi cùng thứ cùng giờ)
    const roomSchedules = await ClassSchedule.find(roomScheduleQuery)
      .populate('class', 'name')
      .select('date startTime endTime class')
      .lean();

    
    roomSchedules.forEach((schedule, idx) => {
      const scheduleClassId = schedule.class?._id?.toString() || schedule.class?.toString() || null;
      const isCurrentClass = scheduleClassId === classId.toString();
      const hasOverlap = hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime);
      
      if (hasOverlap) {
        // Kiểm tra xem có phải là lớp hiện tại không
        conflicts.room.push({
          roomId: room.toString(),
          className: schedule.class?.name || 'N/A',
          date: formatDateLocal(schedule.date),
          time: `${schedule.startTime} - ${schedule.endTime}`,
          conflictingTime: `${startTime} - ${endTime}`,
          isCurrentClass: isCurrentClass // Đánh dấu để frontend có thể hiển thị khác
        });
        conflicts.hasConflict = true;
      }
    });

    // 2. Kiểm tra conflict GIÁO VIÊN
    if (teacherId) {
      // Lấy tất cả lớp khác của giáo viên (trừ lớp hiện tại)
      const teacherClasses = await Class.find({
        $or: [
          { teacher: teacherId },
          { teacherId: teacherId }
        ],
        _id: { $ne: classId }
      }).select('_id name').lean();

      if (teacherClasses.length > 0) {
        const teacherClassIds = teacherClasses.map(c => c._id);

        // Build query for teacher schedules, excluding current schedule if updating
        const teacherScheduleQuery = {
          class: { $in: teacherClassIds },
          date: {
            $gte: startOfDay,
            $lte: endOfDay
          },
          status: { $in: ['temporary', 'fixed'] }
        };
        if (excludeScheduleId) {
          teacherScheduleQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
        }

        // Lấy lịch học của giáo viên trong ngày đó
        const teacherSchedules = await ClassSchedule.find(teacherScheduleQuery)
          .populate('class', 'name')
          .select('date startTime endTime class')
          .lean();
        
        teacherSchedules.forEach((schedule, idx) => {
          const hasOverlap = hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime);
          
          if (hasOverlap) {
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

    // 3. Kiểm tra conflict SINH VIÊN (sử dụng StudentSchedule thay vì ClassSchedule)
    if (students.length > 0) {
      const studentIds = students.map(s => s._id || s);

      // Group conflicts by student
      const studentConflictMap = new Map();

      // Kiểm tra lịch học của từng sinh viên
      for (const student of students) {
        const studentId = student._id || student;
        const studentName = student.username || student.fullName || `Sinh viên ${studentId}`;

        // Lấy tất cả StudentSchedule của sinh viên trong ngày đó
        const studentSchedules = await StudentSchedule.find({
          student: studentId
        })
          .populate({
            path: 'classSchedule',
            match: {
              date: {
                $gte: startOfDay,
                $lte: endOfDay
              },
              status: { $in: ['temporary', 'fixed'] }
            },
            select: 'date startTime endTime class',
            populate: {
              path: 'class',
              select: 'name'
            }
          })
          .lean();

        // Filter out null classSchedule (không match điều kiện)
        const validStudentSchedules = studentSchedules
          .filter(ss => ss.classSchedule != null)
          .map(ss => ss.classSchedule);

        validStudentSchedules.forEach((schedule) => {
          const scheduleClassId = schedule.class?._id?.toString() || schedule.class?.toString() || null;
          const scheduleClassName = schedule.class?.name || 'N/A';
          const isCurrentClass = scheduleClassId === classId.toString();

          // Bỏ qua nếu là lớp hiện tại
          if (isCurrentClass) {
            // Nếu đang update (có excludeScheduleId), kiểm tra xem có phải schedule đang được update không
            if (excludeScheduleId && schedule._id.toString() === excludeScheduleId) {
              return; // Bỏ qua schedule đang được update
            }
            // Nếu không phải schedule đang update nhưng cùng lớp, vẫn bỏ qua để tránh báo conflict với chính lớp
            return;
          }

          const hasOverlap = hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime);

          if (hasOverlap) {
            const studentIdStr = studentId.toString();

            if (!studentConflictMap.has(studentIdStr)) {
              studentConflictMap.set(studentIdStr, {
                studentId: studentIdStr,
                studentName: studentName,
                conflicts: []
              });
            }

            studentConflictMap.get(studentIdStr).conflicts.push({
              className: scheduleClassName,
              date: formatDateLocal(schedule.date),
              time: `${schedule.startTime} - ${schedule.endTime}`,
              conflictingTime: `${startTime} - ${endTime}`
            });
            conflicts.hasConflict = true;
          }
        });
      }

      // Convert map to array
      studentConflictMap.forEach((studentConflict) => {
        conflicts.students.push(studentConflict);
      });

      if (studentConflictMap.size === 0) {
        console.log('  ✓ Không có học sinh nào bị conflict');
      } else {
        console.log(`   Có ${studentConflictMap.size} học sinh bị conflict`);
      }
    }

// KIỂM TRA HỌC SINH HỌC tạm thời VÀ SESSION THAY ĐỔI (chỉ khi đang update schedule)
if (excludeScheduleId) {
  // 1. Lấy danh sách học sinh chính thức của lớp
  const classDataForAuditing = await Class.findById(classId)
    .select('students')
    .lean();
  
  const officialStudentIds = (classDataForAuditing?.students || []).map(s => 
    s._id?.toString() || s.toString()
  );
  
  // 2. Kiểm tra có StudentSchedule (học sinh học tạm thời) không
  const allStudentSchedules = await StudentSchedule.find({
    classSchedule: new mongoose.Types.ObjectId(excludeScheduleId),
    scheduleStatus: { $nin: ['cancelled'] }
  })
    .populate('student', 'username fullName')
    .lean();
  
  // 3. Lọc ra chỉ học sinh học tạm thời (không có trong danh sách học sinh chính thức)
  const auditingStudentSchedules = allStudentSchedules.filter(ss => {
    const studentId = ss.student?._id?.toString() || ss.student?.toString();
    return !officialStudentIds.includes(studentId);
  });
  
  if (auditingStudentSchedules.length > 0) {
    // 4. Simulate reassignSessionsByOrder để kiểm tra session có thay đổi không
    const sessionCheckResult = await simulateReassignAndCheckSessionChange(
      new mongoose.Types.ObjectId(classId),
      new mongoose.Types.ObjectId(excludeScheduleId),
      newDateStr,
      startTime,
      endTime
    );
    
    if (sessionCheckResult.sessionChanged) {
      // Thêm vào conflicts như một conflict mới
      const studentNames = auditingStudentSchedules.map(ss => 
        ss.student?.username || ss.student?.fullName || 'N/A'
      );
      
      conflicts.auditingStudents = [{
        message: `Buổi học này có ${auditingStudentSchedules.length} học sinh học tạm thời (${studentNames.join(', ')}). 

Việc chỉnh sửa sẽ làm thay đổi session từ ${sessionCheckResult.originalSessionOrder} sang ${sessionCheckResult.newSessionOrder}, ảnh hưởng đến lịch học của học sinh học tạm thời. Vui lòng thay đổi lịch của học sinh học tạm thời trước khi chỉnh sửa buổi học này.`,
        auditingStudentsCount: auditingStudentSchedules.length,
        auditingStudents: studentNames,
        originalSessionOrder: sessionCheckResult.originalSessionOrder,
        newSessionOrder: sessionCheckResult.newSessionOrder,
        scheduleId: excludeScheduleId
      }];
      
      conflicts.hasConflict = true;
    }
  }
}


    res.status(200).json({
      success: true,
      conflicts: conflicts,
      message: conflicts.hasConflict 
        ? "Có xung đột lịch học được phát hiện." 
        : "Không có xung đột lịch học."
    });

  } catch (err) {
    console.error(" Lỗi khi validate:", err);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server", 
      error: err.message 
    });
  }
};

/**
 * Simulate reassignSessionsByOrder để kiểm tra xem session có thay đổi không
 * @param {ObjectId} classId - ID của lớp học
 * @param {ObjectId} scheduleId - ID của schedule cần kiểm tra
 * @param {String} newDate - Date mới (YYYY-MM-DD)
 * @param {String} newStartTime - StartTime mới
 * @param {String} newEndTime - EndTime mới
 * @returns {Object} { sessionChanged: boolean, originalSessionOrder: Number, newSessionOrder: Number }
 */
async function simulateReassignAndCheckSessionChange(classId, scheduleId, newDate, newStartTime, newEndTime) {
  // 1. Lấy schedule hiện tại với session order
  const originalSchedule = await ClassSchedule.findById(scheduleId)
    .populate('session', 'order')
    .lean();
  
  if (!originalSchedule) {
    return {
      sessionChanged: false,
      originalSessionOrder: null,
      newSessionOrder: null
    };
  }
  
  const originalSessionOrder = originalSchedule?.session?.order ?? null;
  
  // 2. Lấy tất cả schedules của lớp (bao gồm cả schedule đang chỉnh sửa với thông tin mới)
  const allSchedules = await ClassSchedule.find({
    class: classId
  })
    .sort({ date: 1, startTime: 1 })
    .lean();
  
  // 3. Tạo danh sách schedules với schedule đang chỉnh sửa có thông tin mới
  const schedulesWithUpdate = allSchedules.map(s => {
    if (s._id.toString() === scheduleId.toString()) {
      return {
        ...s,
        date: new Date(newDate),
        startTime: newStartTime,
        endTime: newEndTime
      };
    }
    return s;
  });
  
  // 4. Sắp xếp lại theo date và startTime
  schedulesWithUpdate.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    return a.startTime.localeCompare(b.startTime);
  });
  
  // 5. Lấy course để biết số sessions
  const classData = await Class.findById(classId)
    .populate('course', 'sessions')
    .lean();
  
  if (!classData || !classData.course) {
    return {
      sessionChanged: false,
      originalSessionOrder: originalSessionOrder,
      newSessionOrder: null
    };
  }
  
  const courseData = await Course.findById(classData.course._id || classData.course)
    .populate('sessions', 'order')
    .select('sessions')
    .lean();
  
  if (!courseData || !courseData.sessions || courseData.sessions.length === 0) {
    return {
      sessionChanged: false,
      originalSessionOrder: originalSessionOrder,
      newSessionOrder: null
    };
  }
  
  const courseSessions = [...courseData.sessions].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // 6. Tìm index của schedule đang chỉnh sửa trong danh sách đã sắp xếp
  const scheduleIndex = schedulesWithUpdate.findIndex(s => s._id.toString() === scheduleId.toString());
  
  if (scheduleIndex === -1) {
    return {
      sessionChanged: false,
      originalSessionOrder: originalSessionOrder,
      newSessionOrder: null
    };
  }
  
  // 7. Tính session order mới dựa trên index
  const sessionIndex = scheduleIndex < courseSessions.length 
    ? scheduleIndex 
    : scheduleIndex % courseSessions.length;
  const newSessionId = courseSessions[sessionIndex]?._id || null;
  const newSessionOrder = courseSessions[sessionIndex]?.order || sessionIndex + 1;
  
  // 8. So sánh
  const sessionChanged = originalSessionOrder !== newSessionOrder;
  
  return {
    sessionChanged: sessionChanged,
    originalSessionOrder: originalSessionOrder,
    newSessionOrder: newSessionOrder
  };
}

exports.previewAddClassSchedule = async (req, res) => {
  try {
    const { classId, date, startTime, endTime, room, repeatWeekly, selectedDay } = req.body;

    if (!classId || !date || !startTime || !endTime || !room) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    // Khai báo dayNames để dùng chung trong function
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

    // Lấy thông tin class và course
    const classInfo = await Class.findById(classId).select("course teacher teacherId").lean();
    if (!classInfo || !classInfo.course) {
      return res.status(400).json({
        message: "Lớp học chưa có course được gán.",
      });
    }

    // Lấy course để biết numberOfSessions
    const courseData = await Course.findById(classInfo.course)
      .select('numberOfSessions')
      .lean();
    
    const courseNumberOfSessions = courseData?.numberOfSessions || 0;

    // Lấy room info
    const roomData = await Room.findById(room).select("room_name location").lean();

    // Tính toán các ngày sẽ tạo nếu repeatWeekly = true
    const datesToCreate = [];
    if (repeatWeekly) {
      // Parse date từ string YYYY-MM-DD, tránh timezone issues
      const dateParts = date.split('-');
      const firstDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      firstDate.setHours(0, 0, 0, 0);
      
      // Debug: Kiểm tra thứ của ngày đầu tiên
      const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      
      // Lấy số buổi hiện tại
      const currentSchedulesCount = await ClassSchedule.countDocuments({ class: classId });
      
      // Tính số buổi cần tạo để đạt numberOfSessions
      // Logic: Tạo buổi học cho đến khi đạt numberOfSessions
      // Nhưng cần kiểm tra xem có thể thêm không (dựa trên số buổi đã học)
      const allSchedules = await ClassSchedule.find({ class: classId }).lean();
      const allScheduleIds = allSchedules.map(s => s._id);
      const studentSchedulesWithAttendance = await StudentSchedule.find({
        classSchedule: { $in: allScheduleIds },
        'attendance.status': { $ne: null }
      }).select('classSchedule').lean();
      const scheduleIdsWithAttendance = new Set(
        studentSchedulesWithAttendance.map(s => s.classSchedule.toString())
      );
      const attendedCount = allSchedules.filter(
        s => scheduleIdsWithAttendance.has(s._id.toString())
      ).length;
      
      // Kiểm tra xem có thể thêm buổi không
      if (attendedCount >= courseNumberOfSessions) {
        // Đã đủ số buổi đã học, không thể thêm
        datesToCreate.length = 0;
      } else {
        // Khi "Lặp lại vào các tuần", tạo số buổi bằng với numberOfSessions
        // Cleanup sẽ tự động xóa các buổi thừa để giữ đúng numberOfSessions
        const schedulesNeeded = courseNumberOfSessions;
        
        // Tạo các ngày cho các tuần tiếp theo (mỗi tuần 1 buổi)
        for (let week = 0; week < schedulesNeeded; week++) {
          const scheduleDate = new Date(firstDate);
          scheduleDate.setDate(firstDate.getDate() + (week * 7));
          
          // Format date để tránh timezone issues (dùng local time, không dùng UTC)
          const year = scheduleDate.getFullYear();
          const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
          const day = String(scheduleDate.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          
          datesToCreate.push(dateString);
        }
      }
      
    } else {
      datesToCreate.push(date);
    }

    // ========== LOGGING: Preview ==========
    console.log(' ========== PREVIEW: THÊM BUỔI HỌC ==========');
    console.log(' Thông tin buổi học sẽ được thêm:');
    console.log('   - Lớp học ID:', classId);
    console.log('   - Lặp lại vào các tuần:', repeatWeekly ? 'Có' : 'Không');
    console.log('   - Số buổi sẽ được tạo:', datesToCreate.length);
    
    // Parse và hiển thị thứ của ngày đầu tiên nhận được
    // dayNames được khai báo ở đầu function để dùng chung
    const dayMap = { 'CN': 'Chủ Nhật', '2': 'Thứ Hai', '3': 'Thứ Ba', '4': 'Thứ Tư', '5': 'Thứ Năm', '6': 'Thứ Sáu', '7': 'Thứ Bảy' };
    const dateParts = date.split('-');
    const receivedDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    const receivedDayOfWeek = receivedDate.getDay();
    
    console.log('   - Thứ được chọn từ frontend:', selectedDay ? dayMap[selectedDay] || selectedDay : 'Không có');
    console.log('   - Ngày đầu tiên nhận được từ frontend:', date, `(${dayNames[receivedDayOfWeek]})`);
    if (selectedDay) {
      const expectedDay = dayMap[selectedDay];
      const actualDay = dayNames[receivedDayOfWeek];
      if (expectedDay !== actualDay) {
        console.log(`CẢNH BÁO: Thứ được chọn (${expectedDay}) KHÔNG KHỚP với thứ của ngày nhận được (${actualDay})!`);
      } else {
        console.log(`Thứ được chọn (${expectedDay}) KHỚP với thứ của ngày nhận được (${actualDay})`);
      }
    }
    
    if (datesToCreate.length > 0) {
      const firstDateObj = new Date(datesToCreate[0]);
      const firstDayOfWeek = firstDateObj.getDay();
      console.log('   - Ngày đầu tiên sẽ được tạo:', datesToCreate[0], `(${dayNames[firstDayOfWeek]})`);
      
      if (datesToCreate.length > 1) {
        const lastDateObj = new Date(datesToCreate[datesToCreate.length - 1]);
        const lastDayOfWeek = lastDateObj.getDay();
        console.log('   - Ngày cuối cùng sẽ được tạo:', datesToCreate[datesToCreate.length - 1], `(${dayNames[lastDayOfWeek]})`);
      }
    } else {
      console.log('   -  Không có buổi nào sẽ được tạo (lớp đã đủ số buổi)');
    }
    console.log('   - Giờ bắt đầu:', startTime);
    console.log('   - Giờ kết thúc:', endTime);
    console.log('   - Phòng học:', roomData?.room_name || room);
    console.log('');
    
    if (datesToCreate.length > 1) {
      console.log(' Danh sách các ngày sẽ được tạo:');
      datesToCreate.forEach((d, idx) => {
        const dateParts = d.split('-');
        const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        const dayOfWeek = dateObj.getDay();
        console.log(`   ${idx + 1}. ${dateObj.toLocaleDateString('vi-VN')} (${dayNames[dayOfWeek]})`);
      });
      console.log('');
    }
    
    // Nếu không có buổi nào sẽ được tạo, return sớm
    if (datesToCreate.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Lớp đã đủ số buổi học. Không cần thêm buổi học mới.",
        preview: {
          canAdd: false,
          totalSchedules: await ClassSchedule.countDocuments({ class: classId }),
          attendedCount: 0,
          numberOfSessions: courseNumberOfSessions,
          schedulesToDelete: []
        }
      });
    }

    // Tính toán preview cho tất cả buổi sẽ được tạo
    const currentSchedulesCount = await ClassSchedule.countDocuments({ class: classId });
    const finalTotalSchedules = currentSchedulesCount + datesToCreate.length;
    
    // Lấy preview với số buổi sẽ thêm
    const basePreview = await getSchedulesToDeletePreview(classId, classInfo.course);
    
    // Tính toán lại với số buổi thực tế sẽ thêm
    const attendedCount = basePreview.attendedCount || 0;
    const numberOfSessions = basePreview.numberOfSessions || 0;
    
    console.log(' Preview kết quả:');
    console.log(`   - Số buổi hiện tại: ${currentSchedulesCount}`);
    console.log(`   - Số buổi sẽ được tạo: ${datesToCreate.length}`);
    console.log(`   - Tổng số buổi sau khi thêm: ${finalTotalSchedules}`);
    console.log(`   - Số buổi đã học: ${attendedCount}`);
    console.log(`   - numberOfSessions của course: ${numberOfSessions}`);
    console.log('');
    console.log(' THỨ TỰ THỰC HIỆN:');
    console.log('   1️⃣  THÊM các buổi học mới trước');
    console.log('   2️⃣  Sau đó CLEANUP sẽ xóa các buổi thừa (từ dưới lên - các buổi mới nhất)');
    console.log('   3️⃣  Cuối cùng gán lại session cho tất cả buổi còn lại');
    console.log('');
    
    // ========== TÍNH TOÁN PREVIEW: TẠO 3 BẢNG ==========
    // 1. Bảng TRƯỚC KHI XÓA: Tất cả buổi hiện tại + buổi mới sẽ tạo
    // 2. Bảng SẼ XÓA: Các buổi mới nhất sẽ bị xóa (từ dưới lên)
    // 3. Bảng SAU KHI XÓA: Các buổi sẽ còn lại
    
    // Lấy tất cả schedules hiện tại
    const allCurrentSchedules = await ClassSchedule.find({ class: classId })
      .sort({ date: 1, startTime: 1 })
      .lean();
    
    const allCurrentScheduleIds = allCurrentSchedules.map(s => s._id);
    const studentSchedulesWithAttendance = await StudentSchedule.find({
      classSchedule: { $in: allCurrentScheduleIds },
      'attendance.status': { $ne: null }
    }).select('classSchedule').lean();
    
    const scheduleIdsWithAttendance = new Set(
      studentSchedulesWithAttendance.map(s => s.classSchedule.toString())
    );
    
    // Tạo danh sách TẤT CẢ buổi (hiện tại + mới sẽ tạo)
    const allSchedulesAfterAdd = [];
    
    // 1. Thêm tất cả buổi hiện tại
    allCurrentSchedules.forEach(schedule => {
      const hasAttendance = scheduleIdsWithAttendance.has(schedule._id.toString());
      allSchedulesAfterAdd.push({
        _id: schedule._id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        room: schedule.room,
        isNew: false,
        hasAttendance: hasAttendance
      });
    });
    
    // 2. Thêm tất cả buổi mới sẽ tạo
    datesToCreate.forEach((dateStr, idx) => {
      const dateParts = dateStr.split('-');
      const newScheduleDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      newScheduleDate.setHours(0, 0, 0, 0);
      allSchedulesAfterAdd.push({
        _id: `NEW_${idx}`,
        date: newScheduleDate,
        startTime: startTime,
        endTime: endTime,
        room: room,
        isNew: true,
        hasAttendance: false // Buổi mới chưa có attendance
      });
    });
    
    // 3. Sắp xếp tất cả buổi theo date (tăng dần)
    allSchedulesAfterAdd.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      // Nếu cùng ngày, sắp xếp theo startTime
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
    
    // Tính số buổi sẽ bị xóa
    const totalToDelete = finalTotalSchedules > numberOfSessions ? finalTotalSchedules - numberOfSessions : 0;
    
    // Xác định các buổi sẽ bị xóa (các buổi mới nhất, không có attendance)
    const schedulesToDelete = [];
    if (totalToDelete > 0) {
      // Lấy các buổi không có attendance (có thể xóa)
      const deletableSchedules = allSchedulesAfterAdd.filter(s => !s.hasAttendance);
      
      // Sắp xếp theo date giảm dần (mới nhất trước) để xóa từ dưới lên
      deletableSchedules.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB - dateA; // Giảm dần
        }
        return (b.startTime || '').localeCompare(a.startTime || '');
      });
      
      // Lấy các buổi mới nhất để xóa
      schedulesToDelete.push(...deletableSchedules.slice(0, totalToDelete));
    }
    
    // Tạo danh sách các buổi sẽ còn lại (sau khi xóa)
    const schedulesToDeleteIds = new Set(
      schedulesToDelete.map(s => s._id.toString())
    );
    const schedulesAfterDelete = allSchedulesAfterAdd.filter(
      s => !schedulesToDeleteIds.has(s._id.toString())
    );
    
    // ========== HIỂN THỊ 3 BẢNG ==========
    console.log('');
    console.log(' ========== BẢNG 1: TRƯỚC KHI XÓA ==========');
    console.log(`Tổng số buổi: ${allSchedulesAfterAdd.length} (${allCurrentSchedules.length} buổi hiện tại + ${datesToCreate.length} buổi mới sẽ tạo)`);
    console.log('');
    allSchedulesAfterAdd.forEach((schedule, index) => {
      const scheduleDate = new Date(schedule.date);
      const dateStr = scheduleDate.toLocaleDateString('vi-VN');
      const dayOfWeek = dayNames[scheduleDate.getDay()];
      const isNewMarker = schedule.isNew ? ' ⭐ MỚI' : '';
      const hasAttendanceMarker = schedule.hasAttendance ? ' ✓ Đã học' : '';
      const willDeleteMarker = schedulesToDeleteIds.has(schedule._id.toString()) ? '  SẼ XÓA' : '';
      console.log(`   ${index + 1}. ${dateStr} (${dayOfWeek}) - ${schedule.startTime} đến ${schedule.endTime}${isNewMarker}${hasAttendanceMarker}${willDeleteMarker}`);
    });
    console.log('==========================================');
    console.log('');
    
    if (schedulesToDelete.length > 0) {
      console.log('🗑️  ========== BẢNG 2: CÁC BUỔI SẼ BỊ XÓA ==========');
      console.log(`Tổng số buổi sẽ bị xóa: ${schedulesToDelete.length} (từ dưới lên - các buổi mới nhất)`);
      console.log('');
      schedulesToDelete.forEach((schedule, index) => {
        const scheduleDate = new Date(schedule.date);
        const dateStr = scheduleDate.toLocaleDateString('vi-VN');
        const dayOfWeek = dayNames[scheduleDate.getDay()];
        const isNewMarker = schedule.isNew ? ' ⭐ MỚI' : ' (Hiện tại)';
        console.log(`   ${index + 1}. ${dateStr} (${dayOfWeek}) - ${schedule.startTime} đến ${schedule.endTime}${isNewMarker}`);
      });
      console.log('==========================================');
      console.log('');
    } else {
      console.log(' Không có buổi nào sẽ bị xóa');
      console.log('');
    }
    
    console.log(' ========== BẢNG 3: SAU KHI XÓA ==========');
    console.log(`Tổng số buổi sẽ còn lại: ${schedulesAfterDelete.length} (đúng với numberOfSessions = ${numberOfSessions})`);
    console.log('');
    
    // Lấy course sessions để hiển thị session assignment
    const courseDataForSessions = await Course.findById(classInfo.course)
      .populate('sessions', 'order')
      .select('sessions')
      .lean();
    
    const courseSessions = courseDataForSessions && courseDataForSessions.sessions 
      ? [...courseDataForSessions.sessions].sort((a, b) => (a.order || 0) - (b.order || 0))
      : [];
    
    schedulesAfterDelete.forEach((schedule, index) => {
      const scheduleDate = new Date(schedule.date);
      const dateStr = scheduleDate.toLocaleDateString('vi-VN');
      const dayOfWeek = dayNames[scheduleDate.getDay()];
      const isNewMarker = schedule.isNew ? ' ⭐ MỚI' : '';
      const hasAttendanceMarker = schedule.hasAttendance ? ' ✓ Đã học' : '';
      const sessionIndex = index < courseSessions.length ? index : index % courseSessions.length;
      const sessionOrder = courseSessions[sessionIndex]?.order || sessionIndex + 1;
      console.log(`   ${index + 1}. ${dateStr} (${dayOfWeek}) - ${schedule.startTime} đến ${schedule.endTime} → Session ${sessionOrder}${isNewMarker}${hasAttendanceMarker}`);
    });
    console.log('==========================================');
    console.log('');

    // Kiểm tra xem có thể thêm buổi không
    if (attendedCount >= numberOfSessions) {
      return res.status(400).json({
        success: false,
        message: `Không thể thêm buổi học. Lớp đã có ${attendedCount} buổi đã học, đã đạt giới hạn ${numberOfSessions} buổi của khóa học.`,
        preview: {
          totalSchedules: currentSchedulesCount,
          attendedCount: attendedCount,
          numberOfSessions: numberOfSessions
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Preview thành công",
      preview: {
        schedulesToAdd: datesToCreate.map(d => ({
          date: d,
          startTime,
          endTime,
          room: roomData?.room_name || room
        })),
        totalSchedules: finalTotalSchedules,
        attendedCount: attendedCount,
        numberOfSessions: numberOfSessions,
        schedulesToDelete: schedulesToDelete || [],
        deletedCount: schedulesToDelete.length || 0
      }
    });
  } catch (err) {
    console.error(" Lỗi khi preview:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.createClassSchedule = async (req, res) => {
  try {
    const { classId, sessionNumber, date, startTime, endTime, room, repeatWeekly, selectedDay } = req.body;

    if (!classId || !date || !startTime || !endTime || !room) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    const classInfo = await Class.findById(classId).select("course").lean();
    if (!classInfo || !classInfo.course) {
      return res.status(400).json({
        message: "Lớp học chưa có course được gán.",
      });
    }

    // Lấy course để biết numberOfSessions
    const courseData = await Course.findById(classInfo.course)
      .select('numberOfSessions')
      .lean();
    const courseNumberOfSessions = courseData?.numberOfSessions || 0;

    // Tính toán các ngày sẽ tạo nếu repeatWeekly = true
    const datesToCreate = [];
    if (repeatWeekly) {
      // Parse date từ string YYYY-MM-DD, tránh timezone issues
      const dateParts = date.split('-');
      const firstDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      firstDate.setHours(0, 0, 0, 0);
      
      // Khi "Lặp lại vào các tuần", tạo số buổi bằng với numberOfSessions
      // Cleanup sẽ tự động xóa các buổi thừa để giữ đúng numberOfSessions
      const schedulesNeeded = courseNumberOfSessions;
      
      // Tạo các ngày cho các tuần tiếp theo (mỗi tuần 1 buổi)
      for (let week = 0; week < schedulesNeeded; week++) {
        const scheduleDate = new Date(firstDate);
        scheduleDate.setDate(firstDate.getDate() + (week * 7));
        
        // Format date để tránh timezone issues (dùng local time, không dùng UTC)
        const year = scheduleDate.getFullYear();
        const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
        const day = String(scheduleDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        datesToCreate.push(dateString);
      }
    } else {
      // Chỉ tạo 1 buổi
      datesToCreate.push(date);
    }

    // ========== LOGGING: Preview trước khi thêm ==========
    console.log(' ========== TẠO BUỔI HỌC ==========');
    console.log(' Thông tin buổi học sẽ được thêm:');
    console.log('   - Lớp học ID:', classId);
    console.log('   - Lặp lại vào các tuần:', repeatWeekly ? 'Có' : 'Không');
    console.log('   - Số buổi sẽ được tạo:', datesToCreate.length);
    console.log('   - Ngày đầu tiên:', datesToCreate[0]);
    if (datesToCreate.length > 1) {
      console.log('   - Ngày cuối cùng:', datesToCreate[datesToCreate.length - 1]);
    }
    console.log('   - Giờ bắt đầu:', startTime);
    console.log('   - Giờ kết thúc:', endTime);
    console.log('   - Phòng học ID:', room);
    console.log('');

    // Validation: Kiểm tra xem có thể thêm không (dựa trên số buổi sẽ tạo)
    // Lấy số buổi hiện tại
    const currentSchedulesCount = await ClassSchedule.countDocuments({ class: classId });
    const finalTotalSchedules = currentSchedulesCount + datesToCreate.length;
    
    // Lấy preview để kiểm tra
    const allSchedules = await ClassSchedule.find({ class: classId }).lean();
    const allScheduleIds = allSchedules.map(s => s._id);
    const studentSchedulesWithAttendance = await StudentSchedule.find({
      classSchedule: { $in: allScheduleIds },
      'attendance.status': { $ne: null }
    }).select('classSchedule').lean();
    const scheduleIdsWithAttendance = new Set(
      studentSchedulesWithAttendance.map(s => s.classSchedule.toString())
    );
    const attendedCount = allSchedules.filter(
      s => scheduleIdsWithAttendance.has(s._id.toString())
    ).length;

    if (attendedCount >= courseNumberOfSessions) {
      return res.status(400).json({
        success: false,
        message: `Không thể thêm buổi học. Lớp đã có ${attendedCount} buổi đã học, đã đạt giới hạn ${courseNumberOfSessions} buổi của khóa học.`,
        cleanupInfo: {
          totalSchedules: currentSchedulesCount,
          attendedCount: attendedCount,
          numberOfSessions: courseNumberOfSessions
        }
      });
    }

    const preview = await getSchedulesToDeletePreview(classId, classInfo.course);
    
    console.log(' Preview kết quả:');
    console.log('   - Có thể thêm:', preview.canAdd);
    console.log('   - Tổng số buổi hiện tại:', preview.totalSchedules || 0);
    console.log('   - Số buổi đã học:', preview.attendedCount || 0);
    console.log('   - Số buổi chưa học:', (preview.totalSchedules || 0) - (preview.attendedCount || 0));
    console.log('   - numberOfSessions của course:', preview.numberOfSessions || 0);
    
    if (preview.schedulesToDelete && preview.schedulesToDelete.length > 0) {
      console.log('   - Sẽ xóa các buổi sau:');
      preview.schedulesToDelete.forEach((schedule, index) => {
        const scheduleDate = new Date(schedule.date);
        console.log(`      ${index + 1}. ${scheduleDate.toLocaleDateString('vi-VN')} - ${schedule.startTime} đến ${schedule.endTime} (ID: ${schedule._id})`);
      });
    } else {
      console.log('   - Không có buổi nào sẽ bị xóa');
    }
    console.log('==========================================');
    
    if (!preview.canAdd) {
      console.log(' KHÔNG THỂ THÊM: Số buổi đã học >= numberOfSessions');
      return res.status(400).json({
        success: false,
        message: preview.errorMessage || "Không thể thêm buổi học.",
        cleanupInfo: {
          totalSchedules: preview.totalSchedules,
          attendedCount: preview.attendedCount,
          numberOfSessions: preview.numberOfSessions
        }
      });
    }

    const classData = await Class.findById(classId).select("teacher teacherId").lean();
    if (!classData) {
      return res.status(404).json({ message: "Không tìm thấy lớp học." });
    }

    const teacherId = classData.teacher || classData.teacherId;
    const createdById = req.user?._id || teacherId;


    const createdSchedules = [];
    
    for (const dateStr of datesToCreate) {
      const newSchedule = await ClassSchedule.create({
        class: classId,
        sessionNumber,
        date: dateStr,
        startTime,
        endTime,
        room,
        teacher: teacherId,
        createdBy: createdById,
        reason: `Buổi học thêm mới - ${new Date(dateStr).toLocaleDateString('vi-VN')}`,
        status: 'fixed'
      });
      createdSchedules.push(newSchedule);
    }

    const classInfoWithStudents = await Class.findById(classId).populate("students");

    if (!classInfoWithStudents || !classInfoWithStudents.students || classInfoWithStudents.students.length === 0) {
      const cleanupResult = await cleanupSchedulesAfterAdding(classId, classInfo.course);
      
      return res.status(200).json({
        message: `Đã tạo ${createdSchedules.length} buổi học, nhưng lớp chưa có sinh viên.`,
        schedules: createdSchedules,
        cleanupInfo: cleanupResult.success ? {
          deletedCount: cleanupResult.deletedCount,
          reassignedSessions: cleanupResult.reassignedSessions
        } : null
      });
    }

    const studentSchedules = [];
    for (const schedule of createdSchedules) {
      for (const stuId of classInfoWithStudents.students) {
        studentSchedules.push({
          student: stuId,
          classSchedule: schedule._id,
        });
      }
    }

    await StudentSchedule.insertMany(studentSchedules);

    console.log('');
    console.log('🧹 ========== BẮT ĐẦU CLEANUP ==========');
    console.log(' Trước cleanup:');
    console.log(`   - Đã tạo ${createdSchedules.length} buổi học mới`);
    createdSchedules.forEach((schedule, index) => {
      const scheduleDate = new Date(schedule.date);
      console.log(`      ${index + 1}. ${scheduleDate.toLocaleDateString('vi-VN')} - ${schedule.startTime} đến ${schedule.endTime} (ID: ${schedule._id})`);
    });
    console.log('   - Đang kiểm tra và cleanup...');
    console.log('');
    
    const cleanupResult = await cleanupSchedulesAfterAdding(classId, classInfo.course);
    
    console.log('');
    console.log(' ========== KẾT QUẢ CLEANUP ==========');
    console.log('   - Thành công:', cleanupResult.success);
    console.log('   - Số buổi đã xóa:', cleanupResult.deletedCount || 0);
    console.log('   - Số buổi đã gán lại session:', cleanupResult.reassignedSessions || 0);
    console.log('   - Tổng số buổi sau cleanup:', cleanupResult.totalSchedules || 0);
    console.log('==========================================');
    console.log('');

    const populatedSchedules = await ClassSchedule.find({
      _id: { $in: createdSchedules.map(s => s._id) }
    })
      .populate("room", "room_name location status")
      .sort({ date: 1 });

    // Chuẩn bị cleanupInfo với thông tin về các buổi đã bị xóa
    const cleanupInfo = cleanupResult.success ? {
      deletedCount: cleanupResult.deletedCount || 0,
      reassignedSessions: cleanupResult.reassignedSessions || 0,
      totalSchedules: cleanupResult.totalSchedules || 0
    } : null;

    return res.status(201).json({
      success: true,
      message: `Đã tạo ${createdSchedules.length} buổi học và lịch sinh viên thành công.`,
      schedules: populatedSchedules,
      generated: studentSchedules.length,
      cleanupInfo
    });
  } catch (err) {
    console.error(" Lỗi khi tạo buổi học:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getAttendanceByClassSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ"
      });
    }
    
    // Optimize query: chỉ lấy các fields cần thiết và không populate quá nhiều
    const list = await StudentSchedule.find({ classSchedule: id })
      .select("student attendance classSchedule")
      .populate("student", "username email")
      .lean(); // Use lean() for better performance

    res.status(200).json({
      success: true,
      message: "Danh sách điểm danh của buổi học",
      total: list.length,
      attendances: list,
      list, // Giữ lại để backward compatibility
    });
  } catch (err) {
    console.error(" Lỗi khi lấy danh sách điểm danh:", err);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy danh sách điểm danh", 
      error: err.message 
    });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { studentScheduleId } = req.params;
    const { status, teacherId } = req.body;

    const studentSchedule = await StudentSchedule.findById(studentScheduleId)
      .populate("classSchedule");

    if (!studentSchedule)
      return res.status(404).json({ message: "Không tìm thấy lịch học của sinh viên này" });

    const classSchedule = studentSchedule.classSchedule;
    if (!classSchedule)
      return res.status(404).json({ message: "Không tìm thấy buổi học tương ứng" });

    const today = new Date().toISOString().split("T")[0];
    const classDate = new Date(classSchedule.date).toISOString().split("T")[0];

    if (today !== classDate) {
      return res.status(400).json({
        message: `Chỉ được điểm danh vào ngày học (${classDate}). Hôm nay là ${today}.`,
      });
    }

    studentSchedule.attendance = {
      status,
      markedAt: new Date(),
      markedBy: teacherId,
    };

    await studentSchedule.save();

    res.json({
      message: "Điểm danh thành công",
      studentSchedule,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi điểm danh", error });
  }
};

exports.getStudentSchedulesByClassSchedules = async (req, res) => {
  try {
    const { classScheduleIds } = req.body;
    
    if (!classScheduleIds || !Array.isArray(classScheduleIds) || classScheduleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách classScheduleIds'
      });
    }

    const studentSchedules = await StudentSchedule.find({
      classSchedule: { $in: classScheduleIds }
    })
      .populate('student', 'username email phone')
      .populate({
        path: 'classSchedule',
        select: 'date startTime endTime room class session status',
        populate: [
          {
            path: 'class',
            select: 'name'
          },
          {
            path: 'room',
            select: 'room_name location capacity'
          },
          {
            path: 'session',
            select: 'title order'
          }
        ]
      })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Lấy StudentSchedule thành công',
      total: studentSchedules.length,
      studentSchedules
    });
  } catch (error) {
    console.error(' Lỗi khi lấy StudentSchedule:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy StudentSchedule',
      error: error.message
    });
  }
};

exports.getStudentSchedule = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    const Class = require("../models/classModel");
    const Course = require("../models/courseModel");

    const studentSchedules = await StudentSchedule.find({ student: studentId })
      .populate({
        path: "classSchedule",
        select: "date startTime endTime room class topic session status",
        populate: [
          {
            path: "class",
            select: "name subject teacherId course",
            populate: [
              {
                path: "teacherId",
                select: "username email",
              },
              {
                path: "course",
                select: "name program",
                populate: {
                  path: "program",
                  select: "type program_name"
                }
              }
            ]
          },
          {
            path: "room",
            select: "room_name location",
          },
          {
            path: "session",
            select: "title order",
          },
        ],
      })
      .lean();

    // Filter by date range if provided
    let filteredSchedules = studentSchedules;
    if (startDate || endDate) {
      filteredSchedules = studentSchedules.filter((ss) => {
        if (!ss.classSchedule || !ss.classSchedule.date) return false;

        const scheduleDate = new Date(ss.classSchedule.date);
        scheduleDate.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (scheduleDate < start) return false;
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
          if (scheduleDate > end) return false;
        }

        return true;
      });
    }

    filteredSchedules.sort((a, b) => {
      if (!a.classSchedule || !b.classSchedule) return 0;
      const dateA = new Date(a.classSchedule.date);
      const dateB = new Date(b.classSchedule.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return (a.classSchedule.startTime || "").localeCompare(b.classSchedule.startTime || "");
    });

    if (!filteredSchedules || filteredSchedules.length === 0) {
      return res.status(200).json({
        message: "Học sinh này chưa có lịch học nào.",
        total: 0,
        schedules: [],
      });
    }

    const classSessionsMap = {};

    const formattedSchedules = await Promise.all(
      filteredSchedules
        .filter((ss) => ss.classSchedule)
        .map(async (ss) => {
          const classSchedule = ss.classSchedule;
          const classInfo = classSchedule.class;
          const teacher = classInfo?.teacherId;
          const room = classSchedule.room;

          let sessionTitle = classSchedule.session?.title;
          let sessionOrder = classSchedule.session?.order || null;
          
          if (!sessionTitle && classInfo?.course) {
            const classId = classInfo._id?.toString();
            
            if (!classSessionsMap[classId]) {
              try {
                const classData = await Class.findById(classId)
                  .populate({
                    path: "course",
                    select: "sessions",
                    populate: {
                      path: "sessions",
                      select: "title order",
                    },
                  })
                  .lean();
                
                if (classData?.course?.sessions) {
                  const courseSessions = [...classData.course.sessions].sort(
                    (a, b) => (a.order || 0) - (b.order || 0)
                  );
                  
                  const ClassSchedule = require("../models/classScheduleModel");
                  const allClassSchedules = await ClassSchedule.find({ class: classId })
                    .sort({ date: 1, startTime: 1 })
                    .lean();
                  
                  const scheduleIndex = allClassSchedules.findIndex(
                    (s) => s._id.toString() === classSchedule._id.toString()
                  );
                  
                  if (scheduleIndex >= 0 && courseSessions.length > 0) {
                    const sessionIndex = scheduleIndex % courseSessions.length;
                    sessionTitle = courseSessions[sessionIndex]?.title;
                    sessionOrder = courseSessions[sessionIndex]?.order || null;
                  }
                  
                  classSessionsMap[classId] = { courseSessions, allClassSchedules };
                }
              } catch (err) {
                console.error("Error getting course sessions:", err);
              }
            } else {
              const { courseSessions, allClassSchedules } = classSessionsMap[classId];
              const scheduleIndex = allClassSchedules.findIndex(
                (s) => s._id.toString() === classSchedule._id.toString()
              );
              
              if (scheduleIndex >= 0 && courseSessions.length > 0) {
                const sessionIndex = scheduleIndex % courseSessions.length;
                sessionTitle = courseSessions[sessionIndex]?.title;
                sessionOrder = courseSessions[sessionIndex]?.order || null;
              }
            }
          }

          let className = classInfo?.name;
          if (!className && classSchedule.class) {
            if (typeof classSchedule.class === 'object' && classSchedule.class.name) {
              className = classSchedule.class.name;
            }
          }
          
          return {
            _id: ss._id,
            startTime: classSchedule.startTime,
            endTime: classSchedule.endTime,
            className: className || "N/A",
            subject: classInfo?.subject || "N/A",
            teacher: teacher
              ? {
                  _id: teacher._id,
                  username: teacher.username,
                  email: teacher.email,
                }
              : null,
            room: room
              ? {
                  _id: room._id,
                  room_name: room.room_name,
                  location: room.location,
                }
              : null,
            date: classSchedule.date,
            topic: classSchedule.topic,
            sessionTitle: sessionTitle || classSchedule.topic || null,
            sessionOrder: sessionOrder || classSchedule.session?.order || null, // Add sessionOrder to response (from calculated or direct)
            status: classSchedule.status || "fixed",
            attendance: ss.attendance,
            scheduleStatus: ss.scheduleStatus || "scheduled",
            reason: ss.reason || null,
            programType: classInfo?.course?.program?.type || null,
          };
        })
    );

    res.status(200).json({
      message: "Lấy lịch học của học sinh thành công.",
      total: formattedSchedules.length,
      schedules: formattedSchedules,
    });
  } catch (error) {
    console.error(" Lỗi khi lấy lịch học của học sinh:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy lịch học của học sinh.",
      error: error.message,
    });
  }
};

exports.getClassSchedulesBySession = async (req, res) => {
  try {
    const { sessionId, sessionOrder, dateAfter } = req.query;
    
    if (!sessionId && !sessionOrder) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp sessionId hoặc sessionOrder'
      });
    }

    const today = dateAfter ? new Date(dateAfter) : new Date();
    today.setHours(0, 0, 0, 0);

    // Tạo query để tìm ClassSchedule
    const query = {
      date: { $gte: today },
      status: { $in: ['fixed', 'temporary'] }
    };

    // Nếu có sessionId, tìm theo session ID
    if (sessionId) {
      query.session = sessionId;
    }

    // Tìm tất cả ClassSchedule thỏa mãn điều kiện
    let classSchedules = await ClassSchedule.find(query)
      .populate('session', 'title order')
      .populate('class', 'name')
      .populate('room', 'room_name')
      .populate({
        path: 'class',
        populate: {
          path: 'course',
          select: 'name'
        }
      })
      .sort({ date: 1, startTime: 1 })
      .lean();

    // Nếu có sessionOrder, filter thêm theo order
    if (sessionOrder !== undefined && sessionOrder !== null) {
      classSchedules = classSchedules.filter(schedule => {
        return schedule.session && schedule.session.order === parseInt(sessionOrder);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách ClassSchedule thành công',
      total: classSchedules.length,
      classSchedules
    });
  } catch (error) {
    console.error(' Lỗi khi lấy danh sách ClassSchedule:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách ClassSchedule',
      error: error.message
    });
  }
};

exports.getTeacherSchedule = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacherClasses = await Class.find({ teacherId }).select("_id name subject");
    
    if (!teacherClasses || teacherClasses.length === 0) {
      return res.status(200).json({
        message: "Giáo viên này chưa có lớp nào.",
        total: 0,
        schedules: [],
      });
    }

    const classIds = teacherClasses.map((cls) => cls._id);

    const classSchedules = await ClassSchedule.find({ class: { $in: classIds } })
      .populate({
        path: "class",
        select: "name subject teacherId course",
        populate: [
          {
            path: "course",
            select: "name program",
            populate: {
              path: "program",
              select: "type program_name"
            }
          }
        ]
      })
      .populate({
        path: "session",
        select: "title order content"
      })
      .populate({
        path: "room",
        select: "room_name location",
      })
      .lean();

    classSchedules.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return (a.startTime || "").localeCompare(b.startTime || "");
    });

    if (!classSchedules || classSchedules.length === 0) {
      return res.status(200).json({
        message: "Giáo viên này chưa có lịch dạy nào.",
        total: 0,
        schedules: [],
      });
    }

    const formattedSchedules = classSchedules.map((schedule) => {
      const classInfo = schedule.class;
      const room = schedule.room;
      
      // Lấy programType từ nested populate
      const programType = schedule.class?.course?.program?.type || null;

      return {
        _id: schedule._id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        className: classInfo?.name || "N/A",
        classId: schedule.class?._id?.toString() || schedule.class?.toString() || null,
        subject: classInfo?.subject || "N/A",
        room: room
          ? {
              _id: room._id,
              room_name: room.room_name,
              location: room.location,
            }
          : null,
        date: schedule.date,
        topic: schedule.topic,
        status: schedule.status,
        session: schedule.session,
        programType: programType,
        class: schedule.class,
      };
    });

    res.status(200).json({
      message: "Lấy lịch dạy của giáo viên thành công.",
      total: formattedSchedules.length,
      schedules: formattedSchedules,
    });
  } catch (error) {
    console.error(" Lỗi khi lấy lịch dạy của giáo viên:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy lịch dạy của giáo viên.",
      error: error.message,
    });
  }
};

exports.validateScheduleConflictSimple = async (req, res) => {
  try {
    const { date, startTime, endTime, room, teacher, studentId, excludeScheduleId } = req.body;

    if (!date || !startTime || !endTime || !room) {
      return res.status(400).json({ 
        success: false,
        message: "Thiếu thông tin bắt buộc: date, startTime, endTime, room" 
      });
    }

    const conflicts = {
      teacher: [],
      room: [],
      students: [],
      hasConflict: false
    };

    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      return res.status(400).json({ 
        success: false,
        message: "Định dạng ngày không hợp lệ. Phải là YYYY-MM-DD." 
      });
    }
    
    const scheduleDateStart = new Date(
      Date.UTC(
        parseInt(dateParts[0]), // year
        parseInt(dateParts[1]) - 1, // month (0-indexed)
        parseInt(dateParts[2]) // day
      )
    );
    const scheduleDateEnd = new Date(scheduleDateStart);
    scheduleDateEnd.setUTCDate(scheduleDateEnd.getUTCDate() + 1);

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
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const roomScheduleQuery = {
      room: new mongoose.Types.ObjectId(room),
      date: {
        $gte: scheduleDateStart,
        $lt: scheduleDateEnd
      },
      status: { $in: ['temporary', 'fixed'] }
    };

    if (excludeScheduleId) {
      roomScheduleQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
    }

    const roomSchedules = await ClassSchedule.find(roomScheduleQuery)
      .populate('class', 'name')
      .select('date startTime endTime class')
      .lean();

    roomSchedules.forEach((schedule) => {
      if (hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime)) {
        conflicts.room.push({
          roomId: room.toString(),
          className: schedule.class?.name || 'N/A',
          date: formatDateLocal(schedule.date),
          time: `${schedule.startTime} - ${schedule.endTime}`,
          conflictingTime: `${startTime} - ${endTime}`
        });
        conflicts.hasConflict = true;
      }
    });

    if (teacher) {
      const teacherClasses = await Class.find({
        $or: [
          { teacher: teacher },
          { teacherId: teacher }
        ]
      }).select('_id name').lean();

      if (teacherClasses.length > 0) {
        const teacherClassIds = teacherClasses.map(c => c._id);

        const teacherScheduleQuery = {
          class: { $in: teacherClassIds },
          date: {
            $gte: scheduleDateStart,
            $lt: scheduleDateEnd
          },
          status: { $in: ['temporary', 'fixed'] }
        };

        if (excludeScheduleId) {
          teacherScheduleQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
        }

        const teacherSchedules = await ClassSchedule.find(teacherScheduleQuery)
          .populate('class', 'name')
          .select('date startTime endTime class')
          .lean();

        console.log(' Kiểm tra conflict giáo viên:', {
          teacherId: teacher,
          date: date,
          excludeScheduleId: excludeScheduleId,
          foundSchedules: teacherSchedules.length,
          schedules: teacherSchedules.map(s => ({
            id: s._id,
            className: s.class?.name,
            date: formatDateLocal(s.date),
            time: `${s.startTime} - ${s.endTime}`
          }))
        });

        teacherSchedules.forEach((schedule) => {
          if (hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime)) {
            conflicts.teacher.push({
              teacherId: teacher.toString(),
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

    if (studentId) {
      const studentSchedules = await StudentSchedule.find({ 
        student: studentId,
        scheduleStatus: { $nin: ['cancelled'] } // Loại bỏ các buổi đã bị hủy
      })
        .populate({
          path: 'classSchedule',
          select: 'date startTime endTime class',
          populate: {
            path: 'class',
            select: 'name'
          }
        })
        .lean();

      const makeupDateStr = formatDateLocal(scheduleDateStart);

      studentSchedules.forEach(studentSchedule => {
        if (!studentSchedule.classSchedule) return;
        
        // Double check: Bỏ qua các buổi đã bị hủy
        if (studentSchedule.scheduleStatus === 'cancelled') {
          return;
        }
        
        const scheduleDate = new Date(studentSchedule.classSchedule.date);
        const scheduleDateStr = formatDateLocal(scheduleDate);
        
        if (scheduleDateStr === makeupDateStr &&
            hasTimeOverlap(startTime, endTime, 
              studentSchedule.classSchedule.startTime, 
              studentSchedule.classSchedule.endTime)) {
          conflicts.students.push({
            studentId: studentId.toString(),
            className: studentSchedule.classSchedule.class?.name || 'N/A',
            date: scheduleDateStr,
            time: `${studentSchedule.classSchedule.startTime} - ${studentSchedule.classSchedule.endTime}`,
            conflictingTime: `${startTime} - ${endTime}`
          });
          conflicts.hasConflict = true;
        }
      });
    }

    return res.status(200).json({
      success: true,
      hasConflict: conflicts.hasConflict,
      conflicts: conflicts
    });
  } catch (error) {
    console.error(" Lỗi khi validate conflict:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi validate conflict",
      error: error.message
    });
  }
};

exports.createMakeupClassSchedule = async (req, res) => {
  try {
    const { date, startTime, endTime, room, teacher, session, reason, createdBy } = req.body;

    if (!date || !startTime || !endTime || !room || !teacher) {
      return res.status(400).json({ 
        success: false,
        message: "Thiếu thông tin bắt buộc: date, startTime, endTime, room, teacher" 
      });
    }

    // Parse date string (YYYY-MM-DD) và tạo Date object ở local timezone
    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      return res.status(400).json({ 
        success: false,
        message: "Định dạng ngày không hợp lệ. Phải là YYYY-MM-DD." 
      });
    }
    
    const scheduleDate = new Date(
      parseInt(dateParts[0]), // year
      parseInt(dateParts[1]) - 1, // month (0-indexed)
      parseInt(dateParts[2]) // day
    );
    scheduleDate.setHours(0, 0, 0, 0);

    // Kiểm tra conflict với room và teacher
    const roomConflict = await ClassSchedule.findOne({
      room: new mongoose.Types.ObjectId(room),
      date: scheduleDate,
      status: { $in: ['temporary', 'fixed'] },
      $or: [
        { $and: [{ startTime: { $lte: startTime } }, { endTime: { $gt: startTime } }] },
        { $and: [{ startTime: { $lt: endTime } }, { endTime: { $gte: endTime } }] },
        { $and: [{ startTime: { $gte: startTime } }, { endTime: { $lte: endTime } }] }
      ]
    }).lean();

    if (roomConflict) {
      return res.status(400).json({
        success: false,
        message: "Phòng học đã được sử dụng vào thời gian này"
      });
    }

    // Kiểm tra conflict với teacher
    const teacherClasses = await Class.find({
      $or: [
        { teacher: teacher },
        { teacherId: teacher }
      ]
    }).select('_id').lean();

    if (teacherClasses.length > 0) {
      const teacherClassIds = teacherClasses.map(c => c._id);
      const teacherConflict = await ClassSchedule.findOne({
        class: { $in: teacherClassIds },
        date: scheduleDate,
        status: { $in: ['temporary', 'fixed'] },
        $or: [
          { $and: [{ startTime: { $lte: startTime } }, { endTime: { $gt: startTime } }] },
          { $and: [{ startTime: { $lt: endTime } }, { endTime: { $gte: endTime } }] },
          { $and: [{ startTime: { $gte: startTime } }, { endTime: { $lte: endTime } }] }
        ]
      }).lean();

      if (teacherConflict) {
        return res.status(400).json({
          success: false,
          message: "Giáo viên đã có lớp khác vào thời gian này"
        });
      }
    }

    // Tạo ClassSchedule mới (không có classId)
    const newSchedule = await ClassSchedule.create({
      class: null, // Không có classId cho buổi học bù
      session: session ? new mongoose.Types.ObjectId(session) : null, // Session từ buổi nghỉ (nếu có)
      date: scheduleDate,
      startTime,
      endTime,
      room: new mongoose.Types.ObjectId(room),
      teacher: new mongoose.Types.ObjectId(teacher),
      createdBy: createdBy ? new mongoose.Types.ObjectId(createdBy) : new mongoose.Types.ObjectId(teacher),
      reason: reason || 'Buổi học bù',
      status: 'temporary' // Buổi học bù là temporary
    });

    // Populate để trả về đầy đủ thông tin
    const populatedSchedule = await ClassSchedule.findById(newSchedule._id)
      .populate('room', 'room_name location')
      .populate('teacher', 'username email fullName')
      .populate('session', 'title order content')
      .lean();

    return res.status(201).json({
      success: true,
      message: "Đã tạo buổi học bù thành công",
      schedule: populatedSchedule
    });
  } catch (error) {
    console.error(" Lỗi khi tạo buổi học bù:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo buổi học bù",
      error: error.message
    });
  }
};


exports.validateMakeupClassSchedule = async (req, res) => {
  try {
    const { makeupClassScheduleId, studentId } = req.body;

    if (!makeupClassScheduleId || !studentId) {
      return res.status(400).json({ 
        success: false,
        message: "Thiếu thông tin bắt buộc: makeupClassScheduleId và studentId" 
      });
    }

    const makeupSchedule = await ClassSchedule.findById(makeupClassScheduleId)
      .populate('class', 'name')
      .select('date startTime endTime class')
      .lean();

    if (!makeupSchedule) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy buổi học bù" 
      });
    }

    const makeupDate = new Date(makeupSchedule.date);
    makeupDate.setHours(0, 0, 0, 0);
    
    const formatDateLocal = (dateInput) => {
      if (!dateInput) return null;
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return null;
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const makeupDateStr = formatDateLocal(makeupDate);

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

    const studentSchedules = await StudentSchedule.find({ 
      student: studentId,
      scheduleStatus: { $nin: ['cancelled'] } // Loại bỏ các buổi đã bị hủy
    })
      .populate({
        path: 'classSchedule',
        select: 'date startTime endTime class',
        populate: {
          path: 'class',
          select: 'name'
        }
      })
      .lean();

    const conflicts = [];
    
    studentSchedules.forEach(studentSchedule => {
      if (!studentSchedule.classSchedule) return;
      
      // Double check: Bỏ qua các buổi đã bị hủy
      if (studentSchedule.scheduleStatus === 'cancelled') {
        return;
      }
      
      const scheduleDate = new Date(studentSchedule.classSchedule.date);
      scheduleDate.setHours(0, 0, 0, 0);
      const scheduleDateStr = formatDateLocal(scheduleDate);
      
      if (scheduleDateStr === makeupDateStr && 
          hasTimeOverlap(
            makeupSchedule.startTime, 
            makeupSchedule.endTime,
            studentSchedule.classSchedule.startTime,
            studentSchedule.classSchedule.endTime
          )) {
        conflicts.push({
          className: studentSchedule.classSchedule.class?.name || 'N/A',
          date: scheduleDateStr,
          time: `${studentSchedule.classSchedule.startTime} - ${studentSchedule.classSchedule.endTime}`
        });
      }
    });

    const hasConflict = conflicts.length > 0;

    return res.status(200).json({
      success: true,
      hasConflict,
      conflicts: conflicts,
      message: hasConflict 
        ? `Học sinh đã có ${conflicts.length} buổi học khác vào cùng thời gian với buổi học bù` 
        : "Không có conflict với lịch học của học sinh"
    });

  } catch (err) {
    console.error(" Lỗi khi validate học bù:", err);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi validate học bù", 
      error: err.message 
    });
  }
};

exports.assignSubstituteTeacher = async (req, res) => {
  try {
    const { id: scheduleId } = req.params;
    const { substituteTeacherId } = req.body;

    if (!substituteTeacherId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin giáo viên dạy thay'
      });
    }

    const classSchedule = await ClassSchedule.findById(scheduleId)
      .populate('class', 'name teacher')
      .populate('room', 'room_name')
      .populate('teacher', 'username');

    if (!classSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    const scheduleDate = new Date(classSchedule.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    scheduleDate.setHours(0, 0, 0, 0);
    
    if (scheduleDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xếp người dạy thay cho buổi học đã qua'
      });
    }

    const originalTeacher = classSchedule.teacher;
    const originalTeacherId = originalTeacher?._id?.toString() || originalTeacher?.toString();

    // 🆕 Kiểm tra: Nếu substituteTeacher trùng với teacher gốc thì xóa substituteTeacher
    if (substituteTeacherId.toString() === originalTeacherId) {
      // Xóa substituteTeacher
      classSchedule.substituteTeacher = undefined;
      
      // Xóa note về giáo viên dạy thay (nếu có)
      if (classSchedule.note) {
        classSchedule.note = classSchedule.note.replace(/Giáo viên dạy thay:.*/g, '').trim();
        // Nếu note rỗng sau khi xóa, set về null
        if (!classSchedule.note) {
          classSchedule.note = null;
        }
      }
      
      await classSchedule.save();
      
      const updatedSchedule = await ClassSchedule.findById(classSchedule._id)
        .populate('class', 'name')
        .populate('room', 'room_name location')
        .populate('teacher', 'username email')
        .populate('substituteTeacher', 'username email')
        .populate('session', 'title order')
        .lean();
      
      return res.status(200).json({
        success: true,
        message: 'Đã xóa giáo viên dạy thay (trùng với giáo viên gốc)',
        schedule: updatedSchedule
      });
    }

    const substituteTeacherClasses = await Class.find({
      $or: [
        { teacher: substituteTeacherId },
        { teacherId: substituteTeacherId }
      ]
    }).select('_id name').lean();

    if (substituteTeacherClasses.length > 0) {
      const substituteTeacherClassIds = substituteTeacherClasses.map(c => c._id);

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

      const conflictSchedule = await ClassSchedule.findOne({
        class: { $in: substituteTeacherClassIds },
        date: scheduleDate,
        status: { $in: ['temporary', 'fixed'] },
        _id: { $ne: new mongoose.Types.ObjectId(scheduleId) },
        $or: [
          { $and: [{ startTime: { $lte: classSchedule.startTime } }, { endTime: { $gt: classSchedule.startTime } }] },
          { $and: [{ startTime: { $lt: classSchedule.endTime } }, { endTime: { $gte: classSchedule.endTime } }] },
          { $and: [{ startTime: { $gte: classSchedule.startTime } }, { endTime: { $lte: classSchedule.endTime } }] }
        ]
      })
        .populate('class', 'name')
        .lean();

      if (conflictSchedule) {
        return res.status(400).json({
          success: false,
          message: `Giáo viên dạy thay đã có lớp khác (${conflictSchedule.class?.name || 'N/A'}) vào thời gian này`,
          hasConflict: true
        });
      }
    }

    classSchedule.substituteTeacher = new mongoose.Types.ObjectId(substituteTeacherId);

    const substituteNote = `Giáo viên dạy thay: ${substituteTeacherId} (Giáo viên gốc: ${originalTeacher._id || originalTeacher})`;
    if (classSchedule.note) {
      classSchedule.note += `\n${substituteNote}`;
    } else {
      classSchedule.note = substituteNote;
    }

    await classSchedule.save();

    const updatedSchedule = await ClassSchedule.findById(classSchedule._id)
      .populate('class', 'name')
      .populate('room', 'room_name location')
      .populate('teacher', 'username email')
      .populate('substituteTeacher', 'username email')
      .populate('session', 'title order')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Đã xếp người dạy thay thành công',
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error(' Lỗi khi xếp người dạy thay:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xếp người dạy thay',
      error: error.message
    });
  }
};

exports.createStudentSchedule = async (req, res) => {
  try {
    const { studentId, classScheduleId, scheduleStatus, reason } = req.body;

    if (!studentId || !classScheduleId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: studentId và classScheduleId"
      });
    }

    const existing = await StudentSchedule.findOne({
      student: studentId,
      classSchedule: classScheduleId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "StudentSchedule đã tồn tại cho học viên và buổi học này"
      });
    }

    const newStudentSchedule = await StudentSchedule.create({
      student: studentId,
      classSchedule: classScheduleId,
      scheduleStatus: scheduleStatus || 'scheduled',
      reason: reason || null
    });

    const populated = await StudentSchedule.findById(newStudentSchedule._id)
      .populate('student', 'username email')
      .populate({
        path: 'classSchedule',
        populate: [
          { path: 'class', select: 'name' },
          { path: 'room', select: 'room_name' },
          { path: 'teacher', select: 'username' }
        ]
      })
      .lean();

    return res.status(201).json({
      success: true,
      message: "Đã tạo StudentSchedule thành công",
      studentSchedule: populated
    });
  } catch (error) {
    console.error(" Lỗi khi tạo StudentSchedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo StudentSchedule",
      error: error.message
    });
  }
};

exports.getClassScheduleByStudentScheduleId = async (req, res) => {
  try {
    const { studentScheduleId } = req.params;

    if (!studentScheduleId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu studentScheduleId"
      });
    }

    const studentSchedule = await StudentSchedule.findById(studentScheduleId)
      .populate({
        path: 'classSchedule',
        populate: [
          {
            path: 'class',
            select: 'name subject teacherId course students',
            populate: [
              {
                path: 'teacherId',
                select: 'username email fullName'
              },
              {
                path: 'course',
                select: 'name type level band'
              }
            ]
          },
          {
            path: 'room',
            select: 'room_name location capacity'
          },
          {
            path: 'session',
            select: 'title order description content'
          },
          {
            path: 'teacher',
            select: 'username email fullName'
          },
          {
            path: 'createdBy',
            select: 'username email'
          }
        ]
      })
      .populate('student', 'username email')
      .lean();

    if (!studentSchedule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy StudentSchedule"
      });
    }

    if (!studentSchedule.classSchedule) {
      return res.status(404).json({
        success: false,
        message: "StudentSchedule không có ClassSchedule liên kết"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy ClassSchedule thành công",
      studentSchedule: studentSchedule,
      classSchedule: studentSchedule.classSchedule
    });
  } catch (error) {
    console.error(" Lỗi khi lấy ClassSchedule từ StudentScheduleId:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy ClassSchedule",
      error: error.message
    });
  }
};

exports.updateStudentSchedule = async (req, res) => {
  try {
    const { studentScheduleId } = req.params;
    const { scheduleStatus, reason } = req.body;

    if (!studentScheduleId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu studentScheduleId"
      });
    }

    const studentSchedule = await StudentSchedule.findById(studentScheduleId);

    if (!studentSchedule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy StudentSchedule"
      });
    }

    // Cập nhật các trường được phép
    if (scheduleStatus !== undefined) {
      studentSchedule.scheduleStatus = scheduleStatus;
    }
    if (reason !== undefined) {
      studentSchedule.reason = reason;
    }

    await studentSchedule.save();

    // Populate để trả về đầy đủ thông tin
    const populated = await StudentSchedule.findById(studentSchedule._id)
      .populate('student', 'username email')
      .populate({
        path: 'classSchedule',
        populate: [
          { path: 'class', select: 'name' },
          { path: 'room', select: 'room_name' },
          { path: 'teacher', select: 'username' }
        ]
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Đã cập nhật StudentSchedule thành công",
      studentSchedule: populated
    });
  } catch (error) {
    console.error(" Lỗi khi cập nhật StudentSchedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật StudentSchedule",
      error: error.message
    });
  }
};