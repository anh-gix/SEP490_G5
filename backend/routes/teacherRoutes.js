const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken, isTeacher } = require('../middlewares/verifyToken');

// Teacher current user routes (require authentication)
router.get('/me', verifyToken, isTeacher, teacherController.getCurrentTeacher);
router.get('/me/schedule', verifyToken, isTeacher, teacherController.getCurrentTeacherSchedule);
router.get('/me/lessons/:scheduleId', verifyToken, isTeacher, teacherController.getLessonDetail);

// Teacher CRUD (admin routes)
router.get('/', teacherController.getAllTeachers);
router.get('/stats', teacherController.getTeacherStats);
router.get('/:id', teacherController.getTeacherById);
router.get('/:id/schedule', teacherController.getTeacherSchedule);
router.post('/', teacherController.createTeacher);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
