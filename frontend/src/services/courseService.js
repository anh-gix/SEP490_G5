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
  },

  /**
   * Get courses by program name and level
   * @param {string} programName - Program name (IELTS, TOEIC, Cambridge)
   * @param {string} level - Level (A1, A2, B1, B2, C1, C2, Pre-A1)
   */
  getCoursesByProgram: async (programName, level) => {
    try {
      const response = await api.get('/courses/by-program', {
        params: { programName, level }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses by program:', error);
      throw error.response?.data || { message: 'Không thể lấy danh sách khóa học' };
    }
  },

  /**
   * Get all unique types from Program collection
   * GET /api/courses/all-types
   */
  getAllTypes: async () => {
    try {
      const response = await api.get('/courses/all-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching all types:', error);
      throw error.response?.data || { message: 'Không thể lấy danh sách types' };
    }
  },

  /**
   * Get all unique levels from Program collection
   * GET /api/courses/all-levels
   */
  getAllLevels: async () => {
    try {
      const response = await api.get('/courses/all-levels');
      return response.data;
    } catch (error) {
      console.error('Error fetching all levels:', error);
      throw error.response?.data || { message: 'Không thể lấy danh sách levels' };
    }
  },

  /**
   * Get levels by type
   * GET /api/courses/levels?type=ielts
   * @param {string} type - Type (ielts, toeic, cam)
   */
  getLevelsByType: async (type) => {
    try {
      const response = await api.get('/courses/levels', {
        params: { type }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching levels by type:', error);
      throw error.response?.data || { message: 'Không thể lấy danh sách levels' };
    }
  },

  /**
   * Get types by level
   * GET /api/courses/types-by-level?level=A1
   * @param {string} level - Level (A1, A2, B1, B2, C1, C2, Pre-A1)
   */
  getTypesByLevel: async (level) => {
    try {
      const response = await api.get('/courses/types-by-level', {
        params: { level }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching types by level:', error);
      throw error.response?.data || { message: 'Không thể lấy danh sách types' };
    }
  },

  /**
   * Get band by type and level
   * GET /api/courses/band?type=ielts&level=B1
   * @param {string} type - Type (ielts, toeic, cam)
   * @param {string} level - Level (A1, A2, B1, B2, C1, C2, Pre-A1)
   */
  getBandByTypeAndLevel: async (type, level) => {
    try {
      const response = await api.get('/courses/band', {
        params: { type, level }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching band:', error);
      throw error.response?.data || { message: 'Không thể lấy band' };
    }
  },

  /**
   * Get all course mappings (type, level, band) from Program model
   * GET /api/courses/mappings
   */
  getCourseMappings: async () => {
    try {
      const response = await api.get('/courses/mappings');
      return response.data;
    } catch (error) {
      console.error('Error fetching course mappings:', error);
      throw error.response?.data || { message: 'Không thể lấy course mappings' };
    }
  },

  /**
   * Get course details by ID
   * @param {string} courseId - Course ID
   */
  getCourseDetails: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course details:', error);
      throw error.response?.data || { message: 'Không thể lấy chi tiết khóa học' };
    }
  }
};

export default courseService;
