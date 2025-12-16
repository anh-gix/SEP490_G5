import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Mock data for development/testing
const MOCK_DATA_ENABLED = true; // Set to false to use real API

const mockTipsData = [
  {
    _id: '692858d41576d3c584bce120',
    section: 'General',
    categories: [
      {
        name: 'General',
        items: [
          {
            _id: '692858d41576d3c584bce121',
            title: 'Cách học tiếng Anh hiệu quả',
            url: 'https://youtu.be/dQw4w9WgXcQ',
            order: 1
          }
        ]
      },
      {
        name: 'Listening',
        items: [
          {
            _id: '692858d41576d3c584bce122',
            title: 'Kỹ thuật nghe hiểu cơ bản',
            url: 'https://youtu.be/dQw4w9WgXcQ',
            order: 1
          },
          {
            _id: '692858d41576d3c584bce123',
            title: 'Luyện nghe nâng cao',
            url: 'https://youtu.be/dQw4w9WgXcQ',
            order: 2
          }
        ]
      },
      {
        name: 'Reading',
        items: []
      },
      {
        name: 'Speaking',
        items: []
      },
      {
        name: 'Writing',
        items: []
      },
      {
        name: 'Grammar',
        items: []
      },
      {
        name: 'Vocabulary',
        items: []
      }
    ],
    createdAt: '2025-11-27T13:57:40.406Z',
    updatedAt: '2025-11-27T13:57:40.406Z'
  },
  {
    _id: '692858d41576d3c584bce127',
    section: 'Toeic',
    categories: [
      {
        name: 'General',
        items: [
          {
            _id: '692858d41576d3c584bce129',
            title: 'Tổng quan thi TOEIC',
            url: 'https://youtu.be/gnFbEc-ELkg',
            order: 1
          }
        ]
      },
      {
        name: 'Listening',
        items: [
          {
            _id: '692858d41576d3c584bce12b',
            title: 'Chiến thuật nghe part 1',
            url: 'https://youtu.be/3XK4hJT0xRc',
            order: 1
          },
          {
            _id: '692858d41576d3c584bce12c',
            title: 'Chiến thuật nghe part 2',
            url: 'https://youtu.be/PPgutt63sKE',
            order: 2
          },
          {
            _id: '692858d41576d3c584bce12d',
            title: 'Chiến thuật nghe part 3',
            url: 'https://youtu.be/5FZAT8WgFaY',
            order: 3
          },
          {
            _id: '692858d41576d3c584bce12e',
            title: 'Chiến thuật nghe part 4',
            url: 'https://youtu.be/ISBhplyvEyo',
            order: 4
          }
        ]
      },
      {
        name: 'Reading',
        items: [
          {
            _id: '692858d41576d3c584bce130',
            title: 'Chiến thuật làm part 5',
            url: 'https://youtu.be/J8cl5LFuHbk',
            order: 1
          },
          {
            _id: '692858d41576d3c584bce131',
            title: 'Chiến thuật làm part 6',
            url: 'https://youtu.be/J8cl5LFuHbk',
            order: 2
          },
          {
            _id: '692858d41576d3c584bce132',
            title: 'Chiến thuật làm part 7',
            url: 'https://youtu.be/J8cl5LFuHbk',
            order: 3
          }
        ]
      },
      {
        name: 'Grammar',
        items: []
      },
      {
        name: 'Vocabulary',
        items: []
      }
    ],
    createdAt: '2025-11-27T13:57:40.406Z',
    updatedAt: '2025-11-27T13:57:40.406Z'
  },
  {
    _id: '692858d41576d3c584bce140',
    section: 'Ielts',
    categories: [
      {
        name: 'General',
        items: []
      },
      {
        name: 'Listening',
        items: []
      },
      {
        name: 'Reading',
        items: []
      },
      {
        name: 'Speaking',
        items: []
      },
      {
        name: 'Writing',
        items: []
      },
      {
        name: 'Vocabulary',
        items: []
      }
    ],
    createdAt: '2025-11-27T13:57:40.406Z',
    updatedAt: '2025-11-27T13:57:40.406Z'
  }
];

// Helper to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const tipService = {
  // Get all tips (có thể filter theo section)
  getAllTips: async (params = {}) => {
    if (MOCK_DATA_ENABLED) {
      await delay(500);
      return {
        success: true,
        message: 'Lấy danh sách tips thành công',
        total: mockTipsData.length,
        tips: mockTipsData
      };
    }

    try {
      const response = await axios.get(`${API_URL}/tips`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get tips by section (General, Toeic, Ielts)
  getTipsBySection: async (section) => {
    if (MOCK_DATA_ENABLED) {
      await delay(500);
      const tip = mockTipsData.find(t => t.section === section);

      if (!tip) {
        throw new Error(`Không tìm thấy tips cho section: ${section}`);
      }

      // Sort items by order
      tip.categories.forEach(cat => {
        cat.items.sort((a, b) => a.order - b.order);
      });

      const totalVideos = tip.categories.reduce((sum, cat) => sum + cat.items.length, 0);

      return {
        success: true,
        message: 'Lấy tips thành công',
        tip,
        statistics: {
          totalCategories: tip.categories.length,
          totalVideos,
          categoriesBreakdown: tip.categories.map(cat => ({
            name: cat.name,
            count: cat.items.length
          }))
        }
      };
    }

    try {
      const response = await axios.get(`${API_URL}/tips/section/${section}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get tips statistics
  getTipsStatistics: async () => {
    if (MOCK_DATA_ENABLED) {
      await delay(300);

      const statistics = {
        totalSections: mockTipsData.length,
        sections: mockTipsData.map(tip => {
          const totalVideos = tip.categories.reduce((sum, cat) => sum + cat.items.length, 0);
          return {
            section: tip.section,
            totalCategories: tip.categories.length,
            totalVideos,
            categories: tip.categories.map(cat => ({
              name: cat.name,
              videoCount: cat.items.length
            }))
          };
        }),
        grandTotal: mockTipsData.reduce((sum, tip) =>
          sum + tip.categories.reduce((catSum, cat) => catSum + cat.items.length, 0), 0
        )
      };

      return {
        success: true,
        message: 'Lấy thống kê tips thành công',
        statistics
      };
    }

    try {
      const response = await axios.get(`${API_URL}/tips/statistics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update tip (Admin only)
  updateTip: async (id, data) => {
    if (MOCK_DATA_ENABLED) {
      await delay(800);

      const tipIndex = mockTipsData.findIndex(t => t._id === id);

      if (tipIndex === -1) {
        throw new Error('Không tìm thấy tip');
      }

      // Update the tip
      mockTipsData[tipIndex] = {
        ...mockTipsData[tipIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };

      return {
        success: true,
        message: 'Cập nhật tip thành công',
        tip: mockTipsData[tipIndex]
      };
    }

    try {
      const response = await axios.put(`${API_URL}/tips/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create tip (Admin only)
  createTip: async (data) => {
    if (MOCK_DATA_ENABLED) {
      await delay(800);

      // Check if section already exists
      const existingTip = mockTipsData.find(t => t.section === data.section);
      if (existingTip) {
        throw new Error(`Tip cho section ${data.section} đã tồn tại`);
      }

      const newTip = {
        _id: `mock-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockTipsData.push(newTip);

      return {
        success: true,
        message: 'Tạo tip thành công',
        tip: newTip
      };
    }

    try {
      const response = await axios.post(`${API_URL}/tips`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete tip (Admin only)
  deleteTip: async (id) => {
    if (MOCK_DATA_ENABLED) {
      await delay(500);

      const tipIndex = mockTipsData.findIndex(t => t._id === id);

      if (tipIndex === -1) {
        throw new Error('Không tìm thấy tip');
      }

      mockTipsData.splice(tipIndex, 1);

      return {
        success: true,
        message: 'Xóa tip thành công'
      };
    }

    try {
      const response = await axios.delete(`${API_URL}/tips/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // VIDEO CRUD OPERATIONS
  // ==========================================

  // Add video to category
  addVideoToCategory: async (section, categoryName, videoData, videoFile = null) => {
    if (MOCK_DATA_ENABLED) {
      await delay(800);

      const tip = mockTipsData.find(t => t.section === section);
      if (!tip) {
        throw new Error(`Không tìm thấy tip cho section: ${section}`);
      }

      const category = tip.categories.find(cat => cat.name === categoryName);
      if (!category) {
        throw new Error(`Không tìm thấy category: ${categoryName}`);
      }

      // Auto-increment order
      const maxOrder = category.items.length > 0
        ? Math.max(...category.items.map(item => item.order))
        : 0;
      const newOrder = maxOrder + 1;

      const newVideo = {
        _id: `temp-${Date.now()}`,
        title: videoData.title,
        url: videoData.url,
        order: newOrder
      };

      category.items.push(newVideo);

      return {
        success: true,
        message: 'Thêm video thành công',
        video: newVideo,
        tip
      };
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('categoryName', categoryName);
      formData.append('title', videoData.title);

      if (videoFile) {
        formData.append('video', videoFile);
      } else if (videoData.url) {
        formData.append('url', videoData.url);
      }

      const response = await axios.post(
        `${API_URL}/tips/${section}/videos`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
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
    if (MOCK_DATA_ENABLED) {
      await delay(800);

      const tip = mockTipsData.find(t => t.section === section);
      if (!tip) {
        throw new Error(`Không tìm thấy tip cho section: ${section}`);
      }

      // Find video in all categories
      let foundVideo = null;
      let foundCategory = null;

      for (const category of tip.categories) {
        const video = category.items.find(item => item._id === videoId);
        if (video) {
          foundVideo = video;
          foundCategory = category;
          break;
        }
      }

      if (!foundVideo) {
        throw new Error('Không tìm thấy video');
      }

      // Check for duplicate order
      if (videoData.order !== undefined && videoData.order !== foundVideo.order) {
        const orderExists = foundCategory.items.some(
          item => item._id !== videoId && item.order === videoData.order
        );

        if (orderExists) {
          throw new Error(`Order ${videoData.order} đã tồn tại trong category này`);
        }
      }

      // Update video
      Object.assign(foundVideo, videoData);

      return {
        success: true,
        message: 'Cập nhật video thành công',
        video: foundVideo,
        tip
      };
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      if (videoData.title) formData.append('title', videoData.title);
      if (videoData.order !== undefined) formData.append('order', videoData.order);

      if (videoFile) {
        formData.append('video', videoFile);
      } else if (videoData.url) {
        formData.append('url', videoData.url);
      }

      const response = await axios.put(
        `${API_URL}/tips/${section}/videos/${videoId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
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
    if (MOCK_DATA_ENABLED) {
      await delay(500);

      const tip = mockTipsData.find(t => t.section === section);
      if (!tip) {
        throw new Error(`Không tìm thấy tip cho section: ${section}`);
      }

      // Find and remove video
      let videoRemoved = false;

      for (const category of tip.categories) {
        const videoIndex = category.items.findIndex(item => item._id === videoId);
        if (videoIndex !== -1) {
          category.items.splice(videoIndex, 1);
          videoRemoved = true;
          break;
        }
      }

      if (!videoRemoved) {
        throw new Error('Không tìm thấy video');
      }

      return {
        success: true,
        message: 'Xóa video thành công',
        tip
      };
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/tips/${section}/videos/${videoId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
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
