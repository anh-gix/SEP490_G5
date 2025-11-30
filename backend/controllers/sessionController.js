const Session = require('../models/sessionModel');
const Course = require('../models/courseModel');

// =========================
// SESSION CRUD OPERATIONS
// =========================

/**
 * Get all sessions
 * GET /api/sessions
 */
const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách buổi học',
      error: error.message
    });
  }
};

/**
 * Get session by ID
 * GET /api/sessions/:id
 */
const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error getting session by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin buổi học',
      error: error.message
    });
  }
};

/**
 * Create new session
 * POST /api/sessions
 */
const createSession = async (req, res) => {
  try {
    const { title, order, content, learningType, clos } = req.body;

    // Validation
    if (!title || order === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và thứ tự buổi học là bắt buộc'
      });
    }

    const session = await Session.create({
      title,
      order,
      content,
      learningType,
      clos: clos || []
    });

    res.status(201).json({
      success: true,
      message: 'Tạo buổi học thành công',
      data: session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo buổi học',
      error: error.message
    });
  }
};

/**
 * Update session
 * PUT /api/sessions/:id
 */
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, order, content, learningType, clos } = req.body;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    // Update fields
    if (title) session.title = title;
    if (order !== undefined) session.order = order;
    if (content !== undefined) session.content = content;
    if (learningType !== undefined) session.learningType = learningType;
    if (clos !== undefined) session.clos = clos;

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật buổi học thành công',
      data: session
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật buổi học',
      error: error.message
    });
  }
};

/**
 * Delete session
 * DELETE /api/sessions/:id
 */
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    // Check if session is being used in any course
    const courseCount = await Course.countDocuments({ sessions: id });
    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa buổi học đang được sử dụng trong giáo trình'
      });
    }

    await Session.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa buổi học thành công'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa buổi học',
      error: error.message
    });
  }
};

/**
 * Get sessions by course ID
 * GET /api/sessions/course/:courseId
 */
const getSessionsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate({
      path: 'sessions',
      options: { sort: { order: 1 } }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giáo trình'
      });
    }

    // Map CLO details vào mỗi session
    // Vì CLO giờ là embedded trong Course, ta cần filter từ course.clos
    const sessionsWithCLOs = course.sessions.map(session => {
      const sessionObj = session.toObject();

      // Lọc CLOs từ course dựa trên session.clos array (array of ObjectIds)
      const sessionCLOs = course.clos.filter(clo =>
        session.clos.some(cloId => cloId.equals(clo._id))
      );

      // Replace ObjectId array với full CLO objects
      sessionObj.closDetails = sessionCLOs;

      return sessionObj;
    });

    res.status(200).json({
      success: true,
      data: sessionsWithCLOs,
      count: sessionsWithCLOs.length
    });
  } catch (error) {
    console.error('Error getting sessions by course:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách buổi học của giáo trình',
      error: error.message
    });
  }
};

module.exports = {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getSessionsByCourseId
};
