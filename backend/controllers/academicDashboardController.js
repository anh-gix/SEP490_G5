const ClassSchedule = require('../models/classScheduleModel');
const StudentSchedule = require('../models/studentScheduleModel');
const Class = require('../models/classModel');
const Room = require('../models/room');
const ChangeRequest = require('../models/changeRequestModel');

// =========================
// 📊 LẤY DỮ LIỆU DASHBOARD GIÁO VỤ
// =========================
exports.getDashboardData = async (req, res) => {
  try {
    // Tạo date range theo UTC để query đúng với date trong database
    // Date trong DB được lưu dưới dạng UTC, nên cần query theo UTC
    const now = new Date();
    const localYear = now.getFullYear();
    const localMonth = now.getMonth();
    const localDay = now.getDate();
    
    // Tạo start và end của ngày ở UTC để đảm bảo query chính xác
    const todayStart = new Date(Date.UTC(localYear, localMonth, localDay, 0, 0, 0, 0));
    const todayEnd = new Date(Date.UTC(localYear, localMonth, localDay, 23, 59, 59, 999));

    // 1. Get today's schedules with populated data
    const todaySchedules = await ClassSchedule.find({
      date: { $gte: todayStart, $lte: todayEnd }
    })
      .populate('class', 'name level course')
      .populate('teacher', 'username email')
      .populate('room', 'room_name location')
      .populate('session', 'title order')
      .sort({ startTime: 1 })
      .lean();

    // 2. Get all schedule IDs for today
    const scheduleIds = todaySchedules.map(s => s._id);

    // 3. Get attendance data for all today's schedules in one query (BATCH)
    const attendances = await StudentSchedule.find({
      classSchedule: { $in: scheduleIds }
    })
      .populate('student', 'username email')
      .select('student classSchedule attendance')
      .lean();

    // 4. Group attendances by schedule ID for quick lookup
    const attendanceBySchedule = {};
    attendances.forEach(att => {
      const scheduleId = att.classSchedule?.toString() || att.classSchedule;
      if (!attendanceBySchedule[scheduleId]) {
        attendanceBySchedule[scheduleId] = [];
      }
      attendanceBySchedule[scheduleId].push(att);
    });

    // 5. Process today's schedules with attendance data
    const absentStudents = [];
    const lateStudents = [];
    const processedSchedules = todaySchedules.map(schedule => {
      const scheduleId = schedule._id.toString();
      const scheduleAttendances = attendanceBySchedule[scheduleId] || [];
      
      // Count absent and late students
      scheduleAttendances.forEach(att => {
        const status = att.attendance?.status;
        if (status === 'absent') {
          absentStudents.push({
            id: `${att.student?._id}-${scheduleId}`,
            name: att.student?.username || 'N/A',
            studentId: att.student?._id,
            class: schedule.class?.name || 'N/A',
            time: schedule.startTime || 'N/A',
            status: 'absent'
          });
        } else if (status === 'late') {
          lateStudents.push({
            id: `${att.student?._id}-${scheduleId}`,
            name: att.student?.username || 'N/A',
            studentId: att.student?._id,
            class: schedule.class?.name || 'N/A',
            time: schedule.startTime || 'N/A',
            status: 'late'
          });
        }
      });

      // Determine schedule status
      // schedule.date là Date object từ MongoDB (UTC), cần convert sang local timezone
      // để lấy đúng ngày local (vì startTime/endTime là local time)
      const scheduleDate = new Date(schedule.date);
      // Format date thành YYYY-MM-DD theo local timezone (vì startTime/endTime là local time)
      const year = scheduleDate.getFullYear();
      const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
      const day = String(scheduleDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      // startTime và endTime là local time (UTC+7), tạo Date object theo local timezone
      const startTime = new Date(`${dateStr}T${schedule.startTime}:00`);
      const endTime = new Date(`${dateStr}T${schedule.endTime}:00`);
      const now = new Date();
      
      let status = 'upcoming';
      if (startTime <= now && now <= endTime) {
        status = 'ongoing';
      } else if (endTime < now) {
        status = 'completed';
      }

      return {
        id: schedule._id,
        time: `${schedule.startTime || 'N/A'} - ${schedule.endTime || 'N/A'}`,
        className: schedule.class?.name || 'N/A',
        teacher: schedule.teacher?.username || 'N/A',
        room: schedule.room?.room_name || 'N/A',
        status,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      };
    });

    // 6. Get rooms (limit to 4 for room schedule display)
    const rooms = await Room.find()
      .select('room_name location')
      .limit(4)
      .lean();

    // 7. Build room schedule data
    const timeSlots = ['08:00-10:00', '10:30-12:30', '14:00-16:00', '18:00-20:00'];
    const roomScheduleData = rooms.map(room => {
      const schedules = timeSlots.map(timeSlot => {
        const [startTime, endTime] = timeSlot.split('-');
        const matchingSchedule = todaySchedules.find(s => 
          s.room?._id?.toString() === room._id?.toString() &&
          s.startTime === startTime &&
          s.endTime === endTime
        );
        
        if (matchingSchedule) {
          return {
            time: timeSlot,
            class: matchingSchedule.class?.name || 'N/A',
            status: 'occupied'
          };
        }
        return {
          time: timeSlot,
          class: 'Free',
          status: 'available'
        };
      });

      return {
        room: room.room_name || 'N/A',
        location: room.location || 'N/A',
        schedules
      };
    });

    // 8. Get classes for progress (limit to top 3)
    const classes = await Class.find({ status: 'active' })
      .populate('course', 'name level')
      .select('name course startDate endDate students')
      .limit(3)
      .lean();

    // 9. Get total schedules count for each class to calculate progress
    const classIds = classes.map(c => c._id);
    const classSchedulesCount = await ClassSchedule.aggregate([
      { $match: { class: { $in: classIds } } },
      { $group: { _id: '$class', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $lt: ['$date', new Date()] }, 1, 0] } } } }
    ]);

    const scheduleCountMap = {};
    classSchedulesCount.forEach(item => {
      scheduleCountMap[item._id.toString()] = {
        total: item.total,
        completed: item.completed
      };
    });

    const classProgressData = classes.map(cls => {
      const counts = scheduleCountMap[cls._id.toString()] || { total: 0, completed: 0 };
      const progress = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;

      return {
        id: cls._id,
        name: cls.name || 'N/A',
        level: cls.course?.level || cls.name?.split('-')[0] || 'N/A',
        progress,
        students: cls.students?.length || 0,
        completedLessons: counts.completed,
        totalLessons: counts.total
      };
    });

    // 10. Get recent change requests (top 5 pending, newest first)
    const recentRequests = await ChangeRequest.find({ status: 'pending' })
      .populate('sender', 'username email')
      .select('_id type sender createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Capture fresh timestamp right before calculating time differences
    // to ensure accurate "time ago" values after async operations
    const currentTime = new Date();
    const recentActivities = recentRequests.map(request => {
      const createdAt = new Date(request.createdAt);
      const diffMs = currentTime - createdAt;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeText = '';
      if (diffMins < 1) {
        timeText = 'Vừa xong';
      } else if (diffMins < 60) {
        timeText = `${diffMins} phút trước`;
      } else if (diffHours < 24) {
        timeText = `${diffHours} giờ trước`;
      } else if (diffDays < 7) {
        timeText = `${diffDays} ngày trước`;
      } else {
        timeText = createdAt.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }

      const senderName = request.sender?.username || 'Người dùng';
      const requestType = request.type || 'change_class';
      let message = '';
      let icon = 'fa-file-alt';
      let color = 'info';

      if (requestType === 'change_class') {
        message = `${senderName} đã gửi đơn xin đổi lớp học`;
        icon = 'fa-exchange-alt';
        color = 'primary';
      } else if (requestType === 'makeup_class') {
        message = `${senderName} đã gửi đơn xin học bù`;
        icon = 'fa-calendar-plus';
        color = 'warning';
      } else if (requestType === 'create_class') {
        message = `${senderName} đã gửi đơn tạo lớp mới`;
        icon = 'fa-plus-circle';
        color = 'success';
      } else if (requestType === 'replace_teacher') {
        message = `${senderName} đã gửi đơn thay giáo viên`;
        icon = 'fa-user-tie';
        color = 'info';
      } else {
        message = `${senderName} đã gửi đơn mới`;
        icon = 'fa-file-alt';
        color = 'info';
      }

      return {
        id: request._id,
        message,
        time: timeText,
        icon,
        color
      };
    });

    // 11. Count pending change requests by type
    // Note: pendingLeaveRequests is set to 0 as it wasn't implemented in the original code
    const pendingLeaveRequests = 0;
    
    const pendingMakeupClasses = await ChangeRequest.countDocuments({ 
      status: 'pending',
      type: 'makeup_class'
    });
    
    const newClassRequests = await ChangeRequest.countDocuments({ 
      status: 'pending',
      type: 'create_class'
    });

    // 12. Combine absent and late students
    const absentStudentsList = [...absentStudents, ...lateStudents].slice(0, 10);

    // 13. Build response
    const dashboardData = {
      todayOverview: {
        todaySchedules: todaySchedules.length,
        absentStudents: absentStudents.length,
        lateStudents: lateStudents.length,
        pendingLeaveRequests,
        pendingMakeupClasses,
        newClassRequests
      },
      todaySchedule: processedSchedules.slice(0, 10),
      absentStudentsList,
      roomSchedule: roomScheduleData,
      classProgress: classProgressData,
      recentActivities
    };

    res.status(200).json({
      success: true,
      message: 'Lấy dữ liệu dashboard thành công',
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Error getting academic dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy dữ liệu dashboard',
      error: error.message
    });
  }
};

