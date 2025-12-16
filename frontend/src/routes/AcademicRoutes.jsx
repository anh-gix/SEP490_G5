import AcademicDashboardPage from "../pages/AcademicStaff/AcademicDashboardPage.jsx";
import ScheduleManagementPage from "../pages/AcademicStaff/ScheduleManagementPage.jsx";
import ClassManagementPage from "../pages/AcademicStaff/ClassManagementPage.jsx";
import RoomManagementPage from "../pages/AcademicStaff/RoomManagementPage.jsx";
import TeacherManagementPage from "../pages/AcademicStaff/TeacherManagementPage.jsx";
import StudentManagementPage from "../pages/AcademicStaff/StudentManagementPage.jsx";
import RequestManagementPage from "../pages/AcademicStaff/RequestManagementPage.jsx";
import AcademicProfilePage from "../pages/AcademicStaff/AcademicProfilePage.jsx";

/**
 * AcademicRoutes
 *
 * Tất cả routes cho Giáo vụ (Academic Staff)
 */
export const academicRoutes = [
  // Dashboard
  { path: '/academic/dashboard', element: <AcademicDashboardPage /> },

  // Profile
  { path: '/academic/profile', element: <AcademicProfilePage /> },

  // I. Schedule Management
  { path: '/academic/schedule-management', element: <ScheduleManagementPage /> },

  // II. Class Management
  { path: '/academic/class-management', element: <ClassManagementPage /> },

  // III. Room Management
  { path: '/academic/room-management', element: <RoomManagementPage /> },

  // IV. Request Management
  { path: '/academic/request-management', element: <RequestManagementPage /> },

  // V. Teacher Management
  { path: '/academic/teacher-management', element: <TeacherManagementPage /> },

  // VI. Student Management
  { path: '/academic/student-management', element: <StudentManagementPage /> },
];
