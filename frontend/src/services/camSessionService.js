import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/cam-sessions';

// Cam Session service functions
export const camSessionService = {
  // Lấy tất cả cam sessions
  getAllCamSessions: async (params = {}) => {
    try {
      const response = await axios.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách buổi học CAM' };
    }
  },

  // Lấy cam session theo ID
  getCamSessionById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin buổi học CAM' };
    }
  },

  // Tạo cam session mới
  createCamSession: async (camSessionData) => {
    try {
      const response = await axios.post(API_BASE_URL, camSessionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo buổi học CAM thất bại' };
    }
  },

  // Cập nhật cam session
  updateCamSession: async (id, camSessionData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, camSessionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật buổi học CAM thất bại' };
    }
  },

  // Xóa cam session
  deleteCamSession: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa buổi học CAM thất bại' };
    }
  },

  // Lấy cam sessions của một course
  getCamSessionsByCourseId: async (courseId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/course/${courseId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách buổi học CAM của giáo trình' };
    }
  },
};

export default camSessionService;

