const Class = require("../models/classModel");
const User = require("../models/userModel");
const ClassSchedule = require("../models/classScheduleModel");
const Course = require("../models/courseModel");

// =========================
// 📋 LẤY DANH SÁCH LỚP HỌC
// =========================
exports.getAllClasses = async (req, res) => {
  try {
    console.log('🔍 Fetching classes...');
    
    const { level, status, search, courseId } = req.query;
    let query = {};
    
    if (level) query.level = level;
    if (status) query.status = status;
    if (courseId) query.course = courseId;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    const classes = await Class.find(query)
      // user model uses 'username' rather than firstName/lastName/fullName
      .populate('teacher', 'username email phone')
      .populate('students', 'username email')
      .populate({ path: 'course', populate: { path: 'program', select: 'name' } })
      .sort({ createdAt: -1 })
      .lean();
    
    // Calculate stats for each class
    const classesWithStats = await Promise.all(
      classes.map(async (cls) => {
        const schedules = await ClassSchedule.countDocuments({ 
          class: cls._id,
          status: 'approved'
        });
        
        const completedSchedules = await ClassSchedule.countDocuments({
          class: cls._id,
          status: 'approved',
          date: { $lt: new Date() }
        });
        
          const totalStudents = cls.students?.length || 0;
          const totalSchedules = schedules;
          const completionRate = totalSchedules > 0 ? ((completedSchedules / totalSchedules) * 100).toFixed(2) : '0';

          return {
            ...cls,
            // flatten commonly-used values for frontend convenience
            totalStudents,
            totalSchedules,
            completedSchedules,
            completionRate: parseFloat(completionRate),
            // normalize teacher/course display fields expected by frontend
            teacherName: cls.teacher?.username || 'N/A',
            courseName: cls.course?.name || 'N/A',
            programName: cls.course?.program?.name || 'N/A'
          };
      })
    );
    
  console.log('✅ Found classes:', classesWithStats.length);
    
    res.status(200).json({
      success: true,
      count: classesWithStats.length,
      classes: classesWithStats
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách lớp học:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy danh sách lớp học",
      error: error.message 
    });
  }
};

// =========================
// 🔍 LẤY THÔNG TIN 1 LỚP
// =========================
exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Fetching class:', id);
    
    const classData = await Class.findById(id)
      .populate('teacher', 'username email phone')
      .populate('students', 'username email phone')
      .populate({ path: 'course', populate: { path: 'program', select: 'name' } })
      .lean();
    
    if (!classData) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy lớp học" 
      });
    }
    
    // Get schedules for this class
    const schedules = await ClassSchedule.find({ class: id })
      .populate('room', 'room_name location capacity')
      .populate('session', 'title order')
      .sort({ date: 1 });

    // compute some convenient stats for frontend
    const totalSchedules = await ClassSchedule.countDocuments({ class: id, status: 'approved' });
    const completedSchedules = await ClassSchedule.countDocuments({ class: id, status: 'approved', date: { $lt: new Date() } });
    const totalStudents = classData.students?.length || 0;
    const completionRate = totalSchedules > 0 ? ((completedSchedules / totalSchedules) * 100).toFixed(2) : '0';
    
    console.log('✅ Found class:', classData.name);
    
    res.status(200).json({
      success: true,
      class: {
        ...classData,
        schedules,
        totalStudents,
        totalSchedules,
        completedSchedules,
        completionRate: parseFloat(completionRate),
        teacherName: classData.teacher?.username || 'N/A',
        courseName: classData.course?.name || 'N/A',
        programName: classData.course?.program?.name || 'N/A'
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin lớp:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy thông tin lớp",
      error: error.message 
    });
  }
};

// =========================
// 📊 THỐNG KÊ LỚP HỌC
// =========================
exports.getClassStats = async (req, res) => {
  try {
    const total = await Class.countDocuments();
    const active = await Class.countDocuments({ status: 'active' });
    const pending = await Class.countDocuments({ status: 'pending' });
    const completed = await Class.countDocuments({ status: 'completed' });
    
    const classes = await Class.find();
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
    const avgClassSize = total > 0 ? (totalStudents / total).toFixed(1) : 0;
    
    res.status(200).json({
      success: true,
      stats: {
        total,
        active,
        pending,
        completed,
        totalStudents,
        avgClassSize: parseFloat(avgClassSize)
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê lớp:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy thống kê lớp",
      error: error.message 
    });
  }
};

// =========================
// ➕ TẠO LỚP HỌC MỚI
// =========================
exports.createClass = async (req, res) => {
  try {
    const { name, level, course, teacher, students, startDate, endDate, maxStudents, status } = req.body;
    
    if (!name || !level || !teacher) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }
    
    // Check if class name exists
    const existingClass = await Class.findOne({ name });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Tên lớp học đã tồn tại'
      });
    }
    
    const newClass = new Class({
      name,
      level,
      course,
      teacher,
      students: students || [],
      startDate,
      endDate,
      maxStudents: maxStudents || 25,
      status: status || 'pending'
    });
    
    await newClass.save();
    
    const populatedClass = await Class.findById(newClass._id)
      .populate('teacher', 'username email phone')
      .populate('students', 'username email')
      .populate({ path: 'course', populate: { path: 'program', select: 'name' } });
    
    res.status(201).json({
      success: true,
      message: 'Tạo lớp học thành công',
      class: populatedClass
    });
  } catch (error) {
    console.error('Error in createClass:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo lớp học',
      error: error.message
    });
  }
};

// =========================
// ✏️ CẬP NHẬT LỚP HỌC
// =========================
exports.updateClass = async (req, res) => {
  try {
    const { name, level, course, teacher, students, startDate, endDate, maxStudents, status } = req.body;
    
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học'
      });
    }
    
    // Check name conflict
    if (name && name !== classData.name) {
      const existingClass = await Class.findOne({ 
        name, 
        _id: { $ne: req.params.id } 
      });
      if (existingClass) {
        return res.status(400).json({
          success: false,
          message: 'Tên lớp học đã tồn tại'
        });
      }
    }
    
    // Update fields
    if (name) classData.name = name;
    if (level) classData.level = level;
    if (course) classData.course = course;
    if (teacher) classData.teacher = teacher;
    if (students !== undefined) classData.students = students;
    if (startDate) classData.startDate = startDate;
    if (endDate) classData.endDate = endDate;
    if (maxStudents) classData.maxStudents = maxStudents;
    if (status) classData.status = status;
    
    await classData.save();
    
    const updatedClass = await Class.findById(classData._id)
      .populate('teacher', 'username email phone')
      .populate('students', 'username email')
      .populate({ path: 'course', populate: { path: 'program', select: 'name' } });
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật lớp học thành công',
      class: updatedClass
    });
  } catch (error) {
    console.error('Error in updateClass:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật lớp học',
      error: error.message
    });
  }
};

// =========================
// 🗑️ XÓA LỚP HỌC
// =========================
exports.deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học'
      });
    }
    
    // Check schedules
    const scheduleCount = await ClassSchedule.countDocuments({ class: req.params.id });
    if (scheduleCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa lớp học có ${scheduleCount} lịch học`
      });
    }
    
    await Class.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Xóa lớp học thành công'
    });
  } catch (error) {
    console.error('Error in deleteClass:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lớp học',
      error: error.message
    });
  }
};
