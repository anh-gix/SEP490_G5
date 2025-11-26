import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const courseHomeService = {
  // Lấy danh sách khóa học theo loại (IELTS, TOEIC, CAM)
  getCoursesByType: async (type) => {
    try {
      const response = await axios.get(`${API_URL}/courseshome/by-type`, {
        params: { type },
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi khi tải danh sách khóa học",
        }
      );
    }
  },

  // Lấy chi tiết khóa học cho trang CourseDetails
  getCourseHomeById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/courseshome/course-home/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Không thể tải thông tin khóa học",
        }
      );
    }
  },

  // Lấy chi tiết Cam Session của một khóa học
  getCamSessionByCourseAndSession: async (courseId, sessionId) => {
    try {
      const response = await axios.get(
        `${API_URL}/courseshome/course-home/${courseId}/cam-session/${sessionId}`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Không thể tải thông tin Cam Session",
        }
      );
    }
  },
};

export default courseHomeService;


