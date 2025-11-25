import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/clos';

// CLO service functions
export const cloService = {
  // Lấy tất cả CLOs
  getAllCLOs: async (params = {}) => {
    try {
      const response = await axios.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách CLO' };
    }
  },

  // Lấy CLO theo ID
  getCLOById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin CLO' };
    }
  },

  // Tạo CLO mới
  createCLO: async (cloData) => {
    try {
      const response = await axios.post(API_BASE_URL, cloData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo CLO thất bại' };
    }
  },

  // Cập nhật CLO
  updateCLO: async (id, cloData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, cloData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật CLO thất bại' };
    }
  },

  // Xóa CLO
  deleteCLO: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa CLO thất bại' };
    }
  },
};

export default cloService;
