const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middlewares/verifyToken');

// All routes are protected
router.use(verifyToken);

// REPORT ROUTES
router.get('/overview', reportController.getOverviewReport);
router.get('/students', reportController.getStudentReport);
router.get('/courses', reportController.getCourseReport);
router.get('/classes', reportController.getClassReport);
router.get('/rooms', reportController.getRoomReport);
router.get('/exams', reportController.getExamReport);
router.get('/teachers', reportController.getTeacherReport);
router.get('/financial', reportController.getFinancialReport);
router.get('/time-based', reportController.getTimeBasedReport);
router.get('/effectiveness', reportController.getEffectivenessReport);
router.get('/export', reportController.exportReports);

module.exports = router;
