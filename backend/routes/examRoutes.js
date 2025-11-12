const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const upload = examController.uploadMiddleware;



// 🧠 Lấy danh sách bài thi (với pagination và filters)
router.get("/", examController.getAllExams);

// lấy thông tin chi tiết
router.get("/:id", examController.getExamById);
// publish/unpublish bài thi
router.post("/:id/publish", examController.publishExam);
router.post("/:id/unpublish", examController.unpublishExam);
//danh sách bài làm
router.get("/:id/submissions", examController.getExamSubmissions);

// 🧩 Bắt đầu làm bài
router.post("/start", examController.startExam);

// ✅ Lưu câu trả lời cho Reading/Listening
router.patch("/submissions/:submissionId/objective", examController.saveObjectiveAnswer);

// ✍️ Lưu bài viết Writing (text)
router.post("/submissions/:submissionId/writing", examController.saveWritingAnswer);

// 🎤 Upload file Speaking
router.post("/submissions/:submissionId/speaking", upload.single("file"), examController.uploadSpeakingRecording);

module.exports = router;
