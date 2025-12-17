const Class = require("../models/classModel");
const ClassSchedule = require("../models/classScheduleModel");
const HomeworkSubmission = require("../models/homeworkSubmissionModel");
const StudentSchedule = require("../models/studentScheduleModel");

exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;
    
    console.log(' Getting dashboard data for teacher:', teacherId);

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

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);

    const upcomingLessons = await ClassSchedule.find({
      class: { $in: classIds },
      date: {
        $gte: today,
        $lte: weekFromNow
      }
    });

    const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);

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

    const upcomingSchedules = await ClassSchedule.find({
      $or: [
        // 1. Buổi học thông thường: có class thuộc các lớp của giáo viên
        {
          class: { $in: classIds },
          teacher: teacherId,
          date: { $gte: today, $lte: weekFromNow }
        },
        // 2. Buổi dạy bù: class = null, teacher = teacherId, status = temporary
        {
          class: null,
          teacher: teacherId,
          status: 'temporary',
          date: { $gte: today, $lte: weekFromNow }
        },
        // 3. Buổi dạy thay: substituteTeacher = teacherId
        {
          substituteTeacher: teacherId,
          date: { $gte: today, $lte: weekFromNow }
        }
      ]
    })
      .populate('class', 'name students')
      .populate('session', 'title order')
      .populate('room', 'room_name')
      .populate('substituteTeacher', 'username email')
      .sort({ date: 1, startTime: 1 })
      .limit(10)
      .lean();

      const formattedUpcomingSchedule = await Promise.all(
        upcomingSchedules.map(async (schedule) => {
          const scheduleDate = new Date(schedule.date);
          const isToday = scheduleDate.toDateString() === now.toDateString();
          
          // Đếm số học viên từ StudentSchedule (bao gồm cả học viên chính thức và học bù)
          const studentCount = await StudentSchedule.countDocuments({
            classSchedule: schedule._id,
            scheduleStatus: { $nin: ['cancelled'] } // Không đếm những buổi đã bị hủy
          });
          
          return {
            id: schedule._id,
            date: schedule.date,
            time: `${schedule.startTime} - ${schedule.endTime}`,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            className: schedule.class?.name || 'Lớp học bù',
            topic: schedule.session?.title || 'N/A',
            room: schedule.room?.room_name || 'N/A',
            students: studentCount, // Đếm từ StudentSchedule
            isToday
          };
        })
      );

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

        const Course = require('../models/courseModel');
        const course = await Course.findById(classInfo.course._id);
        const mocktestOrders = course?.mocktestSessionOrders || [];
        
        const upcomingMocktest = schedules.find(s => {
          const sessionOrder = s.session?.order;
          return mocktestOrders.includes(sessionOrder) && new Date(s.date) > now;
        });

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

    res.status(200).json({
      success: true,
      message: 'Lấy dữ liệu dashboard thành công',
      data: dashboardData
    });

  } catch (error) {
      res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy dữ liệu dashboard',
      error: error.message
    });
  }
};
