
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
            mocktestSessionOrders
        } = req.body;

        // Validation
        if (!courseCode || !name || !program) {
            return res.status(400).json({
                success: false,
                message: 'Mã môn học, tên giáo trình và chương trình là bắt buộc'
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
            status: 'draft'
        };

        // Add createdBy if user is authenticated
        if (req.user && req.user._id) {
            courseData.createdBy = req.user._id;
        }

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

