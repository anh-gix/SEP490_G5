const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Class = require("../models/classModel");
const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");

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
// 📅 LẤY LỊCH DẠY CỦA GIẢNG VIÊN
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
    
    // Get schedule IDs to count students
    const scheduleIds = schedules.map(s => s._id);
    
    // Count students for each schedule from StudentSchedule table
    const studentCounts = await StudentSchedule.aggregate([
      {
        $match: {
          classSchedule: { $in: scheduleIds },
          scheduleStatus: { $ne: 'cancelled' } // Exclude cancelled schedules
        }
      },
      {
        $group: {
          _id: '$classSchedule',
          studentCount: { $sum: 1 }
        }
      }
    ]);
    
    // Create a map for quick lookup
    const studentCountMap = {};
    studentCounts.forEach(item => {
      studentCountMap[item._id.toString()] = item.studentCount;
    });
    
    // Add class date range info and student count to each schedule
    const schedulesWithClassInfo = schedules.map(schedule => {
      const classInfo = teacherClasses.find(c => c._id.toString() === schedule.class._id.toString());
      const studentCount = studentCountMap[schedule._id.toString()] || 0;
      return {
        ...schedule,
        classStartDate: classInfo?.startDate,
        classEndDate: classInfo?.endDate,
        totalStudents: studentCount
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
