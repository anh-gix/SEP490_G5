const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');



// Lấy tất cả courses đã được phê duyệt
router.get('/', courseController.getAllCourses);

// COURSE APPROVAL WORKFLOW ROUTES (specific routes must come first)
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

// Lấy tất cả mappings (type, level, band) - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/mappings', courseController.getCourseMappings);

// Lấy types theo level - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/types-by-level', courseController.getTypesByLevel);

// PLO MAPPING ROUTES - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/:id/program-plos', courseController.getProgramPLOs);
router.put('/:id/map-plos', courseController.updateCoursePLOMapping);

//lấy chi tiết giáo trình
router.get('/:id/details', courseController.getCourseById);

// COURSE APPROVAL WORKFLOW ROUTES
router.patch('/:id/submit', courseController.submitCourse);
router.patch('/:id/approve', courseController.approveCourse);
router.patch('/:id/reject', courseController.rejectCourse);
router.patch('/:id/archive', courseController.archiveCourse);

// COURSE CRUD ROUTES (dynamic routes come after)
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;

