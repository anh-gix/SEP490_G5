import axios from 'axios';
const API_PORT = import.meta.env.VITE_API_PORT;

const API_BASE_URL = `http://localhost:${API_PORT}/api/exams`;
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

export const examService = {
  // Lấy danh sách bài thi
  getAllExams: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách bài thi' };
    }
  },

  // Lấy thông tin bài thi theo ID
  getExamById: async (examId) => {
    try {
      const response = await api.get(`/${examId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin bài thi' };
    }
  },

  // Bắt đầu làm bài thi
  startExam: async (examId) => {
    try {
      const response = await api.post('/start', { examId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể bắt đầu làm bài' };
    }
  },

  // Lấy thông tin section Reading
  getReadingSection: async (examId, submissionId) => {
    try {
      const response = await api.get(`/${examId}/submissions/${submissionId}/reading`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin phần Reading' };
    }
  },

  // Nộp đáp án Reading
  submitReadingAnswers: async (examId, submissionId, answers) => {
    try {
      const response = await api.post(`/${examId}/submissions/${submissionId}/reading/submit`, {
        answers,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể nộp đáp án' };
    }
  },

  // Xem kết quả Reading
  getReadingResult: async (examId, submissionId) => {
    try {
      const response = await api.get(`/${examId}/submissions/${submissionId}/reading/result`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy kết quả' };
    }
  },
};

export default examService;

