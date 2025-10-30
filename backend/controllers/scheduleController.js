const ClassSchedule = require('../models/classScheduleModel');

//lấy danh sách lịch học chờ phê duyệt
exports.getPendingSchedules = async (req, res) => {
    try {
        const pendingSchedules = await ClassSchedule.find({ status: 'pending_approval' })
            .populate('class', 'name') 
            .populate('createdBy', 'name')
            .populate('room', 'name') 
            .sort({ createdAt: 1 }); 

        res.status(200).json({
            success: true,
            count: pendingSchedules.length,
            data: pendingSchedules
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
};

//duyệt lịch học
exports.approveSchedule = async (req, res) => {
    try {
        const schedule = await ClassSchedule.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'approved',
                rejectionReason: null
            },
            { new: true }
        );

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy lịch học' });
        }

        // Logic phụ (nếu có): Cập nhật lịch tổng, gửi email cho Giáo vụ, Giáo viên, Lớp học...

        res.status(200).json({
            success: true,
            message: 'Đã phê duyệt lịch học.',
            data: schedule
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
};

exports.rejectSchedule = async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp lý do từ chối.' });
    }

    try {
        const schedule = await ClassSchedule.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'rejected',
                rejectionReason: reason
            },
            { new: true }
        );

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy lịch học' });
        }

        // Logic phụ (nếu có): Gửi email thông báo cho Giáo vụ...

        res.status(200).json({
            success: true,
            message: 'Đã từ chối lịch học.',
            data: schedule
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
};

