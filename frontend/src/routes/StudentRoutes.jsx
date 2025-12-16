
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
import StudentTipsPage from "../pages/StudentPages/StudentTipsPage.jsx";
import StudentOnlineCoursesPage from "../pages/StudentPages/StudentOnlineCoursesPage.jsx";
import StudentOnlineCourseDetailPage from "../pages/StudentPages/StudentOnlineCourseDetailPage.jsx";
import StudentSessionLearningPage from "../pages/StudentPages/StudentSessionLearningPage.jsx";
import StudentApplicationsPage from "../pages/StudentPages/StudentApplicationsPage.jsx";
import StudentExamPage from "../pages/StudentPages/StudentExamPage.jsx";
import StudentExamsDetailPage from "../pages/StudentPages/StudentExamsDetailPage.jsx";
import StudentReadingResultPage from "../pages/StudentPages/StudentReadingResultPage.jsx";
import StudentListeningResultPage from "../pages/StudentPages/StudentListeningResultPage.jsx";
import StudentWritingResultPage from "../pages/StudentPages/StudentWritingResultPage.jsx";
import StudentSpeakingResultPage from "../pages/StudentPages/StudentSpeakingResultPage.jsx";

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

  // IV. Tips học tập
  { path: '/student/tips', element: <StudentTipsPage /> },

  // V. Cambridge Online Courses
  { path: '/student/online-courses', element: <StudentOnlineCoursesPage /> },
  { path: '/student/online-courses/:courseId', element: <StudentOnlineCourseDetailPage /> },
  { path: '/student/online-courses/:courseId/sessions/:sessionId', element: <StudentSessionLearningPage /> },

  // VI. TOEIC Practice
  { path: '/student/toeic', element: <ToeicPractice /> },
  { path: '/student/toeic/test/:testId', element: <ToeicTestTaking /> },
  { path: '/student/toeic/result/:testId', element: <ToeicTestResult /> },
  { path: '/student/toeic/history', element: <ToeicTestHistory /> },
  { path: '/student/practice-exams', element: <StudentExamPage /> },
  { path: '/student/exams/:id', element: <StudentExamsDetailPage /> },
  { path: '/student/exams/:examId/submissions/:submissionId/reading/result', element: <StudentReadingResultPage /> },
  { path: '/student/exams/:examId/submissions/:submissionId/listening/result', element: <StudentListeningResultPage /> },
  { path: '/student/exams/:examId/submissions/:submissionId/writing/result', element: <StudentWritingResultPage /> },
  { path: '/student/exams/:examId/submissions/:submissionId/speaking/result', element: <StudentSpeakingResultPage /> },

  // VII. Materials (future)
  // { path: '/student/materials', element: <StudentMaterialsPage /> },

  // VIII. Grades (future)
  // { path: '/student/grades', element: <StudentGradesPage /> },

  // IX. Leave Request (future)
  // { path: '/student/leave-request', element: <StudentLeaveRequestPage /> },

  // X. Applications
  { path: '/student/applications', element: <StudentApplicationsPage /> },
];
