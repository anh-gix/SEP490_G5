import api from './api';

export const userService = {
  /**
   * Get users by roles
   * @param {string[]} roles - Array of role names
   */
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
  }
};

export default userService;
