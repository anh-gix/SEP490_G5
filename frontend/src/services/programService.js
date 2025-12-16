import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/programs';

<<<<<<< HEAD
=======
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

>>>>>>> origin/Namvv-teacher-class-management
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

<<<<<<< HEAD
=======
  // Lấy programs của teacher hiện tại
  getMyPrograms: async (params = {}) => {
    try {
      const response = await api.get('/my-programs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách chương trình của tôi' };
    }
  },

>>>>>>> origin/Namvv-teacher-class-management
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

  // Approval workflow
  // Submit program for approval
  submitProgram: async (id, data) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/submit`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Nộp chương trình thất bại' };
    }
  },

  // Approve program
  approveProgram: async (id, data) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/approve`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Duyệt chương trình thất bại' };
    }
  },

  // Reject program
  rejectProgram: async (id, data) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/reject`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Từ chối chương trình thất bại' };
    }
  },

  // Activate program
  activateProgram: async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/activate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Kích hoạt chương trình thất bại' };
    }
  },

  // Archive program
  archiveProgram: async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/archive`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lưu trữ chương trình thất bại' };
    }
  },
};

export default programService;
