const Course = require('../models/courseModel');
const Program = require('../models/programModel');
require('../models/camSession');

// Lấy thông tin các khóa học theo type
// Nếu type là "CAM" thì populate camSessions, còn lại populate sessions
exports.getCoursesByType = async (req, res) => {
    try {
        const { type } = req.query;

        if (!type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp type (ielts, toeic, cam)' 
            });
        }

        const normalizedType = type.trim().toLowerCase();
        const isCamCourse = normalizedType === 'cam';

        // Tìm các program có type tương ứng (không phân biệt hoa thường)
        const programs = await Program.find({ 
            type: { $regex: new RegExp(`^${normalizedType}$`, 'i') }
        }).select('_id');
        const programIds = programs.map(p => p._id);

        if (programIds.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                message: `Không tìm thấy chương trình nào có type: ${type}`
            });
        }

        // Tìm các course có program thuộc type này và đã được phê duyệt
        let query = Course.find({ 
            program: { $in: programIds },
            status: 'approved'
        })
        .populate('program', 'program_name code type level')
        .populate('createdBy', 'name fullname email')
        .populate('clos', 'code name')
        .select('name description program createdBy status materials numberOfSessions sessions camSessions createdAt updatedAt');

        // Nếu type là CAM thì populate camSessions, còn lại populate sessions
        if (isCamCourse) {
            query = query.populate({
                path: 'camSessions',
                options: { sort: { Order: 1 } } // Sắp xếp theo Order
            });
        } else {
            query = query.populate({
                path: 'sessions',
                options: { sort: { order: 1 } } // Sắp xếp theo order
            });
        }

        const courses = await query.sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: courses.length,
            type: normalizedType,
            data: courses
        });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ', 
            error: err.message 
        });
    }
};

// Lấy chi tiết khóa học cho trang home (bao gồm camSessions)
exports.getCourseDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp course id'
            });
        }

        const course = await Course.findById(id)
            .populate('program', 'program_name code type level')
            .populate('createdBy', 'name fullname email')
            .populate({
                path: 'sessions',
                options: { sort: { order: 1 } }
            })
            .populate({
                path: 'camSessions',
                options: { sort: { Order: 1 } }
            })
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
                message: 'Không tìm thấy khóa học'
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

// Lấy chi tiết một Cam Session cụ thể thuộc course
exports.getCamSessionDetails = async (req, res) => {
    try {
        const { courseId, sessionId } = req.params;

        if (!courseId || !sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp courseId và sessionId'
            });
        }

        const course = await Course.findById(courseId)
            .populate('program', 'program_name code type level')
            .populate({
                path: 'camSessions',
                options: { sort: { Order: 1 } }
            });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khóa học'
            });
        }

        const targetSession = course.camSessions?.find(
            (session) => session?._id?.toString() === sessionId
        );

        if (!targetSession) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy Cam Session'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                course: {
                    _id: course._id,
                    name: course.name,
                    description: course.description,
                    program: course.program,
                },
                camSession: targetSession
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

