import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/roles';

// Role service functions
export const roleService = {
  // Lấy tất cả roles
  getAllRoles: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách vai trò' };
    }
  },

  // Lấy role theo ID
  getRoleById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin vai trò' };
    }
  },

  // Tạo role mới
  createRole: async (roleData) => {
    try {
      const response = await axios.post(API_BASE_URL, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo vai trò thất bại' };
    }
  },

  // Cập nhật role
  updateRole: async (id, roleData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật vai trò thất bại' };
    }
  },

  // Xóa role
  deleteRole: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa vai trò thất bại' };
    }
  },
};

export default roleService;
