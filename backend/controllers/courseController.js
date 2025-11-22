
const Course = require('../models/courseModel');

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

