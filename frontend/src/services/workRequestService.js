import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/work-requests';

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
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        formData.append('requestedBy', user._id);
      }

      const response = await axios.post(`${API_BASE_URL}/create`, formData, {
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
      if (!data.userId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        data.userId = user._id;
      }

      const response = await axios.post(`${API_BASE_URL}/submit/exam/${examId}`, data);
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
      const response = await axios.get(API_BASE_URL, { params });
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
   * Get requests assigned to me (Staff)
   * @param {object} params - { userId: string, status: string }
   */
  getAssignedToMe: async (params = {}) => {
    try {
      if (!params.userId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        params.userId = user._id;
      }

      const response = await axios.get(`${API_BASE_URL}/assigned-to-me`, { params });
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
      const response = await axios.get(`${API_BASE_URL}/${id}`);
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
      const response = await axios.get(`${API_BASE_URL}/stats`, { params });
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
   * Reject request
   * @param {string} id - Request ID
   * @param {object} data - { userId: string, reason: string }
   */
  rejectRequest: async (id, data) => {
    try {
      if (!data.userId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        data.userId = user._id;
      }

      const response = await axios.post(`${API_BASE_URL}/${id}/reject`, data);
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
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        data.userId = user._id;
      }

      const response = await axios.post(`${API_BASE_URL}/${id}/revoke`, data);
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
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        data.userId = user._id;
      }

      const response = await axios.delete(`${API_BASE_URL}/${id}/cancel`, { data });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể hủy yêu cầu' };
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
