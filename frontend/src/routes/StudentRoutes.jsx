import StudentDashboardPage from "../pages/StudentDashboardPage.jsx";
import StudentSchedulePage from "../pages/StudentSchedulePage.jsx";
import StudentCoursesPage from "../pages/StudentCoursesPage.jsx";
import StudentClassDetailPage from "../pages/StudentClassDetailPage.jsx";
import StudentAssignmentsPage from "../pages/StudentAssignmentsPage.jsx";

/**
 * StudentRoutes
 *
 * Tất cả routes cho Học viên (Student)
 */
export const studentRoutes = [
  // Dashboard
  { path: '/student/dashboard', element: <StudentDashboardPage /> },

  // I. Schedule
  { path: '/student/schedule', element: <StudentSchedulePage /> },

  // II. My Classes
  { path: '/student/courses', element: <StudentCoursesPage /> },
  { path: '/student/class/:classId', element: <StudentClassDetailPage /> },

  // III. Assignments
  { path: '/student/assignments', element: <StudentAssignmentsPage /> },

  // IV. Materials (future)
  // { path: '/student/materials', element: <StudentMaterialsPage /> },

  // V. Grades (future)
  // { path: '/student/grades', element: <StudentGradesPage /> },

  // VI. Leave Request (future)
  // { path: '/student/leave-request', element: <StudentLeaveRequestPage /> },
];
