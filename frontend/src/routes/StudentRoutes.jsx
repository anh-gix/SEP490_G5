import StudentDashboardPage from "../pages/StudentDashboardPage.jsx";
import StudentSchedulePage from "../pages/StudentSchedulePage.jsx";
import StudentCoursesPage from "../pages/StudentCoursesPage.jsx";
import StudentClassDetailPage from "../pages/StudentClassDetailPage.jsx";
import StudentAssignmentsPage from "../pages/StudentAssignmentsPage.jsx";

/**
 * StudentRoutes
 *
 * Tất cả routes cho Student
 */
export const studentRoutes = [
  // Dashboard
  { path: '/student/dashboard', element: <StudentDashboardPage /> },

  // Schedule Management
  { path: '/student/schedule', element: <StudentSchedulePage /> },

  // Course Management
  { path: '/student/courses', element: <StudentCoursesPage /> },
  { path: '/student/class/:classId', element: <StudentClassDetailPage /> },

  // Assignments
  { path: '/student/assignments', element: <StudentAssignmentsPage /> },
];

