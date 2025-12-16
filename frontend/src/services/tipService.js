import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const tipService = {
  // Get all tips (có thể filter theo section)
  getAllTips: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/tips`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get tips by section (General, Toeic, Ielts)
  getTipsBySection: async (section) => {
    try {
      const response = await axios.get(`${API_URL}/tips/section/${section}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get tips statistics
  getTipsStatistics: async () => {
    try {
      const response = await axios.get(`${API_URL}/tips/statistics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new tip
  createTip: async (tipData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/tips`, tipData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update tip
  updateTip: async (tipId, tipData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/tips/${tipId}`, tipData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete tip
  deleteTip: async (tipId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/tips/${tipId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add video to category
  addVideoToCategory: async (section, categoryName, videoData, videoFile = null) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('categoryName', categoryName);
      formData.append('title', videoData.title);

      if (videoFile) {
        formData.append('video', videoFile);
      } else {
        formData.append('url', videoData.url);
      }

      const response = await axios.post(
        `${API_URL}/tips/${section}/videos`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update video
  updateVideo: async (section, videoId, videoData, videoFile = null) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('title', videoData.title);

      if (videoFile) {
        formData.append('video', videoFile);
      } else {
        formData.append('url', videoData.url);
      }

      if (videoData.order !== undefined) {
        formData.append('order', videoData.order);
      }

      const response = await axios.put(
        `${API_URL}/tips/${section}/videos/${videoId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete video
  deleteVideo: async (section, videoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/tips/${section}/videos/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default tipService;
