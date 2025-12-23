import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/courses';

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

// Course service functions
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
  // Lấy tất cả courses
  getAllCourses: async (params = {}) => {
    try {
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách giáo trình' };
    }
  },

  // Lấy course theo ID
  getCourseById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin giáo trình' };
    }
  },

  // Tạo course mới
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/', courseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo giáo trình thất bại' };
    }
  },

  // Cập nhật course
  updateCourse: async (id, courseData) => {
    try {
      const response = await api.put(`/${id}`, courseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật giáo trình thất bại' };
    }
  },

  // Xóa course
  deleteCourse: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa giáo trình thất bại' };
    }
  },

  // Lấy danh sách courses chờ phê duyệt
  getPendingCourses: async () => {
    try {
      const response = await api.get('/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách giáo trình chờ duyệt' };
    }
  },

  // Lấy chi tiết course (với sessions, CLOs)
  getCourseDetails: async (id) => {
    try {
      const response = await api.get(`/${id}/details`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy chi tiết giáo trình' };
    }
  },

  // NOTE: Course không có approval workflow
  // Approval chỉ áp dụng ở Program level
  // Course chỉ có status: draft, completed, active, archived

  // Get all course mappings (type, level, band)
  getCourseMappings: async () => {
    try {
      const response = await api.get('/mappings');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách mappings' };
    }
  },

  // Get types by level
  getTypesByLevel: async (level) => {
    try {
      const response = await api.get('/types-by-level', {
        params: { level }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy types theo level' };
    }
  },

  // Get all types from Program collection
  getAllTypes: async () => {
    try {
      const response = await api.get('/all-types');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách types' };
    }
  },

  // Get all levels from Program collection
  getAllLevels: async () => {
    try {
      const response = await api.get('/all-levels');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách levels' };
    }
  },

  // Get levels by type
  getLevelsByType: async (type) => {
    try {
      const response = await api.get('/levels', {
        params: { type }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy levels theo type' };
    }
  },

  // Get band by type and level
  getBandByTypeAndLevel: async (type, level) => {
    try {
      const response = await api.get('/band', {
        params: { type, level }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy band theo type và level' };
    }
  },

  // Get courses by program name and level
  getCoursesByProgram: async (programName, level) => {
    try {
      const response = await api.get('/by-program', {
        params: { programName, level }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses by program:', error);
      throw error.response?.data || { message: 'Không thể lấy danh sách khóa học' };
    }
  },

  // Get courses by program ID(s)
  getCoursesByProgramId: async (programIds) => {
    try {
      // programIds can be a single ID or array of IDs
      const idsParam = Array.isArray(programIds) ? programIds.join(',') : programIds;
      const response = await api.get('/by-program-id', {
        params: { programIds: idsParam }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses by program ID:', error);
      throw error.response?.data || { message: 'Không thể lấy danh sách khóa học theo program ID' };
    }
  },

  // Get PLOs of a Course's Program
  getProgramPLOs: async (courseId) => {
    try {
      const response = await api.get(`/${courseId}/program-plos`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách PLO của chương trình' };
    }
  },

  // Update Course PLO Mapping
  updateCoursePLOMapping: async (courseId, mappedPLOs) => {
    try {
      const response = await api.put(`/${courseId}/map-plos`, {
        mappedPLOs
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật PLO mapping thất bại' };
    }
  },
};

export default courseService;
