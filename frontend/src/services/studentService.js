import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const studentService = {
  // Get all students
  getAllStudents: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/students`, { params });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = typeof errorData === 'string' 
        ? errorData 
        : errorData?.message || error.message || 'Lỗi không xác định';
      const errorObj = {
        message: errorMessage,
        status: error.response?.status,
        response: error.response
      };
      throw errorObj;
    }
  },

  // Get student by ID
  getStudentById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/students/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get student schedule
  getStudentSchedule: async (id, params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/students/${id}/schedule`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get student stats
  getStudentStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/students/stats`);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = typeof errorData === 'string' 
        ? errorData 
        : errorData?.message || error.message || 'Lỗi không xác định';
      const errorObj = {
        message: errorMessage,
        status: error.response?.status,
        response: error.response
      };
      throw errorObj;
    }
  },

  // Create student
  createStudent: async (studentData) => {
    try {
      const response = await axios.post(`${API_URL}/students`, studentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update student
  updateStudent: async (id, studentData) => {
    try {
      const response = await axios.put(`${API_URL}/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete student
  deleteStudent: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/students/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default studentService;

