import { BrowserRouter, Routes, Route } from "react-router-dom";
import RouteScrollToTop from "./helper/RouteScrollToTop.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import HomePageOne from "./pages/HomePageOne";
import AboutPage from "./pages/AboutPage.jsx";
import AboutFourPage from "./pages/AboutFourPage.jsx";
import AboutThreePage from "./pages/AboutThreePage.jsx";
import AboutTwoPage from "./pages/AboutTwoPage.jsx";
import ApplyAdmissionPage from "./pages/ApplyAdmissionPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import BlogClassicPage from "./pages/BlogClassicPage.jsx";
import BlogDetailsPage from "./pages/BlogDetailsPage.jsx";
import BlogListPage from "./pages/BlogListPage.jsx";
import BookOnlineClassPage from "./pages/BookOnlineClassPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import CoursePage from "./pages/CoursePage.jsx";
import CourseDetailsPage from "./pages/CourseDetailsPage.jsx";
import CourseListViewPage from "./pages/CourseListViewPage.jsx";
import EventDetailsPage from "./pages/EventDetailsPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import FaqPage from "./pages/FaqPage.jsx";
import FavoriteCoursePage from "./pages/FavoriteCoursePage.jsx";
import FindTutorsPage from "./pages/FindTutorsPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import HomePageTwo from "./pages/HomePageTwo.jsx";
import HomePageThree from "./pages/HomePageThree.jsx";
import HomePageFour from "./pages/HomePageFour.jsx";
import InstructorPage from "./pages/InstructorPage.jsx";
import InstructorDetailsPage from "./pages/InstructorDetailsPage.jsx";
import InstructorTwoPage from "./pages/InstructorTwoPage.jsx";
import LessonDetailsPage from "./pages/LessonDetailsPage.jsx";
import PricingPlanPage from "./pages/PricingPlanPage.jsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import TuitionJobsPage from "./pages/TuitionJobsPage.jsx";
import TutorPage from "./pages/TutorPage.jsx";
import TutorDetailsPage from "./pages/TutorDetailsPage.jsx";
import HomePageFive from "./pages/HomePageFive.jsx";
import HomePageSix from "./pages/HomePageSix.jsx";
import { Navigate } from "react-router-dom";
import Attendance from "./pages/Attendance.jsx";
import ClassSchedulePage from "./pages/ClassSchedulePage.jsx";
import AttendanceDetailPage from "./pages/AttendanceDetailPage.jsx";
import { centerHeadRoutes } from "./routes/CenterHeadRoutes.jsx";
import { academicRoutes } from "./routes/AcademicRoutes.jsx";
import { studentRoutes } from "./routes/StudentRoutes.jsx";
import { teacherRoutes } from "./routes/TeacherRoutes.jsx";
import Profile from "./pages/Profile.jsx";
import BulkUserUploadPage from "./pages/BulkUserUploadPage.jsx";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      {/* <RouteScrollToTop /> */}
        <Routes>
          
          {/* Center Head Routes */}
          {centerHeadRoutes.map((route, index) => (
            <Route key={`centerhead-${index}`} path={route.path} element={route.element} />
          ))}

          {/* Academic Routes */}
          {academicRoutes.map((route, index) => (
            <Route key={`academic-${index}`} path={route.path} element={route.element} />
          ))}

          {/* Student Routes */}
          {studentRoutes.map((route, index) => (
            <Route key={`student-${index}`} path={route.path} element={route.element} />
          ))}

          {/* Teacher Routes */}
          {teacherRoutes.map((route, index) => (
            <Route key={`teacher-${index}`} path={route.path} element={route.element} />
          ))}

          {/* Dashboard */}
          {/* <Route path="/" element={<Dashboard />} /> */}

          {/* Schedules Routes */}
          <Route path="/bulk-users/upload" element={<BulkUserUploadPage />} />

          {/* Redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />

          <Route exact path="/" element={<HomePageTwo />} />
          <Route exact path="/index-2" element={<HomePageOne />} />
          <Route exact path="/index-3" element={<HomePageThree />} />
          <Route exact path="/index-4" element={<HomePageFour />} />
          <Route exact path="/index-5" element={<HomePageFive />} />
          <Route exact path="/index-6" element={<HomePageSix />} />
          <Route exact path="/about" element={<AboutPage />} />
          <Route exact path="/about-two" element={<AboutTwoPage />} />
          <Route exact path="/about-three" element={<AboutThreePage />} />
          <Route exact path="/about-four" element={<AboutFourPage />} />
          <Route
            exact
            path="/apply-admission"
            element={<ApplyAdmissionPage />}
          />
          <Route exact path="/blog" element={<BlogPage />} />
          <Route exact path="/blog-classic" element={<BlogClassicPage />} />
          <Route exact path="/blog-details" element={<BlogDetailsPage />} />
          <Route exact path="/blog-list" element={<BlogListPage />} />
          <Route
            exact
            path="/book-online-class"
            element={<BookOnlineClassPage />}
          />
          <Route exact path="/cart" element={<CartPage />} />
          <Route exact path="/checkout" element={<CheckoutPage />} />
          <Route exact path="/contact" element={<ContactPage />} />
          <Route exact path="/course" element={<CoursePage />} />
          <Route exact path="/course-details" element={<CourseDetailsPage />} />
          <Route
            exact
            path="/course-list-view"
            element={<CourseListViewPage />}
          />
          <Route exact path="/event-details" element={<EventDetailsPage />} />
          <Route exact path="/events" element={<EventsPage />} />
          <Route exact path="/faq" element={<FaqPage />} />
          <Route
            exact
            path="/favorite-course"
            element={<FavoriteCoursePage />}
          />
          <Route exact path="/find-tutors" element={<FindTutorsPage />} />
          <Route exact path="/gallery" element={<GalleryPage />} />
          <Route exact path="/instructor" element={<InstructorPage />} />
          <Route
            exact
            path="/instructor-details"
            element={<InstructorDetailsPage />}
          />

          <Route exact path="/instructor-two" element={<InstructorTwoPage />} />
          <Route exact path="/lesson-details" element={<LessonDetailsPage />} />
          <Route exact path="/pricing-plan" element={<PricingPlanPage />} />
          <Route exact path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route exact path="/product" element={<ProductPage />} />
          <Route
            exact
            path="/product-details"
            element={<ProductDetailsPage />}
          />
          <Route exact path="/sign-in" element={<SignInPage />} />
          <Route exact path="/profile" element={<Profile />} />
          <Route exact path="/sign-up" element={<SignUpPage />} />
          <Route exact path="/tuition-jobs" element={<TuitionJobsPage />} />
          <Route exact path="/tutor" element={<TutorPage />} />
          <Route exact path="/tutor-details" element={<TutorDetailsPage />} />
          <Route exact path="/attendance" element={<Attendance />} /> // Route for attendance page
          <Route
            exact
            path="/attendance/class/:classId"
            element={<ClassSchedulePage />}
          />
          <Route
            exact
            path="/attendance/schedule/:scheduleId"
            element={<AttendanceDetailPage />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>

  );
}

export default App;
