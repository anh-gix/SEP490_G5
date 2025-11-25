const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');



// Lấy tất cả courses đã được phê duyệt
router.get('/', courseController.getAllCourses);

// COURSE APPROVAL WORKFLOW ROUTES (specific routes must come first)
router.get('/pending', courseController.getPendingCourses);
router.get('/:id/details', courseController.getCourseDetails);
router.patch('/:id/approve', courseController.approveCourse);
router.patch('/:id/revise', courseController.requestRevision);

// PROGRAM HEAD: ACCEPT/REJECT COURSE TO PROGRAM
router.patch('/:id/accept', courseController.acceptCourseToProgram);
router.patch('/:id/reject', courseController.rejectCourseFromProgram);

// COURSE CRUD ROUTES (dynamic routes come after)
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;

