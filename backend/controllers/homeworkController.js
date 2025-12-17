const ClassSchedule = require('../models/classScheduleModel');
const HomeworkSubmission = require('../models/homeworkSubmissionModel');
const Class = require('../models/classModel');
const mongoose = require('mongoose');

/**
 * Thêm homework vào ClassSchedule
 * POST /api/homework/classSchedule/:scheduleId
 */
exports.addHomeworkToSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { title, description, deadline } = req.body;
    
    // Validate required fields
    if (!title || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: title và deadline là bắt buộc'
      });
    }

    // Get uploaded files (optional)
    const assignmentFiles = req.files && req.files.assignmentFile ? req.files.assignmentFile : [];
    const answerFiles = req.files && req.files.answerFile ? req.files.answerFile : [];

    // Find the ClassSchedule
    const schedule = await ClassSchedule.findById(scheduleId).populate('class');
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    // Create homework object
    const newHomework = {
      _id: new mongoose.Types.ObjectId(),
      assignment: {
        title: title,
        description: description || '',
        files: assignmentFiles.map(f => `/uploads/homeworks/${f.filename}`)
      },
      deadline: new Date(deadline),
      answerFiles: answerFiles.map(f => `/uploads/homeworks/${f.filename}`)
    };

    // Add homework to schedule
    if (!schedule.homework) {
      schedule.homework = [];
    }
    schedule.homework.push(newHomework);
    await schedule.save();

    // Create HomeworkSubmission records for all students in the class
    const classInfo = await Class.findById(schedule.class._id).populate('students');
    
    if (classInfo && classInfo.students && classInfo.students.length > 0) {
    const submissions = classInfo.students.map(student => ({
      classSchedule: schedule._id,
      homeworkId: newHomework._id,
      student: student._id,
      assignmentTitle: title,
      assignmentFiles: assignmentFiles.map(f => `/uploads/homeworks/${f.filename}`),
      deadline: new Date(deadline),
      status: 'not_submitted'
    }));      await HomeworkSubmission.insertMany(submissions);
    }

    res.status(201).json({
      success: true,
      message: 'Thêm bài tập thành công',
      homework: newHomework
    });

  } catch (error) {
    console.error(' Lỗi khi thêm homework:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm bài tập',
      error: error.message
    });
  }
};

/**
 * Cập nhật homework trong ClassSchedule
 * PUT /api/homework/classSchedule/:scheduleId/homework/:homeworkId
 */
exports.updateHomework = async (req, res) => {
  try {
    const { scheduleId, homeworkId } = req.params;
    const { title, description, deadline } = req.body;

    const schedule = await ClassSchedule.findById(scheduleId);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    const homework = schedule.homework.id(homeworkId);
    
    if (!homework) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập'
      });
    }

    // Update fields
    if (title) homework.assignment.title = title;
    if (description !== undefined) homework.assignment.description = description;
    if (deadline) homework.deadline = new Date(deadline);

    // Handle file deletion
    if (req.body.deleteAssignmentFile) {
      const fileToDelete = req.body.deleteAssignmentFile;
      homework.assignment.files = homework.assignment.files.filter(f => f !== fileToDelete);
    }
    if (req.body.deleteAnswerFile) {
      const fileToDelete = req.body.deleteAnswerFile;
      homework.answerFiles = homework.answerFiles.filter(f => f !== fileToDelete);
    }

    // Add new files if uploaded
    if (req.files) {
      if (req.files.assignmentFile) {
        const newFiles = req.files.assignmentFile.map(f => `/uploads/homeworks/${f.filename}`);
        homework.assignment.files = [...(homework.assignment.files || []), ...newFiles];
      }
      if (req.files.answerFile) {
        const newFiles = req.files.answerFile.map(f => `/uploads/homeworks/${f.filename}`);
        homework.answerFiles = [...(homework.answerFiles || []), ...newFiles];
      }
    }

    await schedule.save();

    // Update HomeworkSubmission records
    if (title || deadline) {
      const updateFields = {};
      if (title) updateFields.assignmentTitle = title;
      if (deadline) updateFields.deadline = new Date(deadline);

      await HomeworkSubmission.updateMany(
        {
          classSchedule: scheduleId,
          homeworkId: homeworkId
        },
        { $set: updateFields }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật bài tập thành công',
      homework: homework
    });

  } catch (error) {
    console.error(' Lỗi khi cập nhật homework:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật bài tập',
      error: error.message
    });
  }
};

/**
 * Xóa homework khỏi ClassSchedule
 * DELETE /api/homework/classSchedule/:scheduleId/homework/:homeworkId
 */
exports.deleteHomework = async (req, res) => {
  try {
    const { scheduleId, homeworkId } = req.params;

    const schedule = await ClassSchedule.findById(scheduleId);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    const homework = schedule.homework.id(homeworkId);
    
    if (!homework) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập'
      });
    }

    // Remove homework from schedule using pull instead of remove()
    schedule.homework.pull(homeworkId);
    await schedule.save();

    // Delete all related HomeworkSubmission records (if any exist)
    try {
      const deleteResult = await HomeworkSubmission.deleteMany({
        classSchedule: scheduleId,
        homeworkId: homeworkId
      });
      console.log(` Đã xóa ${deleteResult.deletedCount} bài nộp liên quan`);
    } catch (submissionError) {
      // Log error but don't fail the homework deletion
      console.log(' Lỗi khi xóa submissions (không ảnh hưởng):', submissionError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Xóa bài tập thành công'
    });

  } catch (error) {
    console.error(' Lỗi khi xóa homework:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa bài tập',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách submissions của một homework
 * GET /api/homework/:homeworkId/submissions
 */
exports.getHomeworkSubmissions = async (req, res) => {
  try {
    const { homeworkId } = req.params;
    const { scheduleId } = req.query;

    const submissions = await HomeworkSubmission.find({
      classSchedule: scheduleId,
      homeworkId: homeworkId
    })
      .populate('student', 'username email')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      total: submissions.length,
      submissions: submissions
    });

  } catch (error) {
    console.error(' Lỗi khi lấy danh sách submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách bài nộp',
      error: error.message
    });
  }
};

/**
 * Lấy tất cả homework assignments của giáo viên
 * GET /api/homework/teacher/assignments
 */
exports.getTeacherAssignments = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Find all classes taught by this teacher
    const classes = await Class.find({ teacher: teacherId })
      .populate('course', 'name courseCode')
      .lean();

    if (!classes || classes.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        assignments: []
      });
    }

    const classIds = classes.map(c => c._id);

    // Find all schedules for these classes that have homework
    const schedules = await ClassSchedule.find({
      class: { $in: classIds },
      'homework.0': { $exists: true }
    })
      .populate('class', 'name')
      .populate('session', 'title order')
      .populate({
        path: 'class',
        populate: {
          path: 'course',
          select: 'name courseCode'
        }
      })
      .lean();

    // Flatten homework from all schedules
    const assignments = [];
    
    for (const schedule of schedules) {
      if (schedule.homework && schedule.homework.length > 0) {
        for (const hw of schedule.homework) {
          // Count submissions
          const submissionCounts = await HomeworkSubmission.aggregate([
            {
              $match: {
                classSchedule: schedule._id,
                homeworkId: hw._id
              }
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ]);

          const totalStudents = await HomeworkSubmission.countDocuments({
            classSchedule: schedule._id,
            homeworkId: hw._id
          });

          const submitted = submissionCounts.find(s => s._id === 'submitted')?.count || 0;

          assignments.push({
            _id: hw._id,
            scheduleId: schedule._id,
            title: hw.assignment.title,
            description: hw.assignment.description || '',
            assignmentFiles: hw.assignment.files || [],
            answerFiles: hw.answerFiles || [],
            deadline: hw.deadline,
            className: schedule.class?.name,
            courseName: schedule.class?.course?.name,
            courseCode: schedule.class?.course?.courseCode,
            lessonNumber: schedule.session?.order,
            lessonTitle: schedule.session?.title,
            totalStudents,
            submitted,
            pending: totalStudents - submitted,
            createdAt: schedule.createdAt
          });
        }
      }
    }

    // Sort by deadline (newest first)
    assignments.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));

    res.status(200).json({
      success: true,
      total: assignments.length,
      assignments
    });

  } catch (error) {
    console.error(' Lỗi khi lấy danh sách assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách bài tập',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách schedules của một class (để giao bài tập)
 * GET /api/homework/class/:classId/schedules
 */
exports.getClassSchedules = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user._id;

    // Verify teacher owns this class
    const classInfo = await Class.findOne({ 
      _id: classId, 
      teacher: teacherId 
    });

    if (!classInfo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học hoặc bạn không có quyền truy cập'
      });
    }

    // Get all schedules for this class
    const schedules = await ClassSchedule.find({ 
      class: classId 
    })
      .populate('session', 'title order')
      .select('_id date startTime endTime order session status')
      .sort({ date: 1, startTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      total: schedules.length,
      schedules: schedules
    });

  } catch (error) {
    console.error(' Lỗi khi lấy danh sách schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách buổi học',
      error: error.message
    });
  }
};

module.exports = exports;
