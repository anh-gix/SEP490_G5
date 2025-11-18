import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const teacherService = {
  // Get current teacher info (from logged in user)
  getCurrentTeacher: async () => {
    try {
      const response = await axios.get(`${API_URL}/teachers/me`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current teacher schedule (from logged in user)
  getCurrentTeacherSchedule: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/me/schedule`, {
        params,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get lesson detail (ClassSchedule detail)
  getLessonDetail: async (scheduleId) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/me/lessons/${scheduleId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all teachers
  getAllTeachers: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/teachers`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get teacher by ID
  getTeacherById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get teacher schedule
  getTeacherSchedule: async (id, params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/${id}/schedule`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get teacher stats
  getTeacherStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/teachers/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create teacher
  createTeacher: async (teacherData) => {
    try {
      const response = await axios.post(`${API_URL}/teachers`, teacherData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update teacher
  updateTeacher: async (id, teacherData) => {
    try {
      const response = await axios.put(`${API_URL}/teachers/${id}`, teacherData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete teacher
  deleteTeacher: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/teachers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default teacherService;
