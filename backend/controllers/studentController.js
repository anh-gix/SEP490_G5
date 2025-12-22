const mongoose = require("mongoose");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Class = require("../models/classModel");
const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");
const HomeworkSubmission = require("../models/homeworkSubmissionModel");
const Program = require("../models/programModel");
const Course = require("../models/courseModel");

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
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy thông tin học viên',
      error: error.message 
    });
  }
};

// =========================
//  LẤY DANH SÁCH LỚP HỌC CỦA HỌC VIÊN
// =========================
exports.getMyClasses = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { status } = req.query;

    // Ensure studentId is ObjectId
    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId) 
      ? (studentId instanceof mongoose.Types.ObjectId ? studentId : new mongoose.Types.ObjectId(studentId))
      : studentId;


    // Find all classes where student is enrolled
    // Query: find classes where students array contains this studentId
    // MongoDB automatically searches in array when using { students: studentId }
    // But we can also use $in to be explicit: { students: { $in: [studentObjectId] } }
    let query = { students: studentObjectId };
    if (status && status !== 'all') {
      query.status = status;
    }


    // Also try to find all classes and filter manually to debug
    const allClasses = await Class.find({}).select('_id name students status').lean();
    const classesWithStudent = allClasses.filter(cls => {
      if (!cls.students || !Array.isArray(cls.students)) return false;
      return cls.students.some(s => {
        const sId = s.toString ? s.toString() : s;
        const studentIdStr = studentObjectId.toString ? studentObjectId.toString() : studentObjectId;
        return sId === studentIdStr;
      });
    });
    classesWithStudent.forEach(cls => {
    });

    const classes = await Class.find(query)
      .populate('course', 'name description')
      .populate('teacher', 'username email')
      .populate('room', 'room_name')
      .sort({ startDate: -1 })
      .lean();

    
    // If no classes found and status filter is active, try without status filter
    if (classes.length === 0 && status && status !== 'all') {
      const queryWithoutStatus = { students: studentObjectId };
      const classesWithoutStatus = await Class.find(queryWithoutStatus)
        .populate('course', 'name description')
        .populate('teacher', 'username email')
        .populate('room', 'room_name')
        .sort({ startDate: -1 })
        .lean();
      if (classesWithoutStatus.length > 0) {
        classesWithoutStatus.map(c => ({
          name: c.name,
          status: c.status,
          _id: c._id
        }));
      }
    }

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
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy danh sách lớp học',
      error: error.message 
    });
  }
};

// =========================
//  LẤY CHI TIẾT MỘT LỚP HỌC CỦA HỌC VIÊN (bao gồm điểm mocktest)
// =========================
exports.getMyClassDetail = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { classId } = req.params;

    // Validate classId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({
        success: false,
        message: 'ID lớp học không hợp lệ'
      });
    }

    // Find class and check if student is enrolled
    const classData = await Class.findById(classId)
      .populate({
        path: 'course',
        select: 'name description program mocktestSessionOrders',
        populate: {
          path: 'program',
          select: 'name type'
        }
      })
      .populate('teacher', 'username email')
      .populate('room', 'room_name')
      .lean();

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học'
      });
    }

    // Check if student is enrolled in this class OR has makeup schedules in this class
    const isEnrolled = classData.students.some(
      s => s.toString() === studentId.toString()
    );

    // If not enrolled, check if student has any StudentSchedule for this class (makeup/audit)
    let hasAccess = isEnrolled;
    if (!hasAccess) {
      // Get all ClassSchedules for this class
      const classSchedules = await ClassSchedule.find({ class: classId })
        .select('_id')
        .lean();
      
      const classScheduleIds = classSchedules.map(cs => cs._id);
      
      // Check if student has any StudentSchedule for these ClassSchedules
      if (classScheduleIds.length > 0) {
        const studentSchedule = await StudentSchedule.findOne({
          student: studentId,
          classSchedule: { $in: classScheduleIds }
        }).lean();
        
        hasAccess = !!studentSchedule;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập lớp học này'
      });
    }

    // Get student info
    const student = await User.findById(studentId)
      .select('username email')
      .lean();

    // Get all schedules for this class
    const schedules = await ClassSchedule.find({ class: classId })
      .sort({ date: 1 })
      .lean();

    // Get student schedules (attendance records)
    const studentSchedules = await StudentSchedule.find({
      student: studentId,
      classSchedule: { $in: schedules.map(s => s._id) }
    }).lean();

    // Calculate attendance stats
    const attendanceStats = {
      total: studentSchedules.length,
      present: studentSchedules.filter(s => s.attendance?.status === 'present').length,
      absent: studentSchedules.filter(s => s.attendance?.status === 'absent').length,
      late: studentSchedules.filter(s => s.attendance?.status === 'late').length,
      excused: studentSchedules.filter(s => s.attendance?.status === 'excused').length
    };

    // Get attendance rate
    const attendanceRate = studentSchedules.length > 0
      ? Math.round((attendanceStats.present / studentSchedules.length) * 100)
      : 0;

    // Calculate schedule pattern
    let schedulePattern = '';
    if (schedules.length > 0) {
      const firstSchedule = schedules[0];
      schedulePattern = `${firstSchedule.startTime} - ${firstSchedule.endTime}`;
    }

    // Extract student's mocktest scores from ClassSchedule.mocktest.scores
    // Structure: { mocktest5: { sessionOrder: 5, totalScore: 6.5, skillScores: {...} }, mocktest11: {...} }
    const mocktestScores = {};
    
    // Filter schedules that have mocktest data
    const mocktestSchedules = schedules.filter(s => s.mocktest && s.mocktest.scores && s.mocktest.scores.length > 0);
    
    mocktestSchedules.forEach(schedule => {
      // Find this student's score in the mocktest.scores array
      const studentScore = schedule.mocktest.scores.find(
        score => score.studentId.toString() === studentId.toString()
      );
      
      if (studentScore) {
        // Get session order from mocktest.order or session reference
        const sessionOrder = schedule.mocktest.order;
        if (sessionOrder) {
          // Calculate total score (average of 4 skills)
          const { reading = 0, listening = 0, writing = 0, speaking = 0 } = studentScore;
          const totalScore = ((reading + listening + writing + speaking) / 4).toFixed(1);
          
          // Create mocktest key (e.g., "mocktest5", "mocktest11")
          const mocktestKey = `mocktest${sessionOrder}`;
          
          mocktestScores[mocktestKey] = {
            scheduleId: schedule._id,
            sessionOrder: sessionOrder,
            totalScore: parseFloat(totalScore),
            skillScores: {
              reading: reading,
              listening: listening,
              writing: writing,
              speaking: speaking
            }
          };
        }
      }
    });

    // Return class detail with student's mocktest scores
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết lớp học thành công',
      data: {
        _id: classData._id,
        name: classData.name,
        course: classData.course,
        teacher: classData.teacher,
        room: classData.room,
        startDate: classData.startDate,
        endDate: classData.endDate,
        status: classData.status,
        totalLessons: schedules.length,
        completedLessons: schedules.filter(s => new Date(s.date) < new Date()).length,
        attendanceStats,
        attendanceRate,
        schedulePattern,
        // Student's personal mocktest scores extracted from ClassSchedule
        mocktestScores: mocktestScores,
        // Student info
        studentInfo: {
          _id: student._id,
          username: student.username,
          email: student.email
        }
      }
    });
  } catch (error) {
    console.error('Error in getMyClassDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết lớp học',
      error: error.message
    });
  }
};

// =========================
//  LẤY LỊCH HỌC CỦA HỌC VIÊN
// =========================
exports.getMySchedule = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { startDate, endDate } = req.query;

    // Query StudentSchedule entries for this student first
    let studentSchedulesQuery = StudentSchedule.find({ student: studentId })
      .populate({
        path: 'classSchedule',
        select: 'date startTime endTime room class topic session status',
        populate: [
          {
            path: 'class',
            select: 'name course',
            populate: {
              path: 'course',
              select: 'name'
            }
          },
          {
            path: 'room',
            select: 'room_name location'
          },
          {
            path: 'session',
            select: 'title order content'
          }
        ]
      })
      .lean();

    const studentSchedules = await studentSchedulesQuery;


    if (!studentSchedules || studentSchedules.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Học viên chưa có lịch học nào',
        total: 0,
        schedules: []
      });
    }

    // Count how many have classSchedule populated
    const withClassSchedule = studentSchedules.filter(ss => ss.classSchedule).length;
    const withoutClassSchedule = studentSchedules.length - withClassSchedule;

    // Filter by date range if provided (filter after populate)
    let filteredSchedules = studentSchedules.filter(ss => {
      if (!ss.classSchedule) {
        return false;
      }
      
      if (startDate && endDate) {
        // Normalize dates to avoid timezone issues - compare only date part
        const scheduleDate = new Date(ss.classSchedule.date);
        const scheduleDateOnly = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());
        
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        const isInRange = scheduleDateOnly >= start && scheduleDateOnly <= end;
        
        if (!isInRange) {
        }
        
        return isInRange;
      }
      
      return true;
    });
    

    // Sort by date and startTime
    filteredSchedules.sort((a, b) => {
      if (!a.classSchedule || !b.classSchedule) return 0;
      const dateA = new Date(a.classSchedule.date);
      const dateB = new Date(b.classSchedule.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return (a.classSchedule.startTime || "").localeCompare(b.classSchedule.startTime || "");
    });

    // Format schedules to match expected response structure
    const formattedSchedules = filteredSchedules.map(ss => {
      const classSchedule = ss.classSchedule;
      
      if (!classSchedule) {
        return null;
      }
      
      return {
        _id: classSchedule._id, // ClassSchedule ID
        studentScheduleId: ss._id, // StudentSchedule ID - needed for makeup_class requests
        date: classSchedule.date,
        startTime: classSchedule.startTime,
        endTime: classSchedule.endTime,
        className: classSchedule.class?.name,
        courseName: classSchedule.class?.course?.name,
        sessionTitle: classSchedule.session?.title,
        sessionOrder: classSchedule.session?.order,
        roomName: classSchedule.room?.room_name,
        location: classSchedule.room?.location,
        topic: classSchedule.topic,
        status: classSchedule.status,
        attendance: ss.attendance || null,
        scheduleStatus: ss.scheduleStatus || 'scheduled',
        class: classSchedule.class,
        room: classSchedule.room,
        session: classSchedule.session
      };
    }).filter(schedule => schedule !== null); // Remove null entries

    res.status(200).json({
      success: true,
      message: 'Lấy lịch học thành công',
      total: formattedSchedules.length,
      schedules: formattedSchedules
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy lịch học',
      error: error.message 
    });
  }
};

// =========================
//  LẤY CHI TIẾT BUỔI HỌC
// =========================
exports.getLessonDetail = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { scheduleId } = req.params;



const makeup_class = await ClassSchedule.findById(scheduleId)
      .populate('room', 'room_name location')
      .populate('session', 'title order content objectives')
      .populate('teacher', 'username email')
      .lean();


    // Find the class schedule
    const classSchedule = await ClassSchedule.findById(scheduleId)
      .populate({
        path: 'class',
        populate: [
          { path: 'course', select: 'name description level' },
          { path: 'teacher', select: 'username email' }
        ]
      })
      .populate('teacher', 'username email') // Populate teacher của ClassSchedule
      .populate('substituteTeacher', 'username email') // Populate substituteTeacher của ClassSchedule
      .populate('room', 'room_name location')
      .populate('session', 'title order content objectives')
      .lean();


     

    if (!classSchedule) {
      // const makeup_class = await ClassSchedule.findById(scheduleId)
      // .populate('room', 'room_name location')
      // .populate('session', 'title order content objectives')
      // .populate('teacher', 'username email')
      // .lean();


        return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    // Check if student is enrolled in this class OR has StudentSchedule for this schedule (makeup/audit)
    let isEnrolled = false;
    
    if (classSchedule.class) {
      // Regular class: check if student is enrolled
      isEnrolled = classSchedule.class.students.some(
        s => s.toString() === studentId.toString()
      );
      
      // If not enrolled, check if student has StudentSchedule for this schedule (makeup/audit)
      if (!isEnrolled) {
        const studentSchedule = await StudentSchedule.findOne({
          student: studentId,
          classSchedule: scheduleId
        }).lean();
        
        isEnrolled = !!studentSchedule;
      }
    } else {
      // Makeup class (no class): check if student has StudentSchedule for this schedule
      const studentSchedule = await StudentSchedule.findOne({
        student: studentId,
        classSchedule: scheduleId
      }).lean();
      
      isEnrolled = !!studentSchedule;
    }

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
      className: classSchedule.class?.name || 'Lớp học bù',
      level: classSchedule.class?.course?.level,
      courseName: classSchedule.class?.course?.name,
      courseDescription: classSchedule.class?.course?.description,
      
      // Session info
      topic: classSchedule.session?.title || classSchedule.topic || 'Chưa có chủ đề',
      lessonNumber: classSchedule.session?.order || 0,
      description: classSchedule.session?.content || classSchedule.description || '',
      objectives: classSchedule.session?.objectives || [],
      
      // Teacher info
      // Ưu tiên: substituteTeacher > teacher (ClassSchedule) > class.teacher
      teacher: {
        name: classSchedule.substituteTeacher?.username || 
              classSchedule.teacher?.username || 
              classSchedule.class?.teacher?.username,
        email: classSchedule.substituteTeacher?.email || 
               classSchedule.teacher?.email || 
               classSchedule.class?.teacher?.email
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
      studentScheduleId: studentSchedule?._id || null,
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
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy tài liệu',
      error: error.message 
    });
  }
};

// =========================
//  LẤY BÀI TẬP CỦA LỚP HỌC
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
            title: hw.assignment?.title || 'Bài tập',
            description: hw.assignment?.description || '',
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
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy bài tập',
      error: error.message 
    });
  }
};

// =========================
//  LẤY TIẾN ĐỘ HỌC TẬP
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

    // Get all schedules for this class with session populated
    const schedules = await ClassSchedule.find({ class: classId })
      .populate('session', 'order topic')
      .sort({ date: 1 })
      .lean();

    // Get student schedules (attendance)
    const scheduleIds = schedules.map(s => s._id);
    const studentSchedules = await StudentSchedule.find({
      student: studentId,
      classSchedule: { $in: scheduleIds }
    }).lean();

    // Create a map of classSchedule to studentSchedule for easy lookup
    const studentScheduleMap = {};
    studentSchedules.forEach(ss => {
      studentScheduleMap[ss.classSchedule.toString()] = ss;
    });

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

    // Get list of absent lessons (buổi nghỉ)
    const absentLessons = [];
    studentSchedules.forEach(ss => {
      if (ss.attendance?.status === 'absent') {
        const schedule = schedules.find(sch => sch._id.toString() === ss.classSchedule.toString());
        if (schedule) {
          absentLessons.push({
            scheduleId: schedule._id,
            lessonNumber: schedule.session?.order || 0,
            lessonTopic: schedule.session?.topic || 'Không có chủ đề',
            date: schedule.date,
            reason: ss.attendance?.note || 'Không có lý do'
          });
        }
      }
    });

    // Get all homework from schedules
    const allHomework = [];
    schedules.forEach(schedule => {
      if (schedule.homework && schedule.homework.length > 0) {
        schedule.homework.forEach(hw => {
          allHomework.push({
            classScheduleId: schedule._id,
            homeworkId: hw._id,
            title: hw.assignment?.title || 'Bài tập',
            deadline: hw.deadline,
            lessonNumber: schedule.session?.order || 0
          });
        });
      }
    });

    // Get homework submissions
    const HomeworkSubmission = require('../models/homeworkSubmissionModel');
    const submissions = await HomeworkSubmission.find({
      student: studentId,
      classSchedule: { $in: scheduleIds }
    }).lean();

    // Create submission map by homeworkId
    const submissionMap = {};
    submissions.forEach(sub => {
      submissionMap[sub.homeworkId.toString()] = sub;
    });

    // Calculate homework stats
    const homeworkStats = {
      total: allHomework.length,
      submitted: 0,
      late: 0,
      notSubmitted: 0
    };

    const incompleteHomework = [];
    const lateHomework = [];

    allHomework.forEach(hw => {
      const submission = submissionMap[hw.homeworkId.toString()];
      if (submission) {
        if (submission.status === 'submitted' || submission.status === 'late') {
          homeworkStats.submitted++;
          if (submission.status === 'late') {
            homeworkStats.late++;
            lateHomework.push({
              homeworkId: hw.homeworkId,
              title: hw.title,
              deadline: hw.deadline,
              submittedAt: submission.submittedAt,
              lessonNumber: hw.lessonNumber
            });
          }
        } else {
          homeworkStats.notSubmitted++;
          incompleteHomework.push({
            homeworkId: hw.homeworkId,
            title: hw.title,
            deadline: hw.deadline,
            lessonNumber: hw.lessonNumber
          });
        }
      } else {
        homeworkStats.notSubmitted++;
        incompleteHomework.push({
          homeworkId: hw.homeworkId,
          title: hw.title,
          deadline: hw.deadline,
          lessonNumber: hw.lessonNumber
        });
      }
    });

    // Get mocktest scores as array (sorted by mocktest order)
    const mocktestScores = [];
    const mocktestSchedules = schedules.filter(s => s.mocktest && s.mocktest.scores && s.mocktest.scores.length > 0);
    console.log('Found mocktestSchedules:', mocktestSchedules.length);

    mocktestSchedules.forEach(schedule => {
      const studentScore = schedule.mocktest.scores.find(
        score => score.studentId.toString() === studentId.toString()
      );
      console.log('Student Score for mocktest:', studentScore);
      
      if (studentScore) {
        const { reading = 0, listening = 0, writing = 0, speaking = 0 } = studentScore;
        const totalScore = ((reading + listening + writing + speaking) / 4).toFixed(1);
        
        let mocktestOrdertemp = 0;
        if (!schedule.mocktest.order) {
          mocktestOrdertemp++;
        } else {
          mocktestOrdertemp = schedule.mocktest.order;
        }
        mocktestScores.push({
          mocktestNumber: mocktestOrdertemp,
          sessionOrder: mocktestOrdertemp,
          title: schedule.mocktest.title || `Mocktest ${mocktestOrdertemp}`,
          totalScore: parseFloat(totalScore),
          skillScores: {
            reading: reading,
            listening: listening,
            writing: writing,
            speaking: speaking
          },
          date: schedule.date
        });
      }
    });

    // Sort mocktest scores by order
    mocktestScores.sort((a, b) => a.mocktestNumber - b.mocktestNumber);

    res.status(200).json({
      success: true,
      message: 'Lấy tiến độ học tập thành công',
      progress: {
        className: studentClass.name,
        courseName: studentClass.course?.name,
        
        // Attendance
        attendanceStats,
        attendanceRate,
        absentLessons, // Danh sách buổi nghỉ
        
        // Homework
        homeworkStats,
        incompleteHomework, // Danh sách bài tập chưa nộp
        lateHomework, // Danh sách bài tập nộp muộn
        
        // Lessons
        totalLessons: schedules.length,
        completedLessons: schedules.filter(s => new Date(s.date) < new Date()).length,
        
        // Mocktest scores (array sorted by order)
        mocktestScores
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy tiến độ',
      error: error.message 
    });
  }
};

// =========================
//  NỘP BÀI TẬP
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
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi nộp bài tập',
      error: error.message 
    });
  }
};

exports.getMySubmission = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { classId, scheduleId, homeworkId } = req.params;

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

    const submission = await HomeworkSubmission.findOne({
      classSchedule: scheduleId,
      homeworkId: homeworkId,
      student: studentId
    }).lean();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài nộp'
      });
    }

    const submissionData = {
      _id: submission._id,
      submittedAt: submission.submittedAt,
      isLate: submission.status === 'late',
      status: submission.status,
      files: submission.submittedFiles?.map(f => f.fileUrl) || [],
      score: submission.score,
      feedback: submission.feedback,
      attemptNumber: submission.attemptNumber || 1,
      gradedAt: submission.gradedAt
    };

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin bài nộp thành công',
      submission: submissionData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy thông tin bài nộp',
      error: error.message 
    });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const studentId = req.user._id;

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

    const activeClasses = await Class.find({
      students: studentId,
      status: 'active'
    })
      .populate('course', 'name')
      .populate('teacher', 'username')
      .populate('room', 'room_name')
      .select('name course teacher room startDate endDate')
      .lean();

    const classIds = activeClasses.map(cls => cls._id);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Query từ StudentSchedule để lấy TẤT CẢ buổi học (bao gồm cả học bù)
    const studentSchedules = await StudentSchedule.find({
      student: studentId,
      scheduleStatus: { $nin: ['cancelled'] } // Không lấy buổi đã bị hủy
    })
      .populate({
        path: 'classSchedule',
        match: {
          date: { $gte: startOfWeek, $lte: endOfWeek }
        },
        populate: [
          {
            path: 'class',
            select: 'name course',
            populate: {
              path: 'course',
              select: 'name'
            }
          },
          {
            path: 'room',
            select: 'room_name'
          },
          {
            path: 'session',
            select: 'title order'
          }
        ]
      })
      .lean();

    // Lọc bỏ những StudentSchedule không có classSchedule hoặc classSchedule không match date
    // Và transform thành format giống ClassSchedule
    const weekSchedules = studentSchedules
      .filter(ss => ss.classSchedule && ss.classSchedule.date)
      .map(ss => ({
        ...ss.classSchedule,
        studentScheduleId: ss._id,
        scheduleStatus: ss.scheduleStatus
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB;
        }
        return (a.startTime || '').localeCompare(b.startTime || '');
      });

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
    
    const Submission = require('../models/submissionModel');
    const Exam = require('../models/examModel');
    
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


    const practiceTests = submissions
      .filter(sub => {
        const hasExam = sub.examId && sub.sections && sub.sections.length > 0;
        return hasExam;
      })
      .map((sub, index) => {
        const exam = sub.examId;
        const examType = (exam.examType || exam.type || 'toeic').toLowerCase();
        
        const result = {
          id: sub._id.toString(),
          testName: exam.title,
          date: sub.createdAt,
          type: examType
        };

        // Tính điểm từng kỹ năng bằng cách cộng sectionScore của sections cùng sectionType
        const skillScores = {
          listening: 0,
          reading: 0,
          writing: 0,
          speaking: 0
        };

        // Duyệt qua tất cả sections và cộng điểm theo sectionType
        if (sub.sections && Array.isArray(sub.sections)) {
          sub.sections.forEach(section => {
            const skillType = section.sectionType?.toLowerCase();
            if (skillType && skillScores.hasOwnProperty(skillType)) {
              skillScores[skillType] += (section.sectionScore || 0);
            }
          });
        }

        // Format kết quả theo loại đề thi
        if (examType === 'toeic') {
          // TOEIC: Chỉ hiển thị Listening và Reading
          result.listening = skillScores.listening;
          result.reading = skillScores.reading;
          result.total = skillScores.listening + skillScores.reading;
        } else if (examType === 'ielts') {
          // IELTS: Hiển thị Listening, Reading và "chưa chấm" cho Writing, Speaking
          result.listening = skillScores.listening;
          result.reading = skillScores.reading;
          result.writing = skillScores.writing > 0 ? skillScores.writing : null; // null = chưa chấm
          result.speaking = skillScores.speaking > 0 ? skillScores.speaking : null; // null = chưa chấm
          // Calculate overall band (trung bình 4 kỹ năng nếu có đủ)
          const scoredSkills = [skillScores.listening, skillScores.reading, skillScores.writing, skillScores.speaking].filter(s => s > 0);
          result.overallBand = scoredSkills.length > 0 
            ? Math.round((scoredSkills.reduce((a, b) => a + b, 0) / scoredSkills.length) * 10) / 10
            : 0;
        } else if (examType === 'cambridge') {
          // Cambridge: Reading & Writing (dùng score từ reading), Listening
          result.readingWriting = skillScores.reading; // Tận dụng sectionType reading
          result.listening = skillScores.listening;
          result.total = skillScores.reading + skillScores.listening;
          result.shields = Math.round(result.total / 15); // Giả sử tổng điểm tối đa là 150, mỗi shield = 15 điểm
        }

        return result;
      });


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
          className: s.class?.name || 'Lớp học bù' // Hiển thị "Lớp học bù" nếu không có class
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
    
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy dữ liệu dashboard',
      error: error.message
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const { search, status, programType, level, page = 1, limit = 50 } = req.query;
    
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
    
    // Filter by program type and/or level
    let studentIdsToFilter = null;
    if (programType || level) {
      // Build program query
      const programQuery = {};
      if (programType) programQuery.type = programType;
      if (level) programQuery.level = level;
      
      // Find programs matching the criteria
      const programs = await Program.find(programQuery).select('_id');
      const programIds = programs.map(p => p._id);
      
      if (programIds.length > 0) {
        // Find courses belonging to these programs
        const courses = await Course.find({ program: { $in: programIds } }).select('_id');
        const courseIds = courses.map(c => c._id);
        
        if (courseIds.length > 0) {
          // Find classes with these courses
          const classes = await Class.find({ course: { $in: courseIds } }).select('students');
          // Get all unique student IDs from these classes
          const studentIdSet = new Set();
          classes.forEach(cls => {
            if (cls.students && Array.isArray(cls.students)) {
              cls.students.forEach(studentId => {
                // Keep as ObjectId, not string
                studentIdSet.add(studentId);
              });
            }
          });
          studentIdsToFilter = Array.from(studentIdSet);
        }
      }
      
      // If no students found matching the filter, return empty result
      if (studentIdsToFilter && studentIdsToFilter.length === 0) {
        return res.status(200).json({
          success: true,
          students: [],
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0
        });
      }
    }
    
    // Apply filter to student query if needed
    if (studentIdsToFilter && studentIdsToFilter.length > 0) {
      query._id = { $in: studentIdsToFilter };
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
    
    // Get class names for each student
    const studentsWithClasses = await Promise.all(
      students.map(async (student) => {
        const classes = await Class.find({ students: student._id })
          .select('name')
          .lean();
        const classNames = classes.map(cls => cls.name);
        return {
          ...student,
          stats: {
            classCount: classNames.length,
            classNames: classNames
          }
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
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách học viên',
      error: error.message
    });
  }
};

// =========================
//  THỐNG KÊ HỌC VIÊN
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
    
    // Get classes that student is enrolled in
    const classes = await Class.find({ students: id })
      .populate({
        path: 'course',
        select: '_id name',
        populate: { path: 'program', select: 'level' }
      })
      .populate('students', 'username email')
      .select('_id name course status students')
      .lean();
    
    // Format classes with level from program
    const formattedClasses = classes.map(cls => ({
      _id: cls._id,
      name: cls.name,
      course: cls.course ? { 
        _id: cls.course._id,
        name: cls.course.name 
      } : null,
      level: cls.course?.program?.level || 'N/A',
      status: cls.status,
      students: cls.students || []
    }));

    // Get courses that student is enrolled in (from studentEnrollments)
    const enrolledCourses = await Course.find({
      studentEnrollments: id
    })
      .populate('program', 'program_name name type level')
      .select('name description program')
      .lean();
    
    res.status(200).json({
      success: true,
      student: {
        ...student,
        classes: formattedClasses,
        classCount: formattedClasses.length,
        courses: enrolledCourses || [] // Courses from studentEnrollments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin học viên',
      error: error.message
    });
  }
};

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
    
    // Validate phone number length (10 digits only)
    // Allow duplicate phone numbers
    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '');
      // Validate BEFORE adding leading zero
      if (phoneDigits.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại không được để trống'
        });
      }
      
      let normalizedPhone = phoneDigits;
      if (phoneDigits[0] === '0') {
        // Has leading zero: must be exactly 10 digits
        if (phoneDigits.length !== 10) {
          return res.status(400).json({
            success: false,
            message: 'Số điện thoại phải có 10 chữ số'
          });
        }
      } else {
        // No leading zero (Excel removed it): must be exactly 9 digits
        if (phoneDigits.length !== 9) {
          return res.status(400).json({
            success: false,
            message: 'Số điện thoại phải có 9 chữ số (thiếu số 0 ở đầu do Excel)'
          });
        }
        // Add leading zero to normalize to 10 digits
        normalizedPhone = '0' + phoneDigits;
      }
      // Update phone with normalized value
      phone = normalizedPhone;
    }
    
    // Create student
    const student = await User.create({
      email,
      password: password || '123456', // Default password nếu không có
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

exports.deleteStudent = async (req, res) => {
  // Không cho phép xóa thông tin học viên
  return res.status(403).json({
    success: false,
    message: 'Không được phép xóa học viên'
  });
};

// Helper function to parse levelsToStudy string into array of levels
// Example: "B1 → B2" → ["B1", "B2"]
// Example: "A1 → A2 → B1" → ["A1", "A2", "B1"]
const parseLevelsToStudy = (levelsToStudyStr) => {
  if (!levelsToStudyStr || typeof levelsToStudyStr !== 'string') {
    return [];
  }

  // Remove whitespace and split by various arrow formats
  const cleaned = levelsToStudyStr.trim();
  if (!cleaned) {
    return [];
  }

  // Split by arrow characters: "→" or "->" (with optional spaces around)
  // Don't split by single "-" to avoid issues with levels like "Pre-A1"
  const levels = cleaned
    .split(/→|->/)
    .map(level => level.trim())
    .filter(level => level.length > 0);

  return levels;
};

// Helper function to find existing student by email or phone
const findExistingStudent = async (email, phone, studentRole) => {
  try {
    // Only check by email, allow duplicate phone numbers
    if (email) {
      const byEmail = await User.findOne({ email: email.toLowerCase() });
      if (byEmail && byEmail.roleId && byEmail.roleId.toString() === studentRole._id.toString()) {
        return byEmail;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Helper function to enroll student into courses based on levelsToStudy and programCode (REQUIRED)
const enrollStudentInCourses = async (studentId, levelsToStudyStr, type, programCode) => {
  try {
    // Validate required parameters
    if (!levelsToStudyStr || !type || !programCode) {
      return {
        enrolled: 0,
        courses: [],
        error: 'Missing required parameters: levelsToStudy, type, and programCode are all required'
      };
    }

    // Parse levels from string
    const levels = parseLevelsToStudy(levelsToStudyStr);
    if (levels.length === 0) {
      return { enrolled: 0, courses: [], error: 'Invalid levelsToStudy format' };
    }

    const typeStr = type.toString().trim().toLowerCase();
    const programCodeStr = programCode.toString().trim();

    if (!programCodeStr) {
      return { enrolled: 0, courses: [], error: 'Program code is required and cannot be empty' };
    }

    // Parse multiple program codes (split by comma, semicolon, or pipe)
    const programCodes = programCodeStr
      .split(/[,;|]/)
      .map(code => code.trim())
      .filter(code => code.length > 0);

    if (programCodes.length === 0) {
      return { enrolled: 0, courses: [], error: 'No valid program codes found' };
    }

    // Find programs by codes - ONLY use program codes, no fallback to type+level
    // Only use approved programs (programs that have been approved by Center Head)
    const programs = await Program.find({
      code: { $in: programCodes },
      status: 'approved'
    }).select('_id level code');

    if (programs.length === 0) {
      return {
        enrolled: 0,
        courses: [],
        error: `None of the program codes [${programCodes.join(', ')}] found in the system`
      };
    }

    // Log warning if some codes were not found
    const foundCodes = programs.map(p => p.code);
    const notFoundCodes = programCodes.filter(code => !foundCodes.includes(code));
    if (notFoundCodes.length > 0) {
      console.log(`Warning: Programs with codes [${notFoundCodes.join(', ')}] not found.`);
    }

    const programIds = programs.map(p => p._id);

    // Find all courses belonging to these programs
    // Get courses with status 'completed' or 'active' (courses ready to use)
    const courses = await Course.find({
      program: { $in: programIds },
      status: { $in: ['completed', 'active'] }
    }).select('_id name program status');

    if (courses.length === 0) {
      return {
        enrolled: 0,
        courses: [],
        error: `No active courses found for programs [${foundCodes.join(', ')}]`
      };
    }

    // Enroll student in all courses
    let enrolledCount = 0;
    const enrolledCourseIds = [];

    for (const course of courses) {
      try {
        // Use $addToSet to avoid duplicates
        const result = await Course.updateOne(
          { _id: course._id },
          { $addToSet: { studentEnrollments: studentId } }
        );

        if (result.modifiedCount > 0 || result.matchedCount > 0) {
          enrolledCount++;
          enrolledCourseIds.push(course._id);

          // If course status was 'completed' and now has students, change to 'active'
          if (course.status === 'completed') {
            try {
              await Course.updateOne(
                { _id: course._id },
                { $set: { status: 'active' } }
              );
              console.log(`Course ${course._id} status changed from 'completed' to 'active'`);
            } catch (statusError) {
              console.error(`Error updating course status for ${course._id}:`, statusError.message);
            }
          }
        }
      } catch (courseError) {
        // Continue with other courses even if one fails
        console.error(`Error enrolling in course ${course._id}:`, courseError.message);
      }
    }

    return {
      enrolled: enrolledCount,
      courses: enrolledCourseIds,
      programsFound: foundCodes
    };
  } catch (error) {
    return { enrolled: 0, courses: [], error: error.message };
  }
};

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
      created: [],
      enrolled: [],
      skipped: [],
      failed: []
    };
    
    // Process each student
    for (const studentData of students) {
      try {
        // Check if email or phone exists (existing account)
        const existingStudent = await findExistingStudent(
          studentData.email,
          studentData.phone,
          studentRole
        );
        
        if (existingStudent) {
          // Student already exists, try to enroll in courses
          if (studentData.levelsToStudy && studentData.type && studentData.programCode) {
            try {
              const enrollmentResult = await enrollStudentInCourses(
                existingStudent._id,
                studentData.levelsToStudy,
                studentData.type,
                studentData.programCode
              );

              // Check if enrollment returned an error
              if (enrollmentResult.error) {
                results.skipped.push({
                  email: studentData.email,
                  username: studentData.username,
                  phone: studentData.phone || '',
                  reason: enrollmentResult.error
                });
              } else {
                results.enrolled.push({
                  _id: existingStudent._id,
                  email: existingStudent.email,
                  username: existingStudent.username,
                  phone: existingStudent.phone || '',
                  enrolledCourses: enrollmentResult.enrolled || 0
                });
              }
            } catch (enrollmentError) {
              results.skipped.push({
                email: studentData.email,
                username: studentData.username,
                phone: studentData.phone || '',
                reason: 'Không thể đăng ký khóa học: ' + (enrollmentError.message || 'Lỗi không xác định')
              });
            }
          } else {
            const missingFields = [];
            if (!studentData.levelsToStudy) missingFields.push('lộ trình học');
            if (!studentData.type) missingFields.push('loại chương trình');
            if (!studentData.programCode) missingFields.push('mã chương trình');

            results.skipped.push({
              email: studentData.email,
              username: studentData.username,
              phone: studentData.phone || '',
              reason: `Học viên đã có tài khoản nhưng thiếu thông tin: ${missingFields.join(', ')}`
            });
          }
          continue;
        }
        
        // Validate phone number length (10 digits only)
        let normalizedPhone = studentData.phone || '';
        if (studentData.phone) {
          const phoneDigits = studentData.phone.replace(/\D/g, '');
          // Validate BEFORE adding leading zero
          if (phoneDigits.length === 0) {
            results.failed.push({
              email: studentData.email,
              username: studentData.username,
              phone: studentData.phone || '',
              reason: 'Số điện thoại không được để trống'
            });
            continue;
          }
          
          if (phoneDigits[0] === '0') {
            // Has leading zero: must be exactly 10 digits
            if (phoneDigits.length !== 10) {
              results.failed.push({
                email: studentData.email,
                username: studentData.username,
                phone: studentData.phone || '',
                reason: 'Số điện thoại phải có 10 chữ số'
              });
              continue;
            }
            normalizedPhone = phoneDigits;
          } else {
            // No leading zero (Excel removed it): must be exactly 9 digits
            if (phoneDigits.length !== 9) {
              results.failed.push({
                email: studentData.email,
                username: studentData.username,
                phone: studentData.phone || '',
                reason: 'Số điện thoại phải có 9 chữ số (thiếu số 0 ở đầu do Excel)'
              });
              continue;
            }
            // Add leading zero to normalize to 10 digits
            normalizedPhone = '0' + phoneDigits;
          }
        }
        
        // Create new student
        const newStudent = await User.create({
          email: studentData.email,
          username: studentData.username,
          phone: normalizedPhone,
          address: studentData.address || '',
          password: studentData.password || '123456', // Default password
          roleId: studentRole._id
        });
        
        // Enroll student in courses based on levelsToStudy
        // Note: We don't save aim, currentLevel, type, levelsToStudy, programCode to User model
        // They are only used to determine which courses to enroll in
        if (studentData.levelsToStudy && studentData.type && studentData.programCode) {
          try {
            const enrollmentResult = await enrollStudentInCourses(
              newStudent._id,
              studentData.levelsToStudy,
              studentData.type,
              studentData.programCode
            );

            // Log if enrollment returned an error (but don't fail the student creation)
            if (enrollmentResult.error) {
              console.error(`Enrollment error for ${studentData.email}:`, enrollmentResult.error);
            }
          } catch (enrollmentError) {
            // Log error but don't fail the import
            console.error(`Enrollment exception for ${studentData.email}:`, enrollmentError.message);
          }
        }

        results.created.push({
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
    
    const createdCount = results.created.length;
    const enrolledCount = results.enrolled.length;
    const skippedCount = results.skipped.length;
    const failedCount = results.failed.length;
    
    let message = '';
    if (createdCount > 0) {
      message += `Tạo mới ${createdCount} học viên. `;
    }
    if (enrolledCount > 0) {
      message += `Đăng ký khóa học cho ${enrolledCount} học viên đã có. `;
    }
    if (skippedCount > 0) {
      message += `Bỏ qua ${skippedCount} học viên. `;
    }
    if (failedCount > 0) {
      message += `Thất bại ${failedCount} học viên. `;
    }
    if (!message) {
      message = 'Không có học viên nào được xử lý';
    }
    
    res.status(200).json({
      success: true,
      message: message.trim(),
      total: students.length,
      createdCount: createdCount,
      enrolledCount: enrolledCount,
      skippedCount: skippedCount,
      failedCount: failedCount,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi import học viên',
      error: error.message
    });
  }
};

// =========================
//  CẬP NHẬT KHÓA HỌC CỦA HỌC VIÊN
// =========================
exports.updateStudentCourseEnrollments = async (req, res) => {
  const session = await require('mongoose').startSession();
  session.startTransaction();
  
  try {
    const { id: studentId } = req.params;
    const { courseIds } = req.body;

    if (!Array.isArray(courseIds)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'courseIds phải là một mảng'
      });
    }

    // Validate student exists
    const studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role học viên'
      });
    }

    const student = await User.findOne({
      _id: studentId,
      roleId: studentRole._id
    }).session(session);

    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học viên'
      });
    }

    // Get courses that student is currently enrolled in
    const currentlyEnrolledCourses = await Course.find({
      studentEnrollments: studentId
    }).session(session).select('_id').lean();
    
    const currentCourseIds = currentlyEnrolledCourses.map(c => c._id.toString());
    const newCourseIds = courseIds.map(id => id.toString());
    
    // Find courses to add (in new list but not in current)
    const coursesToAdd = newCourseIds.filter(id => !currentCourseIds.includes(id));
    
    // Find courses to remove (in current but not in new)
    const coursesToRemove = currentCourseIds.filter(id => !newCourseIds.includes(id));
    
    const updatedCourses = [];

    // Add student to new courses using $addToSet to avoid duplicates
    if (coursesToAdd.length > 0) {
      const mongoose = require('mongoose');
      const result = await Course.updateMany(
        { _id: { $in: coursesToAdd.map(id => new mongoose.Types.ObjectId(id)) } },
        { $addToSet: { studentEnrollments: new mongoose.Types.ObjectId(studentId) } },
        { session }
      );
      updatedCourses.push(...coursesToAdd);

      // Update course status from 'completed' to 'active' for courses that now have students
      const coursesToActivate = await Course.find({
        _id: { $in: coursesToAdd.map(id => new mongoose.Types.ObjectId(id)) },
        status: 'completed'
      }).session(session).select('_id name');

      if (coursesToActivate.length > 0) {
        await Course.updateMany(
          { _id: { $in: coursesToActivate.map(c => c._id) } },
          { $set: { status: 'active' } },
          { session }
        );
        console.log(`Updated ${coursesToActivate.length} courses from 'completed' to 'active' when enrolling student ${studentId}`);
      }
    }

    // Remove student from courses using $pull
    if (coursesToRemove.length > 0) {
      const mongoose = require('mongoose');
      const result = await Course.updateMany(
        { _id: { $in: coursesToRemove.map(id => new mongoose.Types.ObjectId(id)) } },
        { $pull: { studentEnrollments: new mongoose.Types.ObjectId(studentId) } },
        { session }
      );
      updatedCourses.push(...coursesToRemove);

      // Check if courses now have no students, if so change from 'active' to 'completed'
      const coursesAfterRemoval = await Course.find({
        _id: { $in: coursesToRemove.map(id => new mongoose.Types.ObjectId(id)) },
        status: 'active'
      }).session(session).select('_id name studentEnrollments');

      for (const course of coursesAfterRemoval) {
        if (course.studentEnrollments.length === 0) {
          await Course.updateOne(
            { _id: course._id },
            { $set: { status: 'completed' } },
            { session }
          );
          console.log(`Course ${course._id} status changed from 'active' to 'completed' (no more students)`);
        }
      }
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Cập nhật khóa học của học viên thành công',
      updatedCourses: updatedCourses.length,
      courseIds: updatedCourses
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật khóa học của học viên',
      error: error.message
    });
  }
};

// =========================
//  ĐỔI LỚP HỌC CỦA HỌC VIÊN
// =========================
exports.changeStudentClass = async (req, res) => {
  const mongoose = require('mongoose');
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id: studentId } = req.params;
    const { oldClassId, newClassId } = req.body;
    
    // 1. Validate dữ liệu
    if (!oldClassId || !newClassId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin lớp cũ hoặc lớp mới'
      });
    }
    
    // Validate student exists
    const studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role học viên'
      });
    }
    
    const student = await User.findOne({
      _id: studentId,
      roleId: studentRole._id
    }).session(session);
    
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học viên'
      });
    }
    
    // Kiểm tra lớp cũ và lớp mới có tồn tại
    const oldClass = await Class.findById(oldClassId).session(session);
    const newClass = await Class.findById(newClassId).session(session);
    
    if (!oldClass) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp cũ'
      });
    }
    
    if (!newClass) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp mới'
      });
    }
    
    // Kiểm tra học viên có trong lớp cũ không
    const studentInOldClass = oldClass.students.some(
      id => id.toString() === studentId.toString()
    );
    
    if (!studentInOldClass) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Học viên không có trong lớp cũ'
      });
    }
    
    // Kiểm tra lớp mới còn chỗ không (nếu có maxStudents)
    if (newClass.maxStudents) {
      const currentStudentCount = newClass.students ? newClass.students.length : 0;
      const studentInNewClass = newClass.students.some(
        id => id.toString() === studentId.toString()
      );
      // Nếu học viên chưa có trong lớp mới và lớp đã đầy
      if (!studentInNewClass && currentStudentCount >= newClass.maxStudents) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Lớp mới đã đầy'
        });
      }
    }
    
    // 2. Lấy session order hiện tại của lớp cũ và lớp mới
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Tìm ClassSchedule gần nhất (date >= today) của lớp cũ
    const oldClassSchedules = await ClassSchedule.find({
      class: oldClassId,
      date: { $gte: today }
    })
      .populate('session', 'order')
      .sort({ date: 1, startTime: 1 })
      .limit(1)
      .session(session)
      .lean();
    
    // Tìm ClassSchedule gần nhất (date >= today) của lớp mới
    const newClassSchedules = await ClassSchedule.find({
      class: newClassId,
      date: { $gte: today }
    })
      .populate('session', 'order')
      .sort({ date: 1, startTime: 1 })
      .limit(1)
      .session(session)
      .lean();
    
    const oldClassSessionOrder = oldClassSchedules.length > 0 && oldClassSchedules[0].session
      ? oldClassSchedules[0].session.order
      : null;
    const newClassSessionOrder = newClassSchedules.length > 0 && newClassSchedules[0].session
      ? newClassSchedules[0].session.order
      : null;
    
    
    // Xác định trường hợp
    let caseType = 1; // Mặc định là trường hợp 1
    if (oldClassSessionOrder !== null && newClassSessionOrder !== null) {
      if (oldClassSessionOrder < newClassSessionOrder) {
        caseType = 2; // Lớp cũ < lớp mới
      } else if (oldClassSessionOrder > newClassSessionOrder) {
        caseType = 3; // Lớp cũ > lớp mới
      }
    }
    
    
    // 3. Xử lý Class model
    // Xóa học viên khỏi lớp cũ
    oldClass.students = oldClass.students.filter(
      id => id.toString() !== studentId.toString()
    );
    await oldClass.save({ session });
    
    // Thêm học viên vào lớp mới (nếu chưa có)
    const studentInNewClass = newClass.students.some(
      id => id.toString() === studentId.toString()
    );
    if (!studentInNewClass) {
      newClass.students.push(studentId);
      await newClass.save({ session });
    }
    
    // 4. Xử lý StudentSchedule
    // a) Lấy tất cả ClassSchedule của lớp cũ
    const allOldClassSchedules = await ClassSchedule.find({
      class: oldClassId
    })
      .populate('session', 'order')
      .session(session)
      .lean();
    
    const oldClassScheduleIds = allOldClassSchedules.map(s => s._id);
    
    // b) Lấy tất cả StudentSchedule của học viên ở lớp cũ
    const studentSchedules = await StudentSchedule.find({
      student: studentId,
      classSchedule: { $in: oldClassScheduleIds }
    })
      .populate({
        path: 'classSchedule',
        populate: {
          path: 'session',
          select: 'order'
        }
      })
      .session(session)
      .lean();
    
    // c) Lấy tất cả ClassSchedule của lớp mới để match
    const allNewClassSchedules = await ClassSchedule.find({
      class: newClassId
    })
      .populate('session', 'order')
      .session(session)
      .lean();
    
    // Tạo map để tìm ClassSchedule theo session order
    const newClassScheduleMap = new Map();
    allNewClassSchedules.forEach(schedule => {
      if (schedule.session && schedule.session.order !== null && schedule.session.order !== undefined) {
        const order = schedule.session.order;
        if (!newClassScheduleMap.has(order)) {
          newClassScheduleMap.set(order, []);
        }
        newClassScheduleMap.get(order).push(schedule);
      }
    });
    
    // d) Xử lý từng StudentSchedule
    let updatedCount = 0;
    let cancelledCount = 0;
    let unchangedCount = 0;
    
    for (const studentSchedule of studentSchedules) {
      const classSchedule = studentSchedule.classSchedule;
      if (!classSchedule) continue;
      
      const sessionOrder = classSchedule.session?.order;
      const hasAttendance = studentSchedule.attendance && studentSchedule.attendance.status !== null;
      const scheduleDate = new Date(classSchedule.date);
      scheduleDate.setHours(0, 0, 0, 0);
      const isPastSchedule = scheduleDate < today;
      
      // Nếu đã có điểm danh hoặc đã diễn ra, giữ nguyên
      if (hasAttendance || isPastSchedule) {
        unchangedCount++;
        continue;
      }
      
      // Xử lý theo từng trường hợp
      if (caseType === 1) {
        // Trường hợp 1: session order bằng nhau
        if (sessionOrder !== null && sessionOrder !== undefined) {
          const matchingSchedules = newClassScheduleMap.get(sessionOrder);
          if (matchingSchedules && matchingSchedules.length > 0) {
            // Lấy ClassSchedule đầu tiên có cùng session order
            const newClassScheduleId = matchingSchedules[0]._id;
            await StudentSchedule.findByIdAndUpdate(
              studentSchedule._id,
              { classSchedule: newClassScheduleId },
              { session }
            );
            updatedCount++;
          }
        }
      } else if (caseType === 2) {
        // Trường hợp 2: lớp cũ < lớp mới
        if (sessionOrder !== null && sessionOrder !== undefined) {
          if (sessionOrder < newClassSessionOrder) {
            // Cancel các buổi có sessionOrder < newClassSessionOrder
            await StudentSchedule.findByIdAndUpdate(
              studentSchedule._id,
              {
                scheduleStatus: 'cancelled',
                reason: 'Đã đổi lớp'
              },
              { session }
            );
            cancelledCount++;
          } else if (sessionOrder >= newClassSessionOrder) {
            // Session order >= lớp mới: update classSchedule
            const matchingSchedules = newClassScheduleMap.get(sessionOrder);
            if (matchingSchedules && matchingSchedules.length > 0) {
              const newClassScheduleId = matchingSchedules[0]._id;
              await StudentSchedule.findByIdAndUpdate(
                studentSchedule._id,
                { classSchedule: newClassScheduleId },
                { session }
              );
              updatedCount++;
              console.log(` Updated StudentSchedule ${studentSchedule._id} -> ClassSchedule ${newClassScheduleId} (session ${sessionOrder})`);
            }
          }
        }
      } else if (caseType === 3) {
        // Trường hợp 3: lớp cũ > lớp mới
        if (sessionOrder !== null && sessionOrder !== undefined) {
          if (sessionOrder < oldClassSessionOrder) {
            // Session order < lớp cũ: không thay đổi gì
            unchangedCount++;
          } else if (sessionOrder >= oldClassSessionOrder) {
            // Session order >= lớp cũ: update classSchedule
            const matchingSchedules = newClassScheduleMap.get(sessionOrder);
            if (matchingSchedules && matchingSchedules.length > 0) {
              const newClassScheduleId = matchingSchedules[0]._id;
              await StudentSchedule.findByIdAndUpdate(
                studentSchedule._id,
                { classSchedule: newClassScheduleId },
                { session }
              );
              updatedCount++;
              console.log(` Updated StudentSchedule ${studentSchedule._id} -> ClassSchedule ${newClassScheduleId} (session ${sessionOrder})`);
            }
          }
        }
      }
    }
    
    // Tạo StudentSchedule mới cho các buổi học tương lai của lớp mới mà học viên chưa có
    const existingStudentScheduleIds = studentSchedules
      .map(ss => ss.classSchedule?._id?.toString())
      .filter(id => id);
    
    const futureNewClassSchedules = allNewClassSchedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      scheduleDate.setHours(0, 0, 0, 0);
      return scheduleDate >= today && !existingStudentScheduleIds.includes(schedule._id.toString());
    });
    
    for (const classSchedule of futureNewClassSchedules) {
      // Chỉ tạo StudentSchedule cho các buổi có session order >= session order hiện tại của lớp mới
      if (newClassSessionOrder !== null && classSchedule.session?.order !== null) {
        if (classSchedule.session.order >= newClassSessionOrder) {
          await StudentSchedule.create([{
            student: studentId,
            classSchedule: classSchedule._id,
            scheduleStatus: 'scheduled'
          }], { session });
        }
      } else {
        // Nếu không có session order, tạo cho tất cả buổi tương lai
        await StudentSchedule.create([{
          student: studentId,
          classSchedule: classSchedule._id,
          scheduleStatus: 'scheduled'
        }], { session });
      }
    }
    
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      message: 'Đổi lớp học thành công',
      data: {
        oldClassId,
        newClassId,
        updatedSchedules: updatedCount,
        cancelledSchedules: cancelledCount,
        unchangedSchedules: unchangedCount
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đổi lớp học',
      error: error.message
    });
  }
};

module.exports = exports;
