import api from './api';

const ENDPOINT = '/center-head';

const centerHeadService = {
  // =========================
  // DASHBOARD APIs
  // =========================

  // Get all dashboard data (stats, pending requests, pending activation, recent activities)
  getDashboard: async () => {
    const response = await api.get(`${ENDPOINT}/dashboard`);
    return response.data;
  },

  // Get dashboard statistics only
  getDashboardStats: async () => {
    const response = await api.get(`${ENDPOINT}/dashboard/stats`);
    return response.data;
  },

  // Get pending work requests for approval
  getPendingRequests: async (params = {}) => {
    const response = await api.get(`${ENDPOINT}/dashboard/pending-requests`, { params });
    return response.data;
  },

  // Get items pending activation/publish
  getPendingActivation: async () => {
    const response = await api.get(`${ENDPOINT}/dashboard/pending-activation`);
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    const response = await api.get(`${ENDPOINT}/dashboard/recent-activities`, {
      params: { limit },
    });
    return response.data;
  },

  // =========================
  // ACTIVATE/PUBLISH APIs
  // =========================

  // Programs - using new API with validation logic
  activateProgram: async (programId) => {
    const response = await api.patch(`/programs/${programId}/activate`);
    return response.data;
  },

  deactivateProgram: async (programId, force = false) => {
    const response = await api.patch(`/programs/${programId}/deactivate`, { force });
    return response.data;
  },

  // Courses - using new API with validation logic
  canDeactivateCourse: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/can-deactivate`);
    return response.data;
  },

  activateCourse: async (courseId) => {
    const response = await api.patch(`/courses/${courseId}/activate`);
    return response.data;
  },

  deactivateCourse: async (courseId, force = false) => {
    const response = await api.patch(`/courses/${courseId}/deactivate`, { force });
    return response.data;
  },

  // Programs - using new API with validation logic
  canDeactivateProgram: async (programId) => {
    const response = await api.get(`/programs/${programId}/can-deactivate`);
    return response.data;
  },

  // Exams
  publishExam: async (examId) => {
    const response = await api.post(`${ENDPOINT}/exams/${examId}/publish`);
    return response.data;
  },

  unpublishExam: async (examId) => {
    const response = await api.post(`${ENDPOINT}/exams/${examId}/unpublish`);
    return response.data;
  },

  // =========================
  // LEGACY APIs (backward compatibility)
  // =========================

  // Get pending courses
  getPendingCourses: async () => {
    const response = await api.get(`${ENDPOINT}/courses/pending`);
    return response.data;
  },

  // Get pending schedules
  getPendingSchedules: async () => {
    const response = await api.get(`${ENDPOINT}/schedules/pending`);
    return response.data;
  },

  // Approve course
  approveCourse: async (courseId) => {
    const response = await api.post(`${ENDPOINT}/courses/${courseId}/approve`);
    return response.data;
  },

  // Reject course
  rejectCourse: async (courseId, reason) => {
    const response = await api.post(`${ENDPOINT}/courses/${courseId}/reject`, { reason });
    return response.data;
  },

  // Approve schedule
  approveSchedule: async (scheduleId) => {
    const response = await api.post(`${ENDPOINT}/schedules/${scheduleId}/approve`);
    return response.data;
  },

  // Reject schedule
  rejectSchedule: async (scheduleId, reason) => {
    const response = await api.post(`${ENDPOINT}/schedules/${scheduleId}/reject`, { reason });
    return response.data;
  },
};

export default centerHeadService;
