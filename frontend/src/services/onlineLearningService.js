import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const onlineLearningService = {
  // ========================
<<<<<<< HEAD
  // 📚 GET STUDENT'S ONLINE COURSES
=======
  //  GET STUDENT'S ONLINE COURSES
>>>>>>> origin/Namvv-teacher-class-management
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
<<<<<<< HEAD
  // 📖 GET COURSE DETAIL
=======
  //  GET COURSE DETAIL
>>>>>>> origin/Namvv-teacher-class-management
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
<<<<<<< HEAD
  // 📝 GET SESSION CONTENT
=======
  //  GET SESSION CONTENT
>>>>>>> origin/Namvv-teacher-class-management
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
<<<<<<< HEAD
  // 📊 GET COURSE PROGRESS OVERVIEW
=======
  //  GET COURSE PROGRESS OVERVIEW
>>>>>>> origin/Namvv-teacher-class-management
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
<<<<<<< HEAD
  // ✅ UPDATE SESSION PROGRESS
=======
  //  UPDATE SESSION PROGRESS
>>>>>>> origin/Namvv-teacher-class-management
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
<<<<<<< HEAD
  // 📝 MARK QUIZ AS COMPLETED
=======
  //  MARK QUIZ AS COMPLETED
>>>>>>> origin/Namvv-teacher-class-management
  // ========================
  markQuizCompleted: async (courseId, sessionId) => {
    return onlineLearningService.updateProgress(courseId, sessionId, { quiz: true });
  },

  // ========================
<<<<<<< HEAD
  // 📚 MARK VOCABULARY AS COMPLETED
=======
  //  MARK VOCABULARY AS COMPLETED
>>>>>>> origin/Namvv-teacher-class-management
  // ========================
  markVocabularyCompleted: async (courseId, sessionId) => {
    return onlineLearningService.updateProgress(courseId, sessionId, { vocabulary: true });
  }
};

export default onlineLearningService;
