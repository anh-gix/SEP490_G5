import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/sessions';

// Session service functions
export const sessionService = {
  // Lấy tất cả sessions
  getAllSessions: async (params = {}) => {
    try {
      const response = await axios.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách buổi học' };
    }
  },

  // Lấy session theo ID
  getSessionById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin buổi học' };
    }
  },

  // Tạo session mới
  createSession: async (sessionData) => {
    try {
      const response = await axios.post(API_BASE_URL, sessionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo buổi học thất bại' };
    }
  },

  // Cập nhật session
  updateSession: async (id, sessionData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, sessionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật buổi học thất bại' };
    }
  },

  // Xóa session
  deleteSession: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa buổi học thất bại' };
    }
  },

  // Lấy sessions của một course
  getSessionsByCourseId: async (courseId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/course/${courseId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách buổi học của giáo trình' };
    }
  },
};

export default sessionService;
