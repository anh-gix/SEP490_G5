const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const upload = examController.uploadMiddleware;

// ==================== EXAM MANAGEMENT ====================

router.get("/", examController.getAllExams);


router.post("/", examController.createExam);


router.get("/:id", examController.getExamById);


router.put("/:id", examController.updateExam);


router.delete("/:id", examController.deleteExam);

router.post("/:id/publish", examController.publishExam);
router.post("/:id/unpublish", examController.unpublishExam);

// upload pdf/doc file for exam
router.post("/upload/exam-file", upload.single("file"), examController.uploadExamFile);

// upload audio file for listening section
router.post("/upload/audio", upload.single("file"), examController.uploadAudioFile);

// upload csv answer key
router.post("/upload/answer-key", upload.single("file"), examController.uploadAnswerKeyCSV);


// 🧩 Bắt đầu làm bài
router.post("/start", examController.startExam);

//danh sách bài làm
router.get("/:id/submissions", examController.getExamSubmissions);

// ✅ Lưu câu trả lời cho Reading/Listening
router.patch("/submissions/:submissionId/objective", examController.saveObjectiveAnswer);

// ✍️ Lưu bài viết Writing (text)
router.post("/submissions/:submissionId/writing", examController.saveWritingAnswer);

// 🎤 Upload file Speaking
router.post("/submissions/:submissionId/speaking", upload.single("file"), examController.uploadSpeakingRecording);

module.exports = router;
