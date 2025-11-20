import CenterHeadDashboardPage from "../pages/CenterHeadDashboardPage.jsx";
import UserListPage from "../pages/UserListPage.jsx";
import UserCreatePage from "../pages/UserCreatePage.jsx";
import UserEditPage from "../pages/UserEditPage.jsx";
import RoleManagementPage from "../pages/RoleManagementPage.jsx";
import ProgramListPage from "../pages/ProgramListPage.jsx";
import ProgramDetailPage from "../pages/ProgramDetailPage.jsx";
import PendingCoursesPage from "../pages/PendingCoursesPage.jsx";
import CourseDetailPage from "../pages/CourseDetailPage.jsx";
import ClassListPage from "../pages/ClassListPage.jsx";
import PendingSchedulesPage from "../pages/PendingSchedulesPage.jsx";
import RoomListPage from "../pages/RoomListPage.jsx";
import ExamListPage from "../pages/ExamListPage.jsx";
import ExamCreatePage from "../pages/ExamCreatePage.jsx";
import ReportsOverviewPage from "../pages/ReportsOverviewPage.jsx";

/**
 * CenterHeadRoutes
 *
 * Tất cả routes cho Center Head
 */
export const centerHeadRoutes = [
  // Dashboard
  { path: '/center-head/dashboard', element: <CenterHeadDashboardPage /> },

  // I. User Management
  { path: '/center-head/users', element: <UserListPage /> },
  { path: '/center-head/users/create', element: <UserCreatePage /> },
  { path: '/center-head/users/:id/edit', element: <UserEditPage /> },
  { path: '/center-head/roles', element: <RoleManagementPage /> },

  // II. Program & Course Management
  { path: '/center-head/programs', element: <ProgramListPage /> },
  { path: '/center-head/programs/:id', element: <ProgramDetailPage /> },
  { path: '/center-head/courses/pending', element: <PendingCoursesPage /> },
  { path: '/center-head/courses/:id/details', element: <CourseDetailPage /> },

  // III. Class & Schedule Management
  { path: '/center-head/classes', element: <ClassListPage /> },
  { path: '/schedules/pending', element: <PendingSchedulesPage /> },

  // IV. Room Management
  { path: '/center-head/rooms', element: <RoomListPage /> },

  // V. Exam Management
  { path: '/center-head/exams', element: <ExamListPage /> },
  { path: '/center-head/exams/create', element: <ExamCreatePage /> },

  // VI. Reports & Analytics
  { path: '/center-head/reports', element: <ReportsOverviewPage /> },
];