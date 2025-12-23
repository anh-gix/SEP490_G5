import axios from 'axios';
import { getCookie } from '../utils/cookieUtils.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper to get auth token
const getAuthHeader = () => {
  const token = getCookie('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const homeworkService = {
  // ========================
  //  TEACHER - HOMEWORK ASSIGNMENT
  // ========================

  /**
   * Lấy danh sách schedules của một class (để giao bài tập)
   * @param {string} classId - ID của class
   */
  getClassSchedules: async (classId) => {
    try {
      const response = await axios.get(`${API_URL}/homework/class/${classId}/schedules`, {
        headers: getAuthHeader()
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy tất cả assignments của teacher
   */
  getTeacherAssignments: async () => {
    try {
      const response = await axios.get(`${API_URL}/homework/teacher/assignments`, {
        headers: getAuthHeader()
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Thêm bài tập mới vào ClassSchedule
   * @param {string} scheduleId - ID của ClassSchedule
   * @param {Object} homeworkData - { title, deadline }
   * @param {File[]} assignmentFiles - Files đề bài (optional, max 5)
   * @param {File[]} answerFiles - Files đáp án (optional, max 5)
   */
  addHomework: async (scheduleId, homeworkData, assignmentFiles = [], answerFiles = []) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', homeworkData.title);
      if (homeworkData.description) formData.append('description', homeworkData.description);
      formData.append('deadline', homeworkData.deadline);
      
      // Add assignment files (max 5)
      if (assignmentFiles && assignmentFiles.length > 0) {
        assignmentFiles.slice(0, 5).forEach(file => {
          formData.append('assignmentFile', file);
        });
      }
      
      // Add answer files (max 5)
      if (answerFiles && answerFiles.length > 0) {
        answerFiles.slice(0, 5).forEach(file => {
          formData.append('answerFile', file);
        });
      }

      const response = await axios.post(
        `${API_URL}/homework/classSchedule/${scheduleId}`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Cập nhật bài tập
   * @param {string} scheduleId - ID của ClassSchedule
   * @param {string} homeworkId - ID của homework
   * @param {Object} homeworkData - { title, deadline }
   * @param {File[]} newAssignmentFiles - Files đề bài mới (optional)
   * @param {File[]} newAnswerFiles - Files đáp án mới (optional)
   * @param {string[]} deleteAssignmentFiles - URLs of files to delete
   * @param {string[]} deleteAnswerFiles - URLs of files to delete
   */
  updateHomework: async (
    scheduleId, 
    homeworkId, 
    homeworkData, 
    newAssignmentFiles = [], 
    newAnswerFiles = [],
    deleteAssignmentFiles = [],
    deleteAnswerFiles = []
  ) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      if (homeworkData.title) formData.append('title', homeworkData.title);
      if (homeworkData.description !== undefined) formData.append('description', homeworkData.description);
      if (homeworkData.deadline) formData.append('deadline', homeworkData.deadline);
      
      // Add new files
      if (newAssignmentFiles && newAssignmentFiles.length > 0) {
        newAssignmentFiles.slice(0, 5).forEach(file => {
          formData.append('assignmentFile', file);
        });
      }
      
      if (newAnswerFiles && newAnswerFiles.length > 0) {
        newAnswerFiles.slice(0, 5).forEach(file => {
          formData.append('answerFile', file);
        });
      }

      // Add files to delete
      if (deleteAssignmentFiles && deleteAssignmentFiles.length > 0) {
        deleteAssignmentFiles.forEach(fileUrl => {
          formData.append('deleteAssignmentFile', fileUrl);
        });
      }

      if (deleteAnswerFiles && deleteAnswerFiles.length > 0) {
        deleteAnswerFiles.forEach(fileUrl => {
          formData.append('deleteAnswerFile', fileUrl);
        });
      }

      const response = await axios.put(
        `${API_URL}/homework/classSchedule/${scheduleId}/homework/${homeworkId}`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Xóa bài tập
   */
  deleteHomework: async (scheduleId, homeworkId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/homework/classSchedule/${scheduleId}/homework/${homeworkId}`,
        {
          headers: getAuthHeader()
        }
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy danh sách submissions của một homework
   */
  getHomeworkSubmissions: async (homeworkId, scheduleId) => {
    try {
      const response = await axios.get(
        `${API_URL}/homework/${homeworkId}/submissions`,
        {
          params: { scheduleId },
          headers: getAuthHeader()
        }
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ========================
  //  STUDENT - HOMEWORK SUBMISSION
  // ========================

  /**
   * Nộp bài tập (student)
   * @param {string} classId - ID của class
   * @param {string} scheduleId - ID của ClassSchedule
   * @param {string} homeworkId - ID của homework
   * @param {File[]} files - Files bài làm
   */
  submitHomework: async (classId, scheduleId, homeworkId, files) => {
    try {
      const formData = new FormData();
      
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('submissionFile', file);
        });
      }

      const response = await axios.post(
        `${API_URL}/students/me/classes/${classId}/schedules/${scheduleId}/homework/${homeworkId}/submit`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy thông tin submission của student
   */
  getMySubmission: async (classId, scheduleId, homeworkId) => {
    try {
      const response = await axios.get(
        `${API_URL}/students/me/classes/${classId}/schedules/${scheduleId}/homework/${homeworkId}/submission`,
        {
          headers: getAuthHeader()
        }
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default homeworkService;
