const Exam = require("../models/examModel");
const Submission = require("../models/submissionModel");
const WorkRequest = require("../models/workRequestModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const XLSX = require("xlsx");

// ================== UPLOAD SETUP ==================
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.csv', '.xlsx', '.xls', '.mp3', '.wav','.webm', '.ogg', '.m4a', '.aac'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} not allowed`), false);
  }
};

const upload = multer({ storage, fileFilter });
exports.uploadMiddleware = upload;

// ================== CENTER HEAD - EXAM MANAGEMENT ==================
// ================== 1. LẤY DANH SÁCH BÀI THI CHO QUẢN LÝ ==================
exports.getAllExamsForManagement = async (req, res) => {
  try {

    const exams = await Exam.find()
      .populate('createdBy', 'username email phone address')
      .sort({ createdAt: -1 });

    // Get statistics
    const stats = {
      total: await Exam.countDocuments(),
      published: await Exam.countDocuments({ isPublished: true }),
      draft: await Exam.countDocuments({ isPublished: false })
    };

    res.status(200).json({
      success: true,
      data: exams,
      stats,
      count: exams.length
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bài thi',
      error: err.message
    });
  }
};

// ================== 2. PUBLISH EXAM ==================
exports.publishExamForManagement = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài thi'
      });
    }

    if (exam.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Bài thi đã được xuất bản'
      });
    }

    exam.isPublished = true;
    exam.publishedAt = new Date();
    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Xuất bản bài thi thành công',
      data: exam
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xuất bản bài thi',
      error: err.message
    });
  }
};

// ================== 3. UNPUBLISH EXAM ==================
exports.unpublishExamForManagement = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài thi'
      });
    }

    if (!exam.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Bài thi chưa được xuất bản'
      });
    }

    exam.isPublished = false;
    exam.unpublishedAt = new Date();
    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Hủy xuất bản bài thi thành công',
      data: exam
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy xuất bản bài thi',
      error: err.message
    });
  }
};

// ================== 4. LẤY CHI TIẾT BÀI THI CHO QUẢN LÝ ==================
exports.getExamByIdForManagement = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id).populate('createdBy', 'username email phone address');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài thi'
      });
    }

    // Get submission count
    const submissionCount = await Submission.countDocuments({ examId: id });

    // Get work request info if exists
    const workRequest = await WorkRequest.findOne({
      entityId: id,
      entityType: 'Exam',
      direction: 'bottom_up'
    })
      .populate('requestedBy', 'username email')
      .populate('processedBy', 'username email')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...exam.toObject(),
        submissionCount,
        workRequestInfo: workRequest
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin bài thi',
      error: err.message
    });
  }
};

// ================== 5. TẠO ĐỀ THI MỚI ==================
exports.createExamForManagement = async (req, res) => {
  try {
    const { title, description, examType, level, totalDuration, sections } = req.body;
    const createdBy = req.user?._id || req.body.createdBy;

    // Validation - only require title and level
    if (!title || !level) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và cấp độ là bắt buộc'
      });
    }

    // Sections can be empty initially (will be added in step 2)
    // But if sections are provided, validate them
    if (sections && sections.length > 0) {
      const invalidSections = sections.filter(s => !s.type);
      if (invalidSections.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Tất cả các section phải có loại (type)'
        });
      }
    }

    const exam = new Exam({
      title,
      description,
      createdBy,
      examType: examType || 'practice',
      level,
      totalDuration: totalDuration || 0,
      sections: sections || [],
      isPublished: false
    });

    await exam.save();

    res.status(201).json({
      success: true,
      message: 'Tạo đề thi thành công',
      data: exam
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đề thi',
      error: err.message
    });
  }
};

// ================== 6. CẬP NHẬT ĐỀ THI ==================
exports.updateExamForManagement = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    //exam not found
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài thi'
      });
    }

    // check stautus != draft || needs_revision thì ko cho update
    if (!['draft', 'needs_revision'].includes(exam.status)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể cập nhật bài thi khi trạng thái hiện tại'
      });
    }

    Object.assign(exam, updates);
    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật đề thi thành công',
      data: exam
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật đề thi',
      error: err.message
    });
  }
};

// ================== 7. UPLOAD ĐÁP ÁN TỪ FILE CSV/EXCEL ==================
exports.uploadAnswerKeyForManagement = async (req, res) => {
  try {
    const { examId, sectionId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file được upload'
      });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài thi'
      });
    }

    const section = exam.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy section'
      });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const questions = [];

    try {
      let rows = [];

      // Parse based on file type
      if (fileExt === '.csv') {
        // Parse CSV file
        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', resolve)
            .on('error', reject);
        });
      } else if (['.xlsx', '.xls'].includes(fileExt)) {
        // Parse Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(sheet);
      } else {
        throw new Error('Định dạng file không được hỗ trợ');
      }

      // Process rows
      rows.forEach((row, index) => {
        try {
          const questionNumber = parseInt(row['Question#']) || index + 1;
          const questionTitle = row['QuestionTitle'] || '';
          const questionType = row['QuestionType'] || 'multiple_choice';
          const questionAnswerText = row['QuestionAnswer'] || '';
          const correctAnswerText = row['CorrectAnswer'] || '';
          const maxScore = parseFloat(row['Score']) || 1;
          const tagsText = row['Tags'] || '';

          // Parse questionAnswer
          let questionAnswer = [];
          if (questionType === 'multiple_choice' && questionAnswerText) {
            const answers = questionAnswerText.split('|').map(a => a.trim());
            questionAnswer = answers.map((text, idx) => ({
              key: String.fromCharCode(65 + idx), // A, B, C, D...
              text: text
            }));
          }

          // Parse correctAnswer
          let correctAnswer = [];
          if (questionType === 'true_false') {
            correctAnswer = [correctAnswerText.toUpperCase()];
          } else if (questionType === 'input') {
            correctAnswer = correctAnswerText.split('|').map(a => a.trim());
          } else {
            // multiple_choice
            correctAnswer = correctAnswerText.includes('|')
              ? correctAnswerText.split('|').map(a => a.trim())
              : [correctAnswerText.trim()];
          }

          // Parse tags
          const tags = tagsText ? tagsText.split('|').map(t => t.trim()) : [];

          questions.push({
            questionNumber,
            questionTitle,
            questionType,
            questionAnswer,
            correctAnswer,
            maxScore,
            tags
          });
        } catch (err) {
          console.error('Error parsing row:', err);
        }
      });

      // Add questions to section
      section.answerKey = questions;

      // Calculate total maxScore for section
      section.maxScore = questions.reduce((sum, q) => sum + q.maxScore, 0);
      section.questionCount = questions.length;

      await exam.save();

      res.status(200).json({
        success: true,
        message: `Upload và parse thành công ${questions.length} câu hỏi`,
        count: questions.length,
        data: exam
      });
    } finally {
      // Delete uploaded file after processing
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload file đáp án',
      error: err.message
    });
  }
};

// ================== 8. XÓA ĐỀ THI ==================
exports.deleteExamForManagement = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài thi'
      });
    }

    // Kiểm tra xem có submission nào không
    const submissionCount = await Submission.countDocuments({ examId: id });
    if (submissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa bài thi đã có ${submissionCount} bài làm`
      });
    }

    await Exam.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa bài thi thành công'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa bài thi',
      error: err.message
    });
  }
};

// ================== 9. HELPER - KIỂM TRA TRẠNG THÁI SUBMIT EXAM ==================
exports.getExamSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài thi'
      });
    }

    // Validate exam has required data
    const hasSections = exam.sections && exam.sections.length > 0;
    const canSubmit =
      ['draft', 'needs_revision'].includes(exam.status) &&
      hasSections;

    res.status(200).json({
      success: true,
      data: {
        examStatus: exam.status,
        canSubmit,
        hasSections,
        sectionCount: exam.sections ? exam.sections.length : 0,
        validationMessages: !canSubmit ? [
          !['draft', 'needs_revision'].includes(exam.status) ? `Exam status is ${exam.status}` : null,
          !hasSections ? 'Exam must have at least 1 section' : null
        ].filter(Boolean) : []
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra trạng thái nộp đề thi',
      error: err.message
    });
  }
};

// ================== 10. NỘP EXAM CHỜ DUYỆT (TEACHER/SUBJECT LEADER) ==================
exports.submitExamForApproval = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'This endpoint is deprecated. Please use POST /api/work-requests/submit/exam/:id instead',
    deprecatedSince: '2024-01-01',
    newEndpoint: '/api/work-requests/submit/exam/:id'
  });
};

// ================== 11. LẤY DANH SÁCH EXAM ĐÃ NỘP CỦA TEACHER ==================
exports.getMySubmittedExams = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { status, search } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu đăng nhập'
      });
    }

    // Build query for exams created by user
    const examQuery = { createdBy: userId };

    if (search) {
      examQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status if provided
    if (status) {
      examQuery.status = status;
    }

    // Get exams
    const exams = await Exam.find(examQuery)
      .sort({ updatedAt: -1 });

    // Get work requests for these exams
    const examIds = exams.map(e => e._id);
    const workRequests = await WorkRequest.find({
      entityType: 'Exam',
      entityId: { $in: examIds },
      direction: 'bottom_up'
    })
      .populate('processedBy', 'username email')
      .sort({ requestedAt: -1 });

    // Map work requests to exams
    const examWithWorkRequestInfo = exams.map(exam => {
      const workRequestInfo = workRequests.find(
        req => req.entityId.toString() === exam._id.toString()
      );

      return {
        ...exam.toObject(),
        workRequestInfo: workRequestInfo || null
      };
    });

    // Get statistics
    const stats = {
      total: await Exam.countDocuments({ createdBy: userId }),
      draft: await Exam.countDocuments({ createdBy: userId, status: 'draft' }),
      pending_approval: await Exam.countDocuments({ createdBy: userId, status: 'pending_approval' }),
      approved: await Exam.countDocuments({ createdBy: userId, status: 'approved' }),
      needs_revision: await Exam.countDocuments({ createdBy: userId, status: 'needs_revision' })
    };

    res.status(200).json({
      success: true,
      data: examWithWorkRequestInfo,
      stats,
      count: examWithWorkRequestInfo.length
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đề thi',
      error: err.message
    });
  }
};

// ================== 12. RÚT LẠI EXAM ĐANG CHỜ DUYỆT ==================
exports.withdrawExamSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu đăng nhập'
      });
    }

    // Tìm exam
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài thi'
      });
    }

    // Kiểm tra quyền
    if (exam.createdBy && exam.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền rút lại đề thi này'
      });
    }

    // Kiểm tra status
    if (exam.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể rút lại đề thi đang chờ duyệt'
      });
    }

    // Tìm và xóa pending work request
    const workRequest = await WorkRequest.findOne({
      entityType: 'Exam',
      entityId: id,
      direction: 'bottom_up',
      status: 'pending'
    });

    if (workRequest) {
      await WorkRequest.findByIdAndDelete(workRequest._id);
    }

    // Đổi status về draft
    exam.status = 'draft';
    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Rút lại đề thi thành công',
      data: exam
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi rút lại đề thi',
      error: err.message
    });
  }
};


//student handle
// ================== 1. LẤY DANH SÁCH TẤT CẢ BÀI THI ==================
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find({ isPublished: true });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== 2. LẤY THÔNG TIN BÀI THI THEO ID ==================
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== 3. BẮT ĐẦU LÀM BÀI THI ==================
exports.startExam = async (req, res) => {
  try {
    const { examId } = req.body;
    const studentId = req.user._id; // Lấy từ middleware verifyToken

    if (!examId) {
      return res.status(400).json({ message: "Vui lòng cung cấp examId" });
    }

    // Kiểm tra bài thi có tồn tại không
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    if (!exam.isPublished) {
      return res.status(403).json({ message: "Bài thi chưa được công bố" });
    }

    // Kiểm tra xem học sinh đã có submission chưa
    let submission = await Submission.findOne({
      examId: examId,
      studentId: studentId,
    });

    if (submission) {
      // Nếu đã có submission, trả về submission hiện tại
      return res.json({
        message: "Đã có bài làm, tiếp tục làm bài",
        submission: submission,
      });
    }

    // Tạo submission mới với các sections từ exam
    const sections = exam.sections.map((section) => ({
      sectionType: section.type,
      part: section.part || 1,
      answers: [],
      sectionScore: 0,
    }));

    submission = new Submission({
      examId: examId,
      studentId: studentId,
      status: "in-progress",
      sections: sections,
      totalScore: 0,
      bandScore: 0,
    });

    await submission.save();
    res.status(201).json({
      message: "Bắt đầu làm bài thành công",
      submission: submission,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function để tìm exam section
const findExamSection = (exam, sectionType, part = null) => {
  if (part !== null) {
    return exam.sections.find(
      (section) => section.type === sectionType && (section.part || 1) === part
    );
  } else {
    return exam.sections.find((section) => section.type === sectionType);
  }
};

// Helper function để so sánh hai array không phân biệt thứ tự
const compareArraysUnordered = (arr1, arr2, compareFn) => {
  const sorted1 = [...arr1].map(item => compareFn(String(item)));
  const sorted2 = [...arr2].map(item => compareFn(String(item)));
  sorted1.sort();
  sorted2.sort();
  return sorted1.length === sorted2.length && 
         sorted1.every((val, idx) => val === sorted2[idx]);
};

// Helper function để chấm điểm cho reading/listening
const gradeAnswer = (answer, correctAnswer) => {
  if (!correctAnswer) {
    return { score: 0, isCorrect: false };
  }

  let studentAnswers = answer.selectedOption || answer.answerText || "";
  if (typeof studentAnswers === "string") {
    studentAnswers = [studentAnswers];
  } else if (!Array.isArray(studentAnswers)) {
    studentAnswers = [];
  }

  const correctAnswers = Array.isArray(correctAnswer.correctAnswer) 
    ? correctAnswer.correctAnswer 
    : [correctAnswer.correctAnswer || ""];

  if (studentAnswers.length !== correctAnswers.length) {
    return { score: 0, isCorrect: false };
  }

  let isCorrect = false;
  switch (correctAnswer.questionType) {
    case "multiple_choice":
      isCorrect = compareArraysUnordered(
        correctAnswers,
        studentAnswers,
        (val) => val.trim().toUpperCase()
      );
      break;
    case "input":
      isCorrect = compareArraysUnordered(
        correctAnswers,
        studentAnswers,
        (val) => val.trim().toLowerCase()
      );
      break;
    case "true_false":
      isCorrect = compareArraysUnordered(
        correctAnswers,
        studentAnswers,
        (val) => val.trim().toLowerCase()
      );
      break;
    default:
      isCorrect = compareArraysUnordered(
        correctAnswers,
        studentAnswers,
        (val) => val.trim()
      );
  }

  return {
    score: isCorrect ? (correctAnswer.maxScore || 1) : 0,
    isCorrect: isCorrect
  };
};

// ================== 4. LẤY THÔNG TIN SECTION READING ==================
exports.getReadingSection = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    const studentId = req.user._id;

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm tất cả các section Reading (tất cả các part)
    const readingSections = exam.sections.filter(
      (section) => section.type === "reading"
    ).sort((a, b) => (a.part || 1) - (b.part || 1));

    if (readingSections.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phần Reading",
      });
    }

    // Kiểm tra submission
    const submission = await Submission.findOne({
      _id: submissionId,
      examId: examId,
      studentId: studentId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài làm" });
    }

    // Xử lý từng part
    const partsData = readingSections.map((examSection) => {
      const sectionPart = examSection.part || 1;
      let sectionSubmission = submission.sections.find(
        (s) => s.sectionType === "reading" && (s.part || 1) === sectionPart
      );

      // Nếu chưa có, tạo mới
      if (!sectionSubmission) {
        sectionSubmission = {
          sectionType: "reading",
          part: sectionPart,
          submittedAt: null,
          answers: [],
          sectionScore: 0,
        };
        submission.sections.push(sectionSubmission);
        sectionSubmission = submission.sections[submission.sections.length - 1];
      }

      const questions = examSection.answerKey?.map((key) => ({
        questionNumber: key.questionNumber,
        questionTitle: key.questionTitle,
        questionType: key.questionType,
        questionAnswer: key.questionAnswer || [],
      })) || [];

      return {
        part: sectionPart,
        section: {
          type: examSection.type,
          part: sectionPart,
          fileUrl: examSection.fileUrl,
          instructions: examSection.instructions,
          duration: examSection.duration,
          questionCount: examSection.questionCount,
          maxScore: examSection.maxScore,
          questions: questions,
        },
        submission: {
          submittedAt: sectionSubmission.submittedAt,
          answers: sectionSubmission.answers,
          sectionScore: sectionSubmission.sectionScore,
        },
      };
    });

    // Lưu submission nếu có thay đổi
    await submission.save();

    // Tính tổng
    const totalMaxScore = readingSections.reduce((sum, s) => sum + (s.maxScore || 0), 0);
    const totalQuestionCount = readingSections.reduce((sum, s) => sum + (s.questionCount || 0), 0);
    const totalDuration = readingSections.reduce((sum, s) => sum + (s.duration || 0), 0);

    res.json({
      sectionType: "reading",
      parts: partsData,
      totalMaxScore,
      totalQuestionCount,
      totalDuration,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== LẤY THÔNG TIN SECTION LISTENING ==================
exports.getListeningSection = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    const studentId = req.user._id;

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm tất cả các section Listening (tất cả các part)
    const listeningSections = exam.sections.filter(
      (section) => section.type === "listening"
    ).sort((a, b) => (a.part || 1) - (b.part || 1));

    if (listeningSections.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phần Listening",
      });
    }

    // Kiểm tra submission
    const submission = await Submission.findOne({
      _id: submissionId,
      examId: examId,
      studentId: studentId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài làm" });
    }

    // Xử lý từng part
    const partsData = listeningSections.map((examSection) => {
      const sectionPart = examSection.part || 1;
      let sectionSubmission = submission.sections.find(
        (s) => s.sectionType === "listening" && (s.part || 1) === sectionPart
      );

      // Nếu chưa có, tạo mới
      if (!sectionSubmission) {
        sectionSubmission = {
          sectionType: "listening",
          part: sectionPart,
          submittedAt: null,
          answers: [],
          sectionScore: 0,
        };
        submission.sections.push(sectionSubmission);
        sectionSubmission = submission.sections[submission.sections.length - 1];
      }

      const questions = examSection.answerKey?.map((key) => ({
        questionNumber: key.questionNumber,
        questionTitle: key.questionTitle,
        questionType: key.questionType,
        questionAnswer: key.questionAnswer || [],
      })) || [];

      const sectionData = {
        type: examSection.type,
        part: sectionPart,
        fileUrl: examSection.fileUrl,
        instructions: examSection.instructions,
        duration: examSection.duration,
        questionCount: examSection.questionCount,
        maxScore: examSection.maxScore,
        questions: questions,
      };

      // Add audioUrls for listening section
      if (examSection.audioUrls) {
        sectionData.audioUrls = examSection.audioUrls;
      }

      return {
        part: sectionPart,
        section: sectionData,
        submission: {
          submittedAt: sectionSubmission.submittedAt,
          answers: sectionSubmission.answers,
          sectionScore: sectionSubmission.sectionScore,
        },
      };
    });

    // Lưu submission nếu có thay đổi
    await submission.save();

    // Tính tổng
    const totalMaxScore = listeningSections.reduce((sum, s) => sum + (s.maxScore || 0), 0);
    const totalQuestionCount = listeningSections.reduce((sum, s) => sum + (s.questionCount || 0), 0);
    const totalDuration = listeningSections.reduce((sum, s) => sum + (s.duration || 0), 0);

    res.json({
      sectionType: "listening",
      parts: partsData,
      totalMaxScore,
      totalQuestionCount,
      totalDuration,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== LẤY THÔNG TIN SECTION WRITING ==================
exports.getWritingSection = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    const studentId = req.user._id;

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm tất cả các section Writing (tất cả các part)
    const writingSections = exam.sections.filter(
      (section) => section.type === "writing"
    ).sort((a, b) => (a.part || 1) - (b.part || 1));

    if (writingSections.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phần Writing",
      });
    }

    // Kiểm tra submission
    const submission = await Submission.findOne({
      _id: submissionId,
      examId: examId,
      studentId: studentId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài làm" });
    }

    // Xử lý từng part
    const partsData = writingSections.map((examSection) => {
      const sectionPart = examSection.part || 1;
      let sectionSubmission = submission.sections.find(
        (s) => s.sectionType === "writing" && (s.part || 1) === sectionPart
      );

      // Nếu chưa có, tạo mới
      if (!sectionSubmission) {
        sectionSubmission = {
          sectionType: "writing",
          part: sectionPart,
          submittedAt: null,
          answers: [],
          sectionScore: 0,
        };
        submission.sections.push(sectionSubmission);
        sectionSubmission = submission.sections[submission.sections.length - 1];
      }

      const questions = examSection.answerKey?.map((key) => ({
        questionNumber: key.questionNumber,
        questionTitle: key.questionTitle,
        questionType: key.questionType,
        questionAnswer: key.questionAnswer || [],
      })) || [];

      return {
        part: sectionPart,
        section: {
          type: examSection.type,
          part: sectionPart,
          fileUrl: examSection.fileUrl,
          instructions: examSection.instructions,
          duration: examSection.duration,
          questionCount: examSection.questionCount,
          maxScore: examSection.maxScore,
          questions: questions,
        },
        submission: {
          submittedAt: sectionSubmission.submittedAt,
          answers: sectionSubmission.answers,
          sectionScore: sectionSubmission.sectionScore,
        },
      };
    });

    // Lưu submission nếu có thay đổi
    await submission.save();

    // Tính tổng
    const totalMaxScore = writingSections.reduce((sum, s) => sum + (s.maxScore || 0), 0);
    const totalQuestionCount = writingSections.reduce((sum, s) => sum + (s.questionCount || 0), 0);
    const totalDuration = writingSections.reduce((sum, s) => sum + (s.duration || 0), 0);

    res.json({
      sectionType: "writing",
      parts: partsData,
      totalMaxScore,
      totalQuestionCount,
      totalDuration,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== LẤY THÔNG TIN SECTION SPEAKING ==================
exports.getSpeakingSection = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    const studentId = req.user._id;

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm tất cả các section Speaking (tất cả các part)
    const speakingSections = exam.sections.filter(
      (section) => section.type === "speaking"
    ).sort((a, b) => (a.part || 1) - (b.part || 1));

    if (speakingSections.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phần Speaking",
      });
    }

    // Kiểm tra submission
    const submission = await Submission.findOne({
      _id: submissionId,
      examId: examId,
      studentId: studentId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài làm" });
    }

    // Xử lý từng part
    const partsData = speakingSections.map((examSection) => {
      const sectionPart = examSection.part || 1;
      let sectionSubmission = submission.sections.find(
        (s) => s.sectionType === "speaking" && (s.part || 1) === sectionPart
      );

      // Nếu chưa có, tạo mới
      if (!sectionSubmission) {
        sectionSubmission = {
          sectionType: "speaking",
          part: sectionPart,
          submittedAt: null,
          answers: [],
          sectionScore: 0,
        };
        submission.sections.push(sectionSubmission);
        sectionSubmission = submission.sections[submission.sections.length - 1];
      }

      const questions = examSection.answerKey?.map((key) => ({
        questionNumber: key.questionNumber,
        questionTitle: key.questionTitle,
        questionType: key.questionType,
        questionAnswer: key.questionAnswer || [],
      })) || [];

      return {
        part: sectionPart,
        section: {
          type: examSection.type,
          part: sectionPart,
          fileUrl: examSection.fileUrl,
          instructions: examSection.instructions,
          duration: examSection.duration,
          questionCount: examSection.questionCount,
          maxScore: examSection.maxScore,
          questions: questions,
        },
        submission: {
          submittedAt: sectionSubmission.submittedAt,
          answers: sectionSubmission.answers,
          sectionScore: sectionSubmission.sectionScore,
        },
      };
    });

    // Lưu submission nếu có thay đổi
    await submission.save();

    // Tính tổng
    const totalMaxScore = speakingSections.reduce((sum, s) => sum + (s.maxScore || 0), 0);
    const totalQuestionCount = speakingSections.reduce((sum, s) => sum + (s.questionCount || 0), 0);
    const totalDuration = speakingSections.reduce((sum, s) => sum + (s.duration || 0), 0);

    res.json({
      sectionType: "speaking",
      parts: partsData,
      totalMaxScore,
      totalQuestionCount,
      totalDuration,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== 5. NỘP ĐÁP ÁN SECTION READING ==================
exports.submitReadingAnswers = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    let { parts } = req.body; // parts: [{ part: 1, answers: [...] }, { part: 2, answers: [...] }]
    const studentId = req.user._id;

    // Parse parts nếu là string
    if (typeof parts === "string") {
      try {
        parts = JSON.parse(parts);
      } catch (e) {
        return res.status(400).json({ message: "Định dạng đáp án không hợp lệ" });
      }
    }

    if (!parts || !Array.isArray(parts)) {
      return res.status(400).json({ message: "Vui lòng cung cấp đáp án cho tất cả các part" });
    }

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm tất cả các section Reading
    const readingSections = exam.sections.filter(
      (section) => section.type === "reading"
    ).sort((a, b) => (a.part || 1) - (b.part || 1));

    if (readingSections.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phần Reading",
      });
    }

    // Kiểm tra submission
    const submission = await Submission.findOne({
      _id: submissionId,
      examId: examId,
      studentId: studentId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài làm" });
    }

    let totalSectionScore = 0;
    const partsResults = [];

    // Xử lý từng part
    for (const partData of parts) {
      const { part, answers } = partData;
      const sectionPart = part || 1;

      if (!answers || !Array.isArray(answers)) {
        continue; // Bỏ qua part không có answers
      }

      // Tìm exam section tương ứng
      const examSection = readingSections.find(
        (s) => (s.part || 1) === sectionPart
      );

      if (!examSection) {
        continue; // Bỏ qua nếu không tìm thấy section
      }

      // Tìm hoặc tạo section submission
      let sectionIndex = submission.sections.findIndex(
        (s) => s.sectionType === "reading" && (s.part || 1) === sectionPart
      );

      if (sectionIndex === -1) {
        submission.sections.push({
          sectionType: "reading",
          part: sectionPart,
          submittedAt: null,
          answers: [],
          sectionScore: 0,
        });
        sectionIndex = submission.sections.length - 1;
      }

      // Chấm điểm tự động
      const answerKey = examSection.answerKey || [];
      let sectionScore = 0;
      const gradedAnswers = answers.map((answer) => {
        const correctAnswer = answerKey.find(
          (key) => key.questionNumber === answer.questionNumber
        );
        const grading = gradeAnswer(answer, correctAnswer);
        sectionScore += grading.score;
        return {
          questionNumber: answer.questionNumber,
          selectedOption: answer.selectedOption || answer.answerText || "",
          score: grading.score,
        };
      });

      // Cập nhật section submission
      submission.sections[sectionIndex].answers = gradedAnswers;
      submission.sections[sectionIndex].sectionScore = sectionScore;
      submission.sections[sectionIndex].submittedAt = new Date();

      totalSectionScore += sectionScore;
      partsResults.push({
        part: sectionPart,
        sectionScore,
        answers: gradedAnswers,
      });
    }

    // Cập nhật tổng điểm và status
    let totalScore = 0;
    submission.sections.forEach((section) => {
      totalScore += section.sectionScore || 0;
    });
    submission.totalScore = totalScore;

    // Kiểm tra xem tất cả các section (của tất cả các type) đã được nộp chưa
    const allSectionsSubmitted = submission.sections.every(
      (section) => section.submittedAt !== null
    );
    submission.status = allSectionsSubmitted ? "completed" : "partially-submitted";

    await submission.save();

    res.json({
      message: "Nộp bài Reading thành công",
      sectionScore: totalSectionScore,
      totalScore: submission.totalScore,
      parts: partsResults,
      status: submission.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== NỘP ĐÁP ÁN SECTION LISTENING ==================
exports.submitListeningAnswers = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    let { parts } = req.body; // parts: [{ part: 1, answers: [...] }, { part: 2, answers: [...] }]
    const studentId = req.user._id;

    // Parse parts nếu là string
    if (typeof parts === "string") {
      try {
        parts = JSON.parse(parts);
      } catch (e) {
        return res.status(400).json({ message: "Định dạng đáp án không hợp lệ" });
      }
    }

    if (!parts || !Array.isArray(parts)) {
      return res.status(400).json({ message: "Vui lòng cung cấp đáp án cho tất cả các part" });
    }

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm tất cả các section Listening
    const listeningSections = exam.sections.filter(
      (section) => section.type === "listening"
    ).sort((a, b) => (a.part || 1) - (b.part || 1));

    if (listeningSections.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phần Listening",
      });
    }

    // Kiểm tra submission
    const submission = await Submission.findOne({
      _id: submissionId,
      examId: examId,
      studentId: studentId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài làm" });
    }

    let totalSectionScore = 0;
    const partsResults = [];

    // Xử lý từng part
    for (const partData of parts) {
      const { part, answers } = partData;
      const sectionPart = part || 1;

      if (!answers || !Array.isArray(answers)) {
        continue; // Bỏ qua part không có answers
      }

      // Tìm exam section tương ứng
      const examSection = listeningSections.find(
        (s) => (s.part || 1) === sectionPart
      );

      if (!examSection) {
        continue; // Bỏ qua nếu không tìm thấy section
      }

      // Tìm hoặc tạo section submission
      let sectionIndex = submission.sections.findIndex(
        (s) => s.sectionType === "listening" && (s.part || 1) === sectionPart
      );

      if (sectionIndex === -1) {
        submission.sections.push({
          sectionType: "listening",
          part: sectionPart,
          submittedAt: null,
          answers: [],
          sectionScore: 0,
        });
        sectionIndex = submission.sections.length - 1;
      }

      // Chấm điểm tự động
      const answerKey = examSection.answerKey || [];
      let sectionScore = 0;
      const gradedAnswers = answers.map((answer) => {
        const correctAnswer = answerKey.find(
          (key) => key.questionNumber === answer.questionNumber
        );
        const grading = gradeAnswer(answer, correctAnswer);
        sectionScore += grading.score;
        return {
          questionNumber: answer.questionNumber,
          selectedOption: answer.selectedOption || answer.answerText || "",
          score: grading.score,
        };
      });

      // Cập nhật section submission
      submission.sections[sectionIndex].answers = gradedAnswers;
      submission.sections[sectionIndex].sectionScore = sectionScore;
      submission.sections[sectionIndex].submittedAt = new Date();

      totalSectionScore += sectionScore;
      partsResults.push({
        part: sectionPart,
        sectionScore,
        answers: gradedAnswers,
      });
    }

    // Cập nhật tổng điểm và status
    let totalScore = 0;
    submission.sections.forEach((section) => {
      totalScore += section.sectionScore || 0;
    });
    submission.totalScore = totalScore;

    // Kiểm tra xem tất cả các section (của tất cả các type) đã được nộp chưa
    const allSectionsSubmitted = submission.sections.every(
      (section) => section.submittedAt !== null
    );
    submission.status = allSectionsSubmitted ? "completed" : "partially-submitted";

    await submission.save();

    res.json({
      message: "Nộp bài Listening thành công",
      sectionScore: totalSectionScore,
      totalScore: submission.totalScore,
      parts: partsResults,
      status: submission.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== NỘP ĐÁP ÁN SECTION WRITING ==================
exports.submitWritingAnswers = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    let { parts } = req.body; // parts: [{ part: 1, answers: [...] }, { part: 2, answers: [...] }]
    const studentId = req.user._id;

    // Parse parts nếu là string
    if (typeof parts === "string") {
      try {
        parts = JSON.parse(parts);
      } catch (e) {
        return res.status(400).json({ message: "Định dạng đáp án không hợp lệ" });
      }
    }

    if (!parts || !Array.isArray(parts)) {
      return res.status(400).json({ message: "Vui lòng cung cấp đáp án cho tất cả các part" });
    }

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm tất cả các section Writing
    const writingSections = exam.sections.filter(
      (section) => section.type === "writing"
    ).sort((a, b) => (a.part || 1) - (b.part || 1));

    if (writingSections.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phần Writing",
      });
    }

    // Kiểm tra submission
    const submission = await Submission.findOne({
      _id: submissionId,
      examId: examId,
      studentId: studentId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài làm" });
    }

    const partsResults = [];

    // Xử lý từng part
    for (const partData of parts) {
      const { part, answers } = partData;
      const sectionPart = part || 1;

      if (!answers || !Array.isArray(answers)) {
        continue; // Bỏ qua part không có answers
      }

      // Tìm exam section tương ứng
      const examSection = writingSections.find(
        (s) => (s.part || 1) === sectionPart
      );

      if (!examSection) {
        continue; // Bỏ qua nếu không tìm thấy section
      }

      // Tìm hoặc tạo section submission
      let sectionIndex = submission.sections.findIndex(
        (s) => s.sectionType === "writing" && (s.part || 1) === sectionPart
      );

      if (sectionIndex === -1) {
        submission.sections.push({
          sectionType: "writing",
          part: sectionPart,
          submittedAt: null,
          answers: [],
          sectionScore: 0,
        });
        sectionIndex = submission.sections.length - 1;
      }

      // Writing: chỉ lưu đáp án text (không có file upload, không chấm tự động)
      const gradedAnswers = answers.map((answer) => ({
        questionNumber: answer.questionNumber,
        answerText: answer.answerText || "",
        score: 0, // Sẽ được cập nhật khi giáo viên chấm
      }));

      // Cập nhật section submission
      submission.sections[sectionIndex].answers = gradedAnswers;
      submission.sections[sectionIndex].sectionScore = 0;
      submission.sections[sectionIndex].submittedAt = new Date();

      partsResults.push({
        part: sectionPart,
        sectionScore: 0,
        answers: gradedAnswers,
      });
    }

    // Cập nhật tổng điểm và status
    let totalScore = 0;
    submission.sections.forEach((section) => {
      totalScore += section.sectionScore || 0;
    });
    submission.totalScore = totalScore;

    // Kiểm tra xem tất cả các section (của tất cả các type) đã được nộp chưa
    const allSectionsSubmitted = submission.sections.every(
      (section) => section.submittedAt !== null
    );
    submission.status = allSectionsSubmitted ? "completed" : "partially-submitted";

    await submission.save();

    res.json({
      message: "Nộp bài Writing thành công",
      sectionScore: 0,
      totalScore: submission.totalScore,
      parts: partsResults,
      status: submission.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== NỘP ĐÁP ÁN SECTION SPEAKING ==================
exports.submitSpeakingAnswers = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    let { parts } = req.body; // parts: [{ part: 1, answers: [...] }, { part: 2, answers: [...] }]
    const studentId = req.user._id;

    // Parse parts nếu là string
    if (typeof parts === "string") {
      try {
        parts = JSON.parse(parts);
      } catch (e) {
        return res.status(400).json({ message: "Định dạng đáp án không hợp lệ" });
      }
    }

    if (!parts || !Array.isArray(parts)) {
      return res.status(400).json({ message: "Vui lòng cung cấp đáp án cho tất cả các part" });
    }

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm tất cả các section Speaking
    const speakingSections = exam.sections.filter(
      (section) => section.type === "speaking"
    ).sort((a, b) => (a.part || 1) - (b.part || 1));

    if (speakingSections.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phần Speaking",
      });
    }

    // Kiểm tra submission
    const submission = await Submission.findOne({
      _id: submissionId,
      examId: examId,
      studentId: studentId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài làm" });
    }

    // Xử lý file upload cho Speaking
    // File names format: "part_{part}_question_{questionNumber}" hoặc "question_{questionNumber}" (backward compatible)
    const uploadedFiles = {};
    if (req.file) {
      uploadedFiles.default = `/uploads/${req.file.filename}`;
    } else if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach((file) => {
          uploadedFiles[file.fieldname] = `/uploads/${file.filename}`;
        });
      } else {
        Object.keys(req.files).forEach((fieldName) => {
          const files = Array.isArray(req.files[fieldName]) 
            ? req.files[fieldName] 
            : [req.files[fieldName]];
          files.forEach((file) => {
            uploadedFiles[fieldName] = `/uploads/${file.filename}`;
          });
        });
      }
    }

    const partsResults = [];

    // Xử lý từng part
    for (const partData of parts) {
      const { part, answers } = partData;
      const sectionPart = part || 1;

      if (!answers || !Array.isArray(answers)) {
        continue; // Bỏ qua part không có answers
      }

      // Tìm exam section tương ứng
      const examSection = speakingSections.find(
        (s) => (s.part || 1) === sectionPart
      );

      if (!examSection) {
        continue; // Bỏ qua nếu không tìm thấy section
      }

      // Tìm hoặc tạo section submission
      let sectionIndex = submission.sections.findIndex(
        (s) => s.sectionType === "speaking" && (s.part || 1) === sectionPart
      );

      if (sectionIndex === -1) {
        submission.sections.push({
          sectionType: "speaking",
          part: sectionPart,
          submittedAt: null,
          answers: [],
          sectionScore: 0,
        });
        sectionIndex = submission.sections.length - 1;
      }

      // Speaking: lưu đáp án text và recording (không chấm tự động)
      const gradedAnswers = answers.map((answer) => {
        // Tìm recording: ưu tiên part-specific, sau đó là generic
        const partSpecificKey = `part_${sectionPart}_question_${answer.questionNumber}`;
        const genericKey = `question_${answer.questionNumber}`;
        const recordingUrl = uploadedFiles[partSpecificKey] 
          || uploadedFiles[genericKey] 
          || uploadedFiles.default 
          || uploadedFiles.recording 
          || answer.recordingUrl 
          || "";
        
        return {
          questionNumber: answer.questionNumber,
          answerText: answer.answerText || "",
          recordingUrl: recordingUrl,
          score: 0, // Sẽ được cập nhật khi giáo viên chấm
        };
      });

      // Cập nhật section submission
      submission.sections[sectionIndex].answers = gradedAnswers;
      submission.sections[sectionIndex].sectionScore = 0;
      submission.sections[sectionIndex].submittedAt = new Date();

      partsResults.push({
        part: sectionPart,
        sectionScore: 0,
        answers: gradedAnswers,
      });
    }

    // Cập nhật tổng điểm và status
    let totalScore = 0;
    submission.sections.forEach((section) => {
      totalScore += section.sectionScore || 0;
    });
    submission.totalScore = totalScore;

    // Kiểm tra xem tất cả các section (của tất cả các type) đã được nộp chưa
    const allSectionsSubmitted = submission.sections.every(
      (section) => section.submittedAt !== null
    );
    submission.status = allSectionsSubmitted ? "completed" : "partially-submitted";

    await submission.save();

    res.json({
      message: "Nộp bài Speaking thành công",
      sectionScore: 0,
      totalScore: submission.totalScore,
      parts: partsResults,
      status: submission.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== 6. XEM KẾT QUẢ SECTION READING ==================
exports.getReadingResult = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    const studentId = req.user._id;

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm tất cả các section Reading
    const readingSections = exam.sections.filter(
      (section) => section.type === "reading"
    ).sort((a, b) => (a.part || 1) - (b.part || 1));

    if (readingSections.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phần Reading",
      });
    }

    // Kiểm tra submission
    const submission = await Submission.findOne({
      _id: submissionId,
      examId: examId,
      studentId: studentId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài làm" });
    }

    let totalSectionScore = 0;
    let totalMaxScore = 0;
    const partsResults = [];
    let earliestSubmittedAt = null;

    // Xử lý từng part
    for (const examSection of readingSections) {
      const sectionPart = examSection.part || 1;
      const sectionSubmission = submission.sections.find(
        (s) => s.sectionType === "reading" && (s.part || 1) === sectionPart
      );

      if (!sectionSubmission || !sectionSubmission.submittedAt) {
        continue; // Bỏ qua part chưa nộp
      }

      // Tìm submittedAt sớm nhất
      if (!earliestSubmittedAt || sectionSubmission.submittedAt < earliestSubmittedAt) {
        earliestSubmittedAt = sectionSubmission.submittedAt;
      }

      // Tạo kết quả chi tiết cho part này
      const answerKey = examSection.answerKey || [];
      const detailedResults = sectionSubmission.answers.map((answer) => {
        const correctAnswer = answerKey.find(
          (key) => key.questionNumber === answer.questionNumber
        );

        return {
          questionNumber: answer.questionNumber,
          questionTitle: correctAnswer ? correctAnswer.questionTitle || "" : "",
          questionAnswer: correctAnswer ? correctAnswer.questionAnswer || [] : [],
          studentAnswer: answer.selectedOption,
          correctAnswer: correctAnswer 
            ? (Array.isArray(correctAnswer.correctAnswer) 
                ? correctAnswer.correctAnswer 
                : [correctAnswer.correctAnswer || ""])
            : null,
          score: answer.score,
          maxScore: correctAnswer ? correctAnswer.maxScore || 1 : 0,
          isCorrect: answer.score > 0,
        };
      });

      totalSectionScore += sectionSubmission.sectionScore || 0;
      totalMaxScore += examSection.maxScore || 0;

      partsResults.push({
        part: sectionPart,
        sectionScore: sectionSubmission.sectionScore || 0,
        maxScore: examSection.maxScore || 0,
        results: detailedResults,
        submittedAt: sectionSubmission.submittedAt,
        feedback: sectionSubmission.feedback || null,
      });
    }

    if (partsResults.length === 0) {
      return res.status(400).json({
        message: "Chưa nộp bài Reading",
      });
    }

    res.json({
      sectionType: "reading",
      sectionScore: totalSectionScore,
      maxScore: totalMaxScore,
      totalScore: submission.totalScore,
      submittedAt: earliestSubmittedAt,
      parts: partsResults,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== XEM KẾT QUẢ SECTION LISTENING ==================
exports.getListeningResult = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    const studentId = req.user._id;

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm tất cả các section Listening
    const listeningSections = exam.sections.filter(
      (section) => section.type === "listening"
    ).sort((a, b) => (a.part || 1) - (b.part || 1));

    if (listeningSections.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phần Listening",
      });
    }

    // Kiểm tra submission
    const submission = await Submission.findOne({
      _id: submissionId,
      examId: examId,
      studentId: studentId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài làm" });
    }

    let totalSectionScore = 0;
    let totalMaxScore = 0;
    const partsResults = [];
    let earliestSubmittedAt = null;

    // Xử lý từng part
    for (const examSection of listeningSections) {
      const sectionPart = examSection.part || 1;
      const sectionSubmission = submission.sections.find(
        (s) => s.sectionType === "listening" && (s.part || 1) === sectionPart
      );

      if (!sectionSubmission || !sectionSubmission.submittedAt) {
        continue; // Bỏ qua part chưa nộp
      }

      // Tìm submittedAt sớm nhất
      if (!earliestSubmittedAt || sectionSubmission.submittedAt < earliestSubmittedAt) {
        earliestSubmittedAt = sectionSubmission.submittedAt;
      }

      // Tạo kết quả chi tiết cho part này
      const answerKey = examSection.answerKey || [];
      const detailedResults = sectionSubmission.answers.map((answer) => {
        const correctAnswer = answerKey.find(
          (key) => key.questionNumber === answer.questionNumber
        );

        return {
          questionNumber: answer.questionNumber,
          questionTitle: correctAnswer ? correctAnswer.questionTitle || "" : "",
          questionAnswer: correctAnswer ? correctAnswer.questionAnswer || [] : [],
          studentAnswer: answer.selectedOption,
          correctAnswer: correctAnswer 
            ? (Array.isArray(correctAnswer.correctAnswer) 
                ? correctAnswer.correctAnswer 
                : [correctAnswer.correctAnswer || ""])
            : null,
          score: answer.score,
          maxScore: correctAnswer ? correctAnswer.maxScore || 1 : 0,
          isCorrect: answer.score > 0,
        };
      });

      totalSectionScore += sectionSubmission.sectionScore || 0;
      totalMaxScore += examSection.maxScore || 0;

      partsResults.push({
        part: sectionPart,
        sectionScore: sectionSubmission.sectionScore || 0,
        maxScore: examSection.maxScore || 0,
        results: detailedResults,
        submittedAt: sectionSubmission.submittedAt,
        feedback: sectionSubmission.feedback || null,
      });
    }

    if (partsResults.length === 0) {
      return res.status(400).json({
        message: "Chưa nộp bài Listening",
      });
    }

    res.json({
      sectionType: "listening",
      sectionScore: totalSectionScore,
      maxScore: totalMaxScore,
      totalScore: submission.totalScore,
      submittedAt: earliestSubmittedAt,
      parts: partsResults,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== XEM KẾT QUẢ SECTION WRITING ==================
exports.getWritingResult = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    const studentId = req.user._id;

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm tất cả các section Writing
    const writingSections = exam.sections.filter(
      (section) => section.type === "writing"
    ).sort((a, b) => (a.part || 1) - (b.part || 1));

    if (writingSections.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phần Writing",
      });
    }

    // Kiểm tra submission
    const submission = await Submission.findOne({
      _id: submissionId,
      examId: examId,
      studentId: studentId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài làm" });
    }

    let totalSectionScore = 0;
    let totalMaxScore = 0;
    const partsResults = [];
    let earliestSubmittedAt = null;

    // Xử lý từng part
    for (const examSection of writingSections) {
      const sectionPart = examSection.part || 1;
      const sectionSubmission = submission.sections.find(
        (s) => s.sectionType === "writing" && (s.part || 1) === sectionPart
      );

      if (!sectionSubmission || !sectionSubmission.submittedAt) {
        continue; // Bỏ qua part chưa nộp
      }

      // Tìm submittedAt sớm nhất
      if (!earliestSubmittedAt || sectionSubmission.submittedAt < earliestSubmittedAt) {
        earliestSubmittedAt = sectionSubmission.submittedAt;
      }

      // Tạo kết quả chi tiết cho part này
      const answerKey = examSection.answerKey || [];
      const detailedResults = sectionSubmission.answers.map((answer) => {
        const correctAnswer = answerKey.find(
          (key) => key.questionNumber === answer.questionNumber
        );
        return {
          questionNumber: answer.questionNumber,
          questionTitle: correctAnswer ? correctAnswer.questionTitle || "" : "",
          questionAnswer: correctAnswer ? correctAnswer.questionAnswer || [] : [],
          studentAnswer: answer.answerText || answer.selectedOption || "",
          score: answer.score || 0,
          maxScore: correctAnswer ? correctAnswer.maxScore || 0 : 0,
          isCorrect: null, // Không áp dụng cho writing
        };
      });

      totalSectionScore += sectionSubmission.sectionScore || 0;
      totalMaxScore += examSection.maxScore || 0;

      partsResults.push({
        part: sectionPart,
        sectionScore: sectionSubmission.sectionScore || 0,
        maxScore: examSection.maxScore || 0,
        results: detailedResults,
        submittedAt: sectionSubmission.submittedAt,
        feedback: sectionSubmission.feedback || null,
      });
    }

    if (partsResults.length === 0) {
      return res.status(400).json({
        message: "Chưa nộp bài Writing",
      });
    }

    res.json({
      sectionType: "writing",
      sectionScore: totalSectionScore,
      maxScore: totalMaxScore,
      totalScore: submission.totalScore,
      submittedAt: earliestSubmittedAt,
      parts: partsResults,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== XEM KẾT QUẢ SECTION SPEAKING ==================
exports.getSpeakingResult = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    const studentId = req.user._id;

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm tất cả các section Speaking
    const speakingSections = exam.sections.filter(
      (section) => section.type === "speaking"
    ).sort((a, b) => (a.part || 1) - (b.part || 1));

    if (speakingSections.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phần Speaking",
      });
    }

    // Kiểm tra submission
    const submission = await Submission.findOne({
      _id: submissionId,
      examId: examId,
      studentId: studentId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài làm" });
    }

    let totalSectionScore = 0;
    let totalMaxScore = 0;
    const partsResults = [];
    let earliestSubmittedAt = null;

    // Xử lý từng part
    for (const examSection of speakingSections) {
      const sectionPart = examSection.part || 1;
      const sectionSubmission = submission.sections.find(
        (s) => s.sectionType === "speaking" && (s.part || 1) === sectionPart
      );

      if (!sectionSubmission || !sectionSubmission.submittedAt) {
        continue; // Bỏ qua part chưa nộp
      }

      // Tìm submittedAt sớm nhất
      if (!earliestSubmittedAt || sectionSubmission.submittedAt < earliestSubmittedAt) {
        earliestSubmittedAt = sectionSubmission.submittedAt;
      }

      // Tạo kết quả chi tiết cho part này
      const answerKey = examSection.answerKey || [];
      const detailedResults = sectionSubmission.answers.map((answer) => {
        const correctAnswer = answerKey.find(
          (key) => key.questionNumber === answer.questionNumber
        );
        return {
          questionNumber: answer.questionNumber,
          questionTitle: correctAnswer ? correctAnswer.questionTitle || "" : "",
          questionAnswer: correctAnswer ? correctAnswer.questionAnswer || [] : [],
          studentAnswer: answer.answerText || answer.selectedOption || "",
          recordingUrl: answer.recordingUrl || null,
          score: answer.score || 0,
          maxScore: correctAnswer ? correctAnswer.maxScore || 0 : 0,
          isCorrect: null, // Không áp dụng cho speaking
        };
      });

      totalSectionScore += sectionSubmission.sectionScore || 0;
      totalMaxScore += examSection.maxScore || 0;

      partsResults.push({
        part: sectionPart,
        sectionScore: sectionSubmission.sectionScore || 0,
        maxScore: examSection.maxScore || 0,
        results: detailedResults,
        submittedAt: sectionSubmission.submittedAt,
        feedback: sectionSubmission.feedback || null,
      });
    }

    if (partsResults.length === 0) {
      return res.status(400).json({
        message: "Chưa nộp bài Speaking",
      });
    }

    res.json({
      sectionType: "speaking",
      sectionScore: totalSectionScore,
      maxScore: totalMaxScore,
      totalScore: submission.totalScore,
      submittedAt: earliestSubmittedAt,
      parts: partsResults,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};







