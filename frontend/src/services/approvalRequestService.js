import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/approval-requests';

// Approval Request service functions
export const approvalRequestService = {
  // =========================
  // SUBMIT FOR APPROVAL
  // =========================

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
  },

  // =========================
  // GET REQUESTS
  // =========================

  /**
   * Get all pending approval requests (Center Head)
   * @param {object} params - { type: 'program' | 'exam' }
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
  },

  // =========================
  // APPROVE/REJECT
  // =========================

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
  },

  // =========================
  // CANCEL REQUEST
  // =========================

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
};

export default approvalRequestService;
