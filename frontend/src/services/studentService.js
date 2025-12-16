import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const studentService = {
  // Get current student info (from logged in user)
  getCurrentStudent: async () => {
    try {
      const response = await axios.get(`${API_URL}/students/me`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get dashboard data for student
  getDashboardData: async () => {
    try {
      const response = await axios.get(`${API_URL}/students/me/dashboard`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current student's classes
  getMyClasses: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/students/me/classes`, {
        params,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current student's schedule
  getMySchedule: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/students/me/schedule`, {
        params,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get lesson detail by schedule ID
  getLessonDetail: async (scheduleId) => {
    try {
      const response = await axios.get(`${API_URL}/students/me/lessons/${scheduleId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get class materials
  getClassMaterials: async (classId) => {
    try {
      const response = await axios.get(`${API_URL}/students/me/classes/${classId}/materials`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get class homework
  getClassHomework: async (classId) => {
    try {
      const response = await axios.get(`${API_URL}/students/me/classes/${classId}/homework`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get class progress
  getClassProgress: async (classId) => {
    try {
      const response = await axios.get(`${API_URL}/students/me/classes/${classId}/progress`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Submit homework
  submitHomework: async (classId, scheduleId, homeworkId, formData) => {
    try {
      const response = await axios.post(
        `${API_URL}/students/me/classes/${classId}/schedules/${scheduleId}/homework/${homeworkId}/submit`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all students (for Academic Staff/Admin)
  getAllStudents: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/students`, {
        params,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get student statistics
  getStudentStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/students/stats`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get student by ID
  getStudentById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/students/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create student
  createStudent: async (studentData) => {
    try {
      const response = await axios.post(`${API_URL}/students`, studentData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update student
  updateStudent: async (id, studentData) => {
    try {
      const response = await axios.put(`${API_URL}/students/${id}`, studentData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete student
  deleteStudent: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/students/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Import students (bulk)
  importStudents: async (students) => {
    try {
      const response = await axios.post(`${API_URL}/students/import`, { students }, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get student schedule (wrapper for studentScheduleService)
  getStudentSchedule: async (studentId, params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/student-schedules/student/${studentId}/schedule`, {
        params,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default studentService;
