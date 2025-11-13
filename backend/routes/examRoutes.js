const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const upload = examController.uploadMiddleware;
const { verifyToken } = require("../middlewares/verifyToken");

// 🧠 Lấy danh sách bài thi (public)
router.get("/", examController.getAllExams);

// 🧩 Bắt đầu làm bài (protected - cần đăng nhập)
router.post("/start", verifyToken, examController.startExam);

// 📖 Lấy thông tin section Reading (protected) - phải đặt trước route /:id
router.get("/:examId/submissions/:submissionId/reading", verifyToken, examController.getReadingSection);

// 📝 Nộp đáp án Reading (protected)
router.post("/:examId/submissions/:submissionId/reading/submit", verifyToken, examController.submitReadingAnswers);

// 📊 Xem kết quả Reading (protected)
router.get("/:examId/submissions/:submissionId/reading/result", verifyToken, examController.getReadingResult);

// 🧠 Lấy thông tin bài thi theo ID (public) - đặt cuối để tránh conflict
router.get("/:id", examController.getExamById);

module.exports = router;
