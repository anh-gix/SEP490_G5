import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/programs';

// Program service functions
export const programService = {
  // Lấy tất cả programs
  getAllPrograms: async (params = {}) => {
    try {
      const response = await axios.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách chương trình' };
    }
  },

  // Lấy program theo ID
  getProgramById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin chương trình' };
    }
  },

  // Tạo program mới
  createProgram: async (programData) => {
    try {
      const response = await axios.post(API_BASE_URL, programData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo chương trình thất bại' };
    }
  },

  // Cập nhật program
  updateProgram: async (id, programData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, programData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật chương trình thất bại' };
    }
  },

  // Xóa program
  deleteProgram: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa chương trình thất bại' };
    }
  },

  // Lấy PLOs của program
  getProgramPLOs: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}/plos`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách PLOs' };
    }
  },
};

export default programService;
