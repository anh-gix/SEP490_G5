import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const teacherService = {
  // Get current teacher info (from logged in user)
  getCurrentTeacher: async () => {
    try {
      const response = await axios.get(`${API_URL}/teachers/me`, {
        headers: getAuthHeader()
      });
<<<<<<< HEAD
=======
      console.log(response);
>>>>>>> origin/Namvv-teacher-class-management
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get teacher dashboard data
  getTeacherDashboard: async () => {
    try {
      const response = await axios.get(`${API_URL}/teachers/me/dashboard`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current teacher schedule (from logged in user)
  getCurrentTeacherSchedule: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/me/schedule`, {
        params,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get lesson detail (ClassSchedule detail)
  getLessonDetail: async (scheduleId) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/me/lessons/${scheduleId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current teacher's classes
  getMyClasses: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/me/classes`, {
        params,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current teacher's class detail
  getMyClassDetail: async (classId) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/me/classes/${classId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all teachers
  getAllTeachers: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/teachers`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get teacher by ID
  getTeacherById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get teacher schedule
  getTeacherSchedule: async (id, params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/${id}/schedule`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get teacher stats
  getTeacherStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/teachers/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create teacher
  createTeacher: async (teacherData) => {
    try {
      const response = await axios.post(`${API_URL}/teachers`, teacherData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update teacher
  updateTeacher: async (id, teacherData) => {
    try {
      const response = await axios.put(`${API_URL}/teachers/${id}`, teacherData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete teacher
  deleteTeacher: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/teachers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Import teachers (bulk)
  importTeachers: async (teachers) => {
    try {
      const response = await axios.post(`${API_URL}/teachers/import`, { teachers }, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add homework to ClassSchedule
  addHomework: async (scheduleId, formData) => {
    try {
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

  // Update homework
  updateHomework: async (scheduleId, homeworkId, formData) => {
    try {
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

  // Delete homework
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

  // Get homework submissions
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

  // Update mocktest score for a student
  updateMocktestScore: async (scheduleId, studentId, scores) => {
    try {
      const response = await axios.put(
        `${API_URL}/teachers/me/mocktest/${scheduleId}/student/${studentId}`,
        scores,
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

<<<<<<< HEAD
=======
  // Import mocktest scores in bulk
  importMocktestScores: async (classId, scheduleId, scores) => {
    try {
      const response = await axios.post(
        `${API_URL}/teachers/me/classes/${classId}/mocktest/import-scores`,
        { scheduleId, scores },
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

>>>>>>> origin/Namvv-teacher-class-management
  // Save attendance for a schedule
  saveAttendance: async (scheduleId, attendanceData) => {
    try {
      const response = await axios.post(
        `${API_URL}/teachers/me/attendance/${scheduleId}`,
        { attendanceData },
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
<<<<<<< HEAD
=======
  },

  // ===========================
  // MATERIAL MANAGEMENT
  // ===========================

  // Get course materials (read-only)
  getCourseMaterials: async (courseId) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${courseId}/materials`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get class materials (editable by teacher)
  getClassMaterials: async (classId) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/me/classes/${classId}/materials`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add material to class schedule
  addMaterialToSchedule: async (scheduleId, files, titles) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('materials', file);
      });
      
      // Add titles as separate field (JSON array)
      if (titles && titles.length > 0) {
        formData.append('titles', JSON.stringify(titles));
      }

      const response = await axios.post(
        `${API_URL}/teachers/me/schedules/${scheduleId}/materials`,
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

  // Delete material from class schedule
  deleteMaterialFromSchedule: async (scheduleId, materialUrl) => {
    try {
      const response = await axios.delete(
        `${API_URL}/teachers/me/schedules/${scheduleId}/materials`,
        {
          headers: getAuthHeader(),
          data: { materialUrl }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
>>>>>>> origin/Namvv-teacher-class-management
  }
};

export default teacherService;
