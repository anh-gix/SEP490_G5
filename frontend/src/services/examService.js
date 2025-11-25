import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/exams';


export const examService = {
  getAllExams: async (params = {}) => {
    try {
      const response = await axios.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách đề thi' };
    }
  },

  getExamById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy thông tin đề thi' };
    }
  },

  createExam: async (examData) => {
    try {
      const response = await axios.post(API_BASE_URL, examData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo đề thi thất bại' };
    }
  },

  updateExam: async (id, examData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, examData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật đề thi thất bại' };
    }
  },

  deleteExam: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa đề thi thất bại' };
    }
  },


  publishExam: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${id}/publish`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Xuất bản đề thi thất bại' };
    }
  },

  unpublishExam: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${id}/unpublish`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Hủy xuất bản đề thi thất bại' };
    }
  },

  getExamSubmissions: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}/submissions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách bài làm' };
    }
  },

  // ==================== FILE UPLOADS ====================

  /**
   * Upload file đề thi (PDF/DOC) cho section
   * @param {File} file - File đề thi
   * @param {String} examId - Exam ID
   * @param {String} sectionId - Section ID
   * @param {Function} onUploadProgress - Callback để track upload progress
   * @returns {Promise} Response data với fileUrl
   */
  uploadExamFile: async (file, examId, sectionId, onUploadProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('examId', examId);
      formData.append('sectionId', sectionId);

      const response = await axios.post(`${API_BASE_URL}/upload/exam-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onUploadProgress ? (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        } : undefined
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Upload file đề thi thất bại' };
    }
  },

  /**
   * Upload file audio cho listening section
   * @param {File} file - File audio (MP3/WAV)
   * @param {String} examId - Exam ID
   * @param {String} sectionId - Section ID (phải là listening section)
   * @param {Function} onUploadProgress - Callback để track upload progress
   * @returns {Promise} Response data với audioUrl
   */
  uploadAudioFile: async (file, examId, sectionId, onUploadProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('examId', examId);
      formData.append('sectionId', sectionId);

      const response = await axios.post(`${API_BASE_URL}/upload/audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onUploadProgress ? (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        } : undefined
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Upload file audio thất bại' };
    }
  },

  /**
   * Upload file CSV/Excel đáp án và tự động parse câu hỏi
   * @param {File} file - File CSV/Excel đáp án
   * @param {String} examId - Exam ID
   * @param {String} sectionId - Section ID
   * @param {Function} onUploadProgress - Callback để track upload progress
   * @returns {Promise} Response data với số lượng câu hỏi đã parse
   */
  uploadAnswerKey: async (file, examId, sectionId, onUploadProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('examId', examId);
      formData.append('sectionId', sectionId);

      const response = await axios.post(`${API_BASE_URL}/upload/answer-key`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onUploadProgress ? (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        } : undefined
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Upload file đáp án thất bại' };
    }
  },

  // ==================== STUDENT EXAM SUBMISSION ====================

  /**
   * Bắt đầu làm bài thi (dành cho student)
   * @param {String} examId - Exam ID
   * @param {String} studentId - Student ID
   * @returns {Promise} Response data với submission info
   */
  startExam: async (examId, studentId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/start`, {
        examId,
        studentId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể bắt đầu làm bài' };
    }
  },

  /**
   * Lưu câu trả lời cho Reading/Listening
   * @param {String} submissionId - Submission ID
   * @param {Object} answerData - { sectionType, questionNumber, selectedOption }
   * @returns {Promise} Response data
   */
  saveObjectiveAnswer: async (submissionId, answerData) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/submissions/${submissionId}/objective`,
        answerData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lưu câu trả lời thất bại' };
    }
  },

  /**
   * Lưu bài viết Writing
   * @param {String} submissionId - Submission ID
   * @param {Object} writingData - { questionNumber, answerText }
   * @returns {Promise} Response data
   */
  saveWritingAnswer: async (submissionId, writingData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/submissions/${submissionId}/writing`,
        writingData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lưu bài viết thất bại' };
    }
  },

  /**
   * Upload file Speaking recording
   * @param {String} submissionId - Submission ID
   * @param {File} file - Audio file
   * @param {Number} questionNumber - Question number
   * @param {Function} onUploadProgress - Callback để track upload progress
   * @returns {Promise} Response data
   */
  uploadSpeakingRecording: async (submissionId, file, questionNumber, onUploadProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('questionNumber', questionNumber);

      const response = await axios.post(
        `${API_BASE_URL}/submissions/${submissionId}/speaking`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: onUploadProgress ? (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(percentCompleted);
          } : undefined
        }
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Upload file speaking thất bại' };
    }
  },

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Validate exam data trước khi tạo/cập nhật
   * @param {Object} examData - Dữ liệu exam
   * @param {Boolean} requireSections - Có yêu cầu sections hay không (default: true)
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validateExamData: (examData, requireSections = true) => {
    const errors = [];

    if (!examData.title || examData.title.trim() === '') {
      errors.push('Tiêu đề là bắt buộc');
    }

    if (!examData.level) {
      errors.push('Cấp độ là bắt buộc');
    }

    // Only validate sections if required
    if (requireSections) {
      if (!examData.sections || examData.sections.length === 0) {
        errors.push('Bài thi phải có ít nhất một section');
      }

      if (examData.sections && examData.sections.length > 0) {
        examData.sections.forEach((section, index) => {
          if (!section.type) {
            errors.push(`Section ${index + 1}: Loại section là bắt buộc`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Format exam data để phù hợp với backend schema
   * @param {Object} examData - Raw exam data
   * @returns {Object} Formatted exam data
   */
  formatExamData: (examData) => {
    return {
      title: examData.title,
      description: examData.description || '',
      examType: examData.examType || 'practice',
      level: examData.level,
      totalDuration: examData.totalDuration || 0,
      sections: examData.sections.map(section => ({
        type: section.type,
        instructions: section.instructions || '',
        duration: section.duration || 0,
        questionCount: section.questionCount || 0,
        fileUrl: section.fileUrl || '',
        audioUrls: section.audioUrls || [],
        answerKey: section.answerKey || []
      }))
    };
  },

  /**
   * Calculate total score của exam
   * @param {Object} exam - Exam object
   * @returns {Number} Total score
   */
  calculateTotalScore: (exam) => {
    if (!exam.sections) return 0;

    return exam.sections.reduce((total, section) => {
      const sectionScore = section.maxScore || 0;
      return total + sectionScore;
    }, 0);
  }
};

export default examService;
