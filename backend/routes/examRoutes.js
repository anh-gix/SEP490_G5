const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const upload = examController.uploadMiddleware;
const { verifyToken } = require("../middlewares/verifyToken");

// ================== CENTER HEAD - EXAM MANAGEMENT ROUTES ==================
router.get("/management", examController.getAllExamsForManagement);
router.get("/management/:id", examController.getExamByIdForManagement);
router.post("/management", examController.createExamForManagement);
router.put("/management/:id", examController.updateExamForManagement);
router.delete("/management/:id", examController.deleteExamForManagement);
router.post("/management/:id/publish", examController.publishExamForManagement);
router.post("/management/:id/unpublish", examController.unpublishExamForManagement);
router.post("/management/upload-answer-key", upload.single("file"), examController.uploadAnswerKeyForManagement);

// Helper route to check exam submission status
router.get("/management/:id/submission-status", examController.getExamSubmissionStatus);

// ================== TEACHER - EXAM SUBMISSION ROUTES ==================
// Nộp exam chờ duyệt
router.post("/management/:id/submit-for-approval", examController.submitExamForApproval);

// Lấy danh sách exam đã nộp của teacher (protected)
router.get("/my-exams", verifyToken, examController.getMySubmittedExams);

// Rút lại exam đang chờ duyệt
router.post("/management/:id/withdraw", examController.withdrawExamSubmission);

// ================== STUDENT - PUBLIC EXAM ROUTES ==================
// 🧠 Lấy danh sách bài thi (public)
router.get("/", examController.getAllExams);

// 🧩 Bắt đầu làm bài (protected - cần đăng nhập)
router.post("/start", verifyToken, examController.startExam);

// 🧩 Tạo submission mới (làm lại) (protected - cần đăng nhập)
router.post("/create-new-submission", verifyToken, examController.createNewSubmission);

// 🧩 Lấy danh sách submissions của một exam (protected)
router.get("/:examId/submissions", verifyToken, examController.getExamSubmissions);

// ================== SECTION ROUTES - Mỗi section type có route riêng ==================
//  Lấy thông tin section Reading (protected) - phải đặt trước route /:id
router.get("/:examId/submissions/:submissionId/reading", verifyToken, examController.getReadingSection);

//  Nộp đáp án Reading (protected)
router.post("/:examId/submissions/:submissionId/reading/submit", verifyToken, examController.submitReadingAnswers);

//  Xem kết quả Reading (protected)
router.get("/:examId/submissions/:submissionId/reading/result", verifyToken, examController.getReadingResult);

//  Lấy thông tin section Listening (protected)
router.get("/:examId/submissions/:submissionId/listening", verifyToken, examController.getListeningSection);

//  Nộp đáp án Listening (protected)
router.post("/:examId/submissions/:submissionId/listening/submit", verifyToken, examController.submitListeningAnswers);

//  Xem kết quả Listening (protected)
router.get("/:examId/submissions/:submissionId/listening/result", verifyToken, examController.getListeningResult);

//  Lấy thông tin section Writing (protected)
router.get("/:examId/submissions/:submissionId/writing", verifyToken, examController.getWritingSection);

//  Nộp đáp án Writing (protected) - chỉ lưu text từ textarea
router.post("/:examId/submissions/:submissionId/writing/submit", verifyToken, examController.submitWritingAnswers);

//  Xem kết quả Writing (protected)
router.get("/:examId/submissions/:submissionId/writing/result", verifyToken, examController.getWritingResult);

//  Lấy thông tin section Speaking (protected)
router.get("/:examId/submissions/:submissionId/speaking", verifyToken, examController.getSpeakingSection);

//  Nộp đáp án Speaking (protected) - có thể upload nhiều recording (mỗi câu một file)
router.post("/:examId/submissions/:submissionId/speaking/submit", verifyToken, upload.any(), examController.submitSpeakingAnswers);

//  Xem kết quả Speaking (protected)
router.get("/:examId/submissions/:submissionId/speaking/result", verifyToken, examController.getSpeakingResult);

// 🧠 Lấy thông tin bài thi theo ID (public) - đặt cuối để tránh conflict
router.get("/:id", examController.getExamById);

module.exports = router;
