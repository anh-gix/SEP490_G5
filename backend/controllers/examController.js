const Exam = require("../models/examModel");
const Submission = require("../models/submissionModel");
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
  const allowedTypes = ['.pdf', '.doc', '.docx', '.csv', '.xlsx', '.xls', '.mp3', '.wav'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} not allowed`), false);
  }
};

const upload = multer({ storage, fileFilter });
exports.uploadMiddleware = upload;

// ================== 1. LẤY DANH SÁCH BÀI THI ==================
exports.getAllExams = async (req, res) => {
  try {
    const { search = '', examType = '', level = '', isPublished } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (examType) {
      query.examType = examType;
    }
    if (level) {
      query.level = level;
    }
    if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    }

    const exams = await Exam.find(query)
      .populate('createdBy', 'username email')
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

// ================== 2. BẮT ĐẦU BÀI THI ==================
exports.startExam = async (req, res) => {
  try {
    const { examId, studentId } = req.body;

    let existing = await Submission.findOne({ examId, studentId });
    if (existing) return res.json(existing);

    const submission = new Submission({
      examId,
      studentId,
      status: "in-progress",
    });

    await submission.save();
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== 3. LƯU CÂU TRẢ LỜI CHO READING/LISTENING ==================
exports.saveObjectiveAnswer = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { sectionType, questionNumber, selectedOption } = req.body;

    const submission = await Submission.findById(submissionId).populate("examId");
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    let section = submission.sections.find(s => s.sectionType === sectionType);
    if (!section) {
      section = { sectionType, answers: [] };
      submission.sections.push(section);
    }

    let answer = section.answers.find(a => a.questionNumber === questionNumber);
    if (!answer) {
      answer = { questionNumber };
      section.answers.push(answer);
    }

    // Ghi lại lựa chọn của sinh viên
    answer.selectedOption = selectedOption;

    // --- Tự động chấm điểm nếu có đáp án ---
    const exam = await Exam.findById(submission.examId);
    const examSection = exam.sections.find(sec => sec.type === sectionType);
    const correct = examSection?.answerKey?.find(a => a.questionNumber === questionNumber);
    if (correct && correct.correctAnswer === selectedOption) {
      answer.score = correct.maxScore || 1;
    } else {
      answer.score = 0;
    }

    section.submittedAt = new Date();
    await submission.save();

    res.json({ message: "Answer saved", submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== 4. LƯU WRITING (GÕ TRỰC TIẾP) ==================
exports.saveWritingAnswer = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { questionNumber, answerText } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    let section = submission.sections.find(s => s.sectionType === "writing");
    if (!section) {
      section = { sectionType: "writing", answers: [] };
      submission.sections.push(section);
    }

    let answer = section.answers.find(a => a.questionNumber === questionNumber);
    if (!answer) {
      answer = { questionNumber };
      section.answers.push(answer);
    }

    answer.answerText = answerText;
    section.submittedAt = new Date();
    await submission.save();

    res.json({ message: "Writing answer saved", submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== 5. UPLOAD SPEAKING RECORDING ==================
exports.uploadSpeakingRecording = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { questionNumber } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const fileUrl = `/uploads/${req.file.filename}`;

    let section = submission.sections.find(s => s.sectionType === "speaking");
    if (!section) {
      section = { sectionType: "speaking", answers: [] };
      submission.sections.push(section);
    }

    let answer = section.answers.find(a => a.questionNumber === questionNumber);
    if (!answer) {
      answer = { questionNumber };
      section.answers.push(answer);
    }

    answer.recordingUrl = fileUrl;
    section.submittedAt = new Date();
    await submission.save();

    res.json({ message: "Speaking uploaded", fileUrl, submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== 6. PUBLISH EXAM ==================
exports.publishExam = async (req, res) => {
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

// ================== 7. UNPUBLISH EXAM ==================
exports.unpublishExam = async (req, res) => {
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

// ================== 8. GET EXAM BY ID WITH DETAILS ==================
exports.getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id).populate('createdBy', 'username email');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài thi'
      });
    }

    // Get submission count
    const submissionCount = await Submission.countDocuments({ examId: id });

    res.status(200).json({
      success: true,
      data: {
        ...exam.toObject(),
        submissionCount
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

// ================== 9. GET EXAM SUBMISSIONS ==================
exports.getExamSubmissions = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài thi'
      });
    }

    const submissions = await Submission.find({ examId: id })
      .populate('studentId', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: submissions,
      count: submissions.length
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bài làm',
      error: err.message
    });
  }
};

// create exam
exports.createExam = async (req, res) => {
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

// update exam
exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài thi'
      });
    }

    // Không cho phép cập nhật nếu đã xuất bản
    if (exam.isPublished && !req.body.allowPublishedUpdate) {
      return res.status(400).json({
        success: false,
        message: 'Không thể cập nhật bài thi đã xuất bản'
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

// upload pdf/doc file for exam
exports.uploadExamFile = async (req, res) => {
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

    const fileUrl = `/uploads/${req.file.filename}`;

    if (sectionId) {
      const section = exam.sections.id(sectionId);
      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy section'
        });
      }
      section.fileUrl = fileUrl;
    }

    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Upload file đề thi thành công',
      fileUrl,
      data: exam
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload file đề thi',
      error: err.message
    });
  }
};

// upload audio file for listening section
exports.uploadAudioFile = async (req, res) => {
  try {
    const { examId, sectionId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file audio được upload'
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

    if (section.type !== 'listening') {
      return res.status(400).json({
        success: false,
        message: 'Section này không phải là listening'
      });
    }

    const audioUrl = `/uploads/${req.file.filename}`;

    if (!section.audioUrls) {
      section.audioUrls = [];
    }
    section.audioUrls.push(audioUrl);

    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Upload file audio thành công',
      audioUrl,
      data: exam
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload file audio',
      error: err.message
    });
  }
};

// upload csv answer key
exports.uploadAnswerKeyCSV = async (req, res) => {
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

// delete exam
exports.deleteExam = async (req, res) => {
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
