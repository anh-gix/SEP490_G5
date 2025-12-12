import api from './api';

export const academicWorkRequestService = {
  /**
   * Get work requests assigned to me
   * @param {object} params - { userId, status }
   */
  getAssignedRequests: async (params = {}) => {
    try {
      const response = await api.get('/work-requests/assigned-to-me', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned requests:', error);
      throw error.response?.data || { message: 'Không thể lấy danh sách công việc' };
    }
  },

  /**
   * Get work request stats
   * @param {object} params - { userId }
   */
  getStats: async (params = {}) => {
    try {
      const response = await api.get('/work-requests/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching work request stats:', error);
      throw error.response?.data || { message: 'Không thể lấy thống kê' };
    }
  },

  getRequestById: async (id) => {
    try {
      const response = await api.get(`/work-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching request:', error);
      throw error.response?.data || { message: 'Không thể lấy chi tiết yêu cầu' };
    }
  },

  startProcessing: async (id, userId) => {
    try {
      const response = await api.post(`/work-requests/${id}/start-processing`, { userId });
      return response.data;
    } catch (error) {
      console.error('Error starting processing:', error);
      throw error.response?.data || { message: 'Không thể bắt đầu xử lý' };
    }
  },

  uploadOutputFile: async (id, userId, file) => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('outputFile', file);

      const response = await api.post(`/work-requests/${id}/upload-output`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading output file:', error);
      throw error.response?.data || { message: 'Không thể upload file kết quả' };
    }
  },

  completeRequest: async (id, userId, note) => {
    try {
      const response = await api.post(`/work-requests/${id}/complete`, { userId, note });
      return response.data;
    } catch (error) {
      console.error('Error completing request:', error);
      throw error.response?.data || { message: 'Không thể hoàn thành yêu cầu' };
    }
  },

  downloadFile: (fileUrl) => {
    window.open(fileUrl, '_blank');
  }
};

export default academicWorkRequestService;

