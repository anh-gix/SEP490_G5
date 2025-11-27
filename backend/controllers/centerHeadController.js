const User = require('../models/userModel');
const Class = require('../models/classModel');
const Course = require('../models/courseModel');
const ClassSchedule = require('../models/classScheduleModel');
const Program = require('../models/programModel');
const Exam = require('../models/examModel');

// =========================
// DASHBOARD STATISTICS
// =========================

/**
 * Get dashboard statistics for Center Head
 * GET /api/center-head/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Đếm tổng số học viên (students)
    const studentRole = await require('../models/roleModel').findOne({ name: 'Student' });
    const totalStudents = studentRole
      ? await User.countDocuments({ roleId: studentRole._id })
      : 0;

    // Đếm số khóa học đang hoạt động
    const activeCourses = await Course.countDocuments({
      status: 'approved'
    });

    // Đếm số lớp học hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayClasses = await ClassSchedule.countDocuments({
      date: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'approved'
    });

    // Tính completion rate (tỷ lệ hoàn thành khóa học)
    const totalPrograms = await Program.countDocuments({ status: 'active' });
    const completedPrograms = await Program.countDocuments({ status: 'archived' });
    const completionRate = totalPrograms > 0
      ? Math.round((completedPrograms / totalPrograms) * 100)
      : 0;

    // Đếm số khóa học đang chờ duyệt
    const pendingCourses = await Course.countDocuments({
      status: 'pending_approval'
    });

    // Đếm số lịch học đang chờ duyệt
    const pendingSchedules = await ClassSchedule.countDocuments({
      status: 'pending_approval'
    });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeCourses,
        todayClasses,
        completionRate,
        pendingCourses,
        pendingSchedules
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê dashboard',
      error: error.message
    });
  }
};

// =========================
// PENDING APPROVALS
// =========================

/**
 * Get all pending courses for approval
 * GET /api/center-head/courses/pending
 */
const getPendingCourses = async (req, res) => {
  try {
    const { search = '' } = req.query;

    // Build query
    const query = { status: 'pending_approval' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('createdBy', 'username email')
      .populate('program', 'program_name code')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Error getting pending courses:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách khóa học chờ duyệt',
      error: error.message
    });
  }
};

/**
 * Get all pending schedules for approval
 * GET /api/center-head/schedules/pending
 */
const getPendingSchedules = async (req, res) => {
  try {
    const query = { status: 'pending_approval' };

    const schedules = await ClassSchedule.find(query)
      .populate({
        path: 'class',
        select: 'name subject',
        populate: {
          path: 'teacherId',
          select: 'username email'
        }
      })
      .populate('room', 'room_name location capacity')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: schedules,
      count: schedules.length
    });
  } catch (error) {
    console.error('Error getting pending schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lịch học chờ duyệt',
      error: error.message
    });
  }
};

/**
 * Approve a course
 * POST /api/center-head/courses/:id/approve
 */
const approveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    if (course.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Khóa học không ở trạng thái chờ duyệt'
      });
    }

    course.status = 'approved';
    course.approvedAt = new Date();
    course.approvedBy = req.user._id;
    if (note) course.approvalNote = note;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Đã phê duyệt khóa học thành công',
      data: course
    });
  } catch (error) {
    console.error('Error approving course:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi phê duyệt khóa học',
      error: error.message
    });
  }
};

/**
 * Reject a course
 * POST /api/center-head/courses/:id/reject
 */
const rejectCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp lý do từ chối'
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    if (course.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Khóa học không ở trạng thái chờ duyệt'
      });
    }

    course.status = 'needs_revision';
    course.revisionReason = reason;
    course.rejectedAt = new Date();
    course.rejectedBy = req.user._id;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Đã từ chối khóa học và yêu cầu chỉnh sửa',
      data: course
    });
  } catch (error) {
    console.error('Error rejecting course:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi từ chối khóa học',
      error: error.message
    });
  }
};

/**
 * Approve a schedule
 * POST /api/center-head/schedules/:id/approve
 */
const approveSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await ClassSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch học'
      });
    }

    if (schedule.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Lịch học không ở trạng thái chờ duyệt'
      });
    }

    schedule.status = 'approved';
    schedule.approvedAt = new Date();
    schedule.approvedBy = req.user._id;

    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Đã phê duyệt lịch học thành công',
      data: schedule
    });
  } catch (error) {
    console.error('Error approving schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi phê duyệt lịch học',
      error: error.message
    });
  }
};

/**
 * Reject a schedule
 * POST /api/center-head/schedules/:id/reject
 */
const rejectSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp lý do từ chối'
      });
    }

    const schedule = await ClassSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch học'
      });
    }

    if (schedule.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Lịch học không ở trạng thái chờ duyệt'
      });
    }

    schedule.status = 'rejected';
    schedule.rejectionReason = reason;
    schedule.rejectedAt = new Date();
    schedule.rejectedBy = req.user._id;

    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Đã từ chối lịch học',
      data: schedule
    });
  } catch (error) {
    console.error('Error rejecting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi từ chối lịch học',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getPendingCourses,
  getPendingSchedules,
  approveCourse,
  rejectCourse,
  approveSchedule,
  rejectSchedule
};
