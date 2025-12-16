import CenterHeadDashboardPage from "../pages/CenterHead/CenterHeadDashboardPage.jsx";
import UserListPage from "../pages/CenterHead/UserListPage.jsx";
import UserCreatePage from "../pages/CenterHead/UserCreatePage.jsx";
import UserEditPage from "../pages/CenterHead/UserEditPage.jsx";
import RoleManagementPage from "../pages/CenterHead/RoleManagementPage.jsx";
import ProgramListPage from "../pages/CenterHead/ProgramListPage.jsx";
import ProgramDetailPage from "../pages/CenterHead/ProgramDetailPage.jsx";
import ProgramFormPage from "../pages/CenterHead/ProgramFormPage.jsx";
import CourseWizardPage from "../pages/CenterHead/CourseWizardPage.jsx";
<<<<<<< HEAD
import PendingCoursesPage from "../pages/CenterHead/PendingCoursesPage.jsx";
=======
>>>>>>> origin/Namvv-teacher-class-management
import CourseDetailPage from "../pages/CenterHead/CourseDetailPage.jsx";
import CourseFormPage from "../pages/CenterHead/CourseFormPage.jsx";
import CamSessionPage from "../pages/CenterHead/CamSessionPage.jsx";
import CamSessionEditPage from "../pages/CenterHead/CamSessionEditPage.jsx";
<<<<<<< HEAD
import ClassListPage from "../pages/CenterHead/ClassListPage.jsx";
import PendingSchedulesPage from "../pages/CenterHead/PendingSchedulesPage.jsx";
import RoomListPage from "../pages/CenterHead/RoomListPage.jsx";
=======
>>>>>>> origin/Namvv-teacher-class-management
import ExamListPage from "../pages/CenterHead/ExamListPage.jsx";
import ExamCreatePage from "../pages/CenterHead/ExamCreatePage.jsx";
import ExamViewPage from "../pages/CenterHead/ExamViewPage.jsx";
import ExamEditPage from "../pages/CenterHead/ExamEditPage.jsx";
<<<<<<< HEAD
import ReportsOverviewPage from "../pages/CenterHead/ReportsOverviewPage.jsx";
=======
>>>>>>> origin/Namvv-teacher-class-management
import ApprovalRequestsPage from "../pages/CenterHead/ApprovalRequestsPage.jsx";

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

  // Tạo Program (Simple Form) - NEW STRUCTURE
  { path: '/center-head/programs/create', element: <ProgramFormPage /> },
  { path: '/center-head/programs/:id/edit', element: <ProgramFormPage /> },

  // Tạo Course (Wizard - 4 steps) - NEW STRUCTURE
  { path: '/center-head/programs/:programId/courses/create', element: <CourseWizardPage /> },
  // Edit Course - Route dựa trên status
  { path: '/center-head/programs/:programId/courses/:courseId/edit', element: <CourseWizardPage /> }, // For draft courses
  { path: '/center-head/programs/:programId/courses/:courseId/edit-form', element: <CourseFormPage /> }, // For completed courses

  // CAM Session Management
  { path: '/center-head/cam-sessions/create', element: <CamSessionPage /> },
  { path: '/center-head/cam-sessions/:sessionId/edit', element: <CamSessionEditPage /> },

  // Program Detail & Course Management
  { path: '/center-head/programs/:id', element: <ProgramDetailPage /> },
  { path: '/center-head/courses/:id/details', element: <CourseDetailPage /> },

  // III. Approval Requests Management
  { path: '/center-head/approval-requests', element: <ApprovalRequestsPage /> },


  // IV. Exam Management
  { path: '/center-head/exams', element: <ExamListPage /> },
  { path: '/center-head/exams/create', element: <ExamCreatePage /> },
  { path: '/center-head/exams/:id', element: <ExamViewPage /> },
  { path: '/center-head/exams/:id/edit', element: <ExamEditPage /> },

<<<<<<< HEAD
  // V. Reports & Analytics
  { path: '/center-head/reports', element: <ReportsOverviewPage /> },
=======
>>>>>>> origin/Namvv-teacher-class-management
];
