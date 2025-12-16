import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/courses';

<<<<<<< HEAD
// Course service functions
export const courseService = {
  // Lấy tất cả courses
  getAllCourses: async (params = {}) => {
    try {
      const response = await axios.get(API_BASE_URL, { params });
=======
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
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách giáo trình' };
    }
  },

  // Lấy course theo ID
  getCourseById: async (id) => {
    try {
<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/${id}`);
=======
      const response = await api.get(`/${id}`);
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin giáo trình' };
    }
  },

  // Tạo course mới
  createCourse: async (courseData) => {
    try {
<<<<<<< HEAD
      const response = await axios.post(API_BASE_URL, courseData);
=======
      const response = await api.post('/', courseData);
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo giáo trình thất bại' };
    }
  },

  // Cập nhật course
  updateCourse: async (id, courseData) => {
    try {
<<<<<<< HEAD
      const response = await axios.put(`${API_BASE_URL}/${id}`, courseData);
=======
      const response = await api.put(`/${id}`, courseData);
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật giáo trình thất bại' };
    }
  },

  // Xóa course
  deleteCourse: async (id) => {
    try {
<<<<<<< HEAD
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
=======
      const response = await api.delete(`/${id}`);
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa giáo trình thất bại' };
    }
  },

  // Lấy danh sách courses chờ phê duyệt
  getPendingCourses: async () => {
    try {
<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/pending`);
=======
      const response = await api.get('/pending');
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách giáo trình chờ duyệt' };
    }
  },

  // Lấy chi tiết course (với sessions, CLOs)
  getCourseDetails: async (id) => {
    try {
<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/${id}/details`);
=======
      const response = await api.get(`/${id}/details`);
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy chi tiết giáo trình' };
    }
  },

  // Submit course for approval
  submitCourse: async (id, data) => {
    try {
<<<<<<< HEAD
      const response = await axios.patch(`${API_BASE_URL}/${id}/submit`, data);
=======
      const response = await api.patch(`/${id}/submit`, data);
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Nộp giáo trình thất bại' };
    }
  },

  // Phê duyệt course
  approveCourse: async (id, data) => {
    try {
<<<<<<< HEAD
      const response = await axios.patch(`${API_BASE_URL}/${id}/approve`, data);
=======
      const response = await api.patch(`/${id}/approve`, data);
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Phê duyệt giáo trình thất bại' };
    }
  },

  // Reject course
  rejectCourse: async (id, data) => {
    try {
<<<<<<< HEAD
      const response = await axios.patch(`${API_BASE_URL}/${id}/reject`, data);
=======
      const response = await api.patch(`/${id}/reject`, data);
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Từ chối giáo trình thất bại' };
    }
  },

  // Yêu cầu chỉnh sửa course
  requestRevision: async (id, data) => {
    try {
<<<<<<< HEAD
      const response = await axios.patch(`${API_BASE_URL}/${id}/revise`, data);
=======
      const response = await api.patch(`/${id}/revise`, data);
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gửi yêu cầu chỉnh sửa thất bại' };
    }
  },

  // Accept course to program (Program Head)
  acceptCourseToProgram: async (id, data) => {
    try {
<<<<<<< HEAD
      const response = await axios.patch(`${API_BASE_URL}/${id}/accept`, data);
=======
      const response = await api.patch(`/${id}/accept`, data);
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Chấp nhận giáo trình thất bại' };
    }
  },

  // Reject course from program (Program Head)
  rejectCourseFromProgram: async (id, data) => {
    try {
<<<<<<< HEAD
      const response = await axios.patch(`${API_BASE_URL}/${id}/reject`, data);
=======
      const response = await api.patch(`/${id}/reject`, data);
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Từ chối giáo trình thất bại' };
    }
  },

  // Get all course mappings (type, level, band)
  getCourseMappings: async () => {
    try {
<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/mappings`);
=======
      const response = await api.get('/mappings');
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách mappings' };
    }
  },

  // Get types by level
  getTypesByLevel: async (level) => {
    try {
<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/types-by-level`, {
=======
      const response = await api.get('/types-by-level', {
>>>>>>> origin/Namvv-teacher-class-management
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
<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/all-types`);
=======
      const response = await api.get('/all-types');
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách types' };
    }
  },

  // Get all levels from Program collection
  getAllLevels: async () => {
    try {
<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/all-levels`);
=======
      const response = await api.get('/all-levels');
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách levels' };
    }
  },

  // Get levels by type
  getLevelsByType: async (type) => {
    try {
<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/levels`, {
=======
      const response = await api.get('/levels', {
>>>>>>> origin/Namvv-teacher-class-management
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
<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/band`, {
=======
      const response = await api.get('/band', {
>>>>>>> origin/Namvv-teacher-class-management
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
<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/by-program`, {
=======
      const response = await api.get('/by-program', {
>>>>>>> origin/Namvv-teacher-class-management
        params: { programName, level }
      });
      return response.data;
    } catch (error) {
<<<<<<< HEAD
      throw error.response?.data || { message: 'Không thể lấy danh sách courses theo program và level' };
      }
  },
  // =========================
  // PLO MAPPING FUNCTIONS
  // =========================
=======
      console.error('Error fetching courses by program:', error);
      throw error.response?.data || { message: 'Không thể lấy danh sách khóa học' };
    }
  },
>>>>>>> origin/Namvv-teacher-class-management

  // Get PLOs of a Course's Program
  getProgramPLOs: async (courseId) => {
    try {
<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/${courseId}/program-plos`);
=======
      const response = await api.get(`/${courseId}/program-plos`);
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách PLO của chương trình' };
    }
  },

  // Update Course PLO Mapping
  updateCoursePLOMapping: async (courseId, mappedPLOs) => {
    try {
<<<<<<< HEAD
      const response = await axios.put(`${API_BASE_URL}/${courseId}/map-plos`, {
=======
      const response = await api.put(`/${courseId}/map-plos`, {
>>>>>>> origin/Namvv-teacher-class-management
        mappedPLOs
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật PLO mapping thất bại' };
    }
  },
};

export default courseService;
