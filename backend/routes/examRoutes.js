const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const upload = examController.uploadMiddleware;
const { verifyToken, isStudent, isSubjectLeader,   } = require("../middlewares/verifyToken");

// ================== CENTER HEAD - EXAM MANAGEMENT ROUTES ==================
router.get("/management", verifyToken,  examController.getAllExamsForManagement);
// My exams route for CenterHead - MUST be before :id route to avoid conflict
router.get("/management/my-exams", verifyToken, examController.getMyExamsForCenterHead);
router.get("/management/:id", verifyToken,   examController.getExamByIdForManagement);
router.post("/management", verifyToken,   examController.createExamForManagement);
router.put("/management/:id", verifyToken,   examController.updateExamForManagement);
router.delete("/management/:id", verifyToken,   examController.deleteExamForManagement);
router.post("/management/:id/publish", verifyToken,   examController.publishExamForManagement);
router.post("/management/:id/unpublish", verifyToken,  examController.unpublishExamForManagement);
router.post("/management/upload-answer-key", verifyToken,   upload.single("file"), examController.uploadAnswerKeyForManagement);
router.post("/management/upload-exam-file", verifyToken,   upload.single("file"), examController.uploadExamFileForManagement);
router.post("/management/delete-exam-file", verifyToken,   examController.deleteExamFileForManagement);
// Complete exam - CenterHead hoàn thành exam draft
router.patch("/management/:id/complete", verifyToken, examController.completeExam);

// Helper route to check exam submission status
router.get("/management/:id/submission-status", verifyToken,   examController.getExamSubmissionStatus);

// ================== Subject Leader - EXAM SUBMISSION ROUTES ==================
// Nộp exam chờ duyệt
router.post("/management/:id/submit-for-approval", verifyToken, isSubjectLeader, examController.submitExamForApproval);

// Lấy danh sách exam đã nộp của teacher (protected)
router.get("/my-exams", verifyToken, isSubjectLeader, examController.getMySubmittedExams);

// Rút lại exam đang chờ duyệt
router.post("/management/:id/withdraw", verifyToken, isSubjectLeader, examController.withdrawExamSubmission);

// ================== STUDENT - PUBLIC EXAM ROUTES ==================
// 🧠 Lấy danh sách bài thi (public)
router.get("/", examController.getAllExams);

// 🧩 Bắt đầu làm bài (protected - cần đăng nhập)
router.post("/start", verifyToken,isStudent, examController.startExam);

// 🧩 Tạo submission mới (làm lại) (protected - cần đăng nhập)
router.post("/create-new-submission", verifyToken, isStudent, examController.createNewSubmission);

// 🧩 Lấy danh sách submissions của một exam (protected)
router.get("/:examId/submissions", verifyToken, isStudent, examController.getExamSubmissions);

// ================== SECTION ROUTES - Mỗi section type có route riêng ==================
//  Lấy thông tin section Reading (protected) - phải đặt trước route /:id
router.get("/:examId/submissions/:submissionId/reading", verifyToken, isStudent, examController.getReadingSection);

//  Nộp đáp án Reading (protected)
router.post("/:examId/submissions/:submissionId/reading/submit", verifyToken, isStudent, examController.submitReadingAnswers);

//  Xem kết quả Reading (protected)
router.get("/:examId/submissions/:submissionId/reading/result", verifyToken, isStudent, examController.getReadingResult);

//  Lấy thông tin section Listening (protected)
router.get("/:examId/submissions/:submissionId/listening", verifyToken, isStudent, examController.getListeningSection);

//  Nộp đáp án Listening (protected)
router.post("/:examId/submissions/:submissionId/listening/submit", verifyToken, isStudent, examController.submitListeningAnswers);

//  Xem kết quả Listening (protected)
router.get("/:examId/submissions/:submissionId/listening/result", verifyToken, isStudent, examController.getListeningResult);

//  Lấy thông tin section Writing (protected)
router.get("/:examId/submissions/:submissionId/writing", verifyToken, isStudent, examController.getWritingSection);

//  Nộp đáp án Writing (protected) - chỉ lưu text từ textarea
router.post("/:examId/submissions/:submissionId/writing/submit", verifyToken, isStudent, examController.submitWritingAnswers);

//  Xem kết quả Writing (protected)
router.get("/:examId/submissions/:submissionId/writing/result", verifyToken, isStudent, examController.getWritingResult);

//  Lấy thông tin section Speaking (protected)
router.get("/:examId/submissions/:submissionId/speaking", verifyToken, isStudent, examController.getSpeakingSection);

//  Nộp đáp án Speaking (protected) - có thể upload nhiều recording (mỗi câu một file)
router.post("/:examId/submissions/:submissionId/speaking/submit", verifyToken, isStudent, upload.any(), examController.submitSpeakingAnswers);

//  Xem kết quả Speaking (protected)
router.get("/:examId/submissions/:submissionId/speaking/result", verifyToken, isStudent, examController.getSpeakingResult);

//  Lấy thông tin bài thi theo ID (public) - đặt cuối để tránh conflict
router.get("/:id", verifyToken, isStudent, examController.getExamById);

module.exports = router;
