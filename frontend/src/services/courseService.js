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

  // Submit course for approval
  submitCourse: async (id, data) => {
    try {
      const response = await api.patch(`/${id}/submit`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Nộp giáo trình thất bại' };
    }
  },

  // Phê duyệt course
  approveCourse: async (id, data) => {
    try {
      const response = await api.patch(`/${id}/approve`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Phê duyệt giáo trình thất bại' };
    }
  },

  // Reject course
  rejectCourse: async (id, data) => {
    try {
      const response = await api.patch(`/${id}/reject`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Từ chối giáo trình thất bại' };
    }
  },

  // Yêu cầu chỉnh sửa course
  requestRevision: async (id, data) => {
    try {
      const response = await api.patch(`/${id}/revise`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gửi yêu cầu chỉnh sửa thất bại' };
    }
  },

  // Accept course to program (Program Head)
  acceptCourseToProgram: async (id, data) => {
    try {
      const response = await api.patch(`/${id}/accept`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Chấp nhận giáo trình thất bại' };
    }
  },

  // Reject course from program (Program Head)
  rejectCourseFromProgram: async (id, data) => {
    try {
      const response = await api.patch(`/${id}/reject`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Từ chối giáo trình thất bại' };
    }
  },

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
      throw error.response?.data || { message: 'Không thể lấy danh sách courses theo program và level' };
      }
  },
  // =========================
  // PLO MAPPING FUNCTIONS
  // =========================

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
