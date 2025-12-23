import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const roleHome = {
  "Center Head": "/center-head/dashboard",
  "Academic Staff": "/academic/dashboard",
  Teacher: "/teacher/dashboard",
  "Subject Leader": "/teacher/dashboard",
  Student: "/student/dashboard",
};

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  const roleName = user?.roleId?.name || user?.role;

  if (allowedRoles.length && !allowedRoles.includes(roleName)) {
    const fallback = roleHome[roleName] || "/";
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;

