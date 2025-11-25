import axios from 'axios';
const API_PORT = import.meta.env.VITE_API_PORT;

// Tạo axios instance với base URL cho student schedule API
const API_BASE_URL = `http://localhost:${API_PORT}/api/student-schedules`;
const api = axios.create({
  baseURL: API_BASE_URL,
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

// Student Schedule service functions
export const studentScheduleService = {
  // Lấy lịch học của học sinh
  getStudentSchedule: async (studentId) => {
    try {
      const response = await api.get(`/student/${studentId}/schedule`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy lịch học của học sinh' };
    }
  },
};

export default studentScheduleService;

