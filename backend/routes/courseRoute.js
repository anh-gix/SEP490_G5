const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController'); 

//danh sachs chowf phee duyeejt
router.get('/pending', courseController.getPendingCourses);

//lấy chi tiết giáo trình
router.get('/:id/details', courseController.getCourseDetails);

//phê duyệt
router.patch('/:id/approve', courseController.approveCourse);

//yêu cầu chỉnh sửa
router.patch('/:id/revise', courseController.requestRevision);

module.exports = router;

