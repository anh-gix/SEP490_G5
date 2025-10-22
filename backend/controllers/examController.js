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
