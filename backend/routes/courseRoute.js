const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController'); 

// Lấy band từ type và level - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/band', courseController.getBandByTypeAndLevel);
// Lấy tất cả mappings
router.get('/mappings', courseController.getAllMappings);
// Lấy levels theo type
router.get('/levels', courseController.getLevelsByType);
// Lấy types theo level
router.get('/types', courseController.getTypesByLevel);
// Lấy tất cả types từ course
router.get('/all-types', courseController.getAllCourseTypes);
// Lấy tất cả levels từ course
router.get('/all-levels', courseController.getAllCourseLevels);
// Lấy courses theo program
router.get('/by-program', courseController.getCoursesByProgram);

//danh sachs chowf phee duyeejt
router.get('/pending', courseController.getPendingCourses);

//lấy chi tiết giáo trình
router.get('/:id/details', courseController.getCourseDetails);

//phê duyệt
router.patch('/:id/approve', courseController.approveCourse);

//yêu cầu chỉnh sửa
router.patch('/:id/revise', courseController.requestRevision);

module.exports = router;

