
import StudentDashboardPage from "../pages/StudentPages/StudentDashboardPage.jsx";
import StudentSchedulePage from "../pages/StudentPages/StudentSchedulePage.jsx";
import StudentCoursesPage from "../pages/StudentPages/StudentCoursesPage.jsx";
import StudentClassDetailPage from "../pages/StudentPages/StudentClassDetailPage.jsx";
import StudentAssignmentsPage from "../pages/StudentPages/StudentAssignmentsPage.jsx";
import StudentLessonDetailPage from "../pages/StudentPages/StudentLessonDetailPage.jsx";
import StudentProfilePage from "../pages/StudentPages/StudentProfilePage.jsx";
import ToeicPractice from "../components/student_components/ToeicPractice.jsx";
import ToeicTestTaking from "../components/student_components/ToeicTestTaking.jsx";
import ToeicTestResult from "../components/student_components/ToeicTestResult.jsx";
import ToeicTestHistory from "../components/student_components/ToeicTestHistory.jsx";

/**
 * StudentRoutes
 *
 * Tất cả routes cho Học viên (Student)
 */
export const studentRoutes = [
  // Dashboard
  { path: '/student/dashboard', element: <StudentDashboardPage /> },

  // Profile
  { path: '/student/profile', element: <StudentProfilePage /> },

  // I. Schedule
  { path: '/student/schedule', element: <StudentSchedulePage /> },
  { path: '/student/lessons/:lessonId', element: <StudentLessonDetailPage /> },

  // II. My Classes
  { path: '/student/courses', element: <StudentCoursesPage /> },
  { path: '/student/class/:classId', element: <StudentClassDetailPage /> },

  // III. Assignments
  { path: '/student/assignments', element: <StudentAssignmentsPage /> },

  // IV. TOEIC Practice
  { path: '/student/toeic', element: <ToeicPractice /> },
  { path: '/student/toeic/test/:testId', element: <ToeicTestTaking /> },
  { path: '/student/toeic/result/:testId', element: <ToeicTestResult /> },
  { path: '/student/toeic/history', element: <ToeicTestHistory /> },

  // V. Materials (future)
  // { path: '/student/materials', element: <StudentMaterialsPage /> },

  // VI. Grades (future)
  // { path: '/student/grades', element: <StudentGradesPage /> },

  // VII. Leave Request (future)
  // { path: '/student/leave-request', element: <StudentLeaveRequestPage /> },

 
];
