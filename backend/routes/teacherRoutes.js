const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const teacherDashboardController = require('../controllers/teacherDashboardController');
const { verifyToken, isTeacher } = require('../middlewares/verifyToken');

// Teacher current user routes (require authentication)
router.get('/me', verifyToken, isTeacher, teacherController.getCurrentTeacher);
router.get('/me/dashboard', verifyToken, isTeacher, teacherDashboardController.getTeacherDashboard);
router.get('/me/schedule', verifyToken, isTeacher, teacherController.getCurrentTeacherSchedule);
router.get('/me/classes', verifyToken, isTeacher, teacherController.getMyClasses);
router.get('/me/classes/:classId', verifyToken, isTeacher, teacherController.getMyClassDetail);
router.get('/me/lessons/:scheduleId', verifyToken, isTeacher, teacherController.getLessonDetail);
router.put('/me/mocktest/:scheduleId/student/:studentId', verifyToken, isTeacher, teacherController.updateMocktestScore);
router.post('/me/attendance/:scheduleId', verifyToken, isTeacher, teacherController.saveAttendance);

// Teacher CRUD (admin routes)
router.get('/', teacherController.getAllTeachers);
router.get('/stats', teacherController.getTeacherStats);
router.get('/:id', teacherController.getTeacherById);
router.get('/:id/schedule', teacherController.getTeacherSchedule);
router.post('/', teacherController.createTeacher);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
