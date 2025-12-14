const Course = require("../models/courseModel");
const CamSession = require("../models/camSession");
const StudentOnlineLearning = require("../models/studentOnlineLearning");

// =========================
//  LẤY DANH SÁCH KHÓA HỌC ONLINE CỦA HỌC VIÊN
// =========================
exports.getMyOnlineCourses = async (req, res) => {
  try {
    const studentId = req.user._id;

    console.log(' [OnlineLearning] Lấy danh sách khóa học online cho student:', studentId);

    // Find all online courses where student is enrolled
    const courses = await Course.find({
      learningType: 'online',
      studentEnrollments: studentId,
      status: 'approved'
    })
      .populate('program', 'program_name type level')
      .populate('camSessions')
      .sort({ createdAt: -1 })
      .lean();

    console.log(` [OnlineLearning] Tìm thấy ${courses.length} khóa học online`);

    // Get progress for each course
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await StudentOnlineLearning.findOne({
          courseId: course._id,
          studentId: studentId
        }).lean();

        // Calculate completion percentage
        let completionPercentage = 0;
        let completedSessions = 0;
        let totalSessions = course.camSessions?.length || 0;

        if (progress && progress.sessionProgress) {
          completedSessions = progress.sessionProgress.filter(
            session => session.isCompleted.video && 
                      session.isCompleted.quiz && 
                      session.isCompleted.vocabulary
          ).length;
          
          if (totalSessions > 0) {
            completionPercentage = Math.round((completedSessions / totalSessions) * 100);
          }
        }

        return {
          _id: course._id,
          courseCode: course.courseCode,
          name: course.name,
          description: course.description,
          numberOfSessions: course.numberOfSessions,
          program: course.program,
          materials: course.materials,
          preRequisite: course.preRequisite,
          createdAt: course.createdAt,
          progress: {
            completionPercentage,
            completedSessions,
            totalSessions,
            hasProgress: !!progress
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách khóa học online thành công',
      total: coursesWithProgress.length,
      courses: coursesWithProgress
    });
  } catch (error) {
    console.error(' [OnlineLearning] Lỗi khi lấy danh sách khóa học online:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách khóa học online',
      error: error.message
    });
  }
};

// =========================
//  LẤY CHI TIẾT KHÓA HỌC ONLINE
// =========================
exports.getCourseDetail = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.params;

    console.log(' [OnlineLearning] Lấy chi tiết khóa học:', courseId);

    // Find course
    const course = await Course.findById(courseId)
      .populate('program', 'program_name type level')
      .populate('camSessions')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    // Check if student is enrolled
    const isEnrolled = course.studentEnrollments.some(
      id => id.toString() === studentId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chưa đăng ký khóa học này'
      });
    }

    // Get student's progress
    const progress = await StudentOnlineLearning.findOne({
      courseId: course._id,
      studentId: studentId
    }).lean();

    // Map sessions with progress
    const sessionsWithProgress = course.camSessions.map(session => {
      const sessionProgress = progress?.sessionProgress.find(
        p => p.sessionId.toString() === session._id.toString()
      );

      return {
        _id: session._id,
        title: session.title,
        sessionType: session.sessionType,
        description: session.description,
        order: session.order,
        hasVideo: !!session.videoURL,
        hasQuiz: session.quizzes?.quiz?.length > 0,
        hasVocabulary: session.vocabulary?.words?.length > 0,
        progress: sessionProgress?.isCompleted || {
          video: false,
          quiz: false,
          vocabulary: false
        },
        isCompleted: sessionProgress ? 
          (sessionProgress.isCompleted.video && 
           sessionProgress.isCompleted.quiz && 
           sessionProgress.isCompleted.vocabulary) : false
      };
    });

    // Sort by order
    sessionsWithProgress.sort((a, b) => a.order - b.order);

    // Calculate overall progress
    const totalSessions = sessionsWithProgress.length;
    const completedSessions = sessionsWithProgress.filter(s => s.isCompleted).length;
    const completionPercentage = totalSessions > 0 
      ? Math.round((completedSessions / totalSessions) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết khóa học thành công',
      course: {
        _id: course._id,
        courseCode: course.courseCode,
        name: course.name,
        description: course.description,
        numberOfSessions: course.numberOfSessions,
        program: course.program,
        materials: course.materials,
        preRequisite: course.preRequisite,
        createdAt: course.createdAt,
        sessions: sessionsWithProgress,
        progress: {
          completionPercentage,
          completedSessions,
          totalSessions
        }
      }
    });
  } catch (error) {
    console.error(' [OnlineLearning] Lỗi khi lấy chi tiết khóa học:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết khóa học',
      error: error.message
    });
  }
};

// =========================
//  LẤY NỘI DUNG BÀI HỌC
// =========================
exports.getSessionContent = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId, sessionId } = req.params;

    console.log(' [OnlineLearning] Lấy nội dung bài học:', sessionId);

    // Check if student is enrolled in course
    const course = await Course.findById(courseId).lean();
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    const isEnrolled = course.studentEnrollments.some(
      id => id.toString() === studentId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chưa đăng ký khóa học này'
      });
    }

    // Get session content
    const session = await CamSession.findById(sessionId).lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài học'
      });
    }

    // Get student's progress for this session
    const progress = await StudentOnlineLearning.findOne({
      courseId: courseId,
      studentId: studentId
    }).lean();

    const sessionProgress = progress?.sessionProgress.find(
      p => p.sessionId.toString() === sessionId.toString()
    );

    res.status(200).json({
      success: true,
      message: 'Lấy nội dung bài học thành công',
      session: {
        _id: session._id,
        title: session.title,
        sessionType: session.sessionType,
        description: session.description,
        order: session.order,
        videoURL: session.videoURL,
        quizzes: session.quizzes,
        vocabulary: session.vocabulary,
        progress: sessionProgress?.isCompleted || {
          video: false,
          quiz: false,
          vocabulary: false
        }
      }
    });
  } catch (error) {
    console.error(' [OnlineLearning] Lỗi khi lấy nội dung bài học:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy nội dung bài học',
      error: error.message
    });
  }
};

// =========================
//  CẬP NHẬT TIẾN ĐỘ HỌC TẬP
// =========================
exports.updateProgress = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId, sessionId } = req.params;
    const { video, quiz, vocabulary } = req.body;

    console.log(' [OnlineLearning] Cập nhật tiến độ:', {
      courseId,
      sessionId,
      video,
      quiz,
      vocabulary
    });

    // Validate input
    if (video === undefined && quiz === undefined && vocabulary === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Cần ít nhất một trường để cập nhật (video, quiz, vocabulary)'
      });
    }

    // Find or create progress record
    let progress = await StudentOnlineLearning.findOne({
      courseId: courseId,
      studentId: studentId
    });

    if (!progress) {
      // If no progress record exists, create one
      // This should not happen if enrollment creates it automatically
      const course = await Course.findById(courseId).populate('camSessions');
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khóa học'
        });
      }

      // Create initial progress
      progress = new StudentOnlineLearning({
        courseId: courseId,
        studentId: studentId,
        sessionProgress: course.camSessions.map(session => ({
          sessionId: session._id,
          isCompleted: {
            video: false,
            quiz: false,
            vocabulary: false
          }
        }))
      });
    }

    // Find session in progress
    const sessionIndex = progress.sessionProgress.findIndex(
      p => p.sessionId.toString() === sessionId.toString()
    );

    if (sessionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài học trong khóa học'
      });
    }

    // Update progress
    const updateFields = {};
    if (video !== undefined) {
      updateFields['sessionProgress.' + sessionIndex + '.isCompleted.video'] = video;
    }
    if (quiz !== undefined) {
      updateFields['sessionProgress.' + sessionIndex + '.isCompleted.quiz'] = quiz;
    }
    if (vocabulary !== undefined) {
      updateFields['sessionProgress.' + sessionIndex + '.isCompleted.vocabulary'] = vocabulary;
    }

    await StudentOnlineLearning.updateOne(
      { _id: progress._id },
      { $set: updateFields }
    );

    // Get updated progress
    const updatedProgress = await StudentOnlineLearning.findById(progress._id).lean();
    const updatedSession = updatedProgress.sessionProgress[sessionIndex];

    console.log(' [OnlineLearning] Đã cập nhật tiến độ thành công');

    res.status(200).json({
      success: true,
      message: 'Cập nhật tiến độ thành công',
      progress: updatedSession.isCompleted
    });
  } catch (error) {
    console.error(' [OnlineLearning] Lỗi khi cập nhật tiến độ:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật tiến độ',
      error: error.message
    });
  }
};

// =========================
//  LẤY TỔNG QUAN TIẾN ĐỘ KHÓA HỌC
// =========================
exports.getCourseProgress = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.params;

    console.log(' [OnlineLearning] Lấy tổng quan tiến độ khóa học:', courseId);

    // Get course
    const course = await Course.findById(courseId)
      .populate('camSessions')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    // Get progress
    const progress = await StudentOnlineLearning.findOne({
      courseId: courseId,
      studentId: studentId
    }).lean();

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Chưa có tiến độ học tập'
      });
    }

    // Calculate progress by skill type
    const skillProgress = {
      listening: { completed: 0, total: 0 },
      reading: { completed: 0, total: 0 },
      speaking: { completed: 0, total: 0 },
      writing: { completed: 0, total: 0 }
    };

    progress.sessionProgress.forEach(sessionProg => {
      const session = course.camSessions.find(
        s => s._id.toString() === sessionProg.sessionId.toString()
      );

      if (session && session.sessionType) {
        const skill = session.sessionType;
        skillProgress[skill].total++;

        if (sessionProg.isCompleted.video && 
            sessionProg.isCompleted.quiz && 
            sessionProg.isCompleted.vocabulary) {
          skillProgress[skill].completed++;
        }
      }
    });

    // Calculate overall progress
    const totalSessions = progress.sessionProgress.length;
    const completedSessions = progress.sessionProgress.filter(
      s => s.isCompleted.video && s.isCompleted.quiz && s.isCompleted.vocabulary
    ).length;
    const completionPercentage = totalSessions > 0 
      ? Math.round((completedSessions / totalSessions) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      message: 'Lấy tổng quan tiến độ thành công',
      progress: {
        overall: {
          completionPercentage,
          completedSessions,
          totalSessions
        },
        bySkill: skillProgress,
        lastUpdated: progress.updatedAt
      }
    });
  } catch (error) {
    console.error(' [OnlineLearning] Lỗi khi lấy tổng quan tiến độ:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tổng quan tiến độ',
      error: error.message
    });
  }
};

module.exports = exports;
