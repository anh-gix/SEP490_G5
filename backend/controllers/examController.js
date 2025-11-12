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

// ================== 1. LẤY DANH SÁCH BÀI THI ==================
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

    // Tìm section reading
    const readingSection = exam.sections.find(
      (section) => section.type === "reading"
    );

    if (!readingSection) {
      return res.status(404).json({ message: "Không tìm thấy phần Reading" });
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
      (s) => s.sectionType === "reading"
    );

    // Nếu chưa có, tạo mới
    if (!sectionSubmission) {
      sectionSubmission = {
        sectionType: "reading",
        submittedAt: null,
        answers: [],
        sectionScore: 0,
      };
      submission.sections.push(sectionSubmission);
      await submission.save();
      sectionSubmission = submission.sections[submission.sections.length - 1];
    }

    // Trả về thông tin section (không bao gồm answer key)
    res.json({
      section: {
        type: readingSection.type,
        fileUrl: readingSection.fileUrl,
        instructions: readingSection.instructions,
        duration: readingSection.duration,
        questionCount: readingSection.questionCount,
        maxScore: readingSection.maxScore,
      },
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

// ================== 5. NỘP ĐÁP ÁN READING ==================
exports.submitReadingAnswers = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    const { answers } = req.body; // answers là mảng: [{ questionNumber: 1, selectedOption: "A" }, ...]
    const studentId = req.user._id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Vui lòng cung cấp đáp án" });
    }

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm section reading và answer key
    const readingSection = exam.sections.find(
      (section) => section.type === "reading"
    );

    if (!readingSection) {
      return res.status(404).json({ message: "Không tìm thấy phần Reading" });
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
      (s) => s.sectionType === "reading"
    );

    if (sectionIndex === -1) {
      return res.status(404).json({
        message: "Không tìm thấy phần Reading trong bài làm",
      });
    }

    // Chấm điểm tự động
    const answerKey = readingSection.answerKey || [];
    let sectionScore = 0;
    const gradedAnswers = answers.map((answer) => {
      const correctAnswer = answerKey.find(
        (key) => key.questionNumber === answer.questionNumber
      );

      let score = 0;
      if (correctAnswer && correctAnswer.correctAnswer === answer.selectedOption) {
        score = correctAnswer.maxScore || 1;
        sectionScore += score;
      }

      return {
        questionNumber: answer.questionNumber,
        selectedOption: answer.selectedOption,
        score: score,
      };
    });

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
      message: "Nộp bài Reading thành công",
      sectionScore: sectionScore,
      totalScore: submission.totalScore,
      answers: gradedAnswers,
      status: submission.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== 6. XEM KẾT QUẢ READING ==================
exports.getReadingResult = async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    const studentId = req.user._id;

    // Kiểm tra exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Tìm section reading và answer key
    const readingSection = exam.sections.find(
      (section) => section.type === "reading"
    );

    if (!readingSection) {
      return res.status(404).json({ message: "Không tìm thấy phần Reading" });
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
      (s) => s.sectionType === "reading"
    );

    if (!sectionSubmission) {
      return res.status(404).json({
        message: "Chưa có bài làm cho phần Reading",
      });
    }

    if (!sectionSubmission.submittedAt) {
      return res.status(400).json({
        message: "Chưa nộp bài Reading",
      });
    }

    // Tạo kết quả chi tiết với đáp án đúng
    const answerKey = readingSection.answerKey || [];
    const detailedResults = sectionSubmission.answers.map((answer) => {
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

    res.json({
      sectionType: "reading",
      sectionScore: sectionSubmission.sectionScore,
      maxScore: readingSection.maxScore || 0,
      totalScore: submission.totalScore,
      submittedAt: sectionSubmission.submittedAt,
      results: detailedResults,
      feedback: sectionSubmission.feedback || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};






