
const Course = require('../models/courseModel');
const LevelBandMapping = require('../models/levelBandMappingModel');

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

// Lấy band từ type và level
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

        console.log('🔍 Searching for mapping with type:', type, 'level:', level);
        const mapping = await LevelBandMapping.findOne({ type, level });
        
        if (!mapping) {
            console.warn('⚠️ No mapping found for type:', type, 'level:', level);
            return res.status(200).json({
                success: true,
                band: null,
                message: 'Không tìm thấy band mapping cho type và level này'
            });
        }

        console.log('✅ Found mapping:', mapping);
        res.status(200).json({
            success: true,
            band: mapping.band
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

// Lấy tất cả level-band mappings
exports.getAllMappings = async (req, res) => {
    try {
        const mappings = await LevelBandMapping.find().sort({ type: 1, level: 1 });
        
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

// Lấy các levels theo type
exports.getLevelsByType = async (req, res) => {
    try {
        const { type } = req.query;
        
        if (!type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp type' 
            });
        }

        const mappings = await LevelBandMapping.find({ type }).sort({ level: 1 });
        const levels = [...new Set(mappings.map(m => m.level))];
        
        res.status(200).json({
            success: true,
            levels: levels
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

// Lấy các types theo level
exports.getTypesByLevel = async (req, res) => {
    try {
        const { level } = req.query;
        
        if (!level) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp level' 
            });
        }

        const mappings = await LevelBandMapping.find({ level }).sort({ type: 1 });
        const types = [...new Set(mappings.map(m => m.type))];
        
        res.status(200).json({
            success: true,
            types: types
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

