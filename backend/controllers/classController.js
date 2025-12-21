const Class = require("../models/classModel");
const User = require("../models/userModel");
const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");
const HomeworkSubmission = require("../models/homeworkSubmissionModel");
const Course = require("../models/courseModel");
const Program = require("../models/programModel");
const Room = require("../models/room");
const mongoose = require("mongoose");

exports.getAllClasses = async (req, res) => {
  try {
    const { level, status, search, courseId } = req.query;
    let query = {};
    
    // Level filter: tìm trong program.level
    if (level) {
      const programsWithLevel = await Program.find({ level }).select('_id');
      const coursesWithProgram = await Course.find({ program: { $in: programsWithLevel.map(p => p._id) } }).select('_id');
      query.course = { $in: coursesWithProgram.map(c => c._id) };
    }
    if (status) query.status = status;
    if (courseId) query.course = courseId;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    const classes = await Class.find(query)
      // user model uses 'username' rather than firstName/lastName/fullName
      .populate('teacher', 'username email phone')
      .populate('students', 'username email')
      .populate('room', 'room_name location capacity')
      .populate({ 
        path: 'course', 
        select: 'name',
        populate: { path: 'program', select: 'program_name name level band tuitionFee type' } 
      })
      .sort({ createdAt: -1 })
      .lean();
    
    // Calculate stats for each class
    const classesWithStats = await Promise.all(
      classes.map(async (cls) => {
        const schedules = await ClassSchedule.countDocuments({ 
          class: cls._id,
          status: { $in: ['temporary', 'fixed'] }
        });
        
        const completedSchedules = await ClassSchedule.countDocuments({
          class: cls._id,
          status: { $in: ['temporary', 'fixed'] },
          date: { $lt: new Date() }
        });
        
          const totalStudents = cls.students?.length || 0;
          const totalSchedules = schedules;
          const completionRate = totalSchedules > 0 ? ((completedSchedules / totalSchedules) * 100).toFixed(2) : '0';

          return {
            ...cls,
            // flatten commonly-used values for frontend convenience
            totalStudents,
            totalSchedules,
            completedSchedules,
            completionRate: parseFloat(completionRate),
            // normalize teacher/course display fields expected by frontend
            teacherName: cls.teacher?.username || 'N/A',
            courseName: cls.course?.name || 'N/A',
            programName: cls.course?.program?.program_name || cls.course?.program?.name || 'N/A',
            // Add level and band from program
            level: cls.course?.program?.level || 'N/A',
            band: cls.course?.program?.band || 'N/A',
            courseType: cls.course?.program?.type || 'N/A',
            // Add room info
            roomName: cls.room?.room_name || 'N/A',
            roomLocation: cls.room?.location || 'N/A'
          };
      })
    );
    
    res.status(200).json({
      success: true,
      count: classesWithStats.length,
      classes: classesWithStats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy danh sách lớp học",
      error: error.message 
    });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const classData = await Class.findById(id)
      .populate('teacher', 'username email phone')
      .populate('students', 'username email phone')
      .populate('room', 'room_name location capacity')
      .populate({ 
        path: 'course', 
        select: 'name',
        populate: [
          { path: 'program', select: 'program_name name level band tuitionFee type' },
          {
            path: 'clos',
            select: 'code name detail mappedPLOs',
            populate: {
              path: 'mappedPLOs',
              select: 'code name'
            }
          }
        ]
      })
      .lean();
    
    if (!classData) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy lớp học" 
      });
    }
    
    // Get schedules for this class
    const schedules = await ClassSchedule.find({ class: id })
      .populate('room', 'room_name location capacity')
      .populate('session', 'title order')
      .sort({ date: 1 });


    // compute some convenient stats for frontend
    const totalSchedules = await ClassSchedule.countDocuments({ class: id, status: { $in: ['temporary', 'fixed'] } });
    const completedSchedules = await ClassSchedule.countDocuments({ class: id, status: { $in: ['temporary', 'fixed'] }, date: { $lt: new Date() } });
    const totalStudents = classData.students?.length || 0;
    const completionRate = totalSchedules > 0 ? ((completedSchedules / totalSchedules) * 100).toFixed(2) : '0';
    
    // Tạo chuỗi thời gian học từ schedules
    let scheduleTimeString = 'N/A';
    if (schedules.length > 0) {
      // Nhóm schedules theo thứ trong tuần
      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const scheduleByDay = new Map(); // Map<dayIndex, Set<timeSlot>>
      
      schedules.forEach(schedule => {
        if (schedule.date && schedule.startTime && schedule.endTime) {
          const date = new Date(schedule.date);
          const dayIndex = date.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
          const timeSlot = `${schedule.startTime}-${schedule.endTime}`;
          
          if (!scheduleByDay.has(dayIndex)) {
            scheduleByDay.set(dayIndex, new Set());
          }
          scheduleByDay.get(dayIndex).add(timeSlot);
        }
      });
      
      if (scheduleByDay.size > 0) {
        // Sắp xếp thứ theo thứ tự trong tuần (Thứ 2 -> Chủ nhật)
        // Chuyển đổi: 1,2,3,4,5,6,0 -> Thứ 2,3,4,5,6,7,CN
        const sortedDays = Array.from(scheduleByDay.keys()).sort((a, b) => {
          // Sắp xếp: Thứ 2(1) -> Thứ 7(6) -> Chủ nhật(0)
          if (a === 0) return 1; // Chủ nhật xuống cuối
          if (b === 0) return -1;
          return a - b;
        });
        
        // Format: "Thứ X: time1, time2 | Thứ Y: time1"
        const formattedParts = sortedDays.map(dayIndex => {
          const dayName = dayNames[dayIndex];
          const timeSlots = Array.from(scheduleByDay.get(dayIndex)).sort();
          return `${dayName}: ${timeSlots.join(', ')}`;
        });
        
        scheduleTimeString = formattedParts.join(' | ');
      }
    }
    
    // Get class schedule IDs for this class
    const classScheduleIds = schedules.map(s => s._id);
    
    // Get students array for attendance calculation
    const students = classData.students || [];
    
    // Get course info to check mocktest sessions
    const course = await Course.findById(classData.course?._id);
    const mocktestSessionOrders = course?.mocktestSessionOrders || [];
    
    // Calculate mock test information
    const now = new Date();
    const mocktestMilestones = [];
    let nextMocktest = null;
    
    for (const sessionOrder of mocktestSessionOrders) {
      const mocktestSchedule = schedules.find(s => s.session?.order === sessionOrder);
      if (mocktestSchedule) {
        const mocktestDate = new Date(mocktestSchedule.date);
        const daysUntil = Math.ceil((mocktestDate - now) / (1000 * 60 * 60 * 24));
        const status = mocktestDate < now ? 'completed' : 'upcoming';
        
        const milestone = {
          date: mocktestSchedule.date,
          sessionOrder: sessionOrder,
          title: `Mocktest ${sessionOrder}`,
          status: status,
          daysUntil: status === 'upcoming' ? daysUntil : null
        };
        
        mocktestMilestones.push(milestone);
        
        // Find next upcoming mocktest
        if (!nextMocktest && status === 'upcoming') {
          nextMocktest = {
            date: mocktestSchedule.date,
            daysUntil: daysUntil,
            sessionOrder: sessionOrder,
            title: `Mocktest ${sessionOrder}`
          };
        }
      }
    }
    
    // Find next lesson
    const nextLesson = schedules.find(s => {
      const scheduleDate = new Date(s.date);
      return scheduleDate > now;
    });
    
    const classActivity = {
      nextMocktest: nextMocktest,
      mocktestMilestones: mocktestMilestones,
      nextLesson: nextLesson ? {
        date: nextLesson.date,
        startTime: nextLesson.startTime,
        endTime: nextLesson.endTime,
        topic: nextLesson.session?.title || 'N/A'
      } : null
    };
    
    // Calculate teacher attendance
    const teacherTotalSchedules = schedules.length;
    const teacherPresentSchedules = schedules.filter(s => {
      // Teacher is considered present if schedule is completed or has attendance
      return s.status === 'completed' || s.hasAttendance === true;
    }).length;
    const teacherAttendanceRate = teacherTotalSchedules > 0 
      ? Math.round((teacherPresentSchedules / teacherTotalSchedules) * 100) 
      : 0;
    
    const teacherAttendance = {
      rate: teacherAttendanceRate,
      presentCount: teacherPresentSchedules,
      totalCount: teacherTotalSchedules
    };
    
    // Calculate attendance and homework completion for each student
    const studentsWithAttendance = await Promise.all(
      students.map(async (student) => {
        // Get all student schedules for this class
        const studentSchedules = await StudentSchedule.find({
          student: student._id,
          classSchedule: { $in: classScheduleIds }
        });
        
        // Calculate attendance percentage
        let attendanceRate = 0;
        if (studentSchedules.length > 0) {
          const presentCount = studentSchedules.filter(
            s => s.attendance && s.attendance.status === 'present'
          ).length;
          attendanceRate = Math.round((presentCount / studentSchedules.length) * 100);
        }
        
        // Get homework submissions
        const homeworkIds = schedules
          .flatMap(s => s.homework || [])
          .map(hw => hw._id);
        
        const totalAssignments = homeworkIds.length;
        
        const submissions = await HomeworkSubmission.find({
          student: student._id,
          homeworkId: { $in: homeworkIds }
        });
        
        const submittedCount = submissions.filter(
          s => s.status === 'submitted' || s.status === 'late'
        ).length;
        const homeworkCompletionRate = totalAssignments > 0
          ? Math.round((submittedCount / totalAssignments) * 100)
          : 0;
        
        return {
          _id: student._id,
          username: student.username,
          email: student.email,
          phone: student.phone,
          attendance: attendanceRate,
          homeworkCompletionRate: homeworkCompletionRate,
          submittedAssignments: submittedCount,
          totalAssignments: totalAssignments
        };
      })
    );
    
    res.status(200).json({
      success: true,
      class: {
        ...classData,
        schedules,
        students: studentsWithAttendance,
        totalStudents,
        totalSchedules,
        completedSchedules,
        completionRate: parseFloat(completionRate),
        schedule: scheduleTimeString, // Thêm field schedule để frontend hiển thị
        teacherName: classData.teacher?.username || 'N/A',
        courseName: classData.course?.name || 'N/A',
        programName: classData.course?.program?.program_name || classData.course?.program?.name || 'N/A',
        level: classData.course?.program?.level || 'N/A',
        band: classData.course?.program?.band || 'N/A',
        courseType: classData.course?.program?.type || 'N/A',
        roomName: classData.room?.room_name || 'N/A',
        roomLocation: classData.room?.location || 'N/A',
        classActivity: classActivity,
        teacherAttendance: teacherAttendance
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy thông tin lớp",
      error: error.message 
    });
  }
};

exports.getClassStats = async (req, res) => {
  try {
    const total = await Class.countDocuments();
    const active = await Class.countDocuments({ status: 'active' });
    const pending = await Class.countDocuments({ status: 'pending' });
    const completed = await Class.countDocuments({ status: 'completed' });
    
    const classes = await Class.find();
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
    const avgClassSize = total > 0 ? (totalStudents / total).toFixed(1) : 0;
    
    res.status(200).json({
      success: true,
      stats: {
        total,
        active,
        pending,
        completed,
        totalStudents,
        avgClassSize: parseFloat(avgClassSize)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy thống kê lớp",
      error: error.message 
    });
  }
};

/**
 * Validate conflicts for multiple class schedules before creation
 * @param {Array} classSchedules - Array of schedule objects { date, startTime, endTime, room, teacher }
 * @param {Object} classData - Class data { _id, teacher, students }
 * @returns {Object} { hasConflict: boolean, conflicts: { teacher: [], room: [], students: [] } }
 */
const validateClassSchedulesConflicts = async (classSchedules, classData) => {
  const conflicts = {
    teacher: [],
    room: [],
    students: [],
    hasConflict: false
  };

  if (!classSchedules || classSchedules.length === 0) {
    return conflicts;
  }

  const teacherId = classData.teacher || classData.teacherId;
  const students = classData.students || [];
  const classId = classData._id;

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

  // Get all unique dates from schedules to batch query
  const uniqueDates = [...new Set(classSchedules.map(s => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d;
  }))];

  //Kiểm tra conflict PHÒNG HỌC
  // Get room from first schedule (all schedules should have same room)
  const roomId = classSchedules[0]?.room;
  if (roomId) {
    // Query all room schedules for all dates (excluding current class if classId is provided)
    const roomScheduleQuery = {
      room: new mongoose.Types.ObjectId(roomId),
      date: { $in: uniqueDates },
      status: { $in: ['temporary', 'fixed'] }
    };
    
    // Exclude schedules from current class if classId is provided
    if (classId) {
      roomScheduleQuery.class = { $ne: new mongoose.Types.ObjectId(classId) };
    }
    
    const roomSchedules = await ClassSchedule.find(roomScheduleQuery)
      .populate('class', 'name')
      .select('date startTime endTime class')
      .lean();

    classSchedules.forEach(newSchedule => {
      const scheduleDate = new Date(newSchedule.date);
      scheduleDate.setHours(0, 0, 0, 0);

      roomSchedules.forEach(existingSchedule => {
        const existingDate = new Date(existingSchedule.date);
        existingDate.setHours(0, 0, 0, 0);

        // Check if same date and overlapping time
        if (scheduleDate.getTime() === existingDate.getTime() &&
            hasTimeOverlap(newSchedule.startTime, newSchedule.endTime, existingSchedule.startTime, existingSchedule.endTime)) {
          conflicts.room.push({
            roomId: roomId.toString(),
            className: existingSchedule.class?.name || 'N/A',
            date: formatDateLocal(existingSchedule.date),
            time: `${existingSchedule.startTime} - ${existingSchedule.endTime}`,
            conflictingTime: `${newSchedule.startTime} - ${newSchedule.endTime}`,
            newScheduleDate: formatDateLocal(newSchedule.date)
          });
          conflicts.hasConflict = true;
        }
      });
    });
  }

  //Kiểm tra conflict GIÁO VIÊN
  if (teacherId) {
    // Find all classes taught by this teacher (excluding current class if classId is provided)
    const teacherQuery = {
      $or: [
        { teacher: teacherId },
        { teacherId: teacherId }
      ]
    };
    if (classId) {
      teacherQuery._id = { $ne: classId };
    }
    const teacherClasses = await Class.find(teacherQuery).select('_id name').lean();

    if (teacherClasses.length > 0) {
      const teacherClassIds = teacherClasses.map(c => c._id);

      // Query all teacher schedules for all dates
      const teacherSchedules = await ClassSchedule.find({
        class: { $in: teacherClassIds },
        date: { $in: uniqueDates },
        status: { $in: ['temporary', 'fixed'] }
      })
        .populate('class', 'name')
        .select('date startTime endTime class')
        .lean();

      classSchedules.forEach((newSchedule, newIdx) => {
        const scheduleDate = new Date(newSchedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        const newDateStr = formatDateLocal(newSchedule.date);

        teacherSchedules.forEach((existingSchedule, existIdx) => {
          const existingDate = new Date(existingSchedule.date);
          existingDate.setHours(0, 0, 0, 0);
          const existDateStr = formatDateLocal(existingSchedule.date);

          // Check if same date and overlapping time
          const sameDate = scheduleDate.getTime() === existingDate.getTime();
          const hasOverlap = hasTimeOverlap(newSchedule.startTime, newSchedule.endTime, existingSchedule.startTime, existingSchedule.endTime);
          
          if (sameDate && hasOverlap) {
            console.log(`\n   PHÁT HIỆN XUNG ĐỘT [${newIdx + 1} vs ${existIdx + 1}]:`);
            console.log(`     - Ngày: ${newDateStr}`);
            console.log(`     - Lớp hiện tại: ${newSchedule.startTime} - ${newSchedule.endTime}`);
            console.log(`     - Lớp khác "${existingSchedule.class?.name || 'N/A'}": ${existingSchedule.startTime} - ${existingSchedule.endTime}`);
            
            conflicts.teacher.push({
              teacherId: teacherId.toString(),
              className: existingSchedule.class?.name || 'N/A',
              date: formatDateLocal(existingSchedule.date),
              time: `${existingSchedule.startTime} - ${existingSchedule.endTime}`,
              conflictingTime: `${newSchedule.startTime} - ${newSchedule.endTime}`,
              newScheduleDate: formatDateLocal(newSchedule.date)
            });
            conflicts.hasConflict = true;
          }
        });
      });
      
      console.log('  - Tổng số xung đột tìm thấy:', conflicts.teacher.length);
    } else {
      console.log(' Giáo viên không có lớp nào khác, không có xung đột');
    }
    console.log('  ============================================\n');
  }

  // 3. Kiểm tra conflict SINH VIÊN
  if (students && students.length > 0) {
    // Convert students to ObjectIds if they're strings
    const studentIds = students.map(s => {
      if (typeof s === 'string') {
        return new mongoose.Types.ObjectId(s);
      } else if (s._id) {
        return new mongoose.Types.ObjectId(s._id);
      } else {
        return new mongoose.Types.ObjectId(s);
      }
    });

    // Fetch student information from database to get names
    const studentInfo = await User.find({
      _id: { $in: studentIds }
    }).select('_id username fullName name email').lean();

    // Create a map of studentId -> student info for quick lookup
    const studentInfoMap = new Map();
    studentInfo.forEach(student => {
      const studentIdStr = student._id.toString();
      const studentName = student.fullName || student.name || student.username || student.email?.split('@')[0] || `Học viên ${studentIdStr}`;
      studentInfoMap.set(studentIdStr, {
        studentId: studentIdStr,
        studentName: studentName
      });
    });

    // Find all classes that have any of these students (excluding current class if classId is provided)
    const studentQuery = {
      students: { $in: studentIds }
    };
    if (classId) {
      studentQuery._id = { $ne: classId };
    }
    const studentClasses = await Class.find(studentQuery).select('_id name students').lean();

    if (studentClasses.length > 0) {
      const studentClassIds = studentClasses.map(c => c._id);

      // Query all student schedules for all dates
      const studentSchedules = await ClassSchedule.find({
        class: { $in: studentClassIds },
        date: { $in: uniqueDates },
        status: { $in: ['temporary', 'fixed'] }
      })
        .populate('class', 'name')
        .select('date startTime endTime class')
        .lean();

      const studentConflictMap = new Map();

      classSchedules.forEach(newSchedule => {
        const scheduleDate = new Date(newSchedule.date);
        scheduleDate.setHours(0, 0, 0, 0);

        studentSchedules.forEach(existingSchedule => {
          const existingDate = new Date(existingSchedule.date);
          existingDate.setHours(0, 0, 0, 0);

          // Check if same date and overlapping time
          if (scheduleDate.getTime() === existingDate.getTime() &&
              hasTimeOverlap(newSchedule.startTime, newSchedule.endTime, existingSchedule.startTime, existingSchedule.endTime)) {
            const scheduleClassId = existingSchedule.class?._id?.toString() || existingSchedule.class?.toString() || null;
            if (!scheduleClassId) return;

            const conflictingClass = studentClasses.find(cls => cls._id.toString() === scheduleClassId);
            if (!conflictingClass) return;

            conflictingClass.students.forEach(studentIdInConflictClass => {
              const studentIdInConflictClassStr = studentIdInConflictClass.toString();
              
              // Check if this student is in the current class's student list
              const isInCurrentClass = studentIds.some(sid => sid.toString() === studentIdInConflictClassStr);
              
              if (isInCurrentClass) {
                // Get student name from the map we created earlier
                const studentInfo = studentInfoMap.get(studentIdInConflictClassStr);
                const studentName = studentInfo ? studentInfo.studentName : `Học viên ${studentIdInConflictClassStr}`;
                
                if (!studentConflictMap.has(studentIdInConflictClassStr)) {
                  studentConflictMap.set(studentIdInConflictClassStr, {
                    studentId: studentIdInConflictClassStr,
                    studentName: studentName,
                    conflicts: []
                  });
                }
                studentConflictMap.get(studentIdInConflictClassStr).conflicts.push({
                  className: existingSchedule.class?.name || conflictingClass.name || 'N/A',
                  date: formatDateLocal(existingSchedule.date),
                  time: `${existingSchedule.startTime} - ${existingSchedule.endTime}`,
                  conflictingTime: `${newSchedule.startTime} - ${newSchedule.endTime}`,
                  newScheduleDate: formatDateLocal(newSchedule.date)
                });
                conflicts.hasConflict = true;
              }
            });
          }
        });
      });

      studentConflictMap.forEach((studentConflict) => {
        conflicts.students.push(studentConflict);
      });
    }
  }

  return conflicts;
};

exports.validateClassConflicts = async (req, res) => {
  try {
    const { course, teacher, students, room, startDate, scheduleEntries } = req.body;
    
    // Validate required fields for conflict checking
    if (!teacher || !startDate || !scheduleEntries || scheduleEntries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: giáo viên, ngày khai giảng, và lịch học'
      });
    }

    if (!course) {
      return res.status(200).json({
        success: true,
        hasConflict: false,
        conflicts: {
          teacher: [],
          room: [],
          students: []
        },
        message: 'Chưa chọn course, không thể kiểm tra conflict'
      });
    }

    // Get course details to generate schedules
    const courseData = await Course.findById(course)
      .populate('sessions', 'order')
      .select('numberOfSessions sessions')
      .lean();
    
    if (!courseData || !courseData.numberOfSessions) {
      return res.status(200).json({
        success: true,
        hasConflict: false,
        conflicts: {
          teacher: [],
          room: [],
          students: []
        },
        message: 'Course không hợp lệ hoặc chưa có số buổi học'
      });
    }

    const numberOfSessions = courseData.numberOfSessions;
    const courseSessions = (courseData.sessions || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Helper function to convert day string to day of week number
    const getDayOfWeekNumber = (dayStr) => {
      const dayMap = {
        'CN': 0,
        '2': 1,
        '3': 2,
        '4': 3,
        '5': 4,
        '6': 5,
        '7': 6
      };
      return dayMap[dayStr] !== undefined ? dayMap[dayStr] : null;
    };
    
    // Helper function to find next occurrence of day of week
    const findNextDayOfWeek = (startDate, targetDayOfWeek) => {
      const start = new Date(startDate);
      const currentDay = start.getDay();
      let daysToAdd = (targetDayOfWeek - currentDay + 7) % 7;
      if (daysToAdd === 0 && start.getTime() < new Date().getTime()) {
        daysToAdd = 7;
      }
      const result = new Date(start);
      result.setDate(start.getDate() + daysToAdd);
      return result;
    };
    
    // Find first occurrence of each day of week
    const firstOccurrences = {};
    scheduleEntries.forEach(entry => {
      const dayOfWeek = getDayOfWeekNumber(entry.day);
      if (dayOfWeek !== null && !firstOccurrences[dayOfWeek]) {
        firstOccurrences[dayOfWeek] = findNextDayOfWeek(startDate, dayOfWeek);
      }
    });
    
    // Generate ClassSchedule entries (same logic as createClass)
    const classSchedules = [];
    let entryIndex = 0;
    let weekOffset = 0;
    
    for (let i = 0; i < numberOfSessions; i++) {
      const entry = scheduleEntries[entryIndex % scheduleEntries.length];
      const dayOfWeek = getDayOfWeekNumber(entry.day);
      
      if (dayOfWeek === null) {
        entryIndex++;
        continue;
      }
      
      // Get the first occurrence of this day
      const firstOccurrence = firstOccurrences[dayOfWeek];
      
      // Calculate the date for this session
      const sessionDate = new Date(firstOccurrence);
      sessionDate.setDate(firstOccurrence.getDate() + (weekOffset * 7));
      
      // Get corresponding session from course (by order, starting from 0)
      const sessionIndex = i < courseSessions.length ? i : i % courseSessions.length;
      const sessionId = courseSessions[sessionIndex]?._id || null;
      
      classSchedules.push({
        class: null, // No class ID yet since we're not creating the class
        session: sessionId,
        date: sessionDate,
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: room,
        teacher: teacher,
        reason: `Buổi học ${i + 1}`,
        status: 'fixed'
      });
      
      // Move to next entry (round-robin)
      entryIndex++;
      // If we've gone through all entries, move to next week
      if (entryIndex % scheduleEntries.length === 0) {
        weekOffset++;
      }
    }
    
    // Validate conflicts
    if (classSchedules.length > 0) {
      const classDataForValidation = {
        _id: null, // No class ID yet
        teacher: teacher,
        teacherId: teacher,
        students: students || []
      };
      
      const conflictResult = await validateClassSchedulesConflicts(classSchedules, classDataForValidation);
      
      return res.status(200).json({
        success: true,
        hasConflict: conflictResult.hasConflict,
        conflicts: {
          teacher: conflictResult.teacher || [],
          room: conflictResult.room || [],
          students: conflictResult.students || []
        },
        message: conflictResult.hasConflict 
          ? 'Có xung đột lịch học được phát hiện' 
          : 'Không có xung đột lịch học'
      });
    }
    
    return res.status(200).json({
      success: true,
      hasConflict: false,
      conflicts: {
        teacher: [],
        room: [],
        students: []
      },
      message: 'Không có schedules để kiểm tra'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra xung đột',
      error: error.message
    });
  }
};

exports.checkTeacherRoomConflicts = async (req, res) => {
  try {
    const { id: classId } = req.params;
    const { teacherId, roomId, scheduleEntries, startDate } = req.body;
    
    // Get class data to get course info
    const classData = await Class.findById(classId)
      .populate('course', 'numberOfSessions')
      .select('course startDate')
      .lean();
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học'
      });
    }
    
    // If no scheduleEntries provided, return empty conflicts
    if (!scheduleEntries || scheduleEntries.length === 0) {
      return res.status(200).json({
        success: true,
        teacherConflicts: [],
        roomConflicts: [],
        conflictingTeacherIds: [],
        conflictingRoomIds: [],
        message: 'Chưa có lịch học để kiểm tra'
      });
    }
    
    // Get course to determine numberOfSessions
    const courseId = classData.course?._id || classData.course;
    if (!courseId) {
      return res.status(200).json({
        success: true,
        teacherConflicts: [],
        roomConflicts: [],
        conflictingTeacherIds: [],
        conflictingRoomIds: [],
        message: 'Lớp học chưa có course'
      });
    }
    
    const courseData = await Course.findById(courseId)
      .populate('sessions', 'order')
      .select('numberOfSessions sessions')
      .lean();
    
    if (!courseData || !courseData.numberOfSessions) {
      return res.status(200).json({
        success: true,
        teacherConflicts: [],
        roomConflicts: [],
        conflictingTeacherIds: [],
        conflictingRoomIds: [],
        message: 'Course không hợp lệ hoặc chưa có số buổi học'
      });
    }
    
    const numberOfSessions = courseData.numberOfSessions;
    const courseSessions = (courseData.sessions || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    const finalStartDate = startDate || classData.startDate;
    
    if (!finalStartDate) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin ngày khai giảng'
      });
    }
    
    // Helper function to convert day string to day of week number
    const getDayOfWeekNumber = (dayStr) => {
      const dayMap = {
        'CN': 0,
        '2': 1,
        '3': 2,
        '4': 3,
        '5': 4,
        '6': 5,
        '7': 6
      };
      return dayMap[dayStr] !== undefined ? dayMap[dayStr] : null;
    };
    
    // Helper function to find next occurrence of day of week
    const findNextDayOfWeek = (startDate, targetDayOfWeek) => {
      const start = new Date(startDate);
      const currentDay = start.getDay();
      let daysToAdd = (targetDayOfWeek - currentDay + 7) % 7;
      if (daysToAdd === 0 && start.getTime() < new Date().getTime()) {
        daysToAdd = 7;
      }
      const result = new Date(start);
      result.setDate(start.getDate() + daysToAdd);
      return result;
    };
    
    // Find first occurrence of each day of week
    const firstOccurrences = {};
    scheduleEntries.forEach(entry => {
      const dayOfWeek = getDayOfWeekNumber(entry.day);
      if (dayOfWeek !== null && !firstOccurrences[dayOfWeek]) {
        firstOccurrences[dayOfWeek] = findNextDayOfWeek(finalStartDate, dayOfWeek);
      }
    });
    
    // Generate ClassSchedule entries
    const classSchedules = [];
    let entryIndex = 0;
    let weekOffset = 0;
    
    for (let i = 0; i < numberOfSessions; i++) {
      const entry = scheduleEntries[entryIndex % scheduleEntries.length];
      const dayOfWeek = getDayOfWeekNumber(entry.day);
      
      if (dayOfWeek === null) {
        entryIndex++;
        continue;
      }
      
      // Get the first occurrence of this day
      const firstOccurrence = firstOccurrences[dayOfWeek];
      
      // Calculate the date for this session
      const sessionDate = new Date(firstOccurrence);
      sessionDate.setDate(firstOccurrence.getDate() + (weekOffset * 7));
      
      classSchedules.push({
        class: classId,
        date: sessionDate,
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: roomId,
        teacher: teacherId,
        status: 'fixed'
      });
      
      // Move to next entry (round-robin)
      entryIndex++;
      // If we've gone through all entries, move to next week
      if (entryIndex % scheduleEntries.length === 0) {
        weekOffset++;
      }
    }
    
    console.log('  - Đã tạo', classSchedules.length, 'buổi học để kiểm tra');
    
    // Validate conflicts (only teacher and room, not students)
    if (classSchedules.length > 0) {
      const classDataForValidation = {
        _id: classId, // Exclude current class from conflicts
        teacher: teacherId,
        teacherId: teacherId,
        students: [] // Don't check student conflicts here
      };
      
      const conflictResult = await validateClassSchedulesConflicts(classSchedules, classDataForValidation);
      
      console.log('  - Kết quả kiểm tra:');
      console.log('    + Teacher conflicts:', conflictResult.teacher?.length || 0);
      console.log('    + Room conflicts:', conflictResult.room?.length || 0);
      console.log('  ============================================\n');
      
      // Format conflicts for frontend
      const teacherConflicts = (conflictResult.teacher || []).map(c => ({
        teacherId: c.teacherId || teacherId?.toString() || '',
        className: c.className || 'N/A',
        date: c.date || c.newScheduleDate || '',
        time: c.time || '',
        conflictingTime: c.conflictingTime || ''
      }));
      
      const roomConflicts = (conflictResult.room || []).map(c => ({
        roomId: c.roomId || roomId?.toString() || '',
        className: c.className || 'N/A',
        date: c.date || c.newScheduleDate || '',
        time: c.time || '',
        conflictingTime: c.conflictingTime || ''
      }));
      
      const conflictingTeacherIds = teacherConflicts.length > 0 && teacherId
        ? [teacherId.toString()]
        : [];
      
      const conflictingRoomIds = roomConflicts.length > 0 && roomId
        ? [roomId.toString()]
        : [];
      
      return res.status(200).json({
        success: true,
        teacherConflicts,
        roomConflicts,
        conflictingTeacherIds,
        conflictingRoomIds,
        message: conflictResult.hasConflict
          ? 'Có xung đột lịch học được phát hiện'
          : 'Không có xung đột lịch học'
      });
    }
    
    return res.status(200).json({
      success: true,
      teacherConflicts: [],
      roomConflicts: [],
      conflictingTeacherIds: [],
      conflictingRoomIds: [],
      message: 'Không có schedules để kiểm tra'
    });
  } catch (error) {
    console.error(' Lỗi khi kiểm tra conflict teacher/room:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra xung đột',
      error: error.message
    });
  }
};

exports.createClass = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { name, course, teacher, students, room, startDate, endDate, maxStudents, status, scheduleEntries } = req.body;
    
    if (!name) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin tên lớp'
      });
    }
    
    // Check if class name exists
    const existingClass = await Class.findOne({ name }).session(session);
    if (existingClass) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Tên lớp học đã tồn tại'
      });
    }
    
    // Validate room capacity if room is provided and auto-set maxStudents
    let finalMaxStudents = maxStudents;
    if (room) {
      const roomData = await Room.findById(room).session(session);
      if (!roomData) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng học'
        });
      }
      
      const studentCount = (students || []).length;
      if (studentCount > roomData.capacity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Số học viên (${studentCount}) vượt quá sức chứa của phòng (${roomData.capacity} học viên)`
        });
      }
      
      // Auto-set maxStudents from room capacity if not provided
      if (!maxStudents || maxStudents === null || maxStudents === undefined) {
        finalMaxStudents = roomData.capacity;
      }
    } else {
      // No room selected, don't set maxStudents
      finalMaxStudents = undefined;
    }
    
    const newClass = new Class({
      name,
      course,
      teacher,
      teacherId: teacher, // Set teacherId to match teacher for consistency
      students: students || [],
      room,
      startDate,
      endDate,
      maxStudents: finalMaxStudents,
      status: status || 'pending'
    });
    
    await newClass.save({ session });
    
    // Generate ClassSchedule entries if scheduleEntries and course are provided
    if (scheduleEntries && scheduleEntries.length > 0 && course && startDate) {
      // Get course details including numberOfSessions and sessions
      const courseData = await Course.findById(course)
        .populate('sessions', 'order')
        .select('numberOfSessions sessions')
        .session(session);
      
      if (courseData && courseData.numberOfSessions) {
        const numberOfSessions = courseData.numberOfSessions;
        // Sort sessions by order to ensure correct mapping
        const courseSessions = (courseData.sessions || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Helper function to convert day string to day of week number
        const getDayOfWeekNumber = (dayStr) => {
          const dayMap = {
            'CN': 0,
            '2': 1,
            '3': 2,
            '4': 3,
            '5': 4,
            '6': 5,
            '7': 6
          };
          return dayMap[dayStr] !== undefined ? dayMap[dayStr] : null;
        };
        
        // Helper function to find next occurrence of day of week
        const findNextDayOfWeek = (startDate, targetDayOfWeek) => {
          const start = new Date(startDate);
          const currentDay = start.getDay();
          let daysToAdd = (targetDayOfWeek - currentDay + 7) % 7;
          if (daysToAdd === 0 && start.getTime() < new Date().getTime()) {
            daysToAdd = 7;
          }
          const result = new Date(start);
          result.setDate(start.getDate() + daysToAdd);
          return result;
        };
        
        // Find first occurrence of each day of week
        const firstOccurrences = {};
        scheduleEntries.forEach(entry => {
          const dayOfWeek = getDayOfWeekNumber(entry.day);
          if (dayOfWeek !== null && !firstOccurrences[dayOfWeek]) {
            firstOccurrences[dayOfWeek] = findNextDayOfWeek(startDate, dayOfWeek);
          }
        });
        
        // Generate ClassSchedule entries
        const classSchedules = [];
        let entryIndex = 0;
        let weekOffset = 0;
        
        for (let i = 0; i < numberOfSessions; i++) {
          const entry = scheduleEntries[entryIndex % scheduleEntries.length];
          const dayOfWeek = getDayOfWeekNumber(entry.day);
          
          if (dayOfWeek === null) {
            entryIndex++;
            continue;
          }
          
          // Get the first occurrence of this day
          const firstOccurrence = firstOccurrences[dayOfWeek];
          
          // Calculate the date for this session
          const sessionDate = new Date(firstOccurrence);
          sessionDate.setDate(firstOccurrence.getDate() + (weekOffset * 7));
          
          // Get corresponding session from course (by order, starting from 0)
          const sessionIndex = i < courseSessions.length ? i : i % courseSessions.length;
          const sessionId = courseSessions[sessionIndex]?._id || null;
          
          classSchedules.push({
            class: newClass._id,
            session: sessionId,
            date: sessionDate,
            startTime: entry.startTime,
            endTime: entry.endTime,
            room: room,
            teacher: teacher,
            createdBy: req.user?._id || teacher, // Use logged in user or teacher as fallback
            reason: `Buổi học ${i + 1}`,
            status: 'fixed'
          });
          
          // Move to next entry (round-robin)
          entryIndex++;
          // If we've gone through all entries, move to next week
          if (entryIndex % scheduleEntries.length === 0) {
            weekOffset++;
          }
        }
        
        // Validate conflicts before creating schedules
        if (classSchedules.length > 0) {
          const classDataForValidation = {
            _id: newClass._id,
            teacher: teacher,
            teacherId: teacher,
            students: students || []
          };
          
          const conflictResult = await validateClassSchedulesConflicts(classSchedules, classDataForValidation);
          
          if (conflictResult.hasConflict) {
            await session.abortTransaction();
            session.endSession();
            
            // Format detailed error message
            let errorMessages = [];
            
            if (conflictResult.teacher && conflictResult.teacher.length > 0) {
              const teacherConflicts = conflictResult.teacher.map(c => 
                `  - Ngày ${c.date}: Giáo viên đã có lớp "${c.className}" học từ ${c.time}, trùng với lịch mới ${c.conflictingTime}`
              ).join('\n');
              errorMessages.push(`Xung đột lịch giáo viên:\n${teacherConflicts}`);
            }
            
            if (conflictResult.room && conflictResult.room.length > 0) {
              const roomConflicts = conflictResult.room.map(c => 
                `  - Ngày ${c.date}: Phòng học đã được lớp "${c.className}" sử dụng từ ${c.time}, trùng với lịch mới ${c.conflictingTime}`
              ).join('\n');
              errorMessages.push(`Xung đột phòng học:\n${roomConflicts}`);
            }
            
            if (conflictResult.students && conflictResult.students.length > 0) {
              const studentConflicts = conflictResult.students.map(studentConflict => {
                const conflicts = studentConflict.conflicts.map(c => 
                  `    + Ngày ${c.date}: Lớp "${c.className}" từ ${c.time}, trùng với lịch mới ${c.conflictingTime}`
                ).join('\n');
                return `  - Học viên "${studentConflict.studentName}":\n${conflicts}`;
              }).join('\n');
              errorMessages.push(`Xung đột lịch học viên:\n${studentConflicts}`);
            }
            
            return res.status(400).json({
              success: false,
              message: 'Không thể tạo lớp học do có xung đột lịch học',
              conflicts: {
                teacher: conflictResult.teacher,
                room: conflictResult.room,
                students: conflictResult.students
              },
              details: errorMessages.join('\n\n')
            });
          }
          
          // Create all ClassSchedule entries
          const createdSchedules = await ClassSchedule.insertMany(classSchedules, { session });
          
          // Create StudentSchedule entries for each ClassSchedule
          if (students && students.length > 0) {
            const studentSchedules = [];
            createdSchedules.forEach(schedule => {
              students.forEach(studentId => {
                studentSchedules.push({
                  student: studentId,
                  classSchedule: schedule._id,
                  // Không set attendance - để null cho đến khi giáo viên điểm danh
                });
              });
            });
            
            if (studentSchedules.length > 0) {
              await StudentSchedule.insertMany(studentSchedules, { session });
            }
          }
        }
      }
    }
    
    // Commit transaction before populating (populate doesn't need to be in transaction)
    await session.commitTransaction();
    session.endSession();

    // Auto active Course và Program khi tạo class mới
    if (course) {
      try {
        // Cập nhật Course: status = 'active', isActive = true
        const updatedCourse = await Course.findByIdAndUpdate(
          course,
          {
            status: 'active',
            isActive: true
          },
          { new: true }
        );

        // Cập nhật Program: isActive = true nếu course thuộc program
        if (updatedCourse?.program) {
          await Program.findByIdAndUpdate(
            updatedCourse.program,
            { isActive: true }
          );
        }
      } catch (activationError) {
        // Log lỗi nhưng không fail request vì class đã được tạo thành công
        console.error('Error activating course/program:', activationError);
      }
    }

    const populatedClass = await Class.findById(newClass._id)
      .populate('teacher', 'username email phone')
      .populate('students', 'username email')
      .populate('room', 'room_name location capacity')
      .populate({
        path: 'course',
        select: 'name status isActive',
        populate: { path: 'program', select: 'program_name name level band tuitionFee type isActive' }
      });

    res.status(201).json({
      success: true,
      message: 'Tạo lớp học thành công',
      class: populatedClass
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo lớp học',
      error: error.message
    });
  }
};
/**
 * Normalize schedule entries for comparison
 * Sorts by day and time, normalizes time format
 */
const normalizeScheduleEntries = (scheduleEntries) => {
  if (!scheduleEntries || scheduleEntries.length === 0) return [];
  
  return scheduleEntries
    .filter(entry => entry.day && entry.startTime && entry.endTime)
    .map(entry => ({
      day: entry.day,
      startTime: entry.startTime.trim(),
      endTime: entry.endTime.trim()
    }))
    .sort((a, b) => {
      // Sort by day first (CN=0, 2=1, ..., 7=6)
      const dayMap = { 'CN': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6 };
      const dayA = dayMap[a.day] !== undefined ? dayMap[a.day] : 99;
      const dayB = dayMap[b.day] !== undefined ? dayMap[b.day] : 99;
      if (dayA !== dayB) return dayA - dayB;
      // Then by startTime
      return a.startTime.localeCompare(b.startTime);
    });
};

/**
 * Extract schedule pattern from existing ClassSchedule entries
 * Groups by day of week and time slot
 */
const extractSchedulePatternFromClassSchedules = (classSchedules) => {
  if (!classSchedules || classSchedules.length === 0) return [];
  
  const scheduleMap = new Map();
  const dayNames = ['CN', '2', '3', '4', '5', '6', '7'];
  
  classSchedules.forEach(schedule => {
    if (!schedule.date || !schedule.startTime || !schedule.endTime) return;
    
    const date = new Date(schedule.date);
    if (isNaN(date.getTime())) return;
    
    const dayOfWeek = date.getDay();
    const day = dayNames[dayOfWeek];
    const startTime = schedule.startTime.trim();
    const endTime = schedule.endTime.trim();
    
    const key = `${day}-${startTime}-${endTime}`;
    if (!scheduleMap.has(key)) {
      scheduleMap.set(key, { day, startTime, endTime });
    }
  });
  
  return normalizeScheduleEntries(Array.from(scheduleMap.values()));
};

/**
 * Compare two schedule entry arrays
 * Returns true if they are different
 */
const compareScheduleEntries = (oldEntries, newEntries) => {
  const normalizedOld = normalizeScheduleEntries(oldEntries);
  const normalizedNew = normalizeScheduleEntries(newEntries);
  
  if (normalizedOld.length !== normalizedNew.length) return true;
  
  for (let i = 0; i < normalizedOld.length; i++) {
    const old = normalizedOld[i];
    const new_ = normalizedNew[i];
    if (old.day !== new_.day || old.startTime !== new_.startTime || old.endTime !== new_.endTime) {
      return true;
    }
  }
  
  return false;
};

exports.updateClass = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { name, course, teacher, students, room, startDate, endDate, maxStudents, status, scheduleEntries } = req.body;
    
    const classData = await Class.findById(req.params.id).session(session);
    if (!classData) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học'
      });
    }
    
    // ============================================
    // NEW LOGIC: Handle Active vs Pending Class Updates
    // ============================================
    console.log(' [NEW UPDATE LOGIC] Class status:', classData.status);

    if (classData.status === 'active') {
      console.log(' → Routing to handleActiveClassUpdate');
      const result = await handleActiveClassUpdate(classData, req.body, session);

      if (!result.success) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json(result);
      }

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json(result);
    }

    // For pending class, use new handler as well
    if (classData.status === 'pending') {
      console.log(' → Routing to handlePendingClassUpdate');
      const result = await handlePendingClassUpdate(classData, req.body, session);

      if (!result.success) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json(result);
      }

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json(result);
    }

    // For other statuses (completed, cancelled), use old logic below
    console.log(' → Using legacy update logic for status:', classData.status);
    // ============================================
    
    // Capture old students list before it gets modified
    const oldStudentsList = classData.students ? [...classData.students] : [];
    
    // Check name conflict
    if (name && name !== classData.name) {
      const existingClass = await Class.findOne({ 
        name, 
        _id: { $ne: req.params.id } 
      }).session(session);
      if (existingClass) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Tên lớp học đã tồn tại'
        });
      }
    }
    
    // Determine final room and students for validation
    const finalRoom = room !== undefined ? room : classData.room;
    const finalStudents = students !== undefined ? students : classData.students;
    
    // Validate room capacity if room is provided and auto-set maxStudents
    let finalMaxStudents = maxStudents;
    if (finalRoom) {
      const roomData = await Room.findById(finalRoom).session(session);
      if (!roomData) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng học'
        });
      }
      
      const studentCount = (finalStudents || []).length;
      if (studentCount > roomData.capacity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Số học viên (${studentCount}) vượt quá sức chứa của phòng (${roomData.capacity} học viên)`
        });
      }
      
      // Auto-set maxStudents from room capacity if not provided
      if (maxStudents === undefined || maxStudents === null) {
        finalMaxStudents = roomData.capacity;
      }
    } else if (room === null || room === '') {
      // Room explicitly cleared, clear maxStudents
      finalMaxStudents = null;
    }
    // If room is undefined (not provided in request), keep existing maxStudents
    
    // Validate student enrollment in course
    // Determine final course (could be new course or existing course)
    const finalCourseId = course || classData.course;
    
    // Only validate if course exists and students are being added/updated
    if (finalCourseId && students !== undefined) {
      // Find newly added students (compare with old students list)
      const oldStudentIds = (oldStudentsList || []).map(id => id.toString());
      const newStudentIds = (students || []).map(id => id.toString());
      const newlyAddedStudentIds = newStudentIds.filter(id => !oldStudentIds.includes(id));
      
      // If there are newly added students, check their enrollment
      if (newlyAddedStudentIds.length > 0) {
        // Get course with studentEnrollments
        const courseData = await Course.findById(finalCourseId)
          .select('studentEnrollments name')
          .session(session)
          .lean();
        
        if (courseData) {
          // Get enrolled student IDs as strings for comparison
          const enrolledStudentIds = (courseData.studentEnrollments || []).map(id => id.toString());
          
          // Find students not enrolled in the course
          const notEnrolledStudentIds = newlyAddedStudentIds.filter(
            studentId => !enrolledStudentIds.includes(studentId)
          );
          
          // If there are students not enrolled, return error with details
          if (notEnrolledStudentIds.length > 0) {
            // Get student information for error message
            const studentInfo = await User.find({
              _id: { $in: notEnrolledStudentIds.map(id => new mongoose.Types.ObjectId(id)) }
            })
              .select('_id username fullName name email')
              .session(session)
              .lean();
            
            const invalidStudents = studentInfo.map(student => {
              const studentIdStr = student._id.toString();
              const studentName = student.fullName || student.name || student.username || student.email?.split('@')[0] || `Học viên ${studentIdStr}`;
              return {
                studentId: studentIdStr,
                studentName: studentName,
                reason: 'Học viên chưa có trong danh sách đăng ký khóa học'
              };
            });
            
            await session.abortTransaction();
            session.endSession();
            
            return res.status(400).json({
              success: false,
              message: 'Một số học viên chưa đăng ký khóa học',
              invalidStudents: invalidStudents,
              courseName: courseData.name || 'N/A'
            });
          }
        }
      }
    }
    
    // Check if course has changed
    const oldCourseId = classData.course?.toString();
    const newCourseId = course?.toString();
    const courseChanged = course && oldCourseId !== newCourseId;
    
    // Check if other schedule-related fields have changed
    const oldRoomId = classData.room?.toString();
    const newRoomId = room?.toString();
    const roomChanged = room !== undefined && oldRoomId !== newRoomId;
    
    const oldTeacherId = classData.teacher?.toString();
    const newTeacherId = teacher?.toString();
    const teacherChanged = teacher && oldTeacherId !== newTeacherId;
    
    const oldStartDate = classData.startDate ? new Date(classData.startDate).toISOString().split('T')[0] : null;
    const newStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : null;
    const startDateChanged = startDate && oldStartDate !== newStartDate;
    
    // Check if scheduleEntries have changed (if provided)
    // First, get existing ClassSchedules to extract current schedule pattern
    const existingClassSchedules = await ClassSchedule.find({ class: req.params.id })
      .select('_id date startTime endTime')
      .sort({ date: 1 })
      .session(session)
      .lean();
    
    console.log(' [DEBUG] Existing schedules count:', existingClassSchedules.length);
    
    const oldSchedulePattern = extractSchedulePatternFromClassSchedules(existingClassSchedules);
    const newSchedulePattern = scheduleEntries && scheduleEntries.length > 0 
      ? normalizeScheduleEntries(scheduleEntries) 
      : [];
    
    console.log(' [DEBUG] Old schedule pattern:', JSON.stringify(oldSchedulePattern, null, 2));
    console.log(' [DEBUG] New schedule pattern:', JSON.stringify(newSchedulePattern, null, 2));
    
    // Check if students changed
    const oldStudents = (oldStudentsList || []).map(id => id.toString()).sort();
    const newStudents = (students !== undefined ? students : oldStudentsList || []).map(id => id.toString()).sort();
    const studentsChanged = students !== undefined && JSON.stringify(oldStudents) !== JSON.stringify(newStudents);
    
    // Check if only scheduleEntries changed (without changing room/teacher/startDate/students)
    const scheduleEntriesChanged = compareScheduleEntries(oldSchedulePattern, newSchedulePattern);
    const scheduleEntriesOnlyChanged = newSchedulePattern.length > 0 && 
      !courseChanged && 
      !roomChanged && 
      !teacherChanged && 
      !startDateChanged &&
      !studentsChanged &&
      scheduleEntriesChanged;
    
    const scheduleEntriesProvided = scheduleEntries && scheduleEntries.length > 0;
    
    console.log(' [DEBUG] Change flags:', {
      courseChanged,
      roomChanged,
      teacherChanged,
      startDateChanged,
      studentsChanged,
      scheduleEntriesChanged,
      scheduleEntriesProvided,
      scheduleEntriesOnlyChanged
    });
    
    // Determine if we need to regenerate schedules
    // Regenerate if: course changed, OR (scheduleEntries provided AND any schedule-related field changed)
    // OR if only scheduleEntries changed (will use smart update)
    const shouldRegenerateSchedules = courseChanged || 
      (scheduleEntriesProvided && (roomChanged || teacherChanged || startDateChanged));
    
    console.log(' [DEBUG] shouldRegenerateSchedules:', shouldRegenerateSchedules);
    
    // Determine final values for schedule generation
    const finalCourse = course || classData.course;
    const finalStartDate = startDate || classData.startDate;
    const finalRoomId = room !== undefined ? room : classData.room;
    const finalTeacher = teacher || classData.teacher;
    const finalStudentsList = students !== undefined ? students : classData.students;
    
    // Smart update: UPDATE future schedules when only scheduleEntries changed (keep IDs, don't delete/create)
    if (scheduleEntriesOnlyChanged && scheduleEntries && scheduleEntries.length > 0 && finalCourse && finalStartDate) {
      console.log(' [DEBUG] Entering SMART UPDATE block - UPDATE future schedules (keep IDs)');
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      
      // Separate past and future schedules
      const pastSchedules = existingClassSchedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        return scheduleDate < today;
      });
      
      // Get future schedules (sorted by date) - these will be UPDATED, not deleted
      const futureSchedules = existingClassSchedules
        .filter(schedule => {
          const scheduleDate = new Date(schedule.date);
          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate >= today;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (futureSchedules.length === 0) {
        console.log(' [DEBUG] No future schedules to update');
      } else {
        console.log(` [DEBUG] Found ${futureSchedules.length} future schedules to update`);
        
        // Get course details to determine sessions
        const courseData = await Course.findById(finalCourse)
          .populate('sessions', 'order')
          .select('numberOfSessions sessions')
          .session(session);
        
        if (courseData && courseData.numberOfSessions) {
          const courseSessions = (courseData.sessions || []).sort((a, b) => (a.order || 0) - (b.order || 0));
          const pastSessionsCount = pastSchedules.length;
          
          // Helper functions
          const getDayOfWeekNumber = (dayStr) => {
            const dayMap = {
              'CN': 0,
              '2': 1,
              '3': 2,
              '4': 3,
              '5': 4,
              '6': 5,
              '7': 6
            };
            return dayMap[dayStr] !== undefined ? dayMap[dayStr] : null;
          };
          
          const findNextDayOfWeek = (startDate, targetDayOfWeek) => {
            const start = new Date(startDate);
            const currentDay = start.getDay();
            let daysToAdd = (targetDayOfWeek - currentDay + 7) % 7;
            if (daysToAdd === 0 && start.getTime() < new Date().getTime()) {
              daysToAdd = 7;
            }
            const result = new Date(start);
            result.setDate(start.getDate() + daysToAdd);
            return result;
          };
          
          // Determine start date for new pattern
          let startDateForNewSchedules = finalStartDate;
          if (pastSchedules.length > 0) {
            const latestPastDate = new Date(Math.max(...pastSchedules.map(s => new Date(s.date).getTime())));
            startDateForNewSchedules = new Date(latestPastDate);
            startDateForNewSchedules.setDate(latestPastDate.getDate() + 1);
          }
          // Ensure we don't start before today
          if (startDateForNewSchedules < today) {
            startDateForNewSchedules = new Date(today);
          }
          
          // Find first occurrence of each day of week from start date
          const firstOccurrences = {};
          scheduleEntries.forEach(entry => {
            const dayOfWeek = getDayOfWeekNumber(entry.day);
            if (dayOfWeek !== null && !firstOccurrences[dayOfWeek]) {
              firstOccurrences[dayOfWeek] = findNextDayOfWeek(startDateForNewSchedules, dayOfWeek);
            }
          });
          
          // Map future schedules to new pattern and prepare updates
          let entryIndex = 0;
          let weekOffset = 0;
          const updatePromises = [];
          
          for (let i = 0; i < futureSchedules.length; i++) {
            const oldSchedule = futureSchedules[i];
            const entry = scheduleEntries[entryIndex % scheduleEntries.length];
            const dayOfWeek = getDayOfWeekNumber(entry.day);
            
            if (dayOfWeek !== null) {
              // Calculate new date based on pattern
              const firstOccurrence = firstOccurrences[dayOfWeek];
              const newDate = new Date(firstOccurrence);
              newDate.setDate(firstOccurrence.getDate() + (weekOffset * 7));
              // Set time to 00:00:00 to ensure correct date format
              newDate.setHours(0, 0, 0, 0);
              
              // Determine new session (continue from where we left off)
              const sessionIndex = (pastSessionsCount + i) < courseSessions.length 
                ? (pastSessionsCount + i) 
                : (pastSessionsCount + i) % courseSessions.length;
              const newSessionId = courseSessions[sessionIndex]?._id || null;
              
              // Log before update
              const oldDateStr = new Date(oldSchedule.date).toISOString().split('T')[0];
              const newDateStr = newDate.toISOString().split('T')[0];
              console.log(` [DEBUG] Updating schedule ${oldSchedule._id}:`);
              console.log(`   - Old date: ${oldDateStr} ${oldSchedule.startTime}-${oldSchedule.endTime}`);
              console.log(`   - New date: ${newDateStr} ${entry.startTime}-${entry.endTime}`);
              console.log(`   - New session: ${newSessionId}`);
              
              // Use findByIdAndUpdate instead of updateOne to ensure update works
              const updatePromise = ClassSchedule.findByIdAndUpdate(
                oldSchedule._id,
                {
                  $set: {
                    date: newDate,
                    startTime: entry.startTime,
                    endTime: entry.endTime,
                    session: newSessionId
                  }
                },
                { new: false } // Don't return updated doc, just update
              ).session(session);
              
              updatePromises.push(updatePromise);
            }
            
            // Move to next entry (round-robin)
            entryIndex++;
            // If we've gone through all entries, move to next week
            if (entryIndex % scheduleEntries.length === 0) {
              weekOffset++;
            }
          }
          
          // Execute all updates
          if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
            console.log(` [DEBUG] Updated ${updatePromises.length} future schedules (kept IDs, no deletion)`);
          }
        } else {
          console.log(' [DEBUG] Course data not found or invalid');
        }
      }
    }
    // If schedules need to be regenerated (full regeneration), delete old ClassSchedules and related data
    // Only delete if scheduleEntries are provided to ensure new schedules will be created
    // This prevents leaving the class without schedules when only course changes without scheduleEntries
    else if (shouldRegenerateSchedules && scheduleEntries && scheduleEntries.length > 0 && finalCourse && finalStartDate) {
      console.log(' [DEBUG] Entering FULL REGENERATION block');
      // Find all ClassSchedules for this class
      const classSchedules = await ClassSchedule.find({ class: req.params.id }).session(session).select('_id');
      const classScheduleIds = classSchedules.map(schedule => schedule._id);
      
      // Delete in cascade order:
      // 1. Delete HomeworkSubmissions (references ClassSchedule)
      if (classScheduleIds.length > 0) {
        await HomeworkSubmission.deleteMany(
          { classSchedule: { $in: classScheduleIds } }
        ).session(session);
        
        // 2. Delete StudentSchedules (references ClassSchedule)
        await StudentSchedule.deleteMany(
          { classSchedule: { $in: classScheduleIds } }
        ).session(session);
        
        // 3. Delete ClassSchedules (references Class)
        await ClassSchedule.deleteMany(
          { class: req.params.id }
        ).session(session);
      }
    } else if (shouldRegenerateSchedules && (!scheduleEntries || scheduleEntries.length === 0)) {
      // If course changed but scheduleEntries not provided, warn but don't delete schedules
      // This prevents data loss - old schedules remain until new scheduleEntries are provided
      console.log(' [WARNING] Course changed but scheduleEntries not provided. Old schedules will be kept.');
    }
    
    // Update fields
    if (name) classData.name = name;
    if (course) classData.course = course;
    if (teacher) {
      classData.teacher = teacher;
      classData.teacherId = teacher; // Set teacherId to match teacher for consistency
    }
    if (room !== undefined) classData.room = room;
    if (students !== undefined) classData.students = students;
    if (startDate) classData.startDate = startDate;
    if (endDate) classData.endDate = endDate;
    if (finalMaxStudents !== undefined) classData.maxStudents = finalMaxStudents;
    if (status) classData.status = status;
    
    await classData.save({ session });
    
    // Create new ClassSchedules when schedules need to be regenerated and scheduleEntries are provided
    // (Only if not already handled by smart update above)
    if (shouldRegenerateSchedules && !scheduleEntriesOnlyChanged && scheduleEntries && scheduleEntries.length > 0 && finalCourse && finalStartDate) {
      console.log(' [DEBUG] Entering CREATE NEW SCHEDULES block (full regeneration)');
      // Get course details including numberOfSessions and sessions
      const courseData = await Course.findById(finalCourse)
        .populate('sessions', 'order')
        .select('numberOfSessions sessions')
        .session(session);
      
      if (courseData && courseData.numberOfSessions) {
        const numberOfSessions = courseData.numberOfSessions;
        // Sort sessions by order to ensure correct mapping
        const courseSessions = (courseData.sessions || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Helper function to convert day string to day of week number
        const getDayOfWeekNumber = (dayStr) => {
          const dayMap = {
            'CN': 0,
            '2': 1,
            '3': 2,
            '4': 3,
            '5': 4,
            '6': 5,
            '7': 6
          };
          return dayMap[dayStr] !== undefined ? dayMap[dayStr] : null;
        };
        
        // Helper function to find next occurrence of day of week
        const findNextDayOfWeek = (startDate, targetDayOfWeek) => {
          const start = new Date(startDate);
          const currentDay = start.getDay();
          let daysToAdd = (targetDayOfWeek - currentDay + 7) % 7;
          if (daysToAdd === 0 && start.getTime() < new Date().getTime()) {
            daysToAdd = 7;
          }
          const result = new Date(start);
          result.setDate(start.getDate() + daysToAdd);
          return result;
        };
        
        // Find first occurrence of each day of week
        const firstOccurrences = {};
        scheduleEntries.forEach(entry => {
          const dayOfWeek = getDayOfWeekNumber(entry.day);
          if (dayOfWeek !== null && !firstOccurrences[dayOfWeek]) {
            firstOccurrences[dayOfWeek] = findNextDayOfWeek(finalStartDate, dayOfWeek);
          }
        });
        
        // Generate ClassSchedule entries
        const classSchedules = [];
        let entryIndex = 0;
        let weekOffset = 0;
        
        for (let i = 0; i < numberOfSessions; i++) {
          const entry = scheduleEntries[entryIndex % scheduleEntries.length];
          const dayOfWeek = getDayOfWeekNumber(entry.day);
          
          if (dayOfWeek === null) {
            entryIndex++;
            continue;
          }
          
          // Get the first occurrence of this day
          const firstOccurrence = firstOccurrences[dayOfWeek];
          
          // Calculate the date for this session
          const sessionDate = new Date(firstOccurrence);
          sessionDate.setDate(firstOccurrence.getDate() + (weekOffset * 7));
          
          // Get corresponding session from course (by order, starting from 0)
          const sessionIndex = i < courseSessions.length ? i : i % courseSessions.length;
          const sessionId = courseSessions[sessionIndex]?._id || null;
          
          classSchedules.push({
            class: classData._id,
            session: sessionId,
            date: sessionDate,
            startTime: entry.startTime,
            endTime: entry.endTime,
            room: finalRoomId,
            teacher: finalTeacher,
            createdBy: req.user?._id || finalTeacher, // Use logged in user or teacher as fallback
            reason: `Buổi học ${i + 1}`,
            status: 'fixed'
          });
          
          // Move to next entry (round-robin)
          entryIndex++;
          // If we've gone through all entries, move to next week
          if (entryIndex % scheduleEntries.length === 0) {
            weekOffset++;
          }
        }
        
        // Create all ClassSchedule entries
        if (classSchedules.length > 0) {
          console.log(' [DEBUG] Creating', classSchedules.length, 'new schedules in FULL REGENERATION');
          const createdSchedules = await ClassSchedule.insertMany(classSchedules, { session });
          
          // Create StudentSchedule entries for each ClassSchedule
          if (finalStudentsList && finalStudentsList.length > 0) {
            const studentSchedules = [];
            createdSchedules.forEach(schedule => {
              finalStudentsList.forEach(studentId => {
                studentSchedules.push({
                  student: studentId,
                  classSchedule: schedule._id,
                  // Không set attendance - để null cho đến khi giáo viên điểm danh
                });
              });
            });
            
            if (studentSchedules.length > 0) {
              await StudentSchedule.insertMany(studentSchedules, { session });
            }
          }
        } else {
          console.log(' [DEBUG] No new schedules to create in FULL REGENERATION');
        }
      } else {
        console.log(' [DEBUG] Course data not found or no numberOfSessions');
      }
    } else {
      console.log(' [DEBUG] Skipping schedule creation - conditions not met');
    }

    if (students !== undefined && !shouldRegenerateSchedules && !scheduleEntriesOnlyChanged) {
      console.log(' [DEBUG] Handling StudentSchedule changes for students only');
      
      // Get old and new student lists (use captured oldStudentsList before modification)
      const oldStudents = (oldStudentsList || []).map(id => id.toString());
      const newStudents = (students || []).map(id => id.toString());
      
      // Find students added and removed
      const addedStudents = newStudents.filter(id => !oldStudents.includes(id));
      const removedStudents = oldStudents.filter(id => !newStudents.includes(id));
      
      console.log(' [DEBUG] Students added:', addedStudents.length, addedStudents);
      console.log(' [DEBUG] Students removed:', removedStudents.length, removedStudents);

      const allClassSchedules = await ClassSchedule.find({ class: req.params.id })
        .session(session)
        .select('_id date');
      
      if (allClassSchedules.length > 0) {
        const classScheduleIds = allClassSchedules.map(s => s._id);

        if (removedStudents.length > 0) {
          const removedStudentIds = removedStudents.map(id => new mongoose.Types.ObjectId(id));
          const deleteResult = await StudentSchedule.deleteMany({
            student: { $in: removedStudentIds },
            classSchedule: { $in: classScheduleIds }
          }).session(session);
          console.log(` [DEBUG] Deleted ${deleteResult.deletedCount} StudentSchedule entries for removed students`);
        }
        
        if (addedStudents.length > 0) {

          console.log(' [DEBUG] Checking conflicts for added students:', addedStudents.length);

          const allClassSchedulesDetails = await ClassSchedule.find({ class: req.params.id })
            .session(session)
            .select('_id date startTime endTime')
            .lean();

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
          
          // Tìm tất cả lớp khác mà các học viên mới thêm vào đang tham gia
          const addedStudentIds = addedStudents.map(id => new mongoose.Types.ObjectId(id));
          const studentClasses = await Class.find({
            students: { $in: addedStudentIds },
            _id: { $ne: req.params.id }
          })
            .select('_id name students')
            .session(session)
            .lean();
          
          // Lấy thông tin học viên để hiển thị tên
          const studentInfo = await User.find({
            _id: { $in: addedStudentIds }
          })
            .select('_id username fullName name email')
            .session(session)
            .lean();
          
          const studentInfoMap = new Map();
          studentInfo.forEach(student => {
            const studentIdStr = student._id.toString();
            const studentName = student.fullName || student.name || student.username || student.email?.split('@')[0] || `Học viên ${studentIdStr}`;
            studentInfoMap.set(studentIdStr, studentName);
          });
          
          // Kiểm tra conflict cho từng học viên mới thêm vào
          const studentConflicts = [];
          
          if (studentClasses.length > 0) {
            const studentClassIds = studentClasses.map(c => c._id);
            
            // Lấy tất cả ClassSchedule của các lớp khác mà học viên đang tham gia
            const conflictingClassSchedules = await ClassSchedule.find({
              class: { $in: studentClassIds },
              status: { $in: ['temporary', 'fixed'] }
            })
              .populate('class', 'name')
              .select('date startTime endTime class')
              .session(session)
              .lean();
            
            // Kiểm tra conflict cho từng ClassSchedule của lớp hiện tại
            allClassSchedulesDetails.forEach(currentSchedule => {
              const currentDate = new Date(currentSchedule.date);
              currentDate.setHours(0, 0, 0, 0);
              const currentDateStr = formatDateLocal(currentDate);
              
              conflictingClassSchedules.forEach(conflictingSchedule => {
                const conflictingDate = new Date(conflictingSchedule.date);
                conflictingDate.setHours(0, 0, 0, 0);
                const conflictingDateStr = formatDateLocal(conflictingDate);
                
                // Kiểm tra cùng ngày và trùng giờ
                if (currentDateStr === conflictingDateStr && 
                    hasTimeOverlap(currentSchedule.startTime, currentSchedule.endTime, 
                                 conflictingSchedule.startTime, conflictingSchedule.endTime)) {
                  
                  // Tìm học viên nào trong lớp conflict cũng có trong danh sách học viên mới thêm
                  const conflictingClass = studentClasses.find(cls => 
                    cls._id.toString() === (conflictingSchedule.class?._id?.toString() || conflictingSchedule.class?.toString())
                  );
                  
                  if (conflictingClass) {
                    conflictingClass.students.forEach(studentIdInConflictClass => {
                      const studentIdStr = studentIdInConflictClass.toString();
                      if (addedStudentIds.some(id => id.toString() === studentIdStr)) {
                        const studentName = studentInfoMap.get(studentIdStr) || `Học viên ${studentIdStr}`;
                        
                        // Kiểm tra xem conflict này đã được thêm chưa
                        const existingConflict = studentConflicts.find(c => 
                          c.studentId === studentIdStr && 
                          c.conflictingClassId === conflictingClass._id.toString() &&
                          c.date === conflictingDateStr &&
                          c.time === `${conflictingSchedule.startTime} - ${conflictingSchedule.endTime}`
                        );
                        
                        if (!existingConflict) {
                          studentConflicts.push({
                            studentId: studentIdStr,
                            studentName: studentName,
                            conflictingClassId: conflictingClass._id.toString(),
                            conflictingClassName: conflictingSchedule.class?.name || conflictingClass.name || 'N/A',
                            date: conflictingDateStr,
                            time: `${conflictingSchedule.startTime} - ${conflictingSchedule.endTime}`,
                            conflictingTime: `${currentSchedule.startTime} - ${currentSchedule.endTime}`
                          });
                        }
                      }
                    });
                  }
                }
              });
            });
          }
          
          // Nếu có conflict, trả về lỗi
          if (studentConflicts.length > 0) {
            await session.abortTransaction();
            session.endSession();
            
            // Group conflicts by student
            const conflictsByStudent = new Map();
            studentConflicts.forEach(conflict => {
              if (!conflictsByStudent.has(conflict.studentId)) {
                conflictsByStudent.set(conflict.studentId, {
                  studentId: conflict.studentId,
                  studentName: conflict.studentName,
                  conflicts: []
                });
              }
              conflictsByStudent.get(conflict.studentId).conflicts.push({
                className: conflict.conflictingClassName,
                date: conflict.date,
                time: conflict.time,
                conflictingTime: conflict.conflictingTime
              });
            });
            
            const conflictsArray = Array.from(conflictsByStudent.values());
            
            const errorMessages = conflictsArray.map(studentConflict => {
              const conflicts = studentConflict.conflicts.map(c => 
                `    + Ngày ${c.date}: Lớp "${c.className}" từ ${c.time}, trùng với lịch lớp mới ${c.conflictingTime}`
              ).join('\n');
              return `  - Học viên "${studentConflict.studentName}":\n${conflicts}`;
            }).join('\n\n');
            
            return res.status(400).json({
              success: false,
              message: 'Không thể thêm học viên do có xung đột lịch học',
              conflicts: {
                students: conflictsArray
              },
              details: `Xung đột lịch học viên:\n${errorMessages}`
            });
          }
          
          // Không có conflict, tiếp tục tạo StudentSchedule
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Tạo StudentSchedule cho tất cả ClassSchedule hiện có
          const studentSchedules = [];
          
          for (const scheduleId of classScheduleIds) {
            for (const studentId of addedStudentIds) {
              // Check if StudentSchedule already exists (shouldn't, but safety check)
              const existing = await StudentSchedule.findOne({
                student: studentId,
                classSchedule: scheduleId
              }).session(session);
              
              if (!existing) {
                studentSchedules.push({
                  student: studentId,
                  classSchedule: scheduleId,
                  // Không set attendance - để null cho đến khi giáo viên điểm danh
                });
              }
            }
          }
          
          if (studentSchedules.length > 0) {
            await StudentSchedule.insertMany(studentSchedules, { session });
            console.log(` [DEBUG] Created ${studentSchedules.length} StudentSchedule entries for added students`);
          }
        }
      } else {
        console.log(' [DEBUG] No ClassSchedules found for this class, skipping StudentSchedule updates');
      }
    }
    
    // Commit transaction before populating (populate doesn't need to be in transaction)
    await session.commitTransaction();
    session.endSession();
    
    const updatedClass = await Class.findById(classData._id)
      .populate('teacher', 'username email phone')
      .populate('students', 'username email')
      .populate('room', 'room_name location capacity')
      .populate({ 
        path: 'course', 
        select: 'name',
        populate: { path: 'program', select: 'program_name name level band tuitionFee type' } 
      });
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật lớp học thành công',
      class: updatedClass
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật lớp học',
      error: error.message
    });
  }
};

exports.deleteClass = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const classId = req.params.id;
    
    // Check if class exists
    const classData = await Class.findById(classId).session(session);
    if (!classData) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học'
      });
    }
    
    // Only allow deletion of classes with "pending" status
    if (classData.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể xóa lớp học ở trạng thái "Chờ khai giảng". Lớp học này đang ở trạng thái "${classData.status === 'active' ? 'Đang học' : classData.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}"`
      });
    }
    
    // Find all ClassSchedules for this class
    const classSchedules = await ClassSchedule.find({ class: classId }).session(session).select('_id');
    const classScheduleIds = classSchedules.map(schedule => schedule._id);
    
    // Delete in cascade order:
    // 1. Delete HomeworkSubmissions (references ClassSchedule)
    if (classScheduleIds.length > 0) {
      const homeworkDeleteResult = await HomeworkSubmission.deleteMany(
        { classSchedule: { $in: classScheduleIds } }
      ).session(session);
      
      // 2. Delete StudentSchedules (references ClassSchedule)
      const studentScheduleDeleteResult = await StudentSchedule.deleteMany(
        { classSchedule: { $in: classScheduleIds } }
      ).session(session);
      
      // 3. Delete ClassSchedules (references Class)
      const scheduleDeleteResult = await ClassSchedule.deleteMany(
        { class: classId }
      ).session(session);
    }
    
    // 4. Finally, delete the Class
    await Class.findByIdAndDelete(classId).session(session);
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      message: 'Xóa lớp học và tất cả dữ liệu liên quan thành công'
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lớp học',
      error: error.message
    });
  }
};

// ============================================
// HELPER FUNCTIONS FOR NEW UPDATE LOGIC
// ============================================

/**
 * Phase 1: Conflict Checking Functions
 */

/**
 * Check teacher conflicts with given schedules
 * @param {ObjectId} teacherId - Teacher ID to check
 * @param {Array} schedules - Array of {date, startTime, endTime}
 * @param {ObjectId} excludeClassId - Current class ID to exclude
 * @returns {Promise<{hasConflict: boolean, conflicts: Array}>}
 */
const checkTeacherConflictsWithSchedules = async (teacherId, schedules, excludeClassId) => {
  const conflicts = [];

  if (!teacherId || !schedules || schedules.length === 0) {
    return { hasConflict: false, conflicts };
  }

  // Reuse existing helper
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

  // Get unique dates
  const uniqueDates = [...new Set(schedules.map(s => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d;
  }))];

  // Find all classes taught by this teacher
  const teacherQuery = {
    $or: [
      { teacher: teacherId },
      { teacherId: teacherId }
    ]
  };
  if (excludeClassId) {
    teacherQuery._id = { $ne: excludeClassId };
  }
  const teacherClasses = await Class.find(teacherQuery).select('_id name').lean();

  if (teacherClasses.length > 0) {
    const teacherClassIds = teacherClasses.map(c => c._id);

    // Query all teacher schedules
    const teacherSchedules = await ClassSchedule.find({
      class: { $in: teacherClassIds },
      date: { $in: uniqueDates },
      status: { $in: ['temporary', 'fixed'] }
    })
      .populate('class', 'name')
      .select('date startTime endTime class')
      .lean();

    schedules.forEach(newSchedule => {
      const scheduleDate = new Date(newSchedule.date);
      scheduleDate.setHours(0, 0, 0, 0);

      teacherSchedules.forEach(existingSchedule => {
        const existingDate = new Date(existingSchedule.date);
        existingDate.setHours(0, 0, 0, 0);

        if (scheduleDate.getTime() === existingDate.getTime() &&
            hasTimeOverlap(newSchedule.startTime, newSchedule.endTime, existingSchedule.startTime, existingSchedule.endTime)) {
          conflicts.push({
            date: formatDateLocal(existingSchedule.date),
            time: `${existingSchedule.startTime} - ${existingSchedule.endTime}`,
            conflictingClass: existingSchedule.class?.name || 'N/A',
            conflictingScheduleId: existingSchedule._id
          });
        }
      });
    });
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts
  };
};

/**
 * Check room conflicts with given schedules
 */
const checkRoomConflictsWithSchedules = async (roomId, schedules, excludeClassId) => {
  const conflicts = [];

  if (!roomId || !schedules || schedules.length === 0) {
    return { hasConflict: false, conflicts };
  }

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

  const uniqueDates = [...new Set(schedules.map(s => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d;
  }))];

  const roomScheduleQuery = {
    room: new mongoose.Types.ObjectId(roomId),
    date: { $in: uniqueDates },
    status: { $in: ['temporary', 'fixed'] }
  };

  if (excludeClassId) {
    roomScheduleQuery.class = { $ne: new mongoose.Types.ObjectId(excludeClassId) };
  }

  const roomSchedules = await ClassSchedule.find(roomScheduleQuery)
    .populate('class', 'name')
    .select('date startTime endTime class')
    .lean();

  schedules.forEach(newSchedule => {
    const scheduleDate = new Date(newSchedule.date);
    scheduleDate.setHours(0, 0, 0, 0);

    roomSchedules.forEach(existingSchedule => {
      const existingDate = new Date(existingSchedule.date);
      existingDate.setHours(0, 0, 0, 0);

      if (scheduleDate.getTime() === existingDate.getTime() &&
          hasTimeOverlap(newSchedule.startTime, newSchedule.endTime, existingSchedule.startTime, existingSchedule.endTime)) {
        conflicts.push({
          date: formatDateLocal(existingSchedule.date),
          time: `${existingSchedule.startTime} - ${existingSchedule.endTime}`,
          conflictingClass: existingSchedule.class?.name || 'N/A',
          conflictingScheduleId: existingSchedule._id
        });
      }
    });
  });

  return {
    hasConflict: conflicts.length > 0,
    conflicts
  };
};

/**
 * Check student conflicts with given schedules
 */
const checkStudentsConflictsWithSchedules = async (studentIds, schedules, excludeClassId) => {
  const conflicts = [];

  if (!studentIds || studentIds.length === 0 || !schedules || schedules.length === 0) {
    return { hasConflict: false, conflicts };
  }

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

  // Convert to ObjectIds
  const studentObjectIds = studentIds.map(s => {
    if (typeof s === 'string') {
      return new mongoose.Types.ObjectId(s);
    } else if (s._id) {
      return new mongoose.Types.ObjectId(s._id);
    } else {
      return new mongoose.Types.ObjectId(s);
    }
  });

  // Fetch student info
  const studentInfo = await User.find({
    _id: { $in: studentObjectIds }
  }).select('_id username fullName name email').lean();

  const studentInfoMap = new Map();
  studentInfo.forEach(student => {
    const studentIdStr = student._id.toString();
    const studentName = student.fullName || student.name || student.username || student.email?.split('@')[0] || `Học viên ${studentIdStr}`;
    studentInfoMap.set(studentIdStr, {
      studentId: studentIdStr,
      studentName: studentName
    });
  });

  const uniqueDates = [...new Set(schedules.map(s => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d;
  }))];

  // Find all classes with these students
  const studentQuery = {
    students: { $in: studentObjectIds }
  };
  if (excludeClassId) {
    studentQuery._id = { $ne: excludeClassId };
  }
  const studentClasses = await Class.find(studentQuery).select('_id name students').lean();

  if (studentClasses.length > 0) {
    const studentClassIds = studentClasses.map(c => c._id);

    const studentSchedules = await ClassSchedule.find({
      class: { $in: studentClassIds },
      date: { $in: uniqueDates },
      status: { $in: ['temporary', 'fixed'] }
    })
      .populate('class', 'name')
      .select('date startTime endTime class')
      .lean();

    const studentConflictMap = new Map();

    schedules.forEach(newSchedule => {
      const scheduleDate = new Date(newSchedule.date);
      scheduleDate.setHours(0, 0, 0, 0);

      studentSchedules.forEach(existingSchedule => {
        const existingDate = new Date(existingSchedule.date);
        existingDate.setHours(0, 0, 0, 0);

        if (scheduleDate.getTime() === existingDate.getTime() &&
            hasTimeOverlap(newSchedule.startTime, newSchedule.endTime, existingSchedule.startTime, existingSchedule.endTime)) {
          const scheduleClassId = existingSchedule.class?._id?.toString() || existingSchedule.class?.toString() || null;
          if (!scheduleClassId) return;

          const conflictingClass = studentClasses.find(cls => cls._id.toString() === scheduleClassId);
          if (!conflictingClass) return;

          conflictingClass.students.forEach(studentIdInConflictClass => {
            const studentIdInConflictClassStr = studentIdInConflictClass.toString();

            const isInCurrentClass = studentObjectIds.some(sid => sid.toString() === studentIdInConflictClassStr);

            if (isInCurrentClass) {
              const studentInfo = studentInfoMap.get(studentIdInConflictClassStr);
              const studentName = studentInfo ? studentInfo.studentName : `Học viên ${studentIdInConflictClassStr}`;

              if (!studentConflictMap.has(studentIdInConflictClassStr)) {
                studentConflictMap.set(studentIdInConflictClassStr, {
                  studentId: studentIdInConflictClassStr,
                  studentName: studentName,
                  conflictingSchedules: []
                });
              }
              studentConflictMap.get(studentIdInConflictClassStr).conflictingSchedules.push({
                date: formatDateLocal(existingSchedule.date),
                time: `${existingSchedule.startTime} - ${existingSchedule.endTime}`,
                className: existingSchedule.class?.name || conflictingClass.name || 'N/A'
              });
            }
          });
        }
      });
    });

    studentConflictMap.forEach((studentConflict) => {
      conflicts.push(studentConflict);
    });
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts
  };
};

/**
 * Phase 2: Schedule Update Functions
 */

/**
 * Helper: Convert date string to UTC midnight
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} Date object at UTC midnight
 */
const toUTCMidnight = (dateString) => {
  // Parse date string and create UTC date at midnight
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(parts[2], 10);
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
};

/**
 * Re-assign sessions to all schedules in correct date order
 * @param {ObjectId} classId - Class ID
 * @param {Object} session - MongoDB transaction session
 * @returns {Promise<{success: boolean, reassignedCount: number}>}
 */
const reassignSessionsToSchedules = async (classId, session) => {
  try {
    // Load class to get courseId
    const classData = await Class.findById(classId).select('course').session(session).lean();
    if (!classData || !classData.course) {
      return { success: false, message: 'Không tìm thấy lớp học hoặc khóa học' };
    }

    // Load course to get sessions
    const courseData = await Course.findById(classData.course)
      .populate('sessions', 'order _id')
      .select('sessions')
      .session(session)
      .lean();

    if (!courseData || !courseData.sessions || courseData.sessions.length === 0) {
      return { success: false, message: 'Khóa học không có sessions' };
    }

    // Sort sessions by order
    const courseSessions = [...courseData.sessions].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Load all class schedules sorted by date
    const allSchedules = await ClassSchedule.find({ class: classId })
      .sort({ date: 1 })
      .select('_id date')
      .session(session)
      .lean();

    if (allSchedules.length === 0) {
      return { success: true, reassignedCount: 0 };
    }

    // Prepare bulk update operations
    const bulkOps = allSchedules.map((schedule, index) => {
      const sessionIndex = index % courseSessions.length;
      const sessionId = courseSessions[sessionIndex]._id;

      return {
        updateOne: {
          filter: { _id: schedule._id },
          update: { $set: { session: sessionId } }
        }
      };
    });

    // Execute bulk update
    await ClassSchedule.bulkWrite(bulkOps, { session });

    console.log(`✅ Re-assigned ${allSchedules.length} sessions for class ${classId}`);

    return {
      success: true,
      reassignedCount: allSchedules.length
    };
  } catch (error) {
    console.error('Error in reassignSessionsToSchedules:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Update schedules for active class
 * @param {ObjectId} classId - Class ID
 * @param {Array} scheduleUpdates - Array of {scheduleId, newDate, newStartTime, newEndTime, updateScope}
 * @param {Object} session - MongoDB transaction session
 * @returns {Promise<{success: boolean, updatedScheduleIds: Array, message?: string}>}
 */
const updateSchedulesForActiveClass = async (classId, scheduleUpdates, session) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedScheduleIds = [];

    for (const update of scheduleUpdates) {
      const { scheduleId, newDate, newStartTime, newEndTime, updateScope } = update;

      // Load schedule
      const schedule = await ClassSchedule.findById(scheduleId).session(session);
      if (!schedule) {
        return { success: false, message: `Không tìm thấy lịch học ${scheduleId}` };
      }

      // Validate: schedule date >= today
      const scheduleDate = new Date(schedule.date);
      scheduleDate.setHours(0, 0, 0, 0);
      if (scheduleDate < today) {
        return { success: false, message: 'Không thể update buổi học đã qua' };
      }

      // Check attendance
      const hasAttendance = await StudentSchedule.findOne({
        classSchedule: scheduleId,
        'attendance.status': { $ne: null }
      }).session(session);

      if (hasAttendance) {
        return { success: false, message: 'Buổi học đã có điểm danh, không thể update' };
      }

      if (updateScope === 'single') {
        // Update single schedule
        schedule.date = toUTCMidnight(newDate);
        schedule.startTime = newStartTime || schedule.startTime;
        schedule.endTime = newEndTime || schedule.endTime;
        schedule.status = 'temporary';
        await schedule.save({ session });
        updatedScheduleIds.push(scheduleId);

        console.log(`✅ Updated single schedule ${scheduleId}`);
      } else if (updateScope === 'future') {
        // Find all matching schedules (same day of week, same time)
        const currentDate = new Date(schedule.date);
        currentDate.setHours(0, 0, 0, 0);
        const currentDayOfWeek = currentDate.getDay();
        const currentStartTime = schedule.startTime;
        const currentEndTime = schedule.endTime;

        const matchingSchedules = await ClassSchedule.find({
          class: classId,
          date: { $gte: currentDate },
          startTime: currentStartTime,
          endTime: currentEndTime
        }).session(session).lean();

        const filteredSchedules = matchingSchedules.filter(s => {
          const sDate = new Date(s.date);
          sDate.setHours(0, 0, 0, 0);
          return sDate.getDay() === currentDayOfWeek;
        });

        if (filteredSchedules.length === 0) {
          return { success: false, message: 'Không tìm thấy buổi học nào có cùng pattern' };
        }

        // Find the SELECTED schedule (the one user clicked on) in filteredSchedules
        const selectedSchedule = filteredSchedules.find(s => s._id.toString() === scheduleId.toString());
        if (!selectedSchedule) {
          return { success: false, message: 'Schedule được chọn không nằm trong danh sách matching schedules' };
        }

        // Use SELECTED schedule as reference point (not first schedule!)
        const selectedScheduleDate = new Date(selectedSchedule.date);
        const selectedScheduleDateUTC = new Date(Date.UTC(
          selectedScheduleDate.getUTCFullYear(),
          selectedScheduleDate.getUTCMonth(),
          selectedScheduleDate.getUTCDate(),
          0, 0, 0, 0
        ));

        const newDateObj = toUTCMidnight(newDate);

        console.log(`🔍 [DEBUG] Selected schedule date: ${selectedScheduleDateUTC.toISOString()} → New date: ${newDateObj.toISOString()}`);

        const bulkOps = filteredSchedules.map((sch, index) => {
          const originalDate = new Date(sch.date);
          const originalDateUTC = new Date(Date.UTC(
            originalDate.getUTCFullYear(),
            originalDate.getUTCMonth(),
            originalDate.getUTCDate(),
            0, 0, 0, 0
          ));

          // Calculate days from SELECTED schedule (not first schedule!)
          const daysFromSelected = Math.floor((originalDateUTC.getTime() - selectedScheduleDateUTC.getTime()) / (24 * 60 * 60 * 1000));
          const weeksFromSelected = Math.floor(daysFromSelected / 7);

          // Calculate new date: newDate + offset from selected
          const newScheduleDate = new Date(Date.UTC(
            newDateObj.getUTCFullYear(),
            newDateObj.getUTCMonth(),
            newDateObj.getUTCDate() + (weeksFromSelected * 7),
            0, 0, 0, 0
          ));

          return {
            updateOne: {
              filter: { _id: sch._id },
              update: {
                $set: {
                  date: newScheduleDate,
                  startTime: newStartTime || currentStartTime,
                  endTime: newEndTime || currentEndTime
                }
              }
            }
          };
        });

        // Debug logging
        console.log('🔍 [DEBUG] BulkWrite operations:');
        bulkOps.forEach((op, idx) => {
          console.log(`  ${idx + 1}. Update ${op.updateOne.filter._id} → date: ${op.updateOne.update.$set.date.toISOString()}`);
        });

        await ClassSchedule.bulkWrite(bulkOps, { session });
        updatedScheduleIds.push(...filteredSchedules.map(s => s._id));

        console.log(`✅ Updated ${filteredSchedules.length} future schedules`);
      }
    }

    // Re-assign sessions after updates
    const reassignResult = await reassignSessionsToSchedules(classId, session);
    if (!reassignResult.success) {
      return { success: false, message: reassignResult.message };
    }

    return {
      success: true,
      updatedScheduleIds,
      reassignedSessions: true
    };
  } catch (error) {
    console.error('Error in updateSchedulesForActiveClass:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Update schedules for pending class (similar to active but no attendance check)
 */
const updateSchedulesForPendingClass = async (classId, scheduleUpdates, session) => {
  // Same logic as updateSchedulesForActiveClass but without attendance check and date >= today check
  try {
    const updatedScheduleIds = [];

    for (const update of scheduleUpdates) {
      const { scheduleId, newDate, newStartTime, newEndTime, updateScope } = update;

      const schedule = await ClassSchedule.findById(scheduleId).session(session);
      if (!schedule) {
        return { success: false, message: `Không tìm thấy lịch học ${scheduleId}` };
      }

      if (updateScope === 'single') {
        schedule.date = toUTCMidnight(newDate);
        schedule.startTime = newStartTime || schedule.startTime;
        schedule.endTime = newEndTime || schedule.endTime;
        schedule.status = 'temporary';
        await schedule.save({ session });
        updatedScheduleIds.push(scheduleId);
      } else if (updateScope === 'future') {
        const currentDate = new Date(schedule.date);
        currentDate.setHours(0, 0, 0, 0);
        const currentDayOfWeek = currentDate.getDay();
        const currentStartTime = schedule.startTime;
        const currentEndTime = schedule.endTime;

        const matchingSchedules = await ClassSchedule.find({
          class: classId,
          date: { $gte: currentDate },
          startTime: currentStartTime,
          endTime: currentEndTime
        }).session(session).lean();

        const filteredSchedules = matchingSchedules.filter(s => {
          const sDate = new Date(s.date);
          sDate.setHours(0, 0, 0, 0);
          return sDate.getDay() === currentDayOfWeek;
        });

        if (filteredSchedules.length === 0) {
          return { success: false, message: 'Không tìm thấy buổi học nào có cùng pattern' };
        }

        // Find the SELECTED schedule (the one user clicked on) in filteredSchedules
        const selectedSchedule = filteredSchedules.find(s => s._id.toString() === scheduleId.toString());
        if (!selectedSchedule) {
          return { success: false, message: 'Schedule được chọn không nằm trong danh sách matching schedules' };
        }

        // Use SELECTED schedule as reference point
        const selectedScheduleDate = new Date(selectedSchedule.date);
        const selectedScheduleDateUTC = new Date(Date.UTC(
          selectedScheduleDate.getUTCFullYear(),
          selectedScheduleDate.getUTCMonth(),
          selectedScheduleDate.getUTCDate(),
          0, 0, 0, 0
        ));

        const newDateObj = toUTCMidnight(newDate);

        console.log(`🔍 [PENDING] Selected schedule date: ${selectedScheduleDateUTC.toISOString()} → New date: ${newDateObj.toISOString()}`);

        const bulkOps = filteredSchedules.map((sch) => {
          const originalDate = new Date(sch.date);
          const originalDateUTC = new Date(Date.UTC(
            originalDate.getUTCFullYear(),
            originalDate.getUTCMonth(),
            originalDate.getUTCDate(),
            0, 0, 0, 0
          ));

          const daysFromSelected = Math.floor((originalDateUTC.getTime() - selectedScheduleDateUTC.getTime()) / (24 * 60 * 60 * 1000));
          const weeksFromSelected = Math.floor(daysFromSelected / 7);

          const newScheduleDate = new Date(Date.UTC(
            newDateObj.getUTCFullYear(),
            newDateObj.getUTCMonth(),
            newDateObj.getUTCDate() + (weeksFromSelected * 7),
            0, 0, 0, 0
          ));

          return {
            updateOne: {
              filter: { _id: sch._id },
              update: {
                $set: {
                  date: newScheduleDate,
                  startTime: newStartTime || currentStartTime,
                  endTime: newEndTime || currentEndTime
                }
              }
            }
          };
        });

        await ClassSchedule.bulkWrite(bulkOps, { session });
        updatedScheduleIds.push(...filteredSchedules.map(s => s._id));
      }
    }

    const reassignResult = await reassignSessionsToSchedules(classId, session);
    if (!reassignResult.success) {
      return { success: false, message: reassignResult.message };
    }

    return {
      success: true,
      updatedScheduleIds,
      reassignedSessions: true
    };
  } catch (error) {
    console.error('Error in updateSchedulesForPendingClass:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Phase 5: Main Handlers
 */

// Import helper functions
const {
  updateTeacherForActiveClass,
  updateRoomForActiveClass,
  addStudentsToActiveClass,
  removeStudentsFromPendingClass,
  regenerateAllSchedules,
  recalculateScheduleDates,
  updateTeacherForPendingClass,
  addStudentsToPendingClass
} = require('../helpers/classUpdateHelpers');

/**
 * Handle updates for active class
 * @param {Object} classData - Current class document
 * @param {Object} updateData - Update data from request body
 * @param {Object} session - MongoDB transaction session
 * @returns {Promise<{success: boolean, message: string, updatedClass?: Object}>}
 */
const handleActiveClassUpdate = async (classData, updateData, session) => {
  try {
    const results = {
      scheduleUpdates: null,
      teacherUpdate: null,
      roomUpdate: null,
      studentUpdate: null
    };

    // 1. Handle schedule updates first (if any)
    if (updateData.scheduleUpdates && updateData.scheduleUpdates.length > 0) {
      results.scheduleUpdates = await updateSchedulesForActiveClass(
        classData._id,
        updateData.scheduleUpdates,
        session
      );
      if (!results.scheduleUpdates.success) {
        return results.scheduleUpdates;
      }
    }

    // 2. Handle teacher update
    if (updateData.teacher && updateData.teacher !== classData.teacher?.toString()) {
      results.teacherUpdate = await updateTeacherForActiveClass(
        classData._id,
        updateData.teacher,
        checkTeacherConflictsWithSchedules,
        session
      );
      if (!results.teacherUpdate.success) {
        return results.teacherUpdate;
      }
    }

    // 3. Handle room update
    if (updateData.room && updateData.room !== classData.room?.toString()) {
      results.roomUpdate = await updateRoomForActiveClass(
        classData._id,
        updateData.room,
        checkRoomConflictsWithSchedules,
        session
      );
      if (!results.roomUpdate.success) {
        return results.roomUpdate;
      }
    }

    // 4. Handle add students
    if (updateData.students) {
      const oldStudentIds = (classData.students || []).map(s => s.toString());
      const newStudentIds = updateData.students.map(s => s.toString());
      const studentsToAdd = newStudentIds.filter(sid => !oldStudentIds.includes(sid));

      if (studentsToAdd.length > 0) {
        results.studentUpdate = await addStudentsToActiveClass(
          classData._id,
          studentsToAdd,
          checkStudentsConflictsWithSchedules,
          session
        );
        if (!results.studentUpdate.success) {
          return results.studentUpdate;
        }
      }
    }

    // Get updated class data
    const updatedClass = await Class.findById(classData._id).session(session);

    return {
      success: true,
      message: 'Cập nhật lớp học thành công',
      updatedClass,
      details: results
    };
  } catch (error) {
    console.error('Error in handleActiveClassUpdate:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Handle updates for pending class
 */
const handlePendingClassUpdate = async (classData, updateData, session) => {
  try {
    const results = {
      courseUpdate: null,
      startDateUpdate: null,
      scheduleUpdates: null,
      teacherUpdate: null,
      roomUpdate: null,
      addStudents: null,
      removeStudents: null
    };

    // 1. Handle course change (regenerate all schedules)
    if (updateData.course && updateData.course !== classData.course?.toString()) {
      results.courseUpdate = await regenerateAllSchedules(
        classData._id,
        updateData.course,
        classData,
        session
      );
      if (!results.courseUpdate.success) {
        return results.courseUpdate;
      }
      // After course change, other schedule-related updates may not be needed
      // Return early with course update result
      const updatedClass = await Class.findById(classData._id).session(session);
      return {
        success: true,
        message: 'Cập nhật khóa học thành công. Đã xóa và tạo lại tất cả lịch học.',
        updatedClass,
        details: results
      };
    }

    // 2. Handle startDate change
    if (updateData.startDate && updateData.startDate !== classData.startDate) {
      results.startDateUpdate = await recalculateScheduleDates(
        classData._id,
        updateData.startDate,
        session
      );
      if (!results.startDateUpdate.success) {
        return results.startDateUpdate;
      }
    }

    // 3. Handle schedule updates
    if (updateData.scheduleUpdates && updateData.scheduleUpdates.length > 0) {
      results.scheduleUpdates = await updateSchedulesForPendingClass(
        classData._id,
        updateData.scheduleUpdates,
        session
      );
      if (!results.scheduleUpdates.success) {
        return results.scheduleUpdates;
      }
    }

    // 4. Handle teacher update
    if (updateData.teacher && updateData.teacher !== classData.teacher?.toString()) {
      results.teacherUpdate = await updateTeacherForPendingClass(
        classData._id,
        updateData.teacher,
        checkTeacherConflictsWithSchedules,
        session
      );
      if (!results.teacherUpdate.success) {
        return results.teacherUpdate;
      }
    }

    // 5. Handle room update
    if (updateData.room && updateData.room !== classData.room?.toString()) {
      results.roomUpdate = await updateRoomForActiveClass( // Same logic for pending
        classData._id,
        updateData.room,
        checkRoomConflictsWithSchedules,
        session
      );
      if (!results.roomUpdate.success) {
        return results.roomUpdate;
      }
    }

    // 6. Handle add/remove students
    if (updateData.students) {
      const oldStudentIds = (classData.students || []).map(s => s.toString());
      const newStudentIds = updateData.students.map(s => s.toString());

      // Add students
      const studentsToAdd = newStudentIds.filter(sid => !oldStudentIds.includes(sid));
      if (studentsToAdd.length > 0) {
        results.addStudents = await addStudentsToPendingClass(
          classData._id,
          studentsToAdd,
          checkStudentsConflictsWithSchedules,
          session
        );
        if (!results.addStudents.success) {
          return results.addStudents;
        }
      }

      // Remove students
      const studentsToRemove = oldStudentIds.filter(sid => !newStudentIds.includes(sid));
      if (studentsToRemove.length > 0) {
        results.removeStudents = await removeStudentsFromPendingClass(
          classData._id,
          studentsToRemove,
          session
        );
        if (!results.removeStudents.success) {
          return results.removeStudents;
        }
      }
    }

    const updatedClass = await Class.findById(classData._id).session(session);

    return {
      success: true,
      message: 'Cập nhật lớp học thành công',
      updatedClass,
      details: results
    };
  } catch (error) {
    console.error('Error in handlePendingClassUpdate:', error);
    return {
      success: false,
      message: error.message
    };
  }
};
