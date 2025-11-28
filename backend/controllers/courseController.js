
const Course = require('../models/courseModel');
const Program = require('../models/programModel');

// =========================
// COURSE CRUD OPERATIONS
// =========================

/**
 * Get all courses
 * GET /api/courses
 */
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('program', 'program_name code')
            .populate('createdBy', 'fullname email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: courses,
            count: courses.length
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: err.message
        });
    }
};

/**
 * Get course by ID
 * GET /api/courses/:id
 */
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('program', 'program_name code')
            .populate('createdBy', 'fullname email')
            .populate('clos')
            .populate({
                path: 'sessions',
                populate: { path: 'clos', select: 'code description' },
                options: { sort: { order: 1 } }
            });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giáo trình'
            });
        }

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: err.message
        });
    }
};

/**
 * Create new course
 * POST /api/courses
 */
exports.createCourse = async (req, res) => {
    try {
        const {
            courseCode,
            name,
            description,
            numberOfSessions,
            timeAllocation,
            preRequisite,
            studentTasks,
            program,
            clos,
            sessions,
            materials,
            mocktestSessionOrders,
            createdBy
        } = req.body;

        // Validation
        if (!courseCode || !name || !program) {
            return res.status(400).json({
                success: false,
                message: 'Mã môn học, tên giáo trình và chương trình là bắt buộc'
            });
        }

        // Validate createdBy
        if (!createdBy) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin người tạo (createdBy)'
            });
        }

        // Check if program exists
        const programExists = await Program.findById(program);
        if (!programExists) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chương trình'
            });
        }

        // Check if courseCode already exists
        const existingCourse = await Course.findOne({ courseCode });
        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: 'Mã môn học đã tồn tại'
            });
        }

        const courseData = {
            courseCode,
            name,
            description,
            numberOfSessions,
            timeAllocation,
            preRequisite,
            studentTasks,
            program,
            clos: clos || [],
            sessions: sessions || [],
            materials: materials || [],
            mocktestSessionOrders: mocktestSessionOrders || [],
            createdBy,
            status: 'draft'
        };

        const course = await Course.create(courseData);

        const populatedCourse = await Course.findById(course._id)
            .populate('program', 'program_name code')
            .populate('createdBy', 'fullname email')
            .populate('clos')
            .populate('sessions');

        res.status(201).json({
            success: true,
            message: 'Tạo giáo trình thành công',
            data: populatedCourse
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: err.message
        });
    }
};

/**
 * Update course
 * PUT /api/courses/:id
 */
exports.updateCourse = async (req, res) => {
    try {
        const {
            courseCode,
            name,
            description,
            numberOfSessions,
            timeAllocation,
            preRequisite,
            studentTasks,
            program,
            clos,
            sessions,
            materials,
            mocktestSessionOrders,
            status
        } = req.body;

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giáo trình'
            });
        }

        // Check if new courseCode already exists (if courseCode is being changed)
        if (courseCode && courseCode !== course.courseCode) {
            const existingCourse = await Course.findOne({ courseCode });
            if (existingCourse) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã môn học đã tồn tại'
                });
            }
        }

        // Update fields
        if (courseCode) course.courseCode = courseCode;
        if (name) course.name = name;
        if (description !== undefined) course.description = description;
        if (numberOfSessions !== undefined) course.numberOfSessions = numberOfSessions;
        if (timeAllocation !== undefined) course.timeAllocation = timeAllocation;
        if (preRequisite !== undefined) course.preRequisite = preRequisite;
        if (studentTasks !== undefined) course.studentTasks = studentTasks;
        if (program) course.program = program;
        if (clos) course.clos = clos;
        if (sessions) course.sessions = sessions;
        if (materials) course.materials = materials;
        if (mocktestSessionOrders) course.mocktestSessionOrders = mocktestSessionOrders;
        if (status) course.status = status;

        await course.save();

        const updatedCourse = await Course.findById(req.params.id)
            .populate('program', 'program_name code')
            .populate('createdBy', 'fullname email')
            .populate('clos')
            .populate('sessions');

        res.status(200).json({
            success: true,
            message: 'Cập nhật giáo trình thành công',
            data: updatedCourse
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: err.message
        });
    }
};

/**
 * Delete course
 * DELETE /api/courses/:id
 */
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giáo trình'
            });
        }

        await Course.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Xóa giáo trình thành công'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: err.message
        });
    }
};

// =========================
// COURSE APPROVAL WORKFLOW
// =========================

// Lấy tất cả courses đã được phê duyệt (cho student view)
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'approved' })
            .populate('createdBy', 'name fullname email')
            .populate('program', 'program_name code')
            .select('name description program createdBy status createdAt updatedAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
};

// [Màn 2] Lấy danh sách Giáo trình chờ duyệt
exports.getPendingCourses = async (req, res) => {
    try {
        const pendingCourses = await Course.find({ status: 'pending_approval' })
            .populate('createdBy', 'fullname') // Lấy tên người tạo
            .select('name createdBy sentAt status') // Chọn các trường cần thiết
            .sort({ sentAt: -1 }); // Sắp xếp mới nhất lên đầu

        res.status(200).json({
            success: true,
            count: pendingCourses.length,
            data: pendingCourses
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
};

// [Màn 3] Lấy chi tiết Giáo trình
exports.getCourseDetails = async (req, res) => {
    try {
        console.log(req.params.id);
        
        const course = await Course.findById(req.params.id)
            .populate('program', 'program_name code') // Thông tin chung
            .populate('createdBy', 'name email')      // Thông tin người tạo
            .populate({ // Lấy thông tin chi tiết các buổi học
                path: 'sessions',
                options: { sort: { order: 1 } } // Sắp xếp theo thứ tự
            }) 
            .populate({ // Lấy thông tin CLO và PLO đã map
                path: 'clos',
                populate: {
                    path: 'mappedPLOs',
                    select: 'code name' // Lấy thông tin PLO đã map
                }
            });

        if (!course) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy giáo trình' });
        }

        res.status(200).json({
            success: true,
            data: course
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
};

// [Màn 3 - Nút] Phê duyệt giáo trình
exports.approveCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'approved',
                revisionReason: null // Xóa lý do cũ (nếu có)
            },
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy giáo trình' });
        }

        // Logic phụ (nếu có): Gửi email thông báo cho Subject Leader...

        res.status(200).json({
            success: true,
            message: 'Đã phê duyệt giáo trình thành công.',
            data: course
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
};

// [Màn 3 - Nút] Yêu cầu chỉnh sửa
exports.requestRevision = async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp lý do yêu cầu chỉnh sửa.' });
    }

    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            {
                status: 'needs_revision',
                revisionReason: reason
            },
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy giáo trình' });
        }

        res.status(200).json({
            success: true,
            message: 'Đã gửi yêu cầu chỉnh sửa thành công.',
            data: course
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
};

// =========================
// PROGRAM HEAD: ACCEPT/REJECT COURSE
// =========================

/**
 * Accept course to add to program (Center Head)
 * PATCH /api/courses/:id/accept
 */
exports.acceptCourseToProgram = async (req, res) => {
    const { approvalNote } = req.body;

    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giáo trình'
            });
        }

        // Only accept courses that are pending approval
        if (course.status !== 'pending_approval') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể chấp nhận giáo trình đang chờ phê duyệt'
            });
        }

        // Update course status to approved
        course.status = 'approved';
        course.approvedAt = new Date();
        course.approvalNote = approvalNote || '';

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Đã chấp nhận giáo trình vào chương trình thành công',
            data: course
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: err.message
        });
    }
};

/**
 * Reject course from program (Center Head)
 * PATCH /api/courses/:id/reject
 */
exports.rejectCourseFromProgram = async (req, res) => {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng cung cấp lý do từ chối'
        });
    }

    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giáo trình'
            });
        }

        // Only reject courses that are pending approval
        if (course.status !== 'pending_approval') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể từ chối giáo trình đang chờ phê duyệt'
            });
        }

        // Update course status to needs_revision
        course.status = 'needs_revision';
        course.rejectedAt = new Date();
        course.rejectionReason = rejectionReason;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Đã từ chối giáo trình thành công',
            data: course
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: err.message
        });
    }
};

// =========================
// COURSE UTILITY FUNCTIONS
// =========================

/**
 * Get all unique types from Program collection
 * GET /api/courses/all-types
 */
exports.getAllTypes = async (req, res) => {
    try {
        const types = await Program.distinct('type', { status: 'active' });
        
        res.status(200).json({
            success: true,
            types: types.sort()
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: err.message
        });
    }
};

/**
 * Get all unique levels from Program collection
 * GET /api/courses/all-levels
 */
exports.getAllLevels = async (req, res) => {
    try {
        const levels = await Program.distinct('level', { status: 'active' });
        
        // Sort levels in order: Pre-A1, A1, A2, B1, B2, C1, C2
        const levelOrder = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const sortedLevels = levels.sort((a, b) => {
            const indexA = levelOrder.indexOf(a);
            const indexB = levelOrder.indexOf(b);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
        
        res.status(200).json({
            success: true,
            levels: sortedLevels
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: err.message
        });
    }
};

/**
 * Get levels by type
 * GET /api/courses/levels?type=ielts
 */
exports.getLevelsByType = async (req, res) => {
    try {
        const { type } = req.query;
        
        if (!type) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu tham số type'
            });
        }
        
        const levels = await Program.distinct('level', { 
            type: type,
            status: 'active' 
        });
        
        // Sort levels in order
        const levelOrder = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const sortedLevels = levels.sort((a, b) => {
            const indexA = levelOrder.indexOf(a);
            const indexB = levelOrder.indexOf(b);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
        
        res.status(200).json({
            success: true,
            levels: sortedLevels
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: err.message
        });
    }
};

/**
 * Get courses by program name and level
 * GET /api/courses/by-program?programName=IELTS&level=B1
 */
exports.getCoursesByProgram = async (req, res) => {
    try {
        const { programName, level } = req.query;
        
        if (!programName || !level) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu tham số programName hoặc level'
            });
        }
        
        // Find program by program_name and level
        const program = await Program.findOne({
            program_name: { $regex: new RegExp(programName, 'i') },
            level: level,
            status: 'active'
        });
        
        if (!program) {
            return res.status(200).json({
                success: true,
                courses: []
            });
        }
        
        // Find courses that belong to this program
        const courses = await Course.find({
            program: program._id,
            status: 'approved'
        })
        .populate('program', 'program_name code type level')
        .select('name description program')
        .sort({ name: 1 });
        
        res.status(200).json({
            success: true,
            courses: courses
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: err.message
        });
    }
};

/**
 * Get band by type and level
 * GET /api/courses/band?type=ielts&level=B1
 */
exports.getBandByTypeAndLevel = async (req, res) => {
    try {
        const { type, level } = req.query;
        
        if (!type || !level) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu tham số type hoặc level'
            });
        }
        
        const program = await Program.findOne({
            type: type,
            level: level,
            status: 'active'
        });
        
        if (!program || !program.band) {
            return res.status(200).json({
                success: true,
                band: null
            });
        }
        
        res.status(200).json({
            success: true,
            band: program.band
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: err.message
        });
    }
};

/**
 * Get all course mappings (type, level, band) from Program model
 * GET /api/courses/mappings
 */
exports.getCourseMappings = async (req, res) => {
    try {
        const programs = await Program.find({ status: 'active' })
            .select('type level band program_name code')
            .sort({ type: 1, level: 1 });
        
        const mappings = programs.map(program => ({
            type: program.type,
            level: program.level,
            band: program.band,
            programName: program.program_name,
            code: program.code
        }));
        
        res.status(200).json({
            success: true,
            mappings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ khi lấy mappings',
            error: err.message
        });
    }
};

/**
 * Get types by level from Program model
 * GET /api/courses/types-by-level?level=A1
 */
exports.getTypesByLevel = async (req, res) => {
    try {
        const { level } = req.query;
        
        if (!level) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu tham số level'
            });
        }
        
        const programs = await Program.find({
            level: level,
            status: 'active'
        }).distinct('type');
        
        res.status(200).json({
            success: true,
            types: programs
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ khi lấy types theo level',
            error: err.message
        });
    }
};

