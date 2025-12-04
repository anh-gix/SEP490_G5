const express = require('express');
const router = express.Router();
const courseHomeController = require('../controllers/courseHomeController');

// Public course listing filtered by type (IELTS/TOEIC/CAM)
router.get('/by-type', courseHomeController.getCoursesByType);

// Course detail for marketing site (includes sessions & CAM sessions)
router.get('/course-home/:id', courseHomeController.getCourseDetails);

// Single CAM session detail within a course
router.get(
  '/course-home/:courseId/cam-session/:sessionId',
  courseHomeController.getCamSessionDetails
);

module.exports = router;