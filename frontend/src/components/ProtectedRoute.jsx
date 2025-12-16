import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to sign-in page with return url
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = user?.roleId?.name || user?.role;
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/sign-in" state={{ from: location, error: 'no-permission' }} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
