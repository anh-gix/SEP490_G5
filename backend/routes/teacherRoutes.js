const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const teacherDashboardController = require('../controllers/teacherDashboardController');
const { verifyToken, isTeacher, isTeacherOrSubjectLeader } = require('../middlewares/verifyToken');

// Teacher current user routes (require authentication)
router.get('/me', verifyToken, isTeacherOrSubjectLeader, teacherController.getCurrentTeacher);
router.get('/me/dashboard', verifyToken, isTeacherOrSubjectLeader, teacherDashboardController.getTeacherDashboard);
router.get('/me/schedule', verifyToken, isTeacherOrSubjectLeader, teacherController.getCurrentTeacherSchedule);
router.get('/me/classes', verifyToken, isTeacherOrSubjectLeader, teacherController.getMyClasses);
router.get('/me/classes/:classId', verifyToken, isTeacherOrSubjectLeader, teacherController.getMyClassDetail);
router.get('/me/lessons/:scheduleId', verifyToken, isTeacherOrSubjectLeader, teacherController.getLessonDetail);
router.put('/me/mocktest/:scheduleId/student/:studentId', verifyToken, isTeacherOrSubjectLeader, teacherController.updateMocktestScore);
router.post('/me/attendance/:scheduleId', verifyToken, isTeacherOrSubjectLeader, teacherController.saveAttendance);

// Teacher CRUD (admin routes)
router.get('/', teacherController.getAllTeachers);
router.get('/stats', teacherController.getTeacherStats);
router.get('/:id', teacherController.getTeacherById);
router.get('/:id/schedule', teacherController.getTeacherSchedule);
router.post('/', teacherController.createTeacher);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);
router.post('/import', teacherController.importTeachers);

module.exports = router;
