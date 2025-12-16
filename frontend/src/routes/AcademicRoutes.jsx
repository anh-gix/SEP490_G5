import AcademicDashboardPage from "../pages/AcademicStaff/AcademicDashboardPage.jsx";
import ScheduleManagementPage from "../pages/AcademicStaff/ScheduleManagementPage.jsx";
import ClassManagementPage from "../pages/AcademicStaff/ClassManagementPage.jsx";
import ClassDetailPage from "../pages/AcademicStaff/ClassDetailPage.jsx";
import EditClassPage from "../pages/AcademicStaff/EditClassPage.jsx";
import RoomManagementPage from "../pages/AcademicStaff/RoomManagementPage.jsx";
import TeacherManagementPage from "../pages/AcademicStaff/TeacherManagementPage.jsx";
<<<<<<< HEAD
import StudentManagementPage from "../pages/AcademicStaff/StudentManagementPage.jsx";
import ImportStudentPage from "../pages/AcademicStaff/ImportStudentPage.jsx";
import RequestManagementPage from "../pages/AcademicStaff/RequestManagementPage.jsx";
=======
import TeacherDetailPage from "../pages/AcademicStaff/TeacherDetailPage.jsx";
import StudentManagementPage from "../pages/AcademicStaff/StudentManagementPage.jsx";
import StudentDetailPage from "../pages/AcademicStaff/StudentDetailPage.jsx";
import ImportStudentPage from "../pages/AcademicStaff/ImportStudentPage.jsx";
import RequestManagementPage from "../pages/AcademicStaff/RequestManagementPage.jsx";
import RequestDetailStandalonePage from "../pages/AcademicStaff/RequestDetailStandalonePage.jsx";
>>>>>>> origin/Namvv-teacher-class-management
import AcademicLessonDetailPage from "../pages/AcademicStaff/AcademicLessonDetailPage.jsx";
import AcademicProfilePage from "../pages/AcademicStaff/AcademicProfilePage.jsx";

/**
 * AcademicRoutes
 *
 * Tất cả routes cho Giáo vụ (Academic Staff)
 */
export const academicRoutes = [
  // Dashboard
  { path: '/academic/dashboard', element: <AcademicDashboardPage /> },

  // Profile
  { path: '/academic/profile', element: <AcademicProfilePage /> },

  // I. Schedule Management
  { path: '/academic/schedule-management', element: <ScheduleManagementPage /> },
  { path: '/academic/lessons/:lessonId', element: <AcademicLessonDetailPage /> },

  // II. Class Management
  { path: '/academic/class-management', element: <ClassManagementPage /> },
  { path: '/academic/class-management/:classId', element: <ClassDetailPage /> },
  { path: '/academic/class-management/:classId/edit', element: <EditClassPage /> },

  // III. Room Management
  { path: '/academic/room-management', element: <RoomManagementPage /> },

  // IV. Request Management
<<<<<<< HEAD
  { path: '/academic/request-management', element: <RequestManagementPage /> },

  // V. Teacher Management
  { path: '/academic/teacher-management', element: <TeacherManagementPage /> },

  // VI. Student Management
  { path: '/academic/student-management', element: <StudentManagementPage /> },
=======
  // Request Detail (must be before request-management to match correctly)
  { path: '/academic/request-management/:requestId', element: <RequestDetailStandalonePage /> },
  { path: '/academic/request-management', element: <RequestManagementPage /> },

  // V. Teacher Management
  { path: '/academic/teacher-management', element: <TeacherManagementPage /> },
  { path: '/academic/teacher-management/:teacherId', element: <TeacherDetailPage /> },

  // VI. Student Management
  { path: '/academic/student-management', element: <StudentManagementPage /> },
  { path: '/academic/student-management/:studentId', element: <StudentDetailPage /> },
>>>>>>> origin/Namvv-teacher-class-management
  { path: '/academic/student-management/import', element: <ImportStudentPage /> },
];
