const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const courseHomeController = require('../controllers/courseHomeController'); 


// Lấy tất cả courses đã được phê duyệt
router.get('/', courseController.getAllCourses);

//danh sachs chowf phee duyeejt
router.get('/pending', courseController.getPendingCourses);

// Lấy các khóa học theo type (ielts, toeic, cam)
router.get('/by-type', courseHomeController.getCoursesByType);
router.get('/course-home/:id', courseHomeController.getCourseDetails);
router.get('/course-home/:courseId/cam-session/:sessionId', courseHomeController.getCamSessionDetails);

//lấy chi tiết giáo trình
router.get('/:id/details', courseController.getCourseDetails);

//phê duyệt
router.patch('/:id/approve', courseController.approveCourse);

//yêu cầu chỉnh sửa
router.patch('/:id/revise', courseController.requestRevision);

module.exports = router;

