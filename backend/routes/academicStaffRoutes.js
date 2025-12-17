const express = require('express');
const router = express.Router();
const academicStaffController = require('../controllers/academicStaffController');
const academicDashboardController = require('../controllers/academicDashboardController');
const { verifyToken, isAcademicStaff } = require('../middlewares/verifyToken');

// All routes are protected
router.use(verifyToken);
router.use(isAcademicStaff);

// Dashboard
router.get('/dashboard', academicDashboardController.getDashboardData);

// Change Request Management
router.put('/change-requests/:id/approve', academicStaffController.approveChangeRequest);
router.put('/change-requests/:id/reject', academicStaffController.rejectChangeRequest);
router.put('/change-requests/:id/revert', academicStaffController.revertChangeRequest);

// Attendance Management
router.get('/class-schedules/:classScheduleId/attendance', academicStaffController.getAttendanceByClassSchedule);

module.exports = router;

