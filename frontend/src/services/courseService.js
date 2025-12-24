import axios from 'axios';
import { getCookie } from '../utils/cookieUtils.js';

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

  // ===== ACTIVATION/DEACTIVATION =====

  /**
   * Check if course can be deactivated
   * @param {string} courseId - Course ID
   * @returns {Promise<{canDeactivate: boolean, message: string, activeClasses?: array, upcomingSchedules?: array, estimatedEndDate?: Date}>}
   */
  canDeactivateCourse: async (courseId) => {
    try {
      const response = await api.get(`/${courseId}/can-deactivate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể kiểm tra trạng thái khóa học' };
    }
  },

  /**
   * Deactivate a course
   * @param {string} courseId - Course ID
   * @param {boolean} force - Force deactivate even if there are active classes
   */
  deactivateCourse: async (courseId, force = false) => {
    try {
      const response = await api.patch(`/${courseId}/deactivate`, { force });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể vô hiệu hóa khóa học' };
    }
  },

  /**
   * Activate a course
   * @param {string} courseId - Course ID
   */
  activateCourse: async (courseId) => {
    try {
      const response = await api.patch(`/${courseId}/activate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể kích hoạt khóa học' };
    }
  },

  /**
   * Upload material file
   * @param {File} file - File to upload
   * @returns {Promise<{url: string}>}
   */
  uploadMaterialFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('material', file);

      const response = await axios.post(`${API_BASE_URL}/upload-material`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${getCookie('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Upload file thất bại' };
    }
  },

  // ===== MATERIALS CRUD (Independent of course status) =====

  /**
   * Get all materials of a course
   * @param {string} courseId - Course ID
   */
  getCourseMaterials: async (courseId) => {
    try {
      const response = await api.get(`/${courseId}/materials`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách tài liệu' };
    }
  },

  /**
   * Add material to course (works regardless of course status)
   * @param {string} courseId - Course ID
   * @param {object} materialData - { description, author, publisher, publishedDate, onlineUrl, documentUpload, note }
   */
  addCourseMaterial: async (courseId, materialData) => {
    try {
      const response = await api.post(`/${courseId}/materials`, materialData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Thêm tài liệu thất bại' };
    }
  },

  /**
   * Update material in course (works regardless of course status)
   * @param {string} courseId - Course ID
   * @param {string} materialId - Material ID
   * @param {object} materialData - { description, author, publisher, publishedDate, onlineUrl, documentUpload, note }
   */
  updateCourseMaterial: async (courseId, materialId, materialData) => {
    try {
      const response = await api.put(`/${courseId}/materials/${materialId}`, materialData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật tài liệu thất bại' };
    }
  },

  /**
   * Delete material from course (works regardless of course status)
   * @param {string} courseId - Course ID
   * @param {string} materialId - Material ID
   */
  deleteCourseMaterial: async (courseId, materialId) => {
    try {
      const response = await api.delete(`/${courseId}/materials/${materialId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa tài liệu thất bại' };
    }
  },
};

export default courseService;
