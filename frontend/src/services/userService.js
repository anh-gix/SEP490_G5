import axios from 'axios';
import api from './api.js';
const API_BASE_URL = 'http://localhost:8080/api/users';

// Helper to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// User service functions
export const userService = {
  getUsersByRoles: async (roles) => {
    try {
      const rolesString = roles.join(',');
      const response = await api.get('/users/by-roles', {
        params: { roles: rolesString }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users by roles:', error);
      throw error.response?.data || { message: 'Không thể lấy danh sách nhân viên' };
    }
  },
  // Lấy tất cả users
  getAllUsers: async () => {
    try {
      const response = await axios.get(API_BASE_URL, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách người dùng' };
    }
  },

  // Lấy user theo ID
  getUserById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin người dùng' };
    }
  },

  // Tạo user mới
  createUser: async (userData) => {
    try {
      const response = await axios.post(API_BASE_URL, userData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo người dùng thất bại' };
    }
  },

  // Cập nhật user
  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, userData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật người dùng thất bại' };
    }
  },

  // Xóa user
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa người dùng thất bại' };
    }
  },
};

export default userService;
