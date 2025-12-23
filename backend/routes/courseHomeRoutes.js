const express = require("express");
const router = express.Router();
const courseHomeController = require("../controllers/courseHomeController");
const { verifyToken } = require("../middlewares/verifyToken");

// Public course listing filtered by type (IELTS/TOEIC/CAM)
router.get("/by-type", verifyToken, courseHomeController.getCoursesByType);

// Course detail for marketing site (includes sessions & CAM sessions)
router.get(
  "/course-home/:id",
  verifyToken,
  courseHomeController.getCourseDetails
);

// Single CAM session detail within a course
router.get(
  "/course-home/:courseId/cam-session/:sessionId",
  verifyToken,
  courseHomeController.getCamSessionDetails
);

module.exports = router;
