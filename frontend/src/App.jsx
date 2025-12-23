import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePageTwo from "./pages/HomePageTwo.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import { Navigate } from "react-router-dom";
import { HomePageRoutes } from "./routes/HomePageRoutes.jsx";
import Profile from "./pages/Profile.jsx";
import { centerHeadRoutes } from "./routes/CenterHeadRoutes.jsx";
import { academicRoutes } from "./routes/AcademicRoutes.jsx";
import { teacherRoutes } from "./routes/TeacherRoutes.jsx";
import { studentRoutes } from "./routes/StudentRoutes.jsx";
import { ministryRoutes } from "./routes/MinistryRoutes.jsx";
import { examRoutes } from "./routes/ExamRoutes.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      {/* <RouteScrollToTop /> */}
        <Routes>
          
          {/* Center Head Routes */}
          {centerHeadRoutes.map((route, index) => (
            <Route
              key={`centerhead-${index}`}
              path={route.path}
              element={
                <ProtectedRoute allowedRoles={["Center Head"]}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}

          {/* Academic Routes */}
          {academicRoutes.map((route, index) => (
            <Route
              key={`academic-${index}`}
              path={route.path}
              element={
                <ProtectedRoute allowedRoles={["Academic Staff"]}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}

          {/* Student Routes */}
          {studentRoutes.map((route, index) => (
            <Route
              key={`student-${index}`}
              path={route.path}
              element={
                <ProtectedRoute allowedRoles={["Student"]}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}

          {/* Teacher Routes */}
          {teacherRoutes.map((route, index) => (
            <Route
              key={`teacher-${index}`}
              path={route.path}
              element={
                <ProtectedRoute allowedRoles={["Teacher", "Subject Leader"]}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}
          {/* Ministry Routes */}
          {ministryRoutes.map((route, index) => (
            <Route
              key={`ministry-${index}`}
              path={route.path}
              element={
                <ProtectedRoute allowedRoles={["Ministry"]}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}

          {/* Dashboard */}
          {/* <Route path="/" element={<Dashboard />} /> */}
          {examRoutes.map((route, index) => (
            <Route
              key={`exam-${index}`}
              path={route.path}
              element={
                <ProtectedRoute allowedRoles={["Student", "Teacher", "Subject Leader", "Academic Staff", "Center Head"]}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}
          {HomePageRoutes.map((route, index) => (
            <Route key={`home-${index}`} path={route.path} element={route.element} />
          ))}


          <Route exact path="/" element={<HomePageTwo />} />
          <Route exact path="/sign-in" element={<SignInPage />} />
          <Route exact path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route exact path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            exact
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

        

          {/* Redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
        
        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>

  );
}

export default App;
