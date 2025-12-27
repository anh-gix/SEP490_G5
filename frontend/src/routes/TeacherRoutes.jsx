import TeacherDashboardPage from "../pages/TeacherPages/TeacherDashboardPage.jsx";
import TeacherSchedulePage from "../pages/TeacherPages/TeacherSchedulePage.jsx";
import TeacherClassesPage from "../pages/TeacherPages/TeacherClassesPage.jsx";
import TeacherAssignmentsPage from "../pages/TeacherPages/TeacherAssignmentsPage.jsx";
import TeacherAttendancePage from "../pages/TeacherPages/TeacherAttendancePage.jsx";
import TeacherGradingPage from "../pages/TeacherPages/TeacherGradingPage.jsx";
import TeacherClassDetailPage from "../pages/TeacherPages/TeacherClassDetailPage.jsx";
import LessonDetailPage from "../pages/TeacherPages/LessonDetailPage.jsx";
import TeacherProfilePage from "../pages/TeacherPages/TeacherProfilePage.jsx";
import TeacherApplicationsPage from "../pages/TeacherPages/TeacherApplicationsPage.jsx";
// Program & Course Management
import TeacherProgramListPage from "../pages/TeacherPages/TeacherProgramListPage.jsx";
import TeacherProgramDetailPage from "../pages/TeacherPages/TeacherProgramDetailPage.jsx";
import TeacherCourseWizardPage from "../pages/TeacherPages/TeacherCourseWizardPage.jsx";
import TeacherCourseDetailPage from "../pages/TeacherPages/TeacherCourseDetailPage.jsx";
import TeacherCourseFormPage from "../pages/TeacherPages/TeacherCourseFormPage.jsx";
import TeacherCamSessionPage from "../pages/TeacherPages/TeacherCamSessionPage.jsx";
import TeacherCamSessionEditPage from "../pages/TeacherPages/TeacherCamSessionEditPage.jsx";

// Exam Management
import TeacherExamListPage from "../pages/TeacherPages/TeacherExamListPage.jsx";
import TeacherExamWizardPage from "../pages/TeacherPages/TeacherExamWizardPage.jsx";
import TeacherExamDetailPage from "../pages/TeacherPages/TeacherExamDetailPage.jsx";

// Tips Management
import TeacherTipsManagementPage from "../pages/TeacherPages/TeacherTipsManagementPage.jsx";
import TeacherTipEditorPage from "../pages/TeacherPages/TeacherTipEditorPage.jsx";

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
  // Dashboard
  
  { path: '/teacher/dashboard', element: <TeacherDashboardPage /> },

  // Profile
  { path: '/teacher/profile', element: <TeacherProfilePage /> },

  // I. Schedule
  { path: '/teacher/schedule', element: <TeacherSchedulePage /> },
  { path: '/teacher/lessons/:lessonId', element: <LessonDetailPage /> },
  { path: '/teacher/applications', element: <TeacherApplicationsPage /> },

  // II. Classes
  { path: '/teacher/classes', element: <TeacherClassesPage /> },
  { path: '/teacher/classes/:classId', element: <TeacherClassDetailPage /> },
  { path: '/teacher/classes/:classId/overview', element: <TeacherClassDetailPage /> },
  { path: '/teacher/classes/:classId/students', element: <TeacherClassDetailPage /> },
  { path: '/teacher/classes/:classId/lessons', element: <TeacherClassDetailPage /> },
  { path: '/teacher/classes/:classId/materials', element: <TeacherClassDetailPage /> },
  { path: '/teacher/classes/:classId/assignments', element: <TeacherClassDetailPage /> },

  // III. Assignments
  { path: '/teacher/assignments', element: <TeacherAssignmentsPage /> },

  // IV. Attendance
  { path: '/teacher/attendance', element: <TeacherAttendancePage /> },
  { path: '/teacher/attendance/:scheduleId', element: <TeacherAttendancePage /> },

  // V. Grading
  { path: '/teacher/grading', element: <TeacherGradingPage /> },

  // VI. Materials (future)
  // { path: '/teacher/materials', element: <TeacherMaterialsPage /> },
  // VII. Program & Course Management
  { path: '/teacher/programs', element: <TeacherProgramListPage /> },
  { path: '/teacher/programs/:id', element: <TeacherProgramDetailPage /> },

  // Course Management
  { path: '/teacher/programs/:programId/courses/create', element: <TeacherCourseWizardPage /> },
  { path: '/teacher/programs/:programId/courses/:courseId/edit', element: <TeacherCourseWizardPage /> },
  { path: '/teacher/programs/:programId/courses/:courseId/edit-form', element: <TeacherCourseFormPage /> },
  { path: '/teacher/programs/:programId/courses/:id/details', element: <TeacherCourseDetailPage /> },
  { path: '/teacher/courses/:id/details', element: <TeacherCourseDetailPage /> },

  // CAM Session Management
  { path: '/teacher/cam-sessions/create', element: <TeacherCamSessionPage /> },
  { path: '/teacher/cam-sessions/:sessionId/edit', element: <TeacherCamSessionEditPage /> },

  // VIII. Exam Management
  { path: '/teacher/exams', element: <TeacherExamListPage /> },
  { path: '/teacher/exams/create', element: <TeacherExamWizardPage /> },
  { path: '/teacher/exams/:examId/edit', element: <TeacherExamWizardPage /> },
  { path: '/teacher/exams/:id/details', element: <TeacherExamDetailPage /> },

  // IX. Tips Management
  { path: '/teacher/tips', element: <TeacherTipsManagementPage /> },
  { path: '/teacher/tips/edit/:section', element: <TeacherTipEditorPage /> },
];
