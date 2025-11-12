const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');


// REPORT ROUTES
router.get('/students', reportController.getStudentReport);
router.get('/courses', reportController.getCourseReport);
router.get('/classes', reportController.getClassReport);
router.get('/rooms', reportController.getRoomReport);
router.get('/exams', reportController.getExamReport);
router.get('/effectiveness', reportController.getEffectivenessReport);
router.get('/export', reportController.exportReports);

module.exports = router;
