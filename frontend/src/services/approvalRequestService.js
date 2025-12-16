<<<<<<< HEAD
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/approval-requests';

// Approval Request service functions
=======
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
>>>>>>> origin/Namvv-teacher-class-management
export const approvalRequestService = {
  // =========================
  // SUBMIT FOR APPROVAL
  // =========================

<<<<<<< HEAD
  /**
   * Submit program for approval
   * @param {string} programId - Program ID
   * @param {object} data - { userId: string, note: string }
   */
  submitProgram: async (programId, data = {}) => {
    try {
      // Get userId from localStorage if not provided
      if (!data.userId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        data.userId = user._id;
      }

      const response = await axios.post(`${API_BASE_URL}/submit/program/${programId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể nộp chương trình' };
    }
  },

  /**
   * Submit exam for approval
   * @param {string} examId - Exam ID
   * @param {object} data - { userId: string, note: string }
   */
  submitExam: async (examId, data = {}) => {
    try {
      // Get userId from localStorage if not provided
      if (!data.userId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        data.userId = user._id;
      }

      const response = await axios.post(`${API_BASE_URL}/submit/exam/${examId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể nộp đề thi' };
    }
=======
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
>>>>>>> origin/Namvv-teacher-class-management
  },

  // =========================
  // GET REQUESTS
  // =========================

<<<<<<< HEAD
  /**
   * Get all pending approval requests (Center Head)
   * @param {object} params - { type: 'program' | 'exam', status: 'pending' | 'approved' | 'rejected', fromDate: string, toDate: string, page: number, limit: number }
   */
  getPendingRequests: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pending`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách yêu cầu' };
    }
  },

  /**
   * Get my submitted requests (Subject Leader)
   * @param {object} params - { userId: string, status: 'pending' | 'approved' | 'rejected', type: 'program' | 'exam' }
   */
  getMyRequests: async (params = {}) => {
    try {
      // Get userId from localStorage if not provided
      if (!params.userId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        params.userId = user._id;
      }

      const response = await axios.get(`${API_BASE_URL}/my-requests`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách yêu cầu của bạn' };
    }
  },

  /**
   * Get approval request by ID
   * @param {string} id - Request ID
   */
  getRequestById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin yêu cầu' };
    }
  },

  /**
   * Get approval history (Center Head)
   * @param {object} params - { userId: string, limit: number }
   */
  getApprovalHistory: async (params = {}) => {
    try {
      // Get userId from localStorage if not provided
      if (!params.userId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        params.userId = user._id;
      }

      const response = await axios.get(`${API_BASE_URL}/history`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy lịch sử phê duyệt' };
    }
  },

  /**
   * Get approval statistics (Center Head)
   */
  getStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thống kê' };
    }
=======
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
>>>>>>> origin/Namvv-teacher-class-management
  },

  // =========================
  // APPROVE/REJECT
  // =========================

<<<<<<< HEAD
  /**
   * Approve request (Center Head)
   * @param {string} id - Request ID
   * @param {object} data - { userId: string, note: string }
   */
  approveRequest: async (id, data = {}) => {
    try {
      // Get userId from localStorage if not provided
      if (!data.userId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        data.userId = user._id;
      }

      const response = await axios.post(`${API_BASE_URL}/${id}/approve`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể duyệt yêu cầu' };
    }
  },

  /**
   * Reject request (Center Head)
   * @param {string} id - Request ID
   * @param {object} data - { userId: string, reason: string }
   */
  rejectRequest: async (id, data) => {
    try {
      // Get userId from localStorage if not provided
      if (!data.userId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        data.userId = user._id;
      }

      const response = await axios.post(`${API_BASE_URL}/${id}/reject`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể từ chối yêu cầu' };
    }
=======
  approveRequest: async (id, data = {}) => {
    return await workRequestService.approveRequest(id, data);
  },

  rejectRequest: async (id, data) => {
    return await workRequestService.rejectRequest(id, data);
>>>>>>> origin/Namvv-teacher-class-management
  },

  // =========================
  // CANCEL REQUEST
  // =========================

<<<<<<< HEAD
  /**
   * Cancel pending request (Subject Leader)
   * @param {string} id - Request ID
   * @param {object} data - { userId: string }
   */
  cancelRequest: async (id, data = {}) => {
    try {
      // Get userId from localStorage if not provided
      if (!data.userId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        data.userId = user._id;
      }

      const response = await axios.delete(`${API_BASE_URL}/${id}/cancel`, { data });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể hủy yêu cầu' };
    }
  },
=======
  cancelRequest: async (id, data = {}) => {
    return await workRequestService.cancelRequest(id, data);
  }
>>>>>>> origin/Namvv-teacher-class-management
};

export default approvalRequestService;
