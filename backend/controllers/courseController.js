
const Course = require('../models/courseModel');
const Program = require('../models/programModel');

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

        // Logic phụ (nếu có): Gửi email thông báo + lý do cho Subject Leader...

        res.status(200).json({
            success: true,
            message: 'Đã gửi yêu cầu chỉnh sửa thành công.',
            data: course
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
};

// Lấy danh sách courses theo program name và level
// Note: programName có thể là 'IELTS', 'TOEIC', 'Tiếng Anh Giao tiếp' (từ frontend)
// Nhưng trong DB, program_name là 'IELTS Foundation A1', 'IELTS Elementary A2', etc.
// Vì vậy, ta cần convert programName thành type và query theo type + level
exports.getCoursesByProgram = async (req, res) => {
    try {
        const { programName, level } = req.query;

        console.log('🔍 [getCoursesByProgram] Request params:', { programName, level });

        if (!programName || !level) {
            console.warn('⚠️ [getCoursesByProgram] Missing params:', { programName, level });
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp programName và level' 
            });
        }

        // Convert programName to type
        // Frontend gửi: 'IELTS', 'TOEIC', 'Tiếng Anh Giao tiếp'
        // Cần convert thành: 'ielts', 'toeic', 'cam'
        const programNameToType = {
            'IELTS': 'ielts',
            'TOEIC': 'toeic',
            'Tiếng Anh Giao tiếp': 'cam'
        };
        
        const type = programNameToType[programName];
        
        if (!type) {
            console.warn('⚠️ [getCoursesByProgram] Invalid programName:', programName);
            return res.status(400).json({ 
                success: false, 
                message: 'Program name không hợp lệ. Phải là: IELTS, TOEIC, hoặc Tiếng Anh Giao tiếp' 
            });
        }

        console.log('🔄 [getCoursesByProgram] Converted programName to type:', { programName, type, level });

        // Debug: Check all programs with this type (regardless of level)
        const allProgramsWithType = await Program.find({ type: type }).select('_id program_name level type');
        console.log('🔍 [getCoursesByProgram] All programs with type "' + type + '":', {
            count: allProgramsWithType.length,
            programs: allProgramsWithType.map(p => ({ id: p._id, name: p.program_name, level: p.level, type: p.type }))
        });

        // Tìm program theo type và level (đúng cách)
        const programs = await Program.find({ 
            type: type,
            level: level 
        }).select('_id program_name level');

        console.log('📋 [getCoursesByProgram] Found programs matching type and level:', {
            count: programs.length,
            programs: programs.map(p => ({ id: p._id, name: p.program_name, level: p.level }))
        });

        if (!programs || programs.length === 0) {
            console.warn('⚠️ [getCoursesByProgram] No programs found for:', { type, level });
            return res.status(200).json({
                success: true,
                courses: []
            });
        }

        const programIds = programs.map(p => p._id);

        // Debug: Check all courses with these programs (regardless of status)
        const allCoursesWithPrograms = await Course.find({
            program: { $in: programIds }
        }).populate('program', 'program_name level band type').select('name program status numberOfSessions');
        console.log('🔍 [getCoursesByProgram] All courses with these programs (any status):', {
            count: allCoursesWithPrograms.length,
            courses: allCoursesWithPrograms.map(c => ({
                id: c._id,
                name: c.name,
                status: c.status,
                program: c.program?.program_name,
                level: c.program?.level
            }))
        });

        // Tìm courses có program trong danh sách programIds và status là approved
        const courses = await Course.find({
            program: { $in: programIds },
            status: 'approved'
        })
        .populate('program', 'program_name level band type')
        .select('name program numberOfSessions')
        .sort({ name: 1 });

        console.log('✅ [getCoursesByProgram] Found courses:', {
            count: courses.length,
            courses: courses.map(c => ({
                id: c._id,
                name: c.name,
                program: c.program?.program_name,
                level: c.program?.level
            }))
        });

        res.status(200).json({
            success: true,
            courses: courses
        });

    } catch (err) {
        console.error('Error in getCoursesByProgram:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ', 
            error: err.message 
        });
    }
};

// Lấy danh sách tất cả types (ielts, toeic, cam)
exports.getAllTypes = async (req, res) => {
    try {
        const types = await Program.distinct('type');
        
        // Filter và sort types
        const validTypes = types.filter(t => ['ielts', 'toeic', 'cam'].includes(t));
        
        res.status(200).json({
            success: true,
            types: validTypes
        });
    } catch (err) {
        console.error('Error in getAllTypes:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ', 
            error: err.message 
        });
    }
};

// Lấy danh sách tất cả levels
exports.getAllLevels = async (req, res) => {
    try {
        const levels = await Program.distinct('level');
        
        // Sort levels theo thứ tự: Pre-A1, A1, A2, B1, B2, C1, C2
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
        console.error('Error in getAllLevels:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ', 
            error: err.message 
        });
    }
};

// Lấy danh sách levels theo type
exports.getLevelsByType = async (req, res) => {
    try {
        const { type } = req.query;

        if (!type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp type' 
            });
        }

        // Validate type
        const validTypes = ['ielts', 'toeic', 'cam'];
        if (!validTypes.includes(type.toLowerCase())) {
            return res.status(400).json({ 
                success: false, 
                message: 'Type không hợp lệ. Phải là: ielts, toeic, hoặc cam' 
            });
        }

        const levels = await Program.distinct('level', { type: type.toLowerCase() });
        
        // Sort levels theo thứ tự: Pre-A1, A1, A2, B1, B2, C1, C2
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
        console.error('Error in getLevelsByType:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ', 
            error: err.message 
        });
    }
};

// Lấy band từ type và level
exports.getBandByTypeAndLevel = async (req, res) => {
    try {
        const { type, level } = req.query;

        if (!type || !level) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp type và level' 
            });
        }

        // Validate type
        const validTypes = ['ielts', 'toeic', 'cam'];
        if (!validTypes.includes(type.toLowerCase())) {
            return res.status(400).json({ 
                success: false, 
                message: 'Type không hợp lệ. Phải là: ielts, toeic, hoặc cam' 
            });
        }

        // Tìm program theo type và level
        const program = await Program.findOne({ 
            type: type.toLowerCase(),
            level: level 
        }).select('band');

        if (!program) {
            return res.status(200).json({
                success: true,
                band: null
            });
        }

        res.status(200).json({
            success: true,
            band: program.band || null
        });

    } catch (err) {
        console.error('Error in getBandByTypeAndLevel:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ', 
            error: err.message 
        });
    }
};

