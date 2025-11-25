const Class = require("../models/classModel");
const ClassSchedule = require("../models/classScheduleModel");
const HomeworkSubmission = require("../models/homeworkSubmissionModel");
const StudentSchedule = require("../models/studentScheduleModel");

// =========================
// 📊 LẤY DỮ LIỆU DASHBOARD GIẢNG VIÊN
// =========================
exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;
    
    console.log('📊 Getting dashboard data for teacher:', teacherId);

    // Get all classes taught by this teacher
    const classes = await Class.find({ teacher: teacherId })
      .populate('course', 'name')
      .populate('students', 'username email')
      .lean();

    if (!classes || classes.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved',
        data: {
          stats: {
            upcomingLessons: 0,
            totalStudents: 0,
            pendingGrading: 0,
            pendingAttendance: 0
          },
          upcomingSchedule: [],
          classesSummary: []
        }
      });
    }

    const classIds = classes.map(cls => cls._id);

    // Get current date range for stats
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);

    // Get upcoming lessons (this week)
    const upcomingLessons = await ClassSchedule.find({
      class: { $in: classIds },
      date: {
        $gte: today,
        $lte: weekFromNow
      }
    });

    // Count total students
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);

    // Get schedules with homework to count pending grading
    const schedulesWithHomework = await ClassSchedule.find({
      class: { $in: classIds },
      'homework.0': { $exists: true }
    }).lean();

    let pendingGradingCount = 0;
    for (const schedule of schedulesWithHomework) {
      for (const hw of schedule.homework || []) {
        const submissions = await HomeworkSubmission.find({
          homeworkId: hw._id,
          status: 'submitted'
        });
        pendingGradingCount += submissions.length;
      }
    }

    // Get schedules that need attendance (past schedules without full attendance)
    const pastSchedules = await ClassSchedule.find({
      class: { $in: classIds },
      date: { $lt: today }
    }).lean();

    let pendingAttendanceCount = 0;
    for (const schedule of pastSchedules) {
      const classInfo = classes.find(c => c._id.toString() === schedule.class.toString());
      const studentCount = classInfo?.students?.length || 0;
      
      const attendanceCount = await StudentSchedule.countDocuments({
        classSchedule: schedule._id,
        'attendance.status': { $in: ['present', 'late', 'absent', 'excused'] }
      });
      
      if (attendanceCount < studentCount) {
        pendingAttendanceCount++;
      }
    }

    // Get upcoming schedule (next 7 days)
    const upcomingSchedules = await ClassSchedule.find({
      class: { $in: classIds },
      date: {
        $gte: today,
        $lte: weekFromNow
      }
    })
      .populate('class', 'name students')
      .populate('session', 'title order')
      .populate('room', 'room_name')
      .sort({ date: 1, startTime: 1 })
      .limit(10)
      .lean();

    const formattedUpcomingSchedule = upcomingSchedules.map(schedule => {
      const scheduleDate = new Date(schedule.date);
      const isToday = scheduleDate.toDateString() === now.toDateString();
      
      return {
        id: schedule._id,
        date: schedule.date,
        time: `${schedule.startTime} - ${schedule.endTime}`,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        className: schedule.class?.name || 'N/A',
        topic: schedule.session?.title || 'N/A',
        room: schedule.room?.room_name || 'N/A',
        students: schedule.class?.students?.length || 0,
        isToday
      };
    });

    // Get classes summary
    const classesSummary = await Promise.all(
      classes.map(async (classInfo) => {
        const schedules = await ClassSchedule.find({
          class: classInfo._id
        })
          .populate('session', 'order')
          .lean();

        const totalLessons = schedules.length;
        const completedLessons = schedules.filter(s => new Date(s.date) < now).length;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        // Get next test/mocktest
        const Course = require('../models/courseModel');
        const course = await Course.findById(classInfo.course._id);
        const mocktestOrders = course?.mocktestSessionOrders || [];
        
        const upcomingMocktest = schedules.find(s => {
          const sessionOrder = s.session?.order;
          return mocktestOrders.includes(sessionOrder) && new Date(s.date) > now;
        });

        // Get upcoming homework
        const upcomingHomework = await ClassSchedule.findOne({
          class: classInfo._id,
          'homework.deadline': { $gt: now }
        })
          .sort({ 'homework.deadline': 1 })
          .lean();

        return {
          id: classInfo._id,
          name: classInfo.name,
          level: classInfo.name?.split('-')[0] || 'N/A',
          students: classInfo.students?.length || 0,
          totalLessons,
          completedLessons,
          progress,
          nextTest: upcomingMocktest ? `Mocktest ${upcomingMocktest.session?.order}` : 'Chưa có',
          nextTestDate: upcomingMocktest ? new Date(upcomingMocktest.date).toLocaleDateString('vi-VN') : '-',
          upcomingAssignment: upcomingHomework?.homework?.[0]?.assignment?.title || 'Chưa có bài tập',
          assignmentDeadline: upcomingHomework?.homework?.[0]?.deadline 
            ? new Date(upcomingHomework.homework[0].deadline).toLocaleDateString('vi-VN')
            : '-'
        };
      })
    );

    const dashboardData = {
      stats: {
        upcomingLessons: upcomingLessons.length,
        totalStudents,
        pendingGrading: pendingGradingCount,
        pendingAttendance: pendingAttendanceCount
      },
      upcomingSchedule: formattedUpcomingSchedule,
      classesSummary
    };

    console.log('✅ Dashboard data:', {
      upcomingLessons: upcomingLessons.length,
      totalStudents,
      classesCount: classes.length
    });

    res.status(200).json({
      success: true,
      message: 'Lấy dữ liệu dashboard thành công',
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Error getting teacher dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy dữ liệu dashboard',
      error: error.message
    });
  }
};
