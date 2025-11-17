import AcademicDashboardPage from "../pages/AcademicStaff/AcademicDashboardPage.jsx";
import ScheduleManagementPage from "../pages/AcademicStaff/ScheduleManagementPage.jsx";
import ClassManagementPage from "../pages/AcademicStaff/ClassManagementPage.jsx";
import RoomManagementPage from "../pages/AcademicStaff/RoomManagementPage.jsx";
import TeacherManagementPage from "../pages/AcademicStaff/TeacherManagementPage.jsx";
import ReportsPage from "../pages/AcademicStaff/ReportsPage.jsx";
import AcademicLessonDetailPage from "../pages/AcademicStaff/AcademicLessonDetailPage.jsx";

/**
 * AcademicRoutes
 *
 * Tất cả routes cho Giáo vụ (Academic Staff)
 */
export const academicRoutes = [
  // Dashboard
  { path: '/academic/dashboard', element: <AcademicDashboardPage /> },

  // I. Schedule Management
  { path: 'academic/schedule-management', element: <ScheduleManagementPage /> },
  { path: '/academic/lessons/:lessonId', element: <AcademicLessonDetailPage /> },

  // II. Class Management
  { path: '/academic/class-management', element: <ClassManagementPage /> },

  // III. Room Management
  { path: '/academic/room-management', element: <RoomManagementPage /> },

  // IV. Teacher Management
  { path: '/academic/teacher-management', element: <TeacherManagementPage /> },

  // V. Reports
  { path: '/academic/ reports', element: <ReportsPage /> },
];
