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

//center head handle
// ================== 1. LẤY DANH SÁCH BÀI THI ==================
exports.getAllExamsCenterHead = async (req, res) => {
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

exports.getExamByIdCenterHead = async (req, res) => {
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

// ================== HELPER FUNCTIONS ==================
const getSectionName = (sectionType) => {
  const names = {
    reading: "Reading",
    listening: "Listening",
    writing: "Writing",
    speaking: "Speaking",
  };
  return names[sectionType] || sectionType;
};

// ================== 4. LẤY THÔNG TIN SECTION (GENERIC - CHO TẤT CẢ CÁC PHẦN THI) ==================
exports.getSection = async (req, res) => {
  try {
    const { examId, submissionId, sectionType } = req.params;
    const studentId = req.user._id;

    // Validate section type
    const validSectionTypes = ["reading", "listening", "writing", "speaking"];
    if (!validSectionTypes.includes(sectionType)) {
      return res.status(400).json({ message: "Loại phần thi không hợp lệ" });
    }

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm section
    const examSection = exam.sections.find(
      (section) => section.type === sectionType
    );

    if (!examSection) {
      return res.status(404).json({
        message: `Không tìm thấy phần ${getSectionName(sectionType)}`,
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

    // Tìm section submission tương ứng
    let sectionSubmission = submission.sections.find(
      (s) => s.sectionType === sectionType
    );

    // Nếu chưa có, tạo mới
    if (!sectionSubmission) {
      sectionSubmission = {
        sectionType: sectionType,
        submittedAt: null,
        answers: [],
        sectionScore: 0,
      };
      submission.sections.push(sectionSubmission);
      await submission.save();
      sectionSubmission = submission.sections[submission.sections.length - 1];
    }

    // Trả về thông tin section với questionType, questionTitle và questionAnswer cho mỗi câu hỏi (không bao gồm answer key)
    const questions = examSection.answerKey?.map((key) => ({
      questionNumber: key.questionNumber,
      questionTitle: key.questionTitle,
      questionType: key.questionType,
      questionAnswer: key.questionAnswer || [],
    })) || [];

    // Build response object
    const sectionData = {
      type: examSection.type,
      fileUrl: examSection.fileUrl,
      instructions: examSection.instructions,
      duration: examSection.duration,
      questionCount: examSection.questionCount,
      maxScore: examSection.maxScore,
      questions: questions,
    };

    // Add audioUrls for listening section
    if (sectionType === "listening" && examSection.audioUrls) {
      sectionData.audioUrls = examSection.audioUrls;
    }

    res.json({
      section: sectionData,
      submission: {
        submittedAt: sectionSubmission.submittedAt,
        answers: sectionSubmission.answers,
        sectionScore: sectionSubmission.sectionScore,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== 5. NỘP ĐÁP ÁN SECTION (GENERIC - CHO TẤT CẢ CÁC PHẦN THI) ==================
exports.submitSectionAnswers = async (req, res) => {
  try {
    const { examId, submissionId, sectionType } = req.params;
    let { answers } = req.body; // answers là mảng: [{ questionNumber: 1, selectedOption: "A" hoặc answerText: "text" }, ...]
    const studentId = req.user._id;

    // Validate section type
    const validSectionTypes = ["reading", "listening", "writing", "speaking"];
    if (!validSectionTypes.includes(sectionType)) {
      return res.status(400).json({ message: "Loại phần thi không hợp lệ" });
    }

    // Parse answers nếu là string (khi gửi qua form-data)
    if (typeof answers === "string") {
      try {
        answers = JSON.parse(answers);
      } catch (e) {
        return res.status(400).json({ message: "Định dạng đáp án không hợp lệ" });
      }
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Vui lòng cung cấp đáp án" });
    }

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm section và answer key
    const examSection = exam.sections.find(
      (section) => section.type === sectionType
    );

    if (!examSection) {
      return res.status(404).json({
        message: `Không tìm thấy phần ${getSectionName(sectionType)}`,
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

    // Tìm section submission
    const sectionIndex = submission.sections.findIndex(
      (s) => s.sectionType === sectionType
    );

    if (sectionIndex === -1) {
      return res.status(404).json({
        message: `Không tìm thấy phần ${getSectionName(sectionType)} trong bài làm`,
      });
    }

    // Xử lý file upload cho Writing và Speaking
    // req.file: single file upload
    // req.files: multiple files upload (nếu dùng upload.array, upload.fields, hoặc upload.any)
    const uploadedFiles = {};
    if (req.file) {
      // Single file upload
      uploadedFiles.default = `/uploads/${req.file.filename}`;
    } else if (req.files) {
      // Multiple files upload
      if (Array.isArray(req.files)) {
        // upload.any() hoặc upload.array() trả về array
        req.files.forEach((file) => {
          // file.fieldname chứa tên field (ví dụ: "question_1")
          uploadedFiles[file.fieldname] = `/uploads/${file.filename}`;
        });
      } else {
        // req.files là object với các field names (upload.fields())
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

    // Chấm điểm tự động theo questionType (chỉ cho reading và listening)
    // Writing và Speaking sẽ được chấm thủ công sau
    let sectionScore = 0;
    let gradedAnswers = [];

    if (sectionType === "reading" || sectionType === "listening") {
      const answerKey = examSection.answerKey || [];
      gradedAnswers = answers.map((answer) => {
        const correctAnswer = answerKey.find(
          (key) => key.questionNumber === answer.questionNumber
        );

        let score = 0;
        let isCorrect = false;

        if (correctAnswer) {
          // Xử lý studentAnswer - có thể là string hoặc array
          let studentAnswers = answer.selectedOption || answer.answerText || "";
          if (typeof studentAnswers === "string") {
            // Nếu là string, chuyển thành array có 1 phần tử
            studentAnswers = [studentAnswers];
          } else if (!Array.isArray(studentAnswers)) {
            // Nếu không phải array và không phải string, chuyển thành array rỗng
            studentAnswers = [];
          }

          const correctAnswers = Array.isArray(correctAnswer.correctAnswer) 
            ? correctAnswer.correctAnswer 
            : [correctAnswer.correctAnswer || ""];

          // Phải khớp hết: số lượng phần tử phải bằng nhau và tất cả phần tử đều khớp (không phân biệt thứ tự)
          if (studentAnswers.length !== correctAnswers.length) {
            isCorrect = false;
          } else {
            // Helper function để so sánh hai array không phân biệt thứ tự
            const compareArraysUnordered = (arr1, arr2, compareFn) => {
              // Tạo bản sao để không ảnh hưởng đến array gốc
              const sorted1 = [...arr1].map(item => compareFn(String(item)));
              const sorted2 = [...arr2].map(item => compareFn(String(item)));
              // Sắp xếp và so sánh
              sorted1.sort();
              sorted2.sort();
              return sorted1.length === sorted2.length && 
                     sorted1.every((val, idx) => val === sorted2[idx]);
            };

            // Chấm điểm theo loại câu hỏi - kiểm tra tất cả phần tử đều khớp (không phân biệt thứ tự)
            switch (correctAnswer.questionType) {
              case "multiple_choice":
                // So sánh chính xác (case-insensitive) - phải khớp hết, không phân biệt thứ tự
                isCorrect = compareArraysUnordered(
                  correctAnswers,
                  studentAnswers,
                  (val) => val.trim().toUpperCase()
                );
                break;
              case "input":
                // So sánh text (case-insensitive, trim whitespace) - phải khớp hết, không phân biệt thứ tự
                isCorrect = compareArraysUnordered(
                  correctAnswers,
                  studentAnswers,
                  (val) => val.trim().toLowerCase()
                );
                break;
              case "true_false":
                // So sánh True/False (case-insensitive) - phải khớp hết, không phân biệt thứ tự
                isCorrect = compareArraysUnordered(
                  correctAnswers,
                  studentAnswers,
                  (val) => val.trim().toLowerCase()
                );
                break;
              default:
                // Mặc định so sánh chính xác - phải khớp hết, không phân biệt thứ tự
                isCorrect = compareArraysUnordered(
                  correctAnswers,
                  studentAnswers,
                  (val) => val.trim()
                );
            }
          }

          if (isCorrect) {
            score = correctAnswer.maxScore || 1;
            sectionScore += score;
          }
        }

        return {
          questionNumber: answer.questionNumber,
          selectedOption: answer.selectedOption || answer.answerText || "",
          score: score,
        };
      });
    } else if (sectionType === "writing") {
      // Writing: chỉ lưu đáp án text từ textarea (không có file upload)
      gradedAnswers = answers.map((answer) => ({
        questionNumber: answer.questionNumber,
        answerText: answer.answerText || "",
        score: 0, // Sẽ được cập nhật khi giáo viên chấm
      }));
    } else if (sectionType === "speaking") {
      // Speaking: lưu đáp án text và recording (nếu có)
      gradedAnswers = answers.map((answer) => {
        // Tìm recording tương ứng với questionNumber hoặc dùng default
        const recordingKey = `question_${answer.questionNumber}`;
        const recordingUrl = uploadedFiles[recordingKey] || uploadedFiles.default || uploadedFiles.recording || answer.recordingUrl || "";
        
        return {
          questionNumber: answer.questionNumber,
          answerText: answer.answerText || "",
          recordingUrl: recordingUrl,
          score: 0, // Sẽ được cập nhật khi giáo viên chấm
        };
      });
    }

    // Cập nhật section submission
    submission.sections[sectionIndex].answers = gradedAnswers;
    submission.sections[sectionIndex].sectionScore = sectionScore;
    submission.sections[sectionIndex].submittedAt = new Date();

    // Cập nhật tổng điểm
    let totalScore = 0;
    submission.sections.forEach((section) => {
      totalScore += section.sectionScore || 0;
    });
    submission.totalScore = totalScore;

    // Cập nhật status nếu đã nộp hết
    const allSectionsSubmitted = submission.sections.every(
      (section) => section.submittedAt !== null
    );
    if (allSectionsSubmitted) {
      submission.status = "completed";
    } else {
      submission.status = "partially-submitted";
    }

    await submission.save();

    res.json({
      message: `Nộp bài ${getSectionName(sectionType)} thành công`,
      sectionScore: sectionScore,
      totalScore: submission.totalScore,
      answers: gradedAnswers,
      status: submission.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== 6. XEM KẾT QUẢ SECTION (GENERIC - CHO TẤT CẢ CÁC PHẦN THI) ==================
exports.getSectionResult = async (req, res) => {
  try {
    const { examId, submissionId, sectionType } = req.params;
    const studentId = req.user._id;

    // Validate section type
    const validSectionTypes = ["reading", "listening", "writing", "speaking"];
    if (!validSectionTypes.includes(sectionType)) {
      return res.status(400).json({ message: "Loại phần thi không hợp lệ" });
    }

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm section và answer key
    const examSection = exam.sections.find(
      (section) => section.type === sectionType
    );

    if (!examSection) {
      return res.status(404).json({
        message: `Không tìm thấy phần ${getSectionName(sectionType)}`,
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

    // Tìm section submission
    const sectionSubmission = submission.sections.find(
      (s) => s.sectionType === sectionType
    );

    if (!sectionSubmission) {
      return res.status(404).json({
        message: `Chưa có bài làm cho phần ${getSectionName(sectionType)}`,
      });
    }

    if (!sectionSubmission.submittedAt) {
      return res.status(400).json({
        message: `Chưa nộp bài ${getSectionName(sectionType)}`,
      });
    }

    // Tạo kết quả chi tiết
    let detailedResults = [];

    if (sectionType === "reading" || sectionType === "listening") {
      // Reading và Listening: có answer key để so sánh
      const answerKey = examSection.answerKey || [];
      detailedResults = sectionSubmission.answers.map((answer) => {
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
    } else if (sectionType === "writing") {
      // Writing: hiển thị đáp án text và điểm (nếu đã chấm)
      const answerKey = examSection.answerKey || [];
      detailedResults = sectionSubmission.answers.map((answer) => {
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
    } else if (sectionType === "speaking") {
      // Speaking: hiển thị đáp án text, recording và điểm (nếu đã chấm)
      const answerKey = examSection.answerKey || [];
      detailedResults = sectionSubmission.answers.map((answer) => {
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
    }

    res.json({
      sectionType: sectionType,
      sectionScore: sectionSubmission.sectionScore,
      maxScore: examSection.maxScore || 0,
      totalScore: submission.totalScore,
      submittedAt: sectionSubmission.submittedAt,
      results: detailedResults,
      feedback: sectionSubmission.feedback || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== BACKWARD COMPATIBILITY - Giữ lại các hàm cũ để tương thích ==================
exports.getReadingSection = async (req, res) => {
  req.params.sectionType = "reading";
  return exports.getSection(req, res);
};

exports.submitReadingAnswers = async (req, res) => {
  req.params.sectionType = "reading";
  return exports.submitSectionAnswers(req, res);
};

exports.getReadingResult = async (req, res) => {
  req.params.sectionType = "reading";
  return exports.getSectionResult(req, res);
};

exports.getListeningSection = async (req, res) => {
  req.params.sectionType = "listening";
  return exports.getSection(req, res);
};

exports.submitListeningAnswers = async (req, res) => {
  req.params.sectionType = "listening";
  return exports.submitSectionAnswers(req, res);
};

exports.getListeningResult = async (req, res) => {
  req.params.sectionType = "listening";
  return exports.getSectionResult(req, res);
};

exports.getWritingSection = async (req, res) => {
  req.params.sectionType = "writing";
  return exports.getSection(req, res);
};

exports.submitWritingAnswers = async (req, res) => {
  req.params.sectionType = "writing";
  return exports.submitSectionAnswers(req, res);
};

exports.getWritingResult = async (req, res) => {
  req.params.sectionType = "writing";
  return exports.getSectionResult(req, res);
};

exports.getSpeakingSection = async (req, res) => {
  req.params.sectionType = "speaking";
  return exports.getSection(req, res);
};

exports.submitSpeakingAnswers = async (req, res) => {
  req.params.sectionType = "speaking";
  return exports.submitSectionAnswers(req, res);
};

exports.getSpeakingResult = async (req, res) => {
  req.params.sectionType = "speaking";
  return exports.getSectionResult(req, res);
};






