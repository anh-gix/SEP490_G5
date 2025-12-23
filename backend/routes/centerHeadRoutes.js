const express = require("express");
const router = express.Router();
const centerHeadController = require("../controllers/centerHeadController");
const { verifyToken } = require("../middlewares/verifyToken");
// =========================
// DASHBOARD ROUTES
// =========================

// Get all dashboard data (stats, pending requests, pending activation, recent activities)
router.get("/dashboard", verifyToken, centerHeadController.getDashboard);

// Get dashboard statistics only
router.get(
  "/dashboard/stats",
  verifyToken,
  centerHeadController.getDashboardStats
);

// Get pending work requests for approval
router.get(
  "/dashboard/pending-requests",
  verifyToken,
  centerHeadController.getPendingRequests
);

// Get items pending activation/publish
router.get(
  "/dashboard/pending-activation",
  verifyToken,
  centerHeadController.getPendingActivation
);

// Get recent activities
router.get(
  "/dashboard/recent-activities",
  verifyToken,
  centerHeadController.getRecentActivities
);

// =========================
// ACTIVATE/PUBLISH ROUTES
// =========================

// Programs
router.post(
  "/programs/:id/activate",
  verifyToken,
  centerHeadController.activateProgram
);
router.post(
  "/programs/:id/deactivate",
  verifyToken,
  centerHeadController.deactivateProgram
);

// Courses
router.post(
  "/courses/:id/activate",
  verifyToken,
  centerHeadController.activateCourse
);
router.post(
  "/courses/:id/deactivate",
  verifyToken,
  centerHeadController.deactivateCourse
);

// Exams
router.post(
  "/exams/:id/publish",
  verifyToken,
  centerHeadController.publishExam
);
router.post(
  "/exams/:id/unpublish",
  verifyToken,
  centerHeadController.unpublishExam
);

// =========================
// LEGACY ROUTES (backward compatibility)
// =========================

// Pending approvals
router.get(
  "/courses/pending",
  verifyToken,
  centerHeadController.getPendingCourses
);
router.get(
  "/schedules/pending",
  verifyToken,
  centerHeadController.getPendingSchedules
);

// Approval actions
router.post(
  "/courses/:id/approve",
  verifyToken,
  centerHeadController.approveCourse
);
router.post(
  "/courses/:id/reject",
  verifyToken,
  centerHeadController.rejectCourse
);
router.post(
  "/schedules/:id/approve",
  verifyToken,
  centerHeadController.approveSchedule
);
router.post(
  "/schedules/:id/reject",
  verifyToken,
  centerHeadController.rejectSchedule
);

module.exports = router;
