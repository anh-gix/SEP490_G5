import Attendance from "../pages/Attendance.jsx";
import ClassSchedulePage from "../pages/ClassSchedulePage.jsx";
import AttendanceDetailPage from "../pages/AttendanceDetailPage.jsx";
import TeacherDashboardPage from "../pages/TeacherPages/TeacherDashboardPage.jsx";
import TeacherSchedulePage from "../pages/TeacherPages/TeacherSchedulePage.jsx";
import TeacherClassesPage from "../pages/TeacherPages/TeacherClassesPage.jsx";
import TeacherAssignmentsPage from "../pages/TeacherPages/TeacherAssignmentsPage.jsx";
import TeacherAttendancePage from "../pages/TeacherPages/TeacherAttendancePage.jsx";
import TeacherGradingPage from "../pages/TeacherPages/TeacherGradingPage.jsx";
import TeacherClassDetailPage from "../pages/TeacherPages/TeacherClassDetailPage.jsx";
import LessonDetailPage from "../pages/TeacherPages/LessonDetailPage.jsx";
import TeacherProfilePage from "../pages/TeacherPages/TeacherProfilePage.jsx";

/**
 * TeacherRoutes
 *
 * Tất cả routes cho Teacher
 */
// export const teacherRoutes = [
//   // Attendance Management
//   { path: '/attendance', element: <Attendance /> },
//   { path: '/attendance/class/:classId', element: <ClassSchedulePage /> },
//   { path: '/attendance/schedule/:scheduleId', element: <AttendanceDetailPage /> },
// ];

//  * Tất cả routes cho Giảng viên (Teacher)
//  */
export const teacherRoutes = [
  { path: '/attendance', element: <Attendance /> },
     { path: '/attendance/class/:classId', element: <ClassSchedulePage /> },
     { path: '/attendance/schedule/:scheduleId', element: <AttendanceDetailPage /> },
  // Dashboard
  
  { path: '/teacher/dashboard', element: <TeacherDashboardPage /> },

  // Profile
  { path: '/teacher/profile', element: <TeacherProfilePage /> },

  // I. Schedule
  { path: '/teacher/schedule', element: <TeacherSchedulePage /> },
  { path: '/teacher/lessons/:lessonId', element: <LessonDetailPage /> },

  // II. Classes
  { path: '/teacher/classes', element: <TeacherClassesPage /> },
  { path: '/teacher/classes/:classId', element: <TeacherClassDetailPage /> },

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
