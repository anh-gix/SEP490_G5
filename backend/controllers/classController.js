const Class = require("../models/classModel");
const User = require("../models/userModel");
const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");
const HomeworkSubmission = require("../models/homeworkSubmissionModel");
const Course = require("../models/courseModel");
const Program = require("../models/programModel");
const Room = require("../models/room");
const mongoose = require("mongoose");

// =========================
// 📋 LẤY DANH SÁCH LỚP HỌC
// =========================
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

// =========================
// 🔍 LẤY THÔNG TIN 1 LỚP
// =========================
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

    // Log lịch học của lớp hiện tại
    console.log('\n📚 ========== LỊCH HỌC CỦA LỚP HIỆN TẠI (getClassById) ==========');
    console.log(`  - Tên lớp: ${classData.name || 'N/A'}`);
    console.log(`  - ClassId: ${id}`);
    console.log(`  - Tổng số buổi học: ${schedules.length}`);
    if (schedules.length > 0) {
      console.log('  - Chi tiết các buổi học:');
      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      schedules.forEach((schedule, idx) => {
        const scheduleDate = new Date(schedule.date);
        const year = scheduleDate.getFullYear();
        const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
        const day = String(scheduleDate.getDate()).padStart(2, '0');
        const scheduleDateStr = `${year}-${month}-${day}`;
        const dayOfWeek = scheduleDate.getDay();
        console.log(`    [${idx + 1}] ${scheduleDateStr} (${dayNames[dayOfWeek]}) - ${schedule.startTime} - ${schedule.endTime} [${schedule.status || 'fixed'}]`);
      });
    } else {
      console.log('  - Lớp này chưa có buổi học nào');
    }
    console.log('  ============================================\n');

    // compute some convenient stats for frontend
    const totalSchedules = await ClassSchedule.countDocuments({ class: id, status: { $in: ['temporary', 'fixed'] } });
    const completedSchedules = await ClassSchedule.countDocuments({ class: id, status: { $in: ['temporary', 'fixed'] }, date: { $lt: new Date() } });
    const totalStudents = classData.students?.length || 0;
    const completionRate = totalSchedules > 0 ? ((completedSchedules / totalSchedules) * 100).toFixed(2) : '0';
    
    // Tạo chuỗi thời gian học từ schedules
    let scheduleTimeString = 'N/A';
    if (schedules.length > 0) {
      // Lấy các khung giờ và ngày trong tuần từ schedules
      const timeSlots = new Set();
      const daysOfWeek = new Set();
      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      
      schedules.forEach(schedule => {
        if (schedule.startTime && schedule.endTime) {
          timeSlots.add(`${schedule.startTime}-${schedule.endTime}`);
        }
        if (schedule.date) {
          const date = new Date(schedule.date);
          daysOfWeek.add(dayNames[date.getDay()]);
        }
      });
      
      if (timeSlots.size > 0 && daysOfWeek.size > 0) {
        const daysArray = Array.from(daysOfWeek).sort();
        const timeArray = Array.from(timeSlots);
        scheduleTimeString = `${daysArray.join(', ')}: ${timeArray.join(', ')}`;
      }
    }
    
    // Get class schedule IDs for this class
    const classScheduleIds = schedules.map(s => s._id);
    
    // Log lịch học của từng sinh viên
    console.log('\n👥 ========== LỊCH HỌC CỦA TỪNG SINH VIÊN (getClassById) ==========');
    const students = classData.students || [];
    console.log(`  - Tổng số học sinh: ${students.length}`);
    
    for (let idx = 0; idx < students.length; idx++) {
      const student = students[idx];
      const studentId = student._id?.toString() || student.toString();
      const studentName = student.username || student.email || `Học sinh ${idx + 1}`;
      
      console.log(`\n  👤 [${idx + 1}] ${studentName} (ID: ${studentId}):`);
      
      // Tìm tất cả lớp mà học sinh này tham gia
      const studentAllClasses = await Class.find({
        students: new mongoose.Types.ObjectId(studentId)
      })
        .select('_id name')
        .lean();
      
      console.log(`      - Tham gia ${studentAllClasses.length} lớp:`);
      studentAllClasses.forEach((cls, cIdx) => {
        const isCurrentClass = cls._id.toString() === id.toString();
        console.log(`        [${cIdx + 1}] ${cls.name} (ID: ${cls._id})${isCurrentClass ? ' ← Lớp hiện tại' : ''}`);
      });
      
      // Lấy tất cả schedules của học sinh này từ tất cả các lớp
      const studentAllClassIds = studentAllClasses.map(c => c._id);
      const studentAllSchedules = await ClassSchedule.find({
        class: { $in: studentAllClassIds },
        status: { $in: ['temporary', 'fixed'] }
      })
        .populate('class', 'name')
        .select('date startTime endTime class status')
        .sort({ date: 1, startTime: 1 })
        .lean();
      
      console.log(`      - Tổng số buổi học: ${studentAllSchedules.length}`);
      if (studentAllSchedules.length > 0) {
        console.log(`      - Chi tiết các buổi học:`);
        const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        studentAllSchedules.forEach((schedule, sIdx) => {
          const scheduleDate = new Date(schedule.date);
          const year = scheduleDate.getFullYear();
          const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
          const day = String(scheduleDate.getDate()).padStart(2, '0');
          const scheduleDateStr = `${year}-${month}-${day}`;
          const dayOfWeek = scheduleDate.getDay();
          const scheduleClassName = schedule.class?.name || 'N/A';
          const isCurrentClassSchedule = schedule.class?._id?.toString() === id.toString();
          console.log(`        [${sIdx + 1}] ${scheduleDateStr} (${dayNames[dayOfWeek]}) - ${schedule.startTime} - ${schedule.endTime} [${schedule.status || 'fixed'}]`);
          console.log(`            Lớp: ${scheduleClassName}${isCurrentClassSchedule ? ' ← Lớp hiện tại' : ''}`);
        });
      } else {
        console.log(`      - Học sinh này chưa có buổi học nào`);
      }
    }
    console.log('  ============================================\n');
    
    // Calculate attendance for each student
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
        
        return {
          _id: student._id,
          username: student.username,
          email: student.email,
          phone: student.phone,
          attendance: attendanceRate
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
        roomLocation: classData.room?.location || 'N/A'
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

// =========================
// 📊 THỐNG KÊ LỚP HỌC
// =========================
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

// =========================
// 🔧 HELPER FUNCTION: KIỂM TRA CONFLICT CHO NHIỀU SCHEDULES
// =========================
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
  const hasTimeOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && end1 > start2;
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

  // 1. Kiểm tra conflict PHÒNG HỌC
  // Get room from first schedule (all schedules should have same room)
  const roomId = classSchedules[0]?.room;
  if (roomId) {
    // Query all room schedules for all dates
    const roomSchedules = await ClassSchedule.find({
      room: new mongoose.Types.ObjectId(roomId),
      date: { $in: uniqueDates },
      status: { $in: ['temporary', 'fixed'] }
    })
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

  // 2. Kiểm tra conflict GIÁO VIÊN
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

      classSchedules.forEach(newSchedule => {
        const scheduleDate = new Date(newSchedule.date);
        scheduleDate.setHours(0, 0, 0, 0);

        teacherSchedules.forEach(existingSchedule => {
          const existingDate = new Date(existingSchedule.date);
          existingDate.setHours(0, 0, 0, 0);

          // Check if same date and overlapping time
          if (scheduleDate.getTime() === existingDate.getTime() &&
              hasTimeOverlap(newSchedule.startTime, newSchedule.endTime, existingSchedule.startTime, existingSchedule.endTime)) {
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
    }
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

// =========================
// 🔍 KIỂM TRA CONFLICT TRƯỚC KHI TẠO LỚP (KHÔNG TẠO LỚP)
// =========================
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

// =========================
// ➕ TẠO LỚP HỌC MỚI
// =========================
exports.createClass = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { name, course, teacher, students, room, startDate, endDate, maxStudents, status, scheduleEntries } = req.body;
    
    if (!name || !teacher) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (tên lớp, giáo viên)'
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
    
    // Validate room capacity if room is provided
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
      maxStudents: maxStudents || 25,
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
    
    const populatedClass = await Class.findById(newClass._id)
      .populate('teacher', 'username email phone')
      .populate('students', 'username email')
      .populate('room', 'room_name location capacity')
      .populate({ 
        path: 'course', 
        select: 'name',
        populate: { path: 'program', select: 'program_name name level band tuitionFee type' } 
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

// =========================
// 🔧 HELPER FUNCTIONS FOR SCHEDULE COMPARISON
// =========================

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

// =========================
// ✏️ CẬP NHẬT LỚP HỌC
// =========================
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
    
    // Validate room capacity if room is provided
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
    
    console.log('🔍 [DEBUG] Existing schedules count:', existingClassSchedules.length);
    
    const oldSchedulePattern = extractSchedulePatternFromClassSchedules(existingClassSchedules);
    const newSchedulePattern = scheduleEntries && scheduleEntries.length > 0 
      ? normalizeScheduleEntries(scheduleEntries) 
      : [];
    
    console.log('🔍 [DEBUG] Old schedule pattern:', JSON.stringify(oldSchedulePattern, null, 2));
    console.log('🔍 [DEBUG] New schedule pattern:', JSON.stringify(newSchedulePattern, null, 2));
    
    // Check if only scheduleEntries changed (without changing room/teacher/startDate)
    const scheduleEntriesChanged = compareScheduleEntries(oldSchedulePattern, newSchedulePattern);
    const scheduleEntriesOnlyChanged = newSchedulePattern.length > 0 && 
      !courseChanged && 
      !roomChanged && 
      !teacherChanged && 
      !startDateChanged &&
      scheduleEntriesChanged;
    
    const scheduleEntriesProvided = scheduleEntries && scheduleEntries.length > 0;
    
    console.log('🔍 [DEBUG] Change flags:', {
      courseChanged,
      roomChanged,
      teacherChanged,
      startDateChanged,
      scheduleEntriesChanged,
      scheduleEntriesProvided,
      scheduleEntriesOnlyChanged
    });
    
    // Determine if we need to regenerate schedules
    // Regenerate if: course changed, OR (scheduleEntries provided AND any schedule-related field changed)
    // OR if only scheduleEntries changed (will use smart update)
    const shouldRegenerateSchedules = courseChanged || 
      (scheduleEntriesProvided && (roomChanged || teacherChanged || startDateChanged));
    
    console.log('🔍 [DEBUG] shouldRegenerateSchedules:', shouldRegenerateSchedules);
    
    // Determine final values for schedule generation
    const finalCourse = course || classData.course;
    const finalStartDate = startDate || classData.startDate;
    const finalRoomId = room !== undefined ? room : classData.room;
    const finalTeacher = teacher || classData.teacher;
    const finalStudentsList = students !== undefined ? students : classData.students;
    
    // Smart update: Only update future schedules when only scheduleEntries changed
    if (scheduleEntriesOnlyChanged && scheduleEntries && scheduleEntries.length > 0 && finalCourse && finalStartDate) {
      console.log('🔍 [DEBUG] Entering SMART UPDATE block');
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      
      // Separate past and future schedules
      const pastSchedules = existingClassSchedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        return scheduleDate < today;
      });
      
      const futureSchedules = existingClassSchedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        return scheduleDate >= today;
      });
      
      // Get future schedule IDs for deletion
      const futureScheduleIds = futureSchedules.map(s => s._id);
      
      // Delete future schedules and related data
      if (futureScheduleIds.length > 0) {
        // 1. Delete HomeworkSubmissions for future schedules
        await HomeworkSubmission.deleteMany(
          { classSchedule: { $in: futureScheduleIds } }
        ).session(session);
        
        // 2. Delete StudentSchedules for future schedules
        await StudentSchedule.deleteMany(
          { classSchedule: { $in: futureScheduleIds } }
        ).session(session);
        
        // 3. Delete future ClassSchedules
        await ClassSchedule.deleteMany(
          { _id: { $in: futureScheduleIds } }
        ).session(session);
      }
      
      // Get course details to determine how many sessions to create
      const courseData = await Course.findById(finalCourse)
        .populate('sessions', 'order')
        .select('numberOfSessions sessions')
        .session(session);
      
      if (courseData && courseData.numberOfSessions) {
        const numberOfSessions = courseData.numberOfSessions;
        const pastSessionsCount = pastSchedules.length;
        const totalExistingSchedules = existingClassSchedules.length; // Tổng số schedules trước khi xóa
        const futureSchedulesCount = futureSchedules.length; // Số future schedules đã bị xóa
        
        // Chỉ tạo lại số lượng future schedules đã bị xóa
        // Hoặc nếu tổng số schedules hiện tại < numberOfSessions, tạo thêm cho đủ
        // Nhưng không tạo thêm nếu đã có đủ số schedules
        let remainingSessions = 0;
        if (totalExistingSchedules < numberOfSessions) {
          // Chưa đủ số schedules, cần tạo thêm
          remainingSessions = numberOfSessions - totalExistingSchedules;
        } else if (futureSchedulesCount > 0) {
          // Đã đủ số schedules nhưng có future schedules bị xóa, chỉ tạo lại số đó
          remainingSessions = futureSchedulesCount;
        }
        
        console.log('🔍 [DEBUG] Schedule counts:', {
          numberOfSessions,
          pastSessionsCount,
          futureSchedulesCount,
          totalExistingSchedules,
          remainingSessions
        });
        
        // Only create new schedules if there are remaining sessions
        if (remainingSessions > 0) {
          // Sort sessions by order
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
          
          // Find the latest past schedule date to determine where to start
          let startDateForNewSchedules = finalStartDate;
          if (pastSchedules.length > 0) {
            const latestPastDate = new Date(Math.max(...pastSchedules.map(s => new Date(s.date).getTime())));
            // Start from the day after the latest past schedule
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
          
          // Generate ClassSchedule entries for remaining sessions
          const classSchedules = [];
          let entryIndex = 0;
          let weekOffset = 0;
          
          for (let i = 0; i < remainingSessions; i++) {
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
            
            // Get corresponding session from course (continue from where we left off)
            const sessionIndex = (pastSessionsCount + i) < courseSessions.length 
              ? (pastSessionsCount + i) 
              : (pastSessionsCount + i) % courseSessions.length;
            const sessionId = courseSessions[sessionIndex]?._id || null;
            
            classSchedules.push({
              class: classData._id,
              session: sessionId,
              date: sessionDate,
              startTime: entry.startTime,
              endTime: entry.endTime,
              room: finalRoomId,
              teacher: finalTeacher,
              createdBy: req.user?._id || finalTeacher,
              reason: `Buổi học ${pastSessionsCount + i + 1}`,
              status: 'fixed'
            });
            
            // Move to next entry (round-robin)
            entryIndex++;
            // If we've gone through all entries, move to next week
            if (entryIndex % scheduleEntries.length === 0) {
              weekOffset++;
            }
          }
          
          // Create all new ClassSchedule entries
          if (classSchedules.length > 0) {
            console.log('🔍 [DEBUG] Creating', classSchedules.length, 'new schedules in SMART UPDATE');
            const createdSchedules = await ClassSchedule.insertMany(classSchedules, { session });
            
            // Create StudentSchedule entries for each new ClassSchedule
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
            console.log('🔍 [DEBUG] No new schedules to create in SMART UPDATE');
          }
        } else {
          console.log('🔍 [DEBUG] No remaining sessions to create in SMART UPDATE');
        }
      }
    }
    // If schedules need to be regenerated (full regeneration), delete old ClassSchedules and related data
    else if (shouldRegenerateSchedules) {
      console.log('🔍 [DEBUG] Entering FULL REGENERATION block');
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
    if (maxStudents) classData.maxStudents = maxStudents;
    if (status) classData.status = status;
    
    await classData.save({ session });
    
    // Create new ClassSchedules when schedules need to be regenerated and scheduleEntries are provided
    // (Only if not already handled by smart update above)
    if (shouldRegenerateSchedules && !scheduleEntriesOnlyChanged && scheduleEntries && scheduleEntries.length > 0 && finalCourse && finalStartDate) {
      console.log('🔍 [DEBUG] Entering CREATE NEW SCHEDULES block (full regeneration)');
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
          console.log('🔍 [DEBUG] Creating', classSchedules.length, 'new schedules in FULL REGENERATION');
          const createdSchedules = await ClassSchedule.insertMany(classSchedules, { session });
          
          // Create StudentSchedule entries for each ClassSchedule
          if (finalStudentsList && finalStudentsList.length > 0) {
            const studentSchedules = [];
            createdSchedules.forEach(schedule => {
              finalStudentsList.forEach(studentId => {
                studentSchedules.push({
                  student: studentId,
                  classSchedule: schedule._id,
                  attendance: { status: 'absent' }
                });
              });
            });
            
            if (studentSchedules.length > 0) {
              await StudentSchedule.insertMany(studentSchedules, { session });
            }
          }
        } else {
          console.log('🔍 [DEBUG] No new schedules to create in FULL REGENERATION');
        }
      } else {
        console.log('🔍 [DEBUG] Course data not found or no numberOfSessions');
      }
    } else {
      console.log('🔍 [DEBUG] Skipping schedule creation - conditions not met');
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

// =========================
// 🗑️ XÓA LỚP HỌC (CASCADE DELETE)
// =========================
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
