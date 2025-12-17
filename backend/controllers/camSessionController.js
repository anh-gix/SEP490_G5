const CamSession = require('../models/camSession');
const Course = require('../models/courseModel');

// =========================
// CAM SESSION CRUD OPERATIONS
// =========================

/**
 * Get all cam sessions
 * GET /api/cam-sessions
 */
const getAllCamSessions = async (req, res) => {
  try {
    const camSessions = await CamSession.find()
      .sort({ Order: 1 });

    res.status(200).json({
      success: true,
      data: camSessions,
      count: camSessions.length
    });
  } catch (error) {
    console.error('Error getting cam sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách buổi học CAM',
      error: error.message
    });
  }
};

/**
 * Get cam session by ID
 * GET /api/cam-sessions/:id
 */
const getCamSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const camSession = await CamSession.findById(id);

    if (!camSession) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học CAM'
      });
    }

    res.status(200).json({
      success: true,
      data: camSession
    });
  } catch (error) {
    console.error('Error getting cam session by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin buổi học CAM',
      error: error.message
    });
  }
};

/**
 * Create new cam session
 * POST /api/cam-sessions
 */
const createCamSession = async (req, res) => {
  try {
    const { title, sessionType, description, order, videoURL, quizzes, vocabulary } = req.body;

    console.log('=== Create CamSession Request ===');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    // Validation
    if (!title || order === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và thứ tự buổi học là bắt buộc'
      });
    }

    const camSessionData = {
      title,
      sessionType: sessionType || 'reading',
      description,
      order,
      videoURL,
      quizzes: quizzes || { quiz: [] },
      vocabulary: vocabulary || { items: [] }
    };

    console.log('Creating camSession with data:', JSON.stringify(camSessionData, null, 2));

    const camSession = await CamSession.create(camSessionData);

    console.log('CamSession created successfully:', camSession._id);

    res.status(201).json({
      success: true,
      message: 'Tạo buổi học CAM thành công',
      data: camSession
    });
  } catch (error) {
    console.error('Error creating cam session:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo buổi học CAM',
      error: error.message
    });
  }
};

/**
 * Update cam session
 * PUT /api/cam-sessions/:id
 */
const updateCamSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, sessionType, description, order, videoURL, quizzes, vocabulary } = req.body;

    const camSession = await CamSession.findById(id);
    if (!camSession) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học CAM'
      });
    }

    // Update fields
    if (title !== undefined) camSession.title = title;
    if (sessionType !== undefined) camSession.sessionType = sessionType;
    if (description !== undefined) camSession.description = description;
    if (order !== undefined) camSession.order = order;
    if (videoURL !== undefined) camSession.videoURL = videoURL;
    if (quizzes !== undefined) camSession.quizzes = quizzes;
    if (vocabulary !== undefined) camSession.vocabulary = vocabulary;

    await camSession.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật buổi học CAM thành công',
      data: camSession
    });
  } catch (error) {
    console.error('Error updating cam session:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật buổi học CAM',
      error: error.message
    });
  }
};

/**
 * Delete cam session
 * DELETE /api/cam-sessions/:id
 */
const deleteCamSession = async (req, res) => {
  try {
    const { id } = req.params;

    const camSession = await CamSession.findById(id);
    if (!camSession) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học CAM'
      });
    }

    // Check if cam session is being used in any course
    const courseCount = await Course.countDocuments({ camSessions: id });
    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa buổi học CAM đang được sử dụng trong giáo trình'
      });
    }

    await CamSession.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa buổi học CAM thành công'
    });
  } catch (error) {
    console.error('Error deleting cam session:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa buổi học CAM',
      error: error.message
    });
  }
};

/**
 * Get cam sessions by course ID
 * GET /api/cam-sessions/course/:courseId
 */
const getCamSessionsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate({
      path: 'camSessions',
      options: { sort: { Order: 1 } }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giáo trình'
      });
    }

    res.status(200).json({
      success: true,
      data: course.camSessions || [],
      count: course.camSessions?.length || 0
    });
  } catch (error) {
    console.error('Error getting cam sessions by course:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách buổi học CAM của giáo trình',
      error: error.message
    });
  }
};

// =========================
// FILE UPLOAD HANDLERS
// =========================

/**
 * Upload video file
 * POST /api/cam-sessions/upload/video
 */
const uploadVideoFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file video được upload'
      });
    }

    // Return the URL to access the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/online-learning/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Upload video thành công',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload video',
      error: error.message
    });
  }
};

/**
 * Upload image file
 * POST /api/cam-sessions/upload/image
 */
const uploadImageFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file ảnh được upload'
      });
    }

    // Return the URL to access the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/online-learning/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Upload ảnh thành công',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload ảnh',
      error: error.message
    });
  }
};

module.exports = {
  getAllCamSessions,
  getCamSessionById,
  createCamSession,
  updateCamSession,
  deleteCamSession,
  getCamSessionsByCourseId,
  uploadVideoFile,
  uploadImageFile
};

