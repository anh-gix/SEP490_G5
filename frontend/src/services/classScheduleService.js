import axios from 'axios';
const API_PORT = import.meta.env.VITE_API_PORT;
// Tạo axios instance với base URL cho class schedule API
const API_BASE_URL = `http://localhost:${API_PORT}/api/class-schedules`;
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Class Schedule service functions
export const classScheduleService = {
  // Lấy danh sách lớp của giáo viên
  getClassesByTeacher: async (teacherId) => {
    try {
      const response = await api.get(`/teacher/${teacherId}/classes`);
      console.log(teacherId);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách lớp' };
    }
  },

  // Lấy lịch học theo lớp
  getSchedulesByClass: async (classId) => {
    try {
      const response = await api.get(`/class/${classId}/schedules`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy lịch học' };
    }
  },

  // Validate: Kiểm tra conflict trước khi thêm buổi học
  validateAddClassSchedule: async (scheduleData) => {
    try {
      const response = await api.post('/validate', scheduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể validate buổi học' };
    }
  },

  // Validate học bù: Kiểm tra conflict với buổi học của học sinh
  validateMakeupClassSchedule: async (makeupClassScheduleId, studentId) => {
    try {
      const response = await api.post('/validate-makeup', {
        makeupClassScheduleId,
        studentId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể validate học bù' };
    }
  },

  // Preview: Xem trước khi thêm buổi học (chỉ log, không tạo)
  previewAddClassSchedule: async (scheduleData) => {
    try {
      const response = await api.post('/preview', scheduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể preview buổi học' };
    }
  },

  // Tạo buổi học mới
  createClassSchedule: async (scheduleData) => {
    try {
      const response = await api.post('/', scheduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể tạo buổi học' };
    }
  },

  // Điểm danh sinh viên
  markAttendance: async (studentScheduleId, attendanceData) => {
    try {
      const response = await api.patch(`/${studentScheduleId}/attendance`, attendanceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể điểm danh' };
    }
  },

  // Lấy danh sách điểm danh của một buổi học
  getAttendanceByClassSchedule: async (classScheduleId) => {
    try {
      const response = await api.get(`/${classScheduleId}/attendance`, {
        timeout: 5000 // 5 seconds timeout
      });
      return response.data;
    } catch (error) {
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw { message: 'Timeout: Request mất quá nhiều thời gian' };
      }
      throw error.response?.data || { message: 'Không thể lấy danh sách điểm danh' };
    }
  },

  // Lấy tất cả các phòng học
  getAllRooms: async () => {
    try {
      const response = await api.get('/rooms');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy danh sách phòng học' };
    }
  }
};

export default classScheduleService;
