import StudentDashboardPage from "../pages/StudentDashboardPage.jsx";
import StudentSchedulePage from "../pages/StudentSchedulePage.jsx";
import StudentCoursesPage from "../pages/StudentCoursesPage.jsx";
import StudentClassDetailPage from "../pages/StudentClassDetailPage.jsx";
import StudentAssignmentsPage from "../pages/StudentAssignmentsPage.jsx";
import StudentExamListPage from "../pages/StudentExamListPage.jsx";
import ExamDetailPage from "../pages/ExamDetailPage.jsx";
import ReadingExamPage from "../pages/ReadingExamPage.jsx";
import ReadingResultPage from "../pages/ReadingResultPage.jsx";
import ListeningExamPage from "../pages/ListeningExamPage.jsx";
import ListeningResultPage from "../pages/ListeningResultPage.jsx";
import WritingExamPage from "../pages/WritingExamPage.jsx";
import WritingResultPage from "../pages/WritingResultPage.jsx";

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
  { path: '/exams', element: <StudentExamListPage /> },
  { path: '/exams/:id', element: <ExamDetailPage /> },
  { path: '/exams/:examId/submissions/:submissionId/reading', element: <ReadingExamPage /> },
  { path: '/exams/:examId/submissions/:submissionId/reading/result', element: <ReadingResultPage /> },
  { path: '/exams/:examId/submissions/:submissionId/listening', element: <ListeningExamPage /> },
  { path: '/exams/:examId/submissions/:submissionId/listening/result', element: <ListeningResultPage /> },
  { path: '/exams/:examId/submissions/:submissionId/writing', element: <WritingExamPage /> },
  { path: '/exams/:examId/submissions/:submissionId/writing/result', element: <WritingResultPage /> },
];
