import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/programs';

// Create axios instance with interceptor for authentication
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Program service functions
export const programService = {
  // Lấy tất cả programs
  getAllPrograms: async (params = {}) => {
    try {
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách chương trình' };
    }
  },

  // Lấy programs của teacher hiện tại
  getMyPrograms: async (params = {}) => {
    try {
      const response = await api.get('/my-programs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách chương trình của tôi' };
    }
  },

  // Lấy program theo ID
  getProgramById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin chương trình' };
    }
  },

  // Tạo program mới
  createProgram: async (programData) => {
    try {
      const response = await api.post('/', programData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo chương trình thất bại' };
    }
  },

  // Cập nhật program
  updateProgram: async (id, programData) => {
    try {
      const response = await api.put(`/${id}`, programData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật chương trình thất bại' };
    }
  },

  // Xóa program
  deleteProgram: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa chương trình thất bại' };
    }
  },

  // Lấy PLOs của program
  getProgramPLOs: async (id) => {
    try {
      const response = await api.get(`/${id}/plos`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách PLOs' };
    }
  },

  // Approval workflow
  // Submit program for approval
  submitProgram: async (id, data) => {
    try {
      const response = await api.patch(`/${id}/submit`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Nộp chương trình thất bại' };
    }
  },

  // Approve program
  approveProgram: async (id, data) => {
    try {
      const response = await api.patch(`/${id}/approve`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Duyệt chương trình thất bại' };
    }
  },

  // Reject program
  rejectProgram: async (id, data) => {
    try {
      const response = await api.patch(`/${id}/reject`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Từ chối chương trình thất bại' };
    }
  },

  // Activate program
  activateProgram: async (id) => {
    try {
      const response = await api.patch(`/${id}/activate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Kích hoạt chương trình thất bại' };
    }
  },

  // Archive program
  archiveProgram: async (id) => {
    try {
      const response = await api.patch(`/${id}/archive`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lưu trữ chương trình thất bại' };
    }
  },
};

export default programService;
