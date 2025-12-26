import CenterHeadDashboardPage from "../pages/CenterHead/CenterHeadDashboardPage.jsx";
import UserListPage from "../pages/CenterHead/UserListPage.jsx";
import UserCreatePage from "../pages/CenterHead/UserCreatePage.jsx";
import UserEditPage from "../pages/CenterHead/UserEditPage.jsx";
import RoleManagementPage from "../pages/CenterHead/RoleManagementPage.jsx";
import ProgramListPage from "../pages/CenterHead/ProgramListPage.jsx";
import CenterHeadProgramDetailPage from "../pages/CenterHead/CenterHeadProgramDetailPage.jsx";
import CenterHeadCourseDetailPage from "../pages/CenterHead/CenterHeadCourseDetailPage.jsx";
import ApprovalRequestsPage from "../pages/CenterHead/ApprovalRequestsPage.jsx";
import CenterHeadExamListPage from "../pages/CenterHead/CenterHeadExamListPage.jsx";
import CenterHeadExamDetailPage from "../pages/CenterHead/CenterHeadExamDetailPage.jsx";
import RoomManagementPage from "../pages/CenterHead/RoomManagementPage.jsx";
import TeacherManagementPage from "../pages/CenterHead/TeacherManagementPage.jsx";
import StudentManagementPage from "../pages/CenterHead/StudentManagementPage.jsx";
import ClassManagementPage from "../pages/CenterHead/ClassManagementPage.jsx";

/**
 * CenterHeadRoutes
 *
 * Routes cho Center Head - chỉ có quyền xem, duyệt/từ chối, toggle active
 * Không có quyền create/edit program/course (chỉ Subject Leader có)
 */
export const centerHeadRoutes = [
  // Dashboard
  { path: '/center-head/dashboard', element: <CenterHeadDashboardPage /> },

  // I. User Management
  { path: '/center-head/users', element: <UserListPage /> },
  { path: '/center-head/users/create', element: <UserCreatePage /> },
  { path: '/center-head/users/:id/edit', element: <UserEditPage /> },
  { path: '/center-head/roles', element: <RoleManagementPage /> },

  // II. Program & Course Management (View Only)
  { path: '/center-head/programs', element: <ProgramListPage /> },
  { path: '/center-head/programs/:id', element: <CenterHeadProgramDetailPage /> },
  { path: '/center-head/programs/:programId/courses/:id/details', element: <CenterHeadCourseDetailPage /> },
  { path: '/center-head/courses/:id/details', element: <CenterHeadCourseDetailPage /> },

  // III. Approval Requests Management
  { path: '/center-head/approval-requests', element: <ApprovalRequestsPage /> },

  // IV. Exam Management
  { path: '/center-head/exams', element: <CenterHeadExamListPage /> },
  { path: '/center-head/exams/:id/details', element: <CenterHeadExamDetailPage /> },

  // V. Room Management
  { path: '/center-head/room-management', element: <RoomManagementPage /> },

  // VI. Teacher Management
  { path: '/center-head/teacher-management', element: <TeacherManagementPage /> },

  // VII. Student Management
  { path: '/center-head/student-management', element: <StudentManagementPage /> },

  // VIII. Class Management
  { path: '/center-head/class-management', element: <ClassManagementPage /> },

];
