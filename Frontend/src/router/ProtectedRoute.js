import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/GlobalContext.js';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user role is allowed for this route
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const dashboardRoute = getDashboardRoute(user.role);
    return <Navigate to={dashboardRoute} replace />;
  }

 
  return children;
}

// Helper function to get dashboard route based on user role
function getDashboardRoute(role) {
  switch (role) {
    case 'patient':
      return '/patient-dashboard';
    case 'doctor':
      return '/doctor-dashboard';
    case 'admin':
      return '/admin-dashboard';
    default:
      return '/';
  }
}

// Higher-order component for role-specific route protection
export function RequireRole(allowedRoles) {
  return function ProtectedComponent({ children }) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        {children}
      </ProtectedRoute>
    );
  };
}

// Specific role guards for common use cases
export const RequirePatient = RequireRole(['patient']);
export const RequireDoctor = RequireRole(['doctor']);
export const RequireAdmin = RequireRole(['admin']);
export const RequirePatientOrDoctor = RequireRole(['patient', 'doctor']);
export const RequireDoctorOrAdmin = RequireRole(['doctor', 'admin']);

// Custom hook for role checking in components
export function useRoleAccess() {
  const { user } = useAuth();

  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  };

  const isPatient = () => hasRole('patient');
  const isDoctor = () => hasRole('doctor');
  const isAdmin = () => hasRole('admin');

  return {
    hasRole,
    isPatient,
    isDoctor,
    isAdmin,
    userRole: user?.role
  };
}

export default ProtectedRoute;