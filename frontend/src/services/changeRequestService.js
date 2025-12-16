import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào headers
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

const changeRequestService = {
  // Get stats (counts) for change requests
  getStats: async (params = {}) => {
    try {
      const response = await api.get('/change-requests/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching change request stats:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get all change requests with optional filters
  getAllChangeRequests: async (params = {}) => {
    try {
      const response = await api.get('/change-requests', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching change requests:', error);
      throw error.response?.data || error.message;
    }
  },

  // Create change request (for students)
  createChangeRequest: async (data) => {
    try {
      const response = await api.post('/students/me/change-requests', data);
      return response.data;
    } catch (error) {
      console.error('Error creating change request:', error);
      throw error.response?.data || error.message;
    }
  },

  // Create change request (for teachers - uses general endpoint)
  createTeacherChangeRequest: async (data) => {
    try {
      const response = await api.post('/change-requests', data);
      return response.data;
    } catch (error) {
      console.error('Error creating teacher change request:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get sender schedule
  getSenderSchedule: async (requestId) => {
    try {
      const response = await api.get(`/change-requests/${requestId}/schedule`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sender schedule:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get my change requests (for students - filtered by current user)
  getMyChangeRequests: async (params = {}) => {
    try {
      const response = await api.get('/change-requests', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching my change requests:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default changeRequestService;

