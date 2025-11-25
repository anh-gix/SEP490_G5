import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/users';

// User service functions
export const userService = {
  // Lấy tất cả users
  getAllUsers: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách người dùng' };
    }
  },

  // Lấy user theo ID
  getUserById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin người dùng' };
    }
  },

  // Tạo user mới
  createUser: async (userData) => {
    try {
      const response = await axios.post(API_BASE_URL, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo người dùng thất bại' };
    }
  },

  // Cập nhật user
  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật người dùng thất bại' };
    }
  },

  // Xóa user
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa người dùng thất bại' };
    }
  },
};

export default userService;
