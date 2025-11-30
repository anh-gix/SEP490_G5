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

// =========================
// 📊 LẤY DỮ LIỆU DASHBOARD CỦA HỌC VIÊN
// =========================
exports.getDashboardData = async (req, res) => {
  try {
    const studentId = req.user._id;

    // 1. Get student basic info
    const student = await User.findById(studentId)
      .select('-password -token')
      .populate('roleId', 'name')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học viên'
      });
    }

    // 2. Get active classes
    const activeClasses = await Class.find({
      students: studentId,
      status: 'active'
    })
      .populate('course', 'name')
      .populate('teacher', 'username')
      .populate('room', 'room_name')
      .select('name course teacher room startDate endDate')
      .lean();

    // 3. Get week schedule (current week)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const classIds = activeClasses.map(cls => cls._id);
    
    const weekSchedules = await ClassSchedule.find({
      class: { $in: classIds },
      date: { $gte: startOfWeek, $lte: endOfWeek }
    })
      .populate('class', 'name course')
      .populate({
        path: 'class',
        populate: { path: 'course', select: 'name' }
      })
      .populate('room', 'room_name')
      .populate('session', 'title order')
      .sort({ date: 1, startTime: 1 })
      .lean();

    // 4. Get pending/overdue homework
    const allSchedules = await ClassSchedule.find({
      class: { $in: classIds },
      'homework.assignment': { $exists: true, $ne: null }
    })
      .populate('class', 'name course')
      .populate({
        path: 'class',
        populate: { path: 'course', select: 'name' }
      })
      .select('class homework date')
      .lean();

    const assignments = [];
    for (const schedule of allSchedules) {
      if (schedule.homework?.assignment) {
        // Get submission status
        const submission = await HomeworkSubmission.findOne({
          classSchedule: schedule._id,
          homeworkId: schedule.homework._id,
          student: studentId
        }).lean();

        const now = new Date();
        const deadline = new Date(schedule.homework.deadline);
        const isOverdue = deadline < now && submission?.status !== 'submitted';
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        assignments.push({
          id: schedule.homework._id.toString(),
          scheduleId: schedule._id.toString(),
          classId: schedule.class._id.toString(),
          className: schedule.class.name,
          subject: schedule.class.course?.name || 'N/A',
          title: schedule.homework.assignment.title,
          dueDate: schedule.homework.deadline,
          status: submission?.status || 'not_submitted',
          priority: daysLeft <= 2 && !isOverdue ? 'high' : 'normal',
          isOverdue,
          daysLeft
        });
      }
    }

    // Sort assignments by priority and due date
    assignments.sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      if (a.priority !== b.priority) return a.priority === 'high' ? -1 : 1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    // 5. Get practice test results (from Submission model)
    console.log('📊 [Dashboard] Bắt đầu lấy dữ liệu luyện đề cho studentId:', studentId);
    
    const Submission = require('../models/submissionModel');
    const Exam = require('../models/examModel');
    
    console.log('🔍 [Dashboard] Query Submission model với điều kiện:', {
      studentId,
      status: { $in: ['completed', 'graded'] }
    });
    
    const submissions = await Submission.find({
      studentId,
      status: { $in: ['completed', 'graded'] }
    })
      .populate({
        path: 'examId',
        select: 'title type examType createdAt'
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log(`✅ [Dashboard] Tìm thấy ${submissions.length} submissions`);
    
    if (submissions.length > 0) {
      console.log('📋 [Dashboard] Chi tiết submissions:');
      submissions.forEach((sub, index) => {
        console.log(`  [${index + 1}] Submission ID: ${sub._id}`);
        console.log(`      - Exam: ${sub.examId?.title || 'N/A'}`);
        console.log(`      - Type: ${sub.examId?.type || sub.examId?.examType || 'N/A'}`);
        console.log(`      - Status: ${sub.status}`);
        console.log(`      - Total Score: ${sub.totalScore}`);
        console.log(`      - Band Score: ${sub.bandScore || 'N/A'}`);
        console.log(`      - Sections: ${sub.sections?.length || 0}`);
        if (sub.sections && sub.sections.length > 0) {
          sub.sections.forEach(section => {
            console.log(`        • ${section.sectionType}: ${section.sectionScore || 0}`);
          });
        }
      });
    } else {
      console.log('⚠️ [Dashboard] Không tìm thấy submission nào cho student này');
    }

    const practiceTests = submissions
      .filter(sub => {
        const hasExam = sub.examId && sub.totalScore !== undefined;
        if (!hasExam) {
          console.log(`⚠️ [Dashboard] Submission ${sub._id} bị loại: examId=${!!sub.examId}, totalScore=${sub.totalScore}`);
        }
        return hasExam;
      })
      .map((sub, index) => {
        const exam = sub.examId;
        console.log(`🔄 [Dashboard] Processing submission ${index + 1}/${submissions.length}: ${sub._id}`);
        
        const result = {
          id: sub._id.toString(),
          testName: exam.title,
          date: sub.createdAt,
          type: exam.examType || exam.type || 'toeic'
        };

        console.log(`   Type detected: ${result.type}`);

        // Calculate scores by section type
        if (exam.type === 'toeic' || exam.examType === 'toeic') {
          const listeningSection = sub.sections?.find(s => s.sectionType === 'listening');
          const readingSection = sub.sections?.find(s => s.sectionType === 'reading');
          const writingSection = sub.sections?.find(s => s.sectionType === 'writing');
          const speakingSection = sub.sections?.find(s => s.sectionType === 'speaking');

          result.listening = listeningSection?.sectionScore || 0;
          result.reading = readingSection?.sectionScore || 0;
          result.writing = writingSection?.sectionScore || 0;
          result.speaking = speakingSection?.sectionScore || 0;
          result.total = sub.totalScore || 0;
          
          console.log(`   TOEIC Scores - L:${result.listening} R:${result.reading} W:${result.writing} S:${result.speaking} Total:${result.total}`);
        } else if (exam.type === 'ielts' || exam.examType === 'ielts') {
          const listeningSection = sub.sections?.find(s => s.sectionType === 'listening');
          const readingSection = sub.sections?.find(s => s.sectionType === 'reading');
          const writingSection = sub.sections?.find(s => s.sectionType === 'writing');
          const speakingSection = sub.sections?.find(s => s.sectionType === 'speaking');

          result.listening = listeningSection?.sectionScore || 0;
          result.reading = readingSection?.sectionScore || 0;
          result.writing = writingSection?.sectionScore || 0;
          result.speaking = speakingSection?.sectionScore || 0;
          result.overallBand = sub.bandScore || 0;
          
          console.log(`   IELTS Scores - L:${result.listening} R:${result.reading} W:${result.writing} S:${result.speaking} Band:${result.overallBand}`);
        }

        return result;
      });

    console.log(`✅ [Dashboard] Đã xử lý xong ${practiceTests.length} practice tests`);

    // 6. Calculate class details with progress
    const classesWithDetails = await Promise.all(
      activeClasses.map(async (cls) => {
        const totalSchedules = await ClassSchedule.countDocuments({
          class: cls._id
        });

        const completedSchedules = await ClassSchedule.countDocuments({
          class: cls._id,
          date: { $lt: new Date() }
        });

        const studentSchedules = await StudentSchedule.find({
          student: studentId,
          classSchedule: { $in: await ClassSchedule.find({ class: cls._id }).distinct('_id') }
        }).lean();

        const presentCount = studentSchedules.filter(s => s.attendance?.status === 'present').length;
        const attendanceRate = studentSchedules.length > 0 
          ? Math.round((presentCount / studentSchedules.length) * 100) 
          : 100;

        // Get schedule pattern
        const schedules = await ClassSchedule.find({
          class: cls._id
        })
          .select('date startTime endTime')
          .limit(3)
          .lean();

        const schedulePattern = schedules.length > 0
          ? `${schedules[0].startTime} - ${schedules[0].endTime}`
          : 'N/A';

        return {
          id: cls._id.toString(),
          className: cls.name,
          program: cls.course?.name || 'N/A',
          course: cls.course?.name || 'N/A',
          teacher: cls.teacher?.username || 'N/A',
          room: cls.room?.room_name || 'N/A',
          schedule: schedulePattern,
          totalLessons: totalSchedules,
          completedLessons: completedSchedules,
          attendanceRate
        };
      })
    );

    // Format week schedule for frontend
    const formattedWeekSchedule = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(currentDate.getDate() + i);
      
      const daySchedules = weekSchedules.filter(s => {
        const scheduleDate = new Date(s.date);
        return scheduleDate.toDateString() === currentDate.toDateString();
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      formattedWeekSchedule.push({
        dayName: currentDate.toLocaleDateString('vi-VN', { weekday: 'short' }),
        dayNumber: currentDate.getDate(),
        isToday: currentDate.toDateString() === today.toDateString(),
        schedules: daySchedules.map(s => ({
          time: `${s.startTime} - ${s.endTime}`,
          subject: s.class?.course?.name || s.session?.title || 'N/A',
          room: s.room?.room_name || 'N/A',
          className: s.class?.name
        }))
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy dữ liệu dashboard thành công',
      data: {
        studentInfo: {
          name: student.username,
          email: student.email,
          phone: student.phone
        },
        weekSchedule: formattedWeekSchedule,
        assignments,
        practiceTests,
        activeClasses: classesWithDetails
      }
    });
    
    console.log('🎉 [Dashboard] Response gửi thành công với:');
    console.log(`   - Student: ${student.username}`);
    console.log(`   - Week schedule: ${formattedWeekSchedule.length} days`);
    console.log(`   - Assignments: ${assignments.length} items`);
    console.log(`   - Practice tests: ${practiceTests.length} items`);
    console.log(`   - Active classes: ${classesWithDetails.length} classes`);
    
  } catch (error) {
    console.error('❌ [Dashboard] Lỗi khi lấy dữ liệu dashboard:', error);
    console.error('   Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy dữ liệu dashboard',
      error: error.message
    });
  }
};

// =========================
// 📋 LẤY TẤT CẢ HỌC VIÊN (cho Academic Staff/Admin)
// =========================
exports.getAllStudents = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    
    // Find Student role
    const studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role học viên'
      });
    }
    
    // Build query
    let query = { roleId: studentRole._id };
    
    // Search by username, email, or phone
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count
    const total = await User.countDocuments(query);
    
    // Get students
    const students = await User.find(query)
      .select('-password -token')
      .populate('roleId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    // Get class count for each student
    const studentsWithClasses = await Promise.all(
      students.map(async (student) => {
        const classCount = await Class.countDocuments({ students: student._id });
        return {
          ...student,
          classCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      students: studentsWithClasses,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách học viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách học viên',
      error: error.message
    });
  }
};

// =========================
// 📊 THỐNG KÊ HỌC VIÊN
// =========================
exports.getStudentStats = async (req, res) => {
  try {
    // Find Student role
    const studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role học viên'
      });
    }
    
    // Total students
    const total = await User.countDocuments({ roleId: studentRole._id });
    
    // Students with classes (active)
    const studentsWithClasses = await Class.distinct('students');
    const active = studentsWithClasses.length;
    
    // Students without classes (inactive)
    const inactive = total - active;
    
    // Total classes
    const totalClasses = await Class.countDocuments();
    
    res.status(200).json({
      success: true,
      stats: {
        total,
        active,
        inactive,
        totalClasses
      }
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy thống kê học viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê học viên',
      error: error.message
    });
  }
};

// =========================
// 👤 LẤY THÔNG TIN HỌC VIÊN THEO ID
// =========================
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find Student role
    const studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role học viên'
      });
    }
    
    const student = await User.findOne({
      _id: id,
      roleId: studentRole._id
    })
      .select('-password -token')
      .populate('roleId', 'name')
      .lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học viên'
      });
    }
    
    // Get class count
    const classCount = await Class.countDocuments({ students: id });
    
    res.status(200).json({
      success: true,
      student: {
        ...student,
        classCount
      }
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy thông tin học viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin học viên',
      error: error.message
    });
  }
};

// =========================
// ➕ TẠO HỌC VIÊN MỚI
// =========================
exports.createStudent = async (req, res) => {
  try {
    const { email, password, username, phone, address } = req.body;
    
    // Find Student role
    const studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role học viên'
      });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại trong hệ thống'
      });
    }
    
    // Check if username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username đã tồn tại trong hệ thống'
      });
    }
    
    // Check if phone number already exists
    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại đã tồn tại trong hệ thống'
        });
      }
    }
    
    // Create student
    const student = await User.create({
      email,
      password,
      username,
      phone,
      address,
      roleId: studentRole._id
    });
    
    const studentData = await User.findById(student._id)
      .select('-password -token')
      .populate('roleId', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Tạo học viên thành công',
      student: studentData
    });
  } catch (error) {
    console.error('❌ Lỗi khi tạo học viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo học viên',
      error: error.message
    });
  }
};

// =========================
// ✏️ CẬP NHẬT HỌC VIÊN - ĐÃ VÔ HIỆU HÓA
// =========================
exports.updateStudent = async (req, res) => {
  // Không cho phép cập nhật thông tin học viên
  return res.status(403).json({
    success: false,
    message: 'Không được phép cập nhật thông tin học viên'
  });
};

// =========================
// 🗑️ XÓA HỌC VIÊN - ĐÃ VÔ HIỆU HÓA
// =========================
exports.deleteStudent = async (req, res) => {
  // Không cho phép xóa thông tin học viên
  return res.status(403).json({
    success: false,
    message: 'Không được phép xóa học viên'
  });
};

// =========================
// 📥 IMPORT HỌC VIÊN HÀNG LOẠT
// =========================
exports.importStudents = async (req, res) => {
  try {
    const { students } = req.body;
    
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách học viên không hợp lệ'
      });
    }
    
    // Find Student role
    const studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role học viên'
      });
    }
    
    const results = {
      success: [],
      failed: []
    };
    
    // Process each student
    for (const studentData of students) {
      try {
        // Check if email exists
        const emailExists = await User.findOne({ email: studentData.email });
        if (emailExists) {
          results.failed.push({
            email: studentData.email,
            username: studentData.username,
            phone: studentData.phone || '',
            reason: 'Email đã tồn tại trong hệ thống'
          });
          continue;
        }
        
        // Check if username exists
        const usernameExists = await User.findOne({ username: studentData.username });
        if (usernameExists) {
          results.failed.push({
            email: studentData.email,
            username: studentData.username,
            phone: studentData.phone || '',
            reason: 'Username đã tồn tại trong hệ thống'
          });
          continue;
        }
        
        // Check if phone number exists
        if (studentData.phone) {
          const phoneExists = await User.findOne({ phone: studentData.phone });
          if (phoneExists) {
            results.failed.push({
              email: studentData.email,
              username: studentData.username,
              phone: studentData.phone,
              reason: 'Số điện thoại đã tồn tại trong hệ thống'
            });
            continue;
          }
        }
        
        // Create student
        const newStudent = await User.create({
          email: studentData.email,
          username: studentData.username,
          phone: studentData.phone || '',
          address: studentData.address || '',
          password: studentData.password || '123456', // Default password
          roleId: studentRole._id
        });
        
        results.success.push({
          _id: newStudent._id,
          email: newStudent.email,
          username: newStudent.username
        });
      } catch (error) {
        results.failed.push({
          email: studentData.email,
          username: studentData.username,
          phone: studentData.phone || '',
          reason: error.message || 'Lỗi không xác định'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Import thành công ${results.success.length} học viên, thất bại ${results.failed.length} học viên`,
      total: students.length,
      successCount: results.success.length,
      failedCount: results.failed.length,
      results
    });
  } catch (error) {
    console.error('❌ Lỗi khi import học viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi import học viên',
      error: error.message
    });
  }
};

module.exports = exports;
