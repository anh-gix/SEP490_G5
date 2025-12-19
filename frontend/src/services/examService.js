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
  // ================== CENTER HEAD - EXAM MANAGEMENT ==================

  // Lấy tất cả exam cho management (Center Head)
  getAllExamsForManagement: async (params = {}) => {
    try {
      const response = await api.get('/management', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách bài thi' };
    }
  },

  // Lấy exam của tôi (created by current user) - dùng cho teacher exam list
  getMyExams: async (params = {}) => {
    try {
      const response = await api.get('/my-exams', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách exam của bạn' };
    }
  },

  // Lấy chi tiết exam cho management
  getExamByIdForManagement: async (examId) => {
    try {
      const response = await api.get(`/management/${examId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin bài thi' };
    }
  },

  // Tạo exam mới
  createExamForManagement: async (examData) => {
    try {
      const response = await api.post('/management', examData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể tạo đề thi' };
    }
  },

  // Cập nhật exam
  updateExamForManagement: async (examId, examData) => {
    try {
      const response = await api.put(`/management/${examId}`, examData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể cập nhật đề thi' };
    }
  },

  // Xóa exam
  deleteExamForManagement: async (examId) => {
    try {
      const response = await api.delete(`/management/${examId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể xóa đề thi' };
    }
  },

  // Alias cho deleteExamForManagement
  deleteExam: async (examId) => {
    return examService.deleteExamForManagement(examId);
  },

  // Publish exam
  publishExamForManagement: async (examId) => {
    try {
      const response = await api.post(`/management/${examId}/publish`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể xuất bản đề thi' };
    }
  },

  // Unpublish exam
  unpublishExamForManagement: async (examId) => {
    try {
      const response = await api.post(`/management/${examId}/unpublish`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể hủy xuất bản đề thi' };
    }
  },

  // Submit exam for approval
  submitExamForApproval: async (examId, submissionNote) => {
    try {
      // Lấy user info từ localStorage
      const userStr = localStorage.getItem('user');
      let submittedBy = null;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          submittedBy = user._id || user.id;
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }

      const response = await api.post(`/management/${examId}/submit-for-approval`, {
        submissionNote,
        submittedBy
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể nộp đề thi để duyệt' };
    }
  },

  // Withdraw exam submission
  withdrawExamSubmission: async (examId) => {
    try {
      const response = await api.post(`/management/${examId}/withdraw`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể rút lại đề thi' };
    }
  },

  // Upload answer key CSV/Excel
  uploadAnswerKeyForManagement: async (formData) => {
    try {
      const response = await api.post('/management/upload-answer-key', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể upload file đáp án' };
    }
  },

  // Validate exam data trước khi gửi
  validateExamData: (examData) => {
    const errors = [];

    if (!examData.title || examData.title.trim() === '') {
      errors.push('Tiêu đề đề thi không được để trống');
    }

    if (!examData.level) {
      errors.push('Cấp độ đề thi không được để trống');
    }

    if (examData.sections && examData.sections.length > 0) {
      examData.sections.forEach((section, index) => {
        if (!section.type) {
          errors.push(`Section ${index + 1}: Loại section không được để trống`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format exam data trước khi gửi
  formatExamData: (examData) => {
    // Format sections - loại bỏ id frontend (Date.now()) để MongoDB tự tạo _id
    const formattedSections = (examData.sections || []).map(section => {
      const { id, ...rest } = section; // Remove frontend id
      return rest;
    });

    return {
      title: examData.title?.trim(),
      description: examData.description?.trim() || '',
      examType: examData.examType || 'cambridge', // Default to cambridge
      level: examData.level,
      totalDuration: parseInt(examData.totalDuration) || 0,
      sections: formattedSections,
      isPublished: examData.isPublished || false,
      lastCompletedStep: examData.lastCompletedStep || 0
    };
  },

  // ================== STUDENT - PUBLIC EXAMS ==================

  // Lấy danh sách bài thi (public - chỉ published)
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

  // Tạo submission mới (làm lại)
  createNewSubmission: async (examId) => {
    try {
      const response = await api.post('/create-new-submission', { examId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể tạo bài làm mới' };
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
  submitReadingAnswers: async (examId, submissionId, data) => {
    try {
      const response = await api.post(`/${examId}/submissions/${submissionId}/reading/submit`, data);
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

  // Lấy thông tin section Listening
  getListeningSection: async (examId, submissionId) => {
    try {
      const response = await api.get(`/${examId}/submissions/${submissionId}/listening`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin phần Listening' };
    }
  },

  // Nộp đáp án Listening
  submitListeningAnswers: async (examId, submissionId, data) => {
    try {
      const response = await api.post(`/${examId}/submissions/${submissionId}/listening/submit`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể nộp đáp án' };
    }
  },

  // Xem kết quả Listening
  getListeningResult: async (examId, submissionId) => {
    try {
      const response = await api.get(`/${examId}/submissions/${submissionId}/listening/result`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy kết quả' };
    }
  },

  // Lấy thông tin section Writing
  getWritingSection: async (examId, submissionId) => {
    try {
      const response = await api.get(`/${examId}/submissions/${submissionId}/writing`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin phần Writing' };
    }
  },

  // Nộp đáp án Writing
  submitWritingAnswers: async (examId, submissionId, data) => {
    try {
      const response = await api.post(`/${examId}/submissions/${submissionId}/writing/submit`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể nộp đáp án' };
    }
  },

  // Xem kết quả Writing
  getWritingResult: async (examId, submissionId) => {
    try {
      const response = await api.get(`/${examId}/submissions/${submissionId}/writing/result`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy kết quả' };
    }
  },

  // Lấy thông tin section Speaking
  getSpeakingSection: async (examId, submissionId) => {
    try {
      const response = await api.get(`/${examId}/submissions/${submissionId}/speaking`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin phần Speaking' };
    }
  },

  // Nộp đáp án Speaking (với file upload)
  submitSpeakingAnswers: async (examId, submissionId, formData) => {
    try {
      // formData should already contain parts and files
      const response = await api.post(`/${examId}/submissions/${submissionId}/speaking/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể nộp đáp án' };
    }
  },

  // Xem kết quả Speaking
  getSpeakingResult: async (examId, submissionId) => {
    try {
      const response = await api.get(`/${examId}/submissions/${submissionId}/speaking/result`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy kết quả' };
    }
  },
  
  // Lấy danh sách submissions của học sinh hiện tại
  getStudentSubmissions: async () => {
    try {
      const response = await api.get('/submissions/student');
      return response.data;
    } catch (error) {
      // Nếu endpoint chưa tồn tại, trả về mảng rỗng
      if (error.response?.status === 404) {
        return [];
      }
      throw error.response?.data || { message: 'Không thể lấy danh sách bài làm' };
    }
  },

  // Lấy danh sách submissions của một exam cụ thể
  getExamSubmissions: async (examId) => {
    try {
      const response = await api.get(`/${examId}/submissions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy lịch sử bài làm' };
    }
  },
};

export default examService;

