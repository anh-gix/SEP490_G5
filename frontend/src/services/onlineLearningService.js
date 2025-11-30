import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const onlineLearningService = {
  // ========================
  // 📚 GET STUDENT'S ONLINE COURSES
  // ========================
  getMyOnlineCourses: async () => {
    try {
      const response = await axios.get(`${API_URL}/online-learning/courses`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ========================
  // 📖 GET COURSE DETAIL
  // ========================
  getCourseDetail: async (courseId) => {
    try {
      const response = await axios.get(`${API_URL}/online-learning/courses/${courseId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ========================
  // 📝 GET SESSION CONTENT
  // ========================
  getSessionContent: async (courseId, sessionId) => {
    try {
      const response = await axios.get(
        `${API_URL}/online-learning/courses/${courseId}/sessions/${sessionId}`,
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ========================
  // 📊 GET COURSE PROGRESS OVERVIEW
  // ========================
  getCourseProgress: async (courseId) => {
    try {
      const response = await axios.get(
        `${API_URL}/online-learning/progress/${courseId}`,
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ========================
  // ✅ UPDATE SESSION PROGRESS
  // ========================
  updateProgress: async (courseId, sessionId, progressData) => {
    try {
      const response = await axios.put(
        `${API_URL}/online-learning/progress/${courseId}/sessions/${sessionId}`,
        progressData,
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ========================
  // 🎬 MARK VIDEO AS COMPLETED
  // ========================
  markVideoCompleted: async (courseId, sessionId) => {
    return onlineLearningService.updateProgress(courseId, sessionId, { video: true });
  },

  // ========================
  // 📝 MARK QUIZ AS COMPLETED
  // ========================
  markQuizCompleted: async (courseId, sessionId) => {
    return onlineLearningService.updateProgress(courseId, sessionId, { quiz: true });
  },

  // ========================
  // 📚 MARK VOCABULARY AS COMPLETED
  // ========================
  markVocabularyCompleted: async (courseId, sessionId) => {
    return onlineLearningService.updateProgress(courseId, sessionId, { vocabulary: true });
  }
};

export default onlineLearningService;
