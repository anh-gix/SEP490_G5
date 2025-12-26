import axios from 'axios';
import { getCookie } from '../utils/cookieUtils.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const API_BASE_URL = `${API_URL}/roles`;

// Tạo axios instance với interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào headers
api.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Role service functions
export const roleService = {
  // Lấy tất cả roles
  getAllRoles: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách vai trò' };
    }
  },

  // Lấy role theo ID
  getRoleById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin vai trò' };
    }
  },

  // Tạo role mới
  createRole: async (roleData) => {
    try {
      const response = await api.post('/', roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo vai trò thất bại' };
    }
  },

  // Cập nhật role
  updateRole: async (id, roleData) => {
    try {
      const response = await api.put(`/${id}`, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật vai trò thất bại' };
    }
  },

  // Xóa role
  deleteRole: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa vai trò thất bại' };
    }
  },
};

export default roleService;
