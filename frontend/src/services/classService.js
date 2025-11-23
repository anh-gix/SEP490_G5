import axios from 'axios';

const API_URL = 'http://localhost:8080/api/classes';

const classService = {
  // Get all classes with optional filters
  getAllClasses: async (params = {}) => {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error.response?.data || error;
    }
  },

  // Get class by ID
  getClassById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error.response?.data || error;
    }
  },

  // Get class statistics
  getClassStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching class stats:', error);
      throw error.response?.data || error;
    }
  },

  // Create new class
  createClass: async (classData) => {
    try {
      const response = await axios.post(API_URL, classData);
      return response.data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error.response?.data || error;
    }
  },

  // Update class
  updateClass: async (id, classData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, classData);
      return response.data;
    } catch (error) {
      console.error('Error updating class:', error);
      throw error.response?.data || error;
    }
  },

  // Delete class
  deleteClass: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error.response?.data || error;
    }
  },

  // Get schedules for a specific class
  getClassSchedules: async (classId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/schedules`, {
        params: { classId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching class schedules:', error);
      throw error.response?.data || error;
    }
  },

  // Check teacher and room conflicts
  checkTeacherRoomConflicts: async (classId, conflictData) => {
    try {
      const response = await axios.post(`${API_URL}/${classId}/check-teacher-room-conflicts`, conflictData);
      return response.data;
    } catch (error) {
      console.error('Error checking teacher/room conflicts:', error);
      throw error.response?.data || error;
    }
  },

  // Validate conflicts before creating class (does not create the class)
  validateConflicts: async (classData) => {
    try {
      const response = await axios.post(`${API_URL}/validate-conflicts`, classData);
      return response.data;
    } catch (error) {
      console.error('Error validating conflicts:', error);
      throw error.response?.data || error;
    }
  }
};

export default classService;
