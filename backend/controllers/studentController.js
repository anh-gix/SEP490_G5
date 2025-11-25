const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Class = require("../models/classModel");
const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");
const HomeworkSubmission = require("../models/homeworkSubmissionModel");

// =========================
// 👤 LẤY THÔNG TIN HỌC VIÊN HIỆN TẠI (từ token)
// =========================
exports.getCurrentStudent = async (req, res) => {
  try {
    // req.user được set bởi verifyToken middleware
    const studentId = req.user._id;
    
    const student = await User.findById(studentId)
      .select('-password -token')
      .populate('roleId', 'name');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học viên'
      });
    }
    
    // Kiểm tra role
    if (student.roleId.name !== 'Student') {
      return res.status(403).json({
        success: false,
        message: 'Người dùng không phải là học viên'
      });
    }
    
    // Get classes that student is enrolled in
    const classes = await Class.find({ students: studentId })
      .select('name course startDate endDate teacher')
      .populate('course', 'name')
      .populate('teacher', 'username email')
      .lean();
    
    // Get total schedules
    const classIds = classes.map(cls => cls._id);
    const totalSchedules = await ClassSchedule.countDocuments({
      class: { $in: classIds }
    });
    
    // Get attendance stats
    const studentSchedules = await StudentSchedule.find({
      student: studentId
    }).lean();
    
    const attendanceStats = {
      total: studentSchedules.length,
      present: studentSchedules.filter(s => s.attendance?.status === 'present').length,
      absent: studentSchedules.filter(s => s.attendance?.status === 'absent').length,
      late: studentSchedules.filter(s => s.attendance?.status === 'late').length
    };
    
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin học viên thành công',
      student: {
        ...student.toObject(),
        stats: {
          classCount: classes.length,
          totalSchedules,
          attendanceStats
        }
      }
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy thông tin học viên hiện tại:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy thông tin học viên',
      error: error.message 
    });
  }
};

// =========================
// 📚 LẤY DANH SÁCH LỚP HỌC CỦA HỌC VIÊN
// =========================
exports.getMyClasses = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { status } = req.query;

    // Find all classes where student is enrolled
    let query = { students: studentId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const classes = await Class.find(query)
      .populate('course', 'name description')
      .populate('teacher', 'username email')
      .populate('room', 'room_name')
      .sort({ startDate: -1 })
      .lean();

    // Get additional stats for each class
    const classesWithStats = await Promise.all(
      classes.map(async (cls) => {
        // Get all schedules for this class
        const schedules = await ClassSchedule.find({ class: cls._id })
          .sort({ date: 1 })
          .lean();

        // Get student schedules
        const studentSchedules = await StudentSchedule.find({
          student: studentId,
          classSchedule: { $in: schedules.map(s => s._id) }
        }).lean();

        // Calculate attendance
        const attendanceStats = {
          total: studentSchedules.length,
          present: studentSchedules.filter(s => s.attendance?.status === 'present').length,
          absent: studentSchedules.filter(s => s.attendance?.status === 'absent').length,
          late: studentSchedules.filter(s => s.attendance?.status === 'late').length
        };

        // Calculate schedule pattern from first few schedules
        let schedulePattern = '';
        if (schedules.length > 0) {
          const firstSchedule = schedules[0];
          schedulePattern = `${firstSchedule.startTime} - ${firstSchedule.endTime}`;
        }

        return {
          ...cls,
          totalLessons: schedules.length,
          completedLessons: schedules.filter(s => new Date(s.date) < new Date()).length,
          attendanceStats,
          schedulePattern
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách lớp học thành công',
      total: classesWithStats.length,
      classes: classesWithStats
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách lớp học:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy danh sách lớp học',
      error: error.message 
    });
  }
};

// =========================
// 📅 LẤY LỊCH HỌC CỦA HỌC VIÊN
// =========================
exports.getMySchedule = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { startDate, endDate } = req.query;

    // Find all classes where student is enrolled
    const studentClasses = await Class.find({ students: studentId })
      .select('_id name course')
      .populate('course', 'name')
      .lean();

    if (!studentClasses || studentClasses.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Học viên chưa tham gia lớp nào',
        total: 0,
        schedules: []
      });
    }

    const classIds = studentClasses.map(cls => cls._id);

    let query = { class: { $in: classIds } };

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const classSchedules = await ClassSchedule.find(query)
      .populate('class', 'name course')
      .populate({
        path: 'class',
        populate: {
          path: 'course',
          select: 'name'
        }
      })
      .populate('room', 'room_name location')
      .populate('session', 'title order content')
      .sort({ date: 1, startTime: 1 })
      .lean();

    // Get student schedule info (attendance, status)
    const scheduleIds = classSchedules.map(s => s._id);
    const studentSchedules = await StudentSchedule.find({
      student: studentId,
      classSchedule: { $in: scheduleIds }
    }).lean();

    // Map student schedule info to class schedules
    const studentScheduleMap = {};
    studentSchedules.forEach(ss => {
      studentScheduleMap[ss.classSchedule.toString()] = ss;
    });

    const formattedSchedules = classSchedules.map(schedule => {
      const studentSchedule = studentScheduleMap[schedule._id.toString()];
      
      return {
        ...schedule,
        className: schedule.class?.name,
        courseName: schedule.class?.course?.name,
        sessionTitle: schedule.session?.title,
        sessionOrder: schedule.session?.order,
        roomName: schedule.room?.room_name,
        location: schedule.room?.location,
        attendance: studentSchedule?.attendance || null,
        scheduleStatus: studentSchedule?.scheduleStatus || 'scheduled'
      };
    });

    res.status(200).json({
      success: true,
      message: 'Lấy lịch học thành công',
      total: formattedSchedules.length,
      schedules: formattedSchedules
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy lịch học:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy lịch học',
      error: error.message 
    });
  }
};

// =========================
// 📖 LẤY CHI TIẾT BUỔI HỌC
// =========================
exports.getLessonDetail = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { scheduleId } = req.params;

    // Find the class schedule
    const classSchedule = await ClassSchedule.findById(scheduleId)
      .populate({
        path: 'class',
        populate: [
          { path: 'course', select: 'name description level' },
          { path: 'teacher', select: 'username email' }
        ]
      })
      .populate('room', 'room_name location')
      .populate('session', 'title order content objectives')
      .lean();

    if (!classSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    // Check if student is enrolled in this class
    const isEnrolled = classSchedule.class.students.some(
      s => s.toString() === studentId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập buổi học này'
      });
    }

    // Get student's attendance and status for this schedule
    const studentSchedule = await StudentSchedule.findOne({
      student: studentId,
      classSchedule: scheduleId
    }).lean();

    // Format the lesson detail
    const lessonDetail = {
      _id: classSchedule._id,
      date: classSchedule.date,
      startTime: classSchedule.startTime,
      endTime: classSchedule.endTime,
      
      // Class info
      className: classSchedule.class?.name,
      level: classSchedule.class?.course?.level,
      courseName: classSchedule.class?.course?.name,
      courseDescription: classSchedule.class?.course?.description,
      
      // Session info
      topic: classSchedule.session?.title || classSchedule.topic || 'Chưa có chủ đề',
      lessonNumber: classSchedule.session?.order || 0,
      description: classSchedule.session?.content || classSchedule.description || '',
      objectives: classSchedule.session?.objectives || [],
      
      // Teacher info
      teacher: {
        name: classSchedule.class?.teacher?.username,
        email: classSchedule.class?.teacher?.email
      },
      
      // Room info
      room: {
        name: classSchedule.room?.room_name,
        location: classSchedule.room?.location,
        fullName: classSchedule.room?.room_name && classSchedule.room?.location
          ? `${classSchedule.room.room_name} - ${classSchedule.room.location}`
          : classSchedule.room?.room_name || 'Chưa có phòng'
      },
      
      // Materials
      materials: classSchedule.material || [],
      
      // Homework
      homework: classSchedule.homework || [],
      
      // Student specific info
      attendance: studentSchedule?.attendance || null,
      scheduleStatus: studentSchedule?.scheduleStatus || 'scheduled',
      notes: classSchedule.note || '',
      
      // Status (upcoming, completed, cancelled)
      status: new Date(classSchedule.date) < new Date() ? 'completed' : 'upcoming'
    };

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết buổi học thành công',
      lesson: lessonDetail
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy chi tiết buổi học:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy chi tiết buổi học',
      error: error.message 
    });
  }
};

// =========================
// 📁 LẤY TÀI LIỆU CỦA LỚP HỌC
// =========================
exports.getClassMaterials = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { classId } = req.params;

    // Check if student is enrolled in this class
    const studentClass = await Class.findOne({
      _id: classId,
      students: studentId
    }).lean();

    if (!studentClass) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập lớp học này'
      });
    }

    // Get all schedules for this class with materials
    const schedules = await ClassSchedule.find({ 
      class: classId,
      material: { $exists: true, $ne: [] }
    })
      .populate('session', 'title order')
      .select('date material session topic')
      .sort({ date: 1 })
      .lean();

    // Format materials
    const materials = [];
    schedules.forEach(schedule => {
      if (schedule.material && schedule.material.length > 0) {
        schedule.material.forEach((materialUrl, index) => {
          materials.push({
            id: `${schedule._id}-${index}`,
            title: `Tài liệu buổi ${schedule.session?.order || 'N/A'}`,
            lessonNumber: schedule.session?.order || 0,
            lessonTitle: schedule.session?.title || schedule.topic || 'Chưa có tiêu đề',
            url: materialUrl,
            uploadDate: schedule.date,
            scheduleId: schedule._id
          });
        });
      }
    });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách tài liệu thành công',
      total: materials.length,
      materials
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy tài liệu lớp học:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy tài liệu',
      error: error.message 
    });
  }
};

// =========================
// 📝 LẤY BÀI TẬP CỦA LỚP HỌC
// =========================
exports.getClassHomework = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { classId } = req.params;

    // Check if student is enrolled
    const studentClass = await Class.findOne({
      _id: classId,
      students: studentId
    }).lean();

    if (!studentClass) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập lớp học này'
      });
    }

    // Get all schedules with homework
    const schedules = await ClassSchedule.find({ 
      class: classId,
      homework: { $exists: true, $ne: [] }
    })
      .populate('session', 'title order')
      .select('date homework session topic')
      .sort({ date: 1 })
      .lean();

    // Get HomeworkSubmission to load dynamically when needed
    const HomeworkSubmission = require('../models/homeworkSubmissionModel');

    // Format homework with submission status
    const homeworkList = [];
    
    for (const schedule of schedules) {
      if (schedule.homework && schedule.homework.length > 0) {
        for (const hw of schedule.homework) {
          // Find submission for this homework
          const submission = await HomeworkSubmission.findOne({
            student: studentId,
            classSchedule: schedule._id,
            homeworkId: hw._id
          }).lean();

          homeworkList.push({
            _id: hw._id,
            scheduleId: schedule._id,
            title: hw.title,
            description: hw.description || '',
            deadline: hw.deadline,
            lessonNumber: schedule.session?.order || 0,
            lessonTitle: schedule.session?.title || schedule.topic || 'Chưa có tiêu đề',
            assignmentFiles: hw.assignment?.files || [],
            answerFiles: hw.answerFiles || [],
            
            // Submission info
            status: submission?.status || 'not_submitted',
            submittedAt: submission?.submittedAt || null,
            submittedFiles: submission?.files || [],
            score: submission?.score || null,
            feedback: submission?.feedback || null,
            isLate: submission?.isLate || false,
            gradedAt: submission?.gradedAt || null
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách bài tập thành công',
      total: homeworkList.length,
      homework: homeworkList
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy bài tập lớp học:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy bài tập',
      error: error.message 
    });
  }
};

// =========================
// 📊 LẤY TIẾN ĐỘ HỌC TẬP
// =========================
exports.getClassProgress = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { classId } = req.params;

    // Check if student is enrolled
    const studentClass = await Class.findOne({
      _id: classId,
      students: studentId
    })
      .populate('course', 'name')
      .lean();

    if (!studentClass) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập lớp học này'
      });
    }

    // Get all schedules for this class
    const schedules = await ClassSchedule.find({ class: classId })
      .sort({ date: 1 })
      .lean();

    // Get student schedules (attendance)
    const scheduleIds = schedules.map(s => s._id);
    const studentSchedules = await StudentSchedule.find({
      student: studentId,
      classSchedule: { $in: scheduleIds }
    }).lean();

    // Calculate attendance stats
    const attendanceStats = {
      total: studentSchedules.length,
      present: studentSchedules.filter(s => s.attendance?.status === 'present').length,
      absent: studentSchedules.filter(s => s.attendance?.status === 'absent').length,
      late: studentSchedules.filter(s => s.attendance?.status === 'late').length,
      excused: studentSchedules.filter(s => s.attendance?.status === 'excused').length
    };

    const attendanceRate = attendanceStats.total > 0 
      ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
      : 0;

    // Get homework submissions
    const HomeworkSubmission = require('../models/homeworkSubmissionModel');
    const submissions = await HomeworkSubmission.find({
      student: studentId,
      classSchedule: { $in: scheduleIds }
    }).lean();

    // Calculate homework stats
    const homeworkStats = {
      total: submissions.length,
      submitted: submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length,
      late: submissions.filter(s => s.isLate).length,
      graded: submissions.filter(s => s.status === 'graded').length,
      notSubmitted: submissions.filter(s => s.status === 'not_submitted').length
    };

    // Calculate average score
    const gradedSubmissions = submissions.filter(s => s.score != null);
    const averageScore = gradedSubmissions.length > 0
      ? (gradedSubmissions.reduce((sum, s) => sum + s.score, 0) / gradedSubmissions.length).toFixed(1)
      : null;

    // Weekly attendance data for chart (last 8 weeks)
    const weeklyAttendance = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekSchedules = studentSchedules.filter(s => {
        const schedule = schedules.find(sch => sch._id.toString() === s.classSchedule.toString());
        if (!schedule) return false;
        const scheduleDate = new Date(schedule.date);
        return scheduleDate >= weekStart && scheduleDate <= weekEnd;
      });

      const weekPresent = weekSchedules.filter(s => s.attendance?.status === 'present').length;
      const weekTotal = weekSchedules.length;
      const weekRate = weekTotal > 0 ? Math.round((weekPresent / weekTotal) * 100) : 0;

      weeklyAttendance.push({
        week: `Tuần ${8 - i}`,
        rate: weekRate
      });
    }

    // Grade history (from mocktest)
    const gradesHistory = [];
    schedules.forEach(schedule => {
      if (schedule.mocktest && schedule.mocktest.studentScores) {
        const studentScore = schedule.mocktest.studentScores.find(
          s => s.student.toString() === studentId.toString()
        );
        if (studentScore) {
          gradesHistory.push({
            lessonNumber: schedule.session?.order || 0,
            type: 'Mocktest',
            score: studentScore.score,
            date: schedule.date
          });
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Lấy tiến độ học tập thành công',
      progress: {
        className: studentClass.name,
        courseName: studentClass.course?.name,
        
        // Attendance
        attendanceStats,
        attendanceRate,
        weeklyAttendance,
        
        // Homework
        homeworkStats,
        averageScore,
        
        // Lessons
        totalLessons: schedules.length,
        completedLessons: schedules.filter(s => new Date(s.date) < new Date()).length,
        
        // Grades
        gradesHistory
      }
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy tiến độ học tập:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy tiến độ',
      error: error.message 
    });
  }
};

// =========================
// 📝 NỘP BÀI TẬP
// =========================
exports.submitHomework = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { classId, scheduleId, homeworkId } = req.params;
    const { notes } = req.body;

    // Verify student is enrolled in the class
    const studentClass = await Class.findOne({
      _id: classId,
      students: studentId
    }).lean();

    if (!studentClass) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập lớp học này'
      });
    }

    // Verify schedule and homework exist
    const schedule = await ClassSchedule.findById(scheduleId).lean();
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch học'
      });
    }

    const homework = schedule.homework?.find(
      hw => hw._id.toString() === homeworkId
    );

    if (!homework) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập'
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một file để nộp'
      });
    }

    // Process uploaded files
    const submittedFiles = req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileSize: file.size,
      uploadedAt: new Date()
    }));

    // Find or create submission
    let submission = await HomeworkSubmission.findOne({
      classSchedule: scheduleId,
      homeworkId: homeworkId,
      student: studentId
    });

    const submittedAt = new Date();
    const isLate = submittedAt > new Date(homework.deadline);

    if (submission) {
      // Update existing submission
      submission.submittedAt = submittedAt;
      submission.submittedFiles = submittedFiles;
      submission.notes = notes || submission.notes;
      submission.status = isLate ? 'late' : 'submitted';
      submission.attemptNumber = (submission.attemptNumber || 0) + 1;
      await submission.save();
    } else {
      // Create new submission
      submission = await HomeworkSubmission.create({
        classSchedule: scheduleId,
        homeworkId: homeworkId,
        student: studentId,
        assignmentTitle: homework.assignment?.title || 'Bài tập',
        assignmentFiles: homework.assignment?.files || [],
        deadline: homework.deadline,
        submittedAt,
        submittedFiles,
        notes,
        status: isLate ? 'late' : 'submitted',
        attemptNumber: 1
      });
    }

    res.status(200).json({
      success: true,
      message: isLate ? 'Nộp bài thành công (Nộp trễ)' : 'Nộp bài thành công',
      submission: {
        _id: submission._id,
        status: submission.status,
        submittedAt: submission.submittedAt,
        submittedFiles: submission.submittedFiles,
        isLate,
        attemptNumber: submission.attemptNumber
      }
    });
  } catch (error) {
    console.error('❌ Lỗi khi nộp bài tập:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi nộp bài tập',
      error: error.message 
    });
  }
};

module.exports = exports;
