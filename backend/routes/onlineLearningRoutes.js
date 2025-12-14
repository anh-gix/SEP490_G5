const express = require("express");
const router = express.Router();
const onlineLearningController = require("../controllers/onlineLearningController");
const { verifyToken, isStudent } = require("../middlewares/verifyToken");

// ========================
//  ONLINE LEARNING ROUTES
// ========================

// Get student's enrolled online courses
router.get(
  "/courses",
  verifyToken,
  isStudent,
  onlineLearningController.getMyOnlineCourses
);

// Get course detail with sessions
router.get(
  "/courses/:courseId",
  verifyToken,
  isStudent,
  onlineLearningController.getCourseDetail
);

// Get session content (video, quiz, vocabulary)
router.get(
  "/courses/:courseId/sessions/:sessionId",
  verifyToken,
  isStudent,
  onlineLearningController.getSessionContent
);

// Get course progress overview
router.get(
  "/progress/:courseId",
  verifyToken,
  isStudent,
  onlineLearningController.getCourseProgress
);

// Update progress for a session
router.put(
  "/progress/:courseId/sessions/:sessionId",
  verifyToken,
  isStudent,
  onlineLearningController.updateProgress
);

module.exports = router;
