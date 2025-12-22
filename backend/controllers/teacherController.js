const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Class = require("../models/classModel");
const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");
const Program = require("../models/programModel");
const Course = require("../models/courseModel");
const mongoose = require('mongoose');

// Helper function to format date to Vietnamese locale (DD/MM/YYYY)
// Uses UTC methods to avoid timezone conversion issues
const formatDateToVN = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

exports.getAllTeachers = async (req, res) => {
  try {
    const { status, search, programType, level, page = 1, limit = 50 } = req.query;
    
    // First, find the teacher role
    const teacherRole = await Role.findOne({ name: 'Teacher' });
    
    if (!teacherRole) {
      // Log all available roles for debugging
      const allRoles = await Role.find({}).select('name');
      console.error(' Không tìm thấy role Teacher. Các roles hiện có:', allRoles);
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy role giảng viên",
        error: "Role 'Teacher' không tồn tại trong database",
        availableRoles: allRoles.map(r => r.name)
      });
    }
    
    let query = { roleId: teacherRole._id };
    
    // Search by username or email
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by program type and/or level
    let teacherIdsToFilter = null;
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
          // Find classes with these courses and get their teachers
          const classes = await Class.find({ course: { $in: courseIds } }).select('teacher');
          // Get all unique teacher IDs from these classes
          const teacherIdSet = new Set();
          classes.forEach(cls => {
            if (cls.teacher) {
              teacherIdSet.add(cls.teacher);
            }
          });
          teacherIdsToFilter = Array.from(teacherIdSet);
        }
      }
      
      // If no teachers found matching the filter, return empty result
      if (teacherIdsToFilter && teacherIdsToFilter.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Lấy danh sách giảng viên thành công",
          teachers: [],
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0
        });
      }
    }
    
    // Apply filter to teacher query if needed
    if (teacherIdsToFilter && teacherIdsToFilter.length > 0) {
      query._id = { $in: teacherIdsToFilter };
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count
    const total = await User.countDocuments(query);
    
    // Get teachers
    const teachers = await User.find(query)
      .select('-password -token')
      .populate('roleId', 'name description')
      .sort({ username: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    // Get additional info for each teacher
    const teachersWithStats = await Promise.all(
      teachers.map(async (teacher) => {
        // Class model uses 'teacher' field, not 'teacherId'
        const classCount = await Class.countDocuments({ teacher: teacher._id });
        const classes = await Class.find({ teacher: teacher._id }).select('students');
        const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
        
        return {
          ...teacher,
          stats: {
            classCount,
            totalStudents
          }
        };
      })
    );
    
    res.status(200).json({
      success: true,
      message: "Lấy danh sách giảng viên thành công",
      teachers: teachersWithStats,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error(" Lỗi khi lấy danh sách giảng viên:", error);
    res.status(500).json({ 
      success: false,
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
    if ((teacher.roleId.name !== 'Teacher') && (teacher.roleId.name !== "Subject Leader")) {
      return res.status(403).json({
        success: false,
        message: 'User không phải là giảng viên hoặc trưởng môn'
      });
    }
    
    // Get classes taught by this teacher
    const classes = await Class.find({ teacher: teacherId })
      .select('name course startDate endDate students')
      .populate('course', 'name')
      .lean();
    
    // Format dates for classes
    const formattedClasses = classes.map(cls => ({
      ...cls,
      startDate: formatDateToVN(cls.startDate),
      endDate: formatDateToVN(cls.endDate)
    }));
    
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
    
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin giảng viên thành công',
      teacher: {
        ...teacher.toObject(),
        classes: formattedClasses,
        stats: {
          classCount: classes.length,
          totalStudents
        }
      }
    });
  } catch (error) {
    console.error(' Lỗi khi lấy thông tin giảng viên hiện tại:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy thông tin giảng viên',
      error: error.message 
    });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await User.findById(id)
      .select('-password -token')
      .populate('roleId', 'name');
    
    if (!teacher) {
      return res.status(404).json({ message: "Không tìm thấy giảng viên" });
    }
    
    // Get classes taught by this teacher - check both teacher and teacherId fields
    const classes = await Class.find({ 
      $or: [
        { teacher: id },
        { teacherId: id }
      ]
    })
      .select('name course students status startDate endDate teacher teacherId')
      .populate('students', 'username email')
      .populate({ 
        path: 'course', 
        select: 'name',
        populate: { path: 'program', select: 'level band' } 
      })
      .lean();
    
    // Format classes with level information and teaching stats
    const formattedClasses = await Promise.all(classes.map(async (cls) => {
      // Lấy tất cả ClassSchedule của lớp này để log
      const allSchedules = await ClassSchedule.find({
        class: cls._id,
        status: { $in: ['temporary', 'fixed'] }
      })
      .select('teacher substituteTeacher date startTime endTime status')
      .populate('teacher', 'username')
      .populate('substituteTeacher', 'username')
      .lean();
      
      allSchedules.forEach((schedule, idx) => {
        const teacherId = schedule.teacher?._id?.toString() || schedule.teacher?.toString() || 'N/A';
        const teacherName = schedule.teacher?.username || 'N/A';
        const subTeacherId = schedule.substituteTeacher?._id?.toString() || schedule.substituteTeacher?.toString() || null;
        const subTeacherName = schedule.substituteTeacher?.username || null;
        const hasSubstitute = subTeacherId !== null;
        const isThisTeacher = teacherId === id.toString();
      });
      
      // Lấy tất cả schedule IDs để kiểm tra điểm danh
      const scheduleIds = allSchedules.map(s => s._id);
      
      // Kiểm tra các buổi đã có điểm danh (có ít nhất 1 học sinh điểm danh)
      const schedulesWithAttendance = await StudentSchedule.find({
        classSchedule: { $in: scheduleIds },
        'attendance.status': { $exists: true, $ne: null }
      })
      .select('classSchedule')
      .lean();
      
      // Tạo Set các schedule IDs đã có điểm danh
      const scheduleIdsWithAttendance = new Set(
        schedulesWithAttendance.map(s => s.classSchedule.toString())
      );
      
      // Chỉ tính các buổi đã có điểm danh
      const totalSessions = scheduleIdsWithAttendance.size;
      
      // Số buổi dạy thực tế: buổi đã có điểm danh + teacher = id + không có substituteTeacher
      const actualTeachingSessions = allSchedules.filter(s => {
        const scheduleId = s._id.toString();
        const hasAttendance = scheduleIdsWithAttendance.has(scheduleId);
        const teacherId = s.teacher?._id?.toString() || s.teacher?.toString();
        const hasSubstitute = s.substituteTeacher && (s.substituteTeacher._id || s.substituteTeacher);
        const isThisTeacher = teacherId === id.toString();
        
        return hasAttendance && isThisTeacher && !hasSubstitute;
      }).length;
      
      allSchedules.forEach((schedule, idx) => {
        const scheduleId = schedule._id.toString();
        const hasAttendance = scheduleIdsWithAttendance.has(scheduleId);
        const teacherId = schedule.teacher?._id?.toString() || schedule.teacher?.toString();
        const hasSubstitute = schedule.substituteTeacher && (schedule.substituteTeacher._id || schedule.substituteTeacher);
        const isThisTeacher = teacherId === id.toString();
        const isCounted = hasAttendance && isThisTeacher && !hasSubstitute;
        
        const dateStr = new Date(schedule.date).toLocaleDateString('vi-VN');
      });
      
      return {
        _id: cls._id,
        name: cls.name,
        course: cls.course ? {
          _id: cls.course._id,
          name: cls.course.name,
          level: cls.course.program?.level || 'N/A'
        } : null,
        level: cls.course?.program?.level || 'N/A',
        students: cls.students || [],
        status: cls.status,
        startDate: formatDateToVN(cls.startDate),
        endDate: formatDateToVN(cls.endDate),
        stats: {
          totalSessions,
          actualTeachingSessions,
          absentSessions: totalSessions - actualTeachingSessions
        }
      };
    }));
    
    const totalStudents = formattedClasses.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
    
    // Calculate teaching schedule statistics (chỉ tính các buổi đã có điểm danh)
    // Tính từ formattedClasses đã được tính với logic chỉ tính buổi có điểm danh
    const totalSessions = formattedClasses.reduce((sum, cls) => sum + (cls.stats?.totalSessions || 0), 0);
    const actualTeachingSessions = formattedClasses.reduce((sum, cls) => sum + (cls.stats?.actualTeachingSessions || 0), 0);
    
    res.status(200).json({
      success: true,
      message: "Lấy thông tin giảng viên thành công",
      teacher: {
        ...teacher.toObject(),
        classes: formattedClasses,
        stats: {
          classCount: formattedClasses.length,
          totalStudents,
          totalSessions,
          actualTeachingSessions,
          absentSessions: totalSessions - actualTeachingSessions // Số buổi nghỉ (có người dạy thay)
        }
      }
    });
  } catch (error) {
    console.error(" Lỗi khi lấy thông tin giảng viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy thông tin giảng viên",
      error: error.message 
    });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const { username, email, password, phone, address } = req.body;
    
    // Validate required fields (password không bắt buộc, sẽ dùng mặc định nếu không có)
    if (!username || !email || !phone || !address) {
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

    // Validate phone number length (10-11 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      return res.status(400).json({ 
        message: "Số điện thoại phải có 10 hoặc 11 chữ số" 
      });
    }
    
    // Phone can be duplicate, no need to check
    
    // Find teacher role
    const teacherRole = await Role.findOne({ name: 'Teacher' });
    if (!teacherRole) {
      return res.status(404).json({ message: "Không tìm thấy role giảng viên" });
    }
    
    const newTeacher = await User.create({
      username,
      email,
      password: password || '123456', // Default password nếu không có
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
    console.error(" Lỗi khi tạo giảng viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi tạo giảng viên",
      error: error.message 
    });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, address } = req.body;
    
    const teacher = await User.findById(id);
    
    if (!teacher) {
      return res.status(404).json({ message: "Không tìm thấy giảng viên" });
    }

    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        return res.status(400).json({ 
          message: "Số điện thoại phải có 10 hoặc 11 chữ số" 
        });
      }
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
    console.error(" Lỗi khi cập nhật giảng viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi cập nhật giảng viên",
      error: error.message 
    });
  }
};

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
    console.error(" Lỗi khi xóa giảng viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi xóa giảng viên",
      error: error.message 
    });
  }
};

exports.getCurrentTeacherSchedule = async (req, res) => {
  try {
    // req.user được set bởi verifyToken middleware
    const teacherId = req.user._id;
    const { startDate, endDate } = req.query;
    
    // Query: get all ClassSchedules where teacher OR substituteTeacher is this teacher
    let query = {
      $or: [
        { teacher: teacherId },
        { substituteTeacher: teacherId }
      ]
    };
    
    // Filter by date range if provided
    if (startDate && endDate) {
      // Parse dates carefully to avoid timezone issues
      // Expecting YYYY-MM-DD format from frontend
      const parseDate = (dateStr) => {
        // Validate input
        if (!dateStr || typeof dateStr !== 'string') {
          return null;
        }
        
        const parts = dateStr.split('-');
        if (parts.length !== 3) {
          return null;
        }
        
        const [year, month, day] = parts.map(Number);
        
        // Validate parsed values
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
          return null;
        }
        
        // Validate date range
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          return null;
        }
        
        const date = new Date(Date.UTC(year, month - 1, day));
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return null;
        }
        
        return date;
      };
      
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      
      // Only add date filter if both dates are valid
      if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
        
        query.date = {
          $gte: start,
          $lte: end
        };
      } else {
        // Log error but don't throw - just skip date filter
        console.warn('Invalid date range provided:', { startDate, endDate });
      }
    }
    
    const schedules = await ClassSchedule.find(query)
      .populate('class', 'name course startDate endDate')
      .populate({
        path: 'class',
        populate: {
          path: 'course',
          select: 'name program',
          populate: {
            path: 'program',
            select: 'type'
          }
        }
      })
      .populate('room', 'room_name location')
      .populate('session', 'title order content')
      .populate('teacher', 'username email')
      .populate('substituteTeacher', 'username email')
      .sort({ date: 1, startTime: 1 })
      .lean();
    
    // For makeup classes (no class), find course from session
    const Course = require('../models/courseModel');
    for (let schedule of schedules) {
      if (!schedule.class && schedule.session) {
        // Lấy sessionId: có thể là object (đã populate) hoặc ObjectId
        let sessionId = schedule.session._id || schedule.session;
        
        // Convert sang ObjectId nếu cần
        let sessionObjectId;
        try {
          if (sessionId instanceof mongoose.Types.ObjectId) {
            sessionObjectId = sessionId;
          } else if (typeof sessionId === 'string') {
            sessionObjectId = new mongoose.Types.ObjectId(sessionId);
          } else {
            sessionObjectId = sessionId;
          }
        } catch (error) {
          continue;
        }
        
        // Tìm course chứa session này
        let course = await Course.findOne({ sessions: sessionObjectId })
          .select('name')
          .lean();
        
        // Nếu không tìm thấy với ObjectId, thử với string
        if (!course) {
          course = await Course.findOne({ sessions: sessionObjectId.toString() })
            .select('name')
            .lean();
        }
        
        // Nếu vẫn không tìm thấy, thử với $in operator
        if (!course) {
          course = await Course.findOne({ 
            sessions: { $in: [sessionObjectId, sessionObjectId.toString()] }
          })
          .select('name')
          .lean();
        }
        
        // Gán course name vào schedule
        if (course) {
          schedule.courseFromSession = course;
        }
      }
    }
    
    // Format schedules with additional info
    const formattedSchedules = schedules.map(schedule => {
      return {
        ...schedule,
        date: formatDateToVN(schedule.date),
        className: schedule.class?.name,
        courseName: schedule.class?.course?.name || schedule.courseFromSession?.name,
        sessionTitle: schedule.session?.title,
        sessionOrder: schedule.session?.order,
        roomName: schedule.room?.room_name,
        location: schedule.room?.location,
        classStartDate: formatDateToVN(schedule.class?.startDate),
        classEndDate: formatDateToVN(schedule.class?.endDate)
      };
    });
    
    res.status(200).json({
      success: true,
      message: 'Lấy lịch dạy thành công',
      total: formattedSchedules.length,
      schedules: formattedSchedules
    });
  } catch (error) {
    console.error(' Lỗi khi lấy lịch dạy:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy lịch dạy',
      error: error.message 
    });
  }
};

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
    
    // 🆕 Query logic:
    // - Buổi có substituteTeacher: CHỈ hiển thị ở bên substituteTeacher, KHÔNG hiển thị ở teacher gốc
    // - Buổi không có substituteTeacher: hiển thị ở teacher gốc
    let query = {
      $or: [
        // Buổi của teacher gốc (chỉ lấy buổi KHÔNG có substituteTeacher)
        {
          class: { $in: classIds },
          teacher: id,
          status: { $in: ['temporary', 'fixed'] },
          $or: [
            { substituteTeacher: { $exists: false } },
            { substituteTeacher: null }
          ]
        },
        // Buổi teacher dạy thay
        {
          substituteTeacher: id,
          status: { $in: ['temporary', 'fixed'] }
        }
      ]
    };
    
    // Filter by date range if provided
    if (startDate && endDate) {
      // Parse date string (YYYY-MM-DD) và tạo Date range để tránh vấn đề timezone
      const startDateParts = startDate.split('-');
      const endDateParts = endDate.split('-');
      
      if (startDateParts.length === 3 && endDateParts.length === 3) {
        const start = new Date(
          Date.UTC(
            parseInt(startDateParts[0]),
            parseInt(startDateParts[1]) - 1,
            parseInt(startDateParts[2])
          )
        );
        const end = new Date(
          Date.UTC(
            parseInt(endDateParts[0]),
            parseInt(endDateParts[1]) - 1,
            parseInt(endDateParts[2])
          )
        );
        end.setUTCDate(end.getUTCDate() + 1); // Ngày tiếp theo để bao gồm cả ngày cuối
        
        query.date = {
          $gte: start,
          $lt: end
        };
      } else {
        // Fallback to old method if date format is different
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
    }
    
    const schedules = await ClassSchedule.find(query)
      .populate('class', 'name course startDate endDate')
      .populate({
        path: 'class',
        populate: {
          path: 'course',
          select: 'name program',
          populate: {
            path: 'program',
            select: 'type'
          }
        }
      })
      .populate('room', 'room_name location')
      .populate('session', 'title order content')
      .populate('teacher', 'username email')
      .populate('substituteTeacher', 'username email')
      .sort({ date: 1, startTime: 1 })
      .lean();
    
    // Add class date range info to each schedule for easier conflict checking
    const schedulesWithClassInfo = schedules.map(schedule => {
      const classInfo = teacherClasses.find(c => c._id.toString() === schedule.class._id.toString());
      return {
        ...schedule,
        date: formatDateToVN(schedule.date),
        classStartDate: formatDateToVN(classInfo?.startDate),
        classEndDate: formatDateToVN(classInfo?.endDate),
        programType: schedule.class?.course?.program?.type || null
      };
    });
    
    res.status(200).json({
      success: true,
      message: "Lấy lịch dạy của giảng viên thành công",
      total: schedulesWithClassInfo.length,
      schedules: schedulesWithClassInfo
    });
  } catch (error) {
    console.error(" Lỗi khi lấy lịch dạy:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy lịch dạy",
      error: error.message 
    });
  }
};

// =========================
//  LẤY DANH SÁCH LỚP HỌC CỦA GIẢNG VIÊN HIỆN TẠI
// =========================
exports.getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { status } = req.query;

    // Build query
    let query = { teacher: teacherId };
    
    // Mặc định chỉ hiển thị lớp active và pending
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      // Mặc định filter active và pending
      query.status = { $in: ['active', 'pending'] };
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
          status: 'fixed' 
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
          startDate: formatDateToVN(cls.startDate),
          endDate: formatDateToVN(cls.endDate),
          status: classStatus,
          nextLesson: nextLesson ? {
            topic: nextLesson.session?.title || 'Chưa có chủ đề',
            date: formatDateToVN(nextLesson.date),
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
    console.error(' Lỗi khi lấy danh sách lớp học:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy danh sách lớp học',
      error: error.message 
    });
  }
};

// =========================
//  LẤY CHI TIẾT LỚP HỌC CỦA GIẢNG VIÊN HIỆN TẠI
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
      class: classId
      // Không filter theo status, lấy tất cả (scheduled, completed, cancelled, etc.)
    })
      .populate('session', 'title order content')
      .populate('room', 'room_name location')
      .sort({ date: 1, startTime: 1 })
      .lean();

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Get StudentSchedule and HomeworkSubmission for counting
    const StudentSchedule = require('../models/studentScheduleModel');
    const HomeworkSubmission = require('../models/homeworkSubmissionModel');
    
    console.log(` [DEBUG] Total lessons found: ${lessons.length}`);
    console.log(` [DEBUG] Today: ${today}, Current time: ${currentTime}`);
    
    // Format lessons with status and real attendance data
    const formattedLessons = await Promise.all(lessons.map(async (lesson, index) => {
      // Convert lesson.date to YYYY-MM-DD string for comparison
      const lessonDateStr = new Date(lesson.date).toISOString().split('T')[0];
      
      let status = 'scheduled';
      if (lessonDateStr < today || (lessonDateStr === today && lesson.endTime < currentTime)) {
        status = 'completed';
      } else if (lessonDateStr === today || (lessonDateStr > today && new Date(lesson.date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))) {
        status = 'upcoming';
      }
      
      console.log(` Lesson ${index + 1}: date=${lessonDateStr}, today=${today}, status=${status}`);

      // Get real attendance count from StudentSchedule
      const totalStudents = classInfo.students.length;
      const studentSchedules = await StudentSchedule.find({
        classSchedule: lesson._id
      });
      
      const hasAttendance = studentSchedules.some(ss => ss.attendance?.status);
      console.log(` Lesson ${index + 1} (${lesson.date}): hasAttendance = ${hasAttendance}, totalStudents = ${totalStudents}, recorded = ${studentSchedules.length}`) ;
      const attendanceCount = studentSchedules.filter(
        ss => ss.attendance?.status === 'present' || ss.attendance?.status === 'late'
      ).length;

      // Get homework for this lesson
      const homeworkWithStats = [];
      
      if (lesson.homework && lesson.homework.length > 0) {
        for (const hw of lesson.homework) {
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

          homeworkWithStats.push({
            _id: hw._id,
            title: hw.assignment?.title || 'Bài tập',
            description: hw.assignment?.description || '',
            files: hw.assignment?.files || [],
            answerFiles: hw.answerFiles || [],
            deadline: hw.deadline,
            submitted: submittedCount,
            late: lateCount,
            pending: totalStudents - submittedCount,
            total: totalStudents
          });
        }
      }

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
        totalStudents,
        homework: homeworkWithStats
      };
    }));

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

    // Get course info to check mocktest sessions
    const Course = require('../models/courseModel');
    const course = await Course.findById(classInfo.course._id);
    const mocktestSessionOrders = course?.mocktestSessionOrders || [];

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
      
      const totalAssignments = homeworkIds.length;
      
      const submissions = await HomeworkSubmission.find({
        student: student._id,
        homeworkId: { $in: homeworkIds }
      });
      
      const submittedCount = submissions.filter(
        s => s.status === 'submitted' || s.status === 'late'
      ).length;
      const homeworkCompletionRate = totalAssignments > 0
        ? Math.round((submittedCount / totalAssignments) * 100)
        : 0;

      // Get mocktest scores
      const mocktestScores = {};
      for (const order of mocktestSessionOrders) {
        // Find lesson by session order (mocktest doesn't need to exist yet)
        const mocktestLesson = lessons.find(
          l => l.session?.order === order
        );
        
        if (mocktestLesson) {
          // Check if there are existing scores
          if (mocktestLesson.mocktest?.scores) {
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
                scheduleId: mocktestLesson._id,
                sessionOrder: order,
                totalScore,
                skillScores: {
                  reading: studentScore.reading || 0,
                  listening: studentScore.listening || 0,
                  writing: studentScore.writing || 0,
                  speaking: studentScore.speaking || 0
                }
              };
            } else {
              // Mocktest exists but no score for this student
              mocktestScores[`mocktest${order}`] = {
                scheduleId: mocktestLesson._id,
                sessionOrder: order,
                totalScore: null,
                skillScores: null
              };
            }
          } else {
            // Lesson exists but mocktest not created yet - still provide scheduleId
            mocktestScores[`mocktest${order}`] = {
              scheduleId: mocktestLesson._id,
              sessionOrder: order,
              totalScore: null,
              skillScores: null
            };
          }
        } else {
          // No lesson found for this mocktest session order
          mocktestScores[`mocktest${order}`] = {
            scheduleId: null,
            sessionOrder: order,
            totalScore: null,
            skillScores: null
          };
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
        totalAssignments: totalAssignments,
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

    // === THÊM DỮ LIỆU CHO CLASS OVERVIEW ===

    // 1. Mocktest Milestones
    const mocktestMilestones = [];
    for (const sessionOrder of mocktestSessionOrders) {
      const lessonIndex = lessons.findIndex(l => l.session?.order === sessionOrder);
      if (lessonIndex !== -1) {
        const mocktestLesson = lessons[lessonIndex];
        mocktestMilestones.push({
          sessionOrder: sessionOrder,
          lessonNumber: lessonIndex + 1,
          lessonId: mocktestLesson._id,
          date: formatDateToVN(mocktestLesson.date),
          status: formattedLessons[lessonIndex]?.status || 'scheduled',
          title: `Mocktest ${sessionOrder}`
        });
      }
    }

    // 2. Attendance by Lesson (chỉ completed lessons)
    console.log(` [DEBUG] formattedLessons count: ${formattedLessons.length}`);
    console.log(` [DEBUG] Completed lessons: ${formattedLessons.filter(l => l.status === 'completed').length}`);
    console.log(` [DEBUG] Completed with attendance: ${formattedLessons.filter(l => l.status === 'completed' && l.hasAttendance).length}`);
    
    const attendanceByLesson = formattedLessons
      .filter(l => l.status === 'completed' && l.hasAttendance)
      .map(l => ({
        lessonNumber: l.lessonNumber,
        date: l.date,
        attendanceCount: l.attendanceCount,
        totalStudents: l.totalStudents,
        attendanceRate: Math.round((l.attendanceCount / l.totalStudents) * 100)
      }));
    
    console.log(` [DEBUG] attendanceByLesson result:`, attendanceByLesson);

    // 3. Homework Stats - Extract from formattedLessons
    const homeworkStats = [];
    formattedLessons.forEach(lesson => {
      if (lesson.homework && lesson.homework.length > 0) {
        lesson.homework.forEach(hw => {
          const onTime = hw.submitted - hw.late;
          homeworkStats.push({
            assignmentId: hw._id,
            lessonNumber: lesson.lessonNumber,
            sessionOrder: lesson.sessionOrder,
            title: hw.title,
            deadline: hw.deadline,
            onTime: onTime,
            late: hw.late,
            pending: hw.pending,
            total: hw.total,
            onTimeRate: hw.total > 0 ? Math.round((onTime / hw.total) * 100) : 0,
            lateRate: hw.total > 0 ? Math.round((hw.late / hw.total) * 100) : 0,
            pendingRate: hw.total > 0 ? Math.round((hw.pending / hw.total) * 100) : 0
          });
        });
      }
    });
    
    console.log(` [DEBUG] homeworkStats result:`, homeworkStats);

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
        startDate: formatDateToVN(classInfo.startDate),
        endDate: formatDateToVN(classInfo.endDate),
        status: classStatus,
        nextLesson: nextLesson ? {
          topic: nextLesson.topic,
          date: nextLesson.date,
          time: nextLesson.time
        } : null,
        mocktestMilestones: mocktestMilestones
      },
      students: formattedStudents,
      lessons: formattedLessons,
      materials,
      attendanceByLesson: attendanceByLesson,
      homeworkStats: homeworkStats
    };

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết lớp học thành công',
      data: detailData
    });
  } catch (error) {
    console.error(' Lỗi khi lấy chi tiết lớp học:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy chi tiết lớp học',
      error: error.message 
    });
  }
};

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
            select: 'name description clos'
          },
          {
            path: 'teacher',
            select: 'username email'
          },
          {
            path: 'students',
            select: 'username email fullName'
          }
        ]
      })
      .populate('teacher', 'username email') // Thêm populate cho teacher của ClassSchedule
      .populate('room', 'room_name location capacity')
      .populate('session', 'title order content learningType clos')
      .lean();

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    // Verify teacher owns this class
    // For makeup classes (no class), check via schedule.teacher directly
    let hasPermission = false;
    
    if (schedule.class) {
      // Regular class: check if teacher owns the class
      hasPermission = schedule.class?.teacher?._id?.toString() === teacherId.toString();
    } else {
      // Makeup class (no class): check if teacher is assigned to this schedule
      // Handle both populated (object) and unpopulated (ObjectId) cases
      const scheduleTeacherId = schedule.teacher?._id?.toString() || schedule.teacher?.toString();
      hasPermission = scheduleTeacherId === teacherId.toString();
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem buổi học này'
      });
    }

    // Lấy CLOs từ course.clos dựa vào session.clos (array of ObjectIds)
    let sessionClos = [];
    if (schedule.session && schedule.session.clos && schedule.session.clos.length > 0 && schedule.class && schedule.class.course) {
      const closIds = schedule.session.clos.map(id => id.toString());
      const courseClos = schedule.class.course.clos || [];
      
      // Lọc CLOs từ course.clos theo closIds trong session.clos
      sessionClos = courseClos.filter(clo => 
        closIds.includes(clo._id.toString())
      );
    }

    // Get attendance data for all students in this class
    const studentSchedules = await StudentSchedule.find({
      classSchedule: scheduleId
    }).populate('student', 'username email fullName').lean();

    // Map students with their attendance status
    // Lấy từ StudentSchedule (nguồn chính xác nhất) để bao gồm cả học sinh học ké
    // Với lớp thường: merge với class.students để đảm bảo hiển thị đầy đủ
    // Với lớp học bù: chỉ lấy từ StudentSchedule
    
    let studentsWithAttendance = [];
    
    if (schedule.class) {
      // Regular class: lấy từ StudentSchedule (bao gồm cả học ké)
      // Tạo map từ class.students để có thông tin đầy đủ
      const classStudentsMap = new Map();
      (schedule.class?.students || []).forEach(student => {
        classStudentsMap.set(student._id.toString(), student);
      });
      
      // Lấy tất cả học sinh từ StudentSchedule
      studentsWithAttendance = studentSchedules.map(ss => {
        const student = ss.student;
        const classStudent = classStudentsMap.get(student._id.toString());
        
        return {
          _id: student._id,
          username: student.username,
          email: student.email,
          fullName: student.fullName || student.username,
          attendance: ss.attendance || null,
          isEnrolled: !!classStudent // Đánh dấu học sinh chính thức hay học ké
        };
      });
      
      // Nếu có học sinh trong class.students nhưng chưa có StudentSchedule, thêm vào
      (schedule.class?.students || []).forEach(classStudent => {
        const exists = studentsWithAttendance.some(
          s => s._id.toString() === classStudent._id.toString()
        );
        if (!exists) {
          studentsWithAttendance.push({
            _id: classStudent._id,
            username: classStudent.username,
            email: classStudent.email,
            fullName: classStudent.fullName || classStudent.username,
            attendance: null,
            isEnrolled: true
          });
        }
      });
    } else {
      // Makeup class (no class): chỉ lấy từ StudentSchedule
      studentsWithAttendance = studentSchedules.map(ss => {
        return {
          _id: ss.student._id,
          username: ss.student.username,
          email: ss.student.email,
          fullName: ss.student.fullName || ss.student.username,
          attendance: ss.attendance || null,
          isEnrolled: false // Lớp học bù không có khái niệm enrolled
        };
      });
    }

    // Format response
    const lessonDetail = {
      _id: schedule._id,
      date: formatDateToVN(schedule.date),
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      status: schedule.status,
      
      // Class info
      className: schedule.class?.name || 'Lớp học bù',
      courseName: schedule.class?.course?.name,
      courseDescription: schedule.class?.course?.description,
      classStartDate: formatDateToVN(schedule.class?.startDate),
      classEndDate: formatDateToVN(schedule.class?.endDate),
      
      // Session info
      sessionTitle: schedule.session?.title,
      sessionOrder: schedule.session?.order,
      sessionContent: schedule.session?.content,
      learningType: schedule.session?.learningType,
      sessionClos: sessionClos, // Thêm CLOs đã lọc từ course
      
      // Room info
      roomName: schedule.room?.room_name,
      roomLocation: schedule.room?.location,
      roomCapacity: schedule.room?.capacity,
      
      // Teacher info
      teacherName: schedule.class?.teacher?.username,
      teacherEmail: schedule.class?.teacher?.email,
      
      // Student info with attendance
      totalStudents: studentsWithAttendance.length,
      students: studentsWithAttendance,
      
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
    console.error(' Lỗi khi lấy chi tiết buổi học:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết buổi học',
      error: error.message
    });
  }
};

// =========================
//  CẬP NHẬT ĐIỂM MOCKTEST
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
      .populate('class', 'teacher students course')
      .populate('session', 'order title');

    console.log(' Update Mocktest - Schedule Info:', {
      scheduleId,
      studentId,
      hasSchedule: !!schedule,
      sessionOrder: schedule?.session?.order,
      sessionTitle: schedule?.session?.title,
      classId: schedule?.class?._id,
      courseId: schedule?.class?.course
    });

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

    // Get course to check if this is a mocktest session
    const Course = require('../models/courseModel');
    const Session = require('../models/sessionModel');
    
    const course = await Course.findById(schedule.class.course)
      .populate('program', 'name type');
    const session = schedule.session; // Already populated above
    
    console.log(' Update Mocktest - Course & Session Info:', {
      courseId: schedule.class.course,
      hasCourse: !!course,
      mocktestSessionOrders: course?.mocktestSessionOrders,
      sessionOrder: session?.order,
      isMocktestSession: course?.mocktestSessionOrders?.includes(session?.order)
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy session'
      });
    }

    const mocktestSessionOrders = course?.mocktestSessionOrders || [];
    const isMocktestSession = mocktestSessionOrders.includes(session.order);

    if (!isMocktestSession) {
      console.log(' Not a mocktest session:', {
        sessionOrder: session.order,
        mocktestSessionOrders,
        courseName: course?.name
      });
      return res.status(400).json({
        success: false,
        message: 'Buổi học này không phải là buổi mocktest'
      });
    }

    // Initialize mocktest if not exists
    if (!schedule.mocktest) {
      schedule.mocktest = {
        title: `Mocktest ${session.order}`,
        order: session.order,
        type: 'toeic', // Default type, can be changed
        scores: []
      };
    }

    // Ensure scores array exists
    if (!schedule.mocktest.scores) {
      schedule.mocktest.scores = [];
    }

    // Find or create score entry for student
    let studentScore = schedule.mocktest.scores.find(
      s => s.studentId.toString() === studentId.toString()
    );

    const skillScores = {
      reading: reading || 0,
      listening: listening || 0,
      writing: writing || 0,
      speaking: speaking || 0
    };

    // Get program type
    const programType = course?.program?.type?.toLowerCase() || 'ielts';

    // Calculate total score based on program type
    let totalScore = 0;
    if (programType === 'ielts') {
      const validScores = Object.values(skillScores).filter(s => s > 0);
      totalScore = validScores.length > 0 
        ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 2) / 2 
        : 0;
    } else if (programType === 'toeic') {
      totalScore = (skillScores.reading || 0) + (skillScores.listening || 0);
    } else if (programType === 'cam' || programType === 'cambridge') {
      const validScores = Object.values(skillScores).filter(s => s > 0);
      totalScore = validScores.length > 0 
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) 
        : 0;
    }

    if (studentScore) {
      // Update existing score in ClassSchedule
      if (reading !== undefined) studentScore.reading = reading;
      if (listening !== undefined) studentScore.listening = listening;
      if (writing !== undefined) studentScore.writing = writing;
      if (speaking !== undefined) studentScore.speaking = speaking;
    } else {
      // Add new score to ClassSchedule
      schedule.mocktest.scores.push({
        studentId,
        reading: skillScores.reading,
        listening: skillScores.listening,
        writing: skillScores.writing,
        speaking: skillScores.speaking
      });
    }

    await schedule.save();

    // Also save to User.mocktestScores for easy student access
    const mocktestKey = `mocktest${session.order}`;
    await User.findByIdAndUpdate(
      studentId,
      {
        $set: {
          [`mocktestScores.${mocktestKey}`]: {
            scheduleId: scheduleId,
            sessionOrder: session.order,
            totalScore: totalScore,
            skillScores: skillScores
          }
        }
      },
      { new: true }
    );

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
    console.error(' Lỗi khi cập nhật điểm mocktest:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật điểm mocktest',
      error: error.message
    });
  }
};

// ====================================
//  IMPORT ĐIỂM MOCKTEST HÀNG LOẠT
// ====================================
exports.importMocktestScores = async (req, res) => {
  try {
    const { classId } = req.params;
    const { scheduleId, scores } = req.body; // scores: [{ studentId, email, reading, listening, writing, speaking }]
    const teacherId = req.user._id;

    console.log('📥 Import Mocktest Scores Request:', {
      classId,
      scheduleId,
      teacherId,
      totalScores: scores?.length
    });

    // Validate input
    if (!scheduleId || !scores || !Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin scheduleId hoặc scores'
      });
    }

    // Find the schedule and verify ownership
    const schedule = await ClassSchedule.findById(scheduleId)
      .populate({
        path: 'class',
        select: 'teacher students course name',
        populate: {
          path: 'course',
          select: 'name program mocktestSessionOrders',
          populate: {
            path: 'program',
            select: 'type name'
          }
        }
      })
      .populate('session', 'order title');

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

    // Verify this is a mocktest session
    const course = schedule.class.course;
    const session = schedule.session;
    const mocktestSessionOrders = course?.mocktestSessionOrders || [];
    const isMocktestSession = mocktestSessionOrders.includes(session?.order);

    if (!isMocktestSession) {
      return res.status(400).json({
        success: false,
        message: 'Buổi học này không phải là buổi mocktest'
      });
    }

    // Get program type for validation
    const programType = course?.program?.type?.toLowerCase() || 'ielts';

    // Validate scores based on program type
    const validateScore = (score, skill, type) => {
      if (score === null || score === undefined || score === 0) return true; // Allow 0 or empty

      const num = parseFloat(score);
      if (isNaN(num)) return false;

      switch (type) {
        case 'ielts':
          if (num < 1 || num > 9) return false;
          const decimal = (num % 1).toFixed(1);
          return decimal === '0.0' || decimal === '0.5';
        
        case 'toeic':
          if (skill === 'reading' || skill === 'listening') {
            return Number.isInteger(num) && num >= 10 && num <= 495 && num % 5 === 0;
          }
          return true; // writing/speaking not used in TOEIC
        
        case 'cam':
        case 'cambridge':
          return Number.isInteger(num) && num >= 1 && num <= 15;
        
        default:
          return true;
      }
    };

    // Initialize mocktest if not exists
    if (!schedule.mocktest) {
      schedule.mocktest = {
        title: `Mocktest ${session.order}`,
        order: session.order,
        type: programType,
        scores: []
      };
    }

    if (!schedule.mocktest.scores) {
      schedule.mocktest.scores = [];
    }

    // Process each score
    let successCount = 0;
    let failedCount = 0;
    const failedRecords = [];

    for (const scoreData of scores) {
      try {
        const { studentId, reading, listening, writing, speaking } = scoreData;

        // Verify student is in class
        const isStudentInClass = schedule.class.students.some(
          s => s._id.toString() === studentId.toString()
        );

        if (!isStudentInClass) {
          failedCount++;
          failedRecords.push({
            studentId,
            reason: 'Học viên không thuộc lớp học này'
          });
          continue;
        }

        // Validate scores
        const skills = { reading, listening, writing, speaking };
        let hasInvalidScore = false;

        for (const [skill, value] of Object.entries(skills)) {
          if (!validateScore(value, skill, programType)) {
            hasInvalidScore = true;
            failedCount++;
            failedRecords.push({
              studentId,
              reason: `Điểm ${skill} không hợp lệ cho ${programType.toUpperCase()}`
            });
            break;
          }
        }

        if (hasInvalidScore) continue;

        // Find or create score entry in ClassSchedule
        let studentScore = schedule.mocktest.scores.find(
          s => s.studentId.toString() === studentId.toString()
        );

        const skillScores = {
          reading: reading || 0,
          listening: listening || 0,
          writing: writing || 0,
          speaking: speaking || 0
        };

        // Calculate total score based on program type
        let totalScore = 0;
        if (programType === 'ielts') {
          // IELTS: average of 4 skills
          const validScores = Object.values(skillScores).filter(s => s > 0);
          totalScore = validScores.length > 0 
            ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 2) / 2 
            : 0;
        } else if (programType === 'toeic') {
          // TOEIC: sum of reading + listening
          totalScore = (skillScores.reading || 0) + (skillScores.listening || 0);
        } else if (programType === 'cam' || programType === 'cambridge') {
          // Cambridge: average of 4 skills
          const validScores = Object.values(skillScores).filter(s => s > 0);
          totalScore = validScores.length > 0 
            ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) 
            : 0;
        }

        if (studentScore) {
          // Update existing score in ClassSchedule
          if (reading !== undefined && reading !== null) studentScore.reading = reading;
          if (listening !== undefined && listening !== null) studentScore.listening = listening;
          if (writing !== undefined && writing !== null) studentScore.writing = writing;
          if (speaking !== undefined && speaking !== null) studentScore.speaking = speaking;
        } else {
          // Add new score to ClassSchedule
          schedule.mocktest.scores.push({
            studentId,
            reading: skillScores.reading,
            listening: skillScores.listening,
            writing: skillScores.writing,
            speaking: skillScores.speaking
          });
        }

        // Also save to User.mocktestScores for easy student access
        const mocktestKey = `mocktest${session.order}`;
        await User.findByIdAndUpdate(
          studentId,
          {
            $set: {
              [`mocktestScores.${mocktestKey}`]: {
                scheduleId: scheduleId,
                sessionOrder: session.order,
                totalScore: totalScore,
                skillScores: skillScores
              }
            }
          },
          { new: true }
        );

        successCount++;
      } catch (error) {
        console.error(`Error processing score for student ${scoreData.studentId}:`, error);
        failedCount++;
        failedRecords.push({
          studentId: scoreData.studentId,
          reason: error.message
        });
      }
    }

    // Save schedule
    await schedule.save();

    console.log('✅ Import Mocktest Scores Result:', {
      successCount,
      failedCount,
      total: scores.length
    });

    res.status(200).json({
      success: true,
      message: `Import thành công ${successCount}/${scores.length} điểm`,
      successCount,
      failedCount,
      failedRecords: failedCount > 0 ? failedRecords : undefined
    });
  } catch (error) {
    console.error('❌ Lỗi khi import điểm mocktest:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi import điểm mocktest',
      error: error.message
    });
  }
};

// =========================
//  LƯU ĐIỂM DANH HÀNG LOẠT
// =========================
exports.saveAttendance = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { scheduleId } = req.params;
    const { attendanceData } = req.body; // Array of { studentId, status, checkInTime }

    console.log(' Save Attendance Request:', {
      scheduleId,
      teacherId,
      totalStudents: attendanceData?.length
    });

    // Verify schedule exists and teacher owns it
    const schedule = await ClassSchedule.findById(scheduleId)
      .populate('class', 'teacher name')
      .populate('teacher', 'username email') // Populate teacher của ClassSchedule (cho lớp học bù)
      .populate('substituteTeacher', 'username email'); // Populate substituteTeacher
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    // Verify teacher has permission to take attendance
    // Xử lý lớp học bù trước (không có class)
    if (!schedule.class) {
      // Makeup class (no class): check if teacher is assigned to this schedule or is substitute teacher
      const scheduleTeacherId = schedule.teacher?._id?.toString() || schedule.teacher?.toString();
      const substituteTeacherId = schedule.substituteTeacher?._id?.toString() || schedule.substituteTeacher?.toString();
      
      const isScheduleTeacher = scheduleTeacherId === teacherId.toString();
      const isSubstituteTeacher = substituteTeacherId && substituteTeacherId === teacherId.toString();
      
      if (!isScheduleTeacher && !isSubstituteTeacher) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền điểm danh lớp này'
        });
      }
    } else {
      // Regular class: giữ nguyên logic cũ
      if (schedule.class.teacher.toString() !== teacherId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền điểm danh lớp này'
        });
      }
    }

    // Get schedule start time for late detection
    const scheduleStart = new Date(schedule.date);
    const [hours, minutes] = (schedule.startTime || '08:00').split(':');
    scheduleStart.setHours(parseInt(hours), parseInt(minutes), 0);

    console.log('⏰ Schedule start time:', scheduleStart);

    // Prepare bulk operations for efficiency
    const bulkOps = [];
    
    for (const record of attendanceData) {
      let finalStatus = record.status;
      
      // Auto-detect late if checked in after start time
      if (record.status === 'present' && record.checkInTime) {
        const checkIn = new Date(record.checkInTime);
        if (checkIn > scheduleStart) {
          finalStatus = 'late';
          console.log(`⏰ Student ${record.studentId} marked as LATE (checked in at ${checkIn.toLocaleTimeString()})`);
        }
      }

      // Find or create StudentSchedule
      const existingSchedule = await StudentSchedule.findOne({
        student: record.studentId,
        classSchedule: scheduleId
      });

      if (existingSchedule) {
        // Update existing
        bulkOps.push({
          updateOne: {
            filter: {
              student: record.studentId,
              classSchedule: scheduleId
            },
            update: {
              $set: {
                'attendance.status': finalStatus,
                'attendance.checkInTime': record.checkInTime || null,
                'attendance.markedBy': teacherId,
                scheduleStatus: 'completed'
              }
            }
          }
        });
      } else {
        // Create new
        const newSchedule = new StudentSchedule({
          student: record.studentId,
          classSchedule: scheduleId,
          attendance: {
            status: finalStatus,
            checkInTime: record.checkInTime || null,
            markedBy: teacherId
          },
          scheduleStatus: 'completed'
        });
        await newSchedule.save();
      }
    }

    // Execute bulk operations if any
    if (bulkOps.length > 0) {
      await StudentSchedule.bulkWrite(bulkOps);
    }

    // Update ClassSchedule status
    await ClassSchedule.findByIdAndUpdate(scheduleId, {
      status: 'completed',
      hasAttendance: true
    });

    console.log(' Attendance saved successfully');

    res.status(200).json({
      success: true,
      message: 'Đã lưu điểm danh thành công',
      attendanceCount: attendanceData.length
    });
  } catch (error) {
    console.error(' Lỗi khi lưu điểm danh:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lưu điểm danh',
      error: error.message
    });
  }
};

exports.importTeachers = async (req, res) => {
  try {
    const { teachers } = req.body;
    
    if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách giảng viên không hợp lệ'
      });
    }
    
    // Find Teacher role
    const teacherRole = await Role.findOne({ name: 'Teacher' });
    if (!teacherRole) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role giảng viên'
      });
    }
    
    const results = {
      success: [],
      failed: []
    };
    
    // Process each teacher
    for (const teacherData of teachers) {
      try {
        // Check if email exists
        const emailExists = await User.findOne({ email: teacherData.email });
        if (emailExists) {
          results.failed.push({
            email: teacherData.email,
            username: teacherData.username,
            phone: teacherData.phone || '',
            reason: 'Email đã tồn tại trong hệ thống'
          });
          continue;
        }
        
        // Validate phone number length (10 digits only)
        let normalizedPhone = teacherData.phone || '';
        if (teacherData.phone) {
          const phoneDigits = teacherData.phone.replace(/\D/g, '');
          // Validate BEFORE adding leading zero
          if (phoneDigits.length === 0) {
            results.failed.push({
              email: teacherData.email,
              username: teacherData.username,
              phone: teacherData.phone || '',
              reason: 'Số điện thoại không được để trống'
            });
            continue;
          }
          
          if (phoneDigits[0] === '0') {
            // Has leading zero: must be exactly 10 digits
            if (phoneDigits.length !== 10) {
              results.failed.push({
                email: teacherData.email,
                username: teacherData.username,
                phone: teacherData.phone || '',
                reason: 'Số điện thoại phải có 10 chữ số'
              });
              continue;
            }
            normalizedPhone = phoneDigits;
          } else {
            // No leading zero (Excel removed it): must be exactly 9 digits
            if (phoneDigits.length !== 9) {
              results.failed.push({
                email: teacherData.email,
                username: teacherData.username,
                phone: teacherData.phone || '',
                reason: 'Số điện thoại phải có 9 chữ số (thiếu số 0 ở đầu do Excel)'
              });
              continue;
            }
            // Add leading zero to normalize to 10 digits
            normalizedPhone = '0' + phoneDigits;
          }
        }
        
        // Phone can be duplicate, no need to check
        
        // Create teacher
        const newTeacher = await User.create({
          email: teacherData.email,
          username: teacherData.username,
          phone: normalizedPhone,
          address: teacherData.address || '',
          password: teacherData.password || '123456', // Default password
          roleId: teacherRole._id
        });
        
        results.success.push({
          _id: newTeacher._id,
          email: newTeacher.email,
          username: newTeacher.username
        });
      } catch (error) {
        results.failed.push({
          email: teacherData.email,
          username: teacherData.username,
          phone: teacherData.phone || '',
          reason: error.message || 'Lỗi không xác định'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Import thành công ${results.success.length} giảng viên, thất bại ${results.failed.length} giảng viên`,
      total: teachers.length,
      successCount: results.success.length,
      failedCount: results.failed.length,
      results
    });
  } catch (error) {
    console.error(' Lỗi khi import giảng viên:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi import giảng viên',
      error: error.message
    });
  }
};

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
    
    // Count total classes - check both teacher and teacherId fields
    const totalClasses = await Class.countDocuments({ 
      $or: [
        { teacher: { $in: teacherIds } },
        { teacherId: { $in: teacherIds } }
      ]
    });
    
    // Count teachers who have classes (active teachers)
    // Query both teacher and teacherId fields to get all teachers with classes
    const teacherIdsFromTeacherField = await Class.distinct('teacher');
    const teacherIdsFromTeacherIdField = await Class.distinct('teacherId');
    
    // Merge and get unique teacher IDs
    const allActiveTeacherIds = new Set();
    teacherIdsFromTeacherField.forEach(id => {
      if (id) allActiveTeacherIds.add(id.toString());
    });
    teacherIdsFromTeacherIdField.forEach(id => {
      if (id) allActiveTeacherIds.add(id.toString());
    });
    
    const activeTeachers = allActiveTeacherIds.size;
    
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
    console.error(" Lỗi khi lấy thống kê giảng viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy thống kê giảng viên",
      error: error.message 
    });
  }
};

// =========================
// 📁 QUẢN LÝ TÀI LIỆU LỚP HỌC
// =========================

/**
 * GET /api/teachers/me/classes/:classId/materials
 * Lấy tài liệu riêng của lớp học (từ ClassSchedule)
 */
exports.getClassMaterials = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user._id;

    // Verify teacher owns this class
    const classInfo = await Class.findOne({ 
      _id: classId, 
      teacher: teacherId 
    });

    if (!classInfo) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập lớp học này'
      });
    }

    // Get all schedules with materials
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
        schedule.material.forEach((materialObj, index) => {
          materials.push({
            id: materialObj._id || `${schedule._id}-${index}`,
            title: materialObj.title || `Tài liệu buổi ${schedule.session?.order || 'N/A'}`,
            lessonNumber: schedule.session?.order || 0,
            lessonTitle: schedule.session?.title || schedule.topic || 'Chưa có tiêu đề',
            url: materialObj.file,
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
    console.error(' Lỗi khi lấy tài liệu lớp học:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy tài liệu',
      error: error.message 
    });
  }
};

/**
 * POST /api/teachers/me/schedules/:scheduleId/materials
 * Thêm tài liệu cho buổi học
 */
exports.addMaterialToSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const teacherId = req.user._id;

    // Get schedule and verify teacher ownership
    const schedule = await ClassSchedule.findById(scheduleId).populate('class');
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    // Verify teacher owns this class
    if (schedule.class.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thêm tài liệu cho buổi học này'
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất 1 file'
      });
    }

    // Parse titles from request body (sent as JSON string)
    let titles = [];
    if (req.body.titles) {
      try {
        titles = JSON.parse(req.body.titles);
      } catch (e) {
        console.warn(' Failed to parse titles, using filenames as fallback');
      }
    }

    // Get file paths and create material objects (multer saves files and provides paths)
    const materialObjects = req.files.map((file, index) => ({
      title: titles[index] || file.originalname, // Use custom title or fallback to filename
      file: `/uploads/materials/${file.filename}`
    }));

    // Add materials to schedule
    if (!schedule.material) {
      schedule.material = [];
    }
    schedule.material.push(...materialObjects);

    await schedule.save();

    res.status(200).json({
      success: true,
      message: `Thêm ${materialObjects.length} tài liệu thành công`,
      materials: materialObjects.map(m => m.file),
      total: schedule.material.length
    });
  } catch (error) {
    console.error(' Lỗi khi thêm tài liệu:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi thêm tài liệu',
      error: error.message 
    });
  }
};

/**
 * DELETE /api/teachers/me/schedules/:scheduleId/materials
 * Xóa tài liệu khỏi buổi học
 */
exports.deleteMaterialFromSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { materialUrl } = req.body;
    const teacherId = req.user._id;

    if (!materialUrl) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp URL tài liệu cần xóa'
      });
    }

    // Get schedule and verify teacher ownership
    const schedule = await ClassSchedule.findById(scheduleId).populate('class');
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    // Verify teacher owns this class
    if (schedule.class.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tài liệu của buổi học này'
      });
    }

    // Check if material exists
    const materialExists = schedule.material && schedule.material.some(m => m.file === materialUrl);
    if (!materialExists) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu này trong buổi học'
      });
    }

    // Remove material from array
    schedule.material = schedule.material.filter(m => m.file !== materialUrl);
    await schedule.save();

    // Optional: Delete physical file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', materialUrl);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Đã xóa file vật lý: ${filePath}`);
    }

    res.status(200).json({
      success: true,
      message: 'Xóa tài liệu thành công',
      remainingMaterials: schedule.material.length
    });
  } catch (error) {
    console.error(' Lỗi khi xóa tài liệu:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi xóa tài liệu',
      error: error.message 
    });
  }
};

