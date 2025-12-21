const express = require('express');
const router = express.Router();
const centerHeadController = require('../controllers/centerHeadController');

// =========================
// DASHBOARD ROUTES
// =========================

// Get all dashboard data (stats, pending requests, pending activation, recent activities)
router.get('/dashboard', centerHeadController.getDashboard);

// Get dashboard statistics only
router.get('/dashboard/stats', centerHeadController.getDashboardStats);

// Get pending work requests for approval
router.get('/dashboard/pending-requests', centerHeadController.getPendingRequests);

// Get items pending activation/publish
router.get('/dashboard/pending-activation', centerHeadController.getPendingActivation);

// Get recent activities
router.get('/dashboard/recent-activities', centerHeadController.getRecentActivities);

// =========================
// ACTIVATE/PUBLISH ROUTES
// =========================

// Programs
router.post('/programs/:id/activate', centerHeadController.activateProgram);
router.post('/programs/:id/deactivate', centerHeadController.deactivateProgram);

// Courses
router.post('/courses/:id/activate', centerHeadController.activateCourse);
router.post('/courses/:id/deactivate', centerHeadController.deactivateCourse);

// Exams
router.post('/exams/:id/publish', centerHeadController.publishExam);
router.post('/exams/:id/unpublish', centerHeadController.unpublishExam);

// =========================
// LEGACY ROUTES (backward compatibility)
// =========================

// Pending approvals
router.get('/courses/pending', centerHeadController.getPendingCourses);
router.get('/schedules/pending', centerHeadController.getPendingSchedules);

// Approval actions
router.post('/courses/:id/approve', centerHeadController.approveCourse);
router.post('/courses/:id/reject', centerHeadController.rejectCourse);
router.post('/schedules/:id/approve', centerHeadController.approveSchedule);
router.post('/schedules/:id/reject', centerHeadController.rejectSchedule);

module.exports = router;
