import api from './api';
import { getCookie } from '../utils/cookieUtils.js';

/**
 * Work Request Service - Handles all work request operations
 * Replaces approvalRequestService with enhanced functionality
 */
export const workRequestService = {
  // =========================
  // CREATE TOP-DOWN REQUEST (CENTER HEAD)
  // =========================

  /**
   * Create top-down work request (task assignment from Center Head)
   * @param {FormData} formData - Form data with files
   * Required fields in formData:
   *   - requestType: 'create_program' | 'edit_course' | 'create_exam' | 'assign_students'
   *   - assignedTo: userId
   *   - requestedBy: centerHeadUserId (auto-added if not provided)
   * Optional fields:
   *   - requestNote: string
   *   - entityType: 'Course' (for edit_course)
   *   - entityId: courseId (for edit_course)
   *   - changeDetails: JSON string or object
   *   - attachmentFile: File (reference documents)
   *   - inputFile: File (Excel for assign_students)
   */
  createRequest: async (formData) => {
    try {
      // Auto-add requestedBy if not provided
      if (!formData.get('requestedBy')) {
        const user = JSON.parse(getCookie('user') || '{}');
        formData.append('requestedBy', user._id);
      }

      const response = await api.post('/work-requests/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể tạo yêu cầu' };
    }
  },

  // =========================
  // SUBMIT FOR APPROVAL (BOTTOM-UP)
  // =========================

  /**
   * Submit program for approval
   * @param {string} programId - Program ID
   * @param {object} data - { userId: string, note: string }
   */
  submitProgram: async (programId, data = {}) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/submit/program/${programId}`, data);
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
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/submit/exam/${examId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể nộp đề thi' };
    }
  },

  // =========================
  // GET REQUESTS
  // =========================

  /**
   * Get all work requests with filters
   * @param {object} params - {
   *   direction: 'bottom_up' | 'top_down',
   *   requestType: 'program' | 'exam' | 'create_program' | 'edit_course' | 'create_exam' | 'create_class',
   *   status: 'pending' | 'in_progress' | 'pending_approval' | 'approved' | 'rejected' | 'completed' | 'need_revision',
   *   fromDate: string,
   *   toDate: string,
   *   page: number,
   *   limit: number
   * }
   */
  getAllRequests: async (params = {}) => {
    try {
      const response = await api.get('/work-requests', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách yêu cầu' };
    }
  },

  /**
   * Get my submitted requests (Subject Leader/Staff)
   * @param {object} params - { userId: string, status: string, requestType: string }
   */
  getMyRequests: async (params = {}) => {
    try {
      if (!params.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        params.userId = user._id;
      }

      const response = await api.get('/work-requests/my-requests', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách yêu cầu của bạn' };
    }
  },

  /**
   * Get requests assigned to me (Staff)
   * @param {object} params - { userId: string, status: string }
   */
  getAssignedToMe: async (params = {}) => {
    try {
      if (!params.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        params.userId = user._id;
      }

      const response = await api.get('/work-requests/assigned-to-me', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách công việc được giao' };
    }
  },

  /**
   * Get work request by ID
   * @param {string} id - Request ID
   */
  getRequestById: async (id) => {
    try {
      const response = await api.get(`/work-requests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin yêu cầu' };
    }
  },

  /**
   * Get statistics
   * @param {object} params - { direction: 'bottom_up' | 'top_down' }
   */
  getStats: async (params = {}) => {
    try {
      const response = await api.get('/work-requests/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thống kê' };
    }
  },

  // =========================
  // APPROVE/REJECT (CENTER HEAD) - FOR BOTTOM-UP
  // =========================

  /**
   * Approve request
   * @param {string} id - Request ID
   * @param {object} data - { userId: string, note: string }
   */
  approveRequest: async (id, data = {}) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/${id}/approve`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể duyệt yêu cầu' };
    }
  },

  /**
   * Reject request
   * @param {string} id - Request ID
   * @param {object} data - { userId: string, reason: string }
   */
  rejectRequest: async (id, data) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/${id}/reject`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể từ chối yêu cầu' };
    }
  },

  /**
   * Revoke approval (thu hồi phê duyệt)
   * @param {string} id - Request ID
   * @param {object} data - { userId: string, reason: string }
   */
  revokeApproval: async (id, data) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/${id}/revoke`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể thu hồi phê duyệt' };
    }
  },

  // =========================
  // CANCEL REQUEST
  // =========================

  /**
   * Cancel pending request
   * @param {string} id - Request ID
   * @param {object} data - { userId: string }
   */
  cancelRequest: async (id, data = {}) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.delete(`/work-requests/${id}/cancel`, { data });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể hủy yêu cầu' };
    }
  },

  // =========================
  // WITHDRAW SUBMISSION (Subject Leader)
  // =========================

  /**
   * Withdraw program submission (Hủy nộp program)
   * Dùng khi program đang pending_approval và Subject Leader muốn rút lại để chỉnh sửa
   * @param {string} programId - Program ID
   * @param {object} data - { userId: string, note: string }
   */
  withdrawProgramSubmission: async (programId, data = {}) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/withdraw/program/${programId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể hủy nộp chương trình' };
    }
  },

  /**
   * Withdraw exam submission (Hủy nộp đề thi)
   * Dùng khi exam đang pending_approval và Subject Leader muốn rút lại để chỉnh sửa
   * @param {string} examId - Exam ID
   * @param {object} data - { userId: string, note: string }
   */
  withdrawExamSubmission: async (examId, data = {}) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/withdraw/exam/${examId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể hủy nộp đề thi' };
    }
  },

  // =========================
  // START PROCESSING (TOP-DOWN)
  // =========================

  /**
   * Start processing a work request (change status to in_progress)
   * @param {string} id - Request ID
   * @param {object} data - { userId: string }
   */
  startProcessing: async (id, data = {}) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/${id}/start-processing`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể bắt đầu xử lý yêu cầu' };
    }
  },

  /**
   * Complete a work request
   * @param {string} id - Request ID
   * @param {object} data - { userId: string, note: string }
   */
  completeRequest: async (id, data = {}) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/${id}/complete`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể hoàn thành yêu cầu' };
    }
  },

  /**
   * Recreate entity for work request (when entity was deleted)
   * @param {string} id - Request ID
   * @param {object} data - { userId: string, programCode: string, programName: string, programType: string }
   */
  recreateEntity: async (id, data = {}) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/${id}/recreate-entity`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể tạo lại entity' };
    }
  },

  // =========================
  // EDIT PROGRAM WORKFLOW
  // =========================

  /**
   * Check if program has active edit request
   * @param {string} programId - Program ID
   */
  checkProgramEditStatus: async (programId) => {
    try {
      const response = await api.get(`/work-requests/program/${programId}/edit-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể kiểm tra trạng thái yêu cầu chỉnh sửa' };
    }
  },

  /**
   * Get rejection info for a program (for needs_revision status)
   * @param {string} programId - Program ID
   */
  getProgramRejectionInfo: async (programId) => {
    try {
      const response = await api.get(`/work-requests/program/${programId}/rejection-info`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin từ chối' };
    }
  },

  /**
   * Create edit_program request (Center Head assigns to Subject Leader)
   * @param {object} data - { entityId: programId, assignedTo: userId, requestNote: string }
   */
  createEditProgramRequest: async (data) => {
    try {
      const user = JSON.parse(getCookie('user') || '{}');
      const formData = new FormData();
      formData.append('requestType', 'edit_program');
      formData.append('entityId', data.entityId);
      formData.append('assignedTo', data.assignedTo);
      formData.append('requestedBy', user._id);
      if (data.requestNote) {
        formData.append('requestNote', data.requestNote);
      }

      const response = await api.post('/work-requests/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể tạo yêu cầu chỉnh sửa chương trình' };
    }
  },

  /**
   * Start processing edit_program request (Subject Leader accepts)
   * @param {string} id - Request ID
   * @param {object} data - { userId: string }
   */
  startEditProgram: async (id, data = {}) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/${id}/start-edit-program`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể bắt đầu xử lý yêu cầu' };
    }
  },

  /**
   * Submit edit_program for approval (Subject Leader completes)
   * @param {string} id - Request ID
   * @param {object} data - { userId: string, note: string }
   */
  submitEditProgram: async (id, data = {}) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/${id}/submit-edit-program`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể gửi yêu cầu phê duyệt' };
    }
  },

  /**
   * Approve edit_program request (Center Head approves)
   * @param {string} id - Request ID
   * @param {object} data - { userId: string, note: string }
   */
  approveEditProgram: async (id, data = {}) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/${id}/approve-edit-program`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể duyệt yêu cầu chỉnh sửa' };
    }
  },

  /**
   * Reject edit_program request (Center Head rejects)
   * @param {string} id - Request ID
   * @param {object} data - { userId: string, rejectionReason: string }
   */
  rejectEditProgram: async (id, data) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(getCookie('user') || '{}');
        data.userId = user._id;
      }

      const response = await api.post(`/work-requests/${id}/reject-edit-program`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể từ chối yêu cầu chỉnh sửa' };
    }
  },

  // =========================
  // HELPERS - BACKWARD COMPATIBILITY
  // =========================

  /**
   * Get pending approval requests (backward compatible)
   * Maps to getAllRequests with direction=bottom_up, status=pending
   */
  getPendingRequests: async (params = {}) => {
    return workRequestService.getAllRequests({
      ...params,
      direction: 'bottom_up',
      status: params.status || 'pending'
    });
  },

  /**
   * Get approval history (backward compatible)
   * Maps to getAllRequests with direction=bottom_up, status=approved/rejected
   */
  getApprovalHistory: async (params = {}) => {
    // Get both approved and rejected requests
    const [approvedRes, rejectedRes] = await Promise.all([
      workRequestService.getAllRequests({
        direction: 'bottom_up',
        status: 'approved',
        limit: params.limit || 20
      }),
      workRequestService.getAllRequests({
        direction: 'bottom_up',
        status: 'rejected',
        limit: params.limit || 20
      })
    ]);

    // Combine and sort by processedAt
    const combined = [
      ...(approvedRes.data || []),
      ...(rejectedRes.data || [])
    ].sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt));

    return {
      success: true,
      data: combined.slice(0, params.limit || 20),
      count: combined.length
    };
  }
};

export default workRequestService;
