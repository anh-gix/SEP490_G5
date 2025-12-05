const express = require('express');
const router = express.Router();
const workRequestController = require('../controllers/workRequestController');

// =========================
// CREATE TOP-DOWN REQUEST (CENTER HEAD)
// =========================

// Create top-down work request (task assignment)
router.post(
  '/create',
  workRequestController.createTopDownRequest
);

// =========================
// SUBMIT FOR APPROVAL (BOTTOM-UP)
// =========================

// Submit program for approval
router.post(
  '/submit/program/:programId',
  workRequestController.submitProgram
);

// Submit exam for approval
router.post(
  '/submit/exam/:examId',
  workRequestController.submitExam
);

// =========================
// GET REQUESTS
// =========================

// Get all work requests with filters
router.get(
  '/',
  workRequestController.getAllRequests
);

// Get my submitted requests
router.get(
  '/my-requests',
  workRequestController.getMyRequests
);

// Get requests assigned to me
router.get(
  '/assigned-to-me',
  workRequestController.getAssignedToMe
);

// Get work request statistics
router.get(
  '/stats',
  workRequestController.getStats
);

// Get request by ID
router.get(
  '/:id',
  workRequestController.getRequestById
);

// =========================
// APPROVE/REJECT (CENTER HEAD)
// =========================

// Approve request
router.post(
  '/:id/approve',
  workRequestController.approveRequest
);

// Reject request
router.post(
  '/:id/reject',
  workRequestController.rejectRequest
);

// Revoke approval (thu hồi phê duyệt)
router.post(
  '/:id/revoke',
  workRequestController.revokeApproval
);

// =========================
// CANCEL REQUEST
// =========================

// Cancel pending request
router.delete(
  '/:id/cancel',
  workRequestController.cancelRequest
);

module.exports = router;