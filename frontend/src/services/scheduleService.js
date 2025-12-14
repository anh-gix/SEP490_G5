import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const scheduleService = {
  // Get all schedules with optional filters
  getAllSchedules: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/schedules`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error.response?.data || error;
    }
  },

  // Get schedule by ID
  getScheduleById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error.response?.data || error;
    }
  },

  // Get schedule statistics
  getScheduleStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/schedules/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule stats:', error);
      throw error.response?.data || error;
    }
  },

  // Get pending schedules (for approval)
  getPendingSchedules: async () => {
    try {
      const response = await axios.get(`${API_URL}/schedules/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending schedules:', error);
      throw error.response?.data || error;
    }
  },

  // Create new schedule
  createSchedule: async (scheduleData) => {
    try {
      const response = await axios.post(`${API_URL}/schedules`, scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error.response?.data || error;
    }
  },

  // Update schedule
  updateSchedule: async (id, scheduleData) => {
    try {
      const response = await axios.put(`${API_URL}/schedules/${id}`, scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error.response?.data || error;
    }
  },

  // Delete schedule
  deleteSchedule: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error.response?.data || error;
    }
  },

  // Approve schedule
  approveSchedule: async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/schedules/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving schedule:', error);
      throw error.response?.data || error;
    }
  },

  // Reject schedule
  rejectSchedule: async (id, reason) => {
    try {
      const response = await axios.patch(`${API_URL}/schedules/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting schedule:', error);
      throw error.response?.data || error;
    }
  },

  // Check for schedule conflicts (helper method)
  checkConflict: async (scheduleData) => {
    try {
      // This will attempt to create and catch the conflict error
      await axios.post(`${API_URL}/schedules`, { ...scheduleData, dryRun: true });
      return { hasConflict: false };
    } catch (error) {
      if (error.response?.data?.message?.includes('conflict')) {
        return { 
          hasConflict: true, 
          message: error.response.data.message 
        };
      }
      throw error;
    }
  }
};

export default scheduleService;
