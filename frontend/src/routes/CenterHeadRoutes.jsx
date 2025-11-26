import CenterHeadDashboardPage from "../pages/CenterHead/CenterHeadDashboardPage.jsx";
import UserListPage from "../pages/CenterHead/UserListPage.jsx";
import UserCreatePage from "../pages/CenterHead/UserCreatePage.jsx";
import UserEditPage from "../pages/CenterHead/UserEditPage.jsx";
import RoleManagementPage from "../pages/CenterHead/RoleManagementPage.jsx";
import ProgramListPage from "../pages/CenterHead/ProgramListPage.jsx";
import ProgramDetailPage from "../pages/CenterHead/ProgramDetailPage.jsx";
import ProgramFormPage from "../pages/CenterHead/ProgramFormPage.jsx";
import PendingCoursesPage from "../pages/CenterHead/PendingCoursesPage.jsx";
import CourseDetailPage from "../pages/CenterHead/CourseDetailPage.jsx";
import CourseFormPage from "../pages/CenterHead/CourseFormPage.jsx";
import ClassListPage from "../pages/CenterHead/ClassListPage.jsx";
import PendingSchedulesPage from "../pages/CenterHead/PendingSchedulesPage.jsx";
import RoomListPage from "../pages/CenterHead/RoomListPage.jsx";
import ExamListPage from "../pages/CenterHead/ExamListPage.jsx";
import ExamCreatePage from "../pages/CenterHead/ExamCreatePage.jsx";
import ExamViewPage from "../pages/CenterHead/ExamViewPage.jsx";
import ExamEditPage from "../pages/CenterHead/ExamEditPage.jsx";
import ReportsOverviewPage from "../pages/CenterHead/ReportsOverviewPage.jsx";

/**
 * CenterHeadRoutes
 *
 * Routes cho Center Head với luồng tạo program hoàn chỉnh
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

  // Tạo/Sửa Program (với PLO, Course, CLO, Session)
  { path: '/center-head/programs/create', element: <ProgramFormPage /> },
  { path: '/center-head/programs/:id/edit', element: <ProgramFormPage /> },

  // Tạo/Sửa Course trong Program
  { path: '/center-head/programs/:programId/courses/create', element: <CourseFormPage /> },
  { path: '/center-head/programs/:programId/courses/:courseId/edit', element: <CourseFormPage /> },

  // Program Detail & Course Management
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
  { path: '/center-head/exams/:id', element: <ExamViewPage /> },
  { path: '/center-head/exams/:id/edit', element: <ExamEditPage /> },

  // VI. Reports & Analytics
  { path: '/center-head/reports', element: <ReportsOverviewPage /> },
];
