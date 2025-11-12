import TeacherDashboardPage from "../pages/TeacherDashboardPage.jsx";
import TeacherSchedulePage from "../pages/TeacherSchedulePage.jsx";
import TeacherClassesPage from "../pages/TeacherClassesPage.jsx";
import TeacherAssignmentsPage from "../pages/TeacherAssignmentsPage.jsx";
import TeacherAttendancePage from "../pages/TeacherAttendancePage.jsx";
import TeacherGradingPage from "../pages/TeacherGradingPage.jsx";
import TeacherClassDetailPage from "../pages/TeacherClassDetailPage.jsx";

/**
 * TeacherRoutes
 *
 * Tất cả routes cho Giảng viên (Teacher)
 */
export const teacherRoutes = [
  // Dashboard
  { path: '/teacher/dashboard', element: <TeacherDashboardPage /> },

  // I. Schedule
  { path: '/teacher/schedule', element: <TeacherSchedulePage /> },

  // II. Classes
  { path: '/teacher/classes', element: <TeacherClassesPage /> },
  { path: '/teacher/class/:classId', element: <TeacherClassDetailPage /> },

  // III. Assignments
  { path: '/teacher/assignments', element: <TeacherAssignmentsPage /> },

  // IV. Attendance
  { path: '/teacher/attendance', element: <TeacherAttendancePage /> },
  { path: '/teacher/attendance/:scheduleId', element: <TeacherAttendancePage /> },

  // V. Grading
  { path: '/teacher/grading', element: <TeacherGradingPage /> },

  // VI. Materials (future)
  // { path: '/teacher/materials', element: <TeacherMaterialsPage /> },
];
