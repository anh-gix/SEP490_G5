const Class = require("../models/classModel");
const User = require("../models/userModel");
const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");
const Course = require("../models/courseModel");

// =========================
// 📋 LẤY DANH SÁCH LỚP HỌC
// =========================
exports.getAllClasses = async (req, res) => {
  try {
    console.log('🔍 Fetching classes...');
    
    const { level, status, search, courseId } = req.query;
    let query = {};
    
    // Level filter: tìm trong course.level vì Class không còn level field
    if (level) {
      const coursesWithLevel = await Course.find({ level }).select('_id');
      query.course = { $in: coursesWithLevel.map(c => c._id) };
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
        select: 'name type level band tuitionFee',
        populate: { path: 'program', select: 'program_name name' } 
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
            // Add level and band from course
            level: cls.course?.level || 'N/A',
            band: cls.course?.band || 'N/A',
            courseType: cls.course?.type || 'N/A',
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
        select: 'name type level band tuitionFee',
        populate: [
          { path: 'program', select: 'program_name name' },
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
        level: classData.course?.level || 'N/A',
        band: classData.course?.band || 'N/A',
        courseType: classData.course?.type || 'N/A',
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
    const { name, course, teacher, students, room, startDate, endDate, maxStudents, status } = req.body;
    
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
    
    const populatedClass = await Class.findById(newClass._id)
      .populate('teacher', 'username email phone')
      .populate('students', 'username email')
      .populate('room', 'room_name location capacity')
      .populate({ 
        path: 'course', 
        select: 'name type level band tuitionFee',
        populate: { path: 'program', select: 'program_name name' } 
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
        select: 'name type level band tuitionFee',
        populate: { path: 'program', select: 'program_name name' } 
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
// 🗑️ XÓA LỚP HỌC
// =========================
exports.deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học'
      });
    }
    
    // Check schedules
    const scheduleCount = await ClassSchedule.countDocuments({ class: req.params.id });
    if (scheduleCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa lớp học có ${scheduleCount} lịch học`
      });
    }
    
    await Class.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Xóa lớp học thành công'
    });
  } catch (error) {
    console.error('Error in deleteClass:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lớp học',
      error: error.message
    });
  }
};
