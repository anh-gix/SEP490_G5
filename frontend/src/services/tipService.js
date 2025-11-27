import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const tipService = {
  // Get all tips (có thể filter theo section)
  getAllTips: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/tips`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get tips by section (General, Toeic, Ielts)
  getTipsBySection: async (section) => {
    try {
      const response = await axios.get(`${API_URL}/tips/section/${section}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get tips statistics
  getTipsStatistics: async () => {
    try {
      const response = await axios.get(`${API_URL}/tips/statistics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default tipService;
