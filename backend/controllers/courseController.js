
const Course = require('../models/courseModel');

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

// Lấy band từ type và level (từ course table)
exports.getBandByTypeAndLevel = async (req, res) => {
    try {
        const { type, level } = req.query;
        
        console.log('🔍 getBandByTypeAndLevel called with:', { type, level });
        
        if (!type || !level) {
            console.warn('⚠️ Missing type or level');
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp type và level' 
            });
        }

        console.log('🔍 Searching for course with type:', type, 'level:', level);
        const course = await Course.findOne({ type, level }).select('band');
        
        if (!course || !course.band) {
            console.warn('⚠️ No course found with type:', type, 'level:', level);
            return res.status(200).json({
                success: true,
                band: null,
                message: 'Không tìm thấy band cho type và level này'
            });
        }

        console.log('✅ Found band:', course.band);
        res.status(200).json({
            success: true,
            band: course.band
        });
    } catch (err) {
        console.error('❌ Error in getBandByTypeAndLevel:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ', 
            error: err.message 
        });
    }
};

// Lấy tất cả level-band mappings (từ course table)
exports.getAllMappings = async (req, res) => {
    try {
        const courses = await Course.find({})
            .select('type level band')
            .sort({ type: 1, level: 1 });
        
        // Format như LevelBandMapping để tương thích với frontend
        const mappings = courses.map(course => ({
            type: course.type,
            level: course.level,
            band: course.band
        }));
        
        res.status(200).json({
            success: true,
            mappings: mappings
        });
    } catch (err) {
        console.error('❌ Error in getAllMappings:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ', 
            error: err.message 
        });
    }
};

// Lấy các levels theo type (từ course table)
exports.getLevelsByType = async (req, res) => {
    try {
        const { type } = req.query;
        
        if (!type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp type' 
            });
        }

        const levels = await Course.distinct('level', { type });
        const sortedLevels = levels.sort();
        
        res.status(200).json({
            success: true,
            levels: sortedLevels
        });
    } catch (err) {
        console.error('❌ Error in getLevelsByType:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ', 
            error: err.message 
        });
    }
};

// Lấy các types theo level (từ course table)
exports.getTypesByLevel = async (req, res) => {
    try {
        const { level } = req.query;
        
        if (!level) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp level' 
            });
        }

        const types = await Course.distinct('type', { level });
        const sortedTypes = types.sort();
        
        res.status(200).json({
            success: true,
            types: sortedTypes
        });
    } catch (err) {
        console.error('❌ Error in getTypesByLevel:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ', 
            error: err.message 
        });
    }
};

// Lấy tất cả types từ course table
exports.getAllCourseTypes = async (req, res) => {
    try {
        const types = await Course.distinct('type');
        const sortedTypes = types.sort();
        
        res.status(200).json({
            success: true,
            types: sortedTypes
        });
    } catch (err) {
        console.error('❌ Error in getAllCourseTypes:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ', 
            error: err.message 
        });
    }
};

// Lấy tất cả levels từ course table
exports.getAllCourseLevels = async (req, res) => {
    try {
        const levels = await Course.distinct('level');
        const sortedLevels = levels.sort();
        
        res.status(200).json({
            success: true,
            levels: sortedLevels
        });
    } catch (err) {
        console.error('❌ Error in getAllCourseLevels:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ', 
            error: err.message 
        });
    }
};

