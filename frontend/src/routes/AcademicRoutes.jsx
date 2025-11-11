import AcademicDashboardPage from "../pages/AcademicDashboardPage.jsx";
import ScheduleManagementPage from "../pages/ScheduleManagementPage.jsx";
import ClassManagementPage from "../pages/ClassManagementPage.jsx";

/**
 * AcademicRoutes
 *
 * Tất cả routes cho Giáo vụ (Academic Staff)
 */
export const academicRoutes = [
  // Dashboard
  { path: '/academic-dashboard', element: <AcademicDashboardPage /> },

  // I. Schedule Management
  { path: '/schedule-management', element: <ScheduleManagementPage /> },

  // II. Class Management
  { path: '/class-management', element: <ClassManagementPage /> },

  // III. Room Management (future)
  // { path: '/room-management', element: <RoomManagementPage /> },

  // IV. Teacher Management (future)
  // { path: '/teacher-management', element: <TeacherManagementPage /> },

  // V. Reports (future)
  // { path: '/reports', element: <ReportsPage /> },
];
