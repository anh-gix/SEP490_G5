const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController'); 

// Lấy band từ type và level - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
// Lấy tất cả mappings
// Lấy types theo level

//danh sachs chowf phee duyeejt
router.get('/pending', courseController.getPendingCourses);

// Lấy danh sách tất cả types - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/all-types', courseController.getAllTypes);

// Lấy danh sách tất cả levels - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/all-levels', courseController.getAllLevels);

// Lấy danh sách levels theo type - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/levels', courseController.getLevelsByType);

// Lấy danh sách courses theo program name và level - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/by-program', courseController.getCoursesByProgram);

// Lấy band từ type và level - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/band', courseController.getBandByTypeAndLevel);

//lấy chi tiết giáo trình
router.get('/:id/details', courseController.getCourseDetails);

//phê duyệt
router.patch('/:id/approve', courseController.approveCourse);

//yêu cầu chỉnh sửa
router.patch('/:id/revise', courseController.requestRevision);

module.exports = router;

