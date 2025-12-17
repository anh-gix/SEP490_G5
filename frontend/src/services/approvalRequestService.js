/**
 * Approval Request Service (UPDATED - Now uses WorkRequest API)
 *
 * This file has been updated to use the new WorkRequest API while maintaining
 * backward compatibility with existing components.
 *
 * MIGRATION NOTE:
 * - Old API: /api/approval-requests (still works for backward compatibility)
 * - New API: /api/work-requests (recommended)
 * - This service now uses workRequestService under the hood
 * - Field mapping is handled automatically (submittedBy → requestedBy, etc.)
 *
 * FOR NEW COMPONENTS:
 * - Import workRequestService directly: import { workRequestService } from './workRequestService'
 * - Use new field names: requestedBy, processedBy, requestedAt, processedAt, etc.
 */

import { workRequestService } from './workRequestService';

/**
 * Maps WorkRequest response to old ApprovalRequest format for backward compatibility
 */
function mapWorkRequestToApproval(workRequest) {
  if (!workRequest) return null;

  return {
    _id: workRequest._id,
    requestType: workRequest.requestType,
    entityType: workRequest.entityType,
    entityId: workRequest.entityId,

    // Map field names: new → old
    submittedBy: workRequest.requestedBy,
    submittedAt: workRequest.requestedAt,
    submissionNote: workRequest.requestNote,

    reviewedBy: workRequest.processedBy,
    reviewedAt: workRequest.processedAt,
    reviewNote: workRequest.responseNote,

    status: workRequest.status,
    rejectionReason: workRequest.rejectionReason,
    history: workRequest.history,

    createdAt: workRequest.createdAt,
    updatedAt: workRequest.updatedAt,

    // Include new fields for gradual migration
    __isWorkRequest: true,
    __originalData: workRequest
  };
}

function mapWorkRequestsToApprovals(workRequests) {
  if (!Array.isArray(workRequests)) return [];
  return workRequests.map(mapWorkRequestToApproval);
}

// Approval Request service functions (backward compatible)
export const approvalRequestService = {
  // =========================
  // SUBMIT FOR APPROVAL
  // =========================

  submitProgram: async (programId, data = {}) => {
    const response = await workRequestService.submitProgram(programId, data);
    return {
      ...response,
      data: mapWorkRequestToApproval(response.data)
    };
  },

  submitExam: async (examId, data = {}) => {
    const response = await workRequestService.submitExam(examId, data);
    return {
      ...response,
      data: mapWorkRequestToApproval(response.data)
    };
  },

  // =========================
  // GET REQUESTS
  // =========================

  getPendingRequests: async (params = {}) => {
    const response = await workRequestService.getPendingRequests(params);
    return {
      ...response,
      data: mapWorkRequestsToApprovals(response.data)
    };
  },

  getMyRequests: async (params = {}) => {
    const response = await workRequestService.getMyRequests(params);
    return {
      ...response,
      data: mapWorkRequestsToApprovals(response.data)
    };
  },

  getRequestById: async (id) => {
    const response = await workRequestService.getRequestById(id);
    return {
      ...response,
      data: mapWorkRequestToApproval(response.data)
    };
  },

  getApprovalHistory: async (params = {}) => {
    const response = await workRequestService.getApprovalHistory(params);
    return {
      ...response,
      data: mapWorkRequestsToApprovals(response.data)
    };
  },

  getStats: async () => {
    return await workRequestService.getStats({ direction: 'bottom_up' });
  },

  // =========================
  // APPROVE/REJECT
  // =========================

  approveRequest: async (id, data = {}) => {
    return await workRequestService.approveRequest(id, data);
  },

  rejectRequest: async (id, data) => {
    return await workRequestService.rejectRequest(id, data);
  },

  // =========================
  // CANCEL REQUEST
  // =========================

  cancelRequest: async (id, data = {}) => {
    return await workRequestService.cancelRequest(id, data);
  }
};

export default approvalRequestService;
