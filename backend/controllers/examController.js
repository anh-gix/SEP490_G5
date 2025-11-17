const Exam = require("../models/examModel");
const Submission = require("../models/submissionModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

const upload = multer({ storage });
exports.uploadMiddleware = upload;

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

    // Trả về thông tin section với questionType cho mỗi câu hỏi (không bao gồm answer key)
    const questions = examSection.answerKey?.map((key) => ({
      questionNumber: key.questionNumber,
      questionType: key.questionType,
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
    // req.files: multiple files upload (nếu dùng upload.array hoặc upload.fields)
    const uploadedFiles = {};
    if (req.file) {
      // Single file upload
      uploadedFiles.default = `/uploads/${req.file.filename}`;
    } else if (req.files) {
      // Multiple files upload
      if (Array.isArray(req.files)) {
        req.files.forEach((file, index) => {
          uploadedFiles[`file_${index}`] = `/uploads/${file.filename}`;
        });
      } else {
        // req.files là object với các field names
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
          const studentAnswer = answer.selectedOption || answer.answerText || "";
          const correctAns = correctAnswer.correctAnswer || "";

          // Chấm điểm theo loại câu hỏi
          switch (correctAnswer.questionType) {
            case "multiple_choice":
              // So sánh chính xác (case-insensitive)
              isCorrect = studentAnswer.trim().toUpperCase() === correctAns.trim().toUpperCase();
              break;
            case "input":
              // So sánh text (case-insensitive, trim whitespace)
              isCorrect = studentAnswer.trim().toLowerCase() === correctAns.trim().toLowerCase();
              break;
            case "true_false":
              // So sánh True/False (case-insensitive)
              isCorrect = studentAnswer.trim().toLowerCase() === correctAns.trim().toLowerCase();
              break;
            default:
              // Mặc định so sánh chính xác
              isCorrect = studentAnswer.trim() === correctAns.trim();
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
          studentAnswer: answer.selectedOption,
          correctAnswer: correctAnswer ? correctAnswer.correctAnswer : null,
          score: answer.score,
          maxScore: correctAnswer ? correctAnswer.maxScore || 1 : 0,
          isCorrect: answer.score > 0,
        };
      });
    } else if (sectionType === "writing") {
      // Writing: hiển thị đáp án text và điểm (nếu đã chấm)
      detailedResults = sectionSubmission.answers.map((answer) => ({
        questionNumber: answer.questionNumber,
        studentAnswer: answer.answerText || answer.selectedOption || "",
        score: answer.score || 0,
        maxScore: 0, // Sẽ được cập nhật khi chấm
        isCorrect: null, // Không áp dụng cho writing
      }));
    } else if (sectionType === "speaking") {
      // Speaking: hiển thị đáp án text, recording và điểm (nếu đã chấm)
      detailedResults = sectionSubmission.answers.map((answer) => ({
        questionNumber: answer.questionNumber,
        studentAnswer: answer.answerText || answer.selectedOption || "",
        recordingUrl: answer.recordingUrl || null,
        score: answer.score || 0,
        maxScore: 0, // Sẽ được cập nhật khi chấm
        isCorrect: null, // Không áp dụng cho speaking
      }));
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






