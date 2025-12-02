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
      .sort({ order: 1 });

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
    const {
      title,
      description,
      order,
      sessionType,
      videoURL,
      quizzes,
      vocabulary,
    } = req.body;

    // Validation
    if (!title || order === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và thứ tự buổi học là bắt buộc'
      });
    }

    // Chuẩn hóa vocabulary (giữ tương thích với schema hiện tại: img + words)
    let vocabularyData = undefined;
    if (vocabulary) {
      if (Array.isArray(vocabulary.items)) {
        vocabularyData = {
          img: vocabulary.img || '',
          words: vocabulary.items
            .map((item) => item.word)
            .filter((w) => typeof w === 'string' && w.trim() !== ''),
        };
      } else if (Array.isArray(vocabulary.words)) {
        vocabularyData = {
          img: vocabulary.img || '',
          words: vocabulary.words,
        };
      }
    }

    const camSession = await CamSession.create({
      title,
      description,
      order,
      sessionType,
      videoURL,
      quizzes: quizzes || { quiz: [] },
      ...(vocabularyData ? { vocabulary: vocabularyData } : {}),
    });

    res.status(201).json({
      success: true,
      message: 'Tạo buổi học CAM thành công',
      data: camSession
    });
  } catch (error) {
    console.error('Error creating cam session:', error);
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
    const {
      title,
      description,
      order,
      sessionType,
      videoURL,
      quizzes,
      vocabulary,
    } = req.body;

    const camSession = await CamSession.findById(id);
    if (!camSession) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học CAM'
      });
    }

    // Update fields
    if (title !== undefined) camSession.title = title;
    if (description !== undefined) camSession.description = description;
    if (order !== undefined) camSession.order = order;
    if (sessionType !== undefined) camSession.sessionType = sessionType;
    if (videoURL !== undefined) camSession.videoURL = videoURL;
    if (quizzes !== undefined) camSession.quizzes = quizzes;

    // Chuẩn hóa vocabulary
    if (vocabulary !== undefined) {
      let vocabularyData = undefined;
      if (vocabulary) {
        if (Array.isArray(vocabulary.items)) {
          vocabularyData = {
            img: vocabulary.img || '',
            words: vocabulary.items
              .map((item) => item.word)
              .filter((w) => typeof w === 'string' && w.trim() !== ''),
          };
        } else if (Array.isArray(vocabulary.words)) {
          vocabularyData = {
            img: vocabulary.img || '',
            words: vocabulary.words,
          };
        }
      }

      if (vocabularyData) {
        camSession.vocabulary = vocabularyData;
      } else {
        camSession.vocabulary = undefined;
      }
    }

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

module.exports = {
  getAllCamSessions,
  getCamSessionById,
  createCamSession,
  updateCamSession,
  deleteCamSession,
  getCamSessionsByCourseId
};

