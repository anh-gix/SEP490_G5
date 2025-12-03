const express = require('express');
const router = express.Router();
const approvalRequestController = require('../controllers/approvalRequestController');

// =========================
// SUBMIT FOR APPROVAL
// =========================

// Submit program for approval
router.post(
  '/submit/program/:programId',
  approvalRequestController.submitProgram
);

// Submit exam for approval
router.post(
  '/submit/exam/:examId',
  approvalRequestController.submitExam
);

// =========================
// GET REQUESTS
// =========================

// Get all pending requests
router.get(
  '/pending',
  approvalRequestController.getPendingRequests
);

// Get my submitted requests
router.get(
  '/my-requests',
  approvalRequestController.getMyRequests
);

// Get approval history
router.get(
  '/history',
  approvalRequestController.getApprovalHistory
);

// Get approval statistics
router.get(
  '/stats',
  approvalRequestController.getStats
);

// Get request by ID
router.get(
  '/:id',
  approvalRequestController.getRequestById
);

// =========================
// APPROVE/REJECT
// =========================

// Approve request
router.post(
  '/:id/approve',
  approvalRequestController.approveRequest
);

// Reject request
router.post(
  '/:id/reject',
  approvalRequestController.rejectRequest
);

// =========================
// CANCEL REQUEST
// =========================

// Cancel pending request
router.delete(
  '/:id/cancel',
  approvalRequestController.cancelRequest
);

module.exports = router;
