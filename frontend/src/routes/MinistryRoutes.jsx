import AcademicDashboardPage from "../pages/AcademicDashboardPage.jsx";
import ScheduleManagementPage from "../pages/ScheduleManagementPage.jsx";
import ClassManagementPage from "../pages/ClassManagementPage.jsx";
import BulkUserUploadPage from "../pages/BulkUserUploadPage.jsx";

/**
 * MinistryRoutes
 *
 * Tất cả routes cho Ministry
 */
export const ministryRoutes = [
  // Dashboard
  { path: '/academic-dashboard', element: <AcademicDashboardPage /> },

  // Schedule Management
  { path: '/schedule-management', element: <ScheduleManagementPage /> },

  // Class Management
  { path: '/class-management', element: <ClassManagementPage /> },

  // User Management
  { path: '/bulk-users/upload', element: <BulkUserUploadPage /> },
];

