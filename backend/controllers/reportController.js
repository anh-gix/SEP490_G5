const Class = require("../models/classModel");
const User = require("../models/userModel");
const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");
const Role = require("../models/roleModel");

// =========================
// 📊 BÁO CÁO TỔNG QUAN
// =========================
exports.getOverviewReport = async (req, res) => {
  try {
    // Total classes
    const totalClasses = await Class.countDocuments();
    
    // Get active classes (classes that have schedules)
    const activeClassIds = await ClassSchedule.distinct('class');
    const activeClasses = activeClassIds.length;
    
    // Total students
    const studentRole = await Role.findOne({ name: 'Student' });
    const totalStudents = studentRole 
      ? await User.countDocuments({ roleId: studentRole._id })
      : 0;
    
    // Total teachers
    const teacherRole = await Role.findOne({ name: 'Teacher' });
    const totalTeachers = teacherRole
      ? await User.countDocuments({ roleId: teacherRole._id })
      : 0;
    
    // Calculate average attendance
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthSchedules = await StudentSchedule.find({
      createdAt: { $gte: firstDayOfMonth }
    });
    
    let averageAttendance = 0;
    if (monthSchedules.length > 0) {
      const presentCount = monthSchedules.filter(
        s => s.attendance && s.attendance.status === 'present'
      ).length;
      averageAttendance = ((presentCount / monthSchedules.length) * 100).toFixed(1);
    }
    
    // Completion rate (classes with all sessions completed)
    const completionRate = totalClasses > 0 
      ? ((activeClasses / totalClasses) * 100).toFixed(1)
      : 0;
    
    res.status(200).json({
      message: "Lấy báo cáo tổng quan thành công",
      overview: {
        totalClasses,
        activeClasses,
        totalStudents,
        totalTeachers,
        averageAttendance: parseFloat(averageAttendance),
        completionRate: parseFloat(completionRate)
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy báo cáo tổng quan:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy báo cáo tổng quan",
      error: error.message 
    });
  }
};

// =========================
// 📚 BÁO CÁO THEO LỚP HỌC
// =========================
exports.getClassReport = async (req, res) => {
  try {
    const { level } = req.query; // Filter by level (A1, A2, B1, B2)
    
    let classQuery = {};
    if (level) {
      // Assuming class name contains level (e.g., "A1-Morning-01")
      classQuery.name = { $regex: level, $options: 'i' };
    }
    
    const classes = await Class.find(classQuery)
      .populate('teacherId', 'username email')
      .populate('students', 'username email');
    
    // Get stats for each class
    const classStats = await Promise.all(
      classes.map(async (cls) => {
        // Get schedules for this class
        const schedules = await ClassSchedule.find({ class: cls._id });
        const totalSessions = schedules.length;
        
        // Get attendance for this class
        const studentSchedules = await StudentSchedule.find({
          classSchedule: { $in: schedules.map(s => s._id) }
        });
        
        let avgAttendance = 0;
        if (studentSchedules.length > 0) {
          const presentCount = studentSchedules.filter(
            s => s.attendance && s.attendance.status === 'present'
          ).length;
          avgAttendance = Math.round((presentCount / studentSchedules.length) * 100);
        }
        
        // Extract level from class name
        const levelMatch = cls.name.match(/^(A1|A2|B1|B2|C1|C2)/i);
        const classLevel = levelMatch ? levelMatch[1].toUpperCase() : 'N/A';
        
        return {
          _id: cls._id,
          name: cls.name,
          level: classLevel,
          subject: cls.subject,
          teacher: cls.teacherId,
          totalStudents: cls.students.length,
          totalSessions,
          activeSessions: totalSessions, // All created sessions are considered active
          avgAttendance
        };
      })
    );
    
    res.status(200).json({
      message: "Lấy báo cáo lớp học thành công",
      total: classStats.length,
      classes: classStats
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy báo cáo lớp học:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy báo cáo lớp học",
      error: error.message 
    });
  }
};

// =========================
// 👨‍🎓 BÁO CÁO HỌC VIÊN
// =========================
exports.getStudentReport = async (req, res) => {
  try {
    const studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      return res.status(404).json({ message: "Không tìm thấy role học viên" });
    }
    
    const students = await User.find({ roleId: studentRole._id })
      .select('-password -token');
    
    // Get stats for each student
    const studentStats = await Promise.all(
      students.map(async (student) => {
        // Find classes student is enrolled in
        const enrolledClasses = await Class.find({ 
          students: student._id 
        }).select('name');
        
        // Get attendance records
        const attendanceRecords = await StudentSchedule.find({
          student: student._id
        });
        
        let attendanceRate = 0;
        if (attendanceRecords.length > 0) {
          const presentCount = attendanceRecords.filter(
            r => r.attendance && r.attendance.status === 'present'
          ).length;
          attendanceRate = Math.round((presentCount / attendanceRecords.length) * 100);
        }
        
        return {
          _id: student._id,
          username: student.username,
          email: student.email,
          phone: student.phone,
          enrolledClasses: enrolledClasses.length,
          totalSessions: attendanceRecords.length,
          attendanceRate
        };
      })
    );
    
    res.status(200).json({
      message: "Lấy báo cáo học viên thành công",
      total: studentStats.length,
      students: studentStats
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy báo cáo học viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy báo cáo học viên",
      error: error.message 
    });
  }
};

// =========================
// 👨‍🏫 BÁO CÁO GIẢNG VIÊN
// =========================
exports.getTeacherReport = async (req, res) => {
  try {
    const teacherRole = await Role.findOne({ name: 'Teacher' });
    if (!teacherRole) {
      return res.status(404).json({ message: "Không tìm thấy role giảng viên" });
    }
    
    const teachers = await User.find({ roleId: teacherRole._id })
      .select('-password -token');
    
    // Get stats for each teacher
    const teacherStats = await Promise.all(
      teachers.map(async (teacher) => {
        // Find classes taught by teacher
        const classes = await Class.find({ teacherId: teacher._id });
        const classIds = classes.map(c => c._id);
        
        // Count total students
        const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);
        
        // Count total sessions
        const totalSessions = await ClassSchedule.countDocuments({
          class: { $in: classIds }
        });
        
        // Calculate attendance rate for teacher's classes
        const schedules = await ClassSchedule.find({
          class: { $in: classIds }
        });
        const scheduleIds = schedules.map(s => s._id);
        
        const attendanceRecords = await StudentSchedule.find({
          classSchedule: { $in: scheduleIds }
        });
        
        let avgAttendance = 0;
        if (attendanceRecords.length > 0) {
          const presentCount = attendanceRecords.filter(
            r => r.attendance && r.attendance.status === 'present'
          ).length;
          avgAttendance = Math.round((presentCount / attendanceRecords.length) * 100);
        }
        
        return {
          _id: teacher._id,
          username: teacher.username,
          email: teacher.email,
          phone: teacher.phone,
          totalClasses: classes.length,
          totalStudents,
          totalSessions,
          avgAttendance
        };
      })
    );
    
    res.status(200).json({
      message: "Lấy báo cáo giảng viên thành công",
      total: teacherStats.length,
      teachers: teacherStats
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy báo cáo giảng viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy báo cáo giảng viên",
      error: error.message 
    });
  }
};

// =========================
// 💰 BÁO CÁO TÀI CHÍNH (Mock - cần model Payment/Invoice)
// =========================
exports.getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all classes
    const classes = await Class.find().populate('students');
    
    // Mock tuition fee calculation (300,000 VND per student per class)
    const tuitionPerStudent = 300000;
    
    let revenue = {
      total: 0,
      byLevel: {}
    };
    
    classes.forEach(cls => {
      const levelMatch = cls.name.match(/^(A1|A2|B1|B2|C1|C2)/i);
      const level = levelMatch ? levelMatch[1].toUpperCase() : 'Other';
      
      const classRevenue = cls.students.length * tuitionPerStudent;
      revenue.total += classRevenue;
      
      if (!revenue.byLevel[level]) {
        revenue.byLevel[level] = {
          studentCount: 0,
          classCount: 0,
          revenue: 0
        };
      }
      
      revenue.byLevel[level].studentCount += cls.students.length;
      revenue.byLevel[level].classCount += 1;
      revenue.byLevel[level].revenue += classRevenue;
    });
    
    res.status(200).json({
      message: "Lấy báo cáo tài chính thành công",
      note: "Đây là dữ liệu mock. Cần tích hợp với hệ thống thanh toán thực tế.",
      revenue,
      tuitionPerStudent
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy báo cáo tài chính:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy báo cáo tài chính",
      error: error.message 
    });
  }
};

// =========================
// 📈 BÁO CÁO THỐNG KÊ THEO THỜI GIAN
// =========================
exports.getTimeBasedReport = async (req, res) => {
  try {
    const { period } = req.query; // 'week', 'month', 'quarter', 'year'
    
    const today = new Date();
    let startDate, endDate = today;
    
    switch(period) {
      case 'week':
        startDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(today.setDate(today.getDate() - 30));
    }
    
    // Get schedules in period
    const schedules = await ClassSchedule.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('class');
    
    // Get attendance in period
    const studentSchedules = await StudentSchedule.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const totalSchedules = schedules.length;
    const uniqueClasses = [...new Set(schedules.map(s => s.class?._id?.toString()))].length;
    
    let attendanceRate = 0;
    if (studentSchedules.length > 0) {
      const presentCount = studentSchedules.filter(
        s => s.attendance && s.attendance.status === 'present'
      ).length;
      attendanceRate = ((presentCount / studentSchedules.length) * 100).toFixed(1);
    }
    
    res.status(200).json({
      message: `Lấy báo cáo ${period || 'tháng'} thành công`,
      period: {
        startDate,
        endDate,
        type: period || 'month'
      },
      stats: {
        totalSchedules,
        uniqueClasses,
        totalAttendanceRecords: studentSchedules.length,
        attendanceRate: parseFloat(attendanceRate)
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy báo cáo theo thời gian:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy báo cáo theo thời gian",
      error: error.message 
    });
  }
};
