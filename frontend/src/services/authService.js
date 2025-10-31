import axios from 'axios';
const API_PORT = import.meta.env.VITE_API_PORT;
// Tạo axios instance với base URL
const API_BASE_URL = `http://localhost:${API_PORT}/api/auth`;
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

// Auth service functions
export const authService = {
  // Đăng ký user mới
  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Đăng ký thất bại' };
    }
  },

  // Đăng nhập
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Đăng nhập thất bại' };
    }
  },

  // Lấy thông tin user profile
  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin user' };
    }
  },

  // Cập nhật profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật profile thất bại' };
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      // Ngay cả khi API call thất bại, vẫn xóa token local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error.response?.data || { message: 'Đăng xuất thất bại' };
    }
  },

  // Kiểm tra token có hợp lệ không
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Lấy token từ localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Lưu user data vào localStorage
  saveUserData: (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  },

  // Lấy user data từ localStorage
  getUserData: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
};

export default authService;
