import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const courseService = {
  // Get all course types
  getAllTypes: async () => {
    try {
      const response = await axios.get(`${API_URL}/v1/courses/all-types`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all course levels
  getAllLevels: async () => {
    try {
      const response = await axios.get(`${API_URL}/v1/courses/all-levels`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get levels by type
  getLevelsByType: async (type) => {
    try {
      const response = await axios.get(`${API_URL}/v1/courses/levels`, {
        params: { type }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get types by level
  getTypesByLevel: async (level) => {
    try {
      const response = await axios.get(`${API_URL}/v1/courses/types`, {
        params: { level }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get courses by program name and level
  getCoursesByProgram: async (programName, level) => {
    try {
      const response = await axios.get(`${API_URL}/v1/courses/by-program`, {
        params: { programName, level }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get band by type and level
  getBandByTypeAndLevel: async (type, level) => {
    try {
      const response = await axios.get(`${API_URL}/v1/courses/band`, {
        params: { type, level }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get course details
  getCourseDetails: async (courseId) => {
    try {
      const response = await axios.get(`${API_URL}/v1/courses/${courseId}/details`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get course mappings (if endpoint exists)
  getCourseMappings: async () => {
    try {
      const response = await axios.get(`${API_URL}/v1/courses/mappings`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get pending courses
  getPendingCourses: async () => {
    try {
      const response = await axios.get(`${API_URL}/v1/courses/pending`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Approve course
  approveCourse: async (courseId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/v1/courses/${courseId}/approve`,
        {},
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Request course revision
  requestRevision: async (courseId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/v1/courses/${courseId}/revise`,
        {},
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default courseService;

