
const Course = require('../models/courseModel');
const Program = require('../models/programModel');
const Class = require('../models/classModel');
const ClassSchedule = require('../models/classScheduleModel');

// =========================
// COURSE CRUD OPERATIONS
// =========================

/**
 * Get all courses
 * GET /api/courses
 * Query params: status, program, search
 */
exports.getAllCourses = async (req, res) => {
    try {
        const { status, program, search } = req.query;
        
        // Build query
        let query = {};
        
        // Filter by status if provided
        if (status) {
            query.status = status;
        }
        
        // Filter by program if provided
        if (program) {
            query.program = program;
        }
        
        // Search by name or courseCode
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { courseCode: { $regex: search, $options: 'i' } }
            ];
        }
        
        const courses = await Course.find(query)
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
            // Cần type để FE biết đây có phải course CAM không
            .populate('program', 'program_name code type level')
            .populate('createdBy', 'fullname email')
            // Sessions thường
            .populate({
                path: 'sessions',
                options: { sort: { order: 1 } }
            })
            // CAM Sessions cho course online CAM
            .populate({
                path: 'camSessions',
                options: { sort: { Order: 1 } }
            })
            // CLOs cùng mapped PLOs (nếu cần hiển thị chi tiết)
            .populate({
                path: 'clos',
                populate: {
                    path: 'mappedPLOs',
                    select: 'code name'
                }
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
            learningType,
            program,
            clos,
            mappedPLOs,
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

        // Validate CLOs if provided
        if (clos && clos.length > 0) {
            // Check for duplicate CLO codes within this course
            const cloCodes = clos.map(c => c.code);
            const duplicates = cloCodes.filter((code, index) => cloCodes.indexOf(code) !== index);
            if (duplicates.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Mã CLO bị trùng trong giáo trình: ${duplicates.join(', ')}`
                });
            }

            // Validate each CLO has required fields
            for (const clo of clos) {
                if (!clo.code || !clo.name || !clo.detail) {
                    return res.status(400).json({
                        success: false,
                        message: 'Mỗi CLO phải có đầy đủ code, name và detail'
                    });
                }
            }
        }

        const courseData = {
            courseCode,
            name,
            description,
            numberOfSessions,
            timeAllocation,
            preRequisite,
            studentTasks,
            learningType: learningType || 'offline',
            program,
            clos: clos || [],
            mappedPLOs: mappedPLOs || [],
            sessions: sessions || [],
            materials: materials || [],
            mocktestSessionOrders: mocktestSessionOrders || [],
            createdBy,
            status: 'draft',
            lastCompletedStep: req.body.lastCompletedStep || 0 // Support wizard progress tracking
        };

        const course = await Course.create(courseData);

        const populatedCourse = await Course.findById(course._id)
            .populate('program', 'program_name code')
            .populate('createdBy', 'fullname email')
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
            learningType,
            program,
            clos,
            mappedPLOs,
            sessions,
            materials,
            mocktestSessionOrders,
            status,
            lastCompletedStep
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

        // Validate CLOs if provided
        if (clos && clos.length > 0) {
            // Check for duplicate CLO codes within this course
            const cloCodes = clos.map(c => c.code);
            const duplicates = cloCodes.filter((code, index) => cloCodes.indexOf(code) !== index);
            if (duplicates.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Mã CLO bị trùng trong giáo trình: ${duplicates.join(', ')}`
                });
            }

            // Validate each CLO has required fields
            for (const clo of clos) {
                if (!clo.code || !clo.name || !clo.detail) {
                    return res.status(400).json({
                        success: false,
                        message: 'Mỗi CLO phải có đầy đủ code, name và detail'
                    });
                }
            }
        }

        // Validate session count does not exceed numberOfSessions
        if (sessions !== undefined && numberOfSessions !== undefined) {
            if (sessions.length > numberOfSessions) {
                return res.status(400).json({
                    success: false,
                    message: `Số lượng buổi học (${sessions.length}) không được vượt quá số lượng buổi học đã định (${numberOfSessions})`
                });
            }
        } else if (sessions !== undefined && course.numberOfSessions) {
            // If only sessions is being updated, check against existing numberOfSessions
            if (sessions.length > course.numberOfSessions) {
                return res.status(400).json({
                    success: false,
                    message: `Số lượng buổi học (${sessions.length}) không được vượt quá số lượng buổi học đã định (${course.numberOfSessions})`
                });
            }
        } else if (numberOfSessions !== undefined && course.sessions && course.sessions.length > 0) {
            // If only numberOfSessions is being updated, check against existing sessions count
            if (course.sessions.length > numberOfSessions) {
                return res.status(400).json({
                    success: false,
                    message: `Không thể giảm số lượng buổi học xuống ${numberOfSessions} vì đã có ${course.sessions.length} buổi học được tạo`
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
        if (learningType !== undefined) course.learningType = learningType;
        if (program) course.program = program;
        if (clos !== undefined) course.clos = clos;
        if (mappedPLOs !== undefined) course.mappedPLOs = mappedPLOs;
        if (sessions !== undefined) course.sessions = sessions;
        if (req.body.camSessions !== undefined) course.camSessions = req.body.camSessions;
        if (materials !== undefined) course.materials = materials;
        if (mocktestSessionOrders !== undefined) course.mocktestSessionOrders = mocktestSessionOrders;
        if (status) course.status = status;
        if (lastCompletedStep !== undefined) {
            // Validate lastCompletedStep range (0-5)
            if (lastCompletedStep < 0 || lastCompletedStep > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'lastCompletedStep phải từ 0 đến 5'
                });
            }
            course.lastCompletedStep = lastCompletedStep;
        }

        await course.save();

        const updatedCourse = await Course.findById(req.params.id)
            .populate('program', 'program_name code')
            .populate('createdBy', 'fullname email')
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
// COURSE STATUS MANAGEMENT
// =========================
// Note: Course không có approval workflow
// Status chỉ để tracking: draft, completed, active (có students), archived

/**
 * Archive course
 * PATCH /api/courses/:id/archive
 */
exports.archiveCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giáo trình'
            });
        }

        course.status = 'archived';
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lưu trữ giáo trình thành công',
            data: course
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lưu trữ giáo trình',
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
 * Supports both program_name and type matching
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
        
        // Map program display names to types
        const programNameToType = {
            'IELTS': 'ielts',
            'TOEIC': 'toeic',
            'Cambridge': 'cam',
            'Tiếng Anh Giao tiếp': 'cam'
        };
        
        // Normalize programName
        const normalizedProgramName = programName.trim();
        const mappedType = programNameToType[normalizedProgramName];
        
        // Try to find program by program_name first
        let program = await Program.findOne({
            program_name: { $regex: new RegExp(normalizedProgramName, 'i') },
            level: level,
            status: 'active'
        });
        
        // If not found by program_name, try by type
        if (!program && mappedType) {
            program = await Program.findOne({
                type: mappedType,
                level: level,
                status: 'active'
            });
        }
        
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
        
        // Normalize type to lowercase for case-insensitive matching
        const normalizedType = type.toLowerCase().trim();
        
        const program = await Program.findOne({
            type: normalizedType,
            level: level.trim(),
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

// =========================
// PLO MAPPING FUNCTIONS
// =========================

/**
 * Get PLOs of a Course's Program
 * GET /api/courses/:id/program-plos
 */
exports.getProgramPLOs = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate({
            path: 'program',
            populate: {
                path: 'plos',
                select: 'code name detail'
            }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giáo trình'
            });
        }

        if (!course.program) {
            return res.status(404).json({
                success: false,
                message: 'Giáo trình chưa được gán vào chương trình'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                programId: course.program._id,
                programName: course.program.program_name,
                programCode: course.program.code,
                plos: course.program.plos || []
            }
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
 * Update Course PLO Mapping
 * PUT /api/courses/:id/map-plos
 */
exports.updateCoursePLOMapping = async (req, res) => {
    try {
        const { id } = req.params;
        const { mappedPLOs } = req.body;

        if (!mappedPLOs || !Array.isArray(mappedPLOs)) {
            return res.status(400).json({
                success: false,
                message: 'mappedPLOs phải là một mảng'
            });
        }

        // Tìm course và populate program
        const course = await Course.findById(id).populate('program');
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giáo trình'
            });
        }

        if (!course.program) {
            return res.status(404).json({
                success: false,
                message: 'Giáo trình chưa được gán vào chương trình'
            });
        }

        // Validate: Tất cả PLO phải thuộc về Program của Course
        const programPLOIds = course.program.plos.map(plo => plo._id.toString());
        const invalidPLOs = mappedPLOs.filter(ploId => !programPLOIds.includes(ploId.toString()));

        if (invalidPLOs.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Có PLO không thuộc chương trình của giáo trình này',
                invalidPLOs
            });
        }

        // Update mappedPLOs
        course.mappedPLOs = mappedPLOs;
        await course.save();

        // Populate và trả về
        const updatedCourse = await Course.findById(id)
            .populate('program', 'program_name code')
            .populate('mappedPLOs', 'code name detail')
            .populate('clos');

        res.status(200).json({
            success: true,
            message: 'Cập nhật PLO mapping thành công',
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

// =========================
// COURSE MATERIALS
// =========================

/**
 * Upload material file
 * POST /api/courses/upload-material
 */
exports.uploadMaterialFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        // Build URL for the uploaded file
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/course-materials/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: 'Upload file thành công',
            url: fileUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi upload file',
            error: err.message
        });
    }
};

/**
 * Get course materials
 * GET /api/courses/:courseId/materials
 */
exports.getCourseMaterials = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId).select('materials name');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khóa học'
            });
        }

        // Format materials array (if it's an array of URLs)
        const formattedMaterials = (course.materials || []).map((materialUrl, index) => ({
            id: `course-${courseId}-${index}`,
            title: `Tài liệu ${index + 1}`,
            url: materialUrl,
            type: 'course',
            uploadDate: null // Course materials may not have upload dates
        }));

        res.status(200).json({
            success: true,
            message: 'Lấy tài liệu khóa học thành công',
            courseName: course.name,
            total: formattedMaterials.length,
            materials: formattedMaterials
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy tài liệu khóa học',
            error: err.message
        });
    }
};

// =========================
// COURSE ACTIVATION/DEACTIVATION
// =========================

/**
 * Check if a course can be deactivated
 * GET /api/courses/:id/can-deactivate
 *
 * Logic: Course chỉ có thể deactivate khi:
 * - Không có class nào đang active/pending sử dụng course
 * - HOẶC tất cả class đang dùng course không còn schedule tương lai
 */
exports.canDeactivateCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khóa học'
            });
        }

        // Nếu course đã inactive rồi
        if (!course.isActive) {
            return res.status(200).json({
                success: true,
                canDeactivate: true,
                message: 'Khóa học đã ở trạng thái inactive'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Tìm các class đang active hoặc pending sử dụng course này
        const activeClasses = await Class.find({
            course: id,
            status: { $in: ['pending', 'active'] }
        }).select('_id name status');

        if (activeClasses.length === 0) {
            return res.status(200).json({
                success: true,
                canDeactivate: true,
                message: 'Không có lớp học nào đang sử dụng khóa học này'
            });
        }

        // Check xem các class này còn schedule tương lai không
        const classIds = activeClasses.map(c => c._id);
        const futureSchedules = await ClassSchedule.find({
            class: { $in: classIds },
            date: { $gte: today },
            status: { $in: ['temporary', 'fixed'] }
        })
        .populate('class', 'name')
        .select('class date startTime endTime')
        .sort({ date: 1 })
        .limit(10);

        if (futureSchedules.length > 0) {
            // Tìm ngày kết thúc cuối cùng
            const lastSchedule = await ClassSchedule.findOne({
                class: { $in: classIds },
                status: { $in: ['temporary', 'fixed'] }
            })
            .sort({ date: -1 })
            .select('date');

            return res.status(200).json({
                success: true,
                canDeactivate: false,
                message: 'Còn lớp học đang sử dụng khóa học này với lịch học trong tương lai',
                activeClasses: activeClasses.map(c => ({
                    _id: c._id,
                    name: c.name,
                    status: c.status
                })),
                upcomingSchedules: futureSchedules.map(s => ({
                    className: s.class?.name,
                    date: s.date,
                    startTime: s.startTime,
                    endTime: s.endTime
                })),
                estimatedEndDate: lastSchedule?.date,
                totalFutureSchedules: await ClassSchedule.countDocuments({
                    class: { $in: classIds },
                    date: { $gte: today },
                    status: { $in: ['temporary', 'fixed'] }
                })
            });
        }

        return res.status(200).json({
            success: true,
            canDeactivate: true,
            message: 'Có thể deactivate khóa học - các lớp đã hết lịch học'
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi kiểm tra trạng thái khóa học',
            error: err.message
        });
    }
};

/**
 * Deactivate a course
 * PATCH /api/courses/:id/deactivate
 *
 * Logic:
 * - Check canDeactivate trước
 * - Nếu OK thì set isActive = false, status = 'available'
 * - Update các class liên quan thành 'completed' nếu cần
 */
exports.deactivateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { force = false } = req.body; // force = true để bỏ qua check

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khóa học'
            });
        }

        // Nếu course đã inactive rồi
        if (!course.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Khóa học đã ở trạng thái inactive'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Tìm các class đang active/pending
        const activeClasses = await Class.find({
            course: id,
            status: { $in: ['pending', 'active'] }
        }).select('_id name');

        if (activeClasses.length > 0 && !force) {
            const classIds = activeClasses.map(c => c._id);

            // Check schedule tương lai
            const futureScheduleCount = await ClassSchedule.countDocuments({
                class: { $in: classIds },
                date: { $gte: today },
                status: { $in: ['temporary', 'fixed'] }
            });

            if (futureScheduleCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Không thể deactivate - còn ${futureScheduleCount} buổi học trong tương lai`,
                    hint: 'Sử dụng force=true để bỏ qua kiểm tra này'
                });
            }

            // Cập nhật các class thành 'completed'
            await Class.updateMany(
                { _id: { $in: classIds } },
                { status: 'completed' }
            );
        }

        // Deactivate course
        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            {
                isActive: false,
                status: 'available'
            },
            { new: true }
        ).populate('program', 'program_name isActive');

        res.status(200).json({
            success: true,
            message: 'Đã deactivate khóa học thành công',
            course: {
                _id: updatedCourse._id,
                courseCode: updatedCourse.courseCode,
                name: updatedCourse.name,
                status: updatedCourse.status,
                isActive: updatedCourse.isActive,
                program: updatedCourse.program
            },
            classesUpdated: activeClasses.length
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi deactivate khóa học',
            error: err.message
        });
    }
};

/**
 * Activate a course
 * PATCH /api/courses/:id/activate
 *
 * Logic: Chỉ cho phép activate nếu course status là 'completed' hoặc 'available'
 */
exports.activateCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khóa học'
            });
        }

        // Chỉ cho phép activate nếu course đã completed hoặc available
        if (!['completed', 'available'].includes(course.status)) {
            return res.status(400).json({
                success: false,
                message: `Không thể activate khóa học ở trạng thái "${course.status}". Chỉ có thể activate khóa học đã hoàn thiện.`
            });
        }

        // Activate course
        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        ).populate('program', 'program_name isActive');

        // Activate program nếu chưa active
        if (updatedCourse.program && !updatedCourse.program.isActive) {
            await Program.findByIdAndUpdate(
                updatedCourse.program._id,
                { isActive: true }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Đã activate khóa học thành công',
            course: {
                _id: updatedCourse._id,
                courseCode: updatedCourse.courseCode,
                name: updatedCourse.name,
                status: updatedCourse.status,
                isActive: updatedCourse.isActive,
                program: updatedCourse.program
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi activate khóa học',
            error: err.message
        });
    }
};
