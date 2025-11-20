const Class = require("../models/classModel");
const User = require("../models/userModel");
const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");
const HomeworkSubmission = require("../models/homeworkSubmissionModel");
const Course = require("../models/courseModel");
const Program = require("../models/programModel");
const mongoose = require("mongoose");

// =========================
// 📋 LẤY DANH SÁCH LỚP HỌC
// =========================
exports.getAllClasses = async (req, res) => {
  try {
    console.log('🔍 Fetching classes...');
    
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
          status: 'approved'
        });
        
        const completedSchedules = await ClassSchedule.countDocuments({
          class: cls._id,
          status: 'approved',
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
    
  console.log('✅ Found classes:', classesWithStats.length);
    
    res.status(200).json({
      success: true,
      count: classesWithStats.length,
      classes: classesWithStats
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách lớp học:", error);
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
    
    console.log('🔍 Fetching class:', id);
    
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
    const totalSchedules = await ClassSchedule.countDocuments({ class: id, status: 'approved' });
    const completedSchedules = await ClassSchedule.countDocuments({ class: id, status: 'approved', date: { $lt: new Date() } });
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
    
    // Calculate attendance for each student
    const studentsWithAttendance = await Promise.all(
      (classData.students || []).map(async (student) => {
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
    
    console.log('✅ Found class:', classData.name);
    
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
    console.error("❌ Lỗi khi lấy thông tin lớp:", error);
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
    console.error("❌ Lỗi khi lấy thống kê lớp:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy thống kê lớp",
      error: error.message 
    });
  }
};

// =========================
// ➕ TẠO LỚP HỌC MỚI
// =========================
exports.createClass = async (req, res) => {
  try {
    const { name, course, teacher, students, room, startDate, endDate, maxStudents, status, scheduleEntries } = req.body;
    
    if (!name || !teacher) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (tên lớp, giáo viên)'
      });
    }
    
    // Check if class name exists
    const existingClass = await Class.findOne({ name });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Tên lớp học đã tồn tại'
      });
    }
    
    const newClass = new Class({
      name,
      course,
      teacher,
      students: students || [],
      room,
      startDate,
      endDate,
      maxStudents: maxStudents || 25,
      status: status || 'pending'
    });
    
    await newClass.save();
    
    // Generate ClassSchedule entries if scheduleEntries and course are provided
    if (scheduleEntries && scheduleEntries.length > 0 && course && startDate) {
      // Get course details including numberOfSessions and sessions
      const courseData = await Course.findById(course)
        .populate('sessions', 'order')
        .select('numberOfSessions sessions');
      
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
            status: 'approved'
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
          const createdSchedules = await ClassSchedule.insertMany(classSchedules);
          
          // Create StudentSchedule entries for each ClassSchedule
          if (students && students.length > 0) {
            const studentSchedules = [];
            createdSchedules.forEach(schedule => {
              students.forEach(studentId => {
                studentSchedules.push({
                  student: studentId,
                  classSchedule: schedule._id,
                  attendance: { status: 'absent' }
                });
              });
            });
            
            if (studentSchedules.length > 0) {
              await StudentSchedule.insertMany(studentSchedules);
            }
          }
        }
      }
    }
    
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
    console.error('Error in createClass:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo lớp học',
      error: error.message
    });
  }
};

// =========================
// ✏️ CẬP NHẬT LỚP HỌC
// =========================
exports.updateClass = async (req, res) => {
  try {
    const { name, course, teacher, students, room, startDate, endDate, maxStudents, status } = req.body;
    
    const classData = await Class.findById(req.params.id);
    if (!classData) {
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
      });
      if (existingClass) {
        return res.status(400).json({
          success: false,
          message: 'Tên lớp học đã tồn tại'
        });
      }
    }
    
    // Update fields
    if (name) classData.name = name;
    if (course) classData.course = course;
    if (teacher) classData.teacher = teacher;
    if (room !== undefined) classData.room = room;
    if (students !== undefined) classData.students = students;
    if (startDate) classData.startDate = startDate;
    if (endDate) classData.endDate = endDate;
    if (maxStudents) classData.maxStudents = maxStudents;
    if (status) classData.status = status;
    
    await classData.save();
    
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
    console.error('Error in updateClass:', error);
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
    
    console.error('Error in deleteClass:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lớp học',
      error: error.message
    });
  }
};
