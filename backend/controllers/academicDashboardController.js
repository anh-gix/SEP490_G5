const ClassSchedule = require('../models/classScheduleModel');
const StudentSchedule = require('../models/studentScheduleModel');
const Class = require('../models/classModel');
const Room = require('../models/room');
const ChangeRequest = require('../models/changeRequestModel');

exports.getDashboardData = async (req, res) => {
  try {
    const now = new Date();
    const todayString = now.toISOString().split('T')[0];

    const todayStart = new Date(todayString);
    const todayEnd = new Date(todayString);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const todaySchedules = await ClassSchedule.find({
      date: { $gte: todayStart, $lte: todayEnd }
    })
      .populate('class', 'name level course')
      .populate('teacher', 'username email')
      .populate('room', 'room_name location')
      .populate('session', 'title order')
      .sort({ startTime: 1 })
      .lean();

    const scheduleIds = todaySchedules.map(s => s._id);

    const attendances = await StudentSchedule.find({
      classSchedule: { $in: scheduleIds }
    })
      .populate('student', 'username email')
      .select('student classSchedule attendance')
      .lean();

    const attendanceBySchedule = {};
    attendances.forEach(att => {
      const scheduleId = att.classSchedule?.toString() || att.classSchedule;
      if (!attendanceBySchedule[scheduleId]) {
        attendanceBySchedule[scheduleId] = [];
      }
      attendanceBySchedule[scheduleId].push(att);
    });

    const absentStudents = [];
    const lateStudents = [];
    const processedSchedules = todaySchedules.map(schedule => {
      const scheduleId = schedule._id.toString();
      const scheduleAttendances = attendanceBySchedule[scheduleId] || [];
      
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

      const scheduleDate = new Date(schedule.date);
      
      const year = scheduleDate.getFullYear();
      const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
      const day = String(scheduleDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const startTime = new Date(`${dateStr}T${schedule.startTime}:00`);
      const endTime = new Date(`${dateStr}T${schedule.endTime}:00`);
      
      let status = 'upcoming';
      if (startTime <= now && now <= endTime) {
        status = 'ongoing';
      } else if (endTime < now) {
        status = 'completed';
      }

      let className = schedule.class?.name;
      if (!className && schedule.status === 'temporary') {
        className = 'Lớp học bù';
      } else if (!className) {
        className = 'N/A';
      }

      return {
        id: schedule._id,
        time: `${schedule.startTime || 'N/A'} - ${schedule.endTime || 'N/A'}`,
        className: className,
        teacher: schedule.teacher?.username || 'N/A',
        room: schedule.room?.room_name || 'N/A',
        status,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      };
    });

    // Fixed time slots
    const fixedTimeSlots = ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'];
    const fixedTimeSlotSet = new Set(fixedTimeSlots);
    
    const normalizeTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : '';
    const additionalTimeSlotSet = new Set();
    
    // Find time slots from schedules that are not in fixed slots
    todaySchedules.forEach(schedule => {
      if (schedule.startTime && schedule.endTime) {
        const start = normalizeTime(schedule.startTime);
        const end = normalizeTime(schedule.endTime);
        if (start && end) {
          const timeSlot = `${start}-${end}`;
          // Only add if not in fixed slots
          if (!fixedTimeSlotSet.has(timeSlot)) {
            additionalTimeSlotSet.add(timeSlot);
          }
        }
      }
    });

    // Combine fixed slots with additional slots and sort
    const additionalTimeSlots = Array.from(additionalTimeSlotSet).sort((a, b) => {
      const [startA] = a.split('-');
      const [startB] = b.split('-');
      return startA.localeCompare(startB);
    });

    const timeSlots = [...fixedTimeSlots, ...additionalTimeSlots];

    const rooms = await Room.find()
      .select('room_name location')
      .sort({ room_name: 1 })
      .lean();

    const roomScheduleData = rooms.map(room => {
      const schedules = timeSlots.map(timeSlot => {
        const [startTime, endTime] = timeSlot.split('-');
        const normalizeTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : '';
        const matchingSchedule = todaySchedules.find(s => 
          s.room?._id?.toString() === room._id?.toString() &&
          normalizeTime(s.startTime) === startTime &&
          normalizeTime(s.endTime) === endTime
        );
        
        if (matchingSchedule) {
          let className = matchingSchedule.class?.name;
          if (!className && matchingSchedule.status === 'temporary') {
            className = 'Lớp học bù';
          } else if (!className) {
            className = 'N/A';
          }
          
          return {
            time: timeSlot,
            class: className,
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

    const recentRequests = await ChangeRequest.find({ status: 'pending' })
      .populate('sender', 'username email')
      .select('_id type sender createdAt')
      .sort({ createdAt: 1 })
      .limit(3)
      .lean();

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
      } else if (requestType === 'request_replace_teacher') {
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
        senderName: senderName,
        requestType: requestType,
        createdAt: request.createdAt,
        message,
        time: timeText,
        icon,
        color
      };
    });

    const pendingLeaveRequests = 0;
    
    const pendingMakeupClasses = await ChangeRequest.countDocuments({ 
      status: 'pending',
      type: 'makeup_class'
    });
    
    const newClassRequests = await ChangeRequest.countDocuments({ 
      status: 'pending',
      type: 'create_class'
    });
      
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const totalRequestsLastWeek = await ChangeRequest.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo }
    });
    
    const pendingChangeClassRequests = await ChangeRequest.countDocuments({ 
      status: 'pending',
      type: 'change_class'
    });

    const absentStudentsList = [...absentStudents, ...lateStudents].slice(0, 10);

    const dashboardData = {
      todayOverview: {
        todaySchedules: todaySchedules.length,
        absentStudents: absentStudents.length,
        lateStudents: lateStudents.length,
        pendingLeaveRequests,
        pendingMakeupClasses,
        newClassRequests,
        totalRequestsLastWeek,
        pendingChangeClassRequests
      },
      absentStudentsList,
      roomSchedule: roomScheduleData,
      timeSlots: timeSlots,
      recentActivities
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

