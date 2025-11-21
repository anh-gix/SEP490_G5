import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/courses';

// Course service functions
export const courseService = {
  // Lấy tất cả courses
  getAllCourses: async (params = {}) => {
    try {
      const response = await axios.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách giáo trình' };
    }
  },

  // Lấy course theo ID
  getCourseById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin giáo trình' };
    }
  },

  // Tạo course mới
  createCourse: async (courseData) => {
    try {
      const response = await axios.post(API_BASE_URL, courseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo giáo trình thất bại' };
    }
  },

  // Cập nhật course
  updateCourse: async (id, courseData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, courseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật giáo trình thất bại' };
    }
  },

  // Xóa course
  deleteCourse: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa giáo trình thất bại' };
    }
  },

  // Lấy danh sách courses chờ phê duyệt
  getPendingCourses: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pending`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách giáo trình chờ duyệt' };
    }
  },

  // Lấy chi tiết course (với sessions, CLOs)
  getCourseDetails: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}/details`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy chi tiết giáo trình' };
    }
  },

  // Phê duyệt course
  approveCourse: async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Phê duyệt giáo trình thất bại' };
    }
  },

  // Yêu cầu chỉnh sửa course
  requestRevision: async (id, data) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/revise`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gửi yêu cầu chỉnh sửa thất bại' };
    }
  },
};

export default courseService;
