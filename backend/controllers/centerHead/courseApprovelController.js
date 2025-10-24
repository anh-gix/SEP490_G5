const Course = require('../models/Course');

// lấy thông tin cơ bản của tất cả các khóa học đang chờ phê duyệt
exports.getPendingCourses = async (req, res) => {
    try {
        const pendingCourses = await Course.find({ status: 'pending_approval' })
            .populate('createdBy', 'name email') 
            .select('name createdBy submittedAt status');

        res.status(200).json({ success: true, data: pendingCourses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};

// thông tin chi tiết của một khóa học cụ thể
exports.getCourseDetails = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('program', 'program_name')
            .populate('clos') 
            .populate('createdBy', 'name') 
            .populate('sessions');


        if (!course) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy giáo trình' });
        }

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};


exports.approveCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' }, // Cập nhật trạng thái
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy giáo trình' });
        }
        
        // TODO: Có thể thêm logic tại đây, ví dụ: gửi email thông báo
        
        res.status(200).json({ success: true, message: 'Đã phê duyệt giáo trình thành công', data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};


exports.requestRevision = async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp lý do cần chỉnh sửa' });
    }

    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'needs_revision', 
                revisionReason: reason 
            },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy giáo trình' });
        }

        // TODO: Gửi email cho Subject Leader kèm lý do
        
        res.status(200).json({ success: true, message: 'Đã gửi yêu cầu chỉnh sửa', data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};

