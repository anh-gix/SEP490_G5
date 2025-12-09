import api from './api';

export const courseService = {
  /**
   * Get courses with filters
   * @param {object} params - { status, program, search }
   */
  getCourses: async (params = {}) => {
    try {
      const response = await api.get('/courses', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error.response?.data || { message: 'Không thể lấy danh sách khóa học' };
    }
  }
};

export default courseService;
