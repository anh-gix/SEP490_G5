const Program = require('../models/programModel');
const Course = require('../models/courseModel');

// =========================
// PROGRAM CRUD OPERATIONS
// =========================

/**
 * Get all programs with statistics
 * GET /api/programs
 */
const getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find()
      .populate('plos')
      .sort({ createdAt: -1 });

    // Get course count for each program
    const programsWithStats = await Promise.all(
      programs.map(async (program) => {
        const courseCount = await Course.countDocuments({
          program: program._id
        });
        return {
          ...program.toObject(),
          courseCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: programsWithStats,
      count: programs.length
    });
  } catch (error) {
    console.error('Error getting programs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách chương trình',
      error: error.message
    });
  }
};

/**
 * Get program by ID with details
 * GET /api/programs/:id
 */
const getProgramById = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id).populate('plos');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình'
      });
    }

    // Get courses belong to this program
    const courses = await Course.find({ program: id })
      .populate('createdBy', 'username email')
      .populate('clos', 'code name description')
      .populate('sessions', 'title order')
      .select('name description status createdAt updatedAt clos sessions');

    res.status(200).json({
      success: true,
      data: {
        ...program.toObject(),
        courses
      }
    });
  } catch (error) {
    console.error('Error getting program by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin chương trình',
      error: error.message
    });
  }
};

/**
 * Create new program
 * POST /api/programs
 */
const createProgram = async (req, res) => {
  try {
    const { code, program_name, description, type, level, band, tuitionFee, plos } = req.body;

    // Validation
    if (!code || !program_name || !type || !level) {
      return res.status(400).json({
        success: false,
        message: 'Mã chương trình, tên, loại và cấp độ là bắt buộc'
      });
    }

    // Check if code already exists
    const existingProgram = await Program.findOne({ code });
    if (existingProgram) {
      return res.status(400).json({
        success: false,
        message: 'Mã chương trình đã tồn tại'
      });
    }

    const program = await Program.create({
      code,
      program_name,
      description,
      type,
      level,
      band,
      tuitionFee: tuitionFee || 0,
      plos: plos || [],
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Tạo chương trình thành công',
      data: program
    });
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo chương trình',
      error: error.message
    });
  }
};

/**
 * Update program
 * PUT /api/programs/:id
 */
const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, program_name, description, type, level, band, tuitionFee, plos, status } = req.body;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình'
      });
    }

    // Check if new code already exists (if code is being changed)
    if (code && code !== program.code) {
      const existingProgram = await Program.findOne({ code });
      if (existingProgram) {
        return res.status(400).json({
          success: false,
          message: 'Mã chương trình đã tồn tại'
        });
      }
    }

    // Update fields
    if (code) program.code = code;
    if (program_name) program.program_name = program_name;
    if (description !== undefined) program.description = description;
    if (type) program.type = type;
    if (level) program.level = level;
    if (band !== undefined) program.band = band;
    if (tuitionFee !== undefined) program.tuitionFee = tuitionFee;
    if (plos) program.plos = plos;
    if (status) program.status = status;

    await program.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật chương trình thành công',
      data: program
    });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật chương trình',
      error: error.message
    });
  }
};

/**
 * Delete program
 * DELETE /api/programs/:id
 */
const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình'
      });
    }

    // Check if program has any courses
    const courseCount = await Course.countDocuments({ program: id });
    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa chương trình đang có khóa học'
      });
    }

    await Program.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa chương trình thành công'
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa chương trình',
      error: error.message
    });
  }
};

/**
 * Get program PLOs
 * GET /api/programs/:id/plos
 */
const getProgramPLOs = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id).populate('plos');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình'
      });
    }

    res.status(200).json({
      success: true,
      data: program.plos
    });
  } catch (error) {
    console.error('Error getting program PLOs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy PLOs của chương trình',
      error: error.message
    });
  }
};

module.exports = {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramPLOs
};
