import CourseCamPage from "../pages/CourseCamPage.jsx";
import CourseIeltsPage from "../pages/CourseIeltsPage.jsx";
import CourseToeicPage from "../pages/CourseToeicPage.jsx";
import CourseDetailsPage from "../pages/CourseDetailsPage.jsx";
import CamLessonDetailsPage from "../pages/CamLessonDetailsPage.jsx";
export const HomePageRoutes = [
    
    // I. User Management
    { path: '/course-cam', element: <CourseCamPage /> },
    { path: '/course-ielts', element: <CourseIeltsPage /> },
    { path: '/course-toeic', element: <CourseToeicPage /> },
    { path: '/course-details/:id?', element: <CourseDetailsPage /> },
    { path: '/cam-lesson/:courseId/:sessionId', element: <CamLessonDetailsPage /> },


  
  ];