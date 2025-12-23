import axios from 'axios';
import { getCookie, removeCookie } from '../utils/cookieUtils.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper: attach auth interceptors to any axios client
const attachAuthInterceptors = (client) => {
  // Request: add bearer token from cookie
  client.interceptors.request.use(
    (config) => {
      const token = getCookie('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response: handle 401 -> clear cookies, redirect
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        removeCookie('token');
        removeCookie('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
};

// Axios instance with base URL (preferred client)
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach to both the custom instance and the global axios default
attachAuthInterceptors(api);
attachAuthInterceptors(axios);

export default api;
















