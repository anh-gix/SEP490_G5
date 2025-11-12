import Attendance from "../pages/Attendance.jsx";
import ClassSchedulePage from "../pages/ClassSchedulePage.jsx";
import AttendanceDetailPage from "../pages/AttendanceDetailPage.jsx";

/**
 * TeacherRoutes
 *
 * Tất cả routes cho Teacher
 */
export const teacherRoutes = [
  // Attendance Management
  { path: '/attendance', element: <Attendance /> },
  { path: '/attendance/class/:classId', element: <ClassSchedulePage /> },
  { path: '/attendance/schedule/:scheduleId', element: <AttendanceDetailPage /> },
];

