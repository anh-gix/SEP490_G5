import CourseCamPage from "../pages/HomePage/CourseCamPage.jsx";
import CourseIeltsPage from "../pages/HomePage/CourseIeltsPage.jsx";
import CourseToeicPage from "../pages/HomePage/CourseToeicPage.jsx";
import CourseDetailsPage from "../pages/HomePage/CourseDetailsPage.jsx";
import CamLessonDetailsPage from "../pages/HomePage/CamLessonDetailsPage.jsx";
export const HomePageRoutes = [
    
    // I. User Management
    { path: '/course-cam', element: <CourseCamPage /> },
    { path: '/course-ielts', element: <CourseIeltsPage /> },
    { path: '/course-toeic', element: <CourseToeicPage /> },
    { path: '/course-details/:id?', element: <CourseDetailsPage /> },
    { path: '/cam-lesson/:courseId/:sessionId', element: <CamLessonDetailsPage /> },


  
  ];