import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const reportService = {
  // Get overview report
  getOverviewReport: async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/overview`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get class report
  getClassReport: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/reports/classes`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get student report
  getStudentReport: async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/students`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get teacher report
  getTeacherReport: async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/teachers`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get financial report
  getFinancialReport: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/reports/financial`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get time-based report
  getTimeBasedReport: async (period = 'month') => {
    try {
      const response = await axios.get(`${API_URL}/reports/time-based`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default reportService;
