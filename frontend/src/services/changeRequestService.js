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
};

export default changeRequestService;

