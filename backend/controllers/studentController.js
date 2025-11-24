const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Class = require("../models/classModel");
const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");

// =========================
// 📋 LẤY DANH SÁCH HỌC VIÊN
// =========================
exports.getAllStudents = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    // First, find the student role
    const studentRole = await Role.findOne({ name: 'Student' });
    
    if (!studentRole) {
      // Log all available roles for debugging
      const allRoles = await Role.find({}).select('name');
      console.error('❌ Không tìm thấy role Student. Các roles hiện có:', allRoles);
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy role học viên",
        error: "Role 'Student' không tồn tại trong database",
        availableRoles: allRoles.map(r => r.name)
      });
    }
    
    console.log('✅ Found student role:', studentRole.name, studentRole._id);
    
    // Debug: Check all users in database
    const allUsers = await User.find({}).select('username email roleId').populate('roleId', 'name');
    console.log(`🔍 Total users in database: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`  - User: ${user.username} (${user.email}), Role: ${user.roleId?.name || 'N/A'}, RoleId: ${user.roleId?._id || user.roleId}`);
    });
    
    let query = { roleId: studentRole._id };
    
    // Filter by status if provided (only if status field exists in User model)
    // Note: User model doesn't have status field, so this filter is disabled
    // if (status && status !== 'all') {
    //   query.status = status;
    // }
    
    // Search by username or email
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log(`🔍 Query for students:`, JSON.stringify(query, null, 2));
    
    const students = await User.find(query)
      .select('-password -token')
      .populate('roleId', 'name description')
      .sort({ username: 1 });
    
    console.log(`📋 Found ${students.length} users with roleId: ${studentRole._id} (${studentRole.name})`);
    
    // Get additional info for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        // Find classes where student is enrolled (students array contains student._id)
        const classCount = await Class.countDocuments({ students: student._id });
        const classes = await Class.find({ students: student._id }).select('name course level status');
        
        // Count total students in all classes this student is enrolled in
        const allClassStudents = await Class.find({ students: student._id }).select('students');
        const totalStudents = allClassStudents.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
        
        return {
          ...student.toObject(),
          stats: {
            classCount,
            totalStudents
          }
        };
      })
    );
    
    console.log(`✅ Returning ${studentsWithStats.length} students to frontend`);
    
    res.status(200).json({
      success: true,
      message: "Lấy danh sách học viên thành công",
      total: studentsWithStats.length,
      students: studentsWithStats
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách học viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy danh sách học viên",
      error: error.message 
    });
  }
};

// =========================
// 🔍 LẤY THÔNG TIN 1 HỌC VIÊN
// =========================
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await User.findById(id)
      .select('-password -token')
      .populate('roleId', 'name');
    
    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy học viên" });
    }
    
    // Get classes where student is enrolled
    const classes = await Class.find({ students: id })
      .select('name course level status students')
      .populate('course', 'name')
      .populate('teacher', 'username email fullName');
    
    res.status(200).json({
      message: "Lấy thông tin học viên thành công",
      student: {
        ...student.toObject(),
        classes,
        stats: {
          classCount: classes.length,
          totalStudents: classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0)
        }
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin học viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy thông tin học viên",
      error: error.message 
    });
  }
};

// =========================
// ➕ TẠO HỌC VIÊN MỚI
// =========================
exports.createStudent = async (req, res) => {
  try {
    const { username, email, password, phone, address } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !phone || !address) {
      return res.status(400).json({ 
        message: "Thiếu thông tin bắt buộc (username, email, password, phone, address)" 
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
    
    // Find student role
    const studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      return res.status(404).json({ message: "Không tìm thấy role học viên" });
    }
    
    const newStudent = await User.create({
      username,
      email,
      password,
      phone,
      address,
      roleId: studentRole._id
    });
    
    // Remove sensitive data before sending response
    const studentResponse = newStudent.toObject();
    delete studentResponse.password;
    delete studentResponse.token;
    
    res.status(201).json({
      message: "Tạo học viên thành công",
      student: studentResponse
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo học viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi tạo học viên",
      error: error.message 
    });
  }
};

// =========================
// ✏️ CẬP NHẬT HỌC VIÊN
// =========================
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, phone, address } = req.body;
    
    const student = await User.findById(id);
    
    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy học viên" });
    }
    
    // Validate required fields if provided
    if (phone !== undefined && !phone) {
      return res.status(400).json({ 
        message: "Số điện thoại là bắt buộc" 
      });
    }
    
    if (address !== undefined && !address) {
      return res.status(400).json({ 
        message: "Địa chỉ là bắt buộc" 
      });
    }
    
    // Check if new email already exists (excluding current user)
    if (email && email !== student.email) {
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
    if (username && username !== student.username) {
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
    if (username) student.username = username;
    if (email) student.email = email;
    if (phone !== undefined) student.phone = phone;
    if (address !== undefined) student.address = address;
    if (password) student.password = password; // Password will be hashed by pre-save hook
    
    await student.save();
    
    // Remove sensitive data
    const studentResponse = student.toObject();
    delete studentResponse.password;
    delete studentResponse.token;
    
    res.status(200).json({
      message: "Cập nhật học viên thành công",
      student: studentResponse
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật học viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi cập nhật học viên",
      error: error.message 
    });
  }
};

// =========================
// 🗑️ XÓA HỌC VIÊN
// =========================
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student is enrolled in any classes
    const classCount = await Class.countDocuments({ students: id });
    
    if (classCount > 0) {
      return res.status(400).json({ 
        message: `Không thể xóa học viên. Học viên đang tham gia ${classCount} lớp học.`,
        classCount
      });
    }
    
    const student = await User.findByIdAndDelete(id);
    
    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy học viên" });
    }
    
    res.status(200).json({
      message: "Xóa học viên thành công"
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa học viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi xóa học viên",
      error: error.message 
    });
  }
};

// =========================
// 📅 LẤY LỊCH HỌC CỦA HỌC VIÊN
// =========================
exports.getStudentSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    // Find all classes where student is enrolled
    const studentClasses = await Class.find({ students: id })
      .select('_id name startDate endDate')
      .lean();
    
    if (!studentClasses || studentClasses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Học viên này chưa tham gia lớp nào",
        total: 0,
        schedules: []
      });
    }
    
    const classIds = studentClasses.map(cls => cls._id);
    
    let query = { class: { $in: classIds }, status: { $in: ['temporary', 'fixed'] } };
    
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
    
    // Get StudentSchedule to fetch attendance data
    const scheduleIds = schedules.map(s => s._id);
    const studentSchedules = await StudentSchedule.find({
      student: id,
      classSchedule: { $in: scheduleIds }
    }).lean();
    
    // Create a map of classScheduleId -> attendance
    const attendanceMap = {};
    studentSchedules.forEach(ss => {
      if (ss.classSchedule) {
        attendanceMap[ss.classSchedule.toString()] = ss.attendance;
      }
    });
    
    // Add class date range info and attendance to each schedule
    const schedulesWithClassInfo = schedules.map(schedule => {
      const classInfo = studentClasses.find(c => c._id.toString() === schedule.class._id.toString());
      return {
        ...schedule,
        classStartDate: classInfo?.startDate,
        classEndDate: classInfo?.endDate,
        attendance: attendanceMap[schedule._id.toString()] || null
      };
    });
    
    res.status(200).json({
      success: true,
      message: "Lấy lịch học của học viên thành công",
      total: schedulesWithClassInfo.length,
      schedules: schedulesWithClassInfo
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch học:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy lịch học",
      error: error.message 
    });
  }
};

// =========================
// 📊 THỐNG KÊ HỌC VIÊN
// =========================
exports.getStudentStats = async (req, res) => {
  try {
    // Find student role
    const studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      return res.status(404).json({ message: "Không tìm thấy role học viên" });
    }
    
    const totalStudents = await User.countDocuments({ roleId: studentRole._id });
    
    // Count active students (those enrolled in at least one class)
    const activeStudentIds = await Class.distinct('students');
    const activeStudents = activeStudentIds.length;
    
    // Count total classes that have students
    const totalClasses = await Class.countDocuments({ 
      students: { $exists: true, $ne: [] } 
    });
    
    res.status(200).json({
      message: "Lấy thống kê học viên thành công",
      stats: {
        total: totalStudents,
        active: activeStudents,
        inactive: totalStudents - activeStudents,
        totalClasses
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê học viên:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy thống kê học viên",
      error: error.message 
    });
  }
};

