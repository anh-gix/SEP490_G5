const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const upload = examController.uploadMiddleware;

// 🧠 Lấy danh sách bài thi
router.get("/", examController.getAllExams);

// 🧩 Bắt đầu làm bài
router.post("/start", examController.startExam);

// ✅ Lưu câu trả lời cho Reading/Listening
router.patch("/submissions/:submissionId/objective", examController.saveObjectiveAnswer);

// ✍️ Lưu bài viết Writing (text)
router.post("/submissions/:submissionId/writing", examController.saveWritingAnswer);

// 🎤 Upload file Speaking
router.post("/submissions/:submissionId/speaking", upload.single("file"), examController.uploadSpeakingRecording);

module.exports = router;
