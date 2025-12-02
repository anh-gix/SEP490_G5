import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const academicStaffService = {
  // Get dashboard data
  getDashboardData: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/academic-staff/dashboard`,
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get attendance for a schedule
  getAttendance: async (scheduleId) => {
    try {
      const response = await axios.get(
        `${API_URL}/academic-staff/class-schedules/${scheduleId}/attendance`,
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Approve change request
  approveChangeRequest: async (id, data = {}) => {
    try {
      const response = await axios.put(
        `${API_URL}/academic-staff/change-requests/${id}/approve`,
        data,
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reject change request
  rejectChangeRequest: async (id, responseContent) => {
    try {
      const response = await axios.put(
        `${API_URL}/academic-staff/change-requests/${id}/reject`,
        { responseContent },
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

export default academicStaffService;

