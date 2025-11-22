const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Reports
router.get('/overview', reportController.getOverviewReport);
router.get('/classes', reportController.getClassReport);
router.get('/students', reportController.getStudentReport);
router.get('/teachers', reportController.getTeacherReport);
router.get('/financial', reportController.getFinancialReport);
router.get('/time-based', reportController.getTimeBasedReport);

module.exports = router;
