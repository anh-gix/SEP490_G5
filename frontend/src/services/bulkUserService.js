import axios from 'axios';

const API_BASE_URL = `http://localhost:9999/api/v1/schedules`;
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

export const bulkUserService = {
  // Upload file Excel và parse dữ liệu
  uploadExcel: async (file) => {
    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await axios.post(
        `${API_BASE_URL}/bulk-users/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          timeout: 30000, // 30 seconds timeout
        }
      );
      return response.data;
    } catch (error) {
      // Giữ nguyên error object để frontend có thể truy cập error.response.data
      if (error.response) {
        // Server trả về response với status code error
        throw error;
      } else if (error.request) {
        // Request được gửi nhưng không có response
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Lỗi khi setup request
        throw new Error(error.message || 'Lỗi không xác định khi upload file');
      }
    }
  },

  // Lưu các tài khoản vào database
  saveBulkUsers: async (users, roleId) => {
    try {
      const response = await api.post('/bulk-users/save', {
        users,
        roleId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lưu tài khoản' };
    }
  },
};

export default bulkUserService;

