import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/plos';

// PLO service functions
export const ploService = {
  // Lấy tất cả PLOs
  getAllPLOs: async (params = {}) => {
    try {
      const response = await axios.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách PLO' };
    }
  },

  // Lấy PLO theo ID
  getPLOById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin PLO' };
    }
  },

  // Tạo PLO mới
  createPLO: async (ploData) => {
    try {
      const response = await axios.post(API_BASE_URL, ploData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo PLO thất bại' };
    }
  },

  // Tạo nhiều PLOs cùng lúc
  createBulkPLOs: async (plos) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/bulk`, { plos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo danh sách PLO thất bại' };
    }
  },

  // Cập nhật PLO
  updatePLO: async (id, ploData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, ploData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật PLO thất bại' };
    }
  },

  // Xóa PLO
  deletePLO: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa PLO thất bại' };
    }
  },
};

export default ploService;
