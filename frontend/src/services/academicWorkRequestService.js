import api from './api';

// Backend base URL for file downloads
const BACKEND_BASE_URL = import.meta.env.VITE_API_URL ?
  import.meta.env.VITE_API_URL.replace('/api', '') :
  'http://localhost:8080';

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
   * @param {object} params - { userId, status }
   */
  getStats: async (params = {}) => {
    try {
      // Add flag to indicate this is for academic staff (query by assignedTo)
      const queryParams = { ...params, forAcademicStaff: 'true' };
      const response = await api.get('/work-requests/stats', { params: queryParams });
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

  uploadOutputFile: async (id, userId, files) => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);

      // Support both single file and multiple files
      if (Array.isArray(files)) {
        files.forEach((file, index) => {
          formData.append('outputFiles', file);
        });
      } else {
        formData.append('outputFiles', files);
      }

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

  resubmitAssignStudentsRequest: async (id, userId, files, note) => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('note', note || '');

      // Support both single file and multiple files
      if (Array.isArray(files)) {
        files.forEach((file, index) => {
          formData.append('outputFiles', file);
        });
      } else {
        formData.append('outputFiles', files);
      }

      const response = await api.post(`/work-requests/${id}/resubmit-assign-students`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error resubmitting assign students request:', error);
      throw error.response?.data || { message: 'Không thể gửi lại báo cáo' };
    }
  },

  downloadFile: async (fileUrl) => {
    try {
      // Convert relative URL to full backend URL if needed
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${BACKEND_BASE_URL}${fileUrl}`;

      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Get filename from response headers or URL
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'download';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      } else {
        // Fallback to URL
        filename = fileUrl.split('/').pop() || 'download';
      }

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback to window.open with backend URL
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${BACKEND_BASE_URL}${fileUrl}`;
      window.open(fullUrl, '_blank');
    }
  }
};

export default academicWorkRequestService;

