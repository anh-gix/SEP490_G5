const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Class = require("../models/classModel");
const ClassSchedule = require("../models/classScheduleModel");

// =========================
// 📋 LẤY DANH SÁCH GIẢNG VIÊN
// =========================
exports.getAllTeachers = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    // First, find the teacher role
    const teacherRole = await Role.findOne({ name: 'Teacher' });
    
    if (!teacherRole) {
      // Log all available roles for debugging
      const allRoles = await Role.find({}).select('name');
      console.error('❌ Không tìm thấy role Teacher. Các roles hiện có:', allRoles);
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy role giảng viên",
        error: "Role 'Teacher' không tồn tại trong database",
        availableRoles: allRoles.map(r => r.name)
      });
    }
    
    console.log('✅ Found teacher role:', teacherRole.name, teacherRole._id);
    
    let query = { roleId: teacherRole._id };
    
    // Search by username or email
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const teachers = await User.find(query)
      .select('-password -token')
      .populate('roleId', 'name description')
      .sort({ username: 1 });
    
    console.log(`📋 Found ${teachers.length} users with roleId: ${teacherRole._id} (${teacherRole.name})`);
    
    // Get additional info for each teacher
    const teachersWithStats = await Promise.all(
      teachers.map(async (teacher) => {
        // Class model uses 'teacher' field, not 'teacherId'
        const classCount = await Class.countDocuments({ teacher: teacher._id });
        const classes = await Class.find({ teacher: teacher._id }).select('students');
        const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
        
        return {
          ...teacher.toObject(),
          stats: {
            classCount,
            totalStudents
          }
        };
      })
    );
    
    console.log(`✅ Returning ${teachersWithStats.length} teachers to frontend`);
    
    res.status(200).json({
      success: true,
      message: "Lấy danh sách giảng viên thành công",
      total: teachersWithStats.length,
      teachers: teachersWithStats
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách giảng viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy danh sách giảng viên",
      error: error.message 
    });
  }
};

// =========================
// 👤 LẤY THÔNG TIN GIẢNG VIÊN HIỆN TẠI (từ token)
// =========================
exports.getCurrentTeacher = async (req, res) => {
  try {
    // req.user được set bởi verifyToken middleware
    const teacherId = req.user._id;
    
    const teacher = await User.findById(teacherId)
      .select('-password -token')
      .populate('roleId', 'name');
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên'
      });
    }
    
    // Kiểm tra role
    if (teacher.roleId.name !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'User không phải là giảng viên'
      });
    }
    
    // Get classes taught by this teacher
    const classes = await Class.find({ teacher: teacherId })
      .select('name course startDate endDate students')
      .populate('course', 'name')
      .lean();
    
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
    
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin giảng viên thành công',
      teacher: {
        ...teacher.toObject(),
        stats: {
          classCount: classes.length,
          totalStudents
        }
      }
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy thông tin giảng viên hiện tại:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy thông tin giảng viên',
      error: error.message 
    });
  }
};

// =========================
// 🔍 LẤY THÔNG TIN 1 GIẢNG VIÊN
// =========================
exports.getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await User.findById(id)
      .select('-password -token')
      .populate('roleId', 'name');
    
    if (!teacher) {
      return res.status(404).json({ message: "Không tìm thấy giảng viên" });
    }
    
    // Get classes taught by this teacher
    const classes = await Class.find({ teacherId: id })
      .select('name subject students')
      .populate('students', 'username email');
    
    const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);
    
    res.status(200).json({
      message: "Lấy thông tin giảng viên thành công",
      teacher: {
        ...teacher.toObject(),
        classes,
        stats: {
          classCount: classes.length,
          totalStudents
        }
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin giảng viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy thông tin giảng viên",
      error: error.message 
    });
  }
};

// =========================
// ➕ TẠO GIẢNG VIÊN MỚI
// =========================
exports.createTeacher = async (req, res) => {
  try {
    const { username, email, password, phone, address } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !phone || !address) {
      return res.status(400).json({ 
        message: "Thiếu thông tin bắt buộc" 
      });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email đã tồn tại" 
      });
    }
    
    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ 
        message: "Username đã tồn tại" 
      });
    }
    
    // Find teacher role
    const teacherRole = await Role.findOne({ name: 'Teacher' });
    if (!teacherRole) {
      return res.status(404).json({ message: "Không tìm thấy role giảng viên" });
    }
    
    const newTeacher = await User.create({
      username,
      email,
      password,
      phone,
      address,
      roleId: teacherRole._id
    });
    
    // Remove sensitive data before sending response
    const teacherResponse = newTeacher.toObject();
    delete teacherResponse.password;
    delete teacherResponse.token;
    
    res.status(201).json({
      message: "Tạo giảng viên thành công",
      teacher: teacherResponse
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo giảng viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi tạo giảng viên",
      error: error.message 
    });
  }
};

// =========================
// ✏️ CẬP NHẬT GIẢNG VIÊN
// =========================
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, address } = req.body;
    
    const teacher = await User.findById(id);
    
    if (!teacher) {
      return res.status(404).json({ message: "Không tìm thấy giảng viên" });
    }
    
    // Check if new email already exists (excluding current user)
    if (email && email !== teacher.email) {
      const existingEmail = await User.findOne({ 
        email, 
        _id: { $ne: id } 
      });
      if (existingEmail) {
        return res.status(400).json({ 
          message: "Email đã tồn tại" 
        });
      }
    }
    
    // Check if new username already exists (excluding current user)
    if (username && username !== teacher.username) {
      const existingUsername = await User.findOne({ 
        username, 
        _id: { $ne: id } 
      });
      if (existingUsername) {
        return res.status(400).json({ 
          message: "Username đã tồn tại" 
        });
      }
    }
    
    // Update fields
    if (username) teacher.username = username;
    if (email) teacher.email = email;
    if (phone) teacher.phone = phone;
    if (address) teacher.address = address;
    
    await teacher.save();
    
    // Remove sensitive data
    const teacherResponse = teacher.toObject();
    delete teacherResponse.password;
    delete teacherResponse.token;
    
    res.status(200).json({
      message: "Cập nhật giảng viên thành công",
      teacher: teacherResponse
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật giảng viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi cập nhật giảng viên",
      error: error.message 
    });
  }
};

// =========================
// 🗑️ XÓA GIẢNG VIÊN
// =========================
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if teacher has any classes
    const classCount = await Class.countDocuments({ teacherId: id });
    
    if (classCount > 0) {
      return res.status(400).json({ 
        message: `Không thể xóa giảng viên. Giảng viên đang phụ trách ${classCount} lớp học.`,
        classCount
      });
    }
    
    const teacher = await User.findByIdAndDelete(id);
    
    if (!teacher) {
      return res.status(404).json({ message: "Không tìm thấy giảng viên" });
    }
    
    res.status(200).json({
      message: "Xóa giảng viên thành công"
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa giảng viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi xóa giảng viên",
      error: error.message 
    });
  }
};

// =========================
// 📅 LẤY LỊCH DẠY CỦA GIẢNG VIÊN HIỆN TẠI (từ token)
// =========================
exports.getCurrentTeacherSchedule = async (req, res) => {
  try {
    // req.user được set bởi verifyToken middleware
    const teacherId = req.user._id;
    const { startDate, endDate } = req.query;
    
    // Find all classes taught by this teacher
    const teacherClasses = await Class.find({ teacher: teacherId })
      .select('_id name course startDate endDate')
      .populate('course', 'name')
      .lean();
    
    if (!teacherClasses || teacherClasses.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Chưa có lớp học nào',
        total: 0,
        schedules: []
      });
    }
    
    const classIds = teacherClasses.map(cls => cls._id);
    
    let query = { class: { $in: classIds }, status: 'approved' };
    
    // Filter by date range if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const schedules = await ClassSchedule.find(query)
      .populate('class', 'name course startDate endDate')
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
    
    // Format schedules with additional info
    const formattedSchedules = schedules.map(schedule => ({
      ...schedule,
      className: schedule.class?.name,
      courseName: schedule.class?.course?.name,
      sessionTitle: schedule.session?.title,
      sessionOrder: schedule.session?.order,
      roomName: schedule.room?.room_name,
      location: schedule.room?.location,
      classStartDate: schedule.class?.startDate,
      classEndDate: schedule.class?.endDate
    }));
    
    res.status(200).json({
      success: true,
      message: 'Lấy lịch dạy thành công',
      total: formattedSchedules.length,
      schedules: formattedSchedules
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy lịch dạy:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy lịch dạy',
      error: error.message 
    });
  }
};

// =========================
// 📅 LẤY LỊCH DẠY CỦA GIẢNG VIÊN (Admin use)
// =========================
exports.getTeacherSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    // Find all classes taught by this teacher (Class model uses 'teacher' field, not 'teacherId')
    const teacherClasses = await Class.find({ teacher: id })
      .select('_id name startDate endDate')
      .lean();
    
    if (!teacherClasses || teacherClasses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Giảng viên này chưa có lớp nào",
        total: 0,
        schedules: []
      });
    }
    
    const classIds = teacherClasses.map(cls => cls._id);
    
    let query = { class: { $in: classIds }, status: 'approved' };
    
    // Filter by date range if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const schedules = await ClassSchedule.find(query)
      .populate('class', 'name startDate endDate')
      .populate('room', 'room_name location')
      .populate('session', 'title order')
      .sort({ date: 1, startTime: 1 })
      .lean();
    
    // Add class date range info to each schedule for easier conflict checking
    const schedulesWithClassInfo = schedules.map(schedule => {
      const classInfo = teacherClasses.find(c => c._id.toString() === schedule.class._id.toString());
      return {
        ...schedule,
        classStartDate: classInfo?.startDate,
        classEndDate: classInfo?.endDate
      };
    });
    
    res.status(200).json({
      success: true,
      message: "Lấy lịch dạy của giảng viên thành công",
      total: schedulesWithClassInfo.length,
      schedules: schedulesWithClassInfo
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch dạy:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy lịch dạy",
      error: error.message 
    });
  }
};

// =========================
// 📚 LẤY DANH SÁCH LỚP HỌC CỦA GIẢNG VIÊN HIỆN TẠI
// =========================
exports.getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { status } = req.query;

    // Build query
    let query = { teacher: teacherId };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Find all classes taught by this teacher
    const classes = await Class.find(query)
      .populate('course', 'name description testDate')
      .populate('students', 'username email')
      .populate('room', 'room_name')
      .sort({ startDate: -1 })
      .lean();

    // Get additional stats for each class
    const classesWithStats = await Promise.all(
      classes.map(async (cls) => {
        // Get all schedules for this class
        const allSchedules = await ClassSchedule.find({ 
          class: cls._id,
          status: 'approved' 
        })
          .populate('session', 'title order')
          .sort({ date: 1 })
          .lean();

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        // Calculate completed lessons
        const completedLessons = allSchedules.filter(s => {
          if (s.date < today) return true;
          if (s.date === today && s.endTime < currentTime) return true;
          return false;
        }).length;

        // Find next lesson
        const upcomingSchedules = allSchedules.filter(s => {
          if (s.date > today) return true;
          if (s.date === today && s.startTime >= currentTime) return true;
          return false;
        });
        const nextLesson = upcomingSchedules[0];

        // Get class schedule (lấy từ schedules)
        let schedule = 'Chưa có lịch';
        if (allSchedules.length > 0) {
          const schedulesByDay = {};
          allSchedules.forEach(s => {
            const dayOfWeek = new Date(s.date).getDay();
            const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            const key = `${dayNames[dayOfWeek]} ${s.startTime}-${s.endTime}`;
            schedulesByDay[key] = true;
          });
          schedule = Object.keys(schedulesByDay).slice(0, 2).join(', ');
        }

        // Calculate attendance rate (placeholder - would need StudentSchedule data)
        const totalStudents = cls.students?.length || 0;
        const presentStudents = Math.round(totalStudents * 0.85); // Placeholder

        // Count ungraded submissions (placeholder - would need Submission data)
        const ungradedSubmissions = Math.floor(Math.random() * 5); // Placeholder

        // Determine class status based on dates
        let classStatus = cls.status;
        if (cls.status === 'active') {
          if (new Date(cls.startDate) > new Date()) {
            classStatus = 'upcoming';
          } else if (new Date(cls.endDate) < new Date()) {
            classStatus = 'completed';
          }
        }

        return {
          _id: cls._id,
          name: cls.name,
          level: cls.name?.split('-')[0] || 'N/A',
          courseName: cls.course?.name,
          courseDescription: cls.course?.description,
          schedule,
          room: cls.room?.room_name || 'TBA',
          totalStudents,
          activeStudents: totalStudents,
          presentStudents,
          completedLessons,
          totalLessons: allSchedules.length,
          ungradedSubmissions,
          startDate: cls.startDate,
          endDate: cls.endDate,
          status: classStatus,
          nextLesson: nextLesson ? {
            topic: nextLesson.session?.title || 'Chưa có chủ đề',
            date: nextLesson.date,
            time: `${nextLesson.startTime} - ${nextLesson.endTime}`
          } : null
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
// 📖 LẤY CHI TIẾT LỚP HỌC CỦA GIẢNG VIÊN HIỆN TẠI
// =========================
exports.getMyClassDetail = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user._id;

    // Find the class
    const classInfo = await Class.findById(classId)
      .populate('course', 'name description testDate')
      .populate('teacher', 'username email')
      .populate('students', 'username email phone')
      .populate('room', 'room_name location')
      .lean();

    if (!classInfo) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy lớp học' 
      });
    }

    // Verify ownership
    if (classInfo.teacher._id.toString() !== teacherId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Bạn không có quyền xem lớp học này' 
      });
    }

    // Get all schedules/lessons for this class
    const lessons = await ClassSchedule.find({ 
      class: classId,
      status: 'approved' 
    })
      .populate('session', 'title order content')
      .populate('room', 'room_name location')
      .sort({ date: 1, startTime: 1 })
      .lean();

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Format lessons with status
    const formattedLessons = lessons.map((lesson, index) => {
      let status = 'scheduled';
      if (lesson.date < today || (lesson.date === today && lesson.endTime < currentTime)) {
        status = 'completed';
      } else if (lesson.date === today || (lesson.date > today && new Date(lesson.date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))) {
        status = 'upcoming';
      }

      // Count attendance (placeholder - would need StudentSchedule)
      const totalStudents = classInfo.students.length;
      const hasAttendance = status === 'completed';
      const attendanceCount = hasAttendance ? Math.round(totalStudents * (0.8 + Math.random() * 0.15)) : 0;

      return {
        _id: lesson._id,
        lessonNumber: index + 1,
        date: lesson.date,
        time: `${lesson.startTime} - ${lesson.endTime}`,
        topic: lesson.session?.title || 'Chưa có chủ đề',
        sessionOrder: lesson.session?.order,
        roomName: lesson.room?.room_name,
        status,
        hasAttendance,
        attendanceCount,
        totalStudents
      };
    });

    // Get materials from schedules
    const materials = [];
    lessons.forEach(lesson => {
      if (lesson.material && lesson.material.length > 0) {
        lesson.material.forEach(mat => {
          materials.push({
            _id: `${lesson._id}_${mat.title}`,
            title: mat.title,
            file: mat.file,
            type: mat.file?.endsWith('.pdf') ? 'document' : 
                  mat.file?.endsWith('.mp3') ? 'audio' : 
                  mat.file?.endsWith('.mp4') ? 'video' : 'document',
            uploadedAt: lesson.date,
            size: '2.5 MB', // Placeholder
            downloads: Math.floor(Math.random() * 50) // Placeholder
          });
        });
      }
    });

    // Get assignments/homework from schedules
    const HomeworkSubmission = require('../models/homeworkSubmissionModel');
    const assignments = [];
    
    for (const lesson of lessons) {
      if (lesson.homework && lesson.homework.length > 0) {
        for (const hw of lesson.homework) {
          const totalStudents = classInfo.students.length;
          
          // Get real submission statistics
          const submissions = await HomeworkSubmission.find({
            classSchedule: lesson._id,
            homeworkId: hw._id
          });
          
          const submittedCount = submissions.filter(
            s => s.status === 'submitted' || s.status === 'late'
          ).length;
          
          const lateCount = submissions.filter(
            s => s.status === 'late'
          ).length;

          assignments.push({
            _id: hw._id,
            classScheduleId: lesson._id,
            lessonDate: lesson.date,
            sessionOrder: lesson.session?.order,
            sessionTitle: lesson.session?.title,
            title: hw.assignment.title,
            files: hw.assignment.files || [], // Support multiple files
            answerFiles: hw.answerFiles || [], // Support multiple answer files
            type: 'homework',
            dueDate: hw.deadline,
            total: totalStudents,
            submitted: submittedCount,
            late: lateCount,
            notSubmitted: totalStudents - submittedCount,
            submissionRate: totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0
          });
        }
      }
    }

    // Get course info to check mocktest sessions
    const Course = require('../models/courseModel');
    const course = await Course.findById(classInfo.course._id);
    const mocktestSessionOrders = course?.mocktestSessionOrders || [];

    // Get StudentSchedule for attendance
    const StudentSchedule = require('../models/studentScheduleModel');

    // Format students with real stats
    const formattedStudents = await Promise.all(classInfo.students.map(async (student) => {
      // Get attendance data
      const studentSchedules = await StudentSchedule.find({
        student: student._id,
        classSchedule: { $in: lessons.map(l => l._id) }
      });
      
      const totalLessons = lessons.length;
      const attendedLessons = studentSchedules.filter(
        ss => ss.attendance?.status === 'present'
      ).length;
      const attendanceRate = totalLessons > 0 
        ? Math.round((attendedLessons / totalLessons) * 100) 
        : 0;

      // Get homework submissions
      const homeworkIds = lessons
        .flatMap(l => l.homework || [])
        .map(hw => hw._id);
      
      const submissions = await HomeworkSubmission.find({
        student: student._id,
        homeworkId: { $in: homeworkIds }
      });
      
      const submittedCount = submissions.filter(
        s => s.status === 'submitted' || s.status === 'late'
      ).length;
      const homeworkCompletionRate = assignments.length > 0
        ? Math.round((submittedCount / assignments.length) * 100)
        : 0;

      // Get mocktest scores
      const mocktestScores = {};
      for (const order of mocktestSessionOrders) {
        const mocktestLesson = lessons.find(
          l => l.session?.order === order && l.mocktest
        );
        
        if (mocktestLesson && mocktestLesson.mocktest?.scores) {
          const studentScore = mocktestLesson.mocktest.scores.find(
            s => s.studentId?.toString() === student._id.toString()
          );
          
          if (studentScore) {
            // Calculate total score based on test type
            let totalScore = 0;
            const mocktype = mocktestLesson.mocktest.type;
            
            if (mocktype === 'toeic') {
              // TOEIC: reading + listening (max 990)
              totalScore = (studentScore.reading || 0) + (studentScore.listening || 0);
            } else if (mocktype === 'ielts' || mocktype === 'cam') {
              // IELTS/CAM: average of 4 skills
              const scores = [
                studentScore.reading || 0,
                studentScore.listening || 0,
                studentScore.writing || 0,
                studentScore.speaking || 0
              ];
              totalScore = scores.reduce((a, b) => a + b, 0) / 4;
              totalScore = Math.round(totalScore * 10) / 10; // Round to 1 decimal
            }
            
            mocktestScores[`mocktest${order}`] = {
              totalScore,
              skillScores: {
                reading: studentScore.reading || 0,
                listening: studentScore.listening || 0,
                writing: studentScore.writing || 0,
                speaking: studentScore.speaking || 0
              }
            };
          } else {
            mocktestScores[`mocktest${order}`] = null;
          }
        } else {
          mocktestScores[`mocktest${order}`] = null;
        }
      }

      return {
        id: student._id,
        name: student.username,
        email: student.email,
        attendanceCount: attendedLessons,
        totalLessons: totalLessons,
        attendanceRate: attendanceRate,
        submittedAssignments: submittedCount,
        totalAssignments: assignments.length,
        homeworkCompletionRate: homeworkCompletionRate,
        mocktestScores: mocktestScores,
        mocktestSessionOrders: mocktestSessionOrders
      };
    }));

    // Calculate overall stats
    const completedLessons = formattedLessons.filter(l => l.status === 'completed').length;
    const nextLesson = formattedLessons.find(l => l.status === 'upcoming' || l.status === 'scheduled');
    const averageAttendance = Math.round(
      formattedStudents.reduce((sum, s) => sum + s.attendanceRate, 0) / formattedStudents.length
    );

    // Determine class status
    let classStatus = classInfo.status;
    if (classInfo.status === 'active') {
      if (new Date(classInfo.startDate) > new Date()) {
        classStatus = 'upcoming';
      } else if (new Date(classInfo.endDate) < new Date()) {
        classStatus = 'completed';
      }
    }

    // Build class schedule string
    let schedule = 'Chưa có lịch';
    if (lessons.length > 0) {
      const schedulesByDay = {};
      lessons.forEach(s => {
        const dayOfWeek = new Date(s.date).getDay();
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const key = `${dayNames[dayOfWeek]} ${s.startTime}-${s.endTime}`;
        schedulesByDay[key] = true;
      });
      schedule = Object.keys(schedulesByDay).slice(0, 2).join(', ');
    }

    const detailData = {
      classInfo: {
        _id: classInfo._id,
        name: classInfo.name,
        level: classInfo.name?.split('-')[0] || 'N/A',
        subject: classInfo.course?.name,
        courseDescription: classInfo.course?.description,
        schedule,
        room: classInfo.room?.room_name || 'TBA',
        roomLocation: classInfo.room?.location,
        totalStudents: classInfo.students.length,
        activeStudents: classInfo.students.length,
        completedLessons,
        totalLessons: lessons.length,
        averageAttendance,
        startDate: classInfo.startDate,
        endDate: classInfo.endDate,
        status: classStatus,
        nextLesson: nextLesson ? {
          topic: nextLesson.topic,
          date: nextLesson.date,
          time: nextLesson.time
        } : null
      },
      students: formattedStudents,
      lessons: formattedLessons,
      materials,
      assignments
    };

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết lớp học thành công',
      data: detailData
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy chi tiết lớp học:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy chi tiết lớp học',
      error: error.message 
    });
  }
};

// =========================
// 📖 LẤY CHI TIẾT BUỔI HỌC (ClassSchedule)
// =========================
exports.getLessonDetail = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const teacherId = req.user._id;

    // Find the schedule with full population
    const schedule = await ClassSchedule.findById(scheduleId)
      .populate({
        path: 'class',
        select: 'name course teacher students startDate endDate',
        populate: [
          {
            path: 'course',
            select: 'name description'
          },
          {
            path: 'teacher',
            select: 'username email'
          },
          {
            path: 'students',
            select: 'username email'
          }
        ]
      })
      .populate('room', 'room_name location capacity')
      .populate('session', 'title order content learningType')
      .lean();

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    // Verify teacher owns this class
    if (schedule.class?.teacher?._id?.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem buổi học này'
      });
    }

    // Format response
    const lessonDetail = {
      _id: schedule._id,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      status: schedule.status,
      
      // Class info
      className: schedule.class?.name,
      courseName: schedule.class?.course?.name,
      courseDescription: schedule.class?.course?.description,
      classStartDate: schedule.class?.startDate,
      classEndDate: schedule.class?.endDate,
      
      // Session info
      sessionTitle: schedule.session?.title,
      sessionOrder: schedule.session?.order,
      sessionContent: schedule.session?.content,
      learningType: schedule.session?.learningType,
      
      // Room info
      roomName: schedule.room?.room_name,
      roomLocation: schedule.room?.location,
      roomCapacity: schedule.room?.capacity,
      
      // Teacher info
      teacherName: schedule.class?.teacher?.username,
      teacherEmail: schedule.class?.teacher?.email,
      
      // Student info
      totalStudents: schedule.class?.students?.length || 0,
      students: schedule.class?.students || [],
      
      // Homework
      homework: schedule.homework || [],
      
      // Materials
      material: schedule.material || [],
      
      // Mocktest
      mocktest: schedule.mocktest,
      
      // Notes
      note: schedule.note
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
// 📝 CẬP NHẬT ĐIỂM MOCKTEST
// =========================
exports.updateMocktestScore = async (req, res) => {
  try {
    const { scheduleId, studentId } = req.params;
    const { reading, listening, writing, speaking } = req.body;
    const teacherId = req.user._id;

    // Validate input
    if (!scheduleId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin scheduleId hoặc studentId'
      });
    }

    // Find the schedule
    const schedule = await ClassSchedule.findById(scheduleId)
      .populate('class', 'teacher students');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    // Verify teacher ownership
    if (schedule.class.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật điểm cho lớp này'
      });
    }

    // Verify student is in class
    const isStudentInClass = schedule.class.students.some(
      s => s._id.toString() === studentId.toString()
    );

    if (!isStudentInClass) {
      return res.status(400).json({
        success: false,
        message: 'Học viên không thuộc lớp học này'
      });
    }

    // Check if schedule has mocktest
    if (!schedule.mocktest || !schedule.mocktest.order) {
      return res.status(400).json({
        success: false,
        message: 'Buổi học này không có bài mocktest'
      });
    }

    // Find or create score entry for student
    let studentScore = schedule.mocktest.scores.find(
      s => s.studentId.toString() === studentId.toString()
    );

    if (studentScore) {
      // Update existing score
      if (reading !== undefined) studentScore.reading = reading;
      if (listening !== undefined) studentScore.listening = listening;
      if (writing !== undefined) studentScore.writing = writing;
      if (speaking !== undefined) studentScore.speaking = speaking;
    } else {
      // Add new score
      schedule.mocktest.scores.push({
        studentId,
        reading: reading || 0,
        listening: listening || 0,
        writing: writing || 0,
        speaking: speaking || 0
      });
    }

    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật điểm mocktest thành công',
      data: {
        scheduleId: schedule._id,
        studentId,
        scores: studentScore || schedule.mocktest.scores[schedule.mocktest.scores.length - 1]
      }
    });
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật điểm mocktest:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật điểm mocktest',
      error: error.message
    });
  }
};

// =========================
// 📝 LƯU ĐIỂM DANH HÀNG LOẠT
// =========================
exports.saveAttendance = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { scheduleId } = req.params;
    const { attendanceData } = req.body; // Array of { studentId, status, checkInTime }

    // Verify schedule exists and teacher owns it
    const schedule = await ClassSchedule.findById(scheduleId).populate('class');
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    // Verify teacher owns this class
    if (schedule.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền điểm danh lớp này'
      });
    }

    // TODO: Tạm thời bỏ kiểm tra ngày để test
    // Verify class date
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // const scheduleDate = new Date(schedule.date);
    // scheduleDate.setHours(0, 0, 0, 0);

    // if (scheduleDate.getTime() !== today.getTime()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Chỉ được điểm danh vào ngày học'
    //   });
    // }

    const StudentSchedule = require('../models/studentScheduleModel');
    
    // Update attendance for each student
    const updatePromises = attendanceData.map(async ({ studentId, status, checkInTime }) => {
      // Find or create StudentSchedule
      let studentSchedule = await StudentSchedule.findOne({
        student: studentId,
        classSchedule: scheduleId
      });

      if (!studentSchedule) {
        // Create new StudentSchedule if doesn't exist
        studentSchedule = new StudentSchedule({
          student: studentId,
          classSchedule: scheduleId,
          scheduleStatus: 'scheduled'
        });
      }

      // Update attendance
      studentSchedule.attendance = {
        status,
        checkInTime: checkInTime ? new Date(checkInTime) : (status === 'present' || status === 'late' ? new Date() : null),
        markedBy: teacherId
      };

      return studentSchedule.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Lưu điểm danh thành công',
      totalUpdated: attendanceData.length
    });
  } catch (error) {
    console.error('❌ Lỗi khi lưu điểm danh:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lưu điểm danh',
      error: error.message
    });
  }
};

// =========================
// 📊 THỐNG KÊ GIẢNG VIÊN
// =========================
exports.getTeacherStats = async (req, res) => {
  try {
    // Find teacher role
    const teacherRole = await Role.findOne({ name: 'Teacher' });
    if (!teacherRole) {
      return res.status(404).json({ message: "Không tìm thấy role giảng viên" });
    }
    
    const totalTeachers = await User.countDocuments({ roleId: teacherRole._id });
    
    // Get all teachers with their class counts
    const teachers = await User.find({ roleId: teacherRole._id }).select('_id');
    const teacherIds = teachers.map(t => t._id);
    
    const totalClasses = await Class.countDocuments({ 
      teacherId: { $in: teacherIds } 
    });
    
    // Count teachers who have classes (active teachers)
    const activeTeacherIds = await Class.distinct('teacherId');
    const activeTeachers = activeTeacherIds.length;
    
    res.status(200).json({
      message: "Lấy thống kê giảng viên thành công",
      stats: {
        total: totalTeachers,
        active: activeTeachers,
        inactive: totalTeachers - activeTeachers,
        totalClasses
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê giảng viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy thống kê giảng viên",
      error: error.message 
    });
  }
};
