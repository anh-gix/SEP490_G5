const express = require('express');
const router = express.Router();
const centerHeadController = require('../controllers/centerHeadController');

// DASHBOARD ROUTES
router.get('/dashboard/stats', centerHeadController.getDashboardStats);

// PENDING APPROVALS ROUTES
router.get('/courses/pending', centerHeadController.getPendingCourses);
router.get('/schedules/pending', centerHeadController.getPendingSchedules);

// APPROVAL ACTIONS ROUTES
router.post('/courses/:id/approve', centerHeadController.approveCourse);
router.post('/courses/:id/reject', centerHeadController.rejectCourse);
router.post('/schedules/:id/approve', centerHeadController.approveSchedule);
router.post('/schedules/:id/reject', centerHeadController.rejectSchedule);

module.exports = router;
