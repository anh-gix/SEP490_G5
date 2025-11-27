const User = require('../models/userModel');
const Class = require('../models/classModel');
const Course = require('../models/courseModel');
const ClassSchedule = require('../models/classScheduleModel');
const StudentSchedule = require('../models/studentScheduleModel');
const Program = require('../models/programModel');
const Exam = require('../models/examModel');
const Submission = require('../models/submissionModel');
const Room = require('../models/room');
const Role = require('../models/roleModel');

// =========================
// REPORT STATISTICS
// =========================

/**
 * Get student statistics report
 * GET /api/reports/students
 */
const getStudentReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get student role
    const studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role học viên'
      });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Total students
    const totalStudents = await User.countDocuments({
      roleId: studentRole._id
    });

    // New students in date range
    const newStudents = Object.keys(dateFilter).length > 0
      ? await User.countDocuments({
          roleId: studentRole._id,
          createdAt: dateFilter
        })
      : 0;

    // Students by class
    const studentsByClass = await Class.aggregate([
      {
        $project: {
          name: 1,
          studentCount: { $size: '$students' }
        }
      },
      { $sort: { studentCount: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        newStudents,
        studentsByClass
      }
    });
  } catch (error) {
    console.error('Error getting student report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo học viên',
      error: error.message
    });
  }
};

/**
 * Get course statistics report
 * GET /api/reports/courses
 */
const getCourseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Total courses by status
    const totalCourses = await Course.countDocuments();
    const approvedCourses = await Course.countDocuments({ status: 'approved' });
    const pendingCourses = await Course.countDocuments({ status: 'pending_approval' });
    const draftCourses = await Course.countDocuments({ status: 'draft' });

    // Courses by program
    const coursesByProgram = await Course.aggregate([
      {
        $group: {
          _id: '$program',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'programs',
          localField: '_id',
          foreignField: '_id',
          as: 'programInfo'
        }
      },
      { $unwind: '$programInfo' },
      {
        $project: {
          programName: '$programInfo.program_name',
          programCode: '$programInfo.code',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // New courses in date range
    const newCourses = Object.keys(dateFilter).length > 0
      ? await Course.countDocuments({ createdAt: dateFilter })
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        approvedCourses,
        pendingCourses,
        draftCourses,
        newCourses,
        coursesByProgram
      }
    });
  } catch (error) {
    console.error('Error getting course report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo khóa học',
      error: error.message
    });
  }
};

/**
 * Get class statistics report
 * GET /api/reports/classes
 */
const getClassReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Total classes
    const totalClasses = await Class.countDocuments();

    // Average students per class
    const classStats = await Class.aggregate([
      {
        $project: {
          studentCount: { $size: '$students' }
        }
      },
      {
        $group: {
          _id: null,
          avgStudents: { $avg: '$studentCount' },
          minStudents: { $min: '$studentCount' },
          maxStudents: { $max: '$studentCount' }
        }
      }
    ]);

    // Classes by teacher
    const classesByTeacher = await Class.aggregate([
      {
        $group: {
          _id: '$teacherId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'teacherInfo'
        }
      },
      { $unwind: '$teacherInfo' },
      {
        $project: {
          teacherName: '$teacherInfo.username',
          teacherEmail: '$teacherInfo.email',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalClasses,
        avgStudentsPerClass: classStats[0]?.avgStudents || 0,
        minStudentsPerClass: classStats[0]?.minStudents || 0,
        maxStudentsPerClass: classStats[0]?.maxStudents || 0,
        classesByTeacher
      }
    });
  } catch (error) {
    console.error('Error getting class report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo lớp học',
      error: error.message
    });
  }
};

/**
 * Get room utilization report
 * GET /api/reports/rooms
 */
const getRoomReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Total rooms
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'available' });
    const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });

    // Room usage statistics
    const scheduleQuery = { status: 'approved' };
    if (Object.keys(dateFilter).length > 0) {
      scheduleQuery.date = dateFilter;
    }

    const roomUsage = await ClassSchedule.aggregate([
      { $match: scheduleQuery },
      {
        $group: {
          _id: '$room',
          usageCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: '_id',
          foreignField: '_id',
          as: 'roomInfo'
        }
      },
      { $unwind: '$roomInfo' },
      {
        $project: {
          roomName: '$roomInfo.room_name',
          location: '$roomInfo.location',
          capacity: '$roomInfo.capacity',
          usageCount: 1
        }
      },
      { $sort: { usageCount: -1 } }
    ]);

    // Calculate utilization rate (assuming 8 time slots per day)
    const daysInRange = startDate && endDate
      ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
      : 30; // Default to 30 days

    const totalPossibleSlots = totalRooms * daysInRange * 8;
    const totalUsedSlots = roomUsage.reduce((sum, room) => sum + room.usageCount, 0);
    const utilizationRate = totalPossibleSlots > 0
      ? Math.round((totalUsedSlots / totalPossibleSlots) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRooms,
        availableRooms,
        maintenanceRooms,
        utilizationRate,
        roomUsage
      }
    });
  } catch (error) {
    console.error('Error getting room report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo phòng học',
      error: error.message
    });
  }
};

/**
 * Get exam statistics report
 * GET /api/reports/exams
 */
const getExamReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Total exams
    const totalExams = await Exam.countDocuments();
    const publishedExams = await Exam.countDocuments({ isPublished: true });

    // Exams by type
    const examsByType = await Exam.aggregate([
      {
        $group: {
          _id: '$examType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Exams by level
    const examsByLevel = await Exam.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);

    // Submission statistics
    const totalSubmissions = await Submission.countDocuments();
    const completedSubmissions = await Submission.countDocuments({ status: 'completed' });
    const inProgressSubmissions = await Submission.countDocuments({ status: 'in-progress' });

    // Average submissions per exam
    const avgSubmissions = totalExams > 0
      ? Math.round(totalSubmissions / totalExams)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalExams,
        publishedExams,
        examsByType,
        examsByLevel,
        totalSubmissions,
        completedSubmissions,
        inProgressSubmissions,
        avgSubmissions
      }
    });
  } catch (error) {
    console.error('Error getting exam report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo bài thi',
      error: error.message
    });
  }
};

/**
 * Get training effectiveness report
 * GET /api/reports/effectiveness
 */
const getEffectivenessReport = async (req, res) => {
  try {
    // Attendance rate
    const totalSchedules = await StudentSchedule.countDocuments();
    const presentSchedules = await StudentSchedule.countDocuments({
      'attendance.status': 'present'
    });
    const attendanceRate = totalSchedules > 0
      ? Math.round((presentSchedules / totalSchedules) * 100)
      : 0;

    // Course completion rate
    const totalPrograms = await Program.countDocuments({ status: 'active' });
    const completedPrograms = await Program.countDocuments({ status: 'archived' });
    const completionRate = totalPrograms > 0
      ? Math.round((completedPrograms / (totalPrograms + completedPrograms)) * 100)
      : 0;

    // Exam pass rate (assuming score >= 5 is pass)
    const examResults = await Submission.aggregate([
      { $match: { status: 'completed' } },
      {
        $project: {
          totalScore: {
            $sum: {
              $map: {
                input: '$sections',
                as: 'section',
                in: {
                  $sum: {
                    $map: {
                      input: '$$section.answers',
                      as: 'answer',
                      in: '$$answer.score'
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$totalScore' },
          passCount: {
            $sum: {
              $cond: [{ $gte: ['$totalScore', 5] }, 1, 0]
            }
          },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    const examPassRate = examResults[0]?.totalCount > 0
      ? Math.round((examResults[0].passCount / examResults[0].totalCount) * 100)
      : 0;

    const avgExamScore = examResults[0]?.avgScore || 0;

    res.status(200).json({
      success: true,
      data: {
        attendanceRate,
        completionRate,
        examPassRate,
        avgExamScore: Math.round(avgExamScore * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error getting effectiveness report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo hiệu quả đào tạo',
      error: error.message
    });
  }
};

/**
 * Export reports to Excel
 * GET /api/reports/export
 */
const exportReports = async (req, res) => {
  try {
    const { type, format = 'excel' } = req.query;

    // This is a placeholder for export functionality
    // You would need to implement Excel/PDF export logic here
    // Using libraries like exceljs or pdfkit

    res.status(501).json({
      success: false,
      message: 'Chức năng xuất báo cáo chưa được triển khai',
      note: 'Cần cài đặt thư viện exceljs hoặc pdfkit để xuất báo cáo'
    });
  } catch (error) {
    console.error('Error exporting reports:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xuất báo cáo',
      error: error.message
    });
  }
};

/**
 * Get overview report (summary statistics)
 * GET /api/reports/overview
 */
const getOverviewReport = async (req, res) => {
  try {
    // Get student role
    const studentRole = await Role.findOne({ name: 'Student' });
    const teacherRole = await Role.findOne({ name: 'Teacher' });
    
    // Total counts
    const totalStudents = studentRole ? await User.countDocuments({ roleId: studentRole._id }) : 0;
    const totalTeachers = teacherRole ? await User.countDocuments({ roleId: teacherRole._id }) : 0;
    const totalClasses = await Class.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalRooms = await Room.countDocuments();
    
    // Active classes
    const activeClasses = await Class.countDocuments({ status: 'active' });
    
    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newStudents = studentRole ? await User.countDocuments({
      roleId: studentRole._id,
      createdAt: { $gte: thirtyDaysAgo }
    }) : 0;
    
    const newClasses = await Class.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    res.status(200).json({
      success: true,
      overview: {
        totalStudents,
        totalTeachers,
        totalClasses,
        activeClasses,
        totalCourses,
        totalRooms,
        newStudents,
        newClasses
      }
    });
  } catch (error) {
    console.error('Error getting overview report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo tổng quan',
      error: error.message
    });
  }
};

/**
 * Get teacher performance report
 * GET /api/reports/teachers
 */
const getTeacherReport = async (req, res) => {
  try {
    const teacherRole = await Role.findOne({ name: 'Teacher' });
    if (!teacherRole) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role giáo viên'
      });
    }
    
    const teachers = await User.find({ roleId: teacherRole._id })
      .select('username email phone')
      .lean();
    
    // Get statistics for each teacher
    const teachersWithStats = await Promise.all(
      teachers.map(async (teacher) => {
        // Count classes
        const totalClasses = await Class.countDocuments({ teacherId: teacher._id });
        
        // Count students across all classes
        const classes = await Class.find({ teacherId: teacher._id }).select('students');
        const totalStudents = new Set();
        classes.forEach(cls => {
          if (cls.students && Array.isArray(cls.students)) {
            cls.students.forEach(studentId => totalStudents.add(studentId.toString()));
          }
        });
        
        // Count sessions
        const totalSessions = await ClassSchedule.countDocuments({ teacher: teacher._id });
        
        return {
          _id: teacher._id,
          fullName: teacher.username,
          email: teacher.email,
          phone: teacher.phone,
          stats: {
            totalClasses,
            totalStudents: totalStudents.size,
            totalSessions
          },
          status: 'active'
        };
      })
    );
    
    res.status(200).json({
      success: true,
      report: {
        teachers: teachersWithStats
      }
    });
  } catch (error) {
    console.error('Error getting teacher report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo giáo viên',
      error: error.message
    });
  }
};

/**
 * Get financial report
 * GET /api/reports/financial
 */
const getFinancialReport = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    // Get classes created in period
    const classesInPeriod = await Class.find({
      createdAt: { $gte: startDate }
    }).select('name level startDate endDate students').lean();
    
    // Calculate revenue (simplified - based on class count and students)
    // In a real system, you would have payment records
    let totalRevenue = 0;
    let totalClasses = classesInPeriod.length;
    let totalEnrollments = 0;
    
    classesInPeriod.forEach(cls => {
      const studentCount = cls.students ? cls.students.length : 0;
      totalEnrollments += studentCount;
      // Simplified revenue calculation (would need actual payment data)
      totalRevenue += studentCount * 1000000; // Assume 1M per student
    });
    
    // Get programs with tuition fees
    const programs = await Program.find({ status: 'active' }).select('tuitionFee').lean();
    const avgTuitionFee = programs.length > 0
      ? programs.reduce((sum, p) => sum + (p.tuitionFee || 0), 0) / programs.length
      : 0;
    
    res.status(200).json({
      success: true,
      report: {
        period,
        startDate,
        endDate: now,
        totalRevenue,
        totalClasses,
        totalEnrollments,
        avgTuitionFee: Math.round(avgTuitionFee),
        revenueByPeriod: {
          [period]: totalRevenue
        }
      }
    });
  } catch (error) {
    console.error('Error getting financial report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo tài chính',
      error: error.message
    });
  }
};

/**
 * Get time-based report
 * GET /api/reports/time-based
 */
const getTimeBasedReport = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date ranges
    const now = new Date();
    const ranges = [];
    
    let startDate = new Date();
    let intervalDays = 1;
    
    switch (period) {
      case 'week':
        intervalDays = 1;
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        intervalDays = 1;
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        intervalDays = 7;
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        intervalDays = 30;
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        intervalDays = 1;
        startDate.setMonth(now.getMonth() - 1);
    }
    
    // Generate time ranges
    let currentStart = new Date(startDate);
    while (currentStart < now) {
      const currentEnd = new Date(currentStart);
      currentEnd.setDate(currentEnd.getDate() + intervalDays);
      
      if (currentEnd > now) currentEnd.setTime(now.getTime());
      
      ranges.push({
        start: new Date(currentStart),
        end: new Date(currentEnd)
      });
      
      currentStart.setDate(currentStart.getDate() + intervalDays);
    }
    
    // Get data for each range
    const timeBasedData = await Promise.all(
      ranges.map(async (range) => {
        const classesCount = await Class.countDocuments({
          createdAt: { $gte: range.start, $lt: range.end }
        });
        
        const studentRole = await Role.findOne({ name: 'Student' });
        const studentsCount = studentRole ? await User.countDocuments({
          roleId: studentRole._id,
          createdAt: { $gte: range.start, $lt: range.end }
        }) : 0;
        
        return {
          date: range.start.toISOString().split('T')[0],
          classes: classesCount,
          students: studentsCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      report: {
        period,
        data: timeBasedData
      }
    });
  } catch (error) {
    console.error('Error getting time-based report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo theo thời gian',
      error: error.message
    });
  }
};

module.exports = {
  getStudentReport,
  getCourseReport,
  getClassReport,
  getRoomReport,
  getExamReport,
  getEffectivenessReport,
  exportReports,
  getOverviewReport,
  getTeacherReport,
  getFinancialReport,
  getTimeBasedReport
};
