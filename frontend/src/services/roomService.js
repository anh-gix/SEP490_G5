import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const roomService = {
  // Get all rooms
  getAllRooms: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/rooms`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get room by ID
  getRoomById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/rooms/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get room schedule
  getRoomSchedule: async (id, date = null) => {
    try {
      const params = date ? { date } : {};
      const response = await axios.get(`${API_URL}/rooms/${id}/schedule`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get room stats
  getRoomStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create room
  createRoom: async (roomData) => {
    try {
      const response = await axios.post(`${API_URL}/rooms`, roomData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update room
  updateRoom: async (id, roomData) => {
    try {
      const response = await axios.put(`${API_URL}/rooms/${id}`, roomData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete room
  deleteRoom: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/rooms/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default roomService;
