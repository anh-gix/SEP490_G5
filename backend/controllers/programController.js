const Program = require('../models/programModel');
const Course = require('../models/courseModel');
const Session = require('../models/sessionModel');
const CamSession = require('../models/camSession');

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

    const program = await Program.findById(id)
      .populate('rejectedBy', 'username email')
      .populate('approvedBy', 'username email')
      .populate('submittedBy', 'username email')
      .populate('createdBy', 'username email');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình'
      });
    }

    // Get courses belong to this program
    const courses = await Course.find({ program: id })
      .populate('createdBy', 'username email')
      .populate('sessions', 'title order')
      .populate('rejectedBy', 'username email')
      .select('_id courseCode name description status createdAt updatedAt clos sessions mappedPLOs rejectionReason rejectedBy rejectedAt');

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
    const { code, program_name, description, type, level, band, plos, createdBy } = req.body;

    // Validation
    if (!code || !program_name || !type || !level) {
      return res.status(400).json({
        success: false,
        message: 'Mã chương trình, tên, loại và cấp độ là bắt buộc'
      });
    }

    // Validate createdBy
    if (!createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin người tạo (createdBy)'
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

    // Validate PLOs if provided
    if (plos && plos.length > 0) {
      // Check for duplicate PLO codes within this program
      const ploCodes = plos.map(p => p.code);
      const duplicates = ploCodes.filter((code, index) => ploCodes.indexOf(code) !== index);
      if (duplicates.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Mã PLO bị trùng trong chương trình: ${duplicates.join(', ')}`
        });
      }

      // Validate each PLO has required fields
      for (const plo of plos) {
        if (!plo.code || !plo.name || !plo.detail) {
          return res.status(400).json({
            success: false,
            message: 'Mỗi PLO phải có đầy đủ code, name và detail'
          });
        }
      }
    }

    const program = await Program.create({
      code,
      program_name,
      description,
      type,
      level,
      band,
      plos: plos || [],
      createdBy,
      status: 'draft'  // Always create as draft
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
    const { code, program_name, description, type, level, band, plos } = req.body;

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

    // Validate PLOs if provided
    if (plos && plos.length > 0) {
      // Check for duplicate PLO codes within this program
      const ploCodes = plos.map(p => p.code);
      const duplicates = ploCodes.filter((code, index) => ploCodes.indexOf(code) !== index);
      if (duplicates.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Mã PLO bị trùng trong chương trình: ${duplicates.join(', ')}`
        });
      }

      // Validate each PLO has required fields
      for (const plo of plos) {
        if (!plo.code || !plo.name || !plo.detail) {
          return res.status(400).json({
            success: false,
            message: 'Mỗi PLO phải có đầy đủ code, name và detail'
          });
        }
      }
    }

    // Update fields (status is managed by workflow methods only)
    if (code) program.code = code;
    if (program_name) program.program_name = program_name;
    if (description !== undefined) program.description = description;
    if (type) program.type = type;
    if (level) program.level = level;
    if (band !== undefined) program.band = band;
    if (plos !== undefined) program.plos = plos;

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
 * Delete program (CASCADE - xóa toàn bộ dữ liệu liên quan)
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

    console.log(`Starting CASCADE deletion for program: ${program.program_name} (${id})`);

    // Step 1: Find all courses in this program
    const courses = await Course.find({ program: id });
    console.log(`Found ${courses.length} courses to delete`);

    // Step 2: Delete all related data for each course
    let totalSessions = 0;
    let totalCamSessions = 0;
    let totalCLOs = 0;

    for (const course of courses) {
      // Delete all sessions in this course
      if (course.sessions && course.sessions.length > 0) {
        const sessionDeleteResult = await Session.deleteMany({
          _id: { $in: course.sessions }
        });
        console.log(`Deleted ${sessionDeleteResult.deletedCount} sessions for course ${course.name}`);
        totalSessions += sessionDeleteResult.deletedCount;
      }

      // Delete all CamSessions in this course
      if (course.camSessions && course.camSessions.length > 0) {
        const camSessionDeleteResult = await CamSession.deleteMany({
          _id: { $in: course.camSessions }
        });
        console.log(`Deleted ${camSessionDeleteResult.deletedCount} CAM sessions for course ${course.name}`);
        totalCamSessions += camSessionDeleteResult.deletedCount;
      }

      // CLOs are now embedded in the course, so they will be deleted automatically with the course
      const cloCount = course.clos?.length || 0;
      console.log(`CLOs (${cloCount}) will be deleted with the course ${course.name}`);
      totalCLOs += cloCount;

      // Delete the course itself
      await Course.findByIdAndDelete(course._id);
      console.log(`Deleted course: ${course.name}`);
    }

    // Step 3: PLOs are now embedded, so they will be deleted with the program automatically
    console.log(`PLOs (${program.plos.length}) will be deleted with the program`);

    // Step 4: Delete the program itself
    await Program.findByIdAndDelete(id);
    console.log(`Deleted program: ${program.program_name}`);

    res.status(200).json({
      success: true,
      message: 'Đã xóa chương trình và toàn bộ dữ liệu liên quan thành công',
      deletedData: {
        program: program.program_name,
        courses: courses.length,
        sessions: totalSessions,
        camSessions: totalCamSessions,
        clos: totalCLOs,
        plos: program.plos.length
      }
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

    const program = await Program.findById(id);

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

// =========================
// APPROVAL WORKFLOW
// =========================

/**
 * Submit program for approval
 * PATCH /api/programs/:id/submit
 */
const submitProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { submittedBy } = req.body;

    if (!submittedBy) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin người nộp (submittedBy)'
      });
    }

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình'
      });
    }

    // Check if program is in draft or needs_revision status
    if (program.status !== 'draft' && program.status !== 'needs_revision') {
      return res.status(400).json({
        success: false,
        message: `Không thể nộp chương trình có trạng thái ${program.status}`
      });
    }

    // Validate program has required data
    if (!program.plos || program.plos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Chương trình phải có ít nhất 1 PLO trước khi nộp'
      });
    }

    // Update status and tracking fields
    program.status = 'pending_approval';
    program.submittedAt = new Date();
    program.submittedBy = submittedBy;

    // Add to revision history
    program.revisionHistory.push({
      action: program.status === 'needs_revision' ? 'resubmitted' : 'submitted',
      performedBy: submittedBy,
      performedAt: new Date(),
      note: 'Nộp chương trình để Center Head duyệt'
    });

    await program.save();

    res.status(200).json({
      success: true,
      message: 'Nộp chương trình thành công',
      data: program
    });
  } catch (error) {
    console.error('Error submitting program:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi nộp chương trình',
      error: error.message
    });
  }
};

/**
 * Approve program
 * PATCH /api/programs/:id/approve
 */
const approveProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, approvalNote } = req.body;

    if (!approvedBy) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin người duyệt (approvedBy)'
      });
    }

    const program = await Program.findById(id).populate('createdBy', 'username email');
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình'
      });
    }

    // Check if program is in pending_approval status
    if (program.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: `Không thể duyệt chương trình có trạng thái ${program.status}`
      });
    }

    // Update status and tracking fields
    program.status = 'approved';
    program.approvedAt = new Date();
    program.approvedBy = approvedBy;
    program.approvalNote = approvalNote || '';

    // Clear rejection fields if any
    program.rejectedAt = undefined;
    program.rejectedBy = undefined;
    program.rejectionReason = undefined;

    // Add to revision history
    program.revisionHistory.push({
      action: 'approved',
      performedBy: approvedBy,
      performedAt: new Date(),
      note: approvalNote || 'Đã duyệt chương trình'
    });

    await program.save();

    res.status(200).json({
      success: true,
      message: 'Duyệt chương trình thành công',
      data: program
    });
  } catch (error) {
    console.error('Error approving program:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi duyệt chương trình',
      error: error.message
    });
  }
};

/**
 * Reject program
 * PATCH /api/programs/:id/reject
 */
const rejectProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectedBy, rejectionReason } = req.body;

    if (!rejectedBy) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin người từ chối (rejectedBy)'
      });
    }

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập lý do từ chối'
      });
    }

    const program = await Program.findById(id).populate('createdBy', 'username email');
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình'
      });
    }

    // Check if program is in pending_approval status
    if (program.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: `Không thể từ chối chương trình có trạng thái ${program.status}`
      });
    }

    // Update status and tracking fields
    program.status = 'needs_revision';
    program.rejectedAt = new Date();
    program.rejectedBy = rejectedBy;
    program.rejectionReason = rejectionReason;

    // Clear approval fields if any
    program.approvedAt = undefined;
    program.approvedBy = undefined;
    program.approvalNote = undefined;

    // Add to revision history
    program.revisionHistory.push({
      action: 'rejected',
      performedBy: rejectedBy,
      performedAt: new Date(),
      note: rejectionReason
    });

    await program.save();

    res.status(200).json({
      success: true,
      message: 'Đã yêu cầu chỉnh sửa chương trình',
      data: program
    });
  } catch (error) {
    console.error('Error rejecting program:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi từ chối chương trình',
      error: error.message
    });
  }
};

/**
 * Activate approved program
 * PATCH /api/programs/:id/activate
 */
const activateProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình'
      });
    }

    // Only approved programs can be activated
    if (program.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể kích hoạt chương trình đã được duyệt'
      });
    }

    program.status = 'active';
    await program.save();

    res.status(200).json({
      success: true,
      message: 'Kích hoạt chương trình thành công',
      data: program
    });
  } catch (error) {
    console.error('Error activating program:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kích hoạt chương trình',
      error: error.message
    });
  }
};

/**
 * Archive program
 * PATCH /api/programs/:id/archive
 */
const archiveProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình'
      });
    }

    program.status = 'archived';
    await program.save();

    res.status(200).json({
      success: true,
      message: 'Lưu trữ chương trình thành công',
      data: program
    });
  } catch (error) {
    console.error('Error archiving program:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lưu trữ chương trình',
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
  getProgramPLOs,
  // Approval workflow
  submitProgram,
  approveProgram,
  rejectProgram,
  activateProgram,
  archiveProgram
};
