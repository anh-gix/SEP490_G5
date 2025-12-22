const Program = require('../models/programModel');
const Course = require('../models/courseModel');
const Session = require('../models/sessionModel');
const CamSession = require('../models/camSession');
const WorkRequest = require('../models/workRequestModel');
const Class = require('../models/classModel');
const ClassSchedule = require('../models/classScheduleModel');
const { getBandByTypeAndLevel, getBandOptionsByType } = require('../utils/programBandMapper');

// =========================
// PROGRAM CRUD OPERATIONS
// =========================

/**
 * Get all programs with statistics
 * GET /api/programs
 */
const getAllPrograms = async (req, res) => {
  try {
    // Filter out draft, needs_revision, pending_approval programs
    // Only show approved and active programs for reference
    const programs = await Program.find({
      status: { $nin: ['draft', 'needs_revision', 'pending_approval'] }
    })
      .populate('createdBy', 'username email phone address')
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
 * Get programs created by current teacher
 * GET /api/programs/my-programs
 */
const getMyPrograms = async (req, res) => {
  try {
    // Get teacherId from authenticated user (assuming req.user is set by auth middleware)
    const teacherId = req.user?._id || req.query.teacherId || req.body.teacherId;

    if (!teacherId) {
      // Return empty array if no teacherId provided instead of error
      console.warn('No teacherId provided for getMyPrograms, returning empty array');
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: 'Chưa có thông tin teacher để lọc'
      });
    }

    const programs = await Program.find({ createdBy: teacherId })
      .populate('createdBy', 'username email phone address')
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
    console.error('Error getting my programs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách chương trình của tôi',
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
      .select('_id courseCode name description status isActive learningType createdAt updatedAt clos sessions mappedPLOs');

    // Get work request info if exists (use WorkRequest model)
    const workRequest = await WorkRequest.findOne({
      entityId: id,
      entityType: 'Program',
      direction: 'bottom_up'
    })
      .populate('requestedBy', 'username email')
      .populate('processedBy', 'username email')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...program.toObject(),
        courses,
        workRequestInfo: workRequest // Changed from approvalInfo
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

    // Auto-calculate band if not provided
    const finalBand = band || getBandByTypeAndLevel(type, level);

    const program = await Program.create({
      code,
      program_name,
      description,
      type,
      level,
      band: finalBand,
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
    if (plos !== undefined) program.plos = plos;

    // Auto-calculate band if type or level changed and band not explicitly provided
    if ((type || level) && band === undefined) {
      const updatedType = type || program.type;
      const updatedLevel = level || program.level;
      program.band = getBandByTypeAndLevel(updatedType, updatedLevel);
    } else if (band !== undefined) {
      program.band = band;
    }

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

    // Chỉ cho phép xóa program ở trạng thái draft
    if (program.status !== 'draft') {
      const statusLabels = {
        'pending_approval': 'Chờ phê duyệt',
        'approved': 'Đã duyệt',
        'needs_revision': 'Cần chỉnh sửa',
        'archived': 'Đã lưu trữ'
      };

      return res.status(400).json({
        success: false,
        message: `Không thể xóa chương trình này vì đang ở trạng thái "${statusLabels[program.status] || program.status}".\n\n` +
                 `Chỉ có thể xóa chương trình ở trạng thái "Bản nháp" (draft).`,
        programStatus: program.status
      });
    }

    // Check if program is linked to any work requests (any status except completed/approved/rejected)
    const linkedWorkRequest = await WorkRequest.findOne({
      entityType: 'Program',
      entityId: id,
      status: { $in: ['pending', 'in_progress', 'pending_approval', 'need_revision'] }
    }).populate('requestedBy', 'username email');

    // Nếu có work request liên kết, unlink program khỏi work request thay vì chặn xóa
    if (linkedWorkRequest) {
      console.log(`Unlinking program ${id} from work request ${linkedWorkRequest._id}`);

      // Set entityId = null để work request vẫn còn nhưng không liên kết với program
      await WorkRequest.findByIdAndUpdate(linkedWorkRequest._id, {
        entityId: null,
        $push: {
          history: {
            action: 'entity_deleted',
            performedBy: req.body.userId || null,
            performedAt: new Date(),
            note: `Chương trình "${program.program_name}" đã bị xóa. Có thể tạo lại chương trình mới cho request này.`
          }
        }
      });

      console.log(`✅ Unlinked work request ${linkedWorkRequest._id} from deleted program`);
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
// HELPER FUNCTIONS FOR APPROVAL
// =========================

/**
 * Get program submission status (check if can submit)
 * GET /api/programs/:id/submission-status
 */
const getProgramSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình'
      });
    }

    // Get courses status
    const totalCourses = await Course.countDocuments({ program: id });
    const completedCourses = await Course.countDocuments({
      program: id,
      status: 'completed'
    });

    const canSubmit =
      ['draft', 'needs_revision'].includes(program.status) &&
      program.plos && program.plos.length > 0 &&
      totalCourses > 0 &&
      totalCourses === completedCourses;

    const draftCourses = await Course.find({
      program: id,
      status: 'draft'
    }).select('courseCode name');

    res.status(200).json({
      success: true,
      data: {
        programStatus: program.status,
        canSubmit,
        totalCourses,
        completedCourses,
        draftCourses,
        hasPLOs: program.plos && program.plos.length > 0,
        validationMessages: !canSubmit ? [
          !['draft', 'needs_revision'].includes(program.status) ? `Program status is ${program.status}` : null,
          !(program.plos && program.plos.length > 0) ? 'Program must have at least 1 PLO' : null,
          totalCourses === 0 ? 'Program must have at least 1 course' : null,
          totalCourses !== completedCourses ? `${totalCourses - completedCourses} courses are still in draft` : null
        ].filter(Boolean) : []
      }
    });
  } catch (error) {
    console.error('Error getting submission status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra trạng thái nộp chương trình',
      error: error.message
    });
  }
};

// NOTE: Submit, Approve, Reject functions are now handled by approvalRequestController
// These functions are DEPRECATED and kept for backward compatibility only

/**
 * Toggle program active status (isActive field)
 * PATCH /api/programs/:id/toggle-active
 *
 * Center Head can toggle isActive for approved programs
 * When isActive = true: Program is open for enrollment
 * When isActive = false: Program is paused/closed
 */
/**
 * Update program active status (set isActive = true/false)
 * PATCH /api/programs/:id/active
 * Body: { isActive: boolean }
 */
const updateProgramActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate isActive parameter
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive phải là true hoặc false'
      });
    }

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình'
      });
    }

    // Only approved programs can have isActive changed
    if (program.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể thay đổi trạng thái hoạt động của chương trình đã được duyệt',
        currentStatus: program.status
      });
    }

    // Update isActive
    program.isActive = isActive;
    await program.save();

    res.status(200).json({
      success: true,
      message: isActive
        ? 'Đã mở chương trình cho đăng ký'
        : 'Đã tạm dừng chương trình',
      data: program
    });
  } catch (error) {
    console.error('Error updating program active status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thay đổi trạng thái hoạt động của chương trình',
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

/**
 * Get band options for a specific program type
 * GET /api/programs/band-options/:type
 */
const getBandOptions = async (req, res) => {
  try {
    const { type } = req.params;

    if (!['ielts', 'toeic', 'cam'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type không hợp lệ. Chỉ chấp nhận: ielts, toeic, cam'
      });
    }

    const bandOptions = getBandOptionsByType(type);

    res.status(200).json({
      success: true,
      data: {
        type,
        bandOptions
      }
    });
  } catch (error) {
    console.error('Error getting band options:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách band options',
      error: error.message
    });
  }
};

// =========================
// PROGRAM ACTIVATION/DEACTIVATION
// =========================

/**
 * Check if a program can be deactivated
 * GET /api/programs/:id/can-deactivate
 *
 * Logic: Program chỉ có thể deactivate khi TẤT CẢ courses của nó đã inactive
 * (không còn course nào có isActive = true)
 */
const canDeactivateProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình đào tạo'
      });
    }

    // Nếu program đã inactive rồi
    if (!program.isActive) {
      return res.status(200).json({
        success: true,
        canDeactivate: true,
        message: 'Chương trình đào tạo đã ở trạng thái inactive'
      });
    }

    // Tìm tất cả courses của program còn active
    const activeCourses = await Course.find({
      program: id,
      isActive: true
    }).select('_id courseCode name status isActive');

    if (activeCourses.length === 0) {
      return res.status(200).json({
        success: true,
        canDeactivate: true,
        message: 'Có thể deactivate chương trình - tất cả khóa học đã inactive'
      });
    }

    // Có courses còn active, kiểm tra chi tiết từng course
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const courseDetails = await Promise.all(
      activeCourses.map(async (course) => {
        // Tìm các class đang dùng course này
        const activeClasses = await Class.find({
          course: course._id,
          status: { $in: ['pending', 'active'] }
        }).select('_id name');

        let futureScheduleCount = 0;
        let estimatedEndDate = null;

        if (activeClasses.length > 0) {
          const classIds = activeClasses.map(c => c._id);

          futureScheduleCount = await ClassSchedule.countDocuments({
            class: { $in: classIds },
            date: { $gte: today },
            status: { $in: ['temporary', 'fixed'] }
          });

          if (futureScheduleCount > 0) {
            const lastSchedule = await ClassSchedule.findOne({
              class: { $in: classIds },
              status: { $in: ['temporary', 'fixed'] }
            })
            .sort({ date: -1 })
            .select('date');
            estimatedEndDate = lastSchedule?.date;
          }
        }

        return {
          _id: course._id,
          courseCode: course.courseCode,
          name: course.name,
          status: course.status,
          isActive: course.isActive,
          activeClassCount: activeClasses.length,
          futureScheduleCount,
          estimatedEndDate
        };
      })
    );

    return res.status(200).json({
      success: true,
      canDeactivate: false,
      message: `Không thể deactivate - còn ${activeCourses.length} khóa học đang active`,
      activeCourses: courseDetails
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra trạng thái chương trình',
      error: err.message
    });
  }
};

/**
 * Deactivate a program
 * PATCH /api/programs/:id/deactivate
 *
 * Logic:
 * - Check canDeactivate trước (tất cả courses phải inactive)
 * - Nếu OK thì set isActive = false
 */
const deactivateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { force = false } = req.body;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình đào tạo'
      });
    }

    // Nếu program đã inactive rồi
    if (!program.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Chương trình đào tạo đã ở trạng thái inactive'
      });
    }

    // Tìm courses còn active
    const activeCourses = await Course.find({
      program: id,
      isActive: true
    }).select('_id courseCode name');

    if (activeCourses.length > 0 && !force) {
      return res.status(400).json({
        success: false,
        message: `Không thể deactivate - còn ${activeCourses.length} khóa học đang active`,
        activeCourses: activeCourses.map(c => ({
          _id: c._id,
          courseCode: c.courseCode,
          name: c.name
        })),
        hint: 'Vui lòng deactivate tất cả khóa học trước, hoặc sử dụng force=true'
      });
    }

    // Nếu force = true, deactivate tất cả courses trước
    if (force && activeCourses.length > 0) {
      await Course.updateMany(
        { program: id, isActive: true },
        {
          isActive: false,
          status: 'available'
        }
      );

      // Cập nhật các class thành completed
      const courseIds = activeCourses.map(c => c._id);
      await Class.updateMany(
        {
          course: { $in: courseIds },
          status: { $in: ['pending', 'active'] }
        },
        { status: 'completed' }
      );
    }

    // Deactivate program
    const updatedProgram = await Program.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('_id code program_name status isActive');

    res.status(200).json({
      success: true,
      message: 'Đã deactivate chương trình đào tạo thành công',
      program: updatedProgram,
      coursesDeactivated: force ? activeCourses.length : 0
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi deactivate chương trình',
      error: err.message
    });
  }
};

/**
 * Activate a program
 * PATCH /api/programs/:id/activate
 *
 * Logic: Chỉ cho phép activate nếu program status là 'approved'
 */
const activateProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình đào tạo'
      });
    }

    // Chỉ cho phép activate nếu program đã approved
    if (program.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Không thể activate chương trình ở trạng thái "${program.status}". Chỉ có thể activate chương trình đã được phê duyệt.`
      });
    }

    // Activate program
    const updatedProgram = await Program.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).select('_id code program_name status isActive');

    res.status(200).json({
      success: true,
      message: 'Đã activate chương trình đào tạo thành công',
      program: updatedProgram
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi activate chương trình',
      error: err.message
    });
  }
};

module.exports = {
  getAllPrograms,
  getMyPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramPLOs,
  getProgramSubmissionStatus,
  updateProgramActiveStatus,
  archiveProgram,
  getBandOptions,
  canDeactivateProgram,
  deactivateProgram,
  activateProgram
};
