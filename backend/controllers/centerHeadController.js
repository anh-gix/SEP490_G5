const User = require('../models/userModel');
const Class = require('../models/classModel');
const Course = require('../models/courseModel');
const ClassSchedule = require('../models/classScheduleModel');
const Program = require('../models/programModel');
const Exam = require('../models/examModel');
const WorkRequest = require('../models/workRequestModel');

// =========================
// DASHBOARD - TỔNG HỢP TẤT CẢ DATA
// =========================

/**
 * Get all dashboard data for Center Head
 * GET /api/center-head/dashboard
 * Returns: stats, pendingRequests, pendingActivation, recentActivities
 */
const getDashboard = async (req, res) => {
  try {
    // 1. THỐNG KÊ TỔNG QUAN
    const [
      programsTotal,
      programsActive,
      coursesTotal,
      coursesActive,
      examsTotal,
      examsPublished,
    ] = await Promise.all([
      // Programs: đã approved
      Program.countDocuments({ status: 'approved' }),
      // Programs: đã approved VÀ đang active
      Program.countDocuments({ status: 'approved', isActive: true }),
      // Courses: đã completed (hoàn thành nội dung)
      Course.countDocuments({ status: 'completed' }),
      // Courses: đã completed VÀ đang active
      Course.countDocuments({ status: 'completed', isActive: true }),
      // Exams: đã approved
      Exam.countDocuments({ status: 'approved' }),
      // Exams: đã approved VÀ đã publish
      Exam.countDocuments({ status: 'approved', isPublished: true }),
    ]);

    // 2. YÊU CẦU CHỜ DUYỆT
    // - Top-down: công việc đã giao, cấp dưới hoàn thành → status = 'pending_approval'
    // - Bottom-up: cấp dưới tự submit → status = 'pending'
    const pendingRequests = await WorkRequest.find({
      $or: [
        { direction: 'top_down', status: 'pending_approval' },
        { direction: 'bottom_up', status: 'pending' },
      ],
    })
      .populate('requestedBy', 'name email username')
      .populate('assignedTo', 'name email username')
      .populate('processedBy', 'name email username')
      .populate('entityId')
      .sort({ requestedAt: 1 }) // Sắp xếp theo ngày tăng dần (cũ nhất trước)
      .lean();

    // 3. CHỜ KÍCH HOẠT / XUẤT BẢN
    // Programs đã approved nhưng chưa active
    const pendingActivationPrograms = await Program.find({
      status: 'approved',
      isActive: false,
    })
      .select('_id code program_name description type level status isActive updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    // Courses đã completed nhưng chưa active
    const pendingActivationCourses = await Course.find({
      status: 'completed',
      isActive: false,
    })
      .select('_id courseCode name description status isActive updatedAt')
      .populate('program', 'program_name code')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    // Exams đã approved nhưng chưa publish
    const pendingActivationExams = await Exam.find({
      status: 'approved',
      isPublished: false,
    })
      .select('_id title description examType totalDuration status isPublished updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    // Merge và format pending activation
    const pendingActivation = [
      ...pendingActivationPrograms.map((p) => ({
        _id: p._id,
        type: 'program',
        name: p.program_name,
        code: p.code,
        description: p.description,
        status: p.status,
        isActive: p.isActive,
        approvedAt: p.updatedAt,
        metadata: {
          examType: p.type,
          level: p.level,
        },
      })),
      ...pendingActivationCourses.map((c) => ({
        _id: c._id,
        type: 'course',
        name: c.name,
        code: c.courseCode,
        description: c.description,
        status: c.status,
        isActive: c.isActive,
        approvedAt: c.updatedAt,
        metadata: {
          programName: c.program?.program_name || 'N/A',
        },
      })),
      ...pendingActivationExams.map((e) => ({
        _id: e._id,
        type: 'exam',
        name: e.title,
        description: e.description,
        status: e.status,
        isPublished: e.isPublished,
        approvedAt: e.updatedAt,
        metadata: {
          examType: e.examType,
          duration: e.totalDuration,
        },
      })),
    ].sort((a, b) => new Date(b.approvedAt) - new Date(a.approvedAt));

    // 4. HOẠT ĐỘNG GẦN ĐÂY
    // Lấy các work request đã xử lý gần đây (approved, rejected, completed)
    const recentActivities = await WorkRequest.find({
      status: { $in: ['approved', 'rejected', 'completed'] },
      processedAt: { $exists: true },
    })
      .populate('entityId', 'program_name title name courseCode')
      .sort({ processedAt: -1 })
      .limit(10)
      .lean();

    // Format recent activities
    const formattedActivities = recentActivities.map((activity) => {
      let action = 'approved';
      if (activity.status === 'rejected') action = 'rejected';
      else if (activity.status === 'completed') action = 'approved';

      let entityName = 'N/A';
      if (activity.entityId) {
        entityName =
          activity.entityId.program_name ||
          activity.entityId.title ||
          activity.entityId.name ||
          activity.entityId.courseCode ||
          'N/A';
      }

      return {
        _id: activity._id,
        action,
        entityType: activity.entityType,
        entityName,
        performedAt: activity.processedAt,
      };
    });

    // Response
    res.status(200).json({
      success: true,
      data: {
        stats: {
          programs: {
            total: programsTotal,
            active: programsActive,
          },
          courses: {
            total: coursesTotal,
            active: coursesActive,
          },
          exams: {
            total: examsTotal,
            published: examsPublished,
          },
          pendingRequests: pendingRequests.length,
        },
        pendingRequests,
        pendingActivation,
        recentActivities: formattedActivities,
      },
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu dashboard',
      error: error.message,
    });
  }
};

// =========================
// DASHBOARD STATISTICS (legacy - giữ lại cho backward compatibility)
// =========================

/**
 * Get dashboard statistics for Center Head
 * GET /api/center-head/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      programsTotal,
      programsActive,
      coursesTotal,
      coursesActive,
      examsTotal,
      examsPublished,
      pendingRequestsCount,
    ] = await Promise.all([
      Program.countDocuments({ status: 'approved' }),
      Program.countDocuments({ status: 'approved', isActive: true }),
      Course.countDocuments({ status: 'completed' }),
      Course.countDocuments({ status: 'completed', isActive: true }),
      Exam.countDocuments({ status: 'approved' }),
      Exam.countDocuments({ status: 'approved', isPublished: true }),
      WorkRequest.countDocuments({
        $or: [
          { direction: 'top_down', status: 'pending_approval' },
          { direction: 'bottom_up', status: 'pending' },
        ],
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        programs: {
          total: programsTotal,
          active: programsActive,
        },
        courses: {
          total: coursesTotal,
          active: coursesActive,
        },
        exams: {
          total: examsTotal,
          published: examsPublished,
        },
        pendingRequests: pendingRequestsCount,
      },
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê dashboard',
      error: error.message,
    });
  }
};

// =========================
// PENDING REQUESTS
// =========================

/**
 * Get pending work requests for Center Head to approve
 * GET /api/center-head/dashboard/pending-requests
 */
const getPendingRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      $or: [
        { direction: 'top_down', status: 'pending_approval' },
        { direction: 'bottom_up', status: 'pending' },
      ],
    };

    const [requests, total] = await Promise.all([
      WorkRequest.find(query)
        .populate('requestedBy', 'name email username')
        .populate('assignedTo', 'name email username')
        .populate('processedBy', 'name email username')
        .populate('entityId')
        .sort({ requestedAt: 1 }) // Sắp xếp theo ngày tăng dần
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      WorkRequest.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error getting pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách yêu cầu chờ duyệt',
      error: error.message,
    });
  }
};

// =========================
// PENDING ACTIVATION
// =========================

/**
 * Get items pending activation/publish
 * GET /api/center-head/dashboard/pending-activation
 */
const getPendingActivation = async (req, res) => {
  try {
    const { type } = req.query; // 'program', 'course', 'exam', or undefined for all

    let pendingActivation = [];

    // Programs
    if (!type || type === 'program') {
      const programs = await Program.find({
        status: 'approved',
        isActive: false,
      })
        .select('_id code program_name description type level status isActive updatedAt')
        .sort({ updatedAt: -1 })
        .lean();

      pendingActivation.push(
        ...programs.map((p) => ({
          _id: p._id,
          type: 'program',
          name: p.program_name,
          code: p.code,
          description: p.description,
          status: p.status,
          isActive: p.isActive,
          approvedAt: p.updatedAt,
          metadata: {
            examType: p.type,
            level: p.level,
          },
        }))
      );
    }

    // Courses
    if (!type || type === 'course') {
      const courses = await Course.find({
        status: 'completed',
        isActive: false,
      })
        .select('_id courseCode name description status isActive updatedAt')
        .populate('program', 'program_name code')
        .sort({ updatedAt: -1 })
        .lean();

      pendingActivation.push(
        ...courses.map((c) => ({
          _id: c._id,
          type: 'course',
          name: c.name,
          code: c.courseCode,
          description: c.description,
          status: c.status,
          isActive: c.isActive,
          approvedAt: c.updatedAt,
          metadata: {
            programName: c.program?.program_name || 'N/A',
          },
        }))
      );
    }

    // Exams
    if (!type || type === 'exam') {
      const exams = await Exam.find({
        status: 'approved',
        isPublished: false,
      })
        .select('_id title description examType totalDuration status isPublished updatedAt')
        .sort({ updatedAt: -1 })
        .lean();

      pendingActivation.push(
        ...exams.map((e) => ({
          _id: e._id,
          type: 'exam',
          name: e.title,
          description: e.description,
          status: e.status,
          isPublished: e.isPublished,
          approvedAt: e.updatedAt,
          metadata: {
            examType: e.examType,
            duration: e.totalDuration,
          },
        }))
      );
    }

    // Sort by approvedAt descending
    pendingActivation.sort((a, b) => new Date(b.approvedAt) - new Date(a.approvedAt));

    res.status(200).json({
      success: true,
      data: pendingActivation,
      count: pendingActivation.length,
    });
  } catch (error) {
    console.error('Error getting pending activation:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách chờ kích hoạt',
      error: error.message,
    });
  }
};

// =========================
// ACTIVATE/PUBLISH ACTIONS
// =========================

/**
 * Activate a program
 * POST /api/center-head/programs/:id/activate
 */
const activateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình',
      });
    }

    if (program.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Chương trình chưa được duyệt, không thể kích hoạt',
      });
    }

    program.isActive = true;
    await program.save();

    res.status(200).json({
      success: true,
      message: 'Đã kích hoạt chương trình thành công',
      data: program,
    });
  } catch (error) {
    console.error('Error activating program:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kích hoạt chương trình',
      error: error.message,
    });
  }
};

/**
 * Deactivate a program
 * POST /api/center-head/programs/:id/deactivate
 */
const deactivateProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình',
      });
    }

    program.isActive = false;
    await program.save();

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa chương trình thành công',
      data: program,
    });
  } catch (error) {
    console.error('Error deactivating program:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi vô hiệu hóa chương trình',
      error: error.message,
    });
  }
};

/**
 * Activate a course
 * POST /api/center-head/courses/:id/activate
 */
const activateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học',
      });
    }

    if (course.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Khóa học chưa hoàn thành, không thể kích hoạt',
      });
    }

    course.isActive = true;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Đã kích hoạt khóa học thành công',
      data: course,
    });
  } catch (error) {
    console.error('Error activating course:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kích hoạt khóa học',
      error: error.message,
    });
  }
};

/**
 * Deactivate a course
 * POST /api/center-head/courses/:id/deactivate
 */
const deactivateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học',
      });
    }

    course.isActive = false;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa khóa học thành công',
      data: course,
    });
  } catch (error) {
    console.error('Error deactivating course:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi vô hiệu hóa khóa học',
      error: error.message,
    });
  }
};

/**
 * Publish an exam
 * POST /api/center-head/exams/:id/publish
 */
const publishExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi',
      });
    }

    if (exam.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Đề thi chưa được duyệt, không thể xuất bản',
      });
    }

    exam.isPublished = true;
    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Đã xuất bản đề thi thành công',
      data: exam,
    });
  } catch (error) {
    console.error('Error publishing exam:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xuất bản đề thi',
      error: error.message,
    });
  }
};

/**
 * Unpublish an exam
 * POST /api/center-head/exams/:id/unpublish
 */
const unpublishExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi',
      });
    }

    exam.isPublished = false;
    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Đã ẩn đề thi thành công',
      data: exam,
    });
  } catch (error) {
    console.error('Error unpublishing exam:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi ẩn đề thi',
      error: error.message,
    });
  }
};

// =========================
// RECENT ACTIVITIES
// =========================

/**
 * Get recent activities
 * GET /api/center-head/dashboard/recent-activities
 */
const getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const activities = await WorkRequest.find({
      status: { $in: ['approved', 'rejected', 'completed'] },
      processedAt: { $exists: true },
    })
      .populate('entityId', 'program_name title name courseCode')
      .sort({ processedAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const formattedActivities = activities.map((activity) => {
      let action = 'approved';
      if (activity.status === 'rejected') action = 'rejected';

      let entityName = 'N/A';
      if (activity.entityId) {
        entityName =
          activity.entityId.program_name ||
          activity.entityId.title ||
          activity.entityId.name ||
          activity.entityId.courseCode ||
          'N/A';
      }

      return {
        _id: activity._id,
        action,
        entityType: activity.entityType,
        entityName,
        performedAt: activity.processedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedActivities,
    });
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy hoạt động gần đây',
      error: error.message,
    });
  }
};

// =========================
// LEGACY FUNCTIONS (giữ lại cho backward compatibility)
// =========================

/**
 * Get all pending courses for approval
 * GET /api/center-head/courses/pending
 */
const getPendingCourses = async (req, res) => {
  try {
    const { search = '' } = req.query;

    const query = { status: 'pending_approval' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate('createdBy', 'username email')
      .populate('program', 'program_name code')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      data: courses,
      count: courses.length,
    });
  } catch (error) {
    console.error('Error getting pending courses:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách khóa học chờ duyệt',
      error: error.message,
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
          select: 'username email',
        },
      })
      .populate('room', 'room_name location capacity')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: schedules,
      count: schedules.length,
    });
  } catch (error) {
    console.error('Error getting pending schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lịch học chờ duyệt',
      error: error.message,
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
        message: 'Không tìm thấy khóa học',
      });
    }

    if (course.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Khóa học không ở trạng thái chờ duyệt',
      });
    }

    course.status = 'approved';
    course.approvedAt = new Date();
    course.approvedBy = req.user?._id;
    if (note) course.approvalNote = note;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Đã phê duyệt khóa học thành công',
      data: course,
    });
  } catch (error) {
    console.error('Error approving course:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi phê duyệt khóa học',
      error: error.message,
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
        message: 'Vui lòng cung cấp lý do từ chối',
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học',
      });
    }

    if (course.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Khóa học không ở trạng thái chờ duyệt',
      });
    }

    course.status = 'needs_revision';
    course.revisionReason = reason;
    course.rejectedAt = new Date();
    course.rejectedBy = req.user?._id;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Đã từ chối khóa học và yêu cầu chỉnh sửa',
      data: course,
    });
  } catch (error) {
    console.error('Error rejecting course:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi từ chối khóa học',
      error: error.message,
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
        message: 'Không tìm thấy lịch học',
      });
    }

    if (schedule.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Lịch học không ở trạng thái chờ duyệt',
      });
    }

    schedule.status = 'approved';
    schedule.approvedAt = new Date();
    schedule.approvedBy = req.user?._id;

    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Đã phê duyệt lịch học thành công',
      data: schedule,
    });
  } catch (error) {
    console.error('Error approving schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi phê duyệt lịch học',
      error: error.message,
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
        message: 'Vui lòng cung cấp lý do từ chối',
      });
    }

    const schedule = await ClassSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch học',
      });
    }

    if (schedule.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Lịch học không ở trạng thái chờ duyệt',
      });
    }

    schedule.status = 'rejected';
    schedule.rejectionReason = reason;
    schedule.rejectedAt = new Date();
    schedule.rejectedBy = req.user?._id;

    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Đã từ chối lịch học',
      data: schedule,
    });
  } catch (error) {
    console.error('Error rejecting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi từ chối lịch học',
      error: error.message,
    });
  }
};

module.exports = {
  // Dashboard
  getDashboard,
  getDashboardStats,
  getPendingRequests,
  getPendingActivation,
  getRecentActivities,

  // Activate/Publish
  activateProgram,
  deactivateProgram,
  activateCourse,
  deactivateCourse,
  publishExam,
  unpublishExam,

  // Legacy
  getPendingCourses,
  getPendingSchedules,
  approveCourse,
  rejectCourse,
  approveSchedule,
  rejectSchedule,
};
