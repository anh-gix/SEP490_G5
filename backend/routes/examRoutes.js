const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const upload = examController.uploadMiddleware;
const { verifyToken } = require("../middlewares/verifyToken");

// 🧠 Lấy danh sách bài thi (public)
router.get("/", examController.getAllExams);

// 🧩 Bắt đầu làm bài (protected - cần đăng nhập)
router.post("/start", verifyToken, examController.startExam);

// ================== GENERIC ROUTES - Hỗ trợ tất cả các phần thi (reading, listening, writing, speaking) ==================
// 📖 Lấy thông tin section (protected) - Generic route
router.get("/:examId/submissions/:submissionId/sections/:sectionType", verifyToken, examController.getSection);

// 📝 Nộp đáp án section (protected) - Generic route
router.post("/:examId/submissions/:submissionId/sections/:sectionType/submit", verifyToken, examController.submitSectionAnswers);

// 📊 Xem kết quả section (protected) - Generic route
router.get("/:examId/submissions/:submissionId/sections/:sectionType/result", verifyToken, examController.getSectionResult);

// ================== BACKWARD COMPATIBILITY - Giữ lại các routes cũ ==================
// 📖 Lấy thông tin section Reading (protected) - phải đặt trước route /:id
router.get("/:examId/submissions/:submissionId/reading", verifyToken, examController.getReadingSection);

// 📝 Nộp đáp án Reading (protected)
router.post("/:examId/submissions/:submissionId/reading/submit", verifyToken, examController.submitReadingAnswers);

// 📊 Xem kết quả Reading (protected)
router.get("/:examId/submissions/:submissionId/reading/result", verifyToken, examController.getReadingResult);

// 🎧 Lấy thông tin section Listening (protected)
router.get("/:examId/submissions/:submissionId/listening", verifyToken, examController.getListeningSection);

// 📝 Nộp đáp án Listening (protected)
router.post("/:examId/submissions/:submissionId/listening/submit", verifyToken, examController.submitListeningAnswers);

// 📊 Xem kết quả Listening (protected)
router.get("/:examId/submissions/:submissionId/listening/result", verifyToken, examController.getListeningResult);

// ✍️ Lấy thông tin section Writing (protected)
router.get("/:examId/submissions/:submissionId/writing", verifyToken, examController.getWritingSection);

// 📝 Nộp đáp án Writing (protected) - chỉ lưu text từ textarea
router.post("/:examId/submissions/:submissionId/writing/submit", verifyToken, examController.submitWritingAnswers);

// 📊 Xem kết quả Writing (protected)
router.get("/:examId/submissions/:submissionId/writing/result", verifyToken, examController.getWritingResult);

// 🎤 Lấy thông tin section Speaking (protected)
router.get("/:examId/submissions/:submissionId/speaking", verifyToken, examController.getSpeakingSection);

// 📝 Nộp đáp án Speaking (protected) - có thể upload recording
router.post("/:examId/submissions/:submissionId/speaking/submit", verifyToken, upload.single("recording"), examController.submitSpeakingAnswers);

// 📊 Xem kết quả Speaking (protected)
router.get("/:examId/submissions/:submissionId/speaking/result", verifyToken, examController.getSpeakingResult);

// 🧠 Lấy thông tin bài thi theo ID (public) - đặt cuối để tránh conflict
router.get("/:id", examController.getExamById);

module.exports = router;
