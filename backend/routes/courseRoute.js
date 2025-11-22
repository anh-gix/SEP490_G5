const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController'); 

// Lấy band từ type và level - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
// Lấy tất cả mappings
// Lấy types theo level

//danh sachs chowf phee duyeejt
router.get('/pending', courseController.getPendingCourses);

//lấy chi tiết giáo trình
router.get('/:id/details', courseController.getCourseDetails);

//phê duyệt
router.patch('/:id/approve', courseController.approveCourse);

//yêu cầu chỉnh sửa
router.patch('/:id/revise', courseController.requestRevision);

module.exports = router;

