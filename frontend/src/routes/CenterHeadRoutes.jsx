import CenterHeadDashboardPage from "../pages/CenterHead/CenterHeadDashboardPage.jsx";
import UserListPage from "../pages/CenterHead/UserListPage.jsx";
import UserCreatePage from "../pages/CenterHead/UserCreatePage.jsx";
import UserEditPage from "../pages/CenterHead/UserEditPage.jsx";
import RoleManagementPage from "../pages/CenterHead/RoleManagementPage.jsx";
import ProgramListPage from "../pages/CenterHead/ProgramListPage.jsx";
import ProgramDetailPage from "../pages/CenterHead/ProgramDetailPage.jsx";
import ExamListPage from "../pages/CenterHead/ExamListPage.jsx";
import ExamViewPage from "../pages/CenterHead/ExamViewPage.jsx";
import ApprovalRequestsPage from "../pages/CenterHead/ApprovalRequestsPage.jsx";

/**
 * CenterHeadRoutes
 *
 * Routes cho Center Head - Chỉ xem danh sách và chi tiết
 * Các chức năng tạo/sửa đã chuyển sang Teacher
 */
export const centerHeadRoutes = [
  // Dashboard
  { path: '/center-head/dashboard', element: <CenterHeadDashboardPage /> },

  // I. User Management
  { path: '/center-head/users', element: <UserListPage /> },
  { path: '/center-head/users/create', element: <UserCreatePage /> },
  { path: '/center-head/users/:id/edit', element: <UserEditPage /> },
  { path: '/center-head/roles', element: <RoleManagementPage /> },

  // II. Program Management - Chỉ xem
  { path: '/center-head/programs', element: <ProgramListPage /> },
  { path: '/center-head/programs/:id', element: <ProgramDetailPage /> },

  // III. Approval Requests Management
  { path: '/center-head/approval-requests', element: <ApprovalRequestsPage /> },

  // IV. Exam Management - Chỉ xem
  { path: '/center-head/exams', element: <ExamListPage /> },
  { path: '/center-head/exams/:id', element: <ExamViewPage /> },

];
